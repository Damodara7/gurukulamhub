import * as RoleService from './geo-role.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';

const Artifact = 'Role';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        let artifact;
        if (id) {
            artifact = await RoleService.getById({ id });
        } else {
            artifact = await RoleService.getAll();
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

// **DELETE Request**
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Role');
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }

        const deletedRole = await RoleService.deleteOne({ id });

        if (deletedRole.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedRole.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedRole.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}
