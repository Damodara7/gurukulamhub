import { addAssociatedOrganization, getAllAssociatedOrganizations } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/associated-organizations
export async function GET(request) {
  try {
    const result = await getAllAssociatedOrganizations(email)
    if (!result) {
      throw new Error(`Couldn't fetch associated organizations.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Successfully fetched associated organizations.',
        result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('in profile/associatedOrganizations GET : ', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// POST /api/profile/associated-organizations
export async function POST(request) {
  try {
    const { email, organization } = await request.json()
    const result = await addAssociatedOrganization(email, organization)

    if (!result) {
      throw new Error(`Couldn't create associated organization.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Successfully created associated organization.',
        result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('in profile/associatedOrganizations/ POST: ', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
