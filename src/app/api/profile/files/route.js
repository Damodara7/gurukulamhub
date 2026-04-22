import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from '../profile.model'
import { getBucketName, getPublicUrl, getS3Client, isS3Configured } from '@/lib/s3-spaces-config'
import * as ApiResponseUtils from '@/utils/apiResponses'

const FILE_CATEGORY_CONFIG = {
  profilePhoto: { field: 'profilePhotoFile', prefix: 'profile_photo', allowEmpty: false },
  resume: { field: 'resumeFile', prefix: 'resume', allowEmpty: true },
  organizationRegistration: { field: 'organizationRegistrationFile', prefix: 'organization_registration', allowEmpty: true },
  organizationGST: { field: 'organizationGSTFile', prefix: 'organization_gst', allowEmpty: true },
  organizationPAN: { field: 'organizationPANFile', prefix: 'organization_pan', allowEmpty: true }
}

function resolveCategoryConfig(category) {
  const config = FILE_CATEGORY_CONFIG[category]
  if (!config) return null
  return config
}

function sanitizeFileName(fileName) {
  const safe = String(fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  return safe.length > 120 ? safe.slice(-120) : safe
}

function extractKeyFromImageUrl(imageUrl, bucket) {
  if (!imageUrl || !bucket) return ''
  try {
    const parsed = new URL(imageUrl)
    const pathName = decodeURIComponent(parsed.pathname || '')
    const bucketPrefix = `/${bucket}/`
    if (pathName.startsWith(bucketPrefix)) {
      return pathName.slice(bucketPrefix.length)
    }
    return pathName.replace(/^\/+/, '')
  } catch (error) {
    return ''
  }
}

async function tryDeleteObjectIfExists(client, bucket, key) {
  if (!key) return
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } catch (error) {
    console.warn('[profile-files] Unable to delete old object:', key, error?.message)
  }
}

export async function POST(request) {
  try {
    if (!isS3Configured()) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('DigitalOcean Spaces is not configured'))
    }

    const formData = await request.formData()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const category = String(formData.get('category') || '').trim()
    const file = formData.get('file')

    if (!email || !category || !file) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse('email, category and file are required')
      )
    }

    const categoryConfig = resolveCategoryConfig(category)
    if (!categoryConfig) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Invalid file category'))
    }

    await connectMongo()

    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Profile not found'))
    }

    const client = getS3Client()
    const bucket = getBucketName()
    const safeName = sanitizeFileName(file.name)
    const key = `${email}/${categoryConfig.prefix}-${Date.now()}-${safeName}`
    const body = Buffer.from(await file.arrayBuffer())

    try {
      const basePutParams = {
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream'
      }

      try {
        await client.send(
          new PutObjectCommand({
            ...basePutParams,
            ACL: 'public-read'
          })
        )
      } catch (aclError) {
        // Some S3-compatible setups disable ACL. Fall back to plain put.
        if (
          aclError?.name === 'NotImplemented' ||
          aclError?.code === 'NotImplemented' ||
          /acl|AccessControl/i.test(aclError?.message || '')
        ) {
          await client.send(new PutObjectCommand(basePutParams))
        } else {
          throw aclError
        }
      }
    } catch (uploadError) {
      return ApiResponseUtils.sendErrorResponse(
        ApiResponseUtils.createErrorResponse(uploadError?.message || 'Failed to upload file')
      )
    }

    await tryDeleteObjectIfExists(client, bucket, profile?.[categoryConfig.field]?.key)

    const metadata = {
      key,
      url: getPublicUrl(key),
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size || body.length,
      uploadedAt: new Date()
    }

    profile[categoryConfig.field] = metadata
    if (category === 'profilePhoto') {
      profile.image = metadata.url
    }
    await profile.save()

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('File uploaded successfully', metadata)
    )
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to upload file')
    )
  }
}

export async function DELETE(request) {
  try {
    if (!isS3Configured()) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('DigitalOcean Spaces is not configured'))
    }

    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const category = String(body?.category || '').trim()

    if (!email || !category) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('email and category are required'))
    }

    const categoryConfig = resolveCategoryConfig(category)
    if (!categoryConfig) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Invalid file category'))
    }

    await connectMongo()
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Profile not found'))
    }

    const existingMeta = profile?.[categoryConfig.field]
    if (existingMeta?.key) {
      const client = getS3Client()
      const bucket = getBucketName()
      await tryDeleteObjectIfExists(client, bucket, existingMeta.key)
    }

    profile[categoryConfig.field] = null
    if (category === 'profilePhoto') {
      profile.image = ''
    }
    await profile.save()

    return ApiResponseUtils.sendSuccessResponse(
      ApiResponseUtils.createSuccessResponse('File removed successfully', { category })
    )
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to remove file')
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = String(searchParams.get('email') || '').trim().toLowerCase()
    const category = String(searchParams.get('category') || '').trim()
    const action = String(searchParams.get('action') || 'metadata').trim()

    if (!email || !category) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('email and category are required'))
    }

    const categoryConfig = resolveCategoryConfig(category)
    if (!categoryConfig) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Invalid file category'))
    }

    await connectMongo()
    const profile = await UserProfile.findOne({ email }).lean()
    if (!profile) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('Profile not found'))
    }

    let metadata = profile?.[categoryConfig.field]
    if (!metadata?.key && category === 'profilePhoto' && profile?.image) {
      const bucket = getBucketName()
      const imageKey = extractKeyFromImageUrl(profile.image, bucket)
      if (imageKey) {
        metadata = {
          key: imageKey,
          url: profile.image,
          fileName: imageKey.split('/').pop() || 'profile-photo',
          mimeType: 'image/jpeg'
        }
      }
    }
    if (!metadata?.key) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('File not found'))
    }

    if (action !== 'content') {
      const viewUrl = `/api/profile/files?email=${encodeURIComponent(email)}&category=${encodeURIComponent(
        category
      )}&action=content`
      return ApiResponseUtils.sendSuccessResponse(
        ApiResponseUtils.createSuccessResponse('File metadata fetched successfully', {
          ...metadata,
          viewUrl
        })
      )
    }

    if (!isS3Configured()) {
      return ApiResponseUtils.sendErrorResponse(ApiResponseUtils.createErrorResponse('DigitalOcean Spaces is not configured'))
    }

    const client = getS3Client()
    const bucket = getBucketName()
    const object = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: metadata.key
      })
    )

    const headers = new Headers()
    headers.set('Content-Type', metadata.mimeType || object.ContentType || 'application/octet-stream')
    headers.set('Cache-Control', 'private, max-age=60')
    if (metadata.fileName) {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(metadata.fileName)}"`)
    }

    return new Response(object.Body, { status: 200, headers })
  } catch (error) {
    return ApiResponseUtils.sendErrorResponse(
      ApiResponseUtils.createErrorResponse(error?.message || 'Failed to fetch file')
    )
  }
}
