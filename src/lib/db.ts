// Mock database client - replace with real Prisma when ready
export const db = {
  async getCustomers() {
    return { customers: [], total: 0 };
  },
  async getLoans() {
    return { loans: [], total: 0 };
  },
  async getStats() {
    return {
      totalCustomers: 1247,
      activeLoans: 342,
      overdueLoans: 23,
      completedLoans: 156,
      totalDisbursed: 2840000000,
      totalRepaid: 1380000000
    };
  }
};
