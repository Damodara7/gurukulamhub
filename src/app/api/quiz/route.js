import * as QuizService from './quiz.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
const Artifact = 'Quiz'
const ArtifactService = QuizService

export async function GET(req, { filter }) {
  try {
    const { searchParams } = new URL(req.url)
    const showFilter = searchParams.get('showFilter')
    const privacyFilter = searchParams.get('privacyFilter')
    const email = searchParams.get('email')
    const approvalState = searchParams.get('approvalState')

    const queryParams = {}

    if (email) {
      queryParams.owner = email
    }

    if (showFilter) {
      queryParams.status = showFilter
    }

    if (privacyFilter) {
      queryParams.privacy = privacyFilter
    }
    if (approvalState) {
      queryParams.approvalState = approvalState
    }

    console.log('email: ' + email)
    let artifact = {}

    artifact = await QuizService.getDocuments(queryParams);

    // if (showFilter && showFilter === 'allEvenDeleted') {
    //   if (email) {
    //     artifact = await ArtifactService.getAllEvenDeletedByEmail(email, queryParams)
    //   } else {
    //     artifact = await ArtifactService.getAllEvenDeleted(queryParams)
    //   }
    // } else if (showFilter && showFilter === 'active') {
    //   if (email) {
    //     artifact = await ArtifactService.getActiveByEmail(email, queryParams)
    //   } else {
    //     artifact = await ArtifactService.getActive(queryParams)
    //   }
    // } else {
    //   if (email) {
    //     artifact = await ArtifactService.getAllByEmail(email, queryParams)
    //   } else {
    //     artifact = await ArtifactService.getAll(queryParams)
    //   }
    // }

    //console.log("advt: ", artifact.result);
    if (artifact.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else if (artifact.status === 'error') {
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, artifact.statusCode)
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
    //console.log(`${Artifact}` + ' Creation Step 1 :', newArtifact)
    if (newArtifact?.status === 'success') {
      //console.log('`${Artifact}` Creation Successfully ():')
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
    const reqBody = await request.json();
    const { id, approvalState } = reqBody;  // Extract ID and approval state
    let ids = reqBody.ids;  // Use let here to allow reassignment

    // Check if 'id' is provided, and convert it to an array
    if (id) {
      ids = Array.isArray(ids) ? ids : [];  // If ids already exists as an array, keep it; otherwise, create an empty array
      ids.push(id); // Add the single ID to the array
    } else if (!Array.isArray(ids)) {
      ids = []; // If neither id nor ids are present, set to an empty array
    }

    // Validate that ids is now an array and has at least one ID
    if (ids.length === 0) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Expected at least one id (either in the id field or as an array of ids).');
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
    }

    // Prepare the update object
    const updateData = {};
    if (approvalState !== undefined) {
      updateData.approvalState = approvalState; // Add approvalState only if it is provided
    }

    // Update each artifact based on the provided IDs
    const updatePromises = ids.map(id =>
      ArtifactService.updateById(id, updateData) // Send updateData for each ID
    );

    const results = await Promise.all(updatePromises);  // Wait for all updates to complete
    const successfulUpdates = results.filter(result => result.status === 'success');

    if (successfulUpdates.length > 0) {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${successfulUpdates.length} quiz${successfulUpdates.length > 1 ? 'es' : ''} updated successfully.`,
        successfulUpdates
      );
      return ApiResponseUtils.sendSuccessResponse(successResponse);
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse('No quizzes updated.');
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
    }
  } catch (error) {
    console.error('Error:', error);
    return ApiResponseUtils.sendErrorResponse(error.message);
  }
}

export async function DELETE(req) {
  // Step 1: Extract the query parameter 'id' from the URL
  const url = new URL(req.url);
  const queryId = url.searchParams.get('id');

  // Step 2: Extract the list of IDs from the request body (if present)
  let reqBody = null;
  try {
    reqBody = await req.json();
  } catch (error) {
    // Ignore error if body is empty or invalid
  }

  let ids = reqBody?.ids || []; // Default to an empty array if no ids in body

  // Step 3: If a query parameter 'id' is provided, add it to the array
  if (queryId) {
    ids = [...ids, queryId];  // Combine query param 'id' with body 'ids'
  }


  // Step 4: Validate that we have atleast one ID to delete
  if (ids.length === 0) {
    const errorResponse = ApiResponseUtils.createErrorResponse('Expected at least one id (from query or body).');
    return ApiResponseUtils.sendErrorResponse(errorResponse);
  }

  try {
    // Call the service to handle the deletion
    const deleteResult = await QuizService.deleteQuizzesAndQuestions(ids);

    if (deleteResult.status === 'success') {
      // Fetch updated artifacts if needed
      const successResponse = ApiResponseUtils.createSuccessResponse(
        deleteResult.message,
        deleteResult.result
      );
      return ApiResponseUtils.sendSuccessResponse(successResponse);
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deleteResult.message);
      return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
  } catch (error) {
    console.error('Error deleting quizzes:', error);
    return ApiResponseUtils.sendErrorResponse(error.message);
  }
}


