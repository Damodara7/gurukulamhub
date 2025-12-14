const fs = require('fs')
const path = require('path')

/**
 * Post-build script to remove source map references for production
 * This prevents sw.js.map from triggering unnecessary service worker updates
 *
 * This script:
 * 1. Removes the sourceMappingURL comment from sw.js
 * 2. Deletes sw.js.map file if it exists
 * 3. Also removes workbox source maps
 */

const publicDir = path.join(__dirname, '../public')

console.log('🧹 Cleaning source maps for production...\n')

// Check if public directory exists
if (!fs.existsSync(publicDir)) {
  console.log('⚠️  Public directory not found, skipping cleanup.')
  process.exit(0)
}

// Dynamically find all JS files that might have source maps
const jsFiles = fs.readdirSync(publicDir).filter(file => {
  return file.endsWith('.js') && (file === 'sw.js' || file.startsWith('workbox-') || file.startsWith('fallback-'))
})

// Remove source map references from JS files
jsFiles.forEach(file => {
  const filePath = path.join(publicDir, file)
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content

    // Remove the sourceMappingURL line (various formats)
    content = content.replace(/\/\/#\s*sourceMappingURL=.*$/gm, '')
    content = content.replace(/\/\/\s*\/\/#\s*sourceMappingURL=.*$/gm, '')

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Removed source map reference from ${file}`)
    }
  } catch (error) {
    console.log(`⚠️  Error processing ${file}:`, error.message)
  }
})

// Dynamically find and delete ALL .map files in public directory
const mapFiles = fs.readdirSync(publicDir).filter(file => file.endsWith('.map'))

if (mapFiles.length > 0) {
  mapFiles.forEach(file => {
    const filePath = path.join(publicDir, file)
    try {
      fs.unlinkSync(filePath)
      console.log(`✅ Deleted ${file}`)
    } catch (error) {
      console.log(`⚠️  Error deleting ${file}:`, error.message)
    }
  })
} else {
  console.log('ℹ️  No .map files found (already removed or not generated)')
}

console.log('\n✅ Source map cleanup completed for production!')
console.log('📦 Service worker will not be triggered by source map changes.')
