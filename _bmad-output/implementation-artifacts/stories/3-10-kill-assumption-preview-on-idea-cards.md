---
storyKey: '3-10-kill-assumption-preview-on-idea-cards'
epicNumber: 3
storyNumber: 10
title: 'Kill Assumption Preview on Idea Cards'
status: 'backlog'
createdAt: '2026-01-18'
---

# Story 3.10: Kill Assumption Preview on Idea Cards

**Epic:** Epic 3 - Idea Management & Dashboard
**Story Key:** 3-10-kill-assumption-preview-on-idea-cards
**Status:** backlog
**Acceptance Criteria Count:** 1
**Dependencies:** Stories 3.2, 3.4, Epic 4 (Phase 1)

---

## Story

As an **user reviewing my ideas**,
I want **to see the kill assumption identified in Phase 1 (if available)**,
So that **I can quickly see which assumption is critical for validation**.

---

## Acceptance Criteria

### AC 1: Kill Assumption Shows on Card

**Given** An idea has been through Phase 1 and kill assumption identified
**When** I view the idea card
**Then** I see a preview of the kill assumption (e.g., "Assumption: X people will...")

---

## Tasks

### Frontend Tasks
1. Add kill assumption preview to idea cards
2. Truncate long assumptions
3. Show only if available

### Testing Tasks
1. Test kill assumption displays when available
2. Test no display when not available

---

## Definition of Done

- [ ] Kill assumption preview added to cards
- [ ] Displays only when available
- [ ] Truncation working
- [ ] All ACs passing
- [ ] Code committed

