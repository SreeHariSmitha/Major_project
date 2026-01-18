---
storyKey: '3-7-archive-idea'
epicNumber: 3
storyNumber: 7
title: 'Archive Idea'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.7: Archive Idea

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-7-archive-idea
**Status:** backlog
**Acceptance Criteria Count:** 2
**Dependencies:** Story 3.2

---

## Story

As an **user managing my ideas**,
I want **to archive ideas I'm not currently working on**,
So that **I can keep my active ideas list clean while preserving archived ideas**.

---

## Acceptance Criteria

### AC 1: Archive Functionality Works

**Given** I click the archive button on an idea
**When** The action completes
**Then** The idea is marked as archived and hidden from the main list

### AC 2: View and Restore Archived Ideas

**Given** I have archived ideas
**When** I view the archive section
**Then** I can see archived ideas and click to restore them

---

## Tasks

### Backend Tasks
1. Add archived field to Idea schema
2. Create PATCH /api/v1/ideas/:id/archive endpoint
3. Update idea archived status
4. Filter archived ideas from main list query

### Frontend Tasks
1. Add archive button to ideas
2. Show archived status
3. Create archived ideas section
4. Add restore functionality
5. Update list filtering

### Testing Tasks
1. Test archiving ideas
2. Test archived ideas don't show in main list
3. Test restore functionality

---

## Definition of Done

- [ ] Archived field added to schema
- [ ] PATCH /api/v1/ideas/:id/archive endpoint working
- [ ] Archive button functional
- [ ] Archived ideas hidden from main list
- [ ] Archive section shows archived ideas
- [ ] All ACs passing
- [ ] Code committed

