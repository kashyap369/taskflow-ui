#!/usr/bin/env node
/**
 * design-lint — fails when component SCSS hardcodes a value that belongs to a design token.
 *
 * The Phase 1 audit (docs/DESIGN-PHASES.md) found the token system in styles/abstracts/ was well
 * built and almost entirely unused: 0 uses of the type scale, 0 spacing tokens, 0 radius tokens in
 * features, 197 hardcoded hex. Nothing failed when a component wrote `#7c3aed` or `13px`, so the
 * drift was silent. This script is that missing feedback loop.
 *
 * Rules are enabled per phase as each sweep lands, so the lint can never be "temporarily" red:
 *   Phase 1 -> font-size            (ENABLED)
 *   Phase 2 -> color literals       (see PENDING_RULES)
 *   Phase 3 -> border-radius        (see PENDING_RULES)
 *   Phase 8 -> transition durations (see PENDING_RULES)
 *
 * Usage:  npm run design:lint          fail on violations of enabled rules
 *         npm run design:lint -- --all report pending rules too, but do not fail on them
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const showPending = process.argv.includes('--all');

/**
 * Files that legitimately hold raw values: the token definitions themselves, and the theme files
 * whose entire job is to declare the palette.
 */
const EXEMPT_FILES = [
  'src/styles/abstracts/_typography.scss',
  'src/styles/abstracts/_colors.scss',
  'src/styles/abstracts/_radius.scss',
  'src/styles/abstracts/_shadows.scss',
  'src/styles/abstracts/_motion.scss',
  'src/styles/abstracts/_variables.scss',
  'src/styles/themes/_light.scss',
  'src/styles/themes/_dark.scss',
];

const ENABLED_RULES = [
  {
    id: 'font-size',
    phase: 1,
    // Any font-size whose value is not a var(--fs-*) / $fs-* token.
    pattern: /font-size:\s*([^;{}\n]+)/g,
    test: (value) => {
      const v = value.trim();
      if (/var\(--fs-|\$fs-|inherit|initial|unset/.test(v)) return null;
      // `em` is context-relative and sanctioned for <code>; see base/_typography.scss.
      if (/(?<!r)em\s*$/.test(v)) return null;
      return `font-size "${v}" is not a token — use var(--fs-*) from styles/abstracts/_typography.scss`;
    },
  },
  {
    id: 'color-literal',
    phase: 2,
    pattern: /(?<![\w-])#[0-9a-fA-F]{3,8}\b/g,
    // A mask's color channel is pure alpha, not a color — `#000` there means "opaque", and
    // tokenising it would break the mask. This is the only sanctioned raw-color exception.
    skipLine: /mask(-image)?\s*:|-webkit-mask/,
    test: (v) => `hardcoded color ${v} — use a semantic token from styles/themes/_light.scss`,
  },
  {
    id: 'border-radius',
    phase: 3,
    pattern: /border-radius:\s*([^;{}\n]+)/g,
    // Accepts the radius scale itself AND component-level aliases that resolve to it
    // (`--btn-radius`, `--input-radius`) — a semantic per-component token is the pattern this system
    // wants, not a violation. `50%` is a true circle (avatars, dots, rings), not a scale step;
    // `inherit` defers to a parent.
    test: (v) =>
      /var\(--[a-z-]*radius[a-z0-9-]*\)|\$radius|50%|inherit|initial/.test(v)
        ? null
        : `border-radius "${v.trim()}" is not a token — use var(--radius-*) from styles/abstracts/_radius.scss`,
  },
];

const PENDING_RULES = [
  { id: 'duration', phase: 8, pattern: /transition[^;{}\n]*?(\d*\.?\d+m?s)/g, test: (v) => `duration ${v} is not a token — use var(--dur-*)` },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.scss')) out.push(full);
  }
  return out;
}

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length;
}

/**
 * Blank out comment bodies before matching, preserving every character position so reported line
 * numbers stay correct. A hex or a px in a comment is documentation — often documentation of
 * exactly why a token exists — and must not be flagged.
 */
function stripComments(source) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank) //  /* block */
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length))); // // line, not http://
}

function run(rules) {
  const violations = [];
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file).split(sep).join('/');
    if (EXEMPT_FILES.includes(rel)) continue;
    const source = stripComments(readFileSync(file, 'utf8'));

    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(source)) !== null) {
        const line = lineOf(source, m.index);
        if (rule.skipLine && rule.skipLine.test(source.split('\n')[line - 1])) continue;
        const message = rule.test(m[1] ?? m[0]);
        if (message) violations.push({ rel, line, rule: rule.id, message });
      }
    }
  }
  return violations;
}

const failures = run(ENABLED_RULES);

for (const v of failures) {
  console.error(`  ${v.rel}:${v.line}  [${v.rule}]  ${v.message}`);
}

if (showPending) {
  const pending = run(PENDING_RULES);
  const byRule = pending.reduce((acc, v) => ((acc[v.rule] = (acc[v.rule] || 0) + 1), acc), {});
  console.log('\nPending rules (not enforced yet — enable as each phase lands):');
  for (const rule of PENDING_RULES) {
    console.log(`  ${rule.id.padEnd(16)} phase ${rule.phase}   ${byRule[rule.id] || 0} occurrences`);
  }
}

if (failures.length) {
  console.error(`\ndesign-lint: ${failures.length} violation(s). See docs/DESIGN-PHASES.md.`);
  process.exit(1);
}

console.log(`design-lint: clean (${ENABLED_RULES.map((r) => r.id).join(', ')}).`);
