import { auth } from '@/libs/auth'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Force dynamic rendering - this route must be dynamic because it checks authentication
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Dynamic Manifest API Route
 * Returns manifest.json only if user is authenticated
 * Returns empty/invalid manifest if user is not authenticated (hides install icon)
 */
export async function GET(request) {
  try {
    // Check if user is authenticated
    const session = await auth()

    // If user is not authenticated, return an invalid manifest
    // This prevents the browser from showing the install icon
    if (!session?.user) {
      return NextResponse.json(
        {
          name: 'GurukulamHub',
          short_name: 'GurukulamHub',
          start_url: '/welcome',
          display: 'browser', // Use 'browser' instead of 'standalone' to prevent install prompt
          icons: [] // Empty icons array
        },
        {
          headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      )
    }

    // User is authenticated - return the full manifest
    // Read the actual manifest file
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'no-store, no-cache, must-revalidate' // Prevent caching to ensure auth check happens
      }
    })
  } catch (error) {
    console.error('Error serving manifest:', error)
    // Return minimal manifest on error
    return NextResponse.json(
      {
        name: 'GurukulamHub',
        short_name: 'GurukulamHub',
        start_url: '/welcome',
        display: 'browser',
        icons: []
      },
      {
        headers: {
          'Content-Type': 'application/manifest+json'
        }
      }
    )
  }
}
