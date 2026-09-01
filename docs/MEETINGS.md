# TaskFlow Meetings — Frontend Handoff

The canonical end-to-end roadmap is maintained in the backend sibling repository:

[`D:\Projects\TMS\TaskFlow\docs\MEETINGS.md`](../../../TaskFlow/docs/MEETINGS.md)

It covers both the Angular frontend and ASP.NET Core backend, including secure unregistered email
guests, private/reusable share links, custom display badges, LiveKit media, persistent chat/notes/files,
attendance, recording/Egress, security, infrastructure, testing and production rollout.

## Current status

- Plan approved: **2026-08-30**
- Completed phases: **Meeting Phases 0–5 — DONE**
- Current phase: **Meeting Phase 6 — implementation complete; external certification pending**
- Production verification: meeting create, registered-member assignment, start and the deployed Phase 5
  collaboration surface work. LiveKit is disabled in production, so join remains unavailable until a
  public `wss://` LiveKit service and API credentials are configured. Ready-anytime creation also has
  a known stale hidden-date-validator bug; scheduled creation works. Both are tracked in canonical
  Phase 7 rollout/hardening work.
- Implementation landed: pinned LiveKit clients/server stack, provider boundary, signed token/webhook
  proofs, a development-only two-browser media harness, the authoritative meeting domain/core API,
  the production organization management/scheduling UI with Calendar derivation, secure private and
  reusable invitation management, meeting-only email verification, the public guest lobby, and the
  custom registered/guest room with pre-join devices, media/screen controls, roster/status, capability-
  aware moderation, reconnect handling and signed durable attendance, plus persist-first chat, versioned
  shared notes, private scanned files, complete archives and retention cleanup, plus explicit member/
  guest recording consent, canonical room recording state, host controls and authenticated archives.
- Remaining Phase 6 evidence: a Docker-capable staging run producing a playable room-composite MP4 at
  the declared capacity, followed by the target geography's legal/product consent and retention signoff.

## Resume commands

- **“meeting status”** — inspect and report; do not change code.
- **“complete next meeting phase”** — execute the first READY/IN PROGRESS phase in the canonical plan.
- **“continue meeting phase N”** — resume only that phase and update all required evidence documents.

Read the canonical plan completely before changing meeting code or dependencies. This pointer must stay
short; do not duplicate the roadmap here because two independent copies will drift.
