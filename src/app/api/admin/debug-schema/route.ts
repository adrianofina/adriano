import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get one customer to see available fields
    const sampleCustomer = await db.customer.findFirst();
    
    // Get all field names from the first customer
    const fields = sampleCustomer ? Object.keys(sampleCustomer) : [];
    
    // Try different possible field names for status
    const possibleStatusFields = [
      'status',
      'loanStatus',
      'customerStatus',
      'isActive',
      'active'
    ];
    
    const results = {};
    
    for (const field of possibleStatusFields) {
      try {
        // Try to query with this field
        const count = await db.customer.count({
          where: { [field]: 'active' }
        });
        results[field] = { works: true, count };
      } catch (e) {
        results[field] = { works: false, error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      availableFields: fields,
      fieldTests: results,
      sampleCustomer
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
