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

// Files to clean
const filesToClean = ['sw.js', 'workbox-1e54d6fe.js']

// Map files to delete
const mapFilesToDelete = ['sw.js.map', 'workbox-1e54d6fe.js.map']

console.log('🧹 Cleaning source maps for production...\n')

// Remove source map references from JS files
filesToClean.forEach(file => {
  const filePath = path.join(publicDir, file)
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8')
    const originalContent = content

    // Remove the sourceMappingURL line (various formats)
    content = content.replace(/\/\/#\s*sourceMappingURL=.*$/gm, '')
    content = content.replace(/\/\/\s*\/\/#\s*sourceMappingURL=.*$/gm, '')

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ Removed source map reference from ${file}`)
    } else {
      console.log(`ℹ️  No source map reference found in ${file}`)
    }
  } else {
    console.log(`⚠️  ${file} not found, skipping...`)
  }
})

// Delete .map files
mapFilesToDelete.forEach(file => {
  const filePath = path.join(publicDir, file)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`✅ Deleted ${file}`)
  } else {
    console.log(`ℹ️  ${file} not found (already removed or not generated)`)
  }
})

console.log('\n✅ Source map cleanup completed for production!')
console.log('📦 Service worker will not be triggered by source map changes.')
