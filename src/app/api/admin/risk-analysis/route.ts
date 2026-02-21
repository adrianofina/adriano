import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getAuthCookie, verifyToken } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        loans: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const riskCustomers = customers.map(customer => {
      const activeLoans = customer.loans.filter(l => l.status === 'active').length;
      const overdueLoans = customer.loans.filter(l => l.status === 'overdue').length;
      const totalDebt = customer.loans.reduce((sum, l) => sum + l.remainingBalance, 0);
      const overdueAmount = customer.loans
        .filter(l => l.status === 'overdue')
        .reduce((sum, l) => sum + l.remainingBalance, 0);

      let riskScore = 0;
      if (customer.creditScore) {
        if (customer.creditScore < 600) riskScore += 40;
        else if (customer.creditScore < 700) riskScore += 20;
      }
      
      if (overdueLoans > 0) riskScore += 30;
      if (activeLoans > 2) riskScore += 20;
      
      const riskLevel = riskScore >= 70 ? 'critical' :
                        riskScore >= 50 ? 'high' :
                        riskScore >= 30 ? 'medium' : 'low';

      const defaultProbability = Math.min(
        Math.max(5, (600 - (customer.creditScore || 650)) / 3 + (overdueLoans * 15)),
        95
      );

      return {
        id: customer.id,
        customerId: customer.customerId,
        name: `${customer.firstName} ${customer.surname}`,
        phone: customer.phoneNumber,
        email: customer.email,
        creditScore: customer.creditScore || 650,
        monthlyIncome: customer.monthlyIncome || 0,
        loanAmount: totalDebt,
        existingLoans: customer.loans.length,
        overdueAmount,
        riskLevel,
        riskFactors: [
          customer.creditScore && customer.creditScore < 600 ? 'Low credit score' : null,
          overdueLoans > 0 ? `${overdueLoans} overdue loans` : null,
          activeLoans > 2 ? 'Multiple active loans' : null,
          !customer.monthlyIncome ? 'No income data' : null
        ].filter(Boolean),
        defaultProbability: Math.round(defaultProbability),
        recommendedAction: riskLevel === 'critical' ? 'Immediate collection' :
                            riskLevel === 'high' ? 'Review urgently' :
                            riskLevel === 'medium' ? 'Monitor closely' :
                            'Standard processing',
        predictedRecovery: Math.round(100 - defaultProbability / 2)
      };
    });

    const stats = {
      low: riskCustomers.filter(c => c.riskLevel === 'low').length,
      medium: riskCustomers.filter(c => c.riskLevel === 'medium').length,
      high: riskCustomers.filter(c => c.riskLevel === 'high').length,
      critical: riskCustomers.filter(c => c.riskLevel === 'critical').length,
      avgDefault: Math.round(riskCustomers.reduce((sum, c) => sum + c.defaultProbability, 0) / riskCustomers.length) || 0,
      totalExposure: riskCustomers.reduce((sum, c) => sum + c.loanAmount, 0),
      predictedLoss: riskCustomers.reduce((sum, c) => sum + (c.loanAmount * c.defaultProbability / 100), 0)
    };

    return NextResponse.json({ customers: riskCustomers, stats });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
