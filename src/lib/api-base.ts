import { NextResponse } from 'next/server'
import { db, handleDbError, isValidId, sanitizeInput } from '@/lib/db'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export type ApiHandler = (
  req: Request,
  context: { params: any; user: any }
) => Promise<NextResponse>

export interface ApiRouteConfig {
  requireAuth?: boolean
  requireRoles?: string[]
  validateId?: boolean
  validateBody?: boolean
}

export function createApiHandler(
  handler: ApiHandler,
  config: ApiRouteConfig = { requireAuth: true }
) {
  return async (req: Request, context: { params: any }) => {
    try {
      console.log(`📍 ${req.method} ${req.url}`)

      // Authentication check
      if (config.requireAuth) {
        const token = await getAuthCookie()
        if (!token) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        const user = verifyToken(token)
        if (!user) {
          return NextResponse.json(
            { error: 'Invalid or expired session' },
            { status: 401 }
          )
        }

        // Role-based authorization
        if (config.requireRoles && config.requireRoles.length > 0) {
          if (!config.requireRoles.includes(user.role)) {
            return NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            )
          }
        }

        // Attach user to context
        context.params.user = user
      }

      // ID validation
      if (config.validateId && context.params.id) {
        if (!isValidId(context.params.id)) {
          return NextResponse.json(
            { error: 'Invalid ID format' },
            { status: 400 }
          )
        }
      }

      // Execute handler
      const response = await handler(req, context)

      // Add CORS headers in development
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      }

      return response

    } catch (error) {
      console.error(`❌ ${req.method} ${req.url} failed:`, error)
      
      const { message, status } = handleDbError(error)
      return NextResponse.json({ error: message }, { status })
    }
  }
}

// Helper for successful responses
export function successResponse(data: any, status = 200) {
  return NextResponse.json({ 
    success: true, 
    data,
    timestamp: new Date().toISOString()
  }, { status })
}

// Helper for error responses
export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json({ 
    success: false, 
    error: message,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}
