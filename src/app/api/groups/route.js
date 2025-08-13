import * as GroupService from './group.service.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

const Artifact = 'Groups'
const ArtifactService = GroupService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { id, ...rest } = queryParamsObj

    let artifact

    if (id) {
      artifact = await ArtifactService.getOne({ _id: id, ...rest })
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
    console.log('Received request to create group')
    const reqBody = await request.json()
    console.log('Request body:', reqBody)

    const newArtifact = await ArtifactService.addOne({
      ...reqBody
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

    // Extract group ID from request body
    const groupId = reqBody._id
    if (!groupId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Group ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Update the group using the service
    const updateResult = await GroupService.updateOne(groupId, reqBody)

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
  const id = searchParams.get('id')

  try {
    const deletedGroup = await ArtifactService.deleteOne(id)
    if (deletedGroup.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse('Group deleted successfully', deletedGroup.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedGroup.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
