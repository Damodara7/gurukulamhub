import * as AccountTypeService from './account-type.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';

export const dynamic = 'force-dynamic'

const Artifact = 'Account Type';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        let artifact;
        if (id) {
            artifact = await AccountTypeService.getById({ id });
        } else {
            artifact = await AccountTypeService.getAll();
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
        const newAccountType = await AccountTypeService.add({ data: reqBody });

        if (newAccountType.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                newAccountType.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(newAccountType.message);
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
        const { _id: id, ...rest } = reqBody
        const updatedAccountType = await AccountTypeService.updateOne({ id, data: { ...rest } });

        if (updatedAccountType.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedAccountType.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedAccountType.message);
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
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Account Type');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        const deletedAccountType = await AccountTypeService.deleteOne({id});

        if (deletedAccountType.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedAccountType.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedAccountType.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}

