import * as UserAlertService from './user-alerts.service.js'; // Import your service layer for UserAlerts
import * as ApiResponseUtils from '@/utils/apiResponses';

const Artifact = 'UserAlert';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());

        console.log({ queryParams })

        let response;

        if (queryParams.id) {
            response = await UserAlertService.getById(queryParams.id);
        } else if (queryParams.email) {
            response = await UserAlertService.getOneByQueryParams(queryParams);
        }
        else if (queryParams.alertId) {
            response = await UserAlertService.getUsersAndAlertStatusByAlertId({ alertId: queryParams.alertId });
        }
        else {
            response = await UserAlertService.getAllByQueryParams(queryParams || {});
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

        let response;

        response = await UserAlertService.add({ data: reqBody });

        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                response.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message);
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
        const { email, alertId, ...rest } = reqBody;
        let updatedUserAlert;
        if (email && alertId) {
            updatedUserAlert = await UserAlertService.updateUserAlertByAlertId({ email, alertId, data: { ...rest } });
        } else {
            updatedUserAlert = await UserAlertService.updateOne({ email, data: { ...rest } });
        }

        if (updatedUserAlert.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedUserAlert.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedUserAlert.message);
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
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of UserAlert');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        const deletedUserAlert = await UserAlertService.deleteOne({ id });

        if (deletedUserAlert.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedUserAlert.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedUserAlert.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}
