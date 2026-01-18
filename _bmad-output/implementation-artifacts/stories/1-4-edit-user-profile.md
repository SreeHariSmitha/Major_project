---
storyKey: '1-4-edit-user-profile'
epicNumber: 1
storyNumber: 4
title: 'Edit User Profile'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.4: Edit User Profile

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-4-edit-user-profile
**Status:** backlog
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.3 (View User Profile) - Will be DONE soon ✅

---

## Story

As a **logged-in user**,
I want **to edit my profile information**,
So that **I can keep my account details up to date**.

---

## Acceptance Criteria

### AC 1: Edit Profile Information

**Given** I am on my profile page
**When** I click the "Edit Profile" button
**Then** I see an edit form with my current information
**And** I can modify my name
**And** a "Save Changes" button is available

### AC 2: Save Changes

**Given** I have made changes to my profile
**When** I click "Save Changes"
**Then** the changes are sent to the server
**And** I see a success message
**And** the profile page updates with the new information

### AC 3: Validation and Error Handling

**Given** I try to save invalid profile data
**When** I submit the form
**Then** I see validation error messages
**And** the changes are not saved
**And** my original data is preserved

---

## Technical Requirements

### Backend

**Endpoint:** `PUT /api/v1/auth/profile`
- Requires authentication (JWT token)
- Accepts `{ name: string }`
- Updates user document in database
- Returns updated user data
- Returns 400 for validation errors
- Returns 401 if not authenticated

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "email": "string",
    "name": "string",
    "createdAt": "ISO 8601 timestamp"
  }
}
```

### Frontend

**Component:** `EditProfilePage.tsx`
- Form with name input field
- Current profile data pre-filled
- Save and Cancel buttons
- Validation with error messages
- Success notification on save
- Redirect back to profile page on success

---

## Tasks

### Backend Tasks
1. Create `updateProfile` endpoint in `authController.ts`
2. Add PUT route `/api/v1/auth/profile` to `auth.ts`
3. Add validation for profile data
4. Update User model if needed
5. Create tests for update endpoint

### Frontend Tasks
1. Create `EditProfilePage.tsx` component
2. Create `EditProfilePage.module.css` styling
3. Add route `/profile/edit` to App.tsx
4. Add edit button to ProfilePage
5. Add form validation

---

## Definition of Done

- [ ] Backend endpoint implemented and tested
- [ ] Frontend component created
- [ ] All ACs passing
- [ ] Validation working correctly
- [ ] Code committed to git
