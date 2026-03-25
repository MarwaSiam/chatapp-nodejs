# ChatApp

A real-time chat application built with Node.js, Express, MariaDB, and Sequelize ORM.

---
## Author

**Marwa Abd Alrzaq**  

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [API Endpoints](#api-endpoints)
5. [Validation Rules](#validation-rules)
6. [Security](#security)
7. [Error Handling](#error-handling)
8. [Technologies Used](#technologies-used)
9. [Registration Flow](#registration-flow)
10. [Polling Mechanism](#polling-mechanism)

---

## Features

### Authentication
- Two-step registration process with 30-second timeout
- Secure password hashing using bcrypt (10 salt rounds)
- Session-based authentication with express-session
- Cookie management for registration flow preservation

### Chat Room
- Real-time message updates via polling (every 10 seconds)
- Full CRUD operations: Create, Read, Update, Delete messages
- Search functionality with SQL LIKE pattern matching
- Search keyword highlighting in results
- Messages ordered by date (newest first)
- Owner-only message editing and deletion
- Polling disabled during search to preserve results

### User Interface
- Responsive design with Bootstrap 5
- Avatar display with user initials
- Confirmation dialogs for delete actions
- Empty state display when no messages exist

---

## Project Structure

```
chatapp/
├── app.js                      # Application entry point and middleware setup
├── config/
│   └── database.js             # Database connection configuration
├── controllers/
│   ├── authController.js       # Registration and Login logic
│   ├── chatController.js       # Chat page rendering and message operations
│   └── messageController.js    # REST API for messages (PUT/GET)
├── middleware/
│   ├── auth.js                 # Session authentication middleware
│   └── errorHandler.js         # Centralized error handling
├── models/
│   ├── index.js                # Sequelize initialization and associations
│   ├── User.js                 # User model with password hashing hooks
│   └── Message.js              # Message model
├── public/
│   ├── css/
│   │   ├── chat.css            # Chat page styles
│   │   └── style.css           # Login/Register page styles
│   ├── images/
│   │   ├── chatapp.png         # Application logo
│   │   ├── background.png      # Background image
│   │   └── img.png             # Additional image
│   ├── js/
│   │   ├── chat.js             # Chat functionality (polling, editing)
│   │   ├── login.js            # Login form validation and submission
│   │   ├── register.js         # Two-step registration with countdown
│   │   └── validators-client.js # Client-side validation
│   ├── login.html              # Login page
│   └── register.html           # Registration page
├── routes/
│   ├── api.js                  # API routes (/api/*)
│   └── chat.js                 # Chat routes (/chat/*)
├── utils/
│   └── validators.js           # Server-side validation functions
├── views/
│   ├── chat.ejs                # Chat room template
│   └── error.ejs               # Error page template
├── package.json                # Project dependencies
└── README.md                   # Project documentation
```

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MariaDB database server
- Docker (optional)

### Steps

1. Clone the repository
```bash
git clone <repository-url>
cd chatapp
```

2. Install dependencies
```bash
npm install
```

3. Start the database (using Docker)
```bash
docker-compose up -d
```

4. Run the application
```bash
npm start
```

5. Open in browser
```
http://localhost:3000
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/register/step1` | Start registration | `{ email, firstName, lastName }` |
| POST | `/api/register/step2` | Complete registration | `{ password, confirmPassword }` |
| POST | `/api/login` | User login | `{ email, password }` |
| POST | `/logout` | User logout | - |

### Message Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/messages` | Get all messages (polling) | Query: `?lastUpdate=<timestamp>` |
| POST | `/chat/add` | Add new message | `{ content }` |
| PUT | `/api/messages/:id` | Edit message (owner only) | `{ content }` |
| POST | `/chat/delete/:id` | Delete message (owner only) | - |

### Page Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Login page |
| GET | `/register` | Registration page |
| GET | `/chat` | Chat room (authenticated) |
| GET | `/chat/search` | Search messages (Query: `?q=<search_term>`) |

### Response Format

Success:
```json
{
  "ok": true,
  "message": "Operation successful"
}
```

Error:
```json
{
  "ok": false,
  "message": "Error description"
}
```

---

## Validation Rules

### Email
| Rule | Description |
|------|-------------|
| Required | Cannot be empty |
| Format | Must be valid email format |
| Max Length | 32 characters |
| Normalization | Converted to lowercase, trimmed |

### Name (First Name and Last Name)
| Rule | Description |
|------|-------------|
| Required | Cannot be empty |
| Min Length | 3 characters |
| Max Length | 32 characters |
| Characters | Letters only (A-Z, a-z) |
| Normalization | Converted to lowercase, trimmed |

### Password
| Rule | Description |
|------|-------------|
| Required | Cannot be empty |
| Min Length | 3 characters |
| Max Length | 32 characters |
| Normalization | Trimmed |

### Message Content
| Rule | Description |
|------|-------------|
| Required | Cannot be empty |
| Max Length | 500 characters |
| Normalization | Trimmed |

---

## Security

### XSS (Cross-Site Scripting) Protection

Server-side (EJS):
- Using `<%= %>` for automatic HTML escaping of message content
- Manual escaping for data attributes using replace functions

Client-side (JavaScript):
- `escapeHtml()` function escapes dangerous characters: `& < > " ' / ` =`
- `escapeAttr()` function for safe data attributes

### SQL Injection Prevention

- Sequelize ORM with parameterized queries
- LIKE pattern escaping for search:
```javascript
const escapedQuery = query
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
```

### Password Security

- Hashed using bcrypt with 10 salt rounds
- Hashing occurs in Sequelize hooks (beforeCreate, beforeUpdate)
- Plain passwords never stored

### Session Security

- express-session for session management
- HTTP-only cookies
- Session destruction on logout

### Input Validation

- Dual validation: Client-side and Server-side
- Client-side: `validators-client.js` for immediate feedback
- Server-side: `validators.js` for security enforcement

---

## Error Handling

### Centralized Error Handler

All errors are processed through `middleware/errorHandler.js`:

- `asyncHandler`: Wraps async controller functions to catch errors
- `errorHandler`: Returns JSON for API requests, renders error page for page requests
- `notFoundHandler`: Handles 404 errors

### Error Types

| Status Code | Description | When |
|-------------|-------------|------|
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Editing/deleting others' messages |
| 404 | Not Found | Page or message not found |
| 408 | Request Timeout | Registration timeout (30s) |
| 409 | Conflict | Email already in use |
| 500 | Server Error | Unexpected errors |

---

## Technologies Used

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MariaDB |
| ORM | Sequelize |
| Templating | EJS |
| Frontend | HTML5, CSS3, JavaScript |
| Styling | Bootstrap 5 |
| Security | bcrypt |
| Session | express-session |
| Cookies | cookie-parser |

---

## Registration Flow

```
Step 1                          Step 2                          Success
┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
│  Enter:             │        │  Enter:             │        │                     │
│  - Email            │───────>│  - Password         │───────>│  Redirect to        │
│  - First Name       │        │  - Confirm Password │        │  Login Page         │
│  - Last Name        │        │                     │        │                     │
└─────────────────────┘        └─────────────────────┘        └─────────────────────┘
         │                              │
         │      30 Second Timeout       │
         │                              │
         │    Cookies Created:          │
         │    - reg_email               │
         │    - reg_first               │
         │    - reg_last                │
         │    - reg_started             │
         └──────────────────────────────┘
```

If 30 seconds pass before Step 2 completion:
- Cookies expire automatically
- User must restart registration

---

## Polling Mechanism

The chat uses polling for real-time updates:

1. Client sends GET `/api/messages?lastUpdate=<timestamp>`
2. Server compares timestamps
3. If new messages exist: returns messages array
4. If no changes: returns `{ hasUpdates: false }`
5. Client waits 10 seconds and repeats

Polling is disabled during search mode to preserve search results.

---

## Search Feature

- Search messages using the search bar
- Results filtered using SQL LIKE pattern
- Matching keywords are highlighted in yellow
- Click "Clear" to return to normal chat view

---