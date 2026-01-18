---
storyKey: '1-6-session-persistence-across-browser-refresh'
epicNumber: 1
storyNumber: 6
title: 'Session Persistence Across Browser Refresh'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.6: Session Persistence Across Browser Refresh

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-6-session-persistence-across-browser-refresh
**Status:** backlog
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.2 (User Login) - DONE ✅

---

## Story

As a **logged-in user**,
I want **my session to persist when I refresh the browser**,
So that **I don't need to log in again after a page refresh**.

---

## Acceptance Criteria

### AC 1: Tokens Persisted on Storage

**Given** I log in successfully
**When** I refresh the page
**Then** my session remains active
**And** I am not redirected to the login page
**And** I can continue using the app

### AC 2: User Data Restored

**Given** I have refreshed the page while logged in
**When** the page fully loads
**Then** my profile information is available
**And** the AuthContext is populated with my data
**And** useAuth hook returns my user information

### AC 3: Expired Tokens Handled Gracefully

**Given** my access token has expired
**When** I try to access a protected resource
**Then** the system attempts to refresh the token
**Or** I am redirected to login if refresh fails
**And** I see an appropriate message

---

## Technical Requirements

### Storage Strategy

**localStorage:**
- Store `accessToken` (with expiry time)
- Store `refreshToken` (with expiry time)
- Store `user` object (JSON)

**Memory (State):**
- Keep `accessToken` in React state
- Keep `user` in React state
- Keep `refreshToken` in state

**On App Mount:**
- Check localStorage for tokens
- Validate tokens are not expired
- Restore state from storage
- Mark as loading until restoration complete

---

## Tasks

### Frontend Tasks
1. Verify AuthContext initialization on app mount (already done)
2. Test localStorage persistence
3. Test token expiry handling
4. Test protected routes work after refresh
5. Test user data is available after refresh

### Testing Tasks
1. Log in, refresh page, verify still logged in
2. Log in, refresh page, verify user data correct
3. Test with expired tokens
4. Test logout clears storage completely

---

## Definition of Done

- [ ] Tokens persist in localStorage
- [ ] Session restored on app mount
- [ ] User data available after refresh
- [ ] Protected routes work after refresh
- [ ] Expired tokens handled gracefully
- [ ] All ACs passing
- [ ] Code committed to git
