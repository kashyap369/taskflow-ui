#!/usr/bin/env node
/**
 * WCAG 2.1 contrast audit of the design tokens.
 *
 * Reads the real token values out of `src/styles/themes/_light.scss` and `_dark.scss` — it does not
 * carry its own copy — so it fails the moment a token drifts below threshold. Checks each
 * foreground/background pairing the UI actually renders, in both themes.
 *
 * Thresholds: 4.5:1 for body text (WCAG 1.4.3 AA), 3:1 for the boundary of a form control
 * (1.4.11 Non-text Contrast). Decorative dividers are deliberately not checked — 1.4.11 covers
 * controls and meaningful graphics, not separators.
 *
 *   node scripts/a11y-contrast.mjs      # or: npm run a11y:contrast
 *
 * Exits non-zero when any pairing fails.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Pull `--name: value;` declarations out of a theme partial. */
function readTokens(file) {
  const css = readFileSync(join(ROOT, 'src/styles/themes', file), 'utf8');
  const tokens = {};
  for (const [, name, value] of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

const toRgba = (value) => {
  if (Array.isArray(value)) return [value[0], value[1], value[2], value[3] ?? 1];
  const fn = value.match(/rgba?\(([^)]+)\)/);
  if (fn) {
    const p = fn[1].split(',').map((x) => parseFloat(x.trim()));
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  let h = value.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [...[0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), 1];
};

/** Composite a possibly-translucent colour (soft tints are alpha) over an opaque backdrop. */
const over = (fg, bg) => {
  const [r, g, b, a] = toRgba(fg);
  const [br, bgc, bb] = toRgba(bg);
  return [r * a + br * (1 - a), g * a + bgc * (1 - a), b * a + bb * (1 - a)];
};

const luminance = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground token, background token, what it renders, minimum ratio]
const PAIRINGS = [
  ['text', 'bg', 'body text on page', 4.5],
  ['text', 'surface', 'body text on card', 4.5],
  ['text', 'surface-2', 'body text on subtle surface', 4.5],
  ['text', 'surface-inset', 'body text on inset', 4.5],
  ['text-muted', 'bg', 'muted text on page', 4.5],
  ['text-muted', 'surface', 'muted text on card', 4.5],
  ['text-muted', 'surface-inset', 'muted text on inset', 4.5],
  ['text-subtle', 'bg', 'subtle text on page', 4.5],
  ['text-subtle', 'surface', 'subtle text on card', 4.5],
  ['primary', 'surface', 'link / primary text on card', 4.5],
  ['primary', 'bg', 'link / primary text on page', 4.5],
  ['primary', 'primary-soft', 'primary badge', 4.5],
  ['success', 'success-soft', 'success badge', 4.5],
  ['warning', 'warning-soft', 'warning badge', 4.5],
  ['danger', 'danger-soft', 'danger badge', 4.5],
  ['info', 'info-soft', 'info badge', 4.5],
  ['success', 'surface', 'success text on card', 4.5],
  ['warning', 'surface', 'warning text on card', 4.5],
  ['danger', 'surface', 'danger text on card', 4.5],
  ['border-input', 'surface', 'form-control boundary on card', 3.0],
  ['border-input', 'bg', 'form-control boundary on page', 3.0],
];

const light = readTokens('_light.scss');
// Dark only overrides what changes, so unchanged tokens fall through to the light set.
const dark = { ...light, ...readTokens('_dark.scss') };

let failures = 0;

for (const [themeName, tokens] of [
  ['LIGHT', light],
  ['DARK', dark],
]) {
  console.log(`\n=== ${themeName} ===`);
  for (const [fgKey, bgKey, label, min] of PAIRINGS) {
    const fgRaw = tokens[fgKey];
    const bgRaw = tokens[bgKey];
    if (!fgRaw || !bgRaw) {
      console.log(`SKIP        missing token --${!fgRaw ? fgKey : bgKey}  (${label})`);
      continue;
    }
    // A soft tint is alpha over the card surface; an opaque token composites to itself.
    const bg = over(bgRaw, tokens.surface);
    const ratio = contrast(over(fgRaw, bg), bg);
    const pass = ratio >= min;
    if (!pass) failures++;
    console.log(
      `${pass ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)} (min ${min.toFixed(1)})  ` +
        `${label}  [--${fgKey} on --${bgKey}]`,
    );
  }
}

console.log(
  failures === 0
    ? `\nAll ${PAIRINGS.length * 2} pairings meet WCAG AA.`
    : `\n${failures} pairing(s) below threshold.`,
);
process.exit(failures === 0 ? 0 : 1);
