# Adrian CIMS - Microfinance Management System
**Last Updated:** March 5, 2026
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
  - Fields: firstName, surname, phoneNumber, email, dateOfBirth, gender, address, city, region, occupation, employer, monthlyIncome, businessName, maritalStatus, dependents, nationalId, bankName, accountNumber, mobileMoneyProvider, mobileMoneyNumber, creditScore, riskLevel, category
  - Status determined by activeLoans, overdueLoans, totalLoans counters
  - Soft delete with deletedAt, deletedById, deletionReason
- **Loan** - Multi-stage approval workflow (stage 1, 2, 3) with amount, purpose, term, interestRate, amountPaid, remainingBalance, penalties, nextPaymentDate, status
- **Payment** - Payment tracking with methods and references
- **CourtCase** - Legal case management for defaulters
- **AuditLog** - Complete audit trail for all actions with userId, userName, userRole, action, entityType, entityId, details, timestamp, ipAddress
- **CustomerDocument** - Document upload and verification with documentType, fileName, fileUrl, fileSize, status, verifiedAt

### ✅ Admin Dashboard
- Real-time statistics from database (no hardcoded data)
- Dark mode support throughout
- Responsive design (works on mobile/desktop)
- Pending approvals widget with role-based filtering
- Recent payments with confirmation status
- Ready for disbursement section (super_admin only)
- Quick actions grid with role-based visibility
- Portfolio health card with utilization ring
- Sparkline bars on stat cards for visual trends
- Auto-refresh every 60 seconds
- Safe handling of undefined values with fallbacks

### ✅ Customer Management

#### Customer List Page (`/admin/customers`)
- Complete customer directory with search and filter
- Stats cards with sparkline visualizations
- Gradient header with dot pattern background
- Customer table with:
  - Avatar with initials (gradient background)
  - Contact info with icons (phone, email, location)
  - Loan count badge
  - Join date with calendar icon
  - Relative time for last active
  - Hover actions (View, Edit, Delete)
- Responsive pagination
- Empty state with gradient "Add Customer" button
- Soft delete modal with warning for customers with loans

#### Active Customers Page (`/admin/customers/active`)
- Shows REAL active customers (activeLoans > 0)
- Stats cards with K/M/B formatting (TSh 1.4M, TSh 473.3K)
- Real-time counts from database
- Search functionality by name, phone, or loan ID
- Customer table with progress bars and payment status
- Export and New Customer buttons
- Clickable rows that navigate to customer details

#### Customer Details Page (`/admin/customers/[id]`)
- Gradient header with glass morphism effect
- Two main progress rings:
  - **Active Loans ring** - Shows active vs total loans
  - **Repayment Progress ring** - Shows repaid vs total borrowed
- Interactive hover preview on rings (purple overlay)
- Quick stats cards with icons
- Contact information strip (phone, email, address)
- Repayment banner with three-column breakdown
- Tabbed interface:
  - **Personal Details** - Full customer information organized in sections
  - **Loans** - List of loans with progress bars and status badges
  - **Documents** - Document list with verification status
- Edit button that navigates to edit page
- Back button to return to customers list

#### Edit Customer Page (`/admin/customers/[id]/edit`)
- Beautiful gradient header with progress indicator (shows sections completed)
- Color-coded sections with expand/collapse dividers:
  - **Personal Information** (indigo)
  - **Contact Information** (emerald)
  - **Address** (amber)
  - **Employment & Financial** (purple)
  - **Banking & Mobile Money** (rose)
- Input fields with icons and helper text
- Age validation (must be 18+)
- Floating action bar with Cancel and Save buttons
- Success/error/warning banners with animations
- Responsive design for mobile

#### Deleted Customers Page (`/admin/customers/deleted`)
- Red-themed header with dot pattern
- Stats cards for deletion metrics (Today, This Week, This Month)
- Search and timeframe filters
- Customer cards with:
  - Avatar with deletion indicator
  - Deletion metadata (relative time, deleted by, reason)
  - Warning badges for active loans at deletion
  - Stats badges for loans and documents
- Restore functionality for super_admin and admin
- View details link

#### New Customer Page (`/admin/customers/new`)
- Multi-section form with all customer fields
- Real-time validation
- Duplicate email checking with proper error messages
- Success message with auto-redirect
- Gradient header with sparkles icon
- Consistent styling with edit page

### ✅ Sidebar Navigation
- Shows REAL counts from database:
  - **Overview**: 8 (total customers)
  - **Active**: 3 (customers with active loans)
  - **Overdue**: 0 (customers with overdue loans)
  - **Completed**: 0 (customers with completed loans)
  - **Deleted**: 1 (soft-deleted customers)
- Approvals badge shows pending approvals
- Collapsible sections with smooth animations
- User profile with role badge
- Dark mode toggle
- Logout functionality

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
│   ├── GET overview-stats - Portfolio overview statistics
│   ├── GET recent-customers - Recently added customers
│   └── customers/
│       ├── GET - List all active customers
│       ├── POST - Create new customer
│       ├── [id]/
│       │   ├── GET - Get single customer with loans and documents
│       │   ├── PUT - Update customer
│       │   ├── DELETE - Soft delete customer
│       │   ├── loans/ - GET customer loans
│       │   ├── documents/ - GET customer documents
│       │   └── restore/ - POST restore deleted customer
│       ├── active/ - GET active customers
│       ├── overdue/ - GET overdue customers
│       ├── completed/ - GET completed customers
│       └── deleted/ - GET soft-deleted customers
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
│   │   │   │   ├── page.tsx      # Customer list
│   │   │   │   ├── active/       # Active customers list
│   │   │   │   ├── overview/     # Customer overview dashboard
│   │   │   │   ├── deleted/      # Deleted customers
│   │   │   │   ├── new/          # New customer form
│   │   │   │   └── [id]/         # Individual customer
│   │   │   │       ├── page.tsx  # Customer details
│   │   │   │       └── edit/     # Edit customer form
│   │   │   ├── loans/            # Loan management
│   │   │   ├── approvals/        # Loan approvals
│   │   │   └── layout.tsx        # Admin layout with sidebar
│   │   ├── api/                  # All API routes
│   │   │   └── admin/            
│   │   │       ├── counts/        # Customer counts API
│   │   │       ├── stats/         # Dashboard stats (legacy)
│   │   │       ├── overview-stats/ # Portfolio overview
│   │   │       ├── recent-customers/ # Recently added
│   │   │       └── customers/     
│   │   │           ├── route.ts    # List & create customers
│   │   │           ├── [id]/       # Individual customer operations
│   │   │           │   └── route.ts # GET, PUT, DELETE
│   │   │           ├── active/     # Active customers
│   │   │           ├── overdue/    # Overdue customers
│   │   │           ├── completed/  # Completed customers
│   │   │           └── deleted/    # Soft-deleted customers
│   │   ├── login/                 # Login page
│   │   └── signup/                # Registration page
│   ├── components/                # Reusable UI components
│   │   ├── ThemeToggle.tsx        # Dark mode toggle
│   │   └── ProtectedRoute.tsx     # Auth wrapper
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuth.ts             # Authentication hook
│   └── lib/                       # Utilities
│       ├── auth.ts                 # Auth functions (JWT, cookies)
│       ├── db.ts                   # Prisma client singleton with connection pooling
│       └── format-utils.ts         # Safe number formatting
├── .env                            # Environment variables
├── tailwind.config.js              # Tailwind setup
└── package.json                    # Dependencies
```

## 🔐 Role-Based Access Control
| Role | Permissions |
|------|-------------|
| **super_admin** | Full system access, can delete records, view audit logs, disburse funds, restore deleted customers |
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
- All destructive operations (delete, update) are logged

### 📈 Multi-Stage Loan Approval
- **Stage 1**: Loan officer reviews and initial approval
- **Stage 2**: Admin reviews and final approval  
- **Stage 3**: Super_admin approves for disbursement
- **Stage 4**: Disbursed (funds released)
- Each stage is tracked with approver ID and timestamp

### 💰 Number Formatting
Large numbers are automatically shortened with K, M, B suffixes:
- 1,420,000 → TSh 1.4M
- 473,333 → TSh 473.3K
- 570,000 → TSh 570K
- All currency formatting uses safe fallbacks for undefined values

### 🗑️ Soft Delete System
Records are never permanently deleted:
- `deletedAt` timestamp when deleted
- `deletedById` reference to who deleted it
- `deletionReason` explanation why
- Restore functionality available for super_admin
- Deleted records are filtered out of all default queries

### 🔄 Interactive Progress Rings
- Circular progress indicators for loan repayment
- **Hover preview**: Purple overlay shows what progress would be at any point
- **Color coding**: Blue (active), Red (overdue), Green (completed)
- **Center text**: Shows percentage and label
- **Click navigation**: Navigates to detailed view
- Used in customer details, loan cards, and portfolio health

## 🎨 Design System
- **Primary**: Indigo (#6366f1) - Actions, primary buttons, links
- **Success**: Emerald (#10B981) - Approved, paid, confirmed
- **Warning**: Amber (#F59E0B) - Pending, in review, unconfirmed
- **Danger**: Rose (#EF4444) - Overdue, rejected, deleted
- **Purple**: (#a855f7) - Secondary accents, banking, documents
- **Background**: Light gray (#f9fafb) in light mode, near-black (#0d0e12) in dark mode
- **Cards**: White with subtle shadows, glass morphism with backdrop blur
- **Dark Mode**: Automatic, follows system preference with smooth transitions
- **Typography**: Inter font family, carefully sized hierarchy
- **Icons**: Lucide React (consistent icon set throughout)
- **Animations**: Subtle transitions, hover effects, loading spinners

### ✨ UI Patterns
- **Gradient headers** with dot pattern backgrounds
- **Accent bars** on stat cards (colored left border)
- **Sparkline bars** on hover for visual interest
- **Glass morphism** with backdrop blur on cards
- **Pill badges** for status, risk level, and metadata
- **Timeline connectors** for activity feeds
- **Hover indicators** on clickable rows
- **Floating action bars** for forms
- **Progress rings** with interactive hover

## 🔧 Recent Fixes (March 2026)

### ✅ Fixed Issues
1. **Customer edit 405 error** → Added proper PUT method with Next.js 15+ pattern (`params: Promise<{ id: string }>`)
2. **Empty JSON parsing error** → Added safe JSON parsing with empty body check
3. **Customer not loading in edit form** → Fixed GET method to use correct params pattern
4. **Duplicate API files** → Consolidated to single `[id]/route.ts` with both methods
5. **ID undefined in API** → Added `await params` for Next.js 15+
6. **Partial updates failing** → Built dynamic update payload from request body
7. **Soft delete confirmation** → Added modal with warning for customers with loans
8. **Dark mode consistency** → Fixed all cards to respect dark mode

### ✅ Working APIs (Complete List)
- `/api/admin/counts` - Returns `{"total":8,"active":3,"overdue":0,"completed":0,"deleted":1}`
- `/api/admin/customers` - GET (list), POST (create)
- `/api/admin/customers/[id]` - GET (single), PUT (update), DELETE (soft delete)
- `/api/admin/customers/active` - GET active customers
- `/api/admin/customers/deleted` - GET soft-deleted customers
- `/api/admin/customers/[id]/loans` - GET customer loans
- `/api/admin/customers/[id]/documents` - GET customer documents
- `/api/admin/customers/[id]/restore` - POST restore deleted customer
- `/api/admin/overview-stats` - Portfolio overview statistics
- `/api/admin/recent-customers` - Recently added customers
- `/api/admin/pending-approvals` - Loans pending approval
- `/api/admin/ready-for-disbursement` - Approved loans ready for release
- `/api/admin/recent-payments` - Recent payment records

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

### Common Errors & Solutions
| Error | Solution |
|-------|----------|
| `Cannot read properties of undefined (reading 'toFixed')` | Add safe fallback: `value?.toFixed ? value.toFixed(1) : '0'` |
| `pendingApprovals.filter is not a function` | Ensure data is array: `Array.isArray(data) ? data : []` |
| `'deletedCustomers' does not exist in type` | Add to TypeScript interface |
| `Unexpected token '<'` | API endpoint returning HTML - check if route exists |
| `405 Method Not Allowed` | Add missing HTTP method (PUT/DELETE) to API route |
| `params.id is undefined` | Use `params: Promise<{ id: string }>` and `await params` for Next.js 15+ |
| `Unexpected end of JSON input` | Add safe JSON parsing with empty body check |

## 🚀 What's Coming Next

### Phase 1: Customer Management (Current Sprint) ✅ COMPLETED
- [x] Active customers list with real data
- [x] Customer overview dashboard
- [x] Customer details page with progress rings
- [x] Edit customer with beautiful form UI
- [x] Delete with audit trail and soft delete
- [x] Restore deleted customers
- [x] Real-time counts in sidebar
- [x] New customer creation with duplicate email validation

### Phase 2: Loan Processing (Next Sprint)
- [ ] Loan application form with document upload
- [ ] Document requirements based on loan amount
- [ ] Multi-stage approval workflow UI
- [ ] Disbursement processing with confirmation
- [ ] Payment tracking with receipts
- [ ] Loan amortization schedule
- [ ] Late payment penalties calculation

### Phase 3: Reports & Analytics (Future)
- [ ] Portfolio at risk reports (PAR)
- [ ] Loan performance dashboard with charts
- [ ] Customer demographics and segmentation
- [ ] Export to Excel/PDF
- [ ] Email notifications for approvals/payments
- [ ] SMS integration for Tanzania mobile money

### Phase 4: Testing & Deployment (Future)
- [ ] Unit tests for critical functions
- [ ] Integration tests for API endpoints
- [ ] Load testing with simulated users
- [ ] Production deployment guide
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## 📝 Development Guidelines

### Adding a New Feature
1. Check if similar feature exists (copy pattern)
2. Update schema if needed → `npx prisma migrate dev`
3. Create API route in `app/api/` with proper HTTP methods
4. For dynamic routes, use `params: Promise<{ id: string }>` and `await params`
5. Create page in appropriate folder
6. Test with real data from database
7. Add `"use client"` directive if using hooks
8. Add error handling and loading states
9. Update this documentation

### API Route Template
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

async function authenticate() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    // ... rest of logic

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### Coding Style
- Use TypeScript for all new files with proper interfaces
- Add comments for complex logic
- Follow existing naming conventions
- Use Tailwind classes for styling (no inline styles except for dynamic values)
- Test dark mode on new pages
- Always add safe fallbacks for undefined values
- Keep API responses consistent with `{ success: true/false, data/error }`
- Use async/await with proper error handling
- Add console logs for debugging (remove in production)

### Performance Tips
- Use `Promise.all` for parallel API calls
- Add loading states for better UX
- Implement pagination for large lists
- Cache API responses where appropriate
- Use debouncing for search inputs
- Always wrap financial mutations in Prisma transactions
- Use `select` to limit fields fetched from database


to be updated...
