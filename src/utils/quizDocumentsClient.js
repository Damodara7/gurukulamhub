import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

/**
 * Build the canonical document object that gets stored in the quiz's `documents`
 * array in MongoDB. Strips any non-serializable fields (e.g., `file`, `pending`).
 */
function buildPersistedDoc(doc, meta = {}) {
  const url = meta.url || doc.url || doc.document || ''
  return {
    id: doc.id,
    description: doc.description || '',
    document: url,
    url,
    key: meta.key || doc.key || '',
    fileName: meta.fileName || doc.fileName || '',
    mimeType: meta.mimeType || doc.mimeType || '',
    size: meta.size || doc.size || 0,
    mediaType: meta.mediaType || doc.mediaType || 'document',
    uploadedAt: meta.uploadedAt || doc.uploadedAt || new Date().toISOString()
  }
}

/**
 * Upload any documents in `documents` that have a staged `file` (i.e., haven't
 * been uploaded yet). Returns a clean array suitable for saving to MongoDB.
 *
 * Throws on the first upload failure so the caller can abort the quiz save.
 */
export async function uploadPendingDocuments(documents, quizUuid) {
  if (!Array.isArray(documents) || documents.length === 0) return []

  const result = []
  for (const doc of documents) {
    if (doc.url || doc.document) {
      result.push(buildPersistedDoc(doc))
      continue
    }

    if (!doc.file) {
      // Nothing to upload, nothing already uploaded — skip empty entry
      continue
    }

    const formData = new FormData()
    formData.append('file', doc.file)
    formData.append('quizUuid', quizUuid)
    formData.append('documentId', doc.id)

    let response
    try {
      response = await RestApi.submitFormData(API_URLS.v0.USERS_QUIZ_DOCUMENTS, formData)
    } catch (err) {
      const msg = err?.message || `Failed to upload "${doc.fileName || doc.description || 'document'}"`
      throw new Error(msg)
    }

    if (response?.status !== 'success') {
      throw new Error(response?.message || `Upload failed for "${doc.fileName || doc.description || 'document'}"`)
    }

    result.push(buildPersistedDoc(doc, response.result || {}))
  }

  return result
}

/**
 * Delete S3 keys for any documents that existed before but are no longer
 * present in the current document list. Errors are swallowed since orphan
 * cleanup should never block a successful quiz save.
 */
export async function deleteRemovedDocuments(originalDocuments, currentDocuments) {
  const original = Array.isArray(originalDocuments) ? originalDocuments : []
  const current = Array.isArray(currentDocuments) ? currentDocuments : []
  if (original.length === 0) return

  const currentIds = new Set(current.map(d => d?.id).filter(Boolean))
  const removed = original.filter(d => d?.key && !currentIds.has(d?.id))

  await Promise.allSettled(
    removed.map(d =>
      RestApi.del(API_URLS.v0.USERS_QUIZ_DOCUMENTS, { key: d.key }).catch(err => {
        console.warn('[quizDocumentsClient] Failed to delete removed doc:', d.key, err?.message)
      })
    )
  )
}
