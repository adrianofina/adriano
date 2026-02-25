// lib/api-response.ts
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status })
}

export function errorResponse(message: string, status = 500, details?: any): Response {
  // Log error for debugging
  console.error(`API Error: ${message}`, details)
  
  return Response.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }, { status })
}

// Helper for 404 responses
export function notFoundResponse(resource: string = 'Resource'): Response {
  return errorResponse(`${resource} not found`, 404)
}

// Helper for 401 responses
export function unauthorizedResponse(): Response {
  return errorResponse('Unauthorized', 401)
}

// Helper for 403 responses
export function forbiddenResponse(): Response {
  return errorResponse('Forbidden - insufficient permissions', 403)
}
