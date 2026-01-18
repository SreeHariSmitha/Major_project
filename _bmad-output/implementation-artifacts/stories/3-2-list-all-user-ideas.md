---
storyKey: '3-2-list-all-user-ideas'
epicNumber: 3
storyNumber: 2
title: 'List All User Ideas'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.2: List All User Ideas

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-2-list-all-user-ideas
**Status:** backlog
**Acceptance Criteria Count:** 2
**Dependencies:** Story 3.1 (Create New Startup Idea)

---

## Story

As an **authenticated user**,
I want **to see all my startup ideas in one place**,
So that **I can manage and navigate between my different business concepts**.

---

## Acceptance Criteria

### AC 1: Ideas Are Displayed

**Given** I am on the dashboard
**When** The page loads
**Then** I see all my ideas displayed with:
  - Idea title
  - Idea description (preview/truncated)
  - Creation date
  - Current phase status
  - Version count
  - Last edited date

### AC 2: Empty State Handling

**Given** I have no ideas created yet
**When** I view the dashboard
**Then** I see an empty state message with:
  - "No ideas yet" message
  - Button to create first idea
  - Helpful text about getting started

---

## Tasks

### Backend Tasks
1. Create GET /api/v1/ideas endpoint
2. Fetch all ideas for authenticated user
3. Sort by creation date (newest first)
4. Return idea data with all fields

### Frontend Tasks
1. Create Ideas List component
2. Fetch ideas on dashboard load
3. Display ideas in response
4. Show empty state if no ideas
5. Add loading state while fetching
6. Handle errors gracefully

### Testing Tasks
1. Test fetching ideas with multiple ideas
2. Test empty state display
3. Test loading states
4. Test error handling

---

## Definition of Done

- [ ] GET /api/v1/ideas endpoint working
- [ ] Ideas fetched and displayed on dashboard
- [ ] Empty state message displayed correctly
- [ ] Loading state shows during fetch
- [ ] All ACs passing
- [ ] Code committed

