/**
 * Seed Script for SUPER_ADMIN
 * 
 * This script initializes:
 * 1. Initial features with their specific permissions (as per your database structure)
 * 2. SUPER_ADMIN role with all features and ALL permissions
 * 3. SUPER_ADMIN user with the specified email
 * 
 * IMPORTANT BEHAVIOR:
 * - Idempotent: Safe to run multiple times
 * - Preserves modifications: If features already exist, their current permissions are preserved
 * - Only creates missing: New features are created only if they don't exist
 * - SUPER_ADMIN can modify: After initialization, SUPER_ADMIN can add/delete/update features freely
 * 
 * Run this script ONCE when deploying for the first time.
 * 
 * Usage:
 * - Set SUPER_ADMIN_EMAIL in .env.local
 * - Run: node src/scripts/seedSuperAdmin.js
 * - Or import and call initializeSuperAdmin() from your app startup
 */

// Use relative paths for standalone Node.js execution
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Create require function for CommonJS modules and models
const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables first
import { config } from 'dotenv'
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') }) // Fallback to .env

// Use the existing dbConnect-mongo.js from game-runner-service
const connectMongo = require('../app/services/game-runner-service/db-connect/dbConnect-mongo.js')

// Import models using require to avoid ES module extension issues
// These models have imports without .js extensions which work in Next.js but not in standalone Node
const Feature = require('../app/api/feature/feature.model.js').default
const Role = require('../app/api/role/role.model.js').default
const User = require('../app/models/user.model.js').default
const UserProfile = require('../app/api/profile/profile.model.js').default

// Import configs (these should work with ES modules)
import { FEATURES_LOOKUP } from '../configs/features-lookup.js'
import { PERMISSIONS_LOOKUP } from '../configs/permissions-lookup.js'
import { ROLES_LOOKUP } from '../configs/roles-lookup.js'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'

// Import memberId generation function
// Note: We'll implement a simple version here to avoid circular dependencies
async function generateUniqueMemberId() {
  const generateMemberId = async () => {
    const currentDate = new Date()
    const yy = String(currentDate.getFullYear()).slice(-2)
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dd = String(currentDate.getDate()).padStart(2, '0')
    const datePrefix = `${yy}${mm}${dd}`
    const count = await User.countDocuments({ memberId: { $regex: `^${datePrefix}` } })
    const sequence = String(count + 1).padStart(4, '0')
    return `${datePrefix}${sequence}`
  }

  let memberId
  let isUnique = false
  while (!isUnique) {
    memberId = await generateMemberId()
    const existingUser = await User.findOne({ memberId })
    if (!existingUser) {
      isUnique = true
    }
  }
  return memberId
}

// Get SUPER_ADMIN email from environment variable
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL

// Only exit if we're actually running the script (not during build)
// During build time, this will be undefined but that's OK - it will be set at runtime
if (!SUPER_ADMIN_EMAIL) {
  // During Next.js build, don't exit - just warn
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-development-build') {
    console.warn('⚠️  SUPER_ADMIN_EMAIL not set during build - this is OK, set it at runtime')
  } else {
    console.error('❌ ERROR: SUPER_ADMIN_EMAIL environment variable is not set!')
    console.error('Please set SUPER_ADMIN_EMAIL in your .env.local file')
    // Only exit if not in build phase
    if (!process.env.NEXT_PHASE) {
      process.exit(1)
    }
  }
}

/**
 * Generate a secure random password
 */
function generateSecurePassword() {
  const length = 16
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const allChars = upper + lower + digits + specials

  let password = ''
  // Ensure at least one of each type
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += specials[Math.floor(Math.random() * specials.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Define initial features with their specific permissions
 * These match the existing features in the database exactly as they are
 * SUPER_ADMIN can modify these after deployment
 */
const INITIAL_FEATURES = {
  // Features from your database
  HOME: ['VIEW'],
  PUBLIC_QUIZZES: ['VIEW', 'PLAY', 'CLONE'],
  PUBLIC_GAMES: ['VIEW', 'PLAY', 'CLONE'],
  MY_QUIZZES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH'],
  MY_GAMES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'RUN'],
  MY_PROFILE: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  REFER_EARN: ['VIEW', 'REFER'],
  MANAGE_ADVT: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  MANAGE_QUIZZES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'],
  MANAGE_GAMES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'RUN'],
  MANAGE_USERS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  ROLES_PERMISSIONS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  FAQ: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  DONATION: ['VIEW'],
  CONTEXT: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  VIDEOS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  ALERTS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  MY_LEARNING: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  SPONSORSHIPS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  MANAGE_SPONSORSHIPS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  ADMIN_GAMES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'RUN'],
  USERS_GROUP: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  FEATURE: ['VIEW'], // This feature exists in DB but not in FEATURES_LOOKUP
  USERS_AUDIENCE: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  MY_GROUPS: ['VIEW', 'PLAY', 'CLONE'],
  ACCOUNT_TYPE: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  PUBLIC_GROUPS: ['VIEW', 'PLAY', 'CLONE'], // Similar to MY_GROUPS
  // Additional features from FEATURES_LOOKUP that might not be in database yet
  // These will be created only if they don't exist
  // MY_UTILITIES: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  // MY_PROGRESS: ['VIEW'],
  // REVIEW_QUIZZES: ['VIEW', 'APPROVE', 'REJECT'],
  // REVIEW_GAMES: ['VIEW', 'APPROVE', 'REJECT'],
  // MANAGE_EVENTS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'],
  // RAISE_SUPPORT: ['VIEW', 'CREATE'],
  // USER_ALERTS: ['VIEW', 'CREATE', 'UPDATE', 'DELETE']
}

/**
 * Initialize all features with their specific permissions
 * Only creates features that don't exist - preserves any modifications made by SUPER_ADMIN
 */
async function initializeFeatures() {
  console.log('📋 Initializing features...')
  const createdFeatures = []
  const existingFeatures = []
  const skippedFeatures = []

  for (const [featureName, permissions] of Object.entries(INITIAL_FEATURES)) {
    try {
      // Check if feature already exists
      const existingFeature = await Feature.findOne({ name: featureName })
      
      if (existingFeature) {
        console.log(`  ✓ Feature "${featureName}" already exists (preserving current permissions)`)
        existingFeatures.push(existingFeature)
        // Don't modify existing features - SUPER_ADMIN may have customized them
      } else {
        // Create new feature with initial permissions
        const newFeature = new Feature({
          name: featureName,
          permissions: permissions,
          createdBy: SUPER_ADMIN_EMAIL,
          isActive: true
        })
        await newFeature.save()
        createdFeatures.push(newFeature)
        console.log(`  ✓ Created feature "${featureName}" with permissions: ${permissions.join(', ')}`)
      }
    } catch (error) {
      console.error(`  ✗ Error processing feature "${featureName}":`, error.message)
      skippedFeatures.push(featureName)
    }
  }

  console.log(`✅ Features initialized: ${createdFeatures.length} created, ${existingFeatures.length} already existed`)
  if (skippedFeatures.length > 0) {
    console.log(`⚠️  Skipped features: ${skippedFeatures.join(', ')}`)
  }
  console.log()
  
  // Return all features (both newly created and existing)
  const allFeatureNames = Object.keys(INITIAL_FEATURES)
  return await Feature.find({ name: { $in: allFeatureNames } })
}

/**
 * Initialize SUPER_ADMIN role with all features and all permissions
 * For SUPER_ADMIN, we grant ALL permissions from PERMISSIONS_LOOKUP for each feature
 */
async function initializeSuperAdminRole(allFeatures) {
  console.log('👤 Initializing SUPER_ADMIN role...')
  
  try {
    // Check if SUPER_ADMIN role already exists
    const existingRole = await Role.findOne({ name: ROLES_LOOKUP.SUPER_ADMIN })
    
    // Get all available permissions for SUPER_ADMIN
    const allPermissions = Object.values(PERMISSIONS_LOOKUP)
    
    if (existingRole) {
      console.log('  ✓ SUPER_ADMIN role already exists')
      
      // Update role with all features and ALL permissions for SUPER_ADMIN
      // SUPER_ADMIN gets all permissions regardless of feature's default permissions
      const featuresWithAllPermissions = allFeatures.map(feature => ({
        _id: feature._id,
        name: feature.name,
        permissions: allPermissions // SUPER_ADMIN gets ALL permissions for every feature
      }))
      
      existingRole.features = featuresWithAllPermissions
      existingRole.isActive = true
      await existingRole.save()
      console.log(`  ↻ Updated SUPER_ADMIN role with ${allFeatures.length} features and all permissions`)
      return existingRole
    } else {
      // Create SUPER_ADMIN role with all features and ALL permissions
      // SUPER_ADMIN gets all permissions regardless of feature's default permissions
      const featuresWithAllPermissions = allFeatures.map(feature => ({
        _id: feature._id,
        name: feature.name,
        permissions: allPermissions // SUPER_ADMIN gets ALL permissions for every feature
      }))
      
      const newRole = new Role({
        name: ROLES_LOOKUP.SUPER_ADMIN,
        features: featuresWithAllPermissions,
        createdBy: SUPER_ADMIN_EMAIL,
        isActive: true
      })
      
      await newRole.save()
      console.log(`  ✓ Created SUPER_ADMIN role with ${allFeatures.length} features and all permissions`)
      return newRole
    }
  } catch (error) {
    console.error('  ✗ Error initializing SUPER_ADMIN role:', error.message)
    throw error
  }
}

/**
 * Initialize SUPER_ADMIN user
 * Ensures only ONE user with SUPER_ADMIN role exists (the one with SUPER_ADMIN_EMAIL)
 */
async function initializeSuperAdminUser() {
  console.log('👤 Initializing SUPER_ADMIN user...')
  
  try {
    // CRITICAL: Ensure only ONE SUPER_ADMIN user exists
    // Find all users with SUPER_ADMIN role
    const allSuperAdminUsers = await User.find({ roles: ROLES_LOOKUP.SUPER_ADMIN })
    
    if (allSuperAdminUsers.length > 1) {
      console.log(`  ⚠️  WARNING: Found ${allSuperAdminUsers.length} users with SUPER_ADMIN role`)
      console.log(`  🔧 Removing SUPER_ADMIN role from users that are not "${SUPER_ADMIN_EMAIL}"`)
      
      // Remove SUPER_ADMIN role from all users except the one with SUPER_ADMIN_EMAIL
      for (const user of allSuperAdminUsers) {
        if (user.email !== SUPER_ADMIN_EMAIL) {
          user.roles = user.roles.filter(role => role !== ROLES_LOOKUP.SUPER_ADMIN)
          // If user has no roles left, add USER role
          if (user.roles.length === 0) {
            user.roles = [ROLES_LOOKUP.USER]
          }
          await user.save()
          console.log(`  ✓ Removed SUPER_ADMIN role from user: ${user.email}`)
        }
      }
    }
    
    // Check if SUPER_ADMIN user with the specified email already exists
    const existingUser = await User.findOne({ email: SUPER_ADMIN_EMAIL })
    
    if (existingUser) {
      console.log(`  ✓ SUPER_ADMIN user with email "${SUPER_ADMIN_EMAIL}" already exists`)
      
      // Update user to ensure they have SUPER_ADMIN role
      if (!existingUser.roles.includes(ROLES_LOOKUP.SUPER_ADMIN)) {
        existingUser.roles = [...new Set([...existingUser.roles, ROLES_LOOKUP.SUPER_ADMIN])]
        existingUser.isAdmin = true
        existingUser.isVerified = true
        existingUser.isActive = true
        await existingUser.save()
        console.log('  ↻ Updated user with SUPER_ADMIN role')
      }
      
      // Ensure this is the ONLY user with SUPER_ADMIN role
      const otherSuperAdmins = await User.find({ 
        roles: ROLES_LOOKUP.SUPER_ADMIN,
        email: { $ne: SUPER_ADMIN_EMAIL }
      })
      
      if (otherSuperAdmins.length > 0) {
        console.log(`  🔧 Removing SUPER_ADMIN role from ${otherSuperAdmins.length} other user(s)`)
        for (const user of otherSuperAdmins) {
          user.roles = user.roles.filter(role => role !== ROLES_LOOKUP.SUPER_ADMIN)
          if (user.roles.length === 0) {
            user.roles = [ROLES_LOOKUP.USER]
          }
          await user.save()
        }
      }
      
      return existingUser
    } else {
      // Generate secure password
      const password = generateSecurePassword()
      const salt = await bcryptjs.genSalt(12)
      const hashedPassword = await bcryptjs.hash(password, salt)
      
      // Generate referral token and member ID
      const referralToken = crypto.randomBytes(20).toString('hex')
      const memberId = await generateUniqueMemberId()
      
      // Create user profile first
      const userProfile = new UserProfile({
        email: SUPER_ADMIN_EMAIL,
        firstname: 'Super',
        lastname: 'Admin',
        country: 'India',
        countryCode: 'IN'
      })
      await userProfile.save()
      console.log('  ✓ Created user profile')
      
      // Create SUPER_ADMIN user
      const newUser = new User({
        email: SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        roles: [ROLES_LOOKUP.SUPER_ADMIN],
        profile: userProfile._id,
        isAdmin: true,
        isVerified: true,
        isActive: true,
        currentStatus: 'VERIFIED',
        socialLogin: 'credentials',
        referralToken,
        memberId,
        referredBy: 'system@gurukulamhub.com'
      })
      
      await newUser.save()
      console.log('  ✓ Created SUPER_ADMIN user')
      console.log(`\n🔐 SUPER_ADMIN Credentials:`)
      console.log(`   Email: ${SUPER_ADMIN_EMAIL}`)
      console.log(`   Password: ${password}`)
      console.log(`   ⚠️  IMPORTANT: Save this password securely! It won't be shown again.\n`)
      
      return newUser
    }
  } catch (error) {
    console.error('  ✗ Error initializing SUPER_ADMIN user:', error.message)
    throw error
  }
}

// Global flag to prevent multiple simultaneous initializations
let initializationInProgress = false
let initializationPromise = null

// Track if initialization has been completed to avoid re-running unnecessarily
let initializationCompleted = false

/**
 * Quick check if SUPER_ADMIN already exists and is properly configured
 */
async function isSuperAdminAlreadyInitialized() {
  try {
    await connectMongo()
    
    // Check if SUPER_ADMIN user exists with the correct email
    const superAdminUser = await User.findOne({ 
      email: SUPER_ADMIN_EMAIL,
      roles: ROLES_LOOKUP.SUPER_ADMIN 
    })
    
    // Check if SUPER_ADMIN role exists
    const superAdminRole = await Role.findOne({ name: ROLES_LOOKUP.SUPER_ADMIN })
    
    // If both exist and user has the role, we're good
    if (superAdminUser && superAdminRole) {
      // Double-check that no other users have SUPER_ADMIN role
      const otherSuperAdmins = await User.countDocuments({ 
        roles: ROLES_LOOKUP.SUPER_ADMIN,
        email: { $ne: SUPER_ADMIN_EMAIL }
      })
      
      // If everything is correct, skip initialization
      if (otherSuperAdmins === 0) {
        return true
      }
    }
    
    return false
  } catch (error) {
    // If check fails, proceed with initialization
    console.warn('⚠️  Could not check if SUPER_ADMIN is initialized, proceeding with initialization:', error.message)
    return false
  }
}

/**
 * Main initialization function
 * Idempotent - safe to call multiple times
 * Ensures only ONE SUPER_ADMIN user exists
 * Skips initialization if already properly set up
 */
export async function initializeSuperAdmin() {
  // If initialization is already in progress, return the existing promise
  if (initializationInProgress && initializationPromise) {
    console.log('⏳ SUPER_ADMIN initialization already in progress, waiting...')
    return initializationPromise
  }

  // If initialization has already completed, skip
  if (initializationCompleted) {
    console.log('✓ SUPER_ADMIN already initialized, skipping...')
    return { status: 'success', message: 'SUPER_ADMIN already initialized' }
  }

  // Check if SUPER_ADMIN_EMAIL is set
  if (!SUPER_ADMIN_EMAIL) {
    const errorMsg = 'SUPER_ADMIN_EMAIL environment variable is not set'
    console.error(`❌ ${errorMsg}`)
    return { status: 'error', message: errorMsg }
  }

  // Quick check: If SUPER_ADMIN is already properly initialized, skip
  const alreadyInitialized = await isSuperAdminAlreadyInitialized()
  if (alreadyInitialized) {
    console.log('✓ SUPER_ADMIN is already properly initialized, skipping...')
    initializationCompleted = true
    return { status: 'success', message: 'SUPER_ADMIN already initialized' }
  }

  initializationInProgress = true
  initializationPromise = (async () => {
    try {
      console.log('🚀 Starting SUPER_ADMIN initialization...\n')
      
      // Connect to MongoDB
      await connectMongo()
      console.log('✓ Connected to MongoDB\n')
      
      // Step 1: Initialize all features
      const allFeatures = await initializeFeatures()
      
      // Step 2: Initialize SUPER_ADMIN role
      await initializeSuperAdminRole(allFeatures)
      console.log('✅ SUPER_ADMIN role initialized\n')
      
      // Step 3: Initialize SUPER_ADMIN user (ensures only one exists)
      await initializeSuperAdminUser()
      console.log('✅ SUPER_ADMIN user initialized\n')
      
      console.log('🎉 SUPER_ADMIN initialization completed successfully!')
      console.log('   The SUPER_ADMIN role and user are now ready to use.\n')
      
      initializationCompleted = true
      return { status: 'success', message: 'SUPER_ADMIN initialized successfully' }
    } catch (error) {
      console.error('\n❌ Error during SUPER_ADMIN initialization:', error)
      throw error
    } finally {
      initializationInProgress = false
      initializationPromise = null
    }
  })()

  return initializationPromise
}

// If running directly (not imported), execute the initialization
// Check if this file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && process.argv[1].endsWith('seedSuperAdmin.js')

if (isMainModule) {
  initializeSuperAdmin()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}
