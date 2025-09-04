import * as GameService from '../game.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'

export async function GET(req, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Game ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }

    const result = await GameService.getOne({ _id: id })
    
    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.NotFound)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.InternalServerError)
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params
    const reqBody = await req.json()
    
    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Game ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }

    const result = await GameService.updateOne(id, reqBody)
    
    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.InternalServerError)
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const reqBody = await req.json()
    const { email } = reqBody
    
    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Game ID is required')
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }

    const result = await GameService.deleteOne(id, { email })
    
    if (result.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(result.message, result.result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(result.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.BadRequest)
    }
  } catch (error) {
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message || 'Internal server error')
    return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.InternalServerError)
  }
}
