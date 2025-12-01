import * as FeatureService from './feature.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';
import { auth } from '@/libs/auth';
import { ROLES_LOOKUP } from '@/configs/roles-lookup';
import * as RestApi from '@/utils/restApiUtil';
import { API_URLS } from '@/configs/apiConfig';

const Artifact = 'Feature';

// Helper function to check if user is SUPER_ADMIN
async function isSuperAdminUser() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return false;
        }
        const userResult = await RestApi.get(`${API_URLS.v0.USER}/${session.user.email}`);
        const userRoles = userResult?.result?.roles || [];
        return userRoles.includes(ROLES_LOOKUP.SUPER_ADMIN);
    } catch (error) {
        console.error('Error checking SUPER_ADMIN:', error);
        return false;
    }
}

// **GET Request**
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    let artifact
    if (id) {
      artifact = await FeatureService.getById({ id })
    } else {
      artifact = await FeatureService.getAll()
    }

    if (artifact.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(artifact.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// **POST Request**
export async function POST(request) {
  try {
    const reqBody = await request.json()
    const newFeature = await FeatureService.add({ data: reqBody })

    if (newFeature.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `New ${Artifact} created successfully`,
        newFeature.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(newFeature.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}

// **PUT Request**
export async function PUT(request) {
    try {
        const reqBody = await request.json();
        const { _id: id, ...rest } = reqBody;
        
        // Check if feature name is being changed - only SUPER_ADMIN can rename features
        if (id && rest.name) {
            const existingFeature = await FeatureService.getById({ id });
            if (existingFeature.status === 'success' && existingFeature.result) {
                const existingName = existingFeature.result.name;
                const newName = rest.name;
                
                // If name is being changed, check if user is SUPER_ADMIN
                if (existingName && newName && existingName !== newName) {
                    const isSuperAdmin = await isSuperAdminUser();
                    if (!isSuperAdmin) {
                        const errorResponse = ApiResponseUtils.createErrorResponse(
                            'Only SUPER_ADMIN can rename features'
                        );
                        return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Forbidden);
                    }
                }
            }
        }
        
        const updatedFeature = await FeatureService.updateOne({ id, data: { ...rest } });

    if (updatedFeature.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${Artifact} updated successfully`,
        updatedFeature.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updatedFeature.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}

// **DELETE Request**
export async function DELETE(req) {
    try {
        // Only SUPER_ADMIN can delete features
        const isSuperAdmin = await isSuperAdminUser();
        if (!isSuperAdmin) {
            const errorResponse = ApiResponseUtils.createErrorResponse(
                'Only SUPER_ADMIN can delete features'
            );
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Forbidden);
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Feature')
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }

    // Extract email from request body if available (for audit trail)
    let email = null
    try {
      const reqBody = await req.json()
      email = reqBody?.email || null
    } catch (e) {
      // Request body might be empty, which is okay
      email = null
    }

    const deletedFeature = await FeatureService.deleteOne({ id, email })

    if (deletedFeature.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${Artifact} deleted successfully`,
        deletedFeature.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedFeature.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}
