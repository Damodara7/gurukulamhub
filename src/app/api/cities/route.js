import * as CitiesService from './cities.service';
import * as ApiResponseUtils from '@/utils/apiResponses';

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    let queryParams = Object.fromEntries(searchParams.entries())

    if (queryParams.state) {
        queryParams = {
            ...queryParams,
            state: { $regex: new RegExp(queryParams.state, 'i') }, // case-insensitive search for the 'state' field
        };
    }
    try {
        console.log("inside get request cities")
        const response = await CitiesService.getCities(queryParams)
        if (response.status === 'success') {
            const successResponse = ApiResponseUtils.createSuccessResponse(response.message, response.result)
            return ApiResponseUtils.sendSuccessResponse(successResponse)
        } else {
            const errorResponse = ApiResponseUtils.createErrorResponse(response.message)
            return ApiResponseUtils.sendErrorResponse(errorResponse)
        }
    } catch (error) {
        console.error(error)
        const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
        return ApiResponseUtils.sendErrorResponse(errorResponse)
    }
}
