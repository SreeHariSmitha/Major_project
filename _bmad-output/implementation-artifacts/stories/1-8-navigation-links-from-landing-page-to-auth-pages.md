---
storyKey: '1-8-navigation-links-from-landing-page-to-auth-pages'
epicNumber: 1
storyNumber: 8
title: 'Navigation Links from Landing Page to Auth Pages'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.8: Navigation Links from Landing Page to Auth Pages

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-8-navigation-links-from-landing-page-to-auth-pages
**Status:** backlog
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.2 (User Login) - DONE ✅

---

## Story

As a **visitor to the platform**,
I want **clear navigation links to register and log in**,
So that **I can easily access authentication pages from the landing page**.

---

## Acceptance Criteria

### AC 1: Navigation Links on Landing Page

**Given** I am on the landing page
**When** I look at the page
**Then** I see a "Get Started" or "Register" link
**And** I see a "Sign In" or "Login" link
**And** both links are clearly visible and accessible

### AC 2: Links Navigate Correctly

**Given** I click on the registration link
**When** the page loads
**Then** I am taken to the registration page
**Given** I click on the login link
**When** the page loads
**Then** I am taken to the login page

### AC 3: Navigation from Auth Pages Back

**Given** I am on the login page
**When** I see the "Create Account" link
**Then** I can click it to go to registration
**Given** I am on the registration page
**When** I see the "Already have an account?" link
**Then** I can click it to go to login

---

## Technical Requirements

### Frontend Changes

**Landing Page (Home component in App.tsx):**
- Add "Get Started" button → /register
- Add "Sign In" button → /login
- Make buttons visually prominent
- Ensure responsive design

**Login Page (Login.tsx):**
- Add "Don't have an account?" message
- Add "Create one now" link → /register
- Already implemented ✅

**Registration Page (Register.tsx):**
- Add "Already have an account?" message
- Add "Sign in here" link → /login
- Verify this exists

---

## Tasks

### Frontend Tasks
1. Verify landing page has register/login buttons
2. Verify login page has register link (already done in Story 1.2)
3. Verify registration page has login link
4. Test all navigation links work correctly
5. Test links are responsive on mobile

### Testing Tasks
1. Test landing page → register link works
2. Test landing page → login link works
3. Test login page → register link works
4. Test register page → login link works
5. Test responsive design on mobile

---

## Definition of Done

- [ ] Navigation links present on landing page
- [ ] All links navigate correctly
- [ ] Links work on mobile devices
- [ ] All ACs passing
- [ ] Code committed to git
