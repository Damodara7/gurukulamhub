import { addLanguage, getAllLanguages } from '@/app/services/profile.service'
import * as ApiResponseUtils from '@/utils/apiResponses'

// GET /api/profile/languages
export async function GET(request) {
  try {
    const result = await getAllLanguages()
    if (!result) {
      throw new Error(`Couldn't get all languages`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully fetched languages.',result)
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
    const result = await addLanguage(email, language)

    if (!result) {
      throw new Error(`Couldn't create language.`)
    } else {
      const successResponse = ApiResponseUtils.createSuccessResponse('Successfully created language.',result)
      return ApiResponseUtils.sendSuccessResponse(successResponse)
    }
  } catch (error) {
    console.error('api/profile/languages POST -> Error creating language: ', error)
    const errorResponse = ApiResponseUtils.createErrorResponse(error.message)
    return ApiResponseUtils.sendErrorResponse(errorResponse)
  }
}
