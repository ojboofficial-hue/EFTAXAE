# EmaraTax Application - Comprehensive Codebase Overview

## Table of Contents
1. [Authentication System](#authentication-system)
2. [Database Schema](#database-schema)
3. [Data Models & User Associations](#data-models--user-associations)
4. [Component Architecture](#component-architecture)
5. [API Routes](#api-routes)
6. [Application Initialization Flow](#application-initialization-flow)

---

## Authentication System

### Overview
The app uses JWT-based authentication with session cookies. Authentication is handled through:
- **Frontend**: React Context (AuthContext)
- **Backend**: Express.js with JWT tokens and bcrypt password hashing
- **Storage**: HttpOnly cookies (secure, server-side only)

### Frontend Authentication Flow

#### **AuthContext** (`src/contexts/AuthContext.tsx`)
- **Purpose**: Global authentication state management
- **Provider**: `AuthProvider` wraps the entire React app
- **Hook**: `useAuth()` provides access to auth state and functions

**Key Functions:**
- `login(username, password)` - Authenticates user via `/api/auth/login`
- `register(username, password, displayName)` - Creates new user via `/api/auth/register`
- `logout()` - Clears session via `/api/auth/logout`
- `checkAuth()` - Verifies session on app load via `/api/auth/me`

**State:**
```typescript
user: UserProfile | null        // Current logged-in user
loading: boolean                // Auth check in progress
```

#### **Login Component** (`src/pages/Login.tsx`)
- Supports both login and registration modes
- Username/password validation (min 5 characters)
- Default credentials: `admin` / `admin`
- Shows loading animation during authentication
- Displays error messages for failed attempts
- Toggles between sign-in and register forms

### Backend Authentication Routes

#### **POST /api/auth/register**
Creates a new user account
- **Parameters**: `username`, `password`, `displayName`, `role` (optional, defaults to 'corporate')
- **Process**:
  1. Hash password with bcrypt
  2. Generate auto-email: `username@emara.tax`
  3. Create user record in database
- **Returns**: Success message or error if username exists

#### **POST /api/auth/login**
Authenticates user and creates session
- **Parameters**: `username`, `password`
- **Process**:
  1. Look up user by username or email
  2. Compare password with bcrypt hash
  3. Generate JWT token with user id and username
  4. Set HttpOnly secure cookie with token
  5. Return user object (id, username, displayName, role)
- **Special Logic**: Auto-creates admin user if credentials are `admin`/`admin`

#### **POST /api/auth/logout**
Clears authentication cookie
- **Returns**: Logout confirmation message

#### **GET /api/auth/me**
Retrieves current authenticated user profile
- **Auth Required**: Yes (via JWT token in cookie)
- **Returns**: Full user object with all fields
- **Used by**: AuthContext on app initialization

### Authentication Middleware

**Function**: `authenticateToken` (server.ts)
- Verifies JWT token from cookies
- Returns 401 if no token present
- Returns 403 if token invalid or expired
- Sets `req.user` for authenticated routes

**All data endpoints require authentication** - returns 401/403 if unauthenticated

---

## Database Schema

### Technology
- **Database**: SQLite (better-sqlite3)
- **File**: `database.db`
- **Initialization**: Auto-creates on server startup via `db.exec()`

### Tables

#### **users** - Core User Accounts
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,          -- bcrypt hash
  displayName TEXT,
  role TEXT,              -- 'corporate', 'person', 'agent', 'admin'
  createdAt TEXT          -- ISO timestamp
);
```

**User Roles:**
- `admin` - System administrator with full access
- `corporate` - Corporate entity tax filer
- `person` - Individual tax filer
- `agent` - Tax agent

#### **vat_returns** - VAT Filing Records
```sql
CREATE TABLE vat_returns (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  status TEXT,            -- 'Filed', 'Draft', 'Overdue', 'Submitted'
  period TEXT,            -- Display period (e.g., "01/12/2025 - 28/02/2026")
  vatRef TEXT,            -- VAT reference number
  periodFrom TEXT,        -- Start date
  periodTo TEXT,          -- End date
  taxYearEnd TEXT,        -- Tax year end date
  totalSales REAL,        -- Total sales amount
  totalVAT REAL,          -- Total VAT on sales
  totalExpenses REAL,     -- Total expense amounts
  totalRecoverableVAT REAL, -- Recoverable VAT
  netVAT REAL,            -- Net VAT position
  dueDate TEXT,           -- Payment/filing due date
  filedAt TEXT,           -- When filed (null if draft)
  updatedAt TEXT,         -- Last update timestamp
  createdAt TEXT,         -- Creation timestamp
  formData TEXT           -- JSON string with detailed form data
);
```

#### **payments** - Payment Records
```sql
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  type TEXT,              -- 'VAT Payment', 'Corporate Tax', etc.
  amount REAL,            -- Payment amount
  status TEXT,            -- 'Paid', 'Outstanding', 'Processing'
  dueDate TEXT,           -- Due date
  paidAt TEXT,            -- Payment date (null if unpaid)
  createdAt TEXT
);
```

#### **corporate_tax_returns** - Corporate Tax Records
```sql
CREATE TABLE corporate_tax_returns (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  status TEXT,            -- 'Filed', 'Draft', 'Overdue', 'Submitted'
  period TEXT,            -- Tax year (e.g., "2024")
  netTax REAL,            -- Net tax amount
  dueDate TEXT,
  filedAt TEXT,           -- null if draft
  updatedAt TEXT,
  createdAt TEXT,
  formData TEXT           -- JSON with taxable income, etc.
);
```

#### **correspondence** - Messages & Official Documents
```sql
CREATE TABLE correspondence (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  subject TEXT,
  fromName TEXT,          -- Sender name
  date TEXT,
  status TEXT,            -- 'Unread', 'Read', 'Resolved'
  content TEXT,           -- Message content
  createdAt TEXT
);
```

#### **registrations** - Tax Registrations (TRN)
```sql
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  taxType TEXT,           -- 'VAT', 'Corporate Tax', 'Excise Tax'
  trn TEXT,               -- Tax Registration Number
  status TEXT,            -- 'Active', 'Pending', 'Suspended'
  effectiveDate TEXT,     -- Registration effective date
  entityName TEXT,        -- Registered entity name
  createdAt TEXT
);
```

#### **documents** - Supporting Documents
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  userId TEXT,            -- FOREIGN KEY to users.id
  vatReturnId TEXT,       -- FOREIGN KEY to vat_returns.id
  fileName TEXT,
  fileType TEXT,          -- MIME type (e.g., 'application/pdf')
  fileData TEXT,          -- Base64 encoded file content
  createdAt TEXT
);
```

### Database Seed Data
On server startup, seed data is populated if database is empty:

**Test Users:**
1. **admin** / **admin**
   - ID: `admin-id`
   - Role: `admin`
   - Display Name: MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C

2. **corporate_user** / **password123**
   - ID: `user-1`
   - Role: `corporate`
   - Display Name: Global Trading LLC

3. **person_user** / **password123**
   - ID: `user-2`
   - Role: `person`
   - Display Name: John Doe

Each user has sample data for:
- 2 registrations (VAT + Corporate Tax)
- 5-6 VAT returns with varying statuses
- 2 Corporate tax returns
- 7 payment records
- 3 correspondence entries

---

## Data Models & User Associations

### TypeScript Interfaces (`src/types/index.ts`)

#### **UserProfile**
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: UserRole;  // 'corporate' | 'person' | 'agent' | 'admin'
  createdAt: string;
}
```

#### **Registration**
```typescript
interface Registration {
  id: string;
  userId: string;          // Links to UserProfile
  taxType: 'VAT' | 'Corporate Tax' | 'Excise Tax';
  trn: string;            // Tax Registration Number
  status: 'Active' | 'Pending' | 'Suspended';
  effectiveDate: string;
  entityName: string;
}
```

#### **VATReturn**
```typescript
interface VATReturn {
  id: string;
  userId: string;          // Links to UserProfile
  period: string;          // Display period
  dueDate: string;
  status: 'Filed' | 'Draft' | 'Overdue' | 'Submitted';
  vatRef?: string;         // VAT reference number
  totalSales: number;
  totalVAT: number;
  totalExpenses: number;
  totalRecoverableVAT: number;
  netVAT: number;          // Amount owed or refund
  filedAt?: string;
  formData?: any;          // Detailed VAT form data
}
```

#### **CorporateTaxReturn**
```typescript
interface CorporateTaxReturn {
  id: string;
  userId: string;          // Links to UserProfile
  accountingPeriod: string;
  taxableIncome: number;
  taxAmount: number;
  status: 'Filed' | 'Draft' | 'Overdue' | 'Submitted';
  filedAt?: string;
  dueDate: string;
  formData?: any;
}
```

#### **Payment**
```typescript
interface Payment {
  id: string;
  userId: string;          // Links to UserProfile
  amount: number;
  type: string;            // 'VAT Payment', 'Corporate Tax', etc.
  status: 'Paid' | 'Outstanding' | 'Processing';
  dueDate: string;
  paidAt?: string;
}
```

#### **Correspondence**
```typescript
interface Correspondence {
  id: string;
  userId: string;          // Links to UserProfile
  subject: string;
  type: 'Message' | 'Certificate' | 'NOC' | 'Audit';
  status: 'Unread' | 'Read' | 'Resolved';
  content: string;
  createdAt: string;
}
```

#### **Document**
```typescript
interface Document {
  id: string;
  userId: string;
  vatReturnId: string;     // Links to VATReturn
  fileName: string;
  fileType: string;
  fileData?: string;       // Base64 encoded
  createdAt: string;
}
```

### Data Relationships Diagram

```
UserProfile
  ├── id (primary)
  └── Multiple records in:
      ├── vat_returns (userId FK)
      ├── corporate_tax_returns (userId FK)
      ├── payments (userId FK)
      ├── correspondence (userId FK)
      ├── registrations (userId FK)
      └── documents (userId FK)

VATReturn
  ├── id (primary)
  ├── userId (FK → UserProfile)
  └── formData contains:
      ├── Sales (by emirate, tourist refunds, reverse charge, etc.)
      ├── Expenses (standard rated, reverse charge)
      ├── Refund request flag
      ├── Profit margin scheme flag

Document
  ├── id (primary)
  ├── userId (FK → UserProfile)
  └── vatReturnId (FK → VATReturn)
```

### Data Association in Code

**All data fetching is user-specific:**
- Database queries filter by `userId`
- Backend middleware verifies JWT token before allowing access
- Frontend dataService calls always return authenticated user's data only

Example:
```sql
-- Only returns returns for the authenticated user
SELECT * FROM vat_returns WHERE userId = ?
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx
├── AuthProvider (Context)
├── ToastProvider (Context)
├── ErrorBoundary
└── Router
    ├── Route: /login
    │   └── Login.tsx
    │
    └── ProtectedRoute (requires authentication)
        └── Layout.tsx
            ├── Sidebar.tsx
            ├── Header.tsx
            └── Main Content Routes:
                ├── Dashboard.tsx
                ├── VAT Routes:
                │   ├── VATLanding.tsx
                │   ├── VATReporting.tsx
                │   ├── VATServices.tsx
                │   ├── VATRefund.tsx
                │   ├── MyFilings.tsx
                │   ├── NewVATReturn.tsx
                │   └── VATReturnDetail.tsx
                ├── Corporate Tax Routes:
                │   ├── CorporateTax.tsx (RoleGuard)
                │   └── NewCorporateTaxReturn.tsx (RoleGuard)
                ├── Correspondence.tsx
                ├── Payments.tsx
                ├── Payment Routes:
                │   ├── PaymentSelection.tsx
                │   └── PaymentGateway.tsx
                ├── TaxablePerson.tsx
                ├── OtherServices.tsx
                └── Placeholders:
                    ├── ExciseTax.tsx
                    ├── UserAuthorization.tsx
                    ├── Audit.tsx
                    └── EInvoicing.tsx
```

### Key Components

#### **ProtectedRoute**
- Wraps authenticated routes
- Checks `useAuth()` state
- Shows loading spinner while verifying
- Redirects to `/login` if unauthenticated

#### **RoleGuard**
- File: `src/components/RoleGuard.tsx`
- Restricts routes by user role
- Usage: Corporate Tax routes (allows 'corporate', 'agent')
- Redirects to dashboard if unauthorized

#### **Layout**
- File: `src/components/Layout.tsx`
- Contains Sidebar (navigation), Header (top bar), and main content area
- Responsive mobile sidebar with overlay
- Floating action buttons for support
- Footer with links and contact info

#### **ErrorBoundary**
- File: `src/components/ErrorBoundary.tsx`
- Catches React rendering errors
- Prevents entire app crash

#### **Header** (`src/components/Header.tsx`)
- Search functionality
- User menu (if implemented)
- Mobile menu toggle

#### **Sidebar** (`src/components/Sidebar.tsx`)
- Navigation menu with VAT, Corporate Tax, Payments, etc.
- Responsive hamburger menu on mobile
- Active route highlighting

---

## API Routes

### Base URL
`http://localhost:3000` (dev) or production URL

### Authentication Routes

#### `POST /api/auth/register`
Register new user
- **Body**: `{ username: string, password: string, displayName: string, role?: UserRole }`
- **Returns**: `{ message: string }`
- **Status**: 201 (success), 400 (error)

#### `POST /api/auth/login`
Authenticate user
- **Body**: `{ username: string, password: string }`
- **Returns**: `{ user: UserProfile }`
- **Status**: 200 (success), 401 (invalid credentials)
- **Side Effect**: Sets HttpOnly cookie `token`

#### `POST /api/auth/logout`
Clear session
- **Returns**: `{ message: string }`

#### `GET /api/auth/me`
Get current user
- **Auth Required**: ✓ (JWT token in cookie)
- **Returns**: `UserProfile`
- **Status**: 200 (authenticated), 401/403 (not authenticated)

### VAT Return Routes

#### `GET /api/vat_returns`
List user's VAT returns
- **Auth Required**: ✓
- **Returns**: `VATReturn[]`
- **Filter**: Only returns for authenticated user
- **Order**: By updatedAt DESC

#### `GET /api/vat_returns/:id`
Get specific VAT return
- **Auth Required**: ✓
- **Returns**: `VATReturn`
- **Status**: 404 if not found or unauthorized

#### `POST /api/vat_returns`
Create new VAT return
- **Auth Required**: ✓
- **Body**: VAT return fields (status, period, sales, etc.)
- **Returns**: `{ id: string }`
- **Note**: Auto-sets `filedAt` if status is 'Submitted'

#### `PUT /api/vat_returns/:id`
Update VAT return
- **Auth Required**: ✓
- **Body**: Updated fields
- **Returns**: `{ message: string }`
- **Note**: Updates `updatedAt` timestamp

#### `DELETE /api/vat_returns/:id`
Delete VAT return
- **Auth Required**: ✓
- **Returns**: `{ message: string }`
- **Status**: 404 if not found

### Payment Routes

#### `GET /api/payments`
List user's payments
- **Auth Required**: ✓
- **Returns**: `Payment[]`
- **Order**: By createdAt DESC

#### `POST /api/payments`
Create payment record
- **Auth Required**: ✓
- **Body**: `{ type: string, amount: number, status: string, dueDate: string }`
- **Returns**: `{ id: string }`

#### `PUT /api/payments/:id`
Update payment status
- **Auth Required**: ✓
- **Body**: `{ status: 'Paid' | 'Outstanding' | 'Processing' }`
- **Returns**: `{ message: string }`
- **Side Effect**: Sets `paidAt` timestamp if status changed to 'Paid'

### Corporate Tax Routes

#### `GET /api/corporate_tax_returns`
List user's corporate tax returns
- **Auth Required**: ✓
- **Returns**: `CorporateTaxReturn[]`

#### `POST /api/corporate_tax_returns`
Create corporate tax return
- **Auth Required**: ✓
- **Body**: Tax return fields
- **Returns**: `{ id: string }`

#### `DELETE /api/corporate_tax_returns/:id`
Delete corporate tax return
- **Auth Required**: ✓

### Correspondence Routes

#### `GET /api/correspondence`
List user's messages/documents
- **Auth Required**: ✓
- **Returns**: `Correspondence[]`
- **Order**: By date DESC

### Registration Routes

#### `GET /api/registrations`
List user's tax registrations
- **Auth Required**: ✓
- **Returns**: `Registration[]`
- **Order**: By createdAt DESC

### Document Routes

#### `GET /api/documents`
List user's documents
- **Auth Required**: ✓
- **Returns**: `Document[]` with joined VAT reference
- **Note**: Joins with vat_returns table

#### `GET /api/documents/:vatReturnId`
List documents for specific VAT return
- **Auth Required**: ✓
- **Returns**: `Document[]`

#### `GET /api/documents/download/:id`
Download document
- **Auth Required**: ✓
- **Returns**: Document object with fileData (base64)

#### `POST /api/documents/upload`
Upload document
- **Auth Required**: ✓
- **Body**: `{ vatReturnId: string, fileName: string, fileType: string, fileData: string }`
- **Returns**: `{ id: string }`

#### `POST /api/send-receipt`
Send payment receipt
- **Auth Required**: ✓
- **Body**: `{ amount: number, reference: string, email: string }`
- **Side Effect**: 
  - Logs email simulation to console
  - Inserts receipt into correspondence table (user's inbox)
- **Returns**: `{ success: true, id: string }`

### Utility Routes

#### `GET /api/health`
Health check
- **Auth Required**: ✗
- **Returns**: `{ status: 'ok', timestamp: string }`

---

## Application Initialization Flow

### Server Startup Sequence

#### 1. **Load Environment Variables** (`dotenv/config`)
   - Loads from `.env` file
   - Variables: `JWT_SECRET`, `NODE_ENV`, etc.

#### 2. **Initialize Database** (server.ts)
   ```typescript
   const db = new Database('database.db');
   db.exec(`CREATE TABLE IF NOT EXISTS ...`);
   ```
   - Creates SQLite database
   - Creates all tables if they don't exist
   - Connection is persistent for session

#### 3. **Seed Database** (`seedDatabase()`)
   - Checks if users already exist
   - If empty, creates 3 test users with mock data
   - Creates registrations, VAT returns, payments, etc. for each user

#### 4. **Start Express Server**
   - Middleware setup:
     - `express.json()` - Parse JSON requests
     - `cookieParser()` - Parse cookies
   - Register all API routes
   - Setup Vite dev server (dev), or static file serving (prod)
   - Listen on port 3000

### Client-Side Initialization Sequence

#### 1. **Entry Point** (`src/main.tsx`)
   ```typescript
   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <App />
     </StrictMode>
   );
   ```

#### 2. **App Component** (`src/App.tsx`)
   - Wraps app with providers:
     1. `ErrorBoundary` - Catch errors
     2. `AuthProvider` - Authentication state
     3. `ToastProvider` - Toast notifications
     4. `Router` - Route handling

#### 3. **AuthProvider Initialization**
   ```typescript
   useEffect(() => {
     const checkAuth = async () => {
       const response = await fetch('/api/auth/me');
       if (response.ok) {
         const userData = await response.json();
         setUser(userData);
       }
     };
     checkAuth();
   }, []);
   ```
   - Makes request to `/api/auth/me`
   - If cookie has valid JWT token, fetches user profile
   - Sets `user` state (or null if not authenticated)
   - Sets `loading = false` when check completes

#### 4. **Router Initialization**
   - If `user` is null:
     - Shows `/login` route
   - If `user` exists:
     - Shows protected routes wrapped in `Layout`
     - Loads `Dashboard` as default route

#### 5. **Layout Initialization**
   - Renders `Sidebar`, `Header`, and main content area
   - Initializes responsive state (sidebar open/closed)

#### 6. **Page Component Initialization** (e.g., Dashboard)
   ```typescript
   useEffect(() => {
     const fetchData = async () => {
       const [filings, regs, payments] = await Promise.all([
         dataService.getVATReturns(),
         dataService.getRegistrations(),
         dataService.getPayments()
       ]);
       // Update state with data
     };
     fetchData();
   }, [user]);
   ```
   - Calls data service endpoints
   - Populates component state
   - Renders page content

---

## Data Flow Example: User Login

### User Logs In

1. **User enters credentials in Login.tsx**
   ```
   username: "admin"
   password: "admin"
   ```

2. **Click "Sign In to Portal"**
   - Calls `login("admin", "admin")` from AuthContext

3. **Frontend POST /api/auth/login**
   ```json
   {
     "username": "admin",
     "password": "admin"
   }
   ```

4. **Backend processes login**
   - Queries users table: `SELECT * FROM users WHERE username = ?`
   - Compares password with bcrypt: `bcrypt.compare("admin", stored_hash)`
   - Creates JWT token: `jwt.sign({ id: user.id, username: user.username }, SECRET)`
   - Sets cookie: `res.cookie('token', token, { httpOnly: true, secure: true })`

5. **Backend returns user object**
   ```json
   {
     "user": {
       "id": "admin-id",
       "username": "admin",
       "displayName": "MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C",
       "role": "admin"
     }
   }
   ```

6. **Frontend receives response**
   - `setUser(data.user)` in AuthContext
   - `navigate('/')` to dashboard
   - Update `useAuth()` hook returns the user object

7. **Subsequent requests use token**
   - Browser automatically sends cookie with requests
   - Server middleware verifies JWT from cookie
   - `req.user` is set for protected routes
   - User only sees their own data

---

## Example: Page Fetching User Data

### Dashboard.tsx fetches and displays user-specific data

```typescript
useEffect(() => {
  const fetchData = async () => {
    if (!user) return;  // Wait for auth
    
    // Make authenticated requests (cookie sent automatically)
    const [filings, regs, payments] = await Promise.all([
      dataService.getVATReturns(),      // GET /api/vat_returns
      dataService.getRegistrations(),   // GET /api/registrations
      dataService.getPayments()         // GET /api/payments
    ]);
    
    // Server verifies JWT and returns only user's data
    // Data is automatically filtered by userId in backend
    
    // Update state with data
    setRecentFilings(filings);
    setRegistrations(regs);
    // ... calculate stats
  };
  
  fetchData();
}, [user]);  // Re-run if user changes (after login)
```

**Result**:
- User sees their VAT returns, registrations, and payments
- No cross-contamination of user data
- All data is server-side authenticated

---

## Security Features

1. **JWT in HttpOnly Cookies**
   - Prevents XSS token theft
   - Marked secure (HTTPS only in production)
   - SameSite: 'none' (allow cross-site requests if needed)

2. **Password Hashing**
   - Bcrypt with 10 salt rounds
   - Original password never stored

3. **Server-Side Data Filtering**
   - All queries include `WHERE userId = req.user.id`
   - Prevents users from accessing others' data via API

4. **Route Protection**
   - `ProtectedRoute` requires authentication
   - `RoleGuard` requires specific roles
   - All API routes require valid JWT token

5. **CORS & Same-Site**
   - Cookie settings enforce same-origin requests

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [server.ts](server.ts) | Express backend, DB setup, API routes |
| [src/main.tsx](src/main.tsx) | React entry point |
| [src/App.tsx](src/App.tsx) | Root component, routing |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Authentication state management |
| [src/pages/Login.tsx](src/pages/Login.tsx) | Login/register page |
| [src/services/dataService.ts](src/services/dataService.ts) | API client methods |
| [src/types/index.ts](src/types/index.ts) | TypeScript interfaces |
| [src/components/RoleGuard.tsx](src/components/RoleGuard.tsx) | Role-based access control |
| [src/components/Layout.tsx](src/components/Layout.tsx) | Main layout wrapper |

---

## Summary

**Authentication**: JWT-based with React Context, backend verification on every request

**Database**: SQLite with 7 tables, all user data filtered by userId

**Data Association**: Each user has independent records for VAT returns, payments, correspondence, etc.

**Component Protection**: ProtectedRoute for auth, RoleGuard for roles

**API**: RESTful endpoints, all authenticated, user-specific data only

**Initialization**: Server seeds DB on startup, client checks auth on mount, pages fetch user-specific data
