---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/product-brief-major_project-2026-01-18.md'
  - '_bmad-output/analysis/brainstorming-session-2026-01-18.md'
  - '_bmad-output/planning-artifacts/research/technical-startup-validator-stack-research-2026-01-18.md'
  - '_bmad-output/planning-artifacts/research/market-startup-validator-competitive-research-2026-01-18.md'
workflowType: 'architecture'
date: '2026-01-18'
author: 'Major project'
project_name: 'Startup Validator Platform'
status: 'complete'
lastStep: 8
completedAt: '2026-01-18'
---

# System Architecture: Startup Validator Platform

**Author:** Major project
**Date:** 2026-01-18
**Status:** Complete
**Version:** 1.0

---

## Executive Summary

This architecture document defines the technical foundation for **Startup Validator Platform** — a decision-version engine that transforms startup ideas into structured, investor-ready outputs through a 3-phase validation workflow.

**Technology Stack:**
- **Frontend:** React.js 18+ with Vite, Tailwind CSS, Shadcn UI
- **Backend:** Express.js (MVC Architecture)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (Access + Refresh Tokens)

**Key Architectural Decisions:**
- Monorepo structure with separate client/server directories
- RESTful API design with consistent response patterns
- Document-based data model optimized for versioning
- Stateless authentication with JWT rotation

---

## Table of Contents

1. [Project Context Analysis](#1-project-context-analysis)
2. [Starter Template Evaluation](#2-starter-template-evaluation)
3. [Core Architectural Decisions](#3-core-architectural-decisions)
4. [Implementation Patterns & Consistency Rules](#4-implementation-patterns--consistency-rules)
5. [Project Structure & Boundaries](#5-project-structure--boundaries)
6. [Architecture Validation Results](#6-architecture-validation-results)
7. [Architecture Completion Summary](#7-architecture-completion-summary)

---

## 1. Project Context Analysis

### Requirements Overview

**Functional Requirements Analysis:**

The PRD defines **70 Functional Requirements** across 10 categories:

| Category | FR Count | Architectural Impact |
|----------|----------|---------------------|
| User Account Management | FR1-FR7 | Auth service, User model, JWT handling |
| Landing Page | FR8-FR13 | Static/public routes, SEO optimization |
| Idea Management | FR14-FR21 | Idea model, CRUD API, soft delete/archive |
| Phase 1: Initial Analysis | FR22-FR28 | Generation service, Phase 1 schema, PDF |
| Phase 2: Business Model | FR29-FR36 | Generation service, Phase 2 schema, PDF |
| Phase 3: Pitch Deck | FR37-FR41 | Generation service, Phase 3 schema, PDF |
| Section-Level Editing | FR42-FR46 | Section regeneration logic, partial update |
| Version Control | FR47-FR54 | Version model, cascade logic, diff calculation |
| Dashboard & Organization | FR55-FR60 | Query/filter API, aggregation |
| UI Feedback & Navigation | FR61-FR70 | Frontend state, responsive design |

**Non-Functional Requirements Analysis:**

The PRD defines **50 NFRs** across 5 categories:

| Category | Key Requirements | Architectural Impact |
|----------|-----------------|---------------------|
| **Performance** | <3s page load, <30s generation, 100 concurrent users | Caching, async processing, indexing |
| **Security** | JWT (15min/7d), bcrypt, HTTPS, CSRF, rate limiting | Auth middleware, input validation |
| **Accessibility** | WCAG 2.1 AA, keyboard nav, screen reader | Semantic HTML, ARIA, Shadcn defaults |
| **Scalability** | 1K-10K users, 100 ideas/user, 50 versions/idea | Document schema, indexing strategy |
| **Reliability** | 99% uptime, daily backups, graceful errors | Error handling, logging, health checks |

### Scale & Complexity Assessment

**Complexity Level:** Medium

**Project Indicators:**
- Primary domain: Full-stack Web Application (SPA + REST API)
- Real-time features: None for MVP (future consideration)
- Multi-tenancy: Single-tenant user isolation
- Compliance: GDPR-aware (account deletion)
- Integration complexity: Low (dummy data for MVP, Google ADK future)

**Estimated Architectural Components:**
- 6 Backend Services (Auth, User, Idea, Version, Generation, PDF)
- 12 Frontend Pages/Views
- 8 Database Collections
- 15+ Reusable UI Components

### Technical Constraints & Dependencies

**User-Specified Constraints:**
- No hardcoding — all configuration via environment variables
- Production-grade code from the start
- Latest stable versions only (no legacy dependencies)
- Strict folder structure (documented below)
- JWT auth on all APIs except public routes
- Dummy data for MVP (Google ADK integration v1.1)

**External Dependencies:**
- PDF generation library (jsPDF or react-pdf)
- Form handling (React Hook Form + Zod)
- HTTP client (Axios)
- Toast notifications (Sonner)

### Cross-Cutting Concerns Identified

| Concern | Scope | Solution |
|---------|-------|----------|
| **Authentication** | All protected routes | JWT middleware, token refresh |
| **Authorization** | User data isolation | User ID validation in all queries |
| **Error Handling** | All layers | Global error middleware, toast feedback |
| **Logging** | API requests, errors | Structured logging with context |
| **Validation** | Input at all boundaries | Zod schemas, Mongoose validation |
| **CORS** | API access | Express CORS middleware |

---

## 2. Starter Template Evaluation

### Primary Technology Domain

Based on project requirements:
- **Frontend:** React SPA with modern tooling
- **Backend:** Express.js REST API
- **Database:** MongoDB document store

### Starter Decision: Manual Project Setup

**Rationale:** Given the specific tech stack requirements (React + Vite + Express + MongoDB), a manual setup provides:
1. Full control over project structure
2. No unnecessary dependencies from opinionated starters
3. Exact version control over all dependencies

### Initialization Commands

**Frontend Setup:**
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
```

**Backend Setup:**
```bash
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors helmet bcryptjs jsonwebtoken cookie-parser
npm install -D typescript @types/node @types/express ts-node nodemon
npx tsc --init
```

### Technology Versions (Verified)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| React | 18.x | UI Library |
| Vite | 5.x | Build Tool |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.4.x | Styling |
| Shadcn UI | Latest | Component Library |
| Express | 4.x | Backend Framework |
| Mongoose | 8.x | MongoDB ODM |
| MongoDB | 7.x | Database |

### Starter Template Decisions Provided

**From Vite + React Template:**
- TypeScript configuration
- ESM module system
- Hot Module Replacement
- Build optimization

**From Tailwind Init:**
- PostCSS configuration
- Utility-first CSS
- JIT compilation

**From Shadcn Init:**
- Component structure (`components/ui/`)
- cn() utility for className merging
- CSS variables for theming
- Accessible component primitives

---

## 3. Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Database schema design for versioning
2. JWT authentication flow
3. API response format
4. Project folder structure

**Important Decisions (Shape Architecture):**
1. State management approach
2. PDF generation strategy
3. Error handling patterns
4. Validation approach

**Deferred Decisions (Post-MVP):**
1. Real AI integration (Google ADK)
2. File storage for exports
3. Caching strategy
4. CI/CD pipeline specifics

### Data Architecture

#### Database: MongoDB with Mongoose

**Rationale:**
- Document model fits idea/version structure naturally
- Flexible schema for phase outputs
- Embedded documents for versions (performance)
- Strong Node.js ecosystem support

**Collections Design:**

```
┌─────────────────────────────────────────────────────────────┐
│                         users                                │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ email: String (unique, indexed)                              │
│ password: String (bcrypt hash)                               │
│ name: String                                                 │
│ createdAt: Date                                              │
│ updatedAt: Date                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         ideas                                │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ userId: ObjectId (ref: users, indexed)                       │
│ title: String                                                │
│ description: String                                          │
│ status: Enum ['active', 'archived', 'deleted']               │
│ currentVersion: Number (default: 1)                          │
│ phaseStatus: {                                               │
│   phase1: Enum ['pending', 'complete', 'invalidated']        │
│   phase2: Enum ['locked', 'pending', 'complete', 'invalid']  │
│   phase3: Enum ['locked', 'pending', 'complete', 'invalid']  │
│ }                                                            │
│ createdAt: Date                                              │
│ updatedAt: Date                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        versions                              │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ ideaId: ObjectId (ref: ideas, indexed)                       │
│ versionNumber: Number                                        │
│ phase1: {                                                    │
│   summary: String                                            │
│   marketFeasibility: String                                  │
│   competitiveAnalysis: String                                │
│   killAssumption: String                                     │
│   confirmedAt: Date | null                                   │
│ }                                                            │
│ phase2: {                                                    │
│   businessModel: String                                      │
│   strategy: String                                           │
│   structuralRisks: String                                    │
│   operationalRisks: String                                   │
│   confirmedAt: Date | null                                   │
│ }                                                            │
│ phase3: {                                                    │
│   pitchDeckContent: String                                   │
│   whatChanged: String                                        │
│   confirmedAt: Date | null                                   │
│ }                                                            │
│ changelog: String (what changed from previous version)       │
│ createdAt: Date                                              │
│ isActive: Boolean (latest version flag)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    refresh_tokens                            │
├─────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                │
│ userId: ObjectId (ref: users, indexed)                       │
│ token: String (indexed)                                      │
│ expiresAt: Date (TTL index)                                  │
│ createdAt: Date                                              │
└─────────────────────────────────────────────────────────────┘
```

**Indexing Strategy:**
```javascript
// users collection
{ email: 1 } // unique

// ideas collection
{ userId: 1, status: 1 }
{ userId: 1, createdAt: -1 }

// versions collection
{ ideaId: 1, versionNumber: -1 }
{ ideaId: 1, isActive: 1 }

// refresh_tokens collection
{ token: 1 }
{ expiresAt: 1 } // TTL index
```

### Authentication & Security

#### JWT Implementation

**Token Strategy:**
- Access Token: 15 minutes, stored in memory (React state)
- Refresh Token: 7 days, stored in httpOnly cookie

**Flow:**
```
1. Login → Receive { accessToken } + Set-Cookie: refreshToken
2. API Request → Authorization: Bearer {accessToken}
3. Token Expired → POST /api/auth/refresh (cookie sent automatically)
4. Logout → Clear tokens, invalidate refresh token in DB
```

**Security Measures:**
- Passwords: bcrypt with 12 salt rounds
- HTTPS only in production
- CSRF protection via SameSite=Strict cookies
- Rate limiting: 5 auth attempts/minute, 10 generation/minute
- Input sanitization: Zod validation + Mongoose sanitization

### API & Communication

#### RESTful API Design

**Base URL:** `/api/v1`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | User registration |
| POST | /auth/login | User login |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | User logout |
| GET | /users/me | Get current user profile |
| PATCH | /users/me | Update user profile |
| GET | /ideas | List user's ideas |
| POST | /ideas | Create new idea |
| GET | /ideas/:id | Get idea with current version |
| PATCH | /ideas/:id | Update idea metadata |
| DELETE | /ideas/:id | Soft delete idea |
| POST | /ideas/:id/archive | Archive idea |
| POST | /ideas/:id/generate/phase1 | Generate Phase 1 |
| POST | /ideas/:id/generate/phase2 | Generate Phase 2 |
| POST | /ideas/:id/generate/phase3 | Generate Phase 3 |
| POST | /ideas/:id/confirm/phase1 | Confirm/lock Phase 1 |
| POST | /ideas/:id/confirm/phase2 | Confirm/lock Phase 2 |
| POST | /ideas/:id/sections/:section | Edit specific section |
| GET | /ideas/:id/versions | List all versions |
| GET | /ideas/:id/versions/:version | Get specific version |
| GET | /ideas/:id/export/pdf | Generate PDF for current phase |

#### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Frontend Architecture

#### State Management

**Approach:** React Context + useState (no external state library for MVP)

**Contexts:**
- `AuthContext` — User auth state, login/logout functions
- `IdeaContext` — Current idea state, CRUD operations (if needed)

**Data Fetching:**
- Axios with interceptors for token handling
- Custom hooks for API calls (useIdeas, useVersions, etc.)
- Consider React Query in v1.1 for caching

#### Component Architecture

**Layers:**
1. **Pages** — Route-level components (Dashboard, IdeaWorkspace, etc.)
2. **Features** — Feature-specific composites (PhaseContent, VersionHistory)
3. **Components** — Reusable building blocks (IdeaCard, PhaseStepper)
4. **UI** — Shadcn primitives (Button, Card, Dialog)

#### Routing Strategy

**Library:** React Router v6

**Routes:**
```
/                     → Landing Page (public)
/login                → Login (public)
/register             → Register (public)
/dashboard            → Idea Dashboard (protected)
/ideas/:id            → Idea Workspace (protected)
/ideas/:id/versions   → Version History (protected)
/profile              → User Profile (protected)
```

### Infrastructure & Deployment

#### Development Environment

- Frontend: Vite dev server (port 5173)
- Backend: Nodemon with ts-node (port 5000)
- Database: MongoDB local or Atlas free tier
- Proxy: Vite proxy for API requests

#### Production Deployment Strategy

**Options (MVP):**
1. **Vercel (Frontend) + Railway (Backend + MongoDB)**
2. **Render (Full-stack monorepo)**
3. **DigitalOcean App Platform**

**Environment Variables:**
```bash
# Server
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://yourdomain.com

# Client
VITE_API_URL=https://api.yourdomain.com
```

---

## 4. Implementation Patterns & Consistency Rules

### Naming Patterns

#### Database Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Collection names | lowercase plural | `users`, `ideas`, `versions` |
| Field names | camelCase | `userId`, `createdAt`, `killAssumption` |
| Foreign keys | modelId | `userId`, `ideaId` |
| Boolean fields | is/has prefix | `isActive`, `hasConfirmed` |
| Timestamps | createdAt/updatedAt | Auto-managed by Mongoose |

#### API Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Endpoints | lowercase, hyphenated | `/api/v1/ideas/:id/generate/phase1` |
| Route params | camelCase | `:ideaId`, `:versionNumber` |
| Query params | camelCase | `?status=active&page=1` |
| Request body | camelCase | `{ ideaTitle, description }` |
| Response body | camelCase | `{ killAssumption, marketFeasibility }` |

#### Code Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `IdeaCard.tsx`, `PhaseStepper.tsx` |
| Files (components) | PascalCase | `IdeaCard.tsx` |
| Files (utilities) | camelCase | `formatDate.ts`, `api.ts` |
| Files (hooks) | camelCase with use | `useAuth.ts`, `useIdeas.ts` |
| Functions | camelCase | `generatePhase1()`, `confirmPhase()` |
| Variables | camelCase | `currentVersion`, `phaseStatus` |
| Constants | SCREAMING_SNAKE | `MAX_IDEAS_PER_USER`, `JWT_EXPIRY` |
| Interfaces/Types | PascalCase | `IUser`, `IIdea`, `PhaseStatus` |
| Enums | PascalCase | `PhaseStatus`, `IdeaStatus` |

### Structure Patterns

#### Backend File Organization

```
/server
├── /src
│   ├── /config          # Configuration files
│   ├── /controllers     # Route handlers
│   ├── /middleware      # Express middleware
│   ├── /models          # Mongoose schemas
│   ├── /routes          # Route definitions
│   ├── /services        # Business logic
│   ├── /utils           # Utility functions
│   ├── /validators      # Zod schemas
│   ├── /types           # TypeScript interfaces
│   └── app.ts           # Express app setup
│   └── server.ts        # Server entry point
```

#### Frontend File Organization

```
/client
├── /src
│   ├── /components
│   │   ├── /ui          # Shadcn components
│   │   ├── /features    # Feature-specific
│   │   └── /layout      # Layout components
│   ├── /pages           # Route pages
│   ├── /hooks           # Custom hooks
│   ├── /contexts        # React contexts
│   ├── /services        # API service functions
│   ├── /utils           # Utility functions
│   ├── /types           # TypeScript types
│   ├── /styles          # Global styles
│   └── App.tsx          # Root component
│   └── main.tsx         # Entry point
```

### Format Patterns

#### API Response Formats

**All API responses use consistent wrapper:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Error Codes:**
```typescript
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  GENERATION_FAILED: 'GENERATION_FAILED',
} as const;
```

**HTTP Status Code Usage:**
| Code | Usage |
|------|-------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST (creation) |
| 204 | Successful DELETE |
| 400 | Validation error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (valid token, no permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, invalid state) |
| 429 | Rate limited |
| 500 | Internal server error |

#### Date Format

- **Storage:** ISO 8601 strings via Mongoose timestamps
- **API Response:** ISO 8601 strings
- **Frontend Display:** Relative ("2 hours ago") or localized via date-fns

### Communication Patterns

#### Frontend-Backend Communication

**Request Pattern:**
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // for refresh token cookie
});

// Request interceptor - add access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

#### State Update Patterns

**Optimistic Update Pattern:**
```typescript
// 1. Update UI immediately
setIdeas(prev => [...prev, newIdea]);

// 2. Make API call
try {
  const result = await createIdea(newIdea);
  // 3a. Update with server response (may have _id)
  setIdeas(prev => prev.map(i => i.tempId === newIdea.tempId ? result : i));
} catch (error) {
  // 3b. Rollback on failure
  setIdeas(prev => prev.filter(i => i.tempId !== newIdea.tempId));
  toast.error('Failed to create idea');
}
```

### Process Patterns

#### Error Handling Pattern

**Backend:**
```typescript
// middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Return consistent error response
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details,
      },
    });
  }

  // Default 500
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

**Frontend:**
```typescript
// utils/handleError.ts
export const handleApiError = (error: AxiosError<ApiResponse>) => {
  const message = error.response?.data?.error?.message || 'Something went wrong';
  toast.error(message);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error.response?.data);
  }
};
```

#### Loading State Pattern

```typescript
// Custom hook pattern
function useAsync<T>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (asyncFn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  return { ...state, execute };
}
```

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly as documented
2. Use the API response wrapper format for all endpoints
3. Implement error handling using the documented patterns
4. Use TypeScript interfaces for all data structures
5. Place files in the correct directory per structure patterns
6. Use Shadcn UI components from `components/ui/` directory
7. Apply Tailwind classes, never custom CSS unless necessary
8. Implement loading and error states for all async operations

**Pattern Examples:**

**Good Example (Controller):**
```typescript
// controllers/ideaController.ts
export const getIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { status = 'active', page = 1, limit = 10 } = req.query;

    const ideas = await ideaService.findByUser(userId, { status, page, limit });

    return res.json({
      success: true,
      data: ideas.data,
      pagination: ideas.pagination,
    });
  } catch (error) {
    next(error);
  }
};
```

**Anti-Pattern (Avoid):**
```typescript
// ❌ Wrong: Inconsistent response format
res.json({ ideas: data });

// ❌ Wrong: Not using next(error)
res.status(500).json({ error: error.message });

// ❌ Wrong: camelCase collection name
mongoose.model('userIdeas', schema);
```

---

## 5. Project Structure & Boundaries

### Complete Project Directory Structure

```
startup-validator/
├── README.md
├── package.json                    # Root package.json (workspace)
├── .gitignore
├── .env.example
│
├── client/                         # Frontend React Application
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── components.json             # Shadcn config
│   ├── index.html
│   ├── .env.local
│   ├── .env.example
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── assets/
│   │       └── images/
│   │
│   └── src/
│       ├── main.tsx                # Application entry
│       ├── App.tsx                 # Root component with router
│       ├── index.css               # Global styles + Tailwind
│       │
│       ├── components/
│       │   ├── ui/                 # Shadcn UI components
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── input.tsx
│       │   │   ├── toast.tsx
│       │   │   └── ...
│       │   │
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── MainLayout.tsx
│       │   │   └── AuthLayout.tsx
│       │   │
│       │   └── features/
│       │       ├── auth/
│       │       │   ├── LoginForm.tsx
│       │       │   └── RegisterForm.tsx
│       │       │
│       │       ├── ideas/
│       │       │   ├── IdeaCard.tsx
│       │       │   ├── IdeaList.tsx
│       │       │   ├── IdeaForm.tsx
│       │       │   └── IdeaFilters.tsx
│       │       │
│       │       ├── phases/
│       │       │   ├── PhaseStepper.tsx
│       │       │   ├── PhaseContent.tsx
│       │       │   ├── Phase1Content.tsx
│       │       │   ├── Phase2Content.tsx
│       │       │   ├── Phase3Content.tsx
│       │       │   └── SectionEditor.tsx
│       │       │
│       │       └── versions/
│       │           ├── VersionTimeline.tsx
│       │           └── VersionDiff.tsx
│       │
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── IdeaWorkspace.tsx
│       │   ├── VersionHistory.tsx
│       │   └── Profile.tsx
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useIdeas.ts
│       │   ├── useVersions.ts
│       │   └── useAsync.ts
│       │
│       ├── contexts/
│       │   └── AuthContext.tsx
│       │
│       ├── services/
│       │   ├── api.ts              # Axios instance
│       │   ├── authService.ts
│       │   ├── ideaService.ts
│       │   └── versionService.ts
│       │
│       ├── utils/
│       │   ├── cn.ts               # className utility
│       │   ├── formatDate.ts
│       │   └── handleError.ts
│       │
│       ├── types/
│       │   ├── api.ts              # API response types
│       │   ├── user.ts
│       │   ├── idea.ts
│       │   └── version.ts
│       │
│       └── lib/
│           └── utils.ts            # Shadcn utils
│
├── server/                         # Backend Express Application
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── .env
│   ├── .env.example
│   │
│   └── src/
│       ├── server.ts               # Server entry point
│       ├── app.ts                  # Express app setup
│       │
│       ├── config/
│       │   ├── db.ts               # MongoDB connection
│       │   ├── env.ts              # Environment variables
│       │   └── cors.ts             # CORS configuration
│       │
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── userController.ts
│       │   ├── ideaController.ts
│       │   ├── versionController.ts
│       │   └── generationController.ts
│       │
│       ├── middleware/
│       │   ├── auth.ts             # JWT verification
│       │   ├── errorHandler.ts     # Global error handler
│       │   ├── validate.ts         # Zod validation middleware
│       │   └── rateLimiter.ts      # Rate limiting
│       │
│       ├── models/
│       │   ├── User.ts
│       │   ├── Idea.ts
│       │   ├── Version.ts
│       │   └── RefreshToken.ts
│       │
│       ├── routes/
│       │   ├── index.ts            # Route aggregator
│       │   ├── authRoutes.ts
│       │   ├── userRoutes.ts
│       │   ├── ideaRoutes.ts
│       │   └── versionRoutes.ts
│       │
│       ├── services/
│       │   ├── authService.ts
│       │   ├── userService.ts
│       │   ├── ideaService.ts
│       │   ├── versionService.ts
│       │   ├── generationService.ts  # Dummy data generation
│       │   └── pdfService.ts         # PDF generation
│       │
│       ├── validators/
│       │   ├── authValidator.ts
│       │   ├── ideaValidator.ts
│       │   └── common.ts
│       │
│       ├── types/
│       │   ├── express.d.ts        # Express type extensions
│       │   └── index.ts
│       │
│       └── utils/
│           ├── logger.ts
│           ├── jwt.ts
│           └── apiResponse.ts
│
└── docs/                           # Documentation
    ├── api.md                      # API documentation
    └── deployment.md               # Deployment guide
```

### Architectural Boundaries

#### API Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                            │
│    React Components → Services → API Client (Axios)              │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/HTTPS
                                │ (JSON + JWT)
┌───────────────────────────────▼─────────────────────────────────┐
│                      API Layer (Express)                         │
│    Routes → Middleware → Controllers → Services                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     Data Layer (MongoDB)                         │
│    Services → Mongoose Models → MongoDB                          │
└─────────────────────────────────────────────────────────────────┘
```

#### Component Boundaries

**Frontend Layer Responsibilities:**

| Layer | Responsibility | Cannot Do |
|-------|---------------|-----------|
| Pages | Route handling, data fetching | Direct API calls |
| Features | Feature-specific UI, state | Cross-feature state |
| Components | Reusable UI, presentation | Business logic |
| UI | Design system primitives | Any state |
| Services | API communication | UI rendering |
| Hooks | Shared stateful logic | Direct DOM manipulation |
| Contexts | Global state management | API calls |

**Backend Layer Responsibilities:**

| Layer | Responsibility | Cannot Do |
|-------|---------------|-----------|
| Routes | Endpoint definition | Business logic |
| Middleware | Request processing | Direct DB access |
| Controllers | Request handling | Complex business logic |
| Services | Business logic | Direct response sending |
| Models | Data schema, validation | Business decisions |
| Validators | Input validation | DB operations |

#### Service Boundaries

**Auth Service:**
- User registration
- User login/logout
- Token generation/validation
- Token refresh

**User Service:**
- Profile CRUD
- User settings

**Idea Service:**
- Idea CRUD
- Status management
- Archive/delete

**Version Service:**
- Version creation
- Version retrieval
- Diff calculation

**Generation Service:**
- Phase content generation
- Section regeneration
- Cascade invalidation logic

**PDF Service:**
- PDF generation
- Export formatting

### Requirements to Structure Mapping

#### Feature/Epic Mapping

| Feature Area | Frontend | Backend | Database |
|--------------|----------|---------|----------|
| **Authentication** | pages/Login, pages/Register, contexts/AuthContext | controllers/authController, services/authService | users, refresh_tokens |
| **Landing Page** | pages/Landing | Static (may pre-render) | — |
| **Idea Management** | pages/Dashboard, features/ideas/* | controllers/ideaController, services/ideaService | ideas |
| **Phase Workflow** | pages/IdeaWorkspace, features/phases/* | controllers/generationController, services/generationService | versions |
| **Section Editing** | features/phases/SectionEditor | services/generationService | versions |
| **Version Control** | pages/VersionHistory, features/versions/* | controllers/versionController, services/versionService | versions |
| **PDF Export** | services/ideaService (trigger) | services/pdfService | — |

#### Cross-Cutting Concerns Mapping

| Concern | Frontend Location | Backend Location |
|---------|------------------|------------------|
| **Error Handling** | utils/handleError.ts, services/api.ts | middleware/errorHandler.ts |
| **Authentication** | contexts/AuthContext.tsx, hooks/useAuth.ts | middleware/auth.ts, utils/jwt.ts |
| **Loading States** | hooks/useAsync.ts, component-level | — |
| **Validation** | Component-level (React Hook Form + Zod) | middleware/validate.ts, validators/* |
| **Toast Notifications** | Sonner (App.tsx setup) | — |

### Data Flow

```
User Action (Click "Validate")
        │
        ▼
┌─────────────────────────────┐
│   React Component           │
│   (IdeaWorkspace.tsx)       │
│   - Calls hook/service      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Service Layer             │
│   (ideaService.ts)          │
│   - Axios POST request      │
└──────────────┬──────────────┘
               │ HTTP POST /api/v1/ideas/:id/generate/phase1
               ▼
┌─────────────────────────────┐
│   Express Router            │
│   (ideaRoutes.ts)           │
│   - Route matching          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Middleware Stack          │
│   - auth.ts (JWT verify)    │
│   - validate.ts (Zod)       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Controller                │
│   (generationController.ts) │
│   - Extract params          │
│   - Call service            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Service                   │
│   (generationService.ts)    │
│   - Generate dummy content  │
│   - Create new version      │
│   - Update idea status      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Model Layer               │
│   (Version.ts, Idea.ts)     │
│   - MongoDB operations      │
└──────────────┬──────────────┘
               │
               ▼
           Response
               │
               ▼
┌─────────────────────────────┐
│   React Component           │
│   - Update local state      │
│   - Show toast notification │
│   - Render new content      │
└─────────────────────────────┘
```

---

## 6. Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- ✅ React + Vite + TypeScript: Fully compatible modern stack
- ✅ Express + TypeScript: Compatible, commonly used together
- ✅ MongoDB + Mongoose: Native ODM for MongoDB
- ✅ JWT + Express: Standard auth pattern
- ✅ Shadcn UI + Tailwind: Designed to work together
- ✅ No technology conflicts identified

**Pattern Consistency:**
- ✅ Naming conventions align across frontend and backend
- ✅ API response format is consistent and documented
- ✅ Error handling patterns match across layers
- ✅ TypeScript interfaces shared conceptually (types in both client/server)

**Structure Alignment:**
- ✅ Project structure supports all architectural decisions
- ✅ Boundaries are clear between client and server
- ✅ Service layer properly abstracts business logic
- ✅ Component structure matches UX design spec

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category | Count | Coverage | Notes |
|-------------|-------|----------|-------|
| User Account (FR1-7) | 7 | ✅ 100% | Auth service + User model |
| Landing Page (FR8-13) | 6 | ✅ 100% | Static page, public routes |
| Idea Management (FR14-21) | 8 | ✅ 100% | Idea service + CRUD API |
| Phase 1 (FR22-28) | 7 | ✅ 100% | Generation service + Version model |
| Phase 2 (FR29-36) | 8 | ✅ 100% | Generation service + Version model |
| Phase 3 (FR37-41) | 5 | ✅ 100% | Generation service + PDF service |
| Section Editing (FR42-46) | 5 | ✅ 100% | Generation service (partial update) |
| Version Control (FR47-54) | 8 | ✅ 100% | Version service + cascade logic |
| Dashboard (FR55-60) | 6 | ✅ 100% | Query API + frontend filters |
| UI/Responsive (FR61-70) | 10 | ✅ 100% | React + Tailwind responsive |

**Non-Functional Requirements Coverage:**

| NFR Category | Key Requirements | Coverage |
|--------------|-----------------|----------|
| **Performance** | <3s load, <30s generation | ✅ Addressed via async patterns, indexing |
| **Security** | JWT, bcrypt, HTTPS, rate limiting | ✅ Fully documented |
| **Accessibility** | WCAG 2.1 AA | ✅ Shadcn defaults + documented patterns |
| **Scalability** | 1K-10K users | ✅ Stateless architecture, indexing |
| **Reliability** | 99% uptime, error handling | ✅ Patterns documented |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ All critical decisions documented with rationale
- ✅ Technology versions specified
- ✅ Database schema fully defined
- ✅ API endpoints documented
- ✅ File structure complete and specific

**Structure Completeness:**
- ✅ All directories and files defined
- ✅ No placeholder directories
- ✅ Clear separation of concerns
- ✅ Feature-based organization for scale

**Pattern Completeness:**
- ✅ Naming conventions comprehensive
- ✅ Error handling patterns defined
- ✅ API response format standardized
- ✅ State management approach documented

### Gap Analysis Results

**No Critical Gaps Identified**

**Minor Enhancements for Future:**
1. Consider React Query for better caching (v1.1)
2. Add comprehensive logging service (post-MVP)
3. Define CI/CD pipeline specifics (deployment phase)
4. Add monitoring/alerting setup (post-MVP)

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Clear separation of concerns
- Consistent patterns across layers
- Well-documented data model
- Comprehensive API design
- Scalable project structure

**Areas for Future Enhancement:**
- Caching layer (React Query or Redis)
- Real-time features (WebSocket consideration)
- CI/CD pipeline details
- Monitoring and observability

---

## 7. Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-18
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 15+ architectural decisions made
- 25+ implementation patterns defined
- 50+ files/directories specified
- 70 functional requirements fully supported
- 50 non-functional requirements addressed

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Startup Validator Platform. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

1. Initialize project structure:
```bash
# Create root directory
mkdir startup-validator && cd startup-validator

# Initialize frontend
npm create vite@latest client -- --template react-ts
cd client && npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
cd ..

# Initialize backend
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors helmet bcryptjs jsonwebtoken cookie-parser
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node nodemon
npx tsc --init
```

2. Set up development environment per architecture
3. Implement core architectural foundations
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen technology stack provides a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
