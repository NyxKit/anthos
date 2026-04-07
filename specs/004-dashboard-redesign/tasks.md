# Tasks: Dashboard Design Integration

**Feature**: Dashboard Design Integration  
**Branch**: `004-dashboard-redesign` | **Date**: 2026-04-07

## Summary

This feature redesigns the Anthos dashboard with a new visual design using nyx-kit components. Tasks are organized by user story to enable independent implementation and testing.

## Dependencies

| From | To | Type |
|------|-----|------|
| Setup | Foundational | Blocks |
| Foundational | US1-5 | Blocks |
| US1 | US2, US3 | Informational (visual elements needed first) |
| US2 | US3 | Informational (metrics from node data) |

## Parallel Execution

- US2 and US3 can run in parallel (both depend on foundational + US1 for layout)
- US4 and US5 can run in parallel (both are panels, independent of node grid)

## Implementation Strategy

**MVP Scope**: User Story 1 (Visual Redesign with basic structure)  
**Incremental Delivery**:
1. Phase 3: US1 - Visual foundation (sidebar, top bar, dark theme)
2. Phase 4: US2 - Summary metrics cards
3. Phase 5: US3 - Node grid with cards
4. Phase 6: US4 - Activity log
5. Phase 7: US5 - System health panel
6. Phase 8: Polish

---

## Phase 1: Setup

- [X] T001 Review existing dashboard components in app/src/dashboard/
- [X] T002 Review nyx-kit components available (NyxCard, NyxGrid, NyxIcon, NyxBadge, NyxProgress, NyxInput)
- [X] T003 Verify design mockup structure in design/anthos_dashboard_rebranded/code.html

## Phase 2: Foundational

- [X] T004 Configure theme tokens in app/src/shared/assets/theme.css for dark mode colors
- [X] T005 Update NyxKit initialization in app/src/main.ts for dark theme
- [X] T006 Review existing telemetry store in app/src/dashboard/stores/telemetry.ts
- [X] T006b [P] Write tests for theme configuration in app/src/shared/assets/theme.css
- [X] T006c [P] Write tests for NyxKit dark theme initialization in app/src/main.ts

---

## Phase 3: User Story 1 - Dashboard Visual Redesign (P1)

**Goal**: Dashboard matches new visual design with dark theme, sidebar navigation, and top app bar.

**Independent Test**: Compare rendered dashboard against design mockups for color palette, typography, spacing.

- [X] T007 [US1] Implement sidebar navigation component in app/src/dashboard/components/SidebarNav.vue
- [X] T008 [US1] Implement top app bar component in app/src/dashboard/components/TopAppBar.vue
- [X] T009 [US1] Update app/src/App.vue to include sidebar and main content layout
- [X] T010 [US1] Apply dark theme CSS tokens to app/src/shared/assets/theme.css
- [ ] T010b [US1] Write visual regression tests comparing rendered output to design mockup screenshots

---

## Phase 4: User Story 2 - Summary Metrics Display (P1)

**Goal**: Display four summary metric cards (Active Nodes, Avg Humidity, Uptime, Latency).

**Independent Test**: Verify four metric cards visible showing current values.

- [X] T011 [P] [US2] Create MetricCard component in app/src/dashboard/components/MetricCard.vue
- [X] T012 [US2] Create MetricsBar component in app/src/dashboard/components/MetricsBar.vue
- [X] T013 [US2] Update DashboardView.vue to include MetricsBar with real-time data

---

## Phase 5: User Story 3 - Node Grid Layout (P1)

**Goal**: Display all nodes in responsive grid with connection status and sensor readings.

**Independent Test**: Load dashboard and verify all nodes appear as styled cards in responsive grid.

- [X] T014 [P] [US3] Update NodeCard.vue with design mockup styling
- [X] T015 [US3] Update SensorList.vue with improved display
- [X] T016 [US3] Update StatusIndicator.vue with design-compliant indicators
- [X] T017 [US3] Update DashboardView.vue to use NyxGrid for responsive node layout
- [X] T018 [US3] Handle critical status styling for low soil moisture alerts

---

## Phase 6: User Story 4 - Real-time Activity Log (P2)

**Goal**: Display scrolling log of system events with timestamps and severity.

**Independent Test**: Verify activity log panel shows timestamped system messages.

- [X] T019 [P] [US4] Create ActivityLog component in app/src/dashboard/components/ActivityLog.vue
- [X] T020 [US4] Add activity events store or integrate with existing telemetry
- [X] T021 [US4] Update DashboardView.vue to include ActivityLog panel

---

## Phase 7: User Story 5 - System Health Panel (P2)

**Goal**: Display system health metrics (Mesh Signal, CPU, Storage) with progress indicators.

**Independent Test**: Verify health panel shows progress bars for key metrics.

- [X] T022 [P] [US5] Create HealthPanel component in app/src/dashboard/components/HealthPanel.vue
- [X] T023 [US5] Use NyxProgress component for health indicators
- [X] T024 [US5] Update DashboardView.vue to include HealthPanel

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T025 Verify responsive design at 320px (mobile), 768px (tablet), 1920px (desktop)
- [ ] T026 Test empty states (no nodes provisioned)
- [ ] T027 Test error states (connectivity loss, sensor errors)
- [ ] T028 Optimize initial load time under 2 seconds

---

## Summary

| Phase | Tasks | User Story |
|-------|-------|------------|
| Setup | T001-T003 | - |
| Foundational | T004-T006c | - |
| US1 (P1) | T007-T010b | Dashboard Visual Redesign |
| US2 (P1) | T011-T013 | Summary Metrics Display |
| US3 (P1) | T014-T018 | Node Grid Layout |
| US4 (P2) | T019-T021 | Activity Log |
| US5 (P2) | T022-T024 | Health Panel |
| Polish | T025-T028 | - |

**Total Tasks**: 31

**MVP**: Phase 3 (US1) - Visual foundation with sidebar and top bar  
**Parallel Opportunities**: US2 & US3 can run in parallel after US1 complete