
# Adrian CIMS - Microfinance Management System
**Last Updated:** March, 2026
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
  - Fields: firstName, surname, phoneNumber, email, etc.
  - Status determined by activeLoans, overdueLoans, totalLoans counters
  - Soft delete with deletedAt, deletedById, deletionReason
- **Loan** - Multi-stage approval workflow (stage 1, 2, 3)
- **Payment** - Payment tracking with methods and references
- **CourtCase** - Legal case management for defaulters
- **AuditLog** - Complete audit trail for all actions
- **CustomerDocument** - Document upload and verification

### ✅ Admin Dashboard
- Real-time statistics from database (no hardcoded data)
- Dark mode support throughout
- Responsive design (works on mobile/desktop)
- Pending approvals widget with role-based filtering
- Recent payments with confirmation status
- Ready for disbursement section (super_admin only)
- Quick actions grid with role-based visibility
- Auto-refresh every 60 seconds
- Safe handling of undefined values (no more .toFixed errors)

### ✅ Customer Management
- **Active Customers Page** (`/admin/customers/active`)
  - Shows REAL active customers (activeLoans > 0)
  - Stats cards with K/M/B formatting (TSh 1.4M, TSh 473.3K)
  - Real-time counts from database
  - Refresh button to update data
  - Customer list with avatars, loan details, progress bars

- **Customer Overview Page** (`/admin/customers/overview`)
  - Complete dashboard with customer segments
  - Real stats from database
  - Recent customers table
  - Risk distribution charts
  - Loan performance metrics
  - Upcoming payments calendar

- **Sidebar Navigation**
  - Shows REAL counts from database:
    - Overview: 5 (total customers)
    - Active: 3 (customers with active loans)
    - Overdue: 0 (customers with overdue loans)
    - Completed: 0 (customers with completed loans)
    - Deleted: 1 (soft-deleted customers)
  - Approvals badge shows 3 (hardcoded for now)
  - Collapsible sections with smooth animations

### ✅ API Routes (All Working)
```
/api/
├── auth/
│   ├── POST login - Authenticate user
│   ├── POST signup - Register new user  
│   ├── POST logout - End session
│   └── GET me - Get current user
├── admin/
│   ├── GET counts - Customer counts (total, active, overdue, completed, deleted)
│   ├── GET stats - Dashboard statistics (backward compatible)
│   ├── GET pending-approvals - Loans waiting for review
│   ├── GET ready-for-disbursement - Approved loans ready for release
│   ├── GET recent-payments - Latest payments recorded
│   └── GET customers/active - Active customers list
```

### ✅ Environment Setup
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/adrian_cims"

# App Configuration
NEXT_PUBLIC_APP_NAME="Adrian CIMS"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key"
```

### ✅ Quick Start
```bash
# 1. Clone and install
npm install

# 2. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:3000
```

## 📁 Project Structure
```
adrian/
├── prisma/
│   ├── schema.prisma           # Database models and relations
│   └── migrations/              # Auto-generated migrations
├── src/
│   ├── app/
│   │   ├── admin/               # Admin area (requires auth)
│   │   │   ├── dashboard/        # Main dashboard page
│   │   │   ├── customers/        # Customer management
│   │   │   │   ├── active/       # Active customers list
│   │   │   │   ├── overview/     # Customer dashboard
│   │   │   │   └── [id]/         # Individual customer
│   │   │   ├── loans/            # Loan management
│   │   │   ├── approvals/        # Loan approvals
│   │   │   └── layout.tsx        # Admin layout with sidebar
│   │   ├── api/                  # All API routes
│   │   │   └── admin/            
│   │   │       ├── counts/        # Customer counts API
│   │   │       ├── stats/         # Dashboard stats (legacy)
│   │   │       └── customers/     
│   │   │           └── active/     # Active customers API
│   │   ├── login/                 # Login page
│   │   └── signup/                # Registration page
│   ├── components/                # Reusable UI components
│   │   ├── ThemeToggle.tsx        # Dark mode toggle
│   │   └── ProtectedRoute.tsx     # Auth wrapper
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuth.ts             # Authentication hook
│   └── lib/                       # Utilities
│       ├── auth.ts                 # Auth functions
│       ├── db.ts                   # Prisma client singleton
│       └── format-utils.ts         # Safe number formatting
├── .env                            # Environment variables
├── tailwind.config.js              # Tailwind setup
└── package.json                    # Dependencies
```

## 🔐 Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **super_admin** | Full system access, can delete records, view audit logs, disburse funds |
| **admin** | Most operations, stage 2 approvals, cannot delete permanently |
| **loan_officer** | Create loans, view customers, stage 1 approvals |
| **customer_service** | View customers, manual upload, basic updates |
| **viewer** | Read-only access to all data |

## 📊 Key Features Explained

### 🚦 Customer Status Determination
Instead of a single `status` field, customers are categorized by their loan counters:
- **Active**: `activeLoans > 0` and `deletedAt IS NULL`
- **Overdue**: `overdueLoans > 0` and `deletedAt IS NULL`
- **Completed**: `totalLoans > 0` but `activeLoans = 0` and `overdueLoans = 0`
- **Deleted**: `deletedAt IS NOT NULL`

### 📝 Audit Trail System
Every action is logged in the `AuditLog` table with:
- Who performed the action (user ID, name, role)
- What action (CREATE, UPDATE, DELETE, VIEW, LOGIN)
- When it happened (timestamp)
- What changed (before/after values for updates)
- IP address and user agent (browser info)

### 📈 Multi-Stage Loan Approval
- **Stage 1**: Loan officer reviews and initial approval
- **Stage 2**: Admin reviews and final approval  
- **Stage 3**: Super_admin approves for disbursement
- **Stage 4**: Disbursed (funds released)

### 💰 Number Formatting
Large numbers are automatically shortened with K, M, B suffixes:
- 1,420,000 → TSh 1.4M
- 473,333 → TSh 473.3K
- 570,000 → TSh 570K

### 🗑️ Soft Delete System
Records are never permanently deleted:
- `deletedAt` timestamp when deleted
- `deletedById` reference to who deleted it
- `deletionReason` explanation why
- Restore functionality available for super_admin

### ✅ Working APIs
- `/api/admin/counts` - Returns `{"total":5,"active":3,"overdue":0,"completed":0,"deleted":1}`
- `/api/admin/customers/active` - Returns active customers list
- `/api/admin/stats` - Legacy endpoint for backward compatibility

## 🐛 Troubleshooting

### Database Connection
```bash
# Test connection
psql -U postgres -h localhost -d adrian_cims

# If connection fails, check:
# 1. PostgreSQL service is running
# 2. DATABASE_URL in .env is correct
# 3. Password has no special characters needing encoding
```

### Prisma Issues
```bash
# 1. Check database connection
npx prisma studio

# 2. Verify user exists
SELECT * FROM "User";

# 3. Check console for errors
# Look for "PrismaClientInitializationError"
```

## 🎨 Design System
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - Approved, paid
- **Warning**: Yellow (#F59E0B) - Pending, in review
- **Danger**: Red (#EF4444) - Overdue, rejected
- **Dark Mode**: Automatic, follows system preference
- **Typography**: Inter font family
- **Icons**: Lucide React (consistent icon set)

## 🚀 What's Coming Next

### Phase 1: Customer Management (Current Sprint) ✅
- [x] Active customers list with real data
- [x] Customer overview dashboard
- [x] Delete with audit trail
- [x] Real-time counts in sidebar

### Phase 2: Loan Processing (Next Sprint)
- [ ] Loan application form
- [ ] Document requirements based on loan amount
- [ ] Multi-stage approval workflow UI
- [ ] Disbursement processing
- [ ] Payment tracking with receipts

### Phase 3: Reports & Analytics (Future)
- [ ] Portfolio at risk reports
- [ ] Loan performance dashboard
- [ ] Customer demographics
- [ ] Export to Excel/PDF
- [ ] Email notifications

### Phase 4: Testing & Deployment (Future)
- [ ] Unit tests for critical functions
- [ ] Integration tests for API
- [ ] Load testing
- [ ] Production deployment guide

## 📝 Development Guidelines

### Adding a New Feature
1. Check if similar feature exists (copy pattern)
2. Update schema if needed → `npx prisma migrate dev`
3. Create API route in `app/api/`
4. Create page in appropriate folder
5. Test with real data
6. Add `"use client"` directive if using hooks
7. Update this documentation

### Coding Style
- Use TypeScript for all new files
- Add comments for complex logic
- Follow existing naming conventions
- Use Tailwind classes for styling
- Test dark mode on new pages
- Always add safe fallbacks for undefined values
- Keep API responses consistent


to be updated...
