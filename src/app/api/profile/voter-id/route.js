import { getVoterId, addVoterId, updateVoterId, deleteVoterId } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/voter-id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

    const result = await getVoterId(email)
    if (!result) {
      throw new Error(`Couldn't get voter ID`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched voter ID.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/voter-id GET :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// POST /api/profile/voter-id
export async function POST(request) {
  try {
    const { email, voterId } = await request.json()
    const result = await addVoterId({ email, voterId })

    if (!result) {
      throw new Error(`Couldn't create voter ID.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created voter ID.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/voter-id POST :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// PUT /api/profile/voter-id
export async function PUT(request) {
  try {
    const { email, voterId } = await request.json()
    const result = await updateVoterId({ email, voterId })

    if (!result) {
      throw new Error(`Couldn't update voter ID.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully updated voter ID.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/voter-id PUT :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// DELETE /api/profile/voter-id
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

    const result = await deleteVoterId(email)

    if (!result) {
      throw new Error(`Couldn't delete voter ID.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully deleted voter ID.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/voter-id DELETE :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
