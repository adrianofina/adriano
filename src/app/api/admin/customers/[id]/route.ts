import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/auth';

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function authenticate() {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// ─── GET /api/admin/customers/[id] ───────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15: params is a Promise — must be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
    }

    const customer = await db.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Fetch related data in parallel
    const [loans, documents] = await Promise.all([
      db.loan.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
      }),
      db.customerDocument.findMany({
        where: { customerId: id },
        orderBy: { uploadedAt: 'desc' },
      }),
    ]);

    const stats = {
      totalLoans:     loans.length,
      activeLoans:    loans.filter(l => l.status === 'active').length,
      overdueLoans:   loans.filter(l => l.status === 'overdue').length,
      completedLoans: loans.filter(l => l.status === 'completed').length,
      totalBorrowed:  loans.reduce((sum, l) => sum + (l.amount ?? 0), 0),
      totalRepaid:    loans.reduce((sum, l) => sum + (l.amountPaid ?? 0), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        loans,
        documents,
        stats,
      },
    });

  } catch (error: any) {
    console.error('[GET /api/admin/customers/[id]]', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// ─── PUT /api/admin/customers/[id] ───────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Next.js 15: params is a Promise — must be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing customer ID' }, { status: 400 });
    }

    // ── Safe JSON parse ───────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Request body is empty' },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // ── Build update payload ──────────────────────────────────────────────────
    const updateData: Record<string, unknown> = {};

    const stringFields = [
      'firstName', 'surname', 'middleName',
      'phoneNumber', 'alternativePhone', 'email',
      'gender', 'address', 'city', 'region',
      'occupation', 'employer', 'businessName',
      'maritalStatus', 'nationalId',
      'bankName', 'accountNumber',
      'mobileMoneyProvider', 'mobileMoneyNumber',
    ];

    for (const field of stringFields) {
      if (field in body) {
        updateData[field] = body[field] === '' ? null : body[field];
      }
    }

    if ('dateOfBirth' in body) {
      updateData.dateOfBirth = body.dateOfBirth
        ? new Date(body.dateOfBirth as string)
        : null;
    }

    if ('monthlyIncome' in body) {
      const val = Number(body.monthlyIncome);
      updateData.monthlyIncome = isNaN(val) ? null : val;
    }

    if ('dependents' in body) {
      const val = Number(body.dependents);
      updateData.dependents = isNaN(val) ? null : val;
    }

    const updatedCustomer = await db.customer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedCustomer });

  } catch (error: any) {
    console.error('[PUT /api/admin/customers/[id]]', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message ?? 'Failed to update customer' },
      { status: 500 }
    );
  }
}