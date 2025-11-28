import * as GeoRoleService from './geo-role.service.js'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as ApiResponseUtils from '@/utils/apiResponses'

const Artifact = 'Geo Role'

// **GET Request**
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    let artifact
    if (id) {
      artifact = await GeoRoleService.getById({ id })
    } else {
      artifact = await GeoRoleService.getAll()
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
    const newGeoRole = await GeoRoleService.add({ data: reqBody })

    if (newGeoRole.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `New ${Artifact} created successfully`,
        newGeoRole.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(newGeoRole.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}

// **PUT Request**
export async function PUT(request) {
  try {
    const reqBody = await request.json()
    const { _id: id, ...rest } = reqBody
    const updatedGeoRole = await GeoRoleService.updateOne({ id, data: { ...rest } })

    if (updatedGeoRole.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${Artifact} updated successfully`,
        updatedGeoRole.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(updatedGeoRole.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}

// **DELETE Request**
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      const errorResponse = ApiResponseUtils.createErrorResponse('Expected id of Geo Role')
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
    let email = null
    try {
      const reqBody = await req.json()
      email = reqBody?.email || null
    } catch (e) {
      email = null
    }

    const deletedGeoRole = await GeoRoleService.deleteOne({ id, email })

    if (deletedGeoRole.status === 'success') {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        `${Artifact} deleted successfully`,
        deletedGeoRole.result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    } else {
      const errorResponse = ApiResponseUtils.createErrorResponse(deletedGeoRole.message)
      return ApiResponseUtils.sendErrorResponse(errorResponse, HttpStatusCode.Ok)
    }
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(error.message)
  }
}
