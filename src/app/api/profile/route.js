import * as ProfileService from './profile.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

const Artifact = 'Profiles'
const ArtifactService = ProfileService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { id, email, ...rest } = queryParamsObj

    let artifact

    if (id) {
      artifact = await ArtifactService.getById({ id, ...rest })
    } else if (email) {
      artifact = await ArtifactService.getByEmail({ email, ...rest })
    } else {
      artifact = await ArtifactService.getAll({ ...rest })
    }

    if (artifact.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else if (artifact.status === 'error') {
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function POST(request) {
  try {
    console.log('Received request to create profile')
    const reqBody = await request.json()
    console.log('Request body:', reqBody)

    const newArtifact = await ArtifactService.add({
      data: reqBody
    })

    console.log('Service response:', newArtifact)

    if (newArtifact?.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(
        `New ${Artifact} created successfully`,
        newArtifact?.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.error('Service error:', newArtifact)
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact?.message || 'Unknown error')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    console.error('Route error:', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function PUT(request) {
  try {
    const reqBody = await request.json()

    // Extract profile email from request body
    const email = reqBody.email
    if (!email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Email is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Update the profile using the dedicated service function
    const updateResult = await ArtifactService.updateProfileByEmail({ email, data: reqBody })

    if (updateResult.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function DELETE(req) {
  const url = new URL(req.url)
  const searchParams = new URLSearchParams(url.searchParams)
  const email = searchParams.get('email')
  const id = searchParams.get('id')

  try {
    let deleteResult

    if (email) {
      // Delete profile by email using dedicated service function
      deleteResult = await ArtifactService.deleteProfileByEmail({ email })
    } else if (id) {
      // Delete profile by ID using dedicated service function
      deleteResult = await ArtifactService.deleteProfileById({ id })
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse('Email or ID parameter is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    if (deleteResult.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(deleteResult.message, deleteResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deleteResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
