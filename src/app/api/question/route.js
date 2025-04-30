import * as QuestionService from './question.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Question'
const ArtifactService = QuestionService

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.searchParams)
    const showFilter = searchParams.get('showFilter')
    const quizId = searchParams.get('quizId')
    const isPrimary = searchParams.get('isPrimary')
    const primaryQuestionId = searchParams.get('primaryQuestionId')
    const languageCode = searchParams.get('languageCode')
    let queryParams = {}
    if (quizId) {
      queryParams = { quizId }
    }
    if (primaryQuestionId) {
      queryParams = { ...queryParams, primaryQuestionId }
    }
    if (isPrimary) {
      queryParams = { ...queryParams, isPrimary }
    }
    if (languageCode) {
      queryParams = { ...queryParams, languageCode, }
    }
    var artifact = {}
    if (showFilter && showFilter === 'allEvenDeleted') {
      artifact = await ArtifactService.getAllEvenDeletedByEmail(queryParams)
    } else if (showFilter && showFilter === 'active') {
      artifact = await ArtifactService.getActiveByEmail(queryParams)
    } else {
      artifact = await ArtifactService.getAllByEmail(queryParams)
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
  //await connectMongo()

  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()
    //const {userName, email, company, contact, description, imageUrl, mediaType,actionUrl, startDate, endDate, status, runType, advtCategory} = reqBody;
    //const { email, password } = reqBody
    const newArtifact = await ArtifactService.add({
      ...reqBody
    })
    console.log(`${Artifact}` + ' Creation Step 1 :', newArtifact, reqBody)
    if (newArtifact.status === 'success') {
      console.log('`${Artifact}` Creation Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`New ${Artifact} created successfully`, newArtifact)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact}` + ' creation error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message)
  }
}

export async function PUT(request) {
  //await connectMongo()
  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()
    console.log(reqBody)
    const {
      _id,
      userName,
      email,
      company,
      contact,
      mediaType,
      description,
      imageUrl,
      actionUrl,
      startDate,
      endDate,
      status,
      runType,
      advtCategory
    } = reqBody
    //const { email, password } = reqBody
    const newArtifact = await ArtifactService.update(_id, {
      ...reqBody
    })
    console.log('`${Artifact}` Update Step 1 :', newArtifact)
    if (newArtifact.status === 'success') {
      console.log('`${Artifact}` Updated Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} Updated successfully`)
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
    const errorResponse = ApiResponseUtils.createErrorResponse(`Expected id of ${Artifact}`)
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
  }

  try {
    console.log('Delete request', id)
    console.log('Received deleted request for id' + id)
    //const { email, password } = reqBody
    const deletedArtifact = await ArtifactService.deleteArtifact(id)
    if (deletedArtifact?.status === 'success') {
      console.log('`${Artifact}` deleted Successfully ():')
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} deleted successfully`, deletedArtifact)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log('`${Artifact}` deletion error.')
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedArtifact?.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
