// lib/api-handler.ts
import { successResponse, errorResponse, unauthorizedResponse } from './api-response'
import { getAuthCookie, verifyToken } from './auth'

export type HandlerContext = {
  params: any
  user?: any
}

export type ApiHandler<T = any> = (
  req: Request, 
  context: HandlerContext
) => Promise<T>

export type HandlerOptions = {
  requireAuth?: boolean
  requireRoles?: string[]
}

export function createHandler<T>(
  handler: ApiHandler<T>,
  options: HandlerOptions = {}
) {
  return async (req: Request, routeParams: any) => {
    try {
      // Next.js App Router passes params as the second argument directly
      // It could be either { params: { id: '...' } } or just { id: '...' }
      console.log('🔧 Handler received params:', routeParams)
      
      // Extract params correctly
      let params = {}
      if (routeParams?.params) {
        // Format: { params: { id: '...' } }
        params = routeParams.params
      } else if (routeParams && typeof routeParams === 'object') {
        // Format: { id: '...' } (direct)
        params = routeParams
      }
      
      const context: HandlerContext = { params }
      console.log('🔧 Context params:', context.params)
      
      // Authentication check
      if (options.requireAuth) {
        const token = await getAuthCookie()
        if (!token) {
          return unauthorizedResponse()
        }

        const user = verifyToken(token)
        if (!user) {
          return unauthorizedResponse()
        }

        // Role-based authorization
        if (options.requireRoles?.length) {
          if (!options.requireRoles.includes(user.role)) {
            return errorResponse('Insufficient permissions', 403)
          }
        }

        context.user = user
      }

      // Execute handler
      const result = await handler(req, context)
      return successResponse(result)
      
    } catch (error) {
      console.error(`API Error:`, error)
      
      // Handle Prisma errors
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case 'P2002':
            return errorResponse('A record with this unique field already exists', 409)
          case 'P2025':
            return errorResponse('Record not found', 404)
          default:
            return errorResponse(`Database error: ${error.code}`, 500)
        }
      }
      
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      )
    }
  }
}
