import * as RoleService from './role.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';
import { auth } from '@/libs/auth';
import { ROLES_LOOKUP } from '@/configs/roles-lookup';
import * as RestApi from '@/utils/restApiUtil';
import { API_URLS } from '@/configs/apiConfig';

const Artifact = 'Role';

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
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const activeOnly = searchParams.get('activeOnly') === 'true';

        let artifact;
        if (id) {
            artifact = await RoleService.getById({ id });
        } else {
            artifact = await RoleService.getAll({ activeOnly });
        }

        if (artifact.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(artifact.message, artifact.result);
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(artifact.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message);
        return ApiResponseUtils.sendErrorResponse(errorResponse);
    }
}

// **POST Request**
export async function POST(request) {
    try {
        const reqBody = await request.json();
        const newRole = await RoleService.add({ data: reqBody });

        if (newRole.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                newRole.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(newRole.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}

// **PUT Request**
export async function PUT(request) {
    try {
        const reqBody = await request.json();
        
        if (reqBody._id) {
            const existingRole = await RoleService.getById({ id: reqBody._id });
            if (existingRole.status === 'success' && existingRole.result) {
                const existingName = existingRole.result.name;
                const newName = reqBody.name;
                
                // If name is being changed, check if user is SUPER_ADMIN
                if (existingName && newName && existingName !== newName) {
                    const isSuperAdmin = await isSuperAdminUser();
                    if (!isSuperAdmin) {
                        const errorResponse = ApiResponseUtils.createErrorResponse(
                            'Only SUPER_ADMIN can rename roles'
                        );
                        return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Forbidden);
                    }
                }

                // If isActive is being changed, check if user is SUPER_ADMIN
                if (reqBody.isActive !== undefined && reqBody.isActive !== existingRole.result.isActive) {
                    const isSuperAdmin = await isSuperAdminUser();
                    if (!isSuperAdmin) {
                        const errorResponse = ApiResponseUtils.createErrorResponse(
                            'Only SUPER_ADMIN can change role active status'
                        );
                        return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Forbidden);
                    }
                }
            }
        }
        
        const updatedRole = await RoleService.updateOne({ id: reqBody._id, data: reqBody });

        if (updatedRole.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedRole.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedRole.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}

// **PATCH Request** - Toggle role active status
export async function PATCH(request) {
    try {
        const isSuperAdmin = await isSuperAdminUser();
        if (!isSuperAdmin) {
            const errorResponse = ApiResponseUtils.createErrorResponse(
                'Only SUPER_ADMIN can change role active status'
            );
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Forbidden);
        }

        const reqBody = await request.json();
        const { id, isActive, updatedBy } = reqBody;

        if (!id) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Role ID is required');
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }

        if (typeof isActive !== 'boolean') {
            const errorResponse = ApiResponseUtils.createErrorResponse('isActive must be a boolean');
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }

        const result = await RoleService.toggleActive({ id, isActive, updatedBy });

        if (result.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result);
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(result.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}

