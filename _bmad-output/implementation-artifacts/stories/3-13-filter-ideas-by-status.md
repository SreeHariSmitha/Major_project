---
storyKey: '3-13-filter-ideas-by-status'
epicNumber: 3
storyNumber: 13
title: 'Filter Ideas by Status'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.13: Filter Ideas by Status

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-13-filter-ideas-by-status
**Status:** backlog
**Acceptance Criteria Count:** 2
**Dependencies:** Story 3.2

---

## Story

As an **user organizing my ideas**,
I want **to filter ideas by their phase status**,
So that **I can focus on ideas at specific validation stages**.

---

## Acceptance Criteria

### AC 1: Filter Options Available

**Given** I am on the dashboard
**When** I look for filter controls
**Then** I see filter options for:
  - All ideas
  - Phase 1 (not confirmed)
  - Phase 2 (confirmed Phase 1)
  - Phase 3 (confirmed Phase 2)
  - Completed (all phases confirmed)

### AC 2: Filtering Works

**Given** I select a filter option
**When** The filter applies
**Then** Only ideas with that phase status are displayed

---

## Tasks

### Backend Tasks
1. Add phase status filter to GET /ideas query
2. Support filtering by status

### Frontend Tasks
1. Add filter buttons/dropdown to dashboard
2. Implement filter state management
3. Send filter parameter to API
4. Display filtered results

### Testing Tasks
1. Test filtering by each phase
2. Test "All ideas" shows all
3. Test filter persistence

---

## Definition of Done

- [ ] Filter parameter supported in API
- [ ] Filter UI added to dashboard
- [ ] Filtering working correctly
- [ ] All phase statuses filterable
- [ ] All ACs passing
- [ ] Code committed

