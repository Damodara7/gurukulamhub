import {
  deleteQuizDocument,
  uploadQuizDocument,
  validateQuizDocument
} from '@/lib/quiz-document-service'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const quizUuid = String(formData.get('quizUuid') || '').trim()
    const documentId = String(formData.get('documentId') || '').trim()

    if (!file || typeof file === 'string') {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('A file is required'),
        HttpStatusCode.BadRequest
      )
    }
    if (!quizUuid || !documentId) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('quizUuid and documentId are required'),
        HttpStatusCode.BadRequest
      )
    }

    const validation = validateQuizDocument(file)
    if (!validation.valid) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(validation.error),
        HttpStatusCode.BadRequest
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const metadata = await uploadQuizDocument({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      quizUuid,
      documentId
    })

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Quiz document uploaded successfully', metadata)
    )
  } catch (error) {
    console.error('[POST /api/quiz/documents]', error)
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to upload quiz document')
    )
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const key = String(body?.key || '').trim()

    if (!key) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('key is required'),
        HttpStatusCode.BadRequest
      )
    }

    const result = await deleteQuizDocument({ key })
    if (!result.ok) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(result.error || 'Failed to remove quiz document'),
        HttpStatusCode.Ok
      )
    }

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Quiz document removed', { key, storage: result.storage })
    )
  } catch (error) {
    console.error('[DELETE /api/quiz/documents]', error)
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to remove quiz document')
    )
  }
}
