---
storyKey: '1-2-user-login'
epicNumber: 1
storyNumber: 2
title: 'User Login with Email and Password'
status: 'ready-for-dev'
createdAt: '2026-01-18'
---

# Story 1.2: User Login with Email and Password

**Epic:** Epic 1 - Foundation: Authentication & Onboarding
**Story Key:** 1-2-user-login
**Status:** ready-for-dev
**Acceptance Criteria Count:** 4
**Dependencies:** Story 1.1 (User Registration) - DONE ✅

---

## Story

As a **registered user**,
I want **to log in using my email and password**,
So that **I can access my account and use the platform**.

---

## Acceptance Criteria

### AC 1: Successful Login with Valid Credentials

**Given** I am on the login page
**When** I enter a valid email and password
**Then** I receive a confirmation that login was successful
**And** I am redirected to the dashboard
**And** I receive JWT access and refresh tokens
**And** The tokens are securely stored

### AC 2: Email and Password Validation on Form

**Given** I am on the login page
**When** I enter an email in invalid format or leave password blank
**Then** I see an error message "Invalid email format" or "Password is required"
**And** the login form is not submitted

### AC 3: Invalid Credentials Error Handling

**Given** I am on the login page
**When** I enter a valid email format but incorrect password
**Then** I see an error message "Invalid email or password"
**And** the login form is not submitted
**And** the page does not reveal whether email exists or not (security)

### AC 4: User Account Not Found

**Given** I am on the login page
**When** I enter an email that is not registered
**Then** I see an error message "Invalid email or password" (same as AC 3)
**And** the login form is not submitted
**And** no account information is revealed

---

## Tasks/Subtasks

### Backend Tasks

- [ ] Create POST /api/v1/auth/login endpoint
  - [ ] Accept JSON with email and password
  - [ ] Validate input using Zod schema (email format, password required)
  - [ ] Query User by email (case-insensitive)
  - [ ] Compare provided password with stored hash using bcrypt
  - [ ] Return 401 Unauthorized if password doesn't match
  - [ ] Return 404 Not Found if email doesn't exist (but use same generic error message as wrong password for security)
  - [ ] Generate JWT access token (15 minutes expiry)
  - [ ] Generate JWT refresh token (7 days expiry)
  - [ ] Return tokens in response: { success: true, data: { accessToken, refreshToken, user: { _id, email, name } } }

- [ ] Create input validation schema (Zod)
  - [ ] Email: valid format, required
  - [ ] Password: required, min 1 character (can be anything since it's hashed)

- [ ] Implement JWT token generation
  - [ ] Create token generation utility function
  - [ ] Use environment variables for JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
  - [ ] Set expiry times: access token 15 minutes, refresh token 7 days
  - [ ] Include user _id and email in token payload

- [ ] Implement error handling
  - [ ] Invalid credentials (401) → "Invalid email or password"
  - [ ] Validation error (400) → specific field errors
  - [ ] Server error (500) → "Unable to log in. Please try again."
  - [ ] Generic error message for both "user not found" and "password incorrect" (security best practice)

### Frontend Tasks

- [ ] Create Login page component (/pages/Login.tsx)
  - [ ] Form with email input field
  - [ ] Form with password input field
  - [ ] Submit button
  - [ ] Link to registration page

- [ ] Form validation
  - [ ] Real-time email format validation
  - [ ] Password required validation
  - [ ] Display error messages in UI

- [ ] API integration
  - [ ] Call POST /api/v1/auth/login on form submit
  - [ ] Handle loading state during submission
  - [ ] Show success toast: "Login successful! Redirecting..."
  - [ ] Show error toast with specific error message
  - [ ] Extract tokens from response

- [ ] Token storage and Auth Context
  - [ ] Create AuthContext for managing authentication state
  - [ ] Store access token in memory (or secure httpOnly cookie if available)
  - [ ] Store refresh token in localStorage (with security considerations)
  - [ ] Provide AuthProvider wrapper for app
  - [ ] Create useAuth hook for accessing auth state in components

- [ ] Navigation and redirection
  - [ ] After successful login, redirect to dashboard page (/dashboard)
  - [ ] Persist login state across page refreshes (Story 1.6)
  - [ ] Display user email in header/navbar (optional for this story)

### Test Tasks

- [ ] Backend integration tests for POST /api/v1/auth/login
  - [ ] Test successful login with valid credentials (AC 1)
  - [ ] Test email validation (AC 2)
  - [ ] Test invalid password handling (AC 3)
  - [ ] Test non-existent user handling (AC 4)
  - [ ] Test JWT token generation and format
  - [ ] Test access token expiry is set to 15 minutes
  - [ ] Test refresh token expiry is set to 7 days

- [ ] Frontend unit tests for Login component
  - [ ] Test form field rendering
  - [ ] Test form input handling
  - [ ] Test validation messages display

- [ ] Frontend integration tests
  - [ ] Test successful login flow
  - [ ] Test error messages display
  - [ ] Test token storage after login

---

## Dev Notes

### Architecture Alignment

**API Design:**
- RESTful POST endpoint: `/api/v1/auth/login`
- Request format: `{ email: string, password: string }`
- Response format (success): `{ success: true, data: { accessToken, refreshToken, user: { _id, email, name } }, error: null, pagination: null }`
- Response format (error): `{ success: false, data: null, error: { code, message }, pagination: null }`
- Status codes: 200 OK (success), 400 Bad Request (validation), 401 Unauthorized (invalid credentials), 404 Not Found (user not found, but use generic error), 500 Server Error

**JWT Tokens:**
- Access Token: Short-lived (15 minutes), used for API requests
- Refresh Token: Long-lived (7 days), used to obtain new access token when expired
- Token payload: `{ userId: string, email: string, iat: number, exp: number }`
- Stored securely (access in memory or httpOnly cookie, refresh in localStorage)

**Validation:**
- Use Zod schema: `z.object({ email: z.string().email(), password: z.string().min(1) })`
- Validate before password comparison
- Unique error handling: same message for "wrong password" and "user not found" to prevent account enumeration attacks

**Security:**
- Password comparison using bcrypt.compare() method from User model
- Never return password in API response
- Never reveal whether email exists or not (use generic error message)
- Use constant-time comparison to prevent timing attacks
- Tokens never stored in URL or local storage (access token only in memory)
- Rate limiting on login endpoint (handled by middleware - future enhancement)

**Frontend:**
- Use React Hook Form for form state management
- Use Zod for client-side validation
- Use Axios for API calls with auth interceptor
- Use Sonner for toast notifications
- Use React Context for global auth state
- Handle token refresh before expiry (Story 1.7)
- Persist auth state across page refresh (Story 1.6)

### Implementation Strategy

1. **Start with backend tests** (TDD red-green-refactor)
   - Write tests that validate the acceptance criteria
   - Tests should cover all 4 ACs + error scenarios
   - Verify JWT token generation

2. **Implement backend** following tests
   - Create login endpoint
   - Implement password comparison using User.comparePassword()
   - Generate JWT tokens
   - Error handling

3. **Verify backend** with API testing
   - Use curl or Postman to test all scenarios
   - Confirm all ACs satisfied
   - Verify token format and expiry

4. **Implement frontend** with tests
   - Create Login component with form
   - Integrate with backend API
   - Create AuthContext for state management
   - Test UX flows

5. **End-to-end validation**
   - Test complete login flow in browser
   - Verify tokens stored correctly
   - Verify redirect to dashboard
   - Test error scenarios

### Related Stories

- **Depends on:** Story 1.1 (User Registration) - DONE ✅
- **Enables:** Story 1.3 (View Profile), Story 1.5 (Logout), Story 1.6 (Session Persistence), Story 1.7 (Token Refresh)
- **Parallel possible:** Can develop in parallel with other non-auth stories after 1.1 is complete

### Common Pitfalls to Avoid

- ❌ Storing plaintext password in comparison → ✅ Use bcrypt.compare() from User model
- ❌ Returning different errors for "wrong password" vs "user not found" → ✅ Use generic "Invalid email or password" message
- ❌ Storing access token in localStorage → ✅ Keep in memory only (refresh token can be in localStorage)
- ❌ Not setting token expiry → ✅ Set access token to 15 minutes, refresh to 7 days
- ❌ Returning password in API → ✅ Exclude password from response
- ❌ No error handling → ✅ Handle all HTTP status codes with meaningful messages
- ❌ Hardcoding JWT secrets → ✅ Use environment variables

### Development Environment Setup

**Required:**
- MongoDB instance running (Story 1.1 completed)
- Node.js + npm/yarn
- Postman or curl for API testing
- Completed Story 1.1 (User model, registration endpoint)

**Environment Variables (add to server/.env):**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://Dhoni:Dhoni@cluster0.utffa.mongodb.net/startup-validator?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-access-token-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
```

---

## File List

### New Files (to be created during implementation)

**Backend:**
- `server/src/utils/jwt.ts` - JWT token generation utility
- `server/src/controllers/authController.ts` - Update with login endpoint (append to existing)
- `server/src/routes/auth.ts` - Update with login route (append to existing)
- `server/src/validators/auth.schema.ts` - Update with login validation schema (append to existing)
- `server/src/__tests__/controllers/auth.login.test.ts` - Login endpoint tests

**Frontend:**
- `client/src/context/AuthContext.tsx` - Auth state management context
- `client/src/hooks/useAuth.ts` - Custom hook for using auth context
- `client/src/pages/Login.tsx` - Login page component
- `client/src/pages/Login.module.css` - Login page styling
- `client/src/__tests__/pages/Login.test.tsx` - Login component tests

### Modified Files

- `server/src/controllers/authController.ts` - Add login function
- `server/src/routes/auth.ts` - Add login route
- `server/src/validators/auth.schema.ts` - Add login validation schema
- `server/src/utils/jwt.ts` - Create JWT utility functions
- `server/.env` - Add JWT secrets and token expiry
- `client/src/App.tsx` - Add AuthProvider wrapper, add /login route
- `client/src/services/api.ts` - Add login API call, add auth interceptor for tokens
- `client/src/main.tsx` - Wrap app with AuthProvider

---

## Change Log

**2026-01-18** - Story created
- Extracted from Epic 1, Story 1.2
- Depends on completed Story 1.1 (User Registration)
- Comprehensive ACs with all validation and error scenarios
- Tasks organized by backend, frontend, tests
- Full JWT token implementation planned

---

## Dev Agent Record

### Implementation Plan

_To be filled during implementation_

---

## Senior Developer Review (AI)

_No review conducted yet._

---

## Status

- **Current Status:** ready-for-dev (pending implementation)
- **Progress:** Story file created, ready to begin backend implementation
- **Blocked By:** None (Story 1.1 DONE ✅)
- **Blocking:** Stories 1.3-1.8 in Epic 1 (all require authentication)
- **Next Steps:** Create JWT utility, implement login endpoint with tests, then frontend

