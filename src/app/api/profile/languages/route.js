import { addLanguage, getAllLanguages, updateLanguage, deleteLanguage } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/languages
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      throw new Error('Email parameter is required')
    }

    const result = await getAllLanguages(email)
    if (!result) {
      throw new Error(`Couldn't get all languages`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched languages.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('api/profile/languages GET -> Error fetching languages: ', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// POST /api/profile/languages
export async function POST(request) {
  try {
    const { email, language } = await request.json()
    const result = await addLanguage({ email, language })

    if (!result) {
      throw new Error(`Couldn't create language.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created language.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('api/profile/languages POST -> Error creating language: ', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// PUT /api/profile/languages/[id]
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const languageId = searchParams.get('id')
    const { email, language } = await request.json()

    if (!languageId) {
      throw new Error('Language ID is required')
    }

    const result = await updateLanguage(languageId, { email, language })

    if (!result) {
      throw new Error(`Couldn't update language.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully updated language.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/languages PUT :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}

// DELETE /api/profile/languages/[id]
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const languageId = searchParams.get('id')

    if (!languageId) {
      throw new Error('Language ID is required')
    }

    const result = await deleteLanguage(languageId)

    if (!result) {
      throw new Error(`Couldn't delete language.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully deleted language.', result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('/api/profile/languages DELETE :', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
