# Full-Stack Hiring Challenge Scaffold

This repository provides a starter kit for a full-stack take-home exercise. The focus is on building out missing features and demonstrating end-to-end proficiency across React, Express, TypeORM, and PostgreSQL.

## Features Included

- JWT authentication with role-based access control (`admin`, `manager`, `user`)
- TypeORM data model showcasing one-to-many and many-to-many relations
- Task management CRUD endpoints and React UI
- File upload endpoint with disk storage and validation
- Responsive dashboard with animated carousel and backside flip interactions

## Tech Overview

- **Backend**: Node.js, Express, TypeORM, PostgreSQL
- **Frontend**: React (Vite, TypeScript), React Router, React Query

## Setup

### Backend

```bash
cd backend
cp env.example .env
npm run migration:run
npm run seed
npm install
```

#### Option 1: PostgreSQL (default)

```bash
npm run dev
```

The server starts on `http://localhost:4000`. Make sure PostgreSQL is running and the connection values in `.env` are valid.

#### Option 2: SQLite (no external DB required)

```bash
mkdir -p data
sqlite3 data/task_app.sqlite < sql/sqlite-sample.sql   # optional sample data
set DB_TYPE=sqlite # or export for bash/zsh
npm run migration:run                                  # sets up schema via TypeORM
npm run dev
```

When using SQLite you can customise the database location through `DB_PATH` in `.env`. Set `DB_SYNCHRONIZE=true` if you prefer schema auto-sync instead of migrations.

### Frontend

```bash
cd frontend
cp env.example .env
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:4000/api`. Adjust `VITE_API_URL` if the server URL differs.

## Developer Challenges

Complete **3 out of 5** challenges below. Focus on clean code, proper error handling, and thoughtful user experience.

### Challenge 1: Task Assignment UI ⭐
**Difficulty: Medium**

The backend already supports assigning users to tasks via `assigneeIds`, but the frontend UI is missing.

**Requirements:**
- Add a multi-select dropdown or autocomplete component to the task form : done
- Fetch and display list of users from the backend (create a users API endpoint if needed) : done
- Show assigned users on task cards in the task list : done
- Allow filtering tasks by assignee : done
- Display assignee avatars/initials on task cards : done

**Bonus:**
- Search/filter users in the assignee selector : done
- Show user roles next to names : done - you can see this in the card as badge of "admin", "manager", "user"
- Add visual indicators for tasks assigned to the current user : done - you can see this in the card badge of "you"

---

### Challenge 2: Task Filtering, Search & Pagination ⭐
**Difficulty: Medium**

Enhance the task list with better data management capabilities.

**Requirements:**
- Add search functionality (filter by title and description) : done
- Add status filter (todo, in_progress, done) with ability to select multiple : done
- Implement pagination on backend (limit, offset, or cursor-based) : done 
- Add pagination controls on frontend (page numbers, prev/next buttons) : done (now only shows total labels, to see this you have to add tasks over 10 or you can change the page display numbers manually in the code)
- Show total task count and current page info : done
- Persist filter/search state in URL query parameters : done

**Bonus:**
- Add sorting options (by date created, title, status) : done
- Add "My Tasks" filter (tasks where user is owner or assignee) : done
- Remember filter preferences in localStorage : done

---

### Challenge 3: Enhanced RBAC & Task Permissions
**Difficulty: Medium-Hard**

Implement proper role-based access control for task operations.

**Requirements:**
- **Backend:** Add permission checks in task controller: 
  - Regular users can only edit/delete tasks they own : done
  - Managers can edit any task but only delete their own : done
  - Admins have full access (edit/delete any task) : done
- **Backend:** Add middleware or helper function to check permissions : done
- **Frontend:** Hide edit/delete buttons based on user permissions : done
- **Frontend:** Show appropriate error messages when permission denied : done
- Add unit tests or integration tests for permission logic : done

**Bonus:**
- Add audit logging for permission-denied attempts : done
- Create a permissions matrix documentation : done
- Add role-based task visibility (users only see tasks they're involved in) : done

---

### Challenge 4: Task Detail View & Comments
**Difficulty: Medium**

Create a dedicated page for viewing and managing individual tasks.

**Requirements:**
- Create a new route `/tasks/:id` with a task detail page : done
- Display all task information (title, description, status, owner, assignees, attachments) : done
- Add a comments/notes section where users can: done
  - Add comments to tasks
  - View comment history with timestamps and authors
  - Edit/delete their own comments
- Backend: Create comments entity and API endpoints (CRUD operations) : done
- Add navigation from task list to detail view : done (by title)
- Show task creation and update timestamps : done

**Bonus:**
- Add @mention functionality in comments : done (as reply button for task)
- Show comment notifications : done (bell on the header)
- Add rich text formatting for comments
- Display task activity timeline

---

### Challenge 5: Input Validation & Error Handling
**Difficulty: Medium**

Improve validation and error handling throughout the application.

**Requirements:**
- **Backend:** Add comprehensive validation using `class-validator`: done
  - Email format validation for registration/login : done
  - Password strength requirements (min length, complexity) : done
  - Task title/description length limits : done
  - File upload validation (size, type, count) : done
- **Backend:** Create custom validation decorators where appropriate : done
- **Backend:** Return detailed, user-friendly error messages : done
- **Frontend:** Display validation errors inline in forms : done
- **Frontend:** Show loading states and handle network errors gracefully : done
- **Frontend:** Add form field validation before submission : done
- Handle edge cases: duplicate emails, invalid IDs, missing required fields

**Bonus:**
- Add request rate limiting middleware : done
- Implement client-side debouncing for search inputs : done (with 700ms)
- Add retry logic for failed API requests : done
- Create a centralized error handling system

---

## Submission Guidelines

After completing your challenges:

1. **Update README**: Document which challenges you completed and any additional setup required
2. **Submit Your Work**:
   - Add this repository to your GitHub account
   - Send an email to the hugo@findock.xyz with the repository link
   - We will review your submission and get back to you

**Important Notes:**
- **Quality over quantity**: It's better to complete fewer challenges well than many challenges poorly. Focus on demonstrating your understanding of the stack and best practices.
- **No AI Tools**: Please do not use AI tools like ChatGPT or Copilot for this assessment. We want to evaluate your own coding abilities and problem-solving skills.

