import { z } from 'zod'
import connectMongo from '@/utils/dbConnect-mongo'
import Sponsorship from '@/app/api/sponsorship/sponsorship.model'
import SponsorshipPayment from '@/app/api/sponsorship-payment/sponsorship-payment.model'

async function fetchSponsorships({ limit = 25, sponsorType, sponsorshipStatus, rewardType } = {}) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200)
  const query = {}
  if (sponsorType) query.sponsorType = sponsorType
  if (sponsorshipStatus) query.sponsorshipStatus = sponsorshipStatus
  if (rewardType) query.rewardType = rewardType

  const rows = await Sponsorship.find(query)
    .select(
      'sponsorType sponsorerType gameId quizzes email fullname orgName sponsorshipAmount availableAmount currency rewardType sponsorshipStatus createdAt'
    )
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

async function fetchSponsorshipById({ id }) {
  await connectMongo()
  const row = await Sponsorship.findById(String(id || '').trim()).lean()
  return row ? { found: true, item: row } : { found: false, item: null }
}

async function fetchSponsorshipPayments({ sponsorshipId, limit = 50 }) {
  await connectMongo()
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500)
  const query = {}
  if (sponsorshipId) query.sponsorshipId = sponsorshipId

  const rows = await SponsorshipPayment.find(query)
    .select('paymentId sponsorshipId amount')
    .sort({ _id: -1 })
    .limit(safeLimit)
    .lean()
  return { count: rows.length, items: rows }
}

export const sponsorshipTools = [
  {
    name: 'getSponsorships',
    description: 'Get sponsorship records with filters.',
    schema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
      sponsorType: z.enum(['game', 'quiz', 'area']).optional(),
      sponsorshipStatus: z.string().optional(),
      rewardType: z.enum(['cash', 'physicalGift']).optional()
    }),
    handler: fetchSponsorships
  },
  {
    name: 'getSponsorshipById',
    description: 'Get sponsorship by Mongo id.',
    schema: z.object({ id: z.string().min(1) }),
    handler: fetchSponsorshipById
  },
  {
    name: 'getSponsorshipPayments',
    description: 'Get sponsorship payment records.',
    schema: z.object({
      sponsorshipId: z.string().optional(),
      limit: z.number().int().min(1).max(500).optional()
    }),
    handler: fetchSponsorshipPayments
  }
]

