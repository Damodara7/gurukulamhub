import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from './profile.model'
import User from '../../models/user.model'

export async function getAll() {
  await connectMongo()
  try {
    let profiles = await UserProfile.find({}).select('-password').lean().sort({ createdAt: -1 })
    return { status: 'success', result: profiles, message: 'User profiles fetched successfully' }
  } catch (error) {
    console.error('getAll function -> Error fetching user profiles: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getByEmail({ email }) {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ email }).select('-password').lean()

    // If profile doesn't exist, create a new one for the user
    if (!profile) {
      console.log('User profile not found, creating new profile for:', email)

      // Check if user exists in users collection
      let user = await User.findOne({ email }).select('-password').lean()
      if (!user) {
        console.error('User not found in users collection')
        return { status: 'error', result: null, message: 'User not found' }
      }

      // Create new profile with basic data from user
      const newProfileData = {
        email: email,
        age: null,
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        image: user.image || '',
        gender: '',
        referredBy: 'none@gurukulamhub.com',
        phone: '',
        accountType: 'INDIVIDUAL',
        nickname: '',
        roleInOrganization: '',
        address: '',
        country: '',
        countryCode: '',
        countryDialCode: null,
        region: '',
        zipcode: '',
        pincode: '',
        locality: '',
        postoffice: '',
        street: '',
        colony: '',
        village: '',
        timezone: '',
        religion: '',
        caste: '',
        category: '',
        motherTongue: '',
        languages: [],
        knownLanguageIds: [],
        associatedOrganizations: [],
        activeAssociatedOrganizationIds: [],
        currency: '',
        voterId: {
          epicNumber: '',
          frontImage: '',
          backImage: ''
        },
        linkedInUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        openToWork: false,
        hiring: false,
        organization: '',
        organizationRegistrationNumber: '',
        organizationGSTNumber: '',
        organizationPANNumber: '',
        websiteUrl: '',
        coordinates: [],
        schools: [],
        workingPositions: [],
        currentSchoolId: '',
        currentWorkingPositionId: '',
        networkLevel: 0,
        referralPoints: 0
      }

      // Create new profile
      profile = new UserProfile(newProfileData)
      await profile.save()

      // Update the User document with the profile reference
      await User.updateOne({ email: email }, { $set: { profile: profile._id } })

      console.log('New profile created for:', email)
    }

    let user = await User.findOne({ email }).select('-password').lean()
    // console.log('profile: ', profile)
    // console.log('user: ', user)
    return { status: 'success', result: { profile, user }, message: 'User profile successfully retrieved' }
  } catch (error) {
    console.error('getByEmail function -> Error fetching user profile: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getById({ id }) {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ _id: id }).select('-password').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
    return { status: 'success', result: profile, message: 'User profile fetched successfully' }
  } catch (error) {
    console.error('getById function -> Error fetching user profile: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export const add = async ({ data }) => {
  await connectMongo()
  try {
    const { email, ...restData } = data
    let existedUser = await User.findOne({ email: email })
    if (!existedUser) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    let profile = await UserProfile.findOne({ email })

    // Ensure password isn't included in the update
    if (profile) {
      if (restData.password) {
        delete restData.password
      }

      return { status: 'error', result: null, message: 'User profile already exists' }
    } else {
      // Create new profile
      if (restData.password) {
        delete restData.password
      }
      profile = new UserProfile({ email, ...restData })
      await profile.save()
    }

    return { status: 'success', result: profile, message: 'User profile added successfully' }
  } catch (error) {
    console.error('add function -> Error registering user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export const addByAdmin = async ({ data }) => {
  await connectMongo()
  try {
    const { email, ...restData } = data

    let profile

    // Create new profile
    if (restData.password) {
      delete restData.password
    }
    profile = new UserProfile({ email, ...restData })
    await profile.save()

    return { status: 'success', result: profile, message: 'User profile added successfully' }
  } catch (error) {
    console.error('add function -> Error registering user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export const addOrUpdate = async ({ email, data: updateData }) => {
  await connectMongo()
  try {
    let existedUser = await User.findOne({ email: email })
    if (!existedUser) {
      console.error('User not found')
      return { status: 'error', result: null, message: 'User not found' }
    }

    let profile = await UserProfile.findOne({ email })

    // Ensure password isn't included in the update
    if (profile) {
      if (updateData.password) {
        delete updateData.password
      }

      // Update existing profile
      profile = await UserProfile.findOneAndUpdate({ email }, updateData, { new: true })
    } else {
      // Create new profile
      if (updateData.password) {
        delete updateData.password
      }
      profile = new UserProfile({ email, ...updateData })
      await profile.save()
    }

    return { status: 'success', result: profile, message: 'User profile added/updated successfully' }
  } catch (error) {
    console.error('registerOrUpdateUserprofile function -> Error registering user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export const updateReferral = async ({ email, data }) => {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'No user profile exists with this email.' }
    }

    let referrer = await UserProfile.findOne({ email: data.referredBy })
    if (!referrer) {
      return {
        status: 'error',
        result: null,
        message: `No user profile exists with this referrer email: ${data.referredBy}`
      }
    }

    let networkLevel = 0

    // Get referrer's network level
    const referrerNetworkLevel = referrer.networkLevel
    if (referrerNetworkLevel || referrerNetworkLevel === 0) {
      networkLevel = referrerNetworkLevel + 1
    }

    // Update the referred user's profile
    profile = await UserProfile.findOneAndUpdate(
      { email },
      { referredBy: data.referredBy, networkLevel },
      { new: true }
    )

    // Distribute referral points up to 4 levels
    let points = 500
    let currentReferrer = referrer
    let levelCount = 0

    while (currentReferrer && levelCount < 4) {
      // Calculate points for the current referrer (half of the previous level)
      const pointsForReferrer = points / Math.pow(2, levelCount)

      // Update referrer's referral points
      await UserProfile.findOneAndUpdate(
        { email: currentReferrer.email },
        { $inc: { referralPoints: pointsForReferrer } }
      )

      // Move up the referral chain
      currentReferrer = await UserProfile.findOne({ email: currentReferrer.referredBy })
      levelCount++
    }

    return { status: 'success', result: profile, message: 'Updated referrer details' }
  } catch (error) {
    console.error('updateReferrerDetails -> Error updating referrer details: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getNetworkLevel(email) {
  await connectMongo()
  try {
    let userProfile = await UserProfile.findOne({ email })
    if (!userProfile) {
      throw new Error('User not found while getting network level!')
    }
    return userProfile.networkLevel
  } catch (error) {
    console.error('getNetworkLevel function -> Error getting network level: ', error)
    throw new Error(error?.message)
  }
}

export async function setNetworkLevel(email, networkLevel) {
  await connectMongo()
  try {
    let userProfile = await UserProfile.findOneAndUpdate({ email }, { $set: { networkLevel } }, { new: true })
    if (!userProfile) {
      throw new Error('User not found while setting network level!')
    }
    return userProfile
  } catch (error) {
    console.error('setNetworkLevel function -> Error setting network level: ', error)
    throw new Error(error?.message)
  }
}

export const updateUserProfile = async (email, updateData) => {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      throw new Error('User not found!')
    }

    // Update existing profile
    profile = await UserProfile.findOneAndUpdate({ email }, updateData, { new: true })
    await profile.save()

    return profile
  } catch (error) {
    console.error('updateUserProfile function -> Error updating user profile: ', error)
    throw new Error(error?.message)
  }
}

// Separate function for updating profile by email (used by PUT route)
export const updateProfileByEmail = async ({ email, data }) => {
  await connectMongo()
  try {
    let existedUser = await User.findOne({ email: email })
    if (!existedUser) {
      return { status: 'error', result: null, message: 'User not found' }
    }

    let profile = await UserProfile.findOne({ email })

    // Ensure password isn't included in the update
    if (profile) {
      if (data.password) {
        delete data.password
      }

      // Convert countryDialCode to number if it's a string
      if (data.countryDialCode) {
        data.countryDialCode = parseInt(data.countryDialCode, 10)
      }

      console.log('Address data being saved:', {
        country: data.country,
        region: data.region,
        zipcode: data.zipcode,
        locality: data.locality,
        street: data.street,
        colony: data.colony,
        village: data.village,
        countryCode: data.countryCode,
        countryDialCode: data.countryDialCode
      })

      // Languages array is handled directly - no special processing needed
      // The provided languages array will replace the existing one

      // Update existing profile
      try {
        console.log('Updating profile with email:', email)
        console.log('Data being sent to MongoDB:', JSON.stringify(data, null, 2))

        // First, let's check what's currently in the database
        const beforeUpdate = await UserProfile.findOne({ email })
        console.log('Before update - address fields:', {
          country: beforeUpdate.country,
          region: beforeUpdate.region,
          zipcode: beforeUpdate.zipcode,
          locality: beforeUpdate.locality
        })

        // Try updating individual address fields explicitly
        const addressUpdateData = {
          country: data.country,
          countryCode: data.countryCode,
          countryDialCode: data.countryDialCode,
          region: data.region,
          zipcode: data.zipcode,
          locality: data.locality,
          pincode: data.pincode,
          postoffice: data.postoffice,
          street: data.street,
          colony: data.colony,
          village: data.village
        }

        console.log('Address update data:', addressUpdateData)

        // Update with explicit address fields
        const updateResult = await UserProfile.updateOne(
          { email },
          {
            $set: {
              ...data,
              ...addressUpdateData
            }
          },
          {
            runValidators: false, // Skip validation to see if that's the issue
            strict: false // Allow fields not in schema
          }
        )
        console.log('Update result:', updateResult)

        if (updateResult.modifiedCount === 0) {
          console.error('No documents were modified! Trying alternative approach...')

          // Try alternative approach with findOneAndUpdate
          const alternativeResult = await UserProfile.findOneAndUpdate(
            { email },
            { $set: addressUpdateData },
            {
              new: true,
              runValidators: false,
              strict: false
            }
          )
          console.log('Alternative update result:', alternativeResult)

          if (!alternativeResult) {
            throw new Error('Profile update failed - no documents modified with alternative approach')
          }

          profile = alternativeResult
        }

        // Fetch the updated profile
        profile = await UserProfile.findOne({ email })
        console.log('Profile updated successfully')
        console.log('Updated profile keys:', Object.keys(profile))

        // Double-check by fetching the profile again
        const verifyProfile = await UserProfile.findOne({ email })
        console.log('Verification - Profile from database:', {
          country: verifyProfile.country,
          region: verifyProfile.region,
          zipcode: verifyProfile.zipcode,
          locality: verifyProfile.locality,
          street: verifyProfile.street,
          colony: verifyProfile.colony,
          village: verifyProfile.village
        })
      } catch (updateError) {
        console.error('Error during profile update:', updateError)
        throw updateError
      }

      // Verify address data was saved
      console.log('Profile object after update:', profile)
      console.log('✅ Address data saved to database:', {
        country: profile.country || 'EMPTY',
        region: profile.region || 'EMPTY',
        zipcode: profile.zipcode || 'EMPTY',
        locality: profile.locality || 'EMPTY',
        street: profile.street || 'EMPTY',
        colony: profile.colony || 'EMPTY',
        village: profile.village || 'EMPTY',
        countryCode: profile.countryCode || 'EMPTY',
        countryDialCode: profile.countryDialCode || 'EMPTY'
      })

      return { status: 'success', result: profile, message: 'User profile updated successfully' }
    } else {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
  } catch (error) {
    console.error('updateProfileByEmail function -> Error updating user profile: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

// Separate function for deleting profile by email (used by DELETE route)
export const deleteProfileByEmail = async ({ email }) => {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    // Soft delete by updating isDeleted flag
    profile = await UserProfile.findOneAndUpdate({ email }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    return { status: 'success', result: profile, message: 'User profile deleted successfully' }
  } catch (error) {
    console.error('deleteProfileByEmail function -> Error deleting user profile: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

// Separate function for deleting profile by ID (for future use)
export const deleteProfileById = async ({ id }) => {
  await connectMongo()
  try {
    let profile = await UserProfile.findOne({ _id: id })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    // Soft delete by updating isDeleted flag
    profile = await UserProfile.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true })

    return { status: 'success', result: profile, message: 'User profile deleted successfully' }
  } catch (error) {
    console.error('deleteProfileById function -> Error deleting user profile: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export const getUserProfile = async (userId, idType = 'email') => {
  await connectMongo()
  try {
    // console.log('Userid and idtype', userId, idType)
    var query = {}

    if (idType === 'email') query = { email: userId }
    if (idType === 'phone') query = { phone: userId }
    // console.log('user profile fetching query:', query)
    const profile = await UserProfile.findOne(query)
    if (!profile) {
      throw new Error('User profile not found.')
    }

    return profile
  } catch (error) {
    console.error('getUserProfile function -> Error fetching user profile: ', error)
    throw new Error(error?.message)
  }
}
