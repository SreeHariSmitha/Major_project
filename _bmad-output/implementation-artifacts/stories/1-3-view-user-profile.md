---
storyKey: '1-3-view-user-profile'
epicNumber: 1
storyNumber: 3
title: 'View User Profile'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.3: View User Profile

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-3-view-user-profile
**Status:** ready-for-dev
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.2 (User Login) - DONE ✅

---

## Story

As a **logged-in user**,
I want **to view my user profile information**,
So that **I can see my account details and manage my information**.

---

## Acceptance Criteria

### AC 1: Display User Profile Information

**Given** I am logged in and on the profile page
**When** the page loads
**Then** I see my profile information including:
  - Full name (if provided)
  - Email address
  - Account creation date
**And** the information is displayed in an organized, readable format

### AC 2: Profile Page is Protected

**Given** I am not logged in
**When** I try to access the profile page
**Then** I am redirected to the login page
**And** I cannot view anyone's profile data

### AC 3: Profile Data Accuracy

**Given** I am viewing my profile
**When** I navigate away and return
**Then** my profile information remains accurate and up-to-date
**And** it matches the data stored in the database

---

## Technical Requirements

### Backend

**Endpoint:** `GET /api/v1/auth/profile`
- Requires authentication (JWT token in Authorization header)
- Returns authenticated user's profile data
- Returns 401 if not authenticated
- Returns 200 with user data if successful

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "email": "string",
    "name": "string (optional)",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access"
  }
}
```

### Frontend

**Component:** `ProfilePage.tsx`
- Protected by ProtectedRoute
- Uses useAuth hook to get current user
- Displays user information in a card layout
- Shows loading state while fetching data
- Handles errors gracefully
- Links to edit profile page (Story 1.4)

---

## Tasks

### Backend Tasks
1. Create `getProfile` endpoint in `authController.ts`
   - Extract user ID from JWT token
   - Fetch user data from database
   - Return user information
2. Add route `GET /api/v1/auth/profile` to `auth.ts`
3. Create unit tests for profile endpoint
4. Test with authenticated and unauthenticated requests

### Frontend Tasks
1. Create `ProfilePage.tsx` component
   - Display user name, email, creation date
   - Show loading state
   - Handle errors
2. Create `ProfilePage.module.css` styling
   - Match design system from Login/Dashboard
   - Responsive layout
3. Add route `/profile` to App.tsx with ProtectedRoute wrapper
4. Add navigation link to profile from dashboard

### Testing Tasks
1. Test profile endpoint returns 401 without token
2. Test profile endpoint returns correct user data with token
3. Test profile page redirects unauthenticated users to login
4. Test profile page displays correct user information

---

## Definition of Done

- [ ] Backend endpoint implemented and tested
- [ ] Frontend component created with professional styling
- [ ] All ACs passing
- [ ] Protected route implemented
- [ ] Navigation links added
- [ ] Code committed to git
