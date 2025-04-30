
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'
import * as ContextService from './context.service.js'
const Artifact = 'Context'
const ArtifactService = ContextService;



export async function GET(req, { filter }) {
  try {

    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    // Convert searchParams to an object
    const queryParamsObj = Object.fromEntries(searchParams.entries());

    // const showFilter = searchParams.get("showFilter");
    // var artifact = {};
    // if (showFilter && showFilter === "allEvenDeleted") {
    //   artifact = await ArtifactService.getAllEvenDeleted();
    // }
    // else if (showFilter && showFilter === "active") {
    //   artifact = await ArtifactService.getActive();
    // }
    // else {
    //   artifact = await ArtifactService.getAll();
    // }
    const artifact = await ArtifactService.getArtifacts({ queryParams: queryParamsObj })
    //console.log("advt: " , advt.result);
    if (artifact.status === 'success') {
      var successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result);
      return ApiResponseUtils.sendSuccessResponse(successResponse);
    } else if (artifact.status === 'error') {
      var errorResponse = ApiResponseUtils.createErrorResponse(artifact.message);
      return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message);
    return ApiResponseUtils.sendErrorResponse(errorResponse);
  }
}

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const newArtifact = await ArtifactService.add(reqBody);

    console.log(`${Artifact} Creation Step Started:`, newArtifact);

    if (newArtifact.status === 'success') {
      console.log(`${Artifact} Created Successfully`);
      const successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} created successfully`, newArtifact.result);
      return ApiResponseUtils.sendSuccessResponse(successResponse);
    } else {
      console.log(`${Artifact} Creation error.`);
      const errorResponse = ApiResponseUtils.createErrorResponse(newArtifact.message);
      return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message);
  }
}


export async function PUT(request) {
  //await connectMongo()
  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json();
    console.log({reqBody})
    const { id, ...restBody } = reqBody;
    //const { email, password } = reqBody
    const newArtifact = await ArtifactService.update(id,
      { ...restBody }
    )
    console.log(`${Artifact} Update Step 1 :`, newArtifact)
    if (newArtifact.status === 'success') {
      console.log(`${Artifact} Updated Successfully ():`);
      // Return the created advt data as JSON
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} Updated successfully`, newAdd)
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

export async function PATCH(request) {
  // Establish a connection to MongoDB
  try {
    const reqBody = await request.json();
    const { id, ...partialUpdateData } = reqBody;

    // Call the service to apply the patch
    const patchedArtifact = await ArtifactService.patch(id, partialUpdateData);
    console.log('`${Artifact}` Patch Step 1:', patchedArtifact);

    if (patchedArtifact.status === 'success') {
      console.log(`${Artifact} Patched Successfully`);
      // Return the updated data as JSON
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${Artifact} Patched successfully`,
        patchedArtifact.result
      );
      return ApiResponseUtils.sendSuccessResponse(successResponse);
    } else {
      console.log(`${Artifact} patching error.`);
      const errorResponse = ApiResponseUtils.createErrorResponse(
        patchedArtifact.message
      );
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error?.message);
  }
}


export async function DELETE(req) {

  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const id = searchParams.get("id");

  if (!id) {
    const errorResponse = ApiResponseUtils.createErrorResponse("Expected id of context")
    return ApiResponseUtils.sendErrorResponse(errorResponse);
  }

  try {
    console.log("Received deleted request for id:", id)
    const deletedAd = await ArtifactService.deleteArtifact(id);
    if (deletedAd.status === 'success') {
      console.log(`${Artifact} deleted Successfully ():`);
      var successResponse = ApiResponseUtils.createSuccessResponse(`${Artifact} deleted Successfully ():`, deletedAd)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      console.log(`${Artifact} deletion error.`)
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedAd.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    var errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}





