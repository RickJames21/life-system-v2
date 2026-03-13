# Roadmap: Life System V2 — External Forces

## Overview

Three phases build External Forces onto the existing app. Phase 1 extends the Zustand store with the new data shape so everything has a foundation. Phase 2 delivers the complete user-facing experience: on-demand Wikipedia fetching, the in-log-flow panel with cycling and saving, and the visual treatment that makes saved forces feel like quiet annotations. Phase 3 integrates External Forces into import/export and adds grid search so saved forces are discoverable and portable.

## Phases

- [x] **Phase 1: Store Foundation** - Add `externalForces` state shape, actions, and persistence to Zustand
- [ ] **Phase 2: External Forces Experience** - On-demand API fetch, in-log panel with cycling/saving, mobile layout, and visual polish
- [ ] **Phase 3: Integration** - Import/export includes external forces; grid search spans notes and external forces

## Phase Details

### Phase 1: Store Foundation
**Goal**: The data layer for external forces exists and persists correctly
**Depends on**: Nothing (first phase)
**Requirements**: STORE-01, STORE-02, STORE-03
**Success Criteria** (what must be TRUE):
  1. After saving an external force and refreshing the app, the saved force is still present
  2. The store exposes `setExternalForce`, `updateExternalForceText`, and `clearExternalForce` actions
  3. `externalForces` field is included in the Zustand `partialize` output alongside `notes` and `moods`
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Add ExternalForce type, externalForces state, three actions, and partialize entry to Zustand store

### Phase 2: External Forces Experience
**Goal**: Users can surface historical events for any logged week, cycle through them, save one as an annotation, and edit it afterward
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, LOG-01, LOG-02, LOG-03, LOG-04, LOG-05, LOG-06, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. In the note-writing step of LogSheet, an "External Forces" section appears below the personal note with a trigger button — no events load automatically
  2. After pressing the trigger, one event at a time is shown as `{year} — {summary}` in muted italic; "Show Next" cycles through the week's pool without saving
  3. Pressing "Add to Record" saves the displayed event; the saved force appears in a visually distinct block below personal notes, labeled "Signal", never merged with personal text
  4. The saved external force block is editable inline after saving
  5. If the Wikipedia API is unavailable or returns no events, the panel shows "No external signal" and the log flow continues normally
  6. The External Forces panel is usable on mobile (touch-friendly controls, readable text)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Install vitest test framework and create failing test stubs for hook and panel
- [ ] 02-02-PLAN.md — Build useExternalForces hook (state machine, Wikipedia fetch, cache, shuffle, cycling)
- [ ] 02-03-PLAN.md — Build ExternalForcesPanel component and wire into LogSheet

### Phase 3: Integration
**Goal**: External forces are portable (included in backup/restore and CSV export) and searchable from the grid
**Depends on**: Phase 2
**Requirements**: IO-01, IO-02, IO-03, SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04
**Success Criteria** (what must be TRUE):
  1. A JSON backup export includes the `externalForces` field; restoring that backup recovers all saved forces
  2. Importing an old backup file without an `externalForces` field succeeds without errors or data loss
  3. CSV export includes external force text as a clearly labeled separate column
  4. Typing in the search input dims week cells whose notes AND external forces do not match; matching cells stay highlighted
  5. A matched cell's styling or tooltip indicates whether the match came from a personal note or an external force
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Store Foundation | 1/1 | Complete    | 2026-03-10 |
| 2. External Forces Experience | 2/3 | In Progress|  |
| 3. Integration | 0/TBD | Not started | - |
