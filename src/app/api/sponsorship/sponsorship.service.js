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
    const { quizId, country, region, city, status, email, sponsorType, filter, ...otherParams } = queryParams

    // Build the base query
    const query = { ...otherParams }

    // Handle awaiting admin action filter
    if (filter === 'awaiting') {
      query.rewardType = 'physicalGift'
      query.nonCashSponsorshipStatus = 'pending'
      // Remove filter from query to avoid conflicts
      delete query.filter
    } else if (filter === 'rejected') {
      // Handle rejected physical gift sponsorships filter
      query.rewardType = 'physicalGift'
      query.nonCashSponsorshipStatus = 'rejected'
      // Remove filter from query to avoid conflicts
      delete query.filter
    }

    // Handle quizId filter (but not for awaiting or rejected filters)
    if (quizId && filter !== 'awaiting' && filter !== 'rejected') {
      query.$or = [
        { quizzes: quizId }, // Sponsorships that include this specific quiz
        { quizzes: { $size: 0 } } // Sponsorships that apply to any quiz (empty array)
      ]
    }
    
    if (email && filter !== 'awaiting' && filter !== 'rejected') {
      query.accountHolderEmail = email
    }

    // Handle status filter if provided (but not for awaiting or rejected filters)
    if (status && filter !== 'awaiting' && filter !== 'rejected') {
      // Parse comma-separated status values
      const statusArray = status.split(',')
      
      if (statusArray.includes('pending_physical_only') && statusArray.includes('rejected_physical_only')) {
        // Special case: completed for both types + pending for physical gifts + rejected for physical gifts
        query.$or = [
          {
            rewardType: 'cash',
            sponsorshipStatus: 'completed',
            nonCashSponsorshipStatus: { $exists: false }
          },
          {
            rewardType: 'physicalGift',
            $or: [
              { nonCashSponsorshipStatus: 'completed' },
              { nonCashSponsorshipStatus: 'pending' },
              { nonCashSponsorshipStatus: 'rejected' }
            ],
            sponsorshipStatus: { $exists: false }
          }
        ]
      } else if (statusArray.includes('pending_physical_only')) {
        // Special case: completed for both types + pending for physical gifts only
        query.$or = [
          {
            rewardType: 'cash',
            sponsorshipStatus: 'completed',
            nonCashSponsorshipStatus: { $exists: false }
          },
          {
            rewardType: 'physicalGift',
            $or: [
              { nonCashSponsorshipStatus: 'completed' },
              { nonCashSponsorshipStatus: 'pending' }
            ],
            sponsorshipStatus: { $exists: false }
          }
        ]
      } else if (statusArray.includes('rejected_physical_only')) {
        // Special case: completed for both types + pending for physical gifts + rejected for physical gifts only
        query.$or = [
          {
            rewardType: 'cash',
            sponsorshipStatus: 'completed',
            nonCashSponsorshipStatus: { $exists: false }
          },
          {
            rewardType: 'physicalGift',
            $or: [
              { nonCashSponsorshipStatus: 'completed' },
              { nonCashSponsorshipStatus: 'pending' },
              { nonCashSponsorshipStatus: 'rejected' }
            ],
            sponsorshipStatus: { $exists: false }
          }
        ]
      } else {
        // Regular status filtering
        query.$or = [
          {
            rewardType: 'cash',
            sponsorshipStatus: { $in: statusArray },
            nonCashSponsorshipStatus: { $exists: false } // Ensure this field doesn't exist
          },
          {
            rewardType: 'physicalGift',
            nonCashSponsorshipStatus: { $in: statusArray },
            sponsorshipStatus: { $exists: false } // Ensure this field doesn't exist
          }
        ]
      }
    } else if (!status && filter !== 'awaiting' && filter !== 'rejected') {
      // When no status filter is applied, ensure we get all sponsorships
      query.$or = [
        { rewardType: 'cash', sponsorshipStatus: { $exists: true } },
        { rewardType: 'physicalGift', nonCashSponsorshipStatus: { $exists: true } }
      ]
    }

    console.log({ query })

    // By Quiz ID
    let sponsorships = await Sponsorship.find(query)
      .populate('quizzes', 'title _id')
      .populate({
        path: 'sponsored.game',
        select: 'title _id quiz',
        populate: {
          path: 'quiz',
          select: 'title description' // Specify the fields you want from the quiz model
        }
      })
      // .populate({
      //   path: 'user', 
      //   populate: {
      //     path: 'profile'
      //   }
      // })
      .sort({ createdAt: -1 })

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

        // For awaiting filter, we need to ensure we don't override the rewardType and status
        if (filter === 'awaiting') {
          locationQuery.rewardType = 'physicalGift'
          locationQuery.nonCashSponsorshipStatus = 'pending'
        } else if (filter === 'rejected') {
          locationQuery.rewardType = 'physicalGift'
          locationQuery.nonCashSponsorshipStatus = 'rejected'
        }

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

    // Set initial status based on reward type
    const initialData = { ...data, sponsorshipExpiresAt: new Date(Date.now() + 2 * 60 * 1000) }
    
    if (data.rewardType === 'physicalGift') {
      initialData.nonCashSponsorshipStatus = 'pending'
    } else if (data.rewardType === 'cash') {
      initialData.sponsorshipStatus = 'created'
    }
    
    const sponsorship = new Sponsorship(initialData)
    await sponsorship.save()

    console.log(sponsorship)

    return { status: 'success', message: 'Sponsorship created successfully', result: sponsorship }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}

export async function updateOne({ data }) {
  try {
    await connectMongo()

    const { id, ...updateData } = data

    const sponsorship = await Sponsorship.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('quizzes', 'title _id')

    if (!sponsorship) {
      return { status: 'error', message: 'Sponsorship not found', result: null }
    }

    return { status: 'success', message: 'Sponsorship updated successfully', result: sponsorship }
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }
}
