import { auth } from '@/libs/auth'
import * as ApiResponseUtils from '@/utils/apiResponses'
import { uploadChatFiles } from '@/lib/chat-upload-service'

async function parseMultipartFormData(request) {
  const formData = await request.formData()
  const conversationId = formData.get('conversationId')
  const conversationType = formData.get('conversationType') // 'individual' | 'group'
  const files = []
  for (const [key, value] of formData.entries()) {
    if (key === 'files' && value && typeof value.arrayBuffer === 'function') {
      const buffer = Buffer.from(await value.arrayBuffer())
      const fileName = value.name || 'file'
      const mimeType = value.type || 'application/octet-stream'
      files.push({
        buffer,
        originalName: fileName,
        mimeType,
        size: buffer.length
      })
    }
  }
  return { conversationId, conversationType, files }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('Unauthorized')
      )
    }

    const { conversationId, conversationType, files } = await parseMultipartFormData(request)

    if (!conversationId || typeof conversationId !== 'string') {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('conversationId is required')
      )
    }
    if (!conversationType || !['individual', 'group'].includes(conversationType)) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('conversationType must be "individual" or "group"')
      )
    }
    if (!files.length) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('At least one file is required')
      )
    }

    const uploaded = await uploadChatFiles(files, conversationId)
    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('Files uploaded', { uploaded })
    )
  } catch (error) {
    console.error('[ChatUpload] Error:', error)
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(
        error.message || 'Upload failed'
      )
    )
  }
}
