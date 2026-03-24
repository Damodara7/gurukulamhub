import { z } from 'zod'
import connectMongo from '@/utils/dbConnect-mongo'
import User from '@/app/models/user.model'
import Profile from '@/app/api/profile/profile.model'
import Player from '@/app/api/player/player.model'
import Role from '@/app/api/role/role.model'
import Feature from '@/app/api/feature/feature.model'
import GeoRole from '@/app/api/geo-role/geo-role.model'
import GeoFeature from '@/app/api/geo-feature/geo-feature.model'
import AccountType from '@/app/api/account-type/account-type.model'

async function fetchUsers({ limit = 25, role, isActive } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const query = {}
  if (role) query.roles = role
  if (typeof isActive === 'boolean') query.isActive = isActive
  const rows = await User.find(query)
    .select('email roles geoRoles isActive isVerified isAdmin createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchUsersByRoles({ roles = [], limit = 50, isActive } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500)
  const normalizedRoles = (Array.isArray(roles) ? roles : [])
    .map(r => String(r || '').trim())
    .filter(Boolean)
  const query = {}
  if (normalizedRoles.length > 0) query.roles = { $in: normalizedRoles }
  if (typeof isActive === 'boolean') query.isActive = isActive

  const rows = await User.find(query)
    .select('email roles geoRoles isActive isVerified isAdmin createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, requestedRoles: normalizedRoles, items: rows }
}

async function fetchUserByEmail({ email }) {
  await connectMongo()
  const row = await User.findOne({ email: String(email || '').trim().toLowerCase() })
    .select('email roles geoRoles isActive isVerified isAdmin profile createdAt')
    .lean()
  return row ? { found: true, item: row } : { found: false, item: null }
}

async function fetchProfileByEmail({ email }) {
  await connectMongo()
  const row = await Profile.findOne({ email: String(email || '').trim().toLowerCase() })
    .select('email firstname lastname accountType country region city roles createdAt')
    .lean()
  return row ? { found: true, item: row } : { found: false, item: null }
}

async function fetchPlayersByGame({ gameId, limit = 50 }) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500)
  const rows = await Player.find({ game: gameId })
    .select('email score fffPoints status completed joinedAt finishedAt createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchRoles({ includeDeleted = false, limit = 100 } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500)
  const query = includeDeleted ? {} : { isDeleted: false }
  const rows = await Role.find(query)
    .select('name features isActive isDeleted createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchFeatures({ includeDeleted = false, limit = 100 } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500)
  const query = includeDeleted ? {} : { isDeleted: false }
  const rows = await Feature.find(query)
    .select('name permissions isActive isDeleted createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchPermissionsCatalog() {
  await connectMongo()
  const rows = await Feature.find({ isDeleted: false }).select('name permissions').lean()
  const permissions = [...new Set(rows.flatMap(row => row.permissions || []))].sort()
  return {
    featureCount: rows.length,
    permissionCount: permissions.length,
    permissions,
    byFeature: rows.map(row => ({ feature: row.name, permissions: row.permissions || [] }))
  }
}

async function fetchGeoRoles({ country, limit = 100 } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500)
  const query = { isDeleted: false }
  if (country) query.country = country
  const rows = await GeoRole.find(query)
    .select('name country region city features isActive createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchGeoFeatures({ includeDeleted = false, limit = 100 } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500)
  const query = includeDeleted ? {} : { isDeleted: false }
  const rows = await GeoFeature.find(query)
    .select('name permissions isActive isDeleted createdAt')
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchAccountTypes({ isActive } = {}) {
  await connectMongo()
  const query = {}
  if (typeof isActive === 'boolean') query.isActive = isActive
  const rows = await AccountType.find(query).select('name isActive createdBy creatorEmail createdAt').lean()
  return { count: rows.length, items: rows }
}

export const userAccessTools = [
  {
    name: 'getUsers',
    description: 'Get users with optional role/active filters.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      role: z.string().optional(),
      isActive: z.boolean().optional()
    }),
    handler: fetchUsers
  },
  {
    name: 'getUserByEmail',
    description: 'Get single user by email.',
    schema: z.object({ email: z.string().min(3) }),
    handler: fetchUserByEmail
  },
  {
    name: 'getUsersByRoles',
    description: 'Get users having any of the provided roles.',
    schema: z.object({
      roles: z.array(z.string().min(1)).min(1),
      limit: z.number().int().min(1).max(500).optional(),
      isActive: z.boolean().optional()
    }),
    handler: fetchUsersByRoles
  },
  {
    name: 'getProfileByEmail',
    description: 'Get profile by email.',
    schema: z.object({ email: z.string().min(3) }),
    handler: fetchProfileByEmail
  },
  {
    name: 'getPlayersByGame',
    description: 'Get players/participants for a game.',
    schema: z.object({
      gameId: z.string().min(1),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchPlayersByGame
  },
  {
    name: 'getRoles',
    description: 'Get roles and assigned feature bundles.',
    schema: z.object({
      includeDeleted: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchRoles
  },
  {
    name: 'getFeatures',
    description: 'Get features and permissions.',
    schema: z.object({
      includeDeleted: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchFeatures
  },
  {
    name: 'getPermissionsCatalog',
    description: 'Get flattened unique permissions from features.',
    schema: z.object({}),
    handler: fetchPermissionsCatalog
  },
  {
    name: 'getGeoRoles',
    description: 'Get geo roles by country/region.',
    schema: z.object({
      country: z.string().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchGeoRoles
  },
  {
    name: 'getGeoFeatures',
    description: 'Get geo features and permissions.',
    schema: z.object({
      includeDeleted: z.boolean().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchGeoFeatures
  },
  {
    name: 'getAccountTypes',
    description: 'Get account types.',
    schema: z.object({
      isActive: z.boolean().optional()
    }),
    handler: fetchAccountTypes
  }
]

