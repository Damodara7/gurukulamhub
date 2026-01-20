/**
 * Seed API Route
 * 
 * This route allows manual initialization of SUPER_ADMIN.
 * It's protected and should only be accessible in development or with proper authentication.
 * 
 * GET /api/seed - Initialize SUPER_ADMIN (idempotent - safe to call multiple times)
 */

import { initializeSuperAdmin } from '@/scripts/seedSuperAdmin'
import * as ApiResponseUtils from '@/utils/apiResponses'

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Optional: Add authentication check here
    // For production, you might want to add a secret token check
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const expectedSecret = process.env.SEED_SECRET || 'CHANGE_THIS_IN_PRODUCTION'

    // In production, require secret token
    if (process.env.NODE_ENV === 'production' && secret !== expectedSecret) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized: Invalid secret token')
      return ApiResponseUtils.sendErrorResponse(errorResponse, 401)
    }

    console.log('🌱 Seed API called - Initializing SUPER_ADMIN...')
    const result = await initializeSuperAdmin()

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'SUPER_ADMIN initialized successfully',
        { message: 'SUPER_ADMIN role, features, and user have been initialized' }
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message || 'Failed to initialize SUPER_ADMIN')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('Error in seed API:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(
      error.message || 'An error occurred while initializing SUPER_ADMIN'
    )
    return ApiResponseUtils.sendErrorResponse(errorResponse, 500)
  }
}


