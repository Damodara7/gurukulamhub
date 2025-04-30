import * as AdvertisementService from './advertisement.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Games(s)'
const ArtifactService = AdvertisementService

export async function GET(req, { filter }) {
  try {
    const { searchParams } = new URL(req.url)
    const showFilter = searchParams.get('showFilter')
    const email = searchParams.get('email')

    console.log('email: ' + email)
    var artifact = {}
    if (showFilter && showFilter === 'allEvenDeleted') {
      if (email) {
        artifact = await ArtifactService.getAllEvenDeletedByEmail(email)
      } else {
        artifact = await ArtifactService.getAllEvenDeleted()
      }
    } else if (showFilter && showFilter === 'active') {
      if (email) {
        artifact = await ArtifactService.getActiveByEmail(email)
      } else {
        artifact = await ArtifactService.getActive()
      }
    } else {
      if (email) {
        artifact = await ArtifactService.getAllByEmail(email)
      } else {
        artifact = await ArtifactService.getAll()
      }
    }
    //console.log("advt: " , advt.result);
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
    const newArtifact = await ArtifactService.add({
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
    console.log({reqBody})

    //const { email, password } = reqBody
    const newArtifact = await ArtifactService.update(reqBody.id, {
      ...reqBody
    })
    console.log(`${Artifact} Update Step 1 :`, newArtifact)
    if (newArtifact.status === 'success') {
      console.log(`${Artifact} Updated Successfully ():`)
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} Updated successfully`,
        newArtifact?.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact} updating error.`)
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message)
  }
}

export async function DELETE(req) {
  const url = new URL(req.url)
  const searchParams = new URLSearchParams(url.searchParams)
  const id = searchParams.get('id')

  if (!id) {
    const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of advt')
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
  }

  try {
    console.log('Delete request', id)
    console.log('Received deleted request for id' + id)
    //const { email, password } = reqBody
    const deletedAd = await ArtifactService.deleteArtifact(id)
    if (deletedAd.status === 'success') {
      console.log('`${Artifact}` deleted Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(' Advt deleted successfully', deletedAd)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('`${Artifact}` deletion error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedAd.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
