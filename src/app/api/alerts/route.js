import * as AlertService from './alerts.service.js';
import * as ApiResponseUtils from '@/utils/apiResponses';

const Artifact = 'Alert';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries())

        let response;

        if (queryParams.id) {
            response = await AlertService.getById(queryParams.id);
        } else {
            response = await AlertService.getAllByQueryParams(queryParams);
        }

        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result);
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message);
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
        const newAlert = await AlertService.add({ data: reqBody });

        if (newAlert.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                newAlert.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(newAlert.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}

// **PUT Request**
export async function PUT(request) {
    try {
        const reqBody = await request.json();
        const { id, ...rest } = reqBody;
        const updatedAlert = await AlertService.updateOne({ id, data: { ...rest } });

        if (updatedAlert.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedAlert.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedAlert.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
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
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Alert');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        const deletedAlert = await AlertService.deleteOne({ id });

        if (deletedAlert.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedAlert.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedAlert.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}
