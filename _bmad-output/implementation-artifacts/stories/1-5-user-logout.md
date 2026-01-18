---
storyKey: '1-5-user-logout'
epicNumber: 1
storyNumber: 5
title: 'User Logout'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.5: User Logout

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-5-user-logout
**Status:** backlog
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.2 (User Login) - DONE ✅

---

## Story

As a **logged-in user**,
I want **to log out of my account**,
So that **I can securely end my session and prevent unauthorized access**.

---

## Acceptance Criteria

### AC 1: Logout Button Available

**Given** I am logged in
**When** I look at the page
**Then** I see a "Logout" button
**And** the button is easily accessible

### AC 2: Logout Clears Session

**Given** I click the "Logout" button
**When** the logout is complete
**Then** my session is cleared
**And** all tokens are removed from storage
**And** I am redirected to the login page

### AC 3: Protected Routes Inaccessible After Logout

**Given** I have logged out
**When** I try to access a protected route (e.g., /profile, /dashboard)
**Then** I am redirected to the login page
**And** I cannot access any user-specific data

---

## Technical Requirements

### Frontend

**Logout Functionality:**
- Remove `accessToken` from localStorage
- Remove `refreshToken` from localStorage
- Remove `user` data from localStorage
- Clear AuthContext state
- Redirect to login page
- Show optional confirmation/success message

**Logout Button Placement:**
- Dashboard header
- Profile page header
- Navigation bar (if applicable)

---

## Tasks

### Frontend Tasks
1. Add logout button to Dashboard.tsx (already partially done)
2. Add logout functionality to ProfilePage.tsx (once created)
3. Test logout clears all storage
4. Test logout redirects to login
5. Test protected routes redirect after logout

### Testing Tasks
1. Test localStorage is cleared after logout
2. Test tokens are removed from memory
3. Test redirect to login works
4. Test protected routes block access after logout

---

## Definition of Done

- [ ] Logout button available on authenticated pages
- [ ] Logout clears all tokens and user data
- [ ] User redirected to login page
- [ ] Protected routes block access after logout
- [ ] All ACs passing
- [ ] Code committed to git
