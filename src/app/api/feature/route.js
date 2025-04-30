import * as FeatureService from './feature.service.js';
import { HttpStatusCode } from '@/utils/HttpStatusCodes';
import * as ApiResponseUtils from '@/utils/apiResponses';

const Artifact = 'Feature';

// **GET Request**
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        let artifact;
        if (id) {
            artifact = await FeatureService.getById({ id });
        } else {
            artifact = await FeatureService.getAll();
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
        const newFeature = await FeatureService.add({ data: reqBody });

        if (newFeature.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `New ${Artifact} created successfully`,
                newFeature.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(newFeature.message);
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
        const updatedFeature = await FeatureService.updateOne({ id, data: { ...rest } });

        if (updatedFeature.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} updated successfully`,
                updatedFeature.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(updatedFeature.message);
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
            const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Feature');
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }

        const deletedFeature = await FeatureService.deleteOne({id});

        if (deletedFeature.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(
                `${Artifact} deleted successfully`,
                deletedFeature.result
            );
            return ApiResponseUtils.sendSuccessResponse(successResponse);
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(deletedFeature.message);
            return ApiResponseUtils.sendErrorResponse(errorResponse);
        }
    } catch (error) {
        return ApiResponseUtils.sendErrorResponse(error.message);
    }
}
