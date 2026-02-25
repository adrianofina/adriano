// lib/error-handler.ts
import { NextResponse } from 'next/server'

export type ApiError = {
  message: string
  status: number
  code?: string
}

export class AppError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number = 500, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('🔥 API Error:', error)

  // Default error
  let message = 'Internal server error'
  let status = 500
  let code = 'INTERNAL_ERROR'

  // Handle AppError
  if (error instanceof AppError) {
    message = error.message
    status = error.status
    code = error.code || 'APP_ERROR'
  }
  // Handle Prisma errors
  else if (error && typeof error === 'object' && 'code' in error) {
    switch (error.code) {
      case 'P2002':
        message = 'A record with this unique field already exists'
        status = 409
        code = 'DUPLICATE_ERROR'
        break
      case 'P2025':
        message = 'Record not found'
        status = 404
        code = 'NOT_FOUND'
        break
      case 'P2003':
        message = 'Foreign key constraint failed'
        status = 400
        code = 'CONSTRAINT_ERROR'
        break
      default:
        message = `Database error: ${error.code}`
        status = 500
        code = 'DATABASE_ERROR'
    }
  }
  // Handle standard Error
  else if (error instanceof Error) {
    message = error.message
  }

  // Return JSON response - NEVER HTML!
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}
