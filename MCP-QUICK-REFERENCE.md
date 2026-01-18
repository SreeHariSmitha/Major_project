# MCP Quick Reference Guide

## At a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude MCPs Overview                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🌐 CHROME MCP                                               │
│  ├─ Opens browser, controls it                              │
│  ├─ Takes screenshots & snapshots                           │
│  ├─ Fills forms, clicks buttons                             │
│  ├─ Checks console & network requests                       │
│  └─ USE FOR: UI Testing, visual verification                │
│                                                               │
│  📚 CONTEXT7 MCP                                             │
│  ├─ Access latest documentation                             │
│  ├─ Get code examples & best practices                      │
│  ├─ Supports 1000+ libraries                                │
│  └─ USE FOR: Writing quality code, learning patterns        │
│                                                               │
│  🎨 SHADCN MCP                                               │
│  ├─ Professional UI components                              │
│  ├─ Forms, buttons, dialogs, etc.                          │
│  ├─ Responsive & accessible                                │
│  └─ USE FOR: Building user interfaces                       │
│                                                               │
│  🗄️  MONGODB MCP                                             │
│  ├─ Database queries (find, insert, update, delete)         │
│  ├─ CRUD operations                                         │
│  ├─ Verify data, check collections                          │
│  └─ USE FOR: Data verification, debugging DB issues         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## When to Use Each MCP

### Chrome MCP - Browser Testing
```
USE WHEN:
✅ Testing a new feature in browser
✅ Need visual proof it works
✅ Debugging why form isn't submitting
✅ Checking error messages display
✅ Testing responsive design
✅ Verifying API responses in network tab

EXAMPLE:
User: "Test registration form with valid data, verify success page"
Claude: Opens browser → fills form → clicks submit → checks redirect
```

### Context7 MCP - Latest Documentation
```
USE WHEN:
✅ Writing code with a library
✅ Unsure about best practices
✅ Need code examples
✅ Want to use library's new features
✅ Need proper error handling patterns
✅ Need type-safe implementations

EXAMPLE:
User: "How do I validate forms with React Hook Form and Zod?"
Claude: Queries Context7 → Gets latest patterns → Writes code
```

### Shadcn MCP - UI Components
```
USE WHEN:
✅ Building forms, buttons, dialogs
✅ Creating responsive layouts
✅ Need professional-looking UI
✅ Want accessible components
✅ Building dashboards or complex UIs
✅ Need consistent design system

EXAMPLE:
User: "Create registration form with shadcn components"
Claude: Gets component specs → Builds beautiful form → Tests in browser
```

### MongoDB MCP - Database Operations
```
USE WHEN:
✅ Query users/data from database
✅ Verify data was saved
✅ Count documents
✅ Debug data issues
✅ Clean up test data
✅ Check collection structure

EXAMPLE:
User: "Verify that the new user was created in database"
Claude: Queries MongoDB → Finds user → Shows all fields
```

---

## Common Tasks & Which MCP to Use

| Task | Primary MCP | Secondary MCPs | Why |
|------|-------------|----------------|-----|
| Test registration form | Chrome | MongoDB | See form work, verify DB |
| Build login component | Shadcn | Context7 | Professional UI, best practices |
| Debug API errors | Chrome | MongoDB | Check network, verify data |
| Create data table | Shadcn | Context7 | Components + patterns |
| Verify user created | MongoDB | Chrome | Check DB + visual confirmation |
| Implement validation | Context7 | Shadcn | Docs + UI components |
| Test end-to-end flow | Chrome | MongoDB | Browser + database |
| Fix form submission | Chrome | Context7 | Debug + best practices |

---

## MCP Usage Examples

### Example 1: Complete Feature Testing
```markdown
User: "Test the entire registration flow end-to-end"

Claude Uses:
1. Chrome: Open registration page
2. Chrome: Fill form with valid data
3. Chrome: Click submit & capture response
4. Chrome: Verify redirect to login
5. MongoDB: Query database to confirm user created
6. Chrome: Take final screenshot as proof
7. Report: All tests passed with evidence
```

### Example 2: Debugging Feature Issues
```markdown
User: "Registration form isn't saving users - fix it"

Claude Uses:
1. Chrome: Open form, take screenshot
2. Chrome: Fill form, check console for errors
3. Chrome: Inspect network request to backend
4. MongoDB: Check if user actually saved
5. Context7: Look up proper error handling
6. Write: Fix the bug
7. Chrome: Test again to confirm fix
```

### Example 3: Building New Feature
```markdown
User: "Create user dashboard showing all their ideas in a grid"

Claude Uses:
1. Context7: Get React data display patterns
2. Shadcn: Get Card, Input, Grid components
3. Write: Dashboard component with all features
4. Chrome: Test in browser - desktop, tablet, mobile
5. Chrome: Verify responsive design works
6. Report: Component code + screenshots
```

### Example 4: Data Verification
```markdown
User: "Show me:
1. How many users have registered
2. List all users
3. Show the newest user's details"

Claude Uses:
1. MongoDB: Count users
2. MongoDB: Find all users
3. MongoDB: Find newest user by createdAt
4. Report: All results with timestamps
```

---

## MCP Function Reference

### Chrome MCP Functions
```
navigate_page(url)              → Go to URL
take_screenshot()               → Image of current page
take_snapshot()                 → HTML structure of page
fill(uid, value)                → Type in input field
click(uid)                       → Click element
fill_form(elements)             → Fill multiple fields
list_console_messages()         → See console logs/errors
list_network_requests()         → See all HTTP requests
get_network_request(id)         → Details of specific request
evaluate_script(function)       → Run JavaScript in browser
wait_for(text)                  → Wait for text to appear
```

### MongoDB MCP Functions
```
count(database, collection)                    → Count documents
find(database, collection, filter)             → Query documents
insert-many(database, collection, documents)   → Add documents
update-many(database, collection, update)      → Modify documents
delete-many(database, collection, filter)      → Remove documents
list-databases()                               → See all databases
list-collections(database)                     → See collections
collection-schema(database, collection)        → See document structure
create-index()                                 → Create index for performance
```

### Context7 MCP Functions
```
resolve-library-id(query, libraryName)         → Get library ID
query-docs(libraryId, query)                   → Get documentation
```

### Shadcn MCP Functions
```
getComponents()                 → List all components
getComponent(name)              → Get specific component
```

---

## Real-World Scenarios

### Scenario A: Register New User & Verify
```
Step 1 - Chrome:   Open registration page
Step 2 - Chrome:   Fill email, password, click submit
Step 3 - Chrome:   Take screenshot of success/login page
Step 4 - MongoDB:  Query users.find({email: "newuser@test.com"})
Step 5 - MongoDB:  Verify password is hashed (starts with $2b$)
Step 6 - Report:   Success with evidence from Chrome + MongoDB
```

### Scenario B: Test Form Validation
```
Step 1 - Chrome:   Open registration form
Step 2 - Chrome:   Try invalid email "notanemail"
Step 3 - Chrome:   Verify error message appears in red
Step 4 - Chrome:   Try password "123" (too short)
Step 5 - Chrome:   Verify error "Password must be 8+ characters"
Step 6 - Chrome:   Try duplicate email already in database
Step 7 - Chrome:   Verify 409 error response shows up
Step 8 - Report:   All validations working correctly
```

### Scenario C: Build & Test Dashboard
```
Step 1 - Context7:  Get React data display best practices
Step 2 - Shadcn:    Get Card, Grid, Input components
Step 3 - Write:     Dashboard component with filtering
Step 4 - Chrome:    Open dashboard in browser
Step 5 - Chrome:    Test on desktop (1920px width)
Step 6 - Chrome:    Test on tablet (768px width)
Step 7 - Chrome:    Test on mobile (375px width)
Step 8 - Report:    Code + responsive screenshots
```

---

## How to Request MCPs in Prompts

### Direct MCP Request
```markdown
"Use Chrome MCP to take a screenshot of the registration form"
→ Claude will use Chrome to capture the form
```

### Implied MCP (Claude chooses)
```markdown
"Test the login form by filling it and clicking submit"
→ Claude automatically uses Chrome MCP
```

### Multiple MCPs
```markdown
"Create a beautiful login form using shadcn, test it in the browser with Chrome,
and verify users can login by checking the database with MongoDB"
→ Claude uses: Shadcn + Chrome + MongoDB
```

### Context7 for Code
```markdown
"Write a React component that validates email and password using latest best practices"
→ Claude uses Context7 to get latest patterns from documentation
```

---

## Project Status

**Current State:**
- ✅ Story 1.1: User Registration (Backend + Frontend) - DONE
- 🔄 Story 1.2: User Login - READY TO START
- 📋 Remaining: 64 stories across 9 epics

**How MCPs Help:**
- Chrome MCP: Test each new feature in browser
- MongoDB MCP: Verify data is saved correctly
- Context7 MCP: Write code with best practices
- Shadcn MCP: Build professional UI

---

## Pro Tips

### Tip 1: Always Verify in Browser
```markdown
Don't just write code - use Chrome MCP to see it work!
User: "Build and test the login form in browser"
Claude: Writes component + opens browser + tests it
```

### Tip 2: Check Database After CRUD
```markdown
Always verify data changes with MongoDB MCP!
User: "Create new user and verify it's in database"
Claude: Creates user + queries database + shows user details
```

### Tip 3: Get Latest Docs Before Coding
```markdown
Use Context7 before writing code!
User: "Write login endpoint using latest Express patterns"
Claude: Queries Context7 + writes best-practice code
```

### Tip 4: Use Components from Shadcn
```markdown
Don't reinvent the wheel - use Shadcn components!
User: "Create form with email and password inputs"
Claude: Gets Shadcn Input component + builds form
```

### Tip 5: Full E2E Testing
```markdown
Test from frontend to database!
User: "Register user, verify form works, check database, take screenshots"
Claude: Chrome + MongoDB + takes evidence screenshots
```

---

## Troubleshooting

### Problem: Chrome MCP not opening page
**Solution:** Check if backend (port 5000) and frontend (port 5173) are running
```bash
# Check ports in use
netstat -ano | grep 5000
netstat -ano | grep 5173
```

### Problem: MongoDB MCP can't connect
**Solution:** Verify MongoDB URI in .env is correct
```
MONGODB_URI=mongodb+srv://Dhoni:Dhoni@cluster0.utffa.mongodb.net/startup-validator
```

### Problem: Context7 not finding documentation
**Solution:** Try resolving library ID first
```markdown
Claude: "Let me query Context7 for Node.js documentation"
→ First resolve: /npm/node
→ Then query: "HTTP server best practices"
```

### Problem: Shadcn components not rendering
**Solution:** Ensure all dependencies installed
```bash
cd client
npm install
```

---

## Next Steps

**When building Story 1.2 (User Login):**

```markdown
1. Context7: Get JWT token best practices
2. Write: Login endpoint with token generation
3. Shadcn: Create login form component
4. Chrome: Test form in browser
5. MongoDB: Verify credentials checked
6. Complete: Full login flow tested
```

**Use this CLAUDE.md whenever you need MCPs!**

---

**Quick Links:**
- 📖 Full Guide: See CLAUDE.md
- 📊 Current Status: _bmad-output/implementation-artifacts/sprint-status.yaml
- 📝 Story Details: _bmad-output/implementation-artifacts/stories/1-1-user-registration.md
- 🗄️ Database: MongoDB Atlas cluster0.utffa.mongodb.net

---

**Last Updated:** 2026-01-18 | **Status:** Story 1.1 Complete ✅
