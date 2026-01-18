---
storyKey: '3-6-delete-idea'
epicNumber: 3
storyNumber: 6
title: 'Delete Idea'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.6: Delete Idea

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-6-delete-idea
**Status:** backlog
**Acceptance Criteria Count:** 2
**Dependencies:** Story 3.2

---

## Story

As an **user managing my ideas**,
I want **to delete an idea that I no longer need**,
So that **my idea list stays clean and organized**.

---

## Acceptance Criteria

### AC 1: Delete Confirmation

**Given** I click the delete button on an idea
**When** A confirmation dialog appears
**Then** It shows warning with "Are you sure?" and buttons for Delete/Cancel

### AC 2: Idea is Deleted

**Given** I confirm the deletion
**When** The request completes
**Then** The idea is removed from database and list, and I see success message

---

## Tasks

### Backend Tasks
1. Create DELETE /api/v1/ideas/:id endpoint
2. Verify user owns the idea
3. Delete idea from database
4. Return success response

### Frontend Tasks
1. Add delete button to idea cards/details
2. Create confirmation dialog
3. Call delete API
4. Update list after deletion
5. Show success message

### Testing Tasks
1. Test delete confirmation dialog
2. Test idea deletion
3. Test list updates after delete

---

## Definition of Done

- [ ] DELETE /api/v1/ideas/:id endpoint working
- [ ] Delete confirmation dialog created
- [ ] Idea successfully deleted from database
- [ ] List updates after deletion
- [ ] All ACs passing
- [ ] Code committed

