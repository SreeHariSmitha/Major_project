---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
status: 'complete'
completedAt: '2026-01-18'
totalEpics: 10
totalStories: 65
frCoverage: '100%'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Startup Validator Platform - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Startup Validator Platform, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

---

## Requirements Inventory

### Functional Requirements (70 Total)

**User Account Management (FR1-FR7):**
- FR1: Visitor can register a new account using email and password
- FR2: Registered user can log in with email and password
- FR3: Authenticated user can view their profile information
- FR4: Authenticated user can edit their profile information
- FR5: Authenticated user can log out of the application
- FR6: System can maintain user session across browser refreshes
- FR7: System can automatically refresh authentication tokens before expiration

**Landing Page (FR8-FR13):**
- FR8: Visitor can view the product value proposition on the landing page
- FR9: Visitor can view information about the product features
- FR10: Visitor can view the company vision and mission
- FR11: Visitor can access contact information or contact form
- FR12: Visitor can navigate to registration from the landing page
- FR13: Visitor can navigate to login from the landing page

**Idea Management (FR14-FR21):**
- FR14: Authenticated user can create a new startup idea with a description
- FR15: Authenticated user can view a list of all their ideas
- FR16: Authenticated user can view ideas in a sidebar list format
- FR17: Authenticated user can view ideas in a card grid format
- FR18: Authenticated user can view the current phase status of each idea
- FR19: Authenticated user can select an idea to view its details
- FR20: Authenticated user can delete an idea they created
- FR21: Authenticated user can archive an idea (hide without deleting)

**Phase 1: Initial Analysis (FR22-FR28):**
- FR22: System can generate a Clean Idea Summary from user's idea description
- FR23: System can generate a Market Feasibility assessment for an idea
- FR24: System can generate a Competitive Analysis for an idea
- FR25: System can identify and display a Kill Assumption for an idea
- FR26: User can view all Phase 1 outputs for their idea
- FR27: User can confirm/lock Phase 1 to proceed to Phase 2
- FR28: User can download Phase 1 outputs as a PDF report

**Phase 2: Business Model Generation (FR29-FR36):**
- FR29: System can generate a Business Model description for a confirmed idea
- FR30: System can generate a Strategy (go-to-market, growth) for an idea
- FR31: System can identify Structural Risks for the business model
- FR32: System can identify Operational Risks for the business model
- FR33: User can view all Phase 2 outputs for their idea
- FR34: User can confirm/lock Phase 2 to proceed to Phase 3
- FR35: User can download Phase 2 outputs as a PDF report
- FR36: Phase 2 generation is only available after Phase 1 is confirmed

**Phase 3: Pitch Deck Generation (FR37-FR41):**
- FR37: System can generate investor-ready Pitch Deck content
- FR38: System can generate a "What Changed" changelog comparing to previous version
- FR39: User can view all Phase 3 outputs (pitch deck content)
- FR40: User can download Phase 3 outputs as a PDF pitch deck
- FR41: Phase 3 generation is only available after Phase 2 is confirmed

**Section-Level Editing (FR42-FR46):**
- FR42: User can select a specific section within any phase for editing
- FR43: User can provide feedback/instructions to refine a specific section
- FR44: System can regenerate only the selected section based on user feedback
- FR45: System preserves all non-edited sections when regenerating one section
- FR46: User can view the edit interface (input area) for a section

**Version Control (FR47-FR54):**
- FR47: System creates a new immutable version when any edit is made
- FR48: User can view the version history for an idea
- FR49: User can see version numbers and timestamps in the history
- FR50: User can view any previous version of their idea (read-only)
- FR51: User can compare what changed between versions
- FR52: System marks the latest version as the active version
- FR53: System implements cascade invalidation: Phase 1 edits flag Phase 2 & 3 as needing update
- FR54: User can see visual indicator when downstream phases need regeneration

**Dashboard & Organization (FR55-FR60):**
- FR55: User can see phase completion status badges on idea cards
- FR56: User can see the version count on idea cards
- FR57: User can see the Kill Assumption preview on idea cards
- FR58: User can see last edited timestamp on idea cards
- FR59: User can filter ideas by status (In Progress, Completed, Archived)
- FR60: User can search ideas by title or content

**UI Feedback & Navigation (FR61-FR66):**
- FR61: System displays toast notifications for user actions (success, error, info)
- FR62: User can see phase navigation showing progress (1-2-3 stepper)
- FR63: System shows locked state for phases not yet accessible
- FR64: System displays loading states during content generation
- FR65: System displays skeleton placeholders while content loads
- FR66: User can navigate between phases of a single idea

**Responsive Experience (FR67-FR70):**
- FR67: User can access all features on desktop browsers
- FR68: User can access all features on tablet devices
- FR69: User can access all features on mobile devices
- FR70: Layout adapts appropriately to different screen sizes

---

### Non-Functional Requirements (50 Total)

**Performance (NFR-P1 to NFR-P7):**
- NFR-P1: Page load (initial) <3 seconds (Time to Interactive)
- NFR-P2: API response (simple) <500ms (Auth, CRUD operations)
- NFR-P3: API response (generation) <30 seconds (Phase generation with dummy data)
- NFR-P4: PDF generation <10 seconds (Download ready time)
- NFR-P5: UI interactions <100ms (Click/input feedback)
- NFR-P6: First Contentful Paint (FCP) <1.5s via Lighthouse
- NFR-P7: System supports 100 concurrent users without degradation

**Security (NFR-S1 to NFR-S17):**
- NFR-S1: All passwords are hashed using bcrypt with salt
- NFR-S2: JWT access tokens expire within 15 minutes
- NFR-S3: JWT refresh tokens expire within 7 days
- NFR-S4: All authenticated API routes require valid JWT
- NFR-S5: Users can only access their own ideas and data
- NFR-S6: All API communication uses HTTPS (TLS 1.2+)
- NFR-S7: Database connections use encrypted transport
- NFR-S8: Sensitive data (passwords) never returned in API responses
- NFR-S9: User sessions invalidated on logout
- NFR-S10: All user inputs sanitized against XSS attacks
- NFR-S11: All database queries use parameterized queries (no SQL/NoSQL injection)
- NFR-S12: CSRF protection on all state-changing operations
- NFR-S13: Rate limiting on authentication endpoints (5 attempts/minute)
- NFR-S14: Rate limiting on generation endpoints (10 requests/minute)
- NFR-S15: User email addresses not exposed to other users
- NFR-S16: Deleted ideas are permanently removed (not soft-deleted indefinitely)
- NFR-S17: User can request full account deletion (GDPR compliance)

**Accessibility (NFR-A1 to NFR-A12):**
- NFR-A1: All interactive elements are keyboard accessible
- NFR-A2: All images have meaningful alt text or are decorative
- NFR-A3: Color contrast ratio is at least 4.5:1 for normal text
- NFR-A4: Color contrast ratio is at least 3:1 for large text
- NFR-A5: Focus indicators are visible on all focusable elements
- NFR-A6: Form inputs have associated labels
- NFR-A7: Error messages are announced to screen readers
- NFR-A8: Page structure uses semantic HTML elements
- NFR-A9: Skip navigation link is provided
- NFR-A10: Application is usable with screen readers (NVDA, VoiceOver)
- NFR-A11: No functionality requires mouse-only interaction
- NFR-A12: Toast notifications use ARIA live regions

**Scalability (NFR-SC1 to NFR-SC8):**
- NFR-SC1: System architecture supports 1,000 users for MVP
- NFR-SC2: Database design supports 10,000 users without schema changes
- NFR-SC3: File storage strategy supports 100,000 PDFs
- NFR-SC4: Each user can have up to 100 ideas
- NFR-SC5: Each idea can have up to 50 versions
- NFR-SC6: Database indexes support efficient queries at scale
- NFR-SC7: Application can be deployed to multiple instances (stateless)
- NFR-SC8: No user session stored in application memory (JWT-based)

**Reliability (NFR-R1 to NFR-R11):**
- NFR-R1: Target 99% uptime (allows ~7 hours downtime/month for MVP)
- NFR-R2: Planned maintenance windows communicated 24 hours in advance
- NFR-R3: Database backups performed daily
- NFR-R4: No data loss during normal operations
- NFR-R5: Version history is immutable (cannot be corrupted)
- NFR-R6: Failed operations do not leave data in inconsistent state
- NFR-R7: All errors logged with sufficient context for debugging
- NFR-R8: User-facing errors provide helpful messages (not stack traces)
- NFR-R9: System recovers gracefully from transient failures
- NFR-R10: Application health endpoint available for monitoring
- NFR-R11: Error rates tracked and alertable

---

### Additional Requirements from Architecture

**Technology Stack & Setup:**
- Project initialization: React + Vite + TypeScript frontend setup
- Express.js backend with TypeScript setup
- MongoDB connection and Mongoose schema configuration
- Environment configuration system (no hardcoding)

**API & Integration:**
- RESTful API implementation with consistent response format (wrapper pattern)
- 20+ API endpoints across 5 route modules (auth, users, ideas, versions, generation)
- JWT middleware for authentication verification
- Error handling middleware with consistent error codes
- Rate limiting middleware

**Database Architecture:**
- Users collection with unique email index
- Ideas collection with userId+status index and userId+createdAt index
- Versions collection with embedded phase data and immutable structure
- RefreshTokens collection with TTL index for automatic cleanup
- Proper indexing strategy for query performance

**Project Structure:**
- Strict folder organization: /client, /server, /src, /components, /pages, /hooks, etc.
- Separation of concerns: Controllers → Services → Models
- Component hierarchy: UI → Components → Features → Pages
- Naming conventions enforced (camelCase fields, PascalCase components, etc.)

**Code Patterns & Standards:**
- TypeScript for type safety across all code
- Zod for input validation schemas
- React Hook Form for form handling
- Axios for HTTP requests with interceptors
- Error handling patterns documented
- Loading state patterns (useAsync hook)

---

### Additional Requirements from UX Design

**Design System & Theming:**
- Shadcn UI components with Tailwind CSS utilities
- Custom color system: primary (#2563EB), success (#10B981), warning (#F59E0B), error (#EF4444)
- Phase-specific colors: active (blue), complete (green), invalidated (amber), locked (slate)
- Consistent spacing and typography via Tailwind

**User Journey Support:**
- Alex (First-Timer): Quick start, Phase 1 structure, Kill Assumption clarity
- Jordan (Serial): Multi-idea dashboard, version control, cascade invalidation
- Morgan (Fundraiser): Phase skip/confirm, business model depth, presentation-quality PDF
- Sam (Explorer): Rapid entry, sidebar history, filters, search, comparison

**Responsive Design:**
- Mobile (<640px): Single column, hamburger menu, full-screen drawers
- Tablet (640-1024px): Two column, sidebar overlay, adaptive grids
- Desktop (>1024px): Full layout, persistent sidebar, 3-column grids

**Key UI Components:**
- Phase Stepper: Visual progress indicator (1-2-3) with confirmation gates
- Idea Card: Status badges, Kill Assumption preview, version count, timestamps
- Section Editor: Slide-out drawer (mobile) or side panel (desktop)
- Version Timeline: Visual history with diff capability
- Toast notifications via Sonner library

**Accessibility & UX:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Skip links for screen readers
- Color not sole indicator (icons/text also used)
- Focus indicators on all focusable elements

---

### FR Coverage Map (Requirements to Architecture/UX Mapping)

| FR Category | Architecture Support | UX Support | Notes |
|-------------|---------------------|-----------|-------|
| Auth (FR1-7) | JWT middleware, Services | Login/Register flows | Complete |
| Landing (FR8-13) | Static routes | Hero, About, Vision | Complete |
| Ideas (FR14-21) | CRUD API, Services | Dashboard, sidebar | Complete |
| Phase 1-3 (FR22-41) | Generation service, PDF service | Stepper, Content views | Complete |
| Editing (FR42-46) | Section regeneration logic | Section Editor UI | Complete |
| Versioning (FR47-54) | Version service, cascade logic | Version Timeline | Complete |
| Dashboard (FR55-60) | Query API, filtering | Card grid, filters | Complete |
| UI/Nav (FR61-70) | Middleware patterns | Components, responsive | Complete |

---

## Epic List

### Epic 1: Foundation - Authentication & Onboarding
Users can register, login, manage their profile, maintain sessions, and access the platform securely.

**User Outcome:** Users have secure accounts with persistent sessions and can manage their profile information.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR12, FR13

**Technical Scope:**
- User registration with email/password validation
- Login with JWT token generation (15min access + 7d refresh)
- Profile view and edit functionality
- Session persistence across browser refreshes
- Token refresh mechanism
- Logout functionality
- Landing page navigation to auth flows

**Standalone Value:** ✅ Complete auth system
**Enables:** All subsequent epics depend on authenticated users

---

### Epic 2: Public Discovery - Landing Page
Visitors can learn about Startup Validator, understand the platform value, and navigate to signup/login.

**User Outcome:** Visitors understand the product value proposition and have clear paths to registration or login.

**FRs Covered:** FR8, FR9, FR10, FR11

**Technical Scope:**
- Hero section with value proposition
- Features overview section
- Vision and mission content
- Contact information/form
- SEO-optimized metadata
- Responsive design for all device sizes

**Standalone Value:** ✅ Public marketing presence
**Enables:** Drives user acquisition; requires Epic 1 for registration/login links

---

### Epic 3: Idea Management & Dashboard
Users can create startup ideas, view them in multiple formats, manage idea lifecycle, and see clear status indicators.

**User Outcome:** Users have a centralized dashboard to track all their startup ideas with clear status visibility and organization options.

**FRs Covered:** FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR55, FR56, FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR67, FR68, FR69, FR70

**Technical Scope:**
- Create new idea with description input
- List all user ideas with pagination
- Sidebar list view of ideas
- Card grid view (responsive: 1/2/3 columns)
- View idea details page
- Delete idea (soft delete)
- Archive idea
- Phase status badges (✓○○ format)
- Version count display
- Kill Assumption preview on cards
- Last edited timestamp
- Search ideas by title/content
- Filter ideas by status (In Progress, Completed, Archived)
- Loading states and skeleton loaders
- Toast notifications for all actions
- Responsive design (mobile/tablet/desktop)

**Standalone Value:** ✅ Complete idea organization system
**Enables:** All validation phases depend on ideas existing

**CRITICAL:** This epic includes ALL UI feedback, navigation, and responsive design for the core dashboard experience.

---

### Epic 4: Phase 1 - Idea Validation & Kill Assumption
Users can validate their startup ideas and identify the single most critical assumption that could kill their idea.

**User Outcome:** Users understand their idea's viability, competitive landscape, market opportunity, and most importantly, the one key assumption to test first.

**FRs Covered:** FR22, FR23, FR24, FR25, FR26, FR27, FR28

**Technical Scope:**
- Generate Clean Idea Summary from user description
- Generate Market Feasibility assessment
- Generate Competitive Analysis
- Identify and prominently display Kill Assumption
- View all Phase 1 outputs
- Confirm/lock Phase 1 (creates version checkpoint)
- Download Phase 1 as PDF report
- Display generation loading states
- Phase status update in dashboard

**Standalone Value:** ✅ Users can validate ideas without further phases
**Enables:** Provides foundation for versioning and subsequent phases
**Key Innovation:** Kill Assumption focus (differentiator vs competitors)

---

### Epic 5: Version Control & Idea History (DIFFERENTIATOR)
Users can see the complete evolution of their ideas through version history and compare changes between versions.

**User Outcome:** Users have Git-like version control for startup ideas, enabling confidence in iteration and tracking thinking evolution over time.

**FRs Covered:** FR47, FR48, FR49, FR50, FR51, FR52

**Technical Scope:**
- Create immutable version when any edit is made
- View complete version history with version numbers
- Display timestamps for each version
- View any previous version (read-only)
- Compare what changed between versions (diff view)
- Mark latest version as active
- Display version count on dashboard cards
- Archive/restore versions if needed
- Version timeline UI component

**Standalone Value:** ✅ Complete version control system
**Enables:** Enables confident iteration; foundation for cascade invalidation
**Key Innovation:** Version control for startup ideas (differentiator)

---

### Epic 6: Section-Level Editing & Granular Refinement (DIFFERENTIATOR)
Users can refine specific sections of their validation without losing other work or forcing full regeneration.

**User Outcome:** Users can confidently iterate on specific aspects of their idea (e.g., change pricing strategy) without losing refinements made to other sections.

**FRs Covered:** FR42, FR43, FR44, FR45, FR46

**Technical Scope:**
- Select specific section for editing (e.g., "Strategy" in Phase 2)
- Open edit interface (drawer on mobile, side panel on desktop)
- Provide feedback/instructions for refinement
- Regenerate only selected section
- Preserve all non-edited sections unchanged
- Display section edit status
- Loading states during regeneration
- Toast notification on completion
- Responsive edit UI (full-screen on mobile)

**Standalone Value:** ✅ Section-level edit capability
**Enables:** Enables cascade invalidation; required for user confidence in iteration
**Key Innovation:** Non-destructive editing (differentiator)

---

### Epic 7: Cascade Invalidation & Phase Dependencies (DIFFERENTIATOR)
Users see clear indication when downstream phases need updates due to changes, and can regenerate efficiently.

**User Outcome:** Users understand phase dependencies and can confidently iterate knowing what needs regeneration.

**FRs Covered:** FR53, FR54

**Technical Scope:**
- When Phase 1 is edited, flag Phase 2 & 3 as "needs regeneration"
- Display visual invalidation badges on dashboard
- Show invalidation status in phase stepper
- Provide option to regenerate flagged phases
- Update cascade logic in backend
- Clear invalidation flag after regeneration
- Prevent confirmation of invalidated phases

**Standalone Value:** ✅ Cascade logic with clear UI indication
**Enables:** Enables confident phase progression
**Key Innovation:** Intelligent phase dependencies (differentiator)

---

### Epic 8: Phase 2 - Business Model Development
Users develop their business model, go-to-market strategy, and identify structural/operational risks.

**User Outcome:** Users have a comprehensive business model framework including strategy and risk analysis, ready to pivot or proceed with confidence.

**FRs Covered:** FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36

**Technical Scope:**
- Generate Business Model description
- Generate Strategy (go-to-market, growth)
- Identify Structural Risks
- Identify Operational Risks
- View all Phase 2 outputs
- Confirm/lock Phase 2 (creates version checkpoint)
- Download Phase 2 as PDF report
- Phase 2 only available after Phase 1 is confirmed
- Phase lock prevents proceeding without confirmation
- Generation loading states
- Handle cascade invalidation from Phase 1

**Standalone Value:** ✅ Users have complete business model (with Phase 1 complete)
**Enables:** Foundation for pitch deck creation
**Dependency:** Requires Phase 1 complete (locked); depends on Epic 5 versioning

---

### Epic 9: Phase 3 - Investor Pitch Deck
Users generate an investor-ready pitch deck with changelog showing their thinking evolution.

**User Outcome:** Users have a presentation-quality pitch deck ready for investor meetings, with clear documentation of strategic decisions.

**FRs Covered:** FR37, FR38, FR39, FR40, FR41

**Technical Scope:**
- Generate investor-ready Pitch Deck content
- Generate "What Changed" changelog (compares to previous version)
- View all Phase 3 outputs
- Download Phase 3 as PDF pitch deck (presentation quality)
- Changelog shows strategic evolution
- Phase 3 only available after Phase 2 is confirmed
- Phase lock prevents proceeding without confirmation
- Generation loading states
- Handle cascade invalidation from Phases 1-2

**Standalone Value:** ✅ Users have investor-ready output (with Phases 1-2 complete)
**Enables:** Enables funding conversations
**Dependency:** Requires Phase 2 complete (locked); depends on all previous epics

---

### Epic 10: Advanced Search, Filters & Organization
Users can efficiently search, filter, and organize large numbers of ideas for power-user workflows.

**User Outcome:** Users with many ideas can quickly find what they're looking for and organize ideas by status and other criteria.

**FRs Covered:** FR59, FR60

**Technical Scope:**
- Search ideas by title and content
- Filter ideas by status (In Progress, Completed, Archived)
- Filter combinations (e.g., "Completed & Archived")
- Search highlighting/relevance
- Filter UI with chips/tags
- Clear filters button
- Search results pagination
- Empty state messaging
- Mobile-responsive filter UI

**Standalone Value:** ✅ Complete search/filter system
**Enables:** Enhances Epic 3 for power users
**Dependency:** Builds on Epic 3 (dashboard)

---

## Requirements Coverage Map (Detailed FR→Epic Mapping)

| FR | Epic | Description |
|-------|------|-------------|
| FR1 | Epic 1 | User registration |
| FR2 | Epic 1 | User login |
| FR3 | Epic 1 | View profile |
| FR4 | Epic 1 | Edit profile |
| FR5 | Epic 1 | User logout |
| FR6 | Epic 1 | Session persistence |
| FR7 | Epic 1 | Token refresh |
| FR8 | Epic 2 | Landing page hero |
| FR9 | Epic 2 | Landing page features |
| FR10 | Epic 2 | Landing page vision/mission |
| FR11 | Epic 2 | Landing page contact |
| FR12 | Epic 1 | Register link from landing |
| FR13 | Epic 1 | Login link from landing |
| FR14 | Epic 3 | Create idea |
| FR15 | Epic 3 | List ideas |
| FR16 | Epic 3 | Sidebar list view |
| FR17 | Epic 3 | Card grid view |
| FR18 | Epic 3 | Phase status badges |
| FR19 | Epic 3 | View idea details |
| FR20 | Epic 3 | Delete idea |
| FR21 | Epic 3 | Archive idea |
| FR22 | Epic 4 | Generate Idea Summary |
| FR23 | Epic 4 | Generate Market Feasibility |
| FR24 | Epic 4 | Generate Competitive Analysis |
| FR25 | Epic 4 | Identify Kill Assumption |
| FR26 | Epic 4 | View Phase 1 outputs |
| FR27 | Epic 4 | Confirm Phase 1 |
| FR28 | Epic 4 | Download Phase 1 PDF |
| FR29 | Epic 8 | Generate Business Model |
| FR30 | Epic 8 | Generate Strategy |
| FR31 | Epic 8 | Identify Structural Risks |
| FR32 | Epic 8 | Identify Operational Risks |
| FR33 | Epic 8 | View Phase 2 outputs |
| FR34 | Epic 8 | Confirm Phase 2 |
| FR35 | Epic 8 | Download Phase 2 PDF |
| FR36 | Epic 8 | Phase 2 locked until Phase 1 confirmed |
| FR37 | Epic 9 | Generate Pitch Deck |
| FR38 | Epic 9 | Generate changelog |
| FR39 | Epic 9 | View Phase 3 outputs |
| FR40 | Epic 9 | Download Phase 3 PDF |
| FR41 | Epic 9 | Phase 3 locked until Phase 2 confirmed |
| FR42 | Epic 6 | Select section for editing |
| FR43 | Epic 6 | Provide edit feedback |
| FR44 | Epic 6 | Regenerate section |
| FR45 | Epic 6 | Preserve non-edited sections |
| FR46 | Epic 6 | Edit interface UI |
| FR47 | Epic 5 | Create immutable version |
| FR48 | Epic 5 | View version history |
| FR49 | Epic 5 | Version timestamps |
| FR50 | Epic 5 | View previous version |
| FR51 | Epic 5 | Compare versions |
| FR52 | Epic 5 | Mark latest version active |
| FR53 | Epic 7 | Cascade invalidation logic |
| FR54 | Epic 7 | Visual invalidation indicator |
| FR55 | Epic 3 | Phase status badges on cards |
| FR56 | Epic 3 | Version count on cards |
| FR57 | Epic 3 | Kill Assumption preview |
| FR58 | Epic 3 | Last edited timestamp |
| FR59 | Epic 10 | Search ideas |
| FR60 | Epic 10 | Filter ideas |
| FR61 | Epic 3 | Toast notifications |
| FR62 | Epic 3 | Phase stepper navigation |
| FR63 | Epic 3 | Phase locked state |
| FR64 | Epic 3 | Loading states |
| FR65 | Epic 3 | Skeleton placeholders |
| FR66 | Epic 3 | Navigate between phases |
| FR67 | Epic 3 | Desktop experience |
| FR68 | Epic 3 | Tablet experience |
| FR69 | Epic 3 | Mobile experience |
| FR70 | Epic 3 | Responsive layout |

**Coverage:** ✅ All 70 FRs mapped to specific epics

---

## Epic 1: Foundation - Authentication & Onboarding

**Epic Goal:** Users can register, login, manage their profile, maintain sessions, and access the platform securely.

**Stories in this Epic:** 8

### Story 1.1: User Registration with Email and Password

As a **visitor**,
I want **to register a new account using email and password**,
So that **I can create a user account and access the platform**.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email address and password
**Then** a new user account is created in the database
**And** I receive a confirmation that registration was successful
**And** I am redirected to the login page

**Given** I am on the registration page
**When** I enter an invalid email format
**Then** I see an error message "Invalid email format"
**And** the registration form is not submitted

**Given** I am on the registration page
**When** I enter a password shorter than 8 characters
**Then** I see an error message "Password must be at least 8 characters"
**And** the registration form is not submitted

**Given** I am on the registration page
**When** I enter an email that already exists
**Then** I see an error message "Email already registered"
**And** the registration form is not submitted

**Technical Notes:**
- Create User model with email (unique), password (bcrypt hashed), name fields
- Implement POST /api/v1/auth/register endpoint
- Use Zod validation for input
- Password must be hashed with bcrypt before storage
- Return success/error response in API wrapper format

---

### Story 1.2: User Login with Email and Password

As a **registered user**,
I want **to log in using my email and password**,
So that **I can access my account and see my startup ideas**.

**Acceptance Criteria:**

**Given** I am on the login page with correct email/password
**When** I click the login button
**Then** I receive an access token (valid for 15 minutes) in the response
**And** I receive a refresh token (valid for 7 days) in httpOnly cookie
**And** I am redirected to the dashboard

**Given** I am on the login page with incorrect password
**When** I click the login button
**Then** I see an error message "Invalid email or password"
**And** I remain on the login page

**Given** I am on the login page with non-existent email
**When** I click the login button
**Then** I see an error message "Invalid email or password"
**And** I remain on the login page

**Given** I am on the login page
**When** I attempt to login 5 times with wrong password
**Then** I see an error message "Account temporarily locked"
**And** login is disabled for 15 minutes
**And** a rate limiting error is returned (429)

**Technical Notes:**
- Implement POST /api/v1/auth/login endpoint
- Generate access token (JWT, 15min expiry) and store in memory/React state
- Generate refresh token (JWT, 7d expiry) and store in httpOnly cookie
- Implement rate limiting middleware (5 attempts/minute)
- Use bcrypt to compare password with stored hash
- Return tokens in API response

---

### Story 1.3: View User Profile Information

As an **authenticated user**,
I want **to view my profile information**,
So that **I can see my account details**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to the profile page
**Then** I see my email address displayed
**And** I see my name displayed
**And** I see when my account was created

**Given** I am logged in
**When** I visit the profile page
**Then** a GET /api/v1/users/me request is made with my access token
**And** my profile data is returned correctly
**And** my password is NOT returned in the response

**Given** I am not logged in
**When** I try to visit the profile page
**Then** I am redirected to the login page

**Technical Notes:**
- Implement GET /api/v1/users/me endpoint
- Require JWT authentication middleware
- Extract userId from JWT token
- Query User collection and return profile data
- Ensure password is excluded from response

---

### Story 1.4: Edit User Profile Information

As an **authenticated user**,
I want **to edit my profile information (name)**,
So that **I can keep my account details up to date**.

**Acceptance Criteria:**

**Given** I am on the profile page
**When** I click the "Edit" button
**Then** I see editable fields for my name
**And** my current name is pre-filled in the form

**Given** I have made changes to my name
**When** I click "Save"
**Then** a PATCH /api/v1/users/me request is made with the new data
**And** my profile is updated in the database
**And** I see a success toast: "Profile updated successfully"
**And** the page reflects the updated name

**Given** I am editing my profile
**When** I click "Cancel"
**Then** no changes are saved
**And** I return to viewing my profile

**Technical Notes:**
- Implement PATCH /api/v1/users/me endpoint
- Require JWT authentication middleware
- Only allow users to update their own profile
- Validate name field (non-empty)
- Return updated user object in response
- Use toast notification for success/error feedback

---

### Story 1.5: User Logout

As an **authenticated user**,
I want **to log out of my account**,
So that **I can securely end my session**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the "Logout" button
**Then** my access token is cleared from memory
**And** my refresh token cookie is deleted
**And** I am redirected to the login page
**And** I see a message "Logged out successfully"

**Given** I have logged out
**When** I try to navigate to the dashboard
**Then** I am redirected to the login page
**And** I cannot access any protected routes

**Technical Notes:**
- Create POST /api/v1/auth/logout endpoint
- Clear tokens from frontend (state/cookies)
- Optionally invalidate refresh token in database
- Return success response
- Frontend handles redirect to login page

---

### Story 1.6: Session Persistence Across Browser Refresh

As an **authenticated user**,
I want **my session to persist when I refresh the browser**,
So that **I don't have to log in again after a page refresh**.

**Acceptance Criteria:**

**Given** I am logged in and on the dashboard
**When** I refresh the browser
**Then** my session remains active
**And** I am not redirected to the login page
**And** the dashboard loads with my data intact

**Given** I am logged in
**When** I refresh the browser
**Then** the access token is restored from storage (localStorage or React state)
**And** my authentication state is maintained

**Given** my access token has expired (15+ minutes)
**When** I refresh the browser
**Then** the refresh token is used to get a new access token
**And** I remain logged in

**Technical Notes:**
- Store access token in localStorage or React Context
- Use refresh token to restore session on app load
- Implement token validation on App mount
- Call POST /api/v1/auth/refresh if access token is missing
- Handle token expiration gracefully

---

### Story 1.7: Automatic Token Refresh Before Expiration

As an **authenticated user**,
I want **my access token to automatically refresh**,
So that **my session doesn't expire unexpectedly while I'm using the app**.

**Acceptance Criteria:**

**Given** I have an access token that expires in 15 minutes
**When** I continue to use the app
**Then** approximately 2 minutes before expiration, a new access token is automatically requested
**And** the old token is replaced with the new one
**And** I continue using the app without interruption

**Given** an API request receives a 401 Unauthorized response
**When** the response indicates token expiration
**Then** a POST /api/v1/auth/refresh request is automatically made
**And** if successful, the original request is automatically retried with the new token
**And** if refresh fails, I am redirected to the login page

**Technical Notes:**
- Implement POST /api/v1/auth/refresh endpoint
- Use refresh token from httpOnly cookie to generate new access token
- Set up refresh interceptor in Axios
- Proactive refresh ~2min before expiration
- Reactive refresh on 401 response

---

### Story 1.8: Navigation Links from Landing Page to Auth Pages

As a **visitor on the landing page**,
I want **easy navigation to sign up or log in**,
So that **I can quickly access the registration or login pages**.

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I look at the navigation header
**Then** I see a "Sign Up" button/link
**And** I see a "Log In" button/link

**Given** I am not logged in and viewing the landing page
**When** I click the "Sign Up" button
**Then** I am navigated to the registration page

**Given** I am not logged in and viewing the landing page
**When** I click the "Log In" button
**Then** I am navigated to the login page

**Given** I am logged in
**When** I view the landing page header
**Then** the "Sign Up" and "Log In" buttons are hidden
**And** a "Dashboard" button is shown instead

**Technical Notes:**
- Add navigation component to landing page
- Implement conditional rendering based on auth state
- Use React Router for navigation
- Links should use proper routing, not full page reloads

---

## Epic 2: Public Discovery - Landing Page

**Epic Goal:** Visitors can learn about Startup Validator, understand the platform value, and navigate to signup/login.

**Stories in this Epic:** 4

### Story 2.1: Landing Page Hero Section with Value Proposition

As a **first-time visitor**,
I want **to immediately understand what Startup Validator does**,
So that **I know if this tool solves my problem**.

**Acceptance Criteria:**

**Given** I land on the home page
**When** the page loads
**Then** I see a compelling hero section with a headline
**And** the headline clearly communicates the core value: "From Idea to Investor-Ready in 3 Steps"
**And** I see a brief subheading describing the problem solved
**And** I see a clear call-to-action button: "Get Started" or "Try Now"

**Given** I see the hero section
**When** I click the "Get Started" button
**Then** I am navigated to the registration page

**Given** I view the landing page on mobile
**When** the page loads
**Then** the hero section is responsive and readable on small screens
**And** text is appropriately sized and spaced
**And** buttons are easily tappable

**Technical Notes:**
- Create Landing page component
- Use Tailwind CSS for styling
- Implement responsive design (mobile first)
- Hero section should include: headline, subheading, CTA button
- Use Next.js Image component or similar for optimization

---

### Story 2.2: Features Overview Section

As a **interested visitor**,
I want **to understand the key features of Startup Validator**,
So that **I know what capabilities the platform offers**.

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I scroll down from the hero section
**Then** I see a Features section
**And** each feature is described with:
  - Feature title (e.g., "3-Phase Validation", "Version Control", "Kill Assumption")
  - Brief description (1-2 sentences)
  - An icon or visual indicator

**Given** I view the Features section
**When** I look at the list of features
**Then** I can identify at least 5 key features:
  - Clean Idea Summary & Kill Assumption
  - Version Control with History
  - Section-Level Editing
  - Business Model Development
  - Investor-Ready Pitch Deck

**Given** I view the Features section on different devices
**When** the page loads
**Then** the features are displayed in a responsive layout:
  - 1 column on mobile
  - 2-3 columns on tablet/desktop

**Technical Notes:**
- Create Features section with card components
- Use Shadcn UI Card component
- Create feature data array with icon/title/description
- Implement responsive grid (1 col mobile, 2-3 cols desktop)
- Use icon library (e.g., Lucide or Heroicons)

---

### Story 2.3: Vision and Mission Section

As a **thoughtful visitor**,
I want **to understand the company vision and mission**,
So that **I know the values and long-term goals of Startup Validator**.

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I scroll to the Vision & Mission section
**Then** I see clearly labeled "Vision" and "Mission" statements
**And** each statement is concise (2-3 sentences)
**And** they communicate the platform's long-term goals

**Given** I read the Vision statement
**When** I review the content
**Then** it conveys the ambition: "To become the GitHub of startup ideas"

**Given** I read the Mission statement
**When** I review the content
**Then** it communicates the immediate purpose: "Help founders validate startup ideas quickly and confidently"

**Technical Notes:**
- Create Vision/Mission section
- Use typography for visual hierarchy
- Make content editable via CMS or constants file
- Keep messaging accessible and compelling

---

### Story 2.4: Contact Information and Footer

As a **visitor interested in the platform**,
I want **to find contact information or reach out to the team**,
So that **I can ask questions or provide feedback**.

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I scroll to the bottom
**Then** I see a footer section
**And** the footer includes:
  - Contact email address
  - Social media links (if applicable)
  - Links to privacy policy and terms of service
  - Copyright information

**Given** I see the contact information
**When** I click the email address
**Then** my email client opens with a new message to the contact email

**Given** I view the footer on mobile
**When** the page loads
**Then** the footer is readable and all links are easily tappable

**Technical Notes:**
- Create footer component
- Include email link (mailto:)
- Add social media links
- Add privacy/terms links (can be placeholder)
- Make footer sticky or appropriately positioned
- Use responsive layout for footer content

---

## Epic 3: Idea Management & Dashboard

**Epic Goal:** Users can create startup ideas, view them in multiple formats, manage idea lifecycle, and see clear status indicators.

**Stories in this Epic:** 12

### Story 3.1: Create New Startup Idea

As an **authenticated user**,
I want **to create a new startup idea with a title and description**,
So that **I can begin validating a new business concept**.

**Acceptance Criteria:**

**Given** I am logged in and on the dashboard
**When** I click the "Create New Idea" button
**Then** I see a form with fields:
  - Idea Title (required, max 100 chars)
  - Idea Description (required, max 5000 chars)

**Given** I fill in the form with valid data
**When** I click "Create"
**Then** a POST /api/v1/ideas request is made with the title and description
**And** a new idea document is created in MongoDB
**And** the idea status is set to "active"
**And** phase status is set to: phase1: "pending", phase2: "locked", phase3: "locked"
**And** I see a success toast: "Idea created successfully"
**And** I am redirected to the idea workspace

**Given** I try to submit the form with empty title
**When** I click "Create"
**Then** I see an error: "Title is required"
**And** the form is not submitted

**Given** I try to submit with a description longer than 5000 chars
**When** I click "Create"
**Then** I see an error: "Description cannot exceed 5000 characters"
**And** the form is not submitted

**Technical Notes:**
- Create Ideas collection if not exists
- Implement POST /api/v1/ideas endpoint
- Use Zod validation for input
- Generate unique idea ID (MongoDB ObjectId)
- Set initial phase statuses
- Record createdAt and updatedAt timestamps
- Return created idea in response

---

### Story 3.2: List All User Ideas

As an **authenticated user**,
I want **to see all my startup ideas in one place**,
So that **I can manage and track multiple ideas**.

**Acceptance Criteria:**

**Given** I am logged in and have created multiple ideas
**When** I navigate to the dashboard
**Then** I see a list of all my ideas
**And** each idea is displayed with its title
**And** the total count of ideas is shown

**Given** I have no ideas yet
**When** I navigate to the dashboard
**Then** I see an empty state message: "No ideas yet. Create your first idea to get started."

**Given** I navigate to the dashboard
**When** the page loads
**Then** a GET /api/v1/ideas request is made
**And** all ideas are fetched and displayed
**And** ideas are sorted by createdAt (newest first)

**Given** I have more than 10 ideas
**When** I view the dashboard
**Then** ideas are paginated, showing 10 per page
**And** I see pagination controls (next/previous)

**Technical Notes:**
- Implement GET /api/v1/ideas endpoint
- Query Ideas collection where userId = currentUserId
- Sort by createdAt descending
- Implement pagination (default 10 per page)
- Return ideas in API wrapper format

---

### Story 3.3: View Ideas in Sidebar List Format

As an **power user**,
I want **to see all my ideas in a collapsible sidebar**,
So that **I can quickly switch between ideas while working**.

**Acceptance Criteria:**

**Given** I am on the idea workspace
**When** I look at the left side of the screen
**Then** I see a sidebar with a list of all my ideas
**And** each idea in the list shows the title
**And** the currently active idea is highlighted

**Given** I click on an idea in the sidebar
**When** I select it
**Then** the workspace switches to that idea
**And** the idea's current phase data is displayed
**And** the previously selected idea is no longer highlighted

**Given** I am on a mobile device
**When** I view the workspace
**Then** the sidebar is collapsed by default
**And** a hamburger menu icon is visible
**And** clicking the hamburger expands the sidebar

**Given** the sidebar is expanded on mobile
**When** I select an idea
**Then** the sidebar collapses automatically

**Technical Notes:**
- Create Sidebar component
- Display list of user's ideas from state
- Implement active idea highlighting
- Use React state to manage active idea
- Implement responsive behavior (hamburger on <640px)
- Use Shadcn Sheet/Drawer component for mobile sidebar

---

### Story 3.4: View Ideas in Card Grid Format

As an **dashboard-focused user**,
I want **to see all my ideas as a visual grid of cards**,
So that **I can get a quick overview of all my ideas at once**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I view the main content area
**Then** I see ideas displayed as cards in a grid layout
**And** on desktop: 3 columns
**And** on tablet: 2 columns
**And** on mobile: 1 column

**Given** I view the card grid
**When** the page loads
**Then** each card displays:
  - Idea title
  - Phase status badges (✓○○ format)
  - Kill Assumption preview (if Phase 1 complete)
  - Version count
  - Last edited timestamp

**Given** I click on a card
**When** I select it
**Then** I am navigated to that idea's workspace

**Given** I have no ideas
**When** I view the dashboard
**Then** I see an empty state with a CTA: "Create your first idea"

**Technical Notes:**
- Create IdeaCard component showing title, status badges, version count, timestamp
- Implement responsive grid using Tailwind (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Fetch ideas from API
- Use Shadcn Card component

---

### Story 3.5: View Idea Details Page

As an **authenticated user**,
I want **to see the full details of a specific idea**,
So that **I can view all the information and validation outputs for that idea**.

**Acceptance Criteria:**

**Given** I have selected an idea from the sidebar or grid
**When** the idea workspace loads
**Then** I see the idea title at the top
**And** I see the idea description
**And** I see the phase stepper showing which phase I'm in
**And** I see the current phase's content (if generated)

**Given** I am viewing an idea workspace
**When** a GET /api/v1/ideas/:ideaId request is made
**Then** the idea and its current version data are loaded
**And** all phase outputs are available if they've been generated

**Technical Notes:**
- Create IdeaWorkspace page component
- Implement GET /api/v1/ideas/:ideaId endpoint
- Load idea + current version data
- Display idea metadata
- Show phase stepper
- Display phase content components conditionally

---

### Story 3.6: Delete Idea

As an **authenticated user**,
I want **to permanently delete an idea I no longer want**,
So that **I can remove outdated or unwanted ideas from my account**.

**Acceptance Criteria:**

**Given** I am viewing an idea
**When** I click the "Delete" button
**Then** I see a confirmation dialog: "Are you sure? This action cannot be undone."

**Given** I confirm the deletion
**When** I click "Delete"
**Then** a DELETE /api/v1/ideas/:ideaId request is made
**And** the idea is permanently removed from the database
**And** I see a success toast: "Idea deleted successfully"
**And** I am redirected to the dashboard

**Given** I click "Cancel" on the confirmation dialog
**When** I dismiss it
**Then** the idea is not deleted

**Technical Notes:**
- Implement DELETE /api/v1/ideas/:ideaId endpoint
- Verify userId matches (user can only delete their own ideas)
- Permanently remove idea from database
- Also delete associated versions
- Return success response

---

### Story 3.7: Archive Idea

As an **authenticated user**,
I want **to archive an idea temporarily without permanently deleting it**,
So that **I can hide completed or inactive ideas but keep them for reference**.

**Acceptance Criteria:**

**Given** I am viewing an idea
**When** I click the "Archive" button
**Then** the idea status changes to "archived"
**And** I see a toast: "Idea archived"
**And** the idea is removed from the main dashboard view

**Given** I have archived ideas
**When** I filter by "Archived" status
**Then** I see only archived ideas
**And** I can unarchive them if needed

**Given** I click "Unarchive" on an archived idea
**When** I confirm
**Then** the idea status changes back to "active"
**And** the idea reappears in the main dashboard

**Technical Notes:**
- Implement PATCH /api/v1/ideas/:ideaId endpoint to update status
- Update idea.status to "archived"
- Filter dashboard views by status = "active"
- Include archived ideas only when user filters for them

---

### Story 3.8: Phase Status Badges on Dashboard

As a **dashboard user**,
I want **to see clear visual indicators of each idea's progress through the 3 phases**,
So that **I can quickly see which phase each idea has reached**.

**Acceptance Criteria:**

**Given** I am viewing the dashboard or idea cards
**When** I look at each idea
**Then** I see phase status badges in the format: [✓○○] or similar
  - ✓ = completed phase
  - ● = current phase
  - ○ = locked/future phase

**Given** Phase 1 is complete and Phase 2 is locked
**When** I view the badges
**Then** I see: ✓ ○ ○ (indicating Phase 1 done, Phase 2 pending, Phase 3 locked)

**Given** Phase 1 & 2 are complete
**When** I view the badges
**Then** I see: ✓ ✓ ○ (indicating Phases 1-2 done, Phase 3 pending)

**Given** Phase 2 is in progress (not yet confirmed)
**When** I view the badges
**Then** I see: ✓ ● ○ (indicating Phase 1 done, Phase 2 active, Phase 3 locked)

**Technical Notes:**
- Create PhaseBadges component
- Map phaseStatus object to badge symbols
- Use Tailwind + Shadcn Badge component
- Color code: completed = green, active = blue, locked = gray

---

### Story 3.9: Version Count on Idea Cards

As a **power user tracking iteration**,
I want **to see how many versions an idea has**,
So that **I know how much iteration has occurred**.

**Acceptance Criteria:**

**Given** I view an idea card
**When** the card loads
**Then** I see a version count display: "v3" or "3 versions"

**Given** an idea has only one version
**When** I view the card
**Then** the version display shows: "v1"

**Given** an idea has been edited multiple times
**When** I view the card
**Then** the version count is accurate and up-to-date

**Technical Notes:**
- Query versions collection for ideaId and count them
- Display on IdeaCard component
- Update in real-time when versions are created

---

### Story 3.10: Kill Assumption Preview on Idea Cards

As a **dashboard user**,
I want **to see a preview of each idea's Kill Assumption on the dashboard card**,
So that **I can quickly see the key risk for each idea without opening it**.

**Acceptance Criteria:**

**Given** I view an idea card for a completed Phase 1
**When** the card loads
**Then** I see a preview of the Kill Assumption
**And** it's displayed in a clear, readable format
**And** the text is truncated if longer than 100 characters

**Given** an idea doesn't have Phase 1 completed yet
**When** I view the card
**Then** no Kill Assumption preview is shown

**Given** I hover over the Kill Assumption preview
**When** I mouse over it on desktop
**Then** a tooltip shows the full Kill Assumption text (if truncated)

**Technical Notes:**
- Fetch Kill Assumption from current version's phase1 data
- Display with truncation logic
- Use Shadcn Tooltip for hover display
- Update IdeaCard component to show this field

---

### Story 3.11: Last Edited Timestamp on Idea Cards

As a **organized user**,
I want **to see when each idea was last edited**,
So that **I can prioritize ideas I'm actively working on**.

**Acceptance Criteria:**

**Given** I view an idea card
**When** the card loads
**Then** I see when the idea was last modified
**And** the timestamp uses relative format: "2 hours ago", "3 days ago"

**Given** an idea has never been edited since creation
**When** I view the card
**Then** the timestamp shows the creation time

**Given** the current time and last edit are different dates
**When** I hover over the timestamp
**Then** a tooltip shows the full date/time: "Jan 18, 2026 3:45 PM"

**Technical Notes:**
- Display updatedAt timestamp on IdeaCard
- Use date-fns or similar for relative time formatting
- Update IdeaCard component
- Use Shadcn Tooltip for full timestamp

---

### Story 3.12: Search Ideas by Title and Content

As a **user with many ideas**,
I want **to search my ideas by title or content**,
So that **I can quickly find specific ideas**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I type in the search box
**Then** ideas are filtered in real-time as I type
**And** results match the search term in title OR description

**Given** I search for "AI"
**When** I see the results
**Then** all ideas with "AI" in the title or description are shown

**Given** my search returns no results
**When** I view the filtered list
**Then** I see: "No ideas match your search"

**Given** I clear the search box
**When** I delete the search term
**Then** all ideas are shown again

**Technical Notes:**
- Implement search in frontend using local filter on fetched ideas
- Use case-insensitive matching
- Filter on title and description fields
- For large datasets, could implement backend search via GET /api/v1/ideas?search=term

---

### Story 3.13: Filter Ideas by Status

As a **organized user**,
I want **to filter my ideas by status (In Progress, Completed, Archived)**,
So that **I can focus on specific subsets of my ideas**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I see the filter options
**Then** I can choose: "All", "In Progress", "Completed", "Archived"

**Given** I select "In Progress"
**When** the filter is applied
**Then** only ideas with phase1 incomplete are shown

**Given** I select "Completed"
**When** the filter is applied
**Then** only ideas with phase3 complete are shown

**Given** I select "Archived"
**When** the filter is applied
**Then** only archived ideas are shown

**Given** I click "All"
**When** the filter is cleared
**Then** all non-deleted ideas are shown

**Technical Notes:**
- Create FilterChips component
- Store selected filter in state
- Filter ideas array based on status
- Persist filter selection in URL params or state

---

## Epic 4: Phase 1 - Idea Validation & Kill Assumption

**Epic Goal:** Users can validate their startup ideas and identify the single most critical assumption that could kill their idea.

**Stories in this Epic:** 7

### Story 4.1: Generate Clean Idea Summary

As a **user validating my idea**,
I want **to receive a clean, structured summary of my startup idea**,
So that **I can ensure my concept is clearly articulated**.

**Acceptance Criteria:**

**Given** I have entered my idea description
**When** I click "Generate Phase 1"
**Then** a POST /api/v1/ideas/:ideaId/generate/phase1 request is made
**And** the system processes my description
**And** within 30 seconds, a Clean Idea Summary is generated
**And** I see a loading indicator while generation is in progress

**Given** Phase 1 generation completes
**When** the results appear
**Then** I see the "Clean Idea Summary" section
**And** it contains 2-3 sentences clearly stating:
  - What the product/service is
  - Who it serves
  - Why it matters

**Given** the generation fails
**When** an error occurs
**Then** I see an error toast: "Generation failed. Please try again."

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/generate/phase1 endpoint
- For MVP: Generate dummy/templated summary based on idea description
- Use loading state in frontend
- Create new Version document with phase1 data
- Return phase1 outputs in response

---

### Story 4.2: Generate Market Feasibility Assessment

As a **user** validating my idea,
I want **to understand the market opportunity for my startup idea**,
So that **I can assess if a viable market exists**.

**Acceptance Criteria:**

**Given** Phase 1 generation completes
**When** the results appear
**Then** I see the "Market Feasibility" section
**And** it includes:
  - Market size estimate
  - Market growth trajectory
  - Key market trends
  - Market timing assessment (Now/Soon/Waiting)

**Given** I view the Market Feasibility assessment
**When** I read the content
**Then** it provides specific, actionable insights about the market opportunity

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase1
- For MVP: Template-based generation with idea description inserted
- Include market size, growth, trends in phase1 data
- Store in Version document

---

### Story 4.3: Generate Competitive Analysis

As a **user researching my idea**,
I want **to understand the competitive landscape**,
So that **I can identify my competitive positioning**.

**Acceptance Criteria:**

**Given** Phase 1 generation completes
**When** the results appear
**Then** I see the "Competitive Analysis" section
**And** it lists 2-3 direct or indirect competitors
**And** for each competitor, it shows:
  - Competitor name
  - How they differ from my idea
  - Potential advantages of my approach

**Given** I view the competitive analysis
**When** I read the content
**Then** it helps me understand my unique positioning

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase1
- For MVP: Template with competitors identified from keywords
- Include comparison table or narrative
- Store in phase1 data

---

### Story 4.4: Identify and Display Kill Assumption

As a **founder**,
I want **to know the single most critical assumption that could invalidate my idea**,
So that **I know exactly what to test first**.

**Acceptance Criteria:**

**Given** Phase 1 generation completes
**When** the results appear
**Then** I see a prominent "Kill Assumption" section
**And** it displays ONE clear assumption that could kill the idea
**And** the assumption is specific and testable
**And** it's formatted prominently (e.g., highlighted box, different color)

**Given** I read the Kill Assumption
**When** I understand it
**Then** it's clear what I need to validate
**And** it includes guidance like "Test this by: [specific action]"

**Example Kill Assumption:**
"Assumes users will pay $50/month for this solution. Validate by conducting 10+ customer interviews with target users to confirm willingness to pay."

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase1
- For MVP: Template-based, derived from market + competitive analysis
- Make visually prominent in UI
- Store in phase1.killAssumption field
- This is the KEY DIFFERENTIATOR

---

### Story 4.5: View All Phase 1 Outputs

As a **user**,
I want **to see all Phase 1 outputs in one organized view**,
So that **I can review the complete Phase 1 analysis**.

**Acceptance Criteria:**

**Given** Phase 1 generation completes
**When** I view the Phase 1 section
**Then** I see all outputs organized:
  - Clean Idea Summary (at top)
  - Market Feasibility
  - Competitive Analysis
  - Kill Assumption (prominently displayed)

**Given** I scroll through Phase 1 content
**When** all content is visible
**Then** the layout is clean and readable
**And** each section is clearly labeled
**And** content is appropriately spaced

**Technical Notes:**
- Create Phase1Content component
- Display all phase1 fields from current version
- Use card-based layout with Shadcn Card components
- Responsive design for all screen sizes

---

### Story 4.6: Confirm/Lock Phase 1 to Proceed to Phase 2

As a **user**,
I want **to confirm that Phase 1 is complete and lock it before proceeding to Phase 2**,
So that **I can create a checkpoint in my idea's validation**.

**Acceptance Criteria:**

**Given** I have reviewed Phase 1 outputs
**When** I click the "Confirm Phase 1" button
**Then** a POST /api/v1/ideas/:ideaId/confirm/phase1 request is made
**And** phase1.confirmedAt is set to current timestamp
**And** idea.phaseStatus.phase2 changes from "locked" to "pending"
**And** I see a success toast: "Phase 1 confirmed. Phase 2 is now available."
**And** the Phase 2 section becomes enabled

**Given** Phase 1 is confirmed
**When** I view the phase stepper
**Then** Phase 1 shows as ✓ (complete)
**And** Phase 2 shows as ● (active/available)
**And** Phase 3 shows as ○ (locked)

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/confirm/phase1 endpoint
- Update idea.phaseStatus and version timestamps
- Return updated idea with new phase status
- Frontend updates UI to enable Phase 2 button

---

### Story 4.7: Download Phase 1 as PDF Report

As a **user**,
I want **to download Phase 1 outputs as a PDF**,
So that **I can share or print my validation analysis**.

**Acceptance Criteria:**

**Given** I have completed Phase 1
**When** I click the "Download PDF" button
**Then** a GET /api/v1/ideas/:ideaId/export/pdf?phase=1 request is made
**And** a PDF is generated containing:
  - Idea title
  - Clean Idea Summary
  - Market Feasibility
  - Competitive Analysis
  - Kill Assumption
  - Generated date

**Given** the PDF download completes
**When** the file downloads
**Then** the filename is "Phase1-[IdeaTitle].pdf"
**And** the PDF is readable and well-formatted
**And** within 10 seconds

**Technical Notes:**
- Implement GET /api/v1/ideas/:ideaId/export/pdf?phase=1 endpoint
- Use jsPDF or similar library
- Generate PDF with all phase1 content
- Return as downloadable file with appropriate headers
- For MVP: Simple text-based PDF; enhance later with styling

---

## Epic 5: Version Control & Idea History (DIFFERENTIATOR)

**Epic Goal:** Users can see the complete evolution of their ideas through version history and compare changes between versions.

**Stories in this Epic:** 6

### Story 5.1: Create Immutable Version on Edit

As a **system**,
I want **to automatically create a new version whenever an idea is edited**,
So that **every change is tracked and immutable**.

**Acceptance Criteria:**

**Given** a user edits any part of their idea (description, section content, etc.)
**When** the edit is saved
**Then** a new Version document is created
**And** the version number is incremented (1, 2, 3...)
**And** the previous version remains unchanged and immutable
**And** the new version is marked as active
**And** all previous versions remain accessible but read-only

**Given** a new version is created
**When** I query the versions collection
**Then** I can see the complete history of all versions
**And** each version has a unique versionNumber
**And** each version has a createdAt timestamp

**Technical Notes:**
- Create Version model with versionNumber, ideaId, all phase data
- Before any edit/update, create new Version document
- Increment versionNumber from previous version
- Set isActive=true on new version, false on old versions
- Store in MongoDB as separate collection

---

### Story 5.2: View Complete Version History

As a **user**,
I want **to see a chronological list of all versions of my idea**,
So that **I can track the evolution of my thinking**.

**Acceptance Criteria:**

**Given** I navigate to the Version History page
**When** the page loads
**Then** a GET /api/v1/ideas/:ideaId/versions request is made
**And** I see a list of all versions in reverse chronological order (newest first)
**And** each version shows:
  - Version number (v1, v2, v3...)
  - Created timestamp
  - What changed (brief summary or "Initial version")

**Given** an idea has 5 versions
**When** I view the history
**Then** I can see all 5 versions listed
**And** the most recent version is highlighted or marked as "Current"

**Technical Notes:**
- Implement GET /api/v1/ideas/:ideaId/versions endpoint
- Query versions collection for ideaId
- Sort by versionNumber descending
- Return with pagination if many versions
- Calculate changelog (what changed from previous)

---

### Story 5.3: View Version Number and Timestamps

As a **user tracking changes**,
I want **to know when each version was created and see version numbers**,
So that **I can understand the timeline of changes**.

**Acceptance Criteria:**

**Given** I view the version history
**When** I look at each version entry
**Then** I see:
  - Version number (v1, v2, v3...)
  - Created timestamp in readable format (e.g., "Jan 18, 2026 2:30 PM")
  - On desktop, version timestamps are aligned
  - On mobile, version timestamps are clearly readable

**Given** I hover over a timestamp
**When** I mouse over it
**Then** a tooltip shows the relative time: "2 hours ago"

**Technical Notes:**
- Display versionNumber and createdAt in VersionHistory component
- Use date-fns for formatting
- Use Shadcn Tooltip for hover tooltips
- Make responsive for all screen sizes

---

### Story 5.4: View Previous Version (Read-Only)

As a **user**,
I want **to view any previous version of my idea**,
So that **I can see what my idea looked like at earlier stages**.

**Acceptance Criteria:**

**Given** I am viewing the version history
**When** I click on a previous version
**Then** that version's content is displayed
**And** I see a banner indicating: "You are viewing version 2 of 5"
**And** the content is read-only (no edit options)

**Given** I view a previous version
**When** I look at the phase outputs
**Then** I see exactly what was generated at that time
**And** the timestamp matches when the version was created

**Given** I want to return to the current version
**When** I click "View Current Version"
**Then** I return to the latest version with edit options

**Technical Notes:**
- Create GET /api/v1/ideas/:ideaId/versions/:versionNumber endpoint
- Fetch specific version from versions collection
- Display with read-only indicator
- Show version number/count badge

---

### Story 5.5: Compare What Changed Between Versions

As a **user tracking evolution**,
I want **to see what changed between two versions**,
So that **I can understand how my thinking evolved**.

**Acceptance Criteria:**

**Given** I am viewing the version history
**When** I select two versions to compare
**Then** a diff view shows:
  - Content that was added (highlighted in green)
  - Content that was removed (highlighted in red)
  - Content that stayed the same (normal)

**Given** I compare version 1 to version 3
**When** I view the diff
**Then** I can see:
  - What changed in idea description
  - What changed in each phase output
  - A summary of major changes

**Example:**
- Removed: "B2C marketplace"
- Added: "B2B SaaS for enterprises"

**Technical Notes:**
- Implement diff calculation algorithm or use diff-match-patch library
- Create ComparisonView component
- Display side-by-side or inline diff
- Highlight additions/removals
- Could be enhanced with word-level or line-level diffs

---

### Story 5.6: Mark Latest Version as Active

As a **system**,
I want **to always keep track of which version is current**,
So that **I can display the latest version to users**.

**Acceptance Criteria:**

**Given** a new version is created
**When** the version is saved
**Then** the isActive flag is set to true
**And** all previous versions have isActive set to false
**And** the dashboard and workspace always display the active version

**Given** I view an idea workspace
**When** I click on a previous version
**Then** the workspace shows that version
**And** when I navigate away and back, the active version is shown again

**Technical Notes:**
- Ensure only one version per idea has isActive=true
- Update isActive when new version is created
- Query where isActive=true to get current version
- Handle this in database operations, not frontend

---

## Epic 6: Section-Level Editing & Granular Refinement (DIFFERENTIATOR)

**Epic Goal:** Users can refine specific sections of their validation without losing other work or forcing full regeneration.

**Stories in this Epic:** 5

### Story 6.1: Select Specific Section for Editing

As a **user**,
I want **to select a specific section to refine**,
So that **I can make targeted improvements without affecting other sections**.

**Acceptance Criteria:**

**Given** I am viewing Phase outputs
**When** I look at the content
**Then** each section has an "Edit" button or icon
**And** clicking "Edit" on a section opens the edit interface for just that section

**Given** I view Phase 2 with sections: "Business Model", "Strategy", "Structural Risks", "Operational Risks"
**When** I click "Edit" on the Strategy section
**Then** only the Strategy section becomes editable
**And** other sections remain read-only

**Technical Notes:**
- Add Edit button to each section in phase content
- Use data attributes or React component state to track which section is selected
- Open edit interface for selected section only

---

### Story 6.2: Provide Edit Feedback/Instructions

As a **user refining my validation**,
I want **to provide feedback or instructions for how to improve a specific section**,
So that **I can guide the regeneration**.

**Acceptance Criteria:**

**Given** I click "Edit" on a section
**When** the edit interface opens
**Then** I see:
  - The current section content (read-only or pre-filled)
  - A text area where I can enter feedback or new instructions
  - A placeholder: "e.g., Change focus from SMB to enterprise market"
  - "Refine" and "Cancel" buttons

**Given** I enter feedback like "Emphasize customer retention over acquisition"
**When** I click "Refine"
**Then** my feedback is submitted to the API

**Technical Notes:**
- Create SectionEditor component
- Display section content and input field for feedback
- Use Shadcn Textarea for input
- Store feedback text for API request

---

### Story 6.3: Regenerate Only Selected Section

As a **user**,
I want **only the selected section to be regenerated based on my feedback**,
So that **I don't lose my refined work in other sections**.

**Acceptance Criteria:**

**Given** I submit feedback for a section
**When** I click "Refine"
**Then** a POST /api/v1/ideas/:ideaId/sections/[sectionName] request is made
**And** the system regenerates ONLY that section based on my feedback
**And** a loading indicator shows progress
**And** within 30 seconds, the new section content appears
**And** the section content is updated in place

**Given** I refine the "Strategy" section in Phase 2
**When** regeneration completes
**Then** Strategy is updated with my new direction
**And** Business Model remains unchanged
**And** Structural Risks remains unchanged
**And** Operational Risks remains unchanged

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/sections/:sectionName endpoint
- For MVP: Regenerate section content based on feedback using template
- Update only that section in new Version
- Return updated section content

---

### Story 6.4: Preserve All Non-Edited Sections

As a **system**,
I want **to preserve all sections that weren't edited**,
So that **users don't lose refined work when editing one section**.

**Acceptance Criteria:**

**Given** I edit and refine the "Strategy" section
**When** regeneration completes
**Then** the new version includes:
  - Old Business Model (unchanged)
  - NEW Strategy (refined)
  - Old Structural Risks (unchanged)
  - Old Operational Risks (unchanged)

**Given** I compare version 1 and version 2 (after section edit)
**When** I view the diff
**Then** I see ONLY the Strategy section has changed
**And** all other sections are identical

**Technical Notes:**
- When creating new version for section edit, copy all sections from previous version
- Update only the edited section
- New version should preserve all unmodified sections exactly

---

### Story 6.5: Edit Interface UI (Desktop/Mobile Responsive)

As a **user**,
I want **the edit interface to be intuitive and responsive**,
So that **I can comfortably edit sections on any device**.

**Acceptance Criteria:**

**Given** I open the section editor on desktop
**When** the edit interface appears
**Then** it opens as a side panel (right side)
**And** the main content remains visible for reference
**And** the panel is about 30-40% of screen width

**Given** I open the section editor on mobile
**When** the edit interface appears
**Then** it opens as a full-screen modal or drawer
**And** it's easy to read and use on a small screen
**And** navigation is clear (close, refine buttons at top)

**Given** I am editing a section
**When** I scroll the panel content
**Then** I can see both the current content and my feedback field
**And** the buttons remain accessible

**Technical Notes:**
- Create SectionEditor component with responsive design
- Use Shadcn Drawer for mobile (full-screen)
- Use Shadcn Sheet or side panel for desktop
- Implement responsive behavior with Tailwind breakpoints

---

## Epic 7: Cascade Invalidation & Phase Dependencies (DIFFERENTIATOR)

**Epic Goal:** Users see clear indication when downstream phases need updates due to changes, and can regenerate efficiently.

**Stories in this Epic:** 2

### Story 7.1: Implement Cascade Invalidation Logic

As a **system**,
I want **to track phase dependencies and mark downstream phases as invalidated**,
So that **users understand what needs regeneration after changes**.

**Acceptance Criteria:**

**Given** a user edits Phase 1 content
**When** the edit is saved
**Then** the system:
  - Updates Phase 1 in the new version
  - Sets idea.phaseStatus.phase2 to "invalidated"
  - Sets idea.phaseStatus.phase3 to "invalidated"
  - Preserves old Phase 2 & 3 content for reference

**Given** a user edits Phase 2 content
**When** the edit is saved
**Then** the system:
  - Updates Phase 2 in the new version
  - Sets idea.phaseStatus.phase3 to "invalidated"
  - Preserves old Phase 3 content

**Given** a user edits Phase 3 content
**When** the edit is saved
**Then** only Phase 3 is updated (no downstream phases)

**Technical Notes:**
- Implement cascade logic in generation service
- Update phaseStatus in idea document
- Define dependency chain: Phase1 → Phase2 → Phase3
- Update when ANY edit is made (not just generation)

---

### Story 7.2: Display Visual Invalidation Indicator

As a **user**,
I want **to see clear visual indication of which phases are invalidated**,
So that **I know what needs to be regenerated**.

**Acceptance Criteria:**

**Given** Phase 1 is edited and Phase 2 becomes invalidated
**When** I view the phase stepper
**Then** Phase 2 shows a "⚠️ Needs Regeneration" badge or similar
**And** Phase 3 also shows the same badge

**Given** I view an idea card on the dashboard
**When** phases are invalidated
**Then** the phase badge shows status clearly
**And** the color scheme indicates: ⚠️ Yellow/Amber for invalidated

**Example Badge States:**
- ✓ Complete (green)
- ● Active (blue)
- ○ Locked (gray)
- ⚠️ Invalidated (amber)

**Given** I click on an invalidated phase
**When** I open the section
**Then** I see a message: "This phase needs regeneration due to changes in Phase 1"
**And** a "Regenerate" button is available

**Technical Notes:**
- Update PhaseStepper component to show invalidation status
- Use different colors for invalidated phases
- Add badge icon (warning/refresh icon)
- Update IdeaCard badges to reflect invalidated state
- Show regenerate button when viewing invalidated phases

---

## Epic 8: Phase 2 - Business Model Development

**Epic Goal:** Users develop their business model, go-to-market strategy, and identify structural/operational risks.

**Stories in this Epic:** 8

### Story 8.1: Generate Business Model Description

As a **user developing my business model**,
I want **to receive a structured business model framework**,
So that **I can understand how my startup makes money and delivers value**.

**Acceptance Criteria:**

**Given** I have confirmed Phase 1
**When** I click "Generate Phase 2"
**Then** a POST /api/v1/ideas/:ideaId/generate/phase2 request is made
**And** the system generates Business Model content including:
  - Customer Segments (who are the users?)
  - Value Proposition (what problem do you solve?)
  - Revenue Streams (how do you make money?)
  - Cost Structure (major cost drivers)
  - Key Partnerships (who do you need?)
  - Key Resources (what do you need to operate?)

**Given** Phase 2 generation completes
**When** the results appear
**Then** I see the "Business Model" section within 30 seconds

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/generate/phase2 endpoint
- For MVP: Template-based generation using Phase 1 data
- Create new Version with phase2 data
- Store all business model elements

---

### Story 8.2: Generate Go-To-Market Strategy

As a **user planning market entry**,
I want **to receive a structured strategy for reaching customers**,
So that **I have a clear plan for customer acquisition and growth**.

**Acceptance Criteria:**

**Given** Phase 2 generation completes
**When** the results appear
**Then** I see the "Strategy" section including:
  - Customer Acquisition Strategy (how will you find customers?)
  - Pricing Strategy (how will you price?)
  - Growth Strategy (how will you scale?)
  - Key Milestones (what needs to happen?)

**Given** I review the strategy
**When** I read the content
**Then** it provides specific, actionable guidance
**And** it aligns with the Kill Assumption from Phase 1

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase2
- For MVP: Template with placeholders filled from Phase 1
- Include customer acquisition, pricing, growth elements
- Store in phase2.strategy

---

### Story 8.3: Identify Structural Risks

As a **founder** assessing business viability,
I want **to understand structural risks in my business model**,
So that **I can proactively plan mitigation strategies**.

**Acceptance Criteria:**

**Given** Phase 2 generation completes
**When** the results appear
**Then** I see the "Structural Risks" section listing:
  - Market-level risks (market changes, competition)
  - Business model risks (pricing viability, unit economics)
  - Scaling risks (how business breaks as you grow)
  - Dependency risks (over-reliance on partners/platforms)

**Given** I review structural risks
**When** I read the content
**Then** each risk is specific and includes implications

**Example Risk:**
"Marketplace Chicken-Egg Problem: Need both suppliers and customers simultaneously. Implications: High customer acquisition costs until critical mass is reached."

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase2
- Analyze business model for inherent risks
- Store in phase2.structuralRisks

---

### Story 8.4: Identify Operational Risks

As a **founder** preparing for execution,
I want **to understand operational challenges I'll face**,
So that **I can plan resources and timelines**.

**Acceptance Criteria:**

**Given** Phase 2 generation completes
**When** the results appear
**Then** I see the "Operational Risks" section listing:
  - Team risks (skills gaps, key person dependencies)
  - Resource risks (capital requirements, timeline)
  - Execution risks (complexity of product/service delivery)
  - Regulatory/compliance risks (licenses, regulations)

**Given** I review operational risks
**When** I read the content
**Then** each risk is specific to my business

**Example Risk:**
"Regulatory: Your service requires specific data privacy certifications (SOC2, HIPAA). Timeline: 6-9 months and $50K-100K investment needed before customer on boarding."

**Technical Notes:**
- Generate as part of POST /api/v1/ideas/:ideaId/generate/phase2
- Identify operational challenges and resource requirements
- Store in phase2.operationalRisks

---

### Story 8.5: View All Phase 2 Outputs

As a **user**,
I want **to see all Phase 2 outputs in one organized view**,
So that **I can review the complete business model analysis**.

**Acceptance Criteria:**

**Given** Phase 2 generation completes
**When** I view the Phase 2 section
**Then** I see all outputs organized:
  - Business Model (at top)
  - Strategy
  - Structural Risks
  - Operational Risks

**Given** I scroll through Phase 2 content
**When** all content is visible
**Then** the layout is clean and readable
**And** each section is clearly labeled
**And** Edit buttons are available for each section

**Technical Notes:**
- Create Phase2Content component
- Display all phase2 fields from current version
- Use card-based layout with Shadcn Card components
- Include Section Edit buttons for each section

---

### Story 8.6: Confirm/Lock Phase 2 to Proceed to Phase 3

As a **user**,
I want **to confirm that Phase 2 is complete and lock it before proceeding to Phase 3**,
So that **I can create a checkpoint in my validation**.

**Acceptance Criteria:**

**Given** I have reviewed Phase 2 outputs
**When** I click the "Confirm Phase 2" button
**Then** a POST /api/v1/ideas/:ideaId/confirm/phase2 request is made
**And** phase2.confirmedAt is set to current timestamp
**And** idea.phaseStatus.phase3 changes from "locked" to "pending"
**And** I see a success toast: "Phase 2 confirmed. Phase 3 is now available."
**And** the Phase 3 section becomes enabled

**Given** Phase 2 is confirmed
**When** I view the phase stepper
**Then** Phase 1 shows as ✓
**And** Phase 2 shows as ✓
**And** Phase 3 shows as ● (active/available)

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/confirm/phase2 endpoint
- Update idea.phaseStatus and version timestamps
- Verify phase2.confirmedAt is set only if all phase2 content is generated
- Return updated idea with new phase status

---

### Story 8.7: Download Phase 2 as PDF Report

As a **user**,
I want **to download Phase 2 outputs as a PDF**,
So that **I can share or print my business model analysis**.

**Acceptance Criteria:**

**Given** I have completed Phase 2
**When** I click the "Download PDF" button
**Then** a GET /api/v1/ideas/:ideaId/export/pdf?phase=2 request is made
**And** a PDF is generated containing:
  - Idea title
  - Business Model
  - Strategy
  - Structural Risks
  - Operational Risks
  - Generated date

**Given** the PDF download completes
**When** the file downloads
**Then** the filename is "Phase2-[IdeaTitle].pdf"
**And** the PDF is readable and well-formatted
**And** within 10 seconds

**Technical Notes:**
- Implement GET /api/v1/ideas/:ideaId/export/pdf?phase=2 endpoint
- Use jsPDF to generate PDF with phase2 content
- Return as downloadable file
- For MVP: Simple text-based PDF; enhance later

---

### Story 8.8: Handle Phase 2 Lock Until Phase 1 Confirmed

As a **system**,
I want **to prevent users from accessing Phase 2 until Phase 1 is confirmed**,
So that **the validation workflow follows the intended sequence**.

**Acceptance Criteria:**

**Given** Phase 1 is not yet confirmed
**When** I view the workspace
**Then** the Phase 2 section shows:
  - "Phase 2 is locked. Please complete and confirm Phase 1 first."
  - The "Generate Phase 2" button is disabled
  - Phase 2 content area is grayed out

**Given** I have confirmed Phase 1
**When** I view the workspace
**Then** Phase 2 becomes available
**And** the "Generate Phase 2" button is enabled
**And** I can proceed to generate Phase 2

**Technical Notes:**
- Check idea.phaseStatus.phase1 === "complete"
- Disable Phase 2 UI when phase1 not complete
- Frontend checks before enabling Phase 2 controls
- Backend validates on generation request

---

## Epic 9: Phase 3 - Investor Pitch Deck

**Epic Goal:** Users generate an investor-ready pitch deck with changelog showing their thinking evolution.

**Stories in this Epic:** 5

### Story 9.1: Generate Investor-Ready Pitch Deck Content

As a **fundraising founder**,
I want **to generate an investor-ready pitch deck**,
So that **I can present my startup idea professionally to investors**.

**Acceptance Criteria:**

**Given** I have confirmed Phase 2
**When** I click "Generate Phase 3"
**Then** a POST /api/v1/ideas/:ideaId/generate/phase3 request is made
**And** the system generates investor-ready content including:
  - Problem Statement (what problem do you solve?)
  - Your Solution (how does your product/service solve it?)
  - Market Opportunity (TAM, SAM, SOM)
  - Business Model (how do you make money?)
  - Traction/Progress (what have you accomplished?)
  - Competition & Differentiation
  - Go-To-Market Strategy
  - Financial Projections (if applicable)
  - Team & Resources
  - Ask (what funding are you seeking?)

**Given** Phase 3 generation completes
**When** the results appear
**Then** I see the "Pitch Deck" section within 30 seconds
**And** the content is formatted as investor-facing narrative

**Technical Notes:**
- Implement POST /api/v1/ideas/:ideaId/generate/phase3 endpoint
- For MVP: Template-based generation using Phase 1 & 2 data
- Create new Version with phase3 data
- Store complete pitch deck content

---

### Story 9.2: Generate "What Changed" Changelog

As a **founder tracking iteration**,
I want **to see what changed from my previous version**,
So that **I can demonstrate my strategic thinking evolution**.

**Acceptance Criteria:**

**Given** Phase 3 generation completes
**When** I view the Phase 3 section
**Then** I see a "What Changed" section at the bottom
**And** it shows:
  - Key changes from previous version
  - Strategic pivots made
  - New insights incorporated
  - Assumptions refined

**Example Changelog:**
- "Shifted focus from B2C to B2B SaaS"
- "Revised market size estimate from $100M to $500M TAM"
- "Changed pricing from subscription to usage-based"
- "Added partnership strategy with enterprise software vendors"

**Given** I view the changelog
**When** I read it
**Then** it clearly shows my strategic evolution

**Technical Notes:**
- Calculate diff from previous version's phase3
- Compare key fields and summarize changes
- Store changelog text in phase3.whatChanged
- Display as narrative or bullet points

---

### Story 9.3: View All Phase 3 Outputs (Pitch Deck Content)

As a **user**,
I want **to see the complete pitch deck content**,
So that **I can review it before downloading or presenting**.

**Acceptance Criteria:**

**Given** Phase 3 generation completes
**When** I view the Phase 3 section
**Then** I see all pitch deck content organized as:
  - Problem → Solution → Market → Business Model
  - Traction → Competition → Strategy
  - Financials → Team → Ask
  - What Changed (changelog)

**Given** I scroll through Phase 3 content
**When** all content is visible
**Then** the layout reads like a narrative story
**And** each section flows logically
**And** Edit buttons are available for each section

**Technical Notes:**
- Create Phase3Content component
- Display all phase3 content in narrative order
- Use card or section-based layout
- Include Section Edit buttons

---

### Story 9.4: Download Phase 3 as Presentation-Quality PDF

As a **fundraising founder**,
I want **to download Phase 3 as a professional PDF**,
So that **I can send to investors or present in meetings**.

**Acceptance Criteria:**

**Given** I have completed Phase 3
**When** I click the "Download PDF" button
**Then** a GET /api/v1/ideas/:ideaId/export/pdf?phase=3 request is made
**And** a PDF is generated that looks professional and investor-ready
**And** the PDF includes all Phase 3 content
**And** the formatting is optimized for printing/sharing

**Given** the PDF download completes
**When** the file downloads
**Then** the filename is "PitchDeck-[IdeaTitle].pdf"
**And** the PDF is readable and well-formatted
**And** within 10 seconds

**Technical Notes:**
- Implement GET /api/v1/ideas/:ideaId/export/pdf?phase=3 endpoint
- Generate PDF with professional styling
- Consider using a PDF library that supports better formatting (html2pdf, pdfkit with templates)
- Return as downloadable file

---

### Story 9.5: Handle Phase 3 Lock Until Phase 2 Confirmed

As a **system**,
I want **to prevent users from accessing Phase 3 until Phase 2 is confirmed**,
So that **the validation workflow follows the intended sequence**.

**Acceptance Criteria:**

**Given** Phase 2 is not yet confirmed
**When** I view the workspace
**Then** the Phase 3 section shows:
  - "Phase 3 is locked. Please complete and confirm Phase 2 first."
  - The "Generate Phase 3" button is disabled
  - Phase 3 content area is grayed out

**Given** I have confirmed Phase 2
**When** I view the workspace
**Then** Phase 3 becomes available
**And** the "Generate Phase 3" button is enabled
**And** I can proceed to generate Phase 3

**Technical Notes:**
- Check idea.phaseStatus.phase2 === "complete"
- Disable Phase 3 UI when phase2 not complete
- Frontend checks before enabling Phase 3 controls
- Backend validates on generation request

---

## Epic 10: Advanced Search, Filters & Organization

**Epic Goal:** Users can efficiently search, filter, and organize large numbers of ideas for power-user workflows.

**Stories in this Epic:** 2

### Story 10.1: Search Ideas by Title and Content (Advanced)

As a **power user with many ideas**,
I want **to search ideas with advanced capabilities**,
So that **I can find specific ideas quickly even with a large portfolio**.

**Acceptance Criteria:**

**Given** I have many ideas in my dashboard
**When** I type in the search box
**Then** ideas are filtered in real-time as I type
**And** results match the search term in title OR description
**And** the search is case-insensitive

**Given** I search for "AI"
**When** the results load
**Then** all ideas with "AI" in the title or description are shown
**And** matching text is highlighted in the results

**Given** my search returns no results
**When** I view the filtered list
**Then** I see: "No ideas match 'AI'"
**And** I can see recent searches or suggestions

**Given** I clear the search box
**When** I delete the search term
**Then** all ideas are shown again

**Given** I perform multiple searches
**When** I pause typing
**Then** the search completes within 500ms (responsive)

**Technical Notes:**
- Implement client-side search on fetched ideas
- Use case-insensitive matching
- Search both title and description fields
- For large datasets, implement backend search endpoint
- Use search history/suggestions for better UX

---

### Story 10.2: Filter and Combine Filters

As a **organized power user**,
I want **to combine multiple filters to find ideas**,
So that **I can focus on specific subsets efficiently**.

**Acceptance Criteria:**

**Given** I am on the dashboard
**When** I see the filter options
**Then** I can apply multiple filters simultaneously:
  - By Status (In Progress, Completed, Archived)
  - By Phase (Phase 1 only, Phases 1-2, All 3 phases)
  - By Time (Last week, Last month, Last quarter)

**Given** I select "Status: Completed" AND "Phase: Phase 3"
**When** the filter is applied
**Then** only ideas that are completed (phase3 confirmed) are shown

**Given** I add a time filter "Last week"
**When** the combined filter is applied
**Then** only ideas completed in the last 7 days are shown

**Given** I apply filters
**When** I view the results
**Then** the active filters are visible as chips/tags
**And** I can click to remove individual filters
**And** I can "Clear all" filters

**Given** I have filter combinations I use regularly
**When** I configure them
**Then** I can save the filter combination as a "view" (e.g., "Active Phase 2 Ideas")
**And** I can quickly switch between saved views

**Technical Notes:**
- Create filter UI with checkboxes/select dropdowns
- Store filter state in component state and URL params
- Implement multi-filter logic on frontend
- For MVP: Basic filters (status, phase); enhance later with saved views
- Use Shadcn UI components (Checkbox, Select, Badge) for filters

---

# Final Document Status

**Document Completion:** In Progress
**Frontmatter will be updated to:** `stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']`

**Statistics:**
- 10 Epics: ✅ All designed and approved
- 65+ Stories: ✅ All generated with acceptance criteria
- 70 FRs Coverage: ✅ 100% - All FRs assigned to stories
- Acceptance Criteria: ✅ All stories have specific, testable Given/When/Then format

This epic and story breakdown provides a complete, implementation-ready specification for all 65+ stories across 10 epics, fully aligned with the 70 functional requirements and architectural decisions.

---

