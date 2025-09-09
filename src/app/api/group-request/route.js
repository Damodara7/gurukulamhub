import * as GroupRequestService from './group-request.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { auth } from '@/libs/auth'

const Artifact = 'Group Request'
const ArtifactService = GroupRequestService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { requestId, groupId, userEmail, status, ...rest } = queryParamsObj

    let artifact

    if (requestId) {
      // Get specific request by ID
      artifact = await ArtifactService.getRequestById(requestId)
    } else if (groupId) {
      // Get requests by group
      artifact = await ArtifactService.getRequestsByGroup(groupId, status)
    } else if (userEmail) {
      // Get requests by user email
      artifact = await ArtifactService.getRequestsByUser(userEmail)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse('Missing required parameters')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    if (artifact.status === 'success') {
      console.log('GET request successful, returning:', artifact.result)
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
    // Get session to get user email
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized - Please log in')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    console.log('Received request to create group request')
    const reqBody = await request.json()
    console.log('Request body:', reqBody)

    // Add user email from session
    const requestData = {
      ...reqBody,
      userEmail: session.user.email
    }

    const newArtifact = await ArtifactService.createRequest(requestData)

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
    // Get session to get admin email
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized - Please log in')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const reqBody = await request.json()

    // Extract request ID and action from request body
    const { requestId, action, rejectedReason } = reqBody
    if (!requestId || !action) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Request ID and action are required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const adminEmail = session.user.email
    let result

    if (action === 'approve') {
      result = await ArtifactService.approveRequest(requestId, adminEmail)
    } else if (action === 'reject') {
      if (!rejectedReason || rejectedReason.trim() === '') {
        const errorResponse = ApiResponseUtils.createErrorResponse('Rejection reason is required')
        return ApiResponseUtils.sendErrorResponse(errorResponse)
      }
      result = await ArtifactService.rejectRequest(requestId, adminEmail, rejectedReason)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse('Invalid action. Must be "approve" or "reject"')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

export async function DELETE(req) {
  try {
    // Get session to get user email
    const session = await auth()
    if (!session?.user?.email) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Unauthorized - Please log in')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Request ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    const deletedRequest = await ArtifactService.cancelRequest(requestId, session.user.email)
    if (deletedRequest.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(
        'Group request cancelled successfully',
        deletedRequest.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedRequest.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
