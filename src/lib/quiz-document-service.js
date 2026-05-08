/**
 * Quiz document upload service.
 *
 * Uploads files to DigitalOcean Spaces (S3-compatible) when configured, with a safe
 * fallback to the local /public/uploads directory so the app keeps working in dev.
 *
 * S3 key shape:  quiz-documents/{quizUuid}/{documentId}/{sanitizedFileName}
 */

import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getBucketName, getPublicUrl, getS3Client, isS3Configured } from './s3-spaces-config'
import path from 'path'
import fs from 'fs'

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB per quiz document

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
])

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.jpg', '.jpeg', '.png', '.webp', '.gif'
])

function sanitizeSegment(value, fallback = 'item') {
  const safe = String(value || fallback).replace(/[^a-zA-Z0-9._-]/g, '_')
  return safe.length ? safe.slice(0, 80) : fallback
}

function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== 'string') return `document-${Date.now()}`
  const ext = path.extname(fileName).toLowerCase() || ''
  const base = path.basename(fileName, ext).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'document'
  return `${base}${ext}`
}

function inferMediaType(mimeType, fileName) {
  const mt = (mimeType || '').toLowerCase()
  if (mt.startsWith('image/')) return 'image'
  if (mt === 'application/pdf') return 'pdf'
  if (mt.includes('word')) return 'doc'
  if (mt.includes('excel') || mt.includes('spreadsheet')) return 'spreadsheet'
  if (mt.includes('powerpoint') || mt.includes('presentation')) return 'presentation'
  if (mt === 'text/plain') return 'text'
  if (mt === 'text/csv') return 'csv'
  const ext = path.extname(fileName || '').toLowerCase().replace('.', '')
  return ext || 'document'
}

export function validateQuizDocument(file) {
  if (!file || typeof file.size !== 'number') {
    return { valid: false, error: 'Invalid file' }
  }
  if (file.size <= 0) {
    return { valid: false, error: 'File is empty' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size must be under ${Math.floor(MAX_FILE_SIZE_BYTES / 1024 / 1024)} MB` }
  }
  const type = (file.type || '').toLowerCase()
  const ext = path.extname(file.name || '').toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(type) && !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: 'File type is not allowed for quiz documents.' }
  }
  return { valid: true }
}

async function uploadToSpaces(buffer, key, contentType) {
  const client = getS3Client()
  const bucket = getBucketName()
  if (!client || !bucket) {
    throw new Error('S3 / DigitalOcean Spaces is not configured')
  }
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream'
  }
  try {
    await client.send(new PutObjectCommand({ ...params, ACL: 'public-read' }))
  } catch (aclErr) {
    const isAclIssue =
      aclErr?.name === 'NotImplemented' ||
      aclErr?.code === 'NotImplemented' ||
      /acl|AccessControl/i.test(aclErr?.message || '')
    if (isAclIssue) {
      await client.send(new PutObjectCommand(params))
    } else {
      throw aclErr
    }
  }
  return { url: getPublicUrl(key), key, storage: 's3' }
}

async function uploadToLocal(buffer, relativePath) {
  const dirRelative = path.dirname(relativePath)
  const fileName = path.basename(relativePath)
  const baseDir = path.join(process.cwd(), 'public', 'uploads', dirRelative)
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true })
  }
  fs.writeFileSync(path.join(baseDir, fileName), buffer)
  const url = `/uploads/${relativePath.replace(/\\/g, '/')}`
  return { url, key: relativePath, storage: 'local' }
}

export async function uploadQuizDocument({ buffer, originalName, mimeType, size, quizUuid, documentId }) {
  const safeQuiz = sanitizeSegment(quizUuid, 'quiz')
  const safeDocId = sanitizeSegment(documentId, `doc-${Date.now()}`)
  const safeFileName = sanitizeFileName(originalName || 'document')
  const relativePath = `quiz-documents/${safeQuiz}/${safeDocId}/${safeFileName}`

  const meta = {
    fileName: originalName || safeFileName,
    mimeType: mimeType || 'application/octet-stream',
    size: size || (buffer ? buffer.length : 0),
    mediaType: inferMediaType(mimeType, originalName),
    uploadedAt: new Date().toISOString()
  }

  if (isS3Configured()) {
    try {
      const result = await uploadToSpaces(buffer, relativePath, mimeType)
      return { ...meta, ...result }
    } catch (err) {
      console.warn('[QuizDocumentUpload] Spaces upload failed, falling back to local:', err?.message)
    }
  }

  const result = await uploadToLocal(buffer, relativePath)
  return { ...meta, ...result }
}

export async function deleteQuizDocument({ key }) {
  if (!key) return { ok: false, error: 'Missing key' }

  if (key.startsWith('quiz-documents/') && isS3Configured()) {
    try {
      const client = getS3Client()
      const bucket = getBucketName()
      if (client && bucket) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
        return { ok: true, storage: 's3' }
      }
    } catch (err) {
      console.warn('[QuizDocumentUpload] Spaces delete failed:', err?.message)
    }
  }

  // Try local fallback
  try {
    const fullPath = path.join(process.cwd(), 'public', 'uploads', key)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      return { ok: true, storage: 'local' }
    }
  } catch (err) {
    console.warn('[QuizDocumentUpload] Local delete failed:', err?.message)
  }

  return { ok: false, error: 'Object not found or not deletable' }
}
