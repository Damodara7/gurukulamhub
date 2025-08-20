import * as GameService from './game.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Games'
const ArtifactService = GameService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries())

    const { id, pin, email, groupId, ...rest } = queryParamsObj

    let artifact

    if (id) {
      artifact = await ArtifactService.getOne({ _id: id, ...rest })
    } else if (pin) {
      artifact = await ArtifactService.getOne({ pin: pin, ...rest })
    } else {
      if (email) {
        artifact = await ArtifactService.getAllByEmail(email, { ...rest })
      } else if (groupId) {
        artifact = await ArtifactService.getAllByGroupId(groupId, { ...rest })
      } else {
        artifact = await ArtifactService.getAll({ ...rest })
      }
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
    const reqBody = await request.json()
    const newArtifact = await ArtifactService.addOne({
      ...reqBody
    })
    console.log(`${Artifact}` + ' Creation Step 1 :', newArtifact)
    if (newArtifact?.status === 'success') {
      console.log('`${Artifact}` Creation Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(
        `New ${Artifact} created successfully`,
        newArtifact?.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact}` + ' creation error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact?.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message)
  }
}

export async function PUT(request) {
  try {
    const reqBody = await request.json()

    // Extract game ID from request body (consider using URL parameters instead)
    const gameId = reqBody._id
    if (!gameId) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Game ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }

    // Update the game using the service
    const updateResult = await GameService.updateOne(gameId, reqBody)

    if (updateResult.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(updateResult.message, updateResult.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updateResult.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.InternalServerError)
  }
}

export async function DELETE(req) {
  const url = new URL(req.url)
  const searchParams = new URLSearchParams(url.searchParams)
  const id = searchParams.get('id')

  const { email } = await req.json()

  try {
    console.log('Received deleted request for id' + id)
    const deletedAd = await ArtifactService.deleteOne(id, { email })
    if (deletedAd.status === 'success') {
      console.log(`${Artifact} deleted Successfully ():`)
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(' Advt deleted successfully', deletedAd.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('`${Artifact}` deletion error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedAd.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
