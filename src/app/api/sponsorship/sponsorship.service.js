import Quizzes from '../../api/quiz/quiz.model'

import connectMongo from '@/utils/dbConnect-mongo'
import Sponsorship from './sponsorship.model'

export async function getOne({ queryParams }) {
  console.log({ queryParams })
  try {
    await connectMongo()

    const sponsorship = await Sponsorship.findOne({ ...queryParams }).populate('quizzes', 'title _id') // Only populate 'title' and '_id'

    console.log(sponsorship)

    return { status: 'success', message: 'Fetched Sponsorship successfully', result: sponsorship }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}

export async function getAll({ queryParams }) {
  try {
    await connectMongo()

    console.log({ queryParams })

    // Extract parameters from queryParams
    const { quizId, country, region, city, status, ...otherParams } = queryParams

    // Build the base query
    const query = { ...otherParams }

    // Handle quizId filter
    if (quizId) {
      query.quizzes = quizId
    }

    // Handle status filter if provided
    if (status) {
      query.$or = [
        { 
          rewardType: 'cash', 
          sponsorshipStatus: status,
          nonCashSponsorshipStatus: { $exists: false } // Ensure this field doesn't exist
        },
        { 
          rewardType: 'physicalGift', 
          nonCashSponsorshipStatus: status,
          sponsorshipStatus: { $exists: false } // Ensure this field doesn't exist
        }
      ]
    } else {
      // When no status filter is applied, ensure we get all sponsorships
      query.$or = [
        { rewardType: 'cash', sponsorshipStatus: { $exists: true } },
        { rewardType: 'physicalGift', nonCashSponsorshipStatus: { $exists: true } }
      ]
    }

    // By Quiz ID
    let sponsorships = await Sponsorship.find(query).populate('quizzes', 'title _id')

    if (sponsorships?.length > 0 && (country || region || city)) {
      console.log('Sponsorships found by quizId')
      sponsorships = sponsorships.filter(sponsorship => {
        // Sponsorships to be accepted for a quiz in any location (if location not specified)
        if (!sponsorship.location) return true

        // Check country match if provided
        if (country && sponsorship.location?.country !== country) return false

        // Check region match if provided (only if country matches or wasn't specified)
        if (region && sponsorship.location?.region && sponsorship.location?.region !== region) return false

        // Check city match if provided (only if region matches or wasn't specified)
        if (city && sponsorship.location?.city && sponsorship.location?.city !== city) return false

        return true
      })
    } else {
      // Add location filters if they exist in query params
      if (country || region || city) {
        console.log('Sponsorships not found')
        let locationQuery = {}

        if (country) locationQuery['location.country'] = country
        if (region) locationQuery['location.region'] = region
        if (city) locationQuery['location.city'] = city

        console.log({ locationQuery })

        sponsorships = await Sponsorship.find({ ...query, ...locationQuery })
      }
    }

    console.log(`sponsorships count`, sponsorships.length)

    return { status: 'success', message: 'Fetched Sponsorships successfully', result: sponsorships }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}

export async function addOne({ data }) {
  try {
    await connectMongo()

    const sponsorship = new Sponsorship({ ...data, sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) })
    await sponsorship.save()

    console.log(sponsorship)

    return { status: 'success', message: 'Sponsorship created successfully', result: sponsorship }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}
