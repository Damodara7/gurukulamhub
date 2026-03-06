/**
 * Chat file upload service: DigitalOcean Spaces (S3) with fallback to local storage
 * Path: chat-uploads/{conversationId}/{uploadId}/{sanitizedFileName}
 */

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getS3Client, getBucketName, isS3Configured, getPublicUrl } from './s3-spaces-config'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
]
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_VIDEO_TYPES]

/**
 * Sanitize filename: keep extension, replace rest with safe chars
 * @param {string} fileName
 * @returns {string}
 */
function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return `file-${uuidv4()}`
  const ext = path.extname(fileName).toLowerCase() || ''
  const base = path.basename(fileName, ext)
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100) || 'file'
  return `${safeBase}-${uuidv4().slice(0, 8)}${ext}`
}

/**
 * Validate file type and size
 * @param {{ type: string, size: number }} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateChatFile(file) {
  if (!file || file.size === undefined) {
    return { valid: false, error: 'Invalid file' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size must be under ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` }
  }
  const type = (file.type || '').toLowerCase()
  if (!ALLOWED_TYPES.includes(type)) {
    return {
      valid: false,
      error: 'File type not allowed. Use images (jpg, png, webp, gif), documents (pdf, docx), or videos (mp4, webm).'
    }
  }
  return { valid: true }
}

/**
 * Upload a single file to S3 (DigitalOcean Spaces)
 * @param {Buffer} buffer
 * @param {string} key - S3 key
 * @param {string} contentType
 * @returns {Promise<{ url: string, key: string }>}
 */
async function uploadToS3(buffer, key, contentType) {
  const client = getS3Client()
  const bucket = getBucketName()
  if (!client || !bucket) {
    throw new Error('S3 is not configured')
  }
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }
  try {
    await client.send(new PutObjectCommand({ ...params, ACL: 'public-read' }))
  } catch (aclErr) {
    if (aclErr.name === 'NotImplemented' || aclErr.code === 'NotImplemented' || /acl|AccessControl/i.test(aclErr.message || '')) {
      await client.send(new PutObjectCommand(params))
    } else {
      throw aclErr
    }
  }
  const url = getPublicUrl(key)
  return { url, key }
}

/**
 * Upload a single file to local storage (fallback)
 * @param {Buffer} buffer
 * @param {string} relativePath - e.g. chat/conv_123/upload_456/file.png (full relative path including filename)
 * @returns {Promise<{ url: string, key: string }>}
 */
async function uploadToLocal(buffer, relativePath) {
  const dirRelative = path.dirname(relativePath)
  const fileName = path.basename(relativePath)
  const baseDir = path.join(process.cwd(), 'public', 'uploads', dirRelative)
  const fullPath = path.join(baseDir, fileName)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(fullPath, buffer)
  const url = `/uploads/${relativePath.replace(/\\/g, '/')}`
  return { url, key: relativePath }
}

/**
 * Upload one file: try S3 first, fallback to local
 * @param {{ buffer: Buffer, originalName: string, mimeType: string, size: number }} file
 * @param {string} conversationId - chatId (individual) or groupId (group)
 * @returns {Promise<{ fileName: string, fileType: string, fileSize: number, url: string, key: string, uploadedAt: string }>}
 */
export async function uploadChatFile(file, conversationId) {
  const uploadId = uuidv4().slice(0, 8)
  const sanitized = sanitizeFileName(file.originalName)
  const s3Key = `chat-uploads/${conversationId}/${uploadId}/${sanitized}`

  const uploadedAt = new Date().toISOString()
  const meta = {
    fileName: file.originalName,
    fileType: file.mimeType,
    fileSize: file.size,
    uploadedAt
  }

  try {
    if (isS3Configured()) {
      const { url, key } = await uploadToS3(file.buffer, s3Key, file.mimeType)
      return { ...meta, url, key }
    }
  } catch (err) {
    console.warn('[ChatUpload] S3 upload failed, using local fallback:', err?.message)
  }

  const localPath = `chat/${conversationId}/${uploadId}/${sanitized}`
  const { url, key } = await uploadToLocal(file.buffer, localPath)
  return { ...meta, url, key }
}

/**
 * Process multiple files from FormData or array of { buffer, originalName, mimeType, size }
 * @param {Array<{ buffer: Buffer, originalName: string, mimeType: string, size: number }>} files
 * @param {string} conversationId
 * @returns {Promise<Array<{ fileName: string, fileType: string, fileSize: number, url: string, key: string, uploadedAt: string }>>}
 */
export async function uploadChatFiles(files, conversationId) {
  const results = []
  for (const file of files) {
    const validation = validateChatFile({ type: file.mimeType, size: file.size })
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    const result = await uploadChatFile(file, conversationId)
    results.push(result)
  }
  return results
}
