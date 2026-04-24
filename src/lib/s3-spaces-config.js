/**
 * DigitalOcean Spaces (S3-compatible) configuration
 * Reads env: S3_SPACE_NAME, S3_REGION, S3_ACCESS_KEY_ID, S3_ACCESS_KEY_SECRET (or non-prefixed)
 * Optional: ORIGIN_ENDPOINT, CDN_ENDPOINT for custom endpoints
 */

import { S3Client } from '@aws-sdk/client-s3'

const VALID_DO_SPACES_REGIONS = new Set(['nyc3', 'sfo3', 'ams3', 'sgp1', 'fra1', 'tor1', 'blr1', 'syd1'])

const requestedRegion =
  process.env.S3_REGION ||
  process.env.NEXT_PUBLIC_S3_REGION ||
  process.env.REGION ||
  process.env.NEXT_PUBLIC_AWS_S3_REGION ||
  'nyc3'
const REGION = VALID_DO_SPACES_REGIONS.has(requestedRegion) ? requestedRegion : 'nyc3'
const SPACE_NAME =
  process.env.S3_SPACE_NAME ||
  process.env.NEXT_PUBLIC_S3_SPACE_NAME ||
  process.env.SPACE_NAME ||
  process.env.NEXT_PUBLIC_AWS_S3_USERPROFILE_UPLOAD_BUCKET ||
  ''
const requestedOriginEndpoint = process.env.ORIGIN_ENDPOINT || process.env.NEXT_PUBLIC_ORIGIN_ENDPOINT || ''

function resolveOriginEndpoint() {
  if (!requestedOriginEndpoint) {
    return `https://${REGION}.digitaloceanspaces.com`
  }

  try {
    const parsed = new URL(requestedOriginEndpoint)
    const hostMatch = parsed.hostname.match(/^([a-z0-9-]+)\.digitaloceanspaces\.com$/i)
    if (hostMatch && VALID_DO_SPACES_REGIONS.has(hostMatch[1])) {
      return `${parsed.protocol}//${parsed.hostname}`
    }
  } catch (error) {
    // Fallback to region-based endpoint below
  }

  // Invalid endpoint configured (e.g., ap-south-1). Use safe fallback.
  return `https://${REGION}.digitaloceanspaces.com`
}

const ORIGIN_ENDPOINT = resolveOriginEndpoint()
const ACCESS_KEY_ID =
  process.env.S3_ACCESS_KEY_ID ||
  process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID ||
  process.env.ACCESS_KEY_ID ||
  process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID ||
  ''
const ACCESS_KEY_SECRET =
  process.env.S3_ACCESS_KEY_SECRET ||
  process.env.NEXT_PUBLIC_S3_ACCESS_KEY_SECRET ||
  process.env.ACCESS_KEY_SECRET ||
  process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_SECRET ||
  ''

/**
 * Whether S3/Spaces is configured and usable
 */
export function isS3Configured() {
  return Boolean(
    SPACE_NAME &&
      ACCESS_KEY_ID &&
      ACCESS_KEY_SECRET &&
      REGION
  )
}

if (!isS3Configured()) {
  console.warn('[s3-spaces-config] Spaces not configured. Expected bucket/region/access keys in server env.')
}

/**
 * Get S3 client for DigitalOcean Spaces
 * @returns {S3Client|null} Client or null if not configured
 */
export function getS3Client() {
  if (!isS3Configured()) return null
  return new S3Client({
    region: REGION,
    endpoint: ORIGIN_ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: ACCESS_KEY_SECRET
    },
    forcePathStyle: false
  })
}

/**
 * Get bucket name
 */
export function getBucketName() {
  return SPACE_NAME
}

/**
 * Get public URL for an object (CDN or origin)
 * Uses CDN_ENDPOINT if set, else ORIGIN_ENDPOINT (env vars from your .env)
 * @param {string} key - S3 object key
 * @returns {string} Public URL
 */
export function getPublicUrl(key) {
  const cdn =
    process.env.CDN_ENDPOINT ||
    process.env.S3_CDN_ENDPOINT ||
    process.env.NEXT_PUBLIC_CDN_ENDPOINT ||
    process.env.NEXT_PUBLIC_S3_CDN_ENDPOINT ||
    ''
  const base = cdn.trim() || ORIGIN_ENDPOINT.replace(/^https?:\/\//, '')
  const protocol = base.startsWith('http') ? '' : 'https://'
  return `${protocol}${base}/${SPACE_NAME}/${key}`
}
