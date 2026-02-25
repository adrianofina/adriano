import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Singleton pattern to prevent multiple PrismaClient instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean
}

// Initialize database connection with proper error handling
function createPrismaClient() {
  try {
    console.log('🔌 Initializing database connection...')
    
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })

    // Test the connection
    pool.connect((err, client, release) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message)
      } else {
        console.log('✅ Database connected successfully')
        release()
      }
    })

    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    })

    return prisma
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    throw error
  }
}

// Export a singleton instance
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  globalForPrisma.dbInitialized = true
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('👋 Disconnecting database...')
  await db.$disconnect()
})

// Helper function to handle database errors
export function handleDbError(error: unknown): { message: string; status: number } {
  console.error('Database error:', error)

  // Prisma-specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'P2002':
        return { 
          message: 'A record with this unique field already exists', 
          status: 409 
        }
      case 'P2025':
        return { 
          message: 'Record not found', 
          status: 404 
        }
      case 'P2003':
        return { 
          message: 'Foreign key constraint failed', 
          status: 400 
        }
      default:
        return { 
          message: 'Database error occurred', 
          status: 500 
        }
    }
  }

  return { 
    message: error instanceof Error ? error.message : 'Unknown database error', 
    status: 500 
  }
}

// Helper function to validate IDs
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9]+$/.test(id)
}

// Helper function to sanitize input
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim()
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}
