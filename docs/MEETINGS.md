# TaskFlow Meetings — Frontend Handoff

The canonical end-to-end roadmap is maintained in the backend sibling repository:

[`D:\Projects\TMS\TaskFlow\docs\MEETINGS.md`](../../../TaskFlow/docs/MEETINGS.md)

It covers both the Angular frontend and ASP.NET Core backend, including secure unregistered email
guests, private/reusable share links, custom display badges, LiveKit media, persistent chat/notes/files,
attendance, recording/Egress, security, infrastructure, testing and production rollout.

## Current status

- Plan approved: **2026-08-30**
- Completed phase: **Meeting Phase 0 — DONE**
- Next phase: **Meeting Phase 1 — READY**
- Implementation landed: pinned LiveKit clients/server stack, provider boundary, signed token/webhook
  proofs, and a development-only two-browser media harness; no production Meetings UI exists yet.

## Resume commands

- **“meeting status”** — inspect and report; do not change code.
- **“complete next meeting phase”** — execute the first READY/IN PROGRESS phase in the canonical plan.
- **“continue meeting phase N”** — resume only that phase and update all required evidence documents.

Read the canonical plan completely before changing meeting code or dependencies. This pointer must stay
short; do not duplicate the roadmap here because two independent copies will drift.
