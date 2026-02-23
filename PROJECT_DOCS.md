# Adrian CIMS - Microfinance Management System
**Last Updated:** February, 2026
**Author:** Fina Adriano

## 📋 Project Overview
A comprehensive Customer Information Management System (CIMS) built for microfinance operations in Tanzania. The system manages customers, loans, payments, court cases, and provides complete audit trails for all actions.

## 🎯 Current Status (What's Working)

### ✅ Authentication System
- User registration and login with JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control (super_admin, admin, loan_officer, customer_service, viewer, customer)
- Session persistence across page reloads
- Automatic logout on token expiry

### ✅ Database Schema (Prisma)
All models are properly set up with relations and indexes:
- **User** - Staff and customer accounts with role management
- **Customer** - Complete client profiles with document tracking
- **Loan** - Multi-stage approval workflow (stage 1, 2, 3)
- **Payment** - Payment tracking with methods and references
- **CourtCase** - Legal case management for defaulters
- **AuditLog** - Complete audit trail for all actions
- **CustomerDocument** - Document upload and verification

### ✅ Admin Dashboard
- Real-time statistics (customer count, loan status, financial data)
- Dark mode support throughout
- Responsive design (works on mobile/desktop)
- Pending approvals widget
- Recent activity feed
- Portfolio summary with visual indicators
- Auto-refresh every 60 seconds
- Falls back to mock data if database is unavailable (no console errors)

### ✅ API Routes
/api/
├── auth/
│ ├── POST login - Authenticate user
│ ├── POST signup - Register new user
│ ├── POST logout - End session
│ └── GET me - Get current user
├── admin/
│ ├── GET stats - Dashboard statistics
│ ├── GET pending-approvals - Loans waiting for review
│ ├── GET ready-for-disbursement - Approved loans
│ ├── GET recent-payments - Latest payments
│ └── GET customers - List all customers


### ✅ Environment Setup
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/adrian_cims"

# App Configuration
NEXT_PUBLIC_APP_NAME="Adrian CIMS"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key"

# 1. Clone and install
npm install

# 2. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:3000

adrian/
├── prisma/
│   ├── schema.prisma           # Database models and relations
│   └── migrations/              # Auto-generated migrations
├── src/
│   ├── app/
│   │   ├── admin/               # Admin area (requires auth)
│   │   │   ├── dashboard/        # Main dashboard page
│   │   │   ├── customers/        # Customer management
│   │   │   │   ├── page.tsx      # Customer list
│   │   │   │   └── [id]/         # Individual customer
│   │   │   ├── loans/            # Loan management
│   │   │   ├── approvals/        # Loan approvals
│   │   │   └── layout.tsx        # Admin layout with sidebar
│   │   ├── api/                  # All API routes
│   │   │   └── admin/            
│   │   │       ├── stats/         # Dashboard stats
│   │   │       └── customers/     # Customer CRUD
│   │   ├── login/                 # Login page
│   │   └── signup/                # Registration page
│   ├── components/                # Reusable UI components
│   │   ├── ThemeToggle.tsx        # Dark mode toggle
│   │   └── ProtectedRoute.tsx     # Auth wrapper
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuth.ts             # Authentication hook
│   └── lib/                       # Utilities
│       ├── auth.ts                 # Auth functions
│       └── db.ts                   # Prisma client
├── .env                            # Environment variables
├── tailwind.config.js              # Tailwind setup
└── package.json                    # Dependencies

🔐 Role-Based Access Control
Role	Permissions
super_admin	Full system access, can delete records, view audit logs
admin	Most operations, cannot delete permanently
loan_officer	Create loans, view customers, process applications
customer_service	View customers, manual upload, basic updates
viewer	Read-only access to all data

📊 Key Features Explained
Audit Trail System
Every action is logged in the AuditLog table with:

Who performed the action (user ID, name, role)

What action (CREATE, UPDATE, DELETE, VIEW, LOGIN)

When it happened (timestamp)

What changed (before/after values for updates)

IP address and user agent (browser info)

Multi-Stage Loan Approval
Stage 1: Loan officer reviews and initial approval

Stage 2: Admin reviews and final approval

Stage 3: Super_admin approves for disbursement

Stage 4: Disbursed (funds released)

Document Management
Customers can upload:

National ID (NIDA)

Passport photos

Bank statements

Salary slips

Business licenses

Court documents

Guarantor letters

Database Connection
# Test connection
psql -U postgres -h localhost -d adrian_cims

# If connection fails, check:
# 1. PostgreSQL service is running
# 2. DATABASE_URL in .env is correct
# 3. Password has no special characters needing encoding

# 1. Check database connection
npx prisma studio

# 2. Verify user exists
SELECT * FROM "User";

# 3. Check console for errors
# Look for "PrismaClientInitializationError"

🎨 Design System
Primary: Blue (#3B82F6) - Actions, links

Success: Green (#10B981) - Approved, paid

Warning: Yellow (#F59E0B) - Pending, in review

Danger: Red (#EF4444) - Overdue, rejected

Dark Mode: Automatic, follows system preference

Typography: Inter font family

Icons: Lucide React (consistent icon set)

 What's Coming Next (In Progress)
Phase 1: Customer Management (Current Sprint)
Add new customer form

Edit customer details

Delete with audit trail (who deleted, when)

View customer history

Document upload for customers

Phase 2: Loan Processing (Next Sprint)
Loan application form

Document requirements based on loan amount

Multi-stage approval workflow

Disbursement processing

Payment tracking

Phase 3: Reports & Analytics (Future)
Portfolio at risk reports

Loan performance dashboard

Customer demographics

Export to Excel/PDF

Email notifications

Phase 4: Testing & Deployment (Future)
Unit tests for critical functions

Integration tests for API

Load testing

Production deployment guide

Adding a New Feature
Dont forget to Check if similar feature exists (copy pattern)

Update schema if needed → npx prisma migrate dev

Create API route in app/api/

Create page in appropriate folder

Test with real data

Update this documentation regulary

Coding Style
Uses TypeScript for all new files

Add comments for complex logic

Follow existing naming conventions

Use Tailwind classes for styling

Test dark mode on new pages


to be updated...