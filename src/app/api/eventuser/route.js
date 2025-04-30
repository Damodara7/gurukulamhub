import * as EventUserService from './eventuser.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';

const Artifact = 'EventUser';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        let artifact;
        if (id) {
            artifact = await EventUserService.getById(id);
        } else {
            artifact = await EventUserService.getAll();
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
        const newEventUser = await EventUserService.add(reqBody);

        if (newEventUser.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                newEventUser.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(newEventUser.message);
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
        const updatedEventUser = await EventUserService.update(reqBody._id, reqBody);

        if (updatedEventUser.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedEventUser.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedEventUser.message);
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
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of EventUser');
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }

        const deletedEventUser = await EventUserService.deleteEventUser(id);

        if (deletedEventUser.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedEventUser.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedEventUser.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}
