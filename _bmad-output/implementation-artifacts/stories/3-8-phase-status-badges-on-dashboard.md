---
storyKey: '3-8-phase-status-badges-on-dashboard'
epicNumber: 3
storyNumber: 8
title: 'Phase Status Badges on Dashboard'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.8: Phase Status Badges on Dashboard

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-8-phase-status-badges-on-dashboard
**Status:** backlog
**Acceptance Criteria Count:** 2
**Dependencies:** Story 3.2

---

## Story

As an **user viewing my ideas**,
I want **to see phase status badges on idea cards**,
So that **I can quickly see how far each idea has progressed through validation**.

---

## Acceptance Criteria

### AC 1: Badges Display Phase Status

**Given** I view ideas in the list or grid
**When** Each idea is displayed
**Then** I see a badge showing:
  - "Phase 1" (yellow) - not yet confirmed
  - "Phase 2" (blue) - Phase 1 confirmed
  - "Phase 3" (purple) - Phase 2 confirmed
  - "Complete" (green) - all phases done

### AC 2: Badge Styling is Clear

**Given** I view multiple ideas with different phases
**When** I scan the list
**Then** Color-coded badges make it easy to see progress at a glance

---

## Tasks

### Frontend Tasks
1. Create phase status badge component
2. Add badge to idea cards
3. Style with phase colors
4. Add badge to idea list items

### Testing Tasks
1. Test badge displays correctly
2. Test color coding is accurate

---

## Definition of Done

- [ ] Phase status badge component created
- [ ] Badges display on idea cards
- [ ] Badges display on list items
- [ ] Color coding correct
- [ ] All ACs passing
- [ ] Code committed

