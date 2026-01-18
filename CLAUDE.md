# CLAUDE.md - MCPs Quick Reference & Usage

## What are MCPs?

**Model Context Protocols** extend Claude's capabilities by connecting to external services. Think of MCPs as **Claude's hands and eyes** enabling direct interaction with your dev environment.

---

## The 4 MCPs

### 1. 🌐 Chrome DevTools MCP

**What:** Control browser, test UI, capture screenshots

| When                 | Example                                                   |
| -------------------- | --------------------------------------------------------- |
| Test forms           | "Fill registration form with valid data and click submit" |
| Visual verification  | "Take screenshot of dashboard"                            |
| Debug errors         | "Check console errors and network requests"               |
| Check responsiveness | "Test on mobile size 375px"                               |

**Key Functions:**

- `navigate_page()` - Go to URL
- `fill()` / `fill_form()` - Type in inputs
- `click()` - Click buttons
- `take_screenshot()` - Visual proof
- `list_network_requests()` - Inspect API calls
- `list_console_messages()` - Check errors

---

### 2. 📚 Context7 MCP

**What:** Access latest documentation for 1000+ libraries

| When                | Example                               |
| ------------------- | ------------------------------------- |
| Writing code        | "Show JWT implementation patterns"    |
| Need best practices | "How do I use React Hook Form?"       |
| Want examples       | "Mongoose schema validation examples" |
| Stay updated        | "Latest Zod validation patterns"      |

**Workflow:**

1. Resolve library ID: `context7__resolve-library-id(libraryName)`
2. Query docs: `context7__query-docs(libraryId, query)`

**Supported:** React, Vue, Angular, Express, Node, TypeScript, MongoDB, Mongoose, Next.js, Vite, Tailwind, Zod, testing libraries, 1000+ more

---

### 3. 🎨 Shadcn MCP

**What:** Professional, accessible UI components

| When            | Example                                     |
| --------------- | ------------------------------------------- |
| Build forms     | "Create registration form with email field" |
| Make dashboards | "Show data in card grid layout"             |
| Need components | "Get Input and Button components"           |
| Consistent UI   | "Use shadcn components for all forms"       |

**Component Categories:**

- Form: Input, Select, Checkbox, Form, Label
- Layout: Card, Tabs, Accordion, Grid
- Interactive: Button, Dialog, Popover, Tooltip, Dropdown
- Data: Table, List, Avatar, Badge, Progress
- Notification: Toast, Alert, Dialog

---

### 4. 🗄️ MongoDB MCP

**What:** Database CRUD operations & verification

| When            | Example                                 |
| --------------- | --------------------------------------- |
| Verify data     | "Check if user was created"             |
| Query data      | "Show all users registered in Jan 2026" |
| Debug issues    | "Count documents, check schema"         |
| Clean test data | "Delete all test users"                 |

**Key Functions:**

- `count()` - Count documents
- `find()` - Query with filters
- `insert-many()` - Add documents
- `update-many()` - Modify documents
- `delete-many()` - Remove documents
- `aggregate()` - Complex queries

**Connection:** Automatically uses `MONGODB_URI` from .env

---

## How to Use MCPs in Requests

### Single MCP

```
"Test the registration form"
→ Claude uses Chrome MCP
```

### Multiple MCPs

```
"Build login form using shadcn, test in browser, verify database works"
→ Claude uses Shadcn + Chrome + MongoDB MCPs
```

### Explicit MCP

```
"Use Context7 to show me JWT best practices"
→ Claude explicitly uses Context7
```

---

## Common Tasks & Which MCP

| Task         | Primary  | Secondary | Example                            |
| ------------ | -------- | --------- | ---------------------------------- |
| Test feature | Chrome   | MongoDB   | "Test registration, verify in DB"  |
| Build UI     | Shadcn   | Context7  | "Create form with latest patterns" |
| Debug error  | Chrome   | Context7  | "Check console, get fix patterns"  |
| Verify data  | MongoDB  | Chrome    | "Confirm user created, screenshot" |
| Write code   | Context7 | Shadcn    | "Implement login with components"  |

---

## Real-World Workflows

### Workflow A: Complete Feature Testing

```
Step 1: Chrome → Open registration page
Step 2: Chrome → Fill form with valid data, click submit
Step 3: Chrome → Take screenshot of success page
Step 4: MongoDB → Query database to verify user created
Result: ✅ All tests passed with evidence
```

### Workflow B: Build & Test Login Component

```
Step 1: Context7 → Get React Hook Form + JWT patterns
Step 2: Shadcn → Get Input, Button components
Step 3: Write → Complete login component
Step 4: Chrome → Test form in browser (valid & invalid)
Step 5: MongoDB → Verify password comparison works
Result: ✅ Component code + test proof
```

### Workflow C: Debug Not Working Feature

```
Step 1: Chrome → Take screenshot, check console
Step 2: Chrome → Check network tab for API response
Step 3: MongoDB → Verify data was actually saved
Step 4: Context7 → Get proper error handling patterns
Step 5: Write → Fix the issue
Step 6: Chrome → Re-test to confirm fix
Result: ✅ Issue found & fixed with proof
```

### Workflow D: Build Dashboard with Data

```
Step 1: Context7 → Get React data display patterns
Step 2: Shadcn → Get Card, Input, Select components
Step 3: Write → Dashboard component with filtering
Step 4: Chrome → Test on desktop, tablet, mobile
Step 5: Chrome → Take screenshots of responsive design
Result: ✅ Complete dashboard with proof screenshots
```

---

## MCP Decision Tree

**"I need to test something"**
→ Chrome MCP (navigate, fill, click, screenshot)

**"I need to write code"**
→ Context7 MCP (get latest patterns & examples)

**"I need to build UI"**
→ Shadcn MCP (get professional components)

**"I need to check/verify data"**
→ MongoDB MCP (query, count, verify)

**"I need to do multiple things"**
→ Use multiple MCPs (Chrome + MongoDB, Context7 + Shadcn, etc.)

---

## Best Practices

### ✅ DO

- Test in browser (Chrome) → See it works visually
- Verify database (MongoDB) → Confirm data saved
- Check latest docs (Context7) → Best practices
- Use components (Shadcn) → Consistent, accessible UI
- Combine MCPs → Complete features in one request

### ❌ DON'T

- Assume code works without testing
- Write code without checking documentation
- Skip database verification
- Trust tests without visual proof
- Use old examples when newer docs exist

---

## MCP Functions Quick Reference

### Chrome Functions

```
navigate_page(url)              Fill, click, navigate
take_screenshot()               Visual proof
take_snapshot()                 Page structure/elements
fill(uid, value)                Type in input
fill_form(elements)             Fill multiple at once
click(uid)                       Click element
list_network_requests()         See all HTTP requests
get_network_request(id)         Inspect specific request
list_console_messages()         Check errors/logs
evaluate_script(function)       Run JS in browser
```

### MongoDB Functions

```
count(database, collection)     Count documents
find(database, collection)      Query documents
insert-many()                   Add documents
update-many()                   Modify documents
delete-many()                   Remove documents
aggregate()                     Complex queries
list-databases()                See all databases
list-collections(database)      See collections
collection-schema()             View document structure
create-index()                  Create index
```

### Context7 Functions

```
resolve-library-id()            Get library ID first
query-docs()                    Get documentation
```

### Shadcn Functions

```
getComponents()                 List all components
getComponent(name)              Get specific component
```

---

## Example Requests & Responses

### Example 1: Test Registration

```
User: "Test registration with valid email test@example.com,
       password Test1234!, verify success page and database"

Claude:
1. Opens http://localhost:5173/register
2. Fills form with provided credentials
3. Clicks "Create Account"
4. Takes screenshot of success/login redirect
5. Queries MongoDB for user document
6. Reports: ✅ Registration successful - user created, password hashed
```

### Example 2: Build Login Form

```
User: "Create login form component using shadcn, include email and
       password fields, add validation, test in browser"

Claude:
1. Queries Context7 for React Hook Form + validation patterns
2. Gets Shadcn Input and Button components
3. Writes complete login component with validation
4. Opens browser, tests form with valid/invalid data
5. Reports: ✅ Component code + working screenshot
```

### Example 3: Debug Form Issue

```
User: "Login form isn't working - debug and fix"

Claude:
1. Takes screenshot of form
2. Checks browser console for errors
3. Inspects network tab for API response
4. Queries MongoDB to verify users exist
5. Queries Context7 for error handling patterns
6. Writes fix and re-tests
7. Reports: ✅ Issue fixed (e.g., "API endpoint URL was wrong")
```

### Example 4: Verify Database State

```
User: "Show me:
       1. How many users registered
       2. List all users
       3. Check if test@example.com exists"

Claude:
1. MongoDB count on users collection
2. MongoDB find all users
3. MongoDB find specific user
4. Reports: ✅ 5 users total, shows all details
```

---

## Project Context

**Stack:** Express + MongoDB + React + Vite + TypeScript

**Environment:**

```
Backend:  http://localhost:5000
Frontend: http://localhost:5173
Database: MongoDB Atlas cluster0.utffa.mongodb.net/startup-validator
```

**Key Files:**

- Backend: `server/src/models/User.ts`, `controllers/authController.ts`
- Frontend: `client/src/pages/Register.tsx`, `services/api.ts`
- Database: MongoDB Atlas (email unique index, bcrypt passwords)

**Current Status:** Story 1.1 Done, Story 1.2 Ready

---

## Troubleshooting

### Chrome MCP Not Working

- Check both servers running (ports 5000, 5173)
- Try fresh browser tab
- Use `take_snapshot` to see page structure

### MongoDB MCP Can't Connect

- Verify `MONGODB_URI` in `.env` is correct
- Check network connection to MongoDB Atlas

### Context7 Not Finding Docs

- Try resolving library ID first
- Library name must match npm package name

### Form Not Submitting

- Chrome: Inspect form element with `take_snapshot`
- Context7: Get React Hook Form troubleshooting
- Check browser console for JavaScript errors

---

## Summary Table

| MCP          | Purpose         | When        | How                     |
| ------------ | --------------- | ----------- | ----------------------- |
| **Chrome**   | Browser control | Test UI     | fill, click, screenshot |
| **Context7** | Docs access     | Write code  | query-docs              |
| **Shadcn**   | UI components   | Build UI    | getComponent            |
| **MongoDB**  | Database ops    | Verify data | find, count, insert     |

---

## Next: Story 1.2 (User Login)

```
1. Context7 → JWT implementation patterns
2. Write → Login endpoint + token generation
3. Shadcn → Login form component
4. Chrome → Test in browser
5. MongoDB → Verify password comparison
6. Done → End-to-end tested
```

---

**Last Updated:** 2026-01-18
**Status:** Story 1.1 Complete ✅ | MCPs Documented ✅ | Ready for 1.2 🚀

---

## Quick Command Examples

```
# Test a feature
"Test [feature] by [action], verify in [location]"

# Build with UI
"Create [component] using shadcn, test [where], ensure [property]"

# Debug an issue
"[Feature] isn't working - debug and fix"

# Verify data
"Show me [data] from database"

# Get help writing code
"How do I [task] using [library]?"
```
