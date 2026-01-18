---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['_bmad-output/analysis/brainstorming-session-2026-01-18.md']
workflowType: 'research'
lastStep: 4
research_type: 'technical'
research_topic: 'Startup Validator Platform - React + Express + MongoDB Stack'
research_goals: 'Best practices for building production-grade web application with React 2026, Express.js MVC, MongoDB, JWT auth, Shadcn UI, Tailwind CSS, and versioning systems'
user_name: 'Major project'
date: '2026-01-18'
web_research_enabled: true
source_verification: true
status: 'complete'
---

# Technical Research Report: Startup Validator Platform Stack

**Date:** 2026-01-18
**Author:** Major project
**Research Type:** Technical
**Status:** COMPLETE

---

## Executive Summary

This technical research document provides comprehensive best practices, patterns, and current standards for building the Startup Validator Platform. The research covers the complete technology stack: React 19, Tailwind CSS v4, Shadcn UI, Express.js 5.x with MVC architecture, MongoDB with Mongoose 9.x, and JWT authentication.

**Key Findings:**
- React 19 introduces improved hooks and compiler optimizations
- Express.js 5.x adds native Promise support for cleaner async code
- Mongoose 9.x provides enhanced schema validation and virtuals
- JWT best practice: HttpOnly cookies for refresh tokens, memory for access tokens
- Shadcn UI + Sonner provides production-ready toast notifications

---

## Table of Contents

1. [Frontend Architecture](#1-frontend-architecture)
   - React 19 Best Practices
   - Tailwind CSS v4 Configuration
   - Shadcn UI Components
   - Folder Structure
2. [Backend Architecture](#2-backend-architecture)
   - Express.js 5.x MVC Structure
   - Middleware Patterns
   - Error Handling
   - Folder Structure
3. [Database Design](#3-database-design)
   - MongoDB Schema Design
   - Mongoose Models
   - Indexes and Performance
4. [Authentication](#4-authentication)
   - JWT Implementation
   - HttpOnly Cookies
   - Refresh Token Rotation
5. [API Design](#5-api-design)
   - RESTful Patterns
   - Request/Response Standards
6. [Production Recommendations](#6-production-recommendations)

---

## 1. Frontend Architecture

### 1.1 React 19 Best Practices

**Source:** [React Official Documentation](https://react.dev) | [Facebook React v19](https://github.com/facebook/react)

#### State Management with Hooks

```javascript
import { useState, useMemo } from 'react';

function Component() {
  const [state, setState] = useState(0);

  // Memoize expensive calculations
  const expensiveValue = useMemo(() => {
    return calculateExpensiveNumber(state);
  }, [state]);

  return <div>{expensiveValue}</div>;
}
```

#### Best Practices:
- **Use functional components** exclusively (class components are legacy)
- **Memoize expensive calculations** with `useMemo`
- **Avoid setState in useEffect** without proper dependencies (causes cascading renders)
- **Custom hooks** for reusable logic
- **Component composition** over prop drilling

#### Folder Structure (Frontend)

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── common/             # Shared components (Header, Footer, etc.)
│   ├── auth/               # Auth-related components
│   ├── ideas/              # Idea management components
│   ├── phases/             # Phase 1, 2, 3 components
│   └── landing/            # Landing page components
├── hooks/                  # Custom React hooks
│   ├── useAuth.js
│   ├── useIdeas.js
│   └── useVersion.js
├── lib/                    # Utilities and helpers
│   ├── api.js              # API client (axios/fetch wrapper)
│   ├── utils.js            # General utilities
│   └── constants.js        # App constants
├── pages/                  # Page components (or routes/)
├── context/                # React Context providers
│   ├── AuthContext.jsx
│   └── IdeaContext.jsx
├── services/               # API service functions
│   ├── authService.js
│   ├── ideaService.js
│   └── versionService.js
└── styles/                 # Global styles
    └── globals.css
```

### 1.2 Tailwind CSS v4 Configuration

**Source:** [Tailwind CSS Documentation](https://tailwindcss.com/docs)

#### Installation & Setup

```css
/* globals.css */
@import "tailwindcss";
@source "../components";
```

#### v4 Key Changes:
- New `@utility` directive for custom utilities
- Prefix syntax changed (now at beginning: `tw:flex`)
- Improved responsive design with breakpoint prefixes

```html
<!-- Responsive grid example -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
  <!-- Content -->
</div>
```

#### Custom Container Configuration (v4)

```css
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}
```

### 1.3 Shadcn UI Components

**Source:** [Shadcn UI Documentation](https://ui.shadcn.com)

#### Installation

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input label toast sonner
```

#### Toast Notifications with Sonner

**Setup in Root Layout:**

```tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

**Usage:**

```tsx
import { toast } from "sonner"

// Success toast
toast.success("Phase 1 completed!")

// Error toast
toast.error("Failed to save changes")

// Toast with action
toast("Idea saved", {
  description: "Version 2 created",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})

// Promise toast (for async operations)
toast.promise(saveIdea(data), {
  loading: "Saving...",
  success: "Idea saved successfully",
  error: "Failed to save idea",
})
```

#### Form with React Hook Form + Zod Validation

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

const formSchema = z.object({
  ideaTitle: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(50, "Please provide more detail"),
})

function IdeaForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { ideaTitle: "", description: "" },
  })

  function onSubmit(data) {
    toast.promise(submitIdea(data), {
      loading: "Analyzing your idea...",
      success: "Phase 1 analysis complete!",
      error: "Analysis failed",
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

#### Card Component for Idea Display

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function IdeaCard({ idea }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{idea.title}</CardTitle>
        <CardDescription>Version {idea.currentVersion}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{idea.summary}</p>
      </CardContent>
      <CardFooter>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  )
}
```

---

## 2. Backend Architecture

### 2.1 Express.js 5.x MVC Structure

**Source:** [Express.js Documentation](https://expressjs.com) | [Best Practices for Structuring Express.js](https://dev.to/moibra/best-practices-for-structuring-an-expressjs-project-148i)

#### Folder Structure (Backend)

```
server/
├── config/
│   ├── db.js               # MongoDB connection
│   ├── constants.js        # App constants
│   └── index.js            # Config aggregator
├── controllers/
│   ├── authController.js
│   ├── ideaController.js
│   ├── versionController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js   # JWT verification
│   ├── errorHandler.js     # Global error handler
│   ├── validate.js         # Request validation
│   └── asyncHandler.js     # Async error wrapper
├── models/
│   ├── User.js
│   ├── Idea.js
│   └── Version.js
├── routes/
│   ├── authRoutes.js
│   ├── ideaRoutes.js
│   ├── versionRoutes.js
│   └── index.js            # Route aggregator
├── services/
│   ├── authService.js      # Business logic
│   ├── ideaService.js
│   └── versionService.js
├── utils/
│   ├── generateToken.js
│   ├── validators.js
│   └── helpers.js
├── app.js                  # Express app setup
└── server.js               # Entry point
```

### 2.2 Express.js 5.x Features

**Native Promise Support (New in v5):**

```javascript
// Express 5+ automatically handles rejected promises
app.get('/async-route', async (req, res) => {
  const data = await fetchData(); // If this rejects, Express catches it
  res.json(data);
});
```

#### App Setup (app.js)

```javascript
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // Important for cookies
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
```

### 2.3 Async Handler Pattern

```javascript
// middleware/asyncHandler.js
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in controller
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getIdeas = asyncHandler(async (req, res) => {
  const ideas = await Idea.find({ user: req.user.id });
  res.json({ success: true, data: ideas });
});
```

### 2.4 Error Handling

```javascript
// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

---

## 3. Database Design

### 3.1 MongoDB Schema Design

**Source:** [Mongoose Documentation](https://mongoosejs.com) | [Mongoose v9 GitHub](https://github.com/automattic/mongoose)

#### User Model

```javascript
// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't return password by default
  },
  profileImage: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
```

#### Idea Model

```javascript
// models/Idea.js
import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries
  },
  title: {
    type: String,
    required: [true, 'Idea title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  originalInput: {
    type: String,
    required: [true, 'Original idea input is required'],
  },
  currentVersion: {
    type: Number,
    default: 1,
  },
  currentPhase: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  phaseStatus: {
    phase1: {
      type: String,
      enum: ['pending', 'complete', 'invalidated'],
      default: 'pending',
    },
    phase2: {
      type: String,
      enum: ['locked', 'pending', 'complete', 'invalidated'],
      default: 'locked',
    },
    phase3: {
      type: String,
      enum: ['locked', 'pending', 'complete'],
      default: 'locked',
    },
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
ideaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for user queries
ideaSchema.index({ user: 1, createdAt: -1 });
ideaSchema.index({ user: 1, isArchived: 1 });

export default mongoose.model('Idea', ideaSchema);
```

#### Version Model (Core Versioning System)

```javascript
// models/Version.js
import mongoose from 'mongoose';

// Section schema for phase outputs
const sectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    required: true,
    enum: [
      // Phase 1 sections
      'summary',
      'marketFeasibility',
      'competitiveAnalysis',
      'killAssumption',
      'actionableRecommendations',
      // Phase 2 sections
      'businessModel',
      'strategy',
      'structuralRisks',
      'operationalRisks',
      // Phase 3 sections
      'pitchDeckContent',
      'changelog',
    ],
  },
  content: {
    type: String,
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

const versionSchema = new mongoose.Schema({
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true,
    index: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  phase: {
    type: Number,
    enum: [1, 2, 3],
    required: true,
  },
  sections: [sectionSchema],
  changeLog: {
    whatChanged: {
      type: String,
      required: true,
    },
    whyChanged: {
      type: String,
      default: 'Initial generation',
    },
    sectionsModified: [{
      type: String,
    }],
  },
  isActive: {
    type: Boolean,
    default: true, // Only latest version is active
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for version queries
versionSchema.index({ idea: 1, versionNumber: -1 });
versionSchema.index({ idea: 1, phase: 1, isActive: 1 });

// Virtual for getting specific section
versionSchema.virtual('summarySection').get(function() {
  return this.sections.find(s => s.sectionType === 'summary');
});

// Static method to get latest version
versionSchema.statics.getLatestVersion = async function(ideaId, phase) {
  return this.findOne({
    idea: ideaId,
    phase,
    isActive: true
  }).sort({ versionNumber: -1 });
};

export default mongoose.model('Version', versionSchema);
```

### 3.2 Index Strategy

```javascript
// Indexes defined in schemas above ensure:
// 1. Fast user-specific queries (user index on Idea)
// 2. Fast version lookups (idea + versionNumber compound index)
// 3. Efficient phase queries (idea + phase + isActive index)
```

---

## 4. Authentication

### 4.1 JWT Implementation Best Practices

**Source:** [DigitalOcean JWT Guide](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs) | [JWT Security Guide](https://jsschools.com/web_dev/jwt-authentication-security-guide-refresh-token/) | [Medium JWT with Cookies](https://medium.com/@techsuneel99/jwt-authentication-in-nodejs-refresh-jwt-with-cookie-based-token-37348ff685bf)

#### Token Strategy

| Token Type | Storage | Expiration | Purpose |
|------------|---------|------------|---------|
| Access Token | Memory (React state) | 15 minutes | API authorization |
| Refresh Token | HttpOnly Cookie | 7 days | Token renewal |

#### Token Generation

```javascript
// utils/generateToken.js
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,           // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',       // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
```

#### Auth Controller

```javascript
// controllers/authController.js
import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie
} from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

// Register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    },
  });
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Set refresh token in cookie
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    },
  });
});

// Refresh Token
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError('No refresh token provided', 401);
  }

  // Verify refresh token
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  // Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(user._id);

  // Optionally rotate refresh token (recommended)
  const newRefreshToken = generateRefreshToken(user._id);
  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    data: { accessToken },
  });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ success: true, message: 'Logged out successfully' });
});
```

#### Auth Middleware

```javascript
// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorHandler.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized, no token', 401);
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Attach user to request
  req.user = await User.findById(decoded.id);

  if (!req.user) {
    throw new AppError('User not found', 401);
  }

  next();
});
```

### 4.2 Frontend Auth Implementation

```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.refreshToken();
        setUser(data.user);
        setAccessToken(data.accessToken);
      } catch (error) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setAccessToken(data.accessToken);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## 5. API Design

### 5.1 RESTful Routes

```javascript
// routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import ideaRoutes from './ideaRoutes.js';
import versionRoutes from './versionRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/ideas', ideaRoutes);
router.use('/versions', versionRoutes);
router.use('/users', userRoutes);

export default router;
```

### 5.2 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** ||||
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| POST | `/api/auth/logout` | Logout user | Yes |
| **Users** ||||
| GET | `/api/users/profile` | Get current user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| **Ideas** ||||
| GET | `/api/ideas` | Get all user's ideas | Yes |
| POST | `/api/ideas` | Create new idea | Yes |
| GET | `/api/ideas/:id` | Get single idea | Yes |
| PUT | `/api/ideas/:id` | Update idea | Yes |
| DELETE | `/api/ideas/:id` | Delete idea | Yes |
| **Versions** ||||
| GET | `/api/ideas/:ideaId/versions` | Get all versions | Yes |
| GET | `/api/ideas/:ideaId/versions/:versionId` | Get specific version | Yes |
| POST | `/api/ideas/:ideaId/versions` | Create new version | Yes |
| PUT | `/api/ideas/:ideaId/sections/:sectionType` | Edit specific section | Yes |
| **Phases** ||||
| POST | `/api/ideas/:ideaId/phases/:phase/generate` | Generate phase content | Yes |
| POST | `/api/ideas/:ideaId/phases/:phase/confirm` | Confirm/lock phase | Yes |
| GET | `/api/ideas/:ideaId/phases/:phase/export` | Export phase as PDF | Yes |

### 5.3 Response Format

```javascript
// Success response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful" // optional
}

// Error response
{
  "success": false,
  "error": "Error message",
  "stack": "..." // Only in development
}

// Paginated response
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

## 6. Production Recommendations

### 6.1 Environment Variables

```env
# .env.example
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/startup-validator

# JWT Secrets (use strong random strings)
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 6.2 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set `secure: true` on cookies in production
- [ ] Use Helmet.js for security headers
- [ ] Implement rate limiting
- [ ] Validate and sanitize all inputs
- [ ] Use parameterized queries (Mongoose handles this)
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

### 6.3 Performance Checklist

- [ ] Add database indexes for frequent queries
- [ ] Implement pagination for list endpoints
- [ ] Use React.memo and useMemo for expensive renders
- [ ] Lazy load routes and components
- [ ] Compress responses (use compression middleware)
- [ ] Cache static assets

---

## Sources

### Official Documentation
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

### Best Practices & Guides
- [DigitalOcean - How To Use JWTs in Express.js](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)
- [JWT Authentication Security Guide](https://jsschools.com/web_dev/jwt-authentication-security-guide-refresh-token/)
- [Best Practices for Structuring Express.js Project](https://dev.to/moibra/best-practices-for-structuring-an-expressjs-project-148i)
- [Folder Structure for NodeJS & ExpressJS](https://dev.to/mr_ali3n/folder-structure-for-nodejs-expressjs-project-435l)
- [Ultimate Guide to Securing JWT with httpOnly Cookies](https://www.wisp.blog/blog/ultimate-guide-to-securing-jwt-authentication-with-httponly-cookies)

### Context7 MCP Sources
- Facebook React v19.1.1
- Express.js v5.1.0
- Mongoose v9.0.1
- Tailwind CSS v4
- Shadcn UI latest

---

## Next Steps

1. **Market Research** - Competitive landscape and market analysis
2. **Product Brief** - Consolidate findings into strategic document
3. **PRD** - Detailed product requirements based on research
