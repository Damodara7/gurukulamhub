import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'
import connectMongo from '@/utils/dbConnect-mongo'
import User from '@/app/models/user.model'

/**
 * GET /api/encryption/keys?userId=email
 * Get public encryption key for a user
 */
export async function GET(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    await connectMongo()

    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('User ID (email) is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Find user
    const user = await User.findOne({ email: userId }).select('publicEncryptionKey email')

    if (!user) {
      const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Return public key if available
    if (user.publicEncryptionKey) {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Public key retrieved successfully',
        {
          userId: user.email,
          publicKey: user.publicEncryptionKey,
        }
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      // User hasn't set up encryption yet
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'User has not set up encryption yet',
        {
          userId: user.email,
          publicKey: null,
        }
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('Error getting public key:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

/**
 * POST /api/encryption/keys
 * Store public encryption key for the authenticated user
 * Body: { publicKey: string }
 */
export async function POST(req) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    await connectMongo()

    const body = await req.json()
    const { publicKey } = body

    if (!publicKey) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Public key is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Update user's public encryption key
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          publicEncryptionKey: publicKey,
          encryptionKeyUpdatedAt: new Date(),
        },
      },
      { new: true, upsert: false } // Don't create if doesn't exist, just update
    ).select('email publicEncryptionKey')

    if (!user) {
      console.error(`[Encryption API] User not found: ${session.user.email}`)
      const errorResponse = ApiResponseUtils.createErrorResponse('User not found')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    console.log(`[Encryption API] Public key stored for user: ${user.email}`)

    const successResponse = ApiResponseUtils.createSuccessResponse(
      'Public key stored successfully',
      {
        userId: user.email,
        publicKey: user.publicEncryptionKey,
      }
    )
    return ApiResponseUtils.sendSuccessResponse(successResponse)
  } catch (error) {
    console.error('Error storing public key:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

