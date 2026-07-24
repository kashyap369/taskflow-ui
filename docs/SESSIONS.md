# TaskFlow UI — Session Log

> Append-only. 3–5 lines per session. Focus on gotchas, dead ends, and decisions — things git
> history doesn't capture.

## 2026-07-24 (Design language + landing redesign)
- Created `docs/DESIGN.md` and built the foundation to match: loaded real fonts (Plus Jakarta Sans +
  Inter — Inter was declared but never imported, so everything fell back to system sans; the single
  biggest cause of the "AI-generated" feel), a full semantic CSS-variable token system (light `:root`
  + dark `[data-theme]`), a motion file (tokens + keyframes + `[data-reveal]` utility), a signal
  `ThemeService` (persist + no-FOUC inline script in index.html), and a `RevealDirective`
  (IntersectionObserver — our Framer-Motion stand-in, since this is Angular not React).
- Redesigned the landing page: mesh-glow hero, gradient CTA, a floating **board mock** matching the
  user's reference screenshots (status columns + priority chips + progress + avatar stacks), marquee
  logos, staggered reveals, workflow progress bars that grow on scroll, animated-gradient CTA band.
  Converted the 3 landing molecule cards + footer + public layout to tokens so dark mode works.
- **Gotcha that cost a cycle:** the running dev server kept serving a STALE landing chunk (old badge
  text + black button) while the header updated — because the new template used `<lucide-angular>` but
  `LandingPage.imports` was missing `LucideAngularModule`, so the build errored and esbuild served the
  last-good lazy chunk with no error overlay. `ng build` surfaced it (NG8001). Lesson: when a lazy
  route looks stale, run `ng build` — a failed build silently keeps the old chunk.
- Other notes: Bootstrap Icons (`bi-*`) is NOT installed — the old header icons were invisible;
  switched to lucide. Bootstrap JS is only in the test build config, not the app build, so the
  navbar-collapse toggler won't work without JS — fine for now. Raised `anyComponentStyle` budget to
  12/24 kB for the richer landing SCSS. Verified both themes live at localhost:4200.

## 2026-07-24 (Role-based login + admin/member portals)
- Wired real login end-to-end with role-based redirect (user's complaint: login didn't redirect —
  because the public login page was purely presentational with no submit). Studied the API: `POST
  /auth/login` returns system **roles** (`Admin`/`Manager`/`User`) + access/refresh tokens but **NOT**
  account type; `GET /user/me` returns `AccountType` (Individual=1/Organization=2). So the session is
  built from two calls. Redirect (`resolvePortal`): Admin role → `/admin`, else Organization → `/organization`,
  else Individual → `/member`.
- Reworked auth core to the real contract: `SystemRole`/`AccountType`/`Portal` types + `resolvePortal`
  in `roles.enum.ts` (replaced the old `Role` enum — updated all ~6 references), `User` model (+accountType),
  `AuthStore` (+portal computed), `AuthService` (`homeRoute`/`canAccessPortal`), `TokenService` (+refresh
  token), guards (`authGuard`/`guestGuard`→home/`roleGuard(SystemRole)`/new `portalGuard`).
- Consolidated login into ONE `LoginPage` with a `variant` (solo/organization/admin) from route `data`
  — reusing the animated split-screen design. Deleted the duplicate `features/public/login-page`;
  `/login` now redirects to `/auth/login`; `AuthLayout` made full-bleed. Built themed member + admin
  layout shells + placeholder dashboards so redirects land somewhere.
- **Couldn't verify the live login flow** — no API running in this session, and the API is https with a
  self-signed dev cert. Wired strictly to the documented contract. Next session: run the API + accept
  the cert at `https://localhost:7086`, dev server on 4200.
- **Session rehydration solved a subtle trap:** with a token but no `User`, `guestGuard` would loop and
  portals would bounce to login. Rather than an `APP_INITIALIZER` calling `/user/me` (which can't return
  roles), I persist the whole `User` principal beside the tokens and restore it in the `AuthService`
  constructor. Also guarded `guestGuard` to only redirect when a portal actually resolves.
- **Verified all guard flows in-browser without an API** by seeding a fake session in localStorage and
  reloading: signed-out→/member→/auth/login; Individual can enter /member but is bounced from
  /organization and /admin; logged-in kept out of /auth/login. The live `/auth/login` HTTP call itself
  was not exercised (no API up). `ng build` passes.
- Gotcha while testing: the `navigate` browser tool sometimes does SPA nav (no reload), so seeding
  localStorage then SPA-navigating doesn't re-run the constructor rehydrate — a full reload does. Don't
  mistake that for a guard bug (a clean reload test passed).

## 2026-07-24 (Login page — animated showcase)
- Redesigned the **public** login page (`features/public/login-page`, the `/login` route reached from the
  header "Sign in" — full-screen, no AuthLayout card). Left = token-based, theme-aware form (custom
  gradient checkbox, icon focus states, gradient CTA, staggered reveal entrance). Right = a self-contained
  **animated showcase**: moving aurora + grid, a floating glass "Today's focus" card whose checklist
  completes on a staggered loop (checkbox fill + checkmark pop + strikethrough), a productivity ring that
  draws via `stroke-dashoffset`, a looping slide-in toast, floating avatar stack, plus pointer **parallax**
  driven by mousemove → signals → CSS vars (`--px/--py`). All CSS/SVG keyframes — no Lottie/GSAP.
- **Decision on Lottie/GSAP:** the user asked for them, but Lottie needs an external JSON asset (blocked by
  the offline/CSP sandbox) and GSAP is a new dependency; a hand-crafted CSS/SVG scene is lighter, themeable
  via tokens, needs no external fetch, and Angular signals give the interactivity. If a specific Lottie is
  wanted later, wire `ngx-lottie` (already installed) with `provideLottieOptions` + a JSON in `public/`.
- **Two login pages still exist** (`features/auth/login-page` under AuthLayout's 420px card — which
  actually squashes its full-screen split — and this public one). Enhanced the public one; the duplication
  still needs reconciling. Verified both themes live at /login; `ng build` passes.

## 2026-07-24 (Frontend documentation set up)
- Created the frontend docs set to mirror the backend's (`OVERVIEW`, `ARCHITECTURE`, `CONVENTIONS`,
  `PHASES`, `SESSIONS`), so a new session doesn't need re-explaining. Read the backend docs at
  `D:\Projects\TMS\TaskFlow\docs\` first to match style/structure, then analyzed the frontend codebase.
- **Rewrote the pre-existing `docs/ARCHITECTURE.md`** (dated 2026-07-05): it documented the abandoned
  per-feature Clean-layer folders (`domain/data/application/presentation/`). The code was restructured
  to a **flat** feature layout (`features/<layout>/<page-name>/` + `*.facade/repository/models.ts`) —
  confirmed by the uncommitted git "restructure level 1" and by `CLAUDE.md`. New ARCHITECTURE reflects flat.
- **Key state finding:** foundation/tooling is fully done; only **login** is wired to the API. The
  organization dashboard renders on **hardcoded** data. `shared/validations/` is empty (planned engine).
  Roles aren't returned by the login API, so `toUser()` hardcodes `[Role.Member]`. Two login pages exist
  (`features/auth/login-page` and `features/public/login-page`) — needs reconciling.
- **Gotcha for next session:** the entire restructure is **uncommitted** (unstaged/untracked in git) on
  `main`. Commit it before building further so the flat layout is the recorded baseline. Also check the
  `eslint-plugin-boundaries` element patterns still match the flat paths (they may reference old layer folders).
- Dev API base URL is `https://localhost:7086/api`; keep `ng serve` on **port 4200** (the API's CORS
  allows only `http://localhost:4200`).
