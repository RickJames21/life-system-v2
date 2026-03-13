---
phase: 2
slug: external-forces-experience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npx vitest run tests/useExternalForces.test.ts tests/ExternalForcesPanel.test.tsx` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/useExternalForces.test.ts tests/ExternalForcesPanel.test.tsx`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| API-01 | hook | 1 | API-01 | unit | `npx vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 | ⬜ pending |
| API-02 | hook | 1 | API-02 | unit | `npx vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 | ⬜ pending |
| API-03 | hook | 1 | API-03 | unit | `npx vitest run tests/useExternalForces.test.ts` | ❌ Wave 0 | ⬜ pending |
| LOG-01 | panel | 2 | LOG-01 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| LOG-02 | panel | 2 | LOG-02 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| LOG-03 | panel | 2 | LOG-03 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| LOG-04 | panel | 2 | LOG-04 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| LOG-05 | panel | 2 | LOG-05 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| LOG-06 | panel | 2 | LOG-06 | unit | `npx vitest run tests/ExternalForcesPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| UX-01 | panel | 2 | UX-01 | manual | Inspect in browser DevTools at 375px viewport | manual-only | ⬜ pending |
| UX-02 | panel | 2 | UX-02 | manual | Visual inspection — muted color, italic, not amber | manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — framework config with jsdom environment
- [ ] `tests/useExternalForces.test.ts` — stubs for API-01, API-02, API-03; requires msw for fetch mocking
- [ ] `tests/ExternalForcesPanel.test.tsx` — stubs for LOG-01 through LOG-06; requires @testing-library/react + jsdom
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom msw`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Buttons have min 44px tap target | UX-01 | CSS dimensions require visual/DevTools inspection | Open app at 375px viewport, inspect trigger button + Show Next + Add to Record height in DevTools |
| Event text uses muted color, italic | UX-02 | Color/typography visual check | Open LogSheet note step, trigger events, verify text is muted (--text-secondary or --text-dim) and italic |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
