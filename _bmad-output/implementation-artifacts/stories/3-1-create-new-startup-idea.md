---
storyKey: '3-1-create-new-startup-idea'
epicNumber: 3
storyNumber: 1
title: 'Create New Startup Idea'
status: 'ready-for-dev'
createdAt: '2026-01-18'
---

# Story 3.1: Create New Startup Idea

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-1-create-new-startup-idea
**Status:** ready-for-dev
**Acceptance Criteria Count:** 3
**Dependencies:** None (requires authentication from Epic 1)

---

## Story

As an **authenticated user**,
I want **to create a new startup idea with a title and description**,
So that **I can begin the validation process for my business concept**.

---

## Acceptance Criteria

### AC 1: Idea Creation Form Works

**Given** I am logged in and on the dashboard
**When** I click "Create New Idea" button
**Then** A form appears with fields for:
  - Idea title (required, max 200 characters)
  - Idea description (required, max 5000 characters)
  - Create and Cancel buttons

### AC 2: Idea is Saved to Database

**Given** I fill in the form with valid data
**When** I click "Create"
**Then** The idea is saved to database with:
  - User ID (from authenticated user)
  - Title and description
  - Created timestamp
  - Phase status: "Phase 1" (not yet started)
  - Version number: 1

### AC 3: Success Feedback and Navigation

**Given** The idea is created successfully
**When** The creation completes
**Then** I see a success message and am redirected to the idea details page

---

## Tasks

### Backend Tasks
1. Create Idea schema in MongoDB
2. Create POST /api/v1/ideas endpoint
3. Validate input (title, description required)
4. Generate unique idea ID
5. Initialize phase status and version
6. Return created idea

### Frontend Tasks
1. Create "Create Idea" modal/form component
2. Add "Create New Idea" button to dashboard
3. Form validation (client-side)
4. Call API to create idea
5. Show loading state while creating
6. Handle success and error cases
7. Navigate to idea details on success

### Testing Tasks
1. Test idea creation with valid data
2. Test validation (empty title, description)
3. Test character limit enforcement
4. Test database persistence
5. Test error handling

---

## Definition of Done

- [ ] Idea schema created in MongoDB
- [ ] POST /api/v1/ideas endpoint working
- [ ] Frontend form component created
- [ ] Form validation working
- [ ] Idea successfully saved to database
- [ ] Success message displayed
- [ ] Navigation to idea details working
- [ ] All ACs passing
- [ ] Code committed

