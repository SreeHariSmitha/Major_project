# CLAUDE.md - MCP Configuration & Usage Guide

## Overview

This document explains the **Model Context Protocol (MCP)** servers configured for this project and how to use them effectively with Claude Code to accelerate development.

**Project:** Startup Validator Platform
**Environment:** Windows + Node.js + React + Express + MongoDB Atlas
**AI Assistant:** Claude (Haiku 4.5)

---

## What are MCPs (Model Context Protocols)?

MCPs are **tools that extend Claude's capabilities** by connecting to external services, databases, and applications. They allow Claude to:
- ✅ Access real-time information
- ✅ Execute code and commands
- ✅ Interact with databases
- ✅ Control browsers and take actions
- ✅ Access the latest documentation

Think of MCPs as **Claude's hands and eyes** - enabling direct interaction with your development environment.

---

## Configured MCPs for This Project

### 1. 🌐 Chrome DevTools MCP
**What it does:** Opens a browser and lets Claude control it programmatically

#### When to Use:
- Testing frontend registration/login flows
- Visually verifying UI components
- Taking screenshots of pages
- Filling forms and clicking buttons
- Checking console errors and network requests
- Testing responsive design

#### How to Use:

```markdown
User: "Test the registration form by filling it with valid data and clicking submit"

Claude will:
1. Open browser to http://localhost:5173/register
2. Take a snapshot of the page
3. Fill email, name, password fields
4. Click the Create Account button
5. Wait for redirect and take screenshot
6. Report results
```

#### Available Functions:

| Function | Purpose |
|----------|---------|
| `new_page` | Open a new browser tab at URL |
| `navigate_page` | Go to URL, back, forward, or reload |
| `take_screenshot` | Capture current page viewport |
| `take_snapshot` | Get accessibility tree of page elements |
| `fill` | Type text into input fields |
| `click` | Click buttons/links |
| `fill_form` | Fill multiple form fields at once |
| `list_console_messages` | Check browser console for errors |
| `list_network_requests` | See all HTTP requests made |
| `get_network_request` | Inspect details of specific request |
| `wait_for` | Wait for text to appear on page |
| `evaluate_script` | Run JavaScript in browser |

#### Example Usage:

```markdown
# Test successful registration
User: "Register a new user with email test@example.com, password Test1234!, verify the success"

Claude Actions:
1. Opens http://localhost:5173/register
2. Fills form with provided credentials
3. Clicks "Create Account"
4. Verifies redirect to login page
5. Checks network request to backend
6. Reports: "✅ Registration successful - 201 status, user created in database"
```

---

### 2. 📚 Context7 MCP
**What it does:** Provides access to latest documentation for libraries and frameworks

#### When to Use:
- Writing code that uses new libraries
- Need latest API documentation
- Want code examples for specific features
- Unsure about best practices for a tool
- Need to update code to latest library version

#### How to Use:

Before Context7 works, Claude must first **resolve the library name** to get its ID:

```markdown
User: "Help me implement authentication with JWT in Express.js"

Claude Actions:
1. Calls context7__resolve-library-id with:
   - query: "JWT authentication in Express"
   - libraryName: "jsonwebtoken"
2. Gets library ID: "/npm/jsonwebtoken"
3. Calls context7__query-docs with:
   - libraryId: "/npm/jsonwebtoken"
   - query: "JWT token generation and verification"
4. Returns latest code examples and best practices
```

#### Example Queries:

| Need | Query |
|------|-------|
| Form validation | context7 + "zod form validation best practices" |
| React hooks | context7 + "useEffect cleanup function examples" |
| Express middleware | context7 + "Express error handling middleware" |
| MongoDB queries | context7 + "MongoDB aggregation pipeline examples" |
| CSS styling | context7 + "Tailwind CSS responsive design patterns" |

#### Supported Libraries:

✅ React, Vue, Angular
✅ Express.js, Node.js
✅ TypeScript
✅ MongoDB, Mongoose
✅ Next.js, Vite
✅ Tailwind CSS
✅ Zod, React Hook Form
✅ Testing libraries (Jest, Vitest, Playwright)
✅ 1000+ more...

#### Example:

```markdown
User: "Show me how to use Mongoose schema validation with error handling"

Claude will:
1. Query Context7 for Mongoose documentation
2. Get latest code examples
3. Write type-safe MongoDB operations
4. Include proper error handling
5. Provide validation patterns
```

---

### 3. 🎨 Shadcn MCP
**What it does:** Provides access to shadcn/ui component library for building professional UIs

#### When to Use:
- Building UI components (buttons, inputs, forms, dialogs)
- Creating responsive layouts
- Need accessible, ready-made components
- Want consistent design system
- Building dashboards or complex interfaces

#### How to Use:

```markdown
User: "Create a registration form with email and password fields using shadcn components"

Claude will:
1. Access shadcn MCP to get component specs
2. Get list of available components (Button, Input, Form, Dialog, etc.)
3. Get component documentation
4. Write React component using shadcn/ui
5. Include proper styling and accessibility
```

#### Available Components:

**Form Components:**
- Input, Textarea, Select, Checkbox, Radio Button
- Form, Label, Combobox
- Date Picker, Time Picker

**Layout Components:**
- Card, Container, Grid, Flexbox
- Tabs, Accordion, Collapsible

**Interactive Components:**
- Button, Button Group
- Dialog, Drawer, Sheet
- Popover, Tooltip
- Dropdown Menu, Context Menu

**Data Display:**
- Table, List, Avatar
- Badge, Status, Alert
- Progress Bar, Skeleton

**Notification Components:**
- Toast/Sonner
- Alert Dialog
- Notification Banner

#### Example Usage:

```markdown
User: "Design a login page with email, password fields, and a submit button using shadcn"

Claude will:
1. Get shadcn component specs
2. Create professional login form with:
   - Input components for email/password
   - Button component for submit
   - Form validation feedback
   - Responsive design
   - Accessible labels
3. Include proper styling
4. Provide complete code ready to use
```

---

### 4. 🗄️ MongoDB MCP
**What it does:** Direct access to MongoDB database with full CRUD operations

#### When to Use:
- Query or insert data during development
- Verify data was saved correctly
- Debug database issues
- Check collection structure and data
- Run aggregations and complex queries
- Clean up test data

#### How to Use:

MongoDB MCP connects to your MongoDB URI automatically from environment variables.

```markdown
User: "Check how many users are registered in the database"

Claude will:
1. Call mcp__mongo__count with:
   - database: "startup-validator"
   - collection: "users"
2. Returns count: 5 users
```

#### Available Operations:

| Operation | Purpose |
|-----------|---------|
| `list-databases` | See all databases |
| `list-collections` | See collections in database |
| `count` | Count documents matching filter |
| `find` | Query documents with filters |
| `aggregate` | Complex MongoDB aggregation pipeline |
| `insert-many` | Insert new documents |
| `update-many` | Update documents matching filter |
| `delete-many` | Delete documents matching filter |
| `create-collection` | Create new collection |
| `drop-collection` | Delete entire collection |
| `collection-schema` | See document structure |
| `collection-indexes` | View database indexes |
| `create-index` | Create new index |

#### Example Queries:

```markdown
# Example 1: Count registered users
User: "How many users have registered?"

Claude:
1. Calls MongoDB count on users collection
2. Returns: "5 users registered"

# Example 2: Find users with specific criteria
User: "Show me all users who registered in January 2026"

Claude:
1. Queries with date filter
2. Returns matching user documents

# Example 3: Verify registration worked
User: "Confirm that test@example.com was created in database"

Claude:
1. Searches for user by email
2. Returns user document with all fields
3. Verifies password is hashed (not plaintext)

# Example 4: Clean up test data
User: "Delete all test users that start with 'test-'"

Claude:
1. Queries with regex filter on email
2. Deletes matching documents
3. Confirms deletion
```

#### Connection Details:

```
Database: startup-validator
MongoDB URI: mongodb+srv://Dhoni:Dhoni@cluster0.utffa.mongodb.net/?appName=Cluster0
Collections: users, ideas, validations, phases, versions
```

---

## How to Use MCPs Together (Workflows)

### Workflow 1: Complete Feature Development

```markdown
User: "Implement and test the User Login feature"

Claude Uses:
1. Context7 → Get JWT implementation patterns from documentation
2. Write code → Create login endpoint with password verification
3. MongoDB MCP → Query users collection to verify email/password
4. Chrome MCP → Test login form in browser
5. Report results with screenshots
```

### Workflow 2: Debug Feature Issue

```markdown
User: "Registration form isn't working - fix it"

Claude Uses:
1. Chrome MCP → Take screenshot of form
2. Chrome MCP → Check browser console for errors
3. Chrome MCP → Check network tab for API response
4. MongoDB MCP → Verify data was saved
5. Context7 → Look up proper error handling patterns
6. Write fix and re-test in browser
```

### Workflow 3: UI Design & Implementation

```markdown
User: "Create a professional dashboard for idea management"

Claude Uses:
1. Shadcn MCP → Get component specs
2. Chrome MCP → Take screenshots of current design
3. Context7 → Get React best practices for data display
4. Write responsive dashboard component
5. Chrome MCP → Test responsiveness on different screen sizes
6. Iterate based on visual feedback
```

### Workflow 4: Data Validation & Testing

```markdown
User: "Test all registration validation rules"

Claude Uses:
1. Context7 → Get Zod validation patterns
2. MongoDB MCP → Insert test users to verify constraints
3. Chrome MCP → Fill forms with invalid data
4. Chrome MCP → Verify error messages display
5. Report coverage of all validation rules
```

---

## Best Practices for MCP Usage

### ✅ DO:
- **Use Chrome MCP for visual verification** - Screenshots confirm UI works as expected
- **Use MongoDB MCP for data checks** - Verify that backend actually saved data
- **Use Context7 before writing code** - Get latest docs and best practices first
- **Use Shadcn MCP for UI components** - Build consistent, accessible interfaces
- **Combine MCPs** - Use multiple MCPs for each feature (comprehensive approach)
- **Request action verification** - Have Claude take screenshot after each step
- **Check network requests** - Use Chrome MCP to verify API calls are correct

### ❌ DON'T:
- ❌ Assume code works without testing in browser
- ❌ Write code without checking latest documentation
- ❌ Trust test results without verifying in actual browser
- ❌ Skip database verification - always check if data was saved
- ❌ Use old examples when Context7 has newer patterns
- ❌ Assume form works without testing all edge cases

---

## Command Examples by Scenario

### Scenario 1: Testing Registration Flow
```markdown
User: "Test registration with:
1. Valid data (email: newuser@test.com, password: Test1234!)
2. Invalid email (bademail)
3. Short password (123)
4. Duplicate email
5. Screenshot each step"

Claude will use:
- Chrome MCP: Navigate, fill forms, click buttons, take screenshots
- MongoDB MCP: Verify user created, count users
- Report: All test results with evidence
```

### Scenario 2: Building Login Component
```markdown
User: "Create a login component with email/password fields,
use shadcn components, include proper validation,
and test it in the browser"

Claude will use:
- Context7: Get React Hook Form + Zod best practices
- Shadcn MCP: Get Input and Button components
- Write: Complete login component with validation
- Chrome MCP: Open browser and test the component
- Report: Component code + working screenshot
```

### Scenario 3: Debugging Database Issues
```markdown
User: "Users aren't being saved - debug and fix"

Claude will use:
- MongoDB MCP: Check users collection, count documents
- Chrome MCP: Test registration form, check network tab
- Context7: Get Express error handling patterns
- Write: Fix any issues in backend
- Verify: Test again with MongoDB MCP and Chrome MCP
```

### Scenario 4: Complex UI Implementation
```markdown
User: "Create dashboard showing all user ideas in a grid,
with filters by status, search by title,
use shadcn components, make it responsive"

Claude will use:
- Context7: Get React data display patterns
- Shadcn MCP: Get Card, Input, Select components
- Write: Complete dashboard component
- Chrome MCP: Test desktop, tablet, mobile responsiveness
- Report: Code + screenshots at different screen sizes
```

---

## How Claude Decides Which MCP to Use

Claude automatically selects the right MCP based on the task:

| Task Type | MCP | Why |
|-----------|-----|-----|
| "Test the form" | Chrome | Need visual browser interaction |
| "Write login endpoint" | Context7 | Need latest best practices |
| "Build form UI" | Shadcn | Need professional components |
| "Check if user exists" | MongoDB | Need database query |
| "Debug network error" | Chrome | Need to inspect requests |
| "Implement validation" | Context7 + Shadcn | Need docs + components |
| "Test form & database" | Chrome + MongoDB | Need browser + DB verification |

---

## Project Structure with MCPs

```
Major_project_AI/
├── server/
│   ├── src/
│   │   ├── models/User.ts (← MongoDB schema)
│   │   ├── controllers/authController.ts (← Logic)
│   │   ├── routes/auth.ts
│   │   └── app.ts
│   ├── .env (← MongoDB connection)
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/Register.tsx (← Shadcn components)
│   │   ├── schemas/auth.schema.ts (← Zod validation)
│   │   └── services/api.ts (← API calls)
│   └── package.json
│
├── _bmad-output/
│   ├── stories/1-1-user-registration.md (← Current status)
│   └── sprint-status.yaml (← Track progress)
│
└── CLAUDE.md (← You are here!)
```

---

## Environment Configuration

### MongoDB Connection (.env)
```bash
# server/.env
MONGODB_URI=mongodb+srv://Dhoni:Dhoni@cluster0.utffa.mongodb.net/startup-validator?retryWrites=true&w=majority
```

### Frontend API (.env)
```bash
# client/.env
VITE_API_URL=http://localhost:5000
```

### Services Running
```bash
Backend:  http://localhost:5000
Frontend: http://localhost:5173
MongoDB:  cluster0.utffa.mongodb.net
```

---

## Next Steps (Story 1.2: User Login)

When building Story 1.2, use MCPs this way:

```markdown
1. Context7: Get JWT token patterns
2. Write: Login endpoint with password verification
3. Shadcn: Create login form component
4. Chrome: Test login form in browser
5. MongoDB: Verify user credentials checked
6. Complete: End-to-end login flow tested
```

---

## Troubleshooting with MCPs

### "Registration not working"
**Solution:**
1. Chrome MCP → Check browser console for errors
2. Chrome MCP → Check network tab for API response
3. MongoDB MCP → Verify user was actually saved
4. Context7 → Look up proper error handling

### "Form not submitting"
**Solution:**
1. Chrome MCP → Inspect form element details
2. Chrome MCP → Evaluate JavaScript to check state
3. Context7 → Get React Hook Form troubleshooting
4. Write → Fix validation or submission logic

### "Database not responding"
**Solution:**
1. MongoDB MCP → Try simple query
2. Check MongoDB URI in .env
3. Verify network connection to MongoDB Atlas
4. Try reconnecting

### "Chrome MCP not working"
**Solution:**
1. Verify both servers are running (ports 5000, 5173)
2. Try fresh browser tab
3. Check if page fully loaded
4. Use `take_snapshot` to see page structure

---

## Summary

| MCP | What | When | How |
|-----|------|------|-----|
| **Chrome** | Browser control | Testing UI, taking screenshots | `navigate`, `fill`, `click`, `screenshot` |
| **Context7** | Latest docs | Writing code, need examples | `resolve-library-id`, `query-docs` |
| **Shadcn** | UI components | Building forms, dashboards | `getComponent`, `getComponents` |
| **MongoDB** | Database access | CRUD, verification | `find`, `insert`, `count`, `update` |

---

## Quick Reference Commands

```markdown
# Take screenshot of current page
"Chrome: take a screenshot"

# Test login form
"Chrome: fill email field with test@example.com, fill password with Test1234!, click login button"

# Check registration data
"MongoDB: show me all users in the database"

# Get documentation
"Context7: show me JWT implementation patterns"

# Get UI components
"Shadcn: show me form components"

# Test feature end-to-end
"Register user with Chrome, verify in MongoDB, take screenshot of success"
```

---

**Last Updated:** 2026-01-18
**Status:** Story 1.1 (User Registration) Complete ✅
**Next:** Story 1.2 (User Login) - Ready to start

**For questions or issues, reference this document and use the appropriate MCP!**
