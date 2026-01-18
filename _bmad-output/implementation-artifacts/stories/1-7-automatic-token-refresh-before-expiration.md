---
storyKey: '1-7-automatic-token-refresh-before-expiration'
epicNumber: 1
storyNumber: 7
title: 'Automatic Token Refresh Before Expiration'
status: 'done'
createdAt: '2026-01-18'
---

# Story 1.7: Automatic Token Refresh Before Expiration

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-7-automatic-token-refresh-before-expiration
**Status:** backlog
**Acceptance Criteria Count:** 3
**Dependencies:** Story 1.2 (User Login) - DONE ✅

---

## Story

As a **logged-in user**,
I want **my access token to be automatically refreshed before it expires**,
So that **my session continues uninterrupted without re-authentication**.

---

## Acceptance Criteria

### AC 1: Token Refreshed Automatically

**Given** I am logged in with an access token
**When** my access token is approaching expiration (within 1 minute)
**Then** the system automatically requests a new access token
**And** I am not logged out
**And** no user action is required

### AC 2: Refresh Endpoint Works

**Given** I have a valid refresh token
**When** I call the refresh endpoint
**Then** I receive a new access token
**And** the new token has a fresh 15-minute expiry
**And** my user session continues

### AC 3: Failed Refresh Logs Out User

**Given** my refresh token is invalid or expired
**When** the token refresh attempt fails
**Then** I am logged out
**And** I am redirected to the login page
**And** I see a message prompting me to log in again

---

## Technical Requirements

### Backend

**Endpoint:** `POST /api/v1/auth/refresh`
- Accepts `{ refreshToken: string }`
- Validates refresh token
- Generates new access token
- Returns new access token
- Returns 401 if refresh token invalid/expired

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string (JWT)"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token"
  }
}
```

### Frontend

**Refresh Logic:**
- Check token expiry time on app mount and periodically
- If token expires within 1 minute, trigger refresh
- Call `/api/v1/auth/refresh` endpoint
- Update accessToken in state and localStorage
- On failure, clear session and redirect to login

**Implementation Location:**
- AuthContext: monitor token expiry
- Use `setInterval` to check every 30 seconds
- Call refresh endpoint before expiration
- Clear interval on logout

---

## Tasks

### Backend Tasks
1. Create `refreshToken` endpoint in `authController.ts`
2. Add validation for refresh token
3. Generate new access token
4. Add route `POST /api/v1/auth/refresh` to `auth.ts`
5. Create tests for refresh endpoint
6. Test with valid/invalid/expired tokens

### Frontend Tasks
1. Add token refresh logic to AuthContext
2. Implement periodic token check (every 30 seconds)
3. Call refresh endpoint when needed
4. Update tokens on successful refresh
5. Logout on failed refresh
6. Test token refresh works correctly

### Testing Tasks
1. Test refresh endpoint with valid token
2. Test refresh endpoint with invalid token
3. Test automatic refresh happens before expiry
4. Test failed refresh logs out user
5. Test new token is valid for API calls

---

## Definition of Done

- [ ] Backend refresh endpoint implemented and tested
- [ ] Frontend refresh logic implemented
- [ ] Automatic refresh works before expiration
- [ ] Failed refresh logs out user
- [ ] All ACs passing
- [ ] Code committed to git
