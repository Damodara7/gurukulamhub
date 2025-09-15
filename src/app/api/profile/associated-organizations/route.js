import {
  addAssociatedOrganization,
  getAllAssociatedOrganizations,
  updateAssociatedOrganization,
  deleteAssociatedOrganization
} from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/associated-organizations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

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
    const result = await addAssociatedOrganization({ email, organization })

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

// PUT /api/profile/associated-organizations/[id]
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')
    const { email, organization } = await request.json()

    if (!organizationId) {
      throw new Error('Associated organization ID is required')
    }

    const result = await updateAssociatedOrganization(organizationId, { email, organization })

    if (!result) {
      throw new Error(`Couldn't update associated organization.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Successfully updated associated organization.',
        result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/associated-organizations PUT :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// DELETE /api/profile/associated-organizations/[id]
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('id')

    if (!organizationId) {
      throw new Error('Associated organization ID is required')
    }

    const result = await deleteAssociatedOrganization(organizationId)

    if (!result) {
      throw new Error(`Couldn't delete associated organization.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse(
        'Successfully deleted associated organization.',
        result
      )
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/associated-organizations DELETE :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
