import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from '../models/profile.model'
import User from '../models/user.model'

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
    if (!profile) {
      console.error('User profile not found')
      return { status: 'error', result: null, message: 'User profile not found' }
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

export const updateOne = async ({ email, data }) => {
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

      // Update existing profile
      profile = await UserProfile.findOneAndUpdate({ email }, data, { new: true })
      return { status: 'success', result: profile, message: 'User profile updated successfully' }
    } else {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
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

// export const registerUser = async (email, updateData) => {
//   await connectMongo()
//   try {
//     let profile = await UserProfile.findOne({ email })

//     if (profile) {
//       // Update existing profile
//       profile = await UserProfile.findOneAndUpdate({ email }, updateData, { new: true })
//     } else {
//       // Create new profile
//       if (updateData.password) {
//         const hashedPassword = await bcryptjs.hash(updateData.password, 10)
//         updateData.password = hashedPassword
//       }
//       profile = new UserProfile(updateData)
//       await profile.save()
//     }

//     return profile
//   } catch (error) {
//     console.error('registerUser function -> Error registering user: ', error)
//     throw new Error(error?.message)
//   }
// }

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

// **Get All User Profiles**y7v c
export async function getAllEvenDeletedUserProfiles() {
  await connectMongo()
  try {
    const allUserProfiles = await UserProfile.find({})
    if (!allUserProfiles) {
      // if([]) ==> []=> is truthy value
      throw new Error('Failed to fetch users')
    }
    return allUserProfiles // while using this function, if allUserProfiles.length === 0 send success response
  } catch (err) {
    console.error('Error getting active user profiles:', err)
    throw new Error(err?.message)
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

// Add a new school to the user's profile
export async function addSchool({ email, school: newSchool }) {
  await connectMongo()

  try {
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email },
      { $push: { schools: newSchool } },
      { new: true }
    )

    if (!updatedProfile) {
      console.error('Failed to add school.')
      return { status: 'error', result: null, message: 'Failed to add school' }
    }

    // Get the ID of the newly added school
    const schoolId = updatedProfile.schools[updatedProfile.schools.length - 1]._id

    // Update currentSchoolId
    updatedProfile.currentSchoolId = schoolId
    await updatedProfile.save()

    return { status: 'success', result: updatedProfile, message: 'School added successfully' }
  } catch (err) {
    console.error('createSchool function -> Error adding school:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Add a new working position to the user's profile
export async function addWorkingPosition({ email, workingPosition: newWorkingPosition }) {
  await connectMongo()

  try {
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email },
      { $push: { workingPositions: newWorkingPosition } },
      { new: true }
    )

    if (!updatedProfile) {
      console.error('Failed to create working position.')
      return { status: 'error', result: null, message: 'Failed to add working position' }
    }

    // Get the ID of the newly added working position
    const workingPositionId = updatedProfile.workingPositions[updatedProfile.workingPositions.length - 1]._id

    // Update currentWorkingPositionId
    updatedProfile.currentWorkingPositionId = workingPositionId
    await updatedProfile.save()

    return { status: 'success', result: updatedProfile, message: 'Working position added successfully' }
  } catch (err) {
    console.error('createWorkingPosition function -> Error adding working position:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Add or update a language in the user's profile
export async function addLanguage({ email, language: newLanguage }) {
  await connectMongo()

  try {
    // Find the user profile by email
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    // Profile found, update the languages array
    const existingLanguageIndex = profile.languages.findIndex(lang => lang.language === newLanguage.language)

    if (existingLanguageIndex > -1) {
      // Language exists, retain the original _id and update the rest
      const originalId = profile.languages[existingLanguageIndex]._id
      profile.languages[existingLanguageIndex] = { ...newLanguage, _id: originalId }
    } else {
      // Language does not exist, add new
      profile.languages.push(newLanguage)
    }

    // Save the updated or new profile
    const updatedProfile = await profile.save()

    // Get the ID of the newly added or updated language
    const languageId = updatedProfile.languages.find(lang => lang.language === newLanguage.language)._id

    // Add the language ID to knownLanguageIds if it's not already there
    if (!updatedProfile.knownLanguageIds.includes(languageId.toString())) {
      updatedProfile.knownLanguageIds.push(languageId)
      await updatedProfile.save()
    }

    return { status: 'success', result: updatedProfile, message: 'Language added successfully' }
  } catch (err) {
    console.error('createLanguage function -> Error adding or updating language:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Add or update an associated organization in the user's profile
export async function addAssociatedOrganization({ email, organization: newOrganization }) {
  await connectMongo()

  try {
    // Find the user profile by email
    let profile = await UserProfile.findOne({ email })

    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    } else {
      // Profile found, update the associated organizations array
      const existingOrganizationIndex = profile.associatedOrganizations.findIndex(
        org => org.organization === newOrganization.organization
      )

      if (existingOrganizationIndex > -1) {
        // Organization exists, retain the original _id and update the rest
        const originalId = profile.associatedOrganizations[existingOrganizationIndex]._id
        profile.associatedOrganizations[existingOrganizationIndex] = { ...newOrganization, _id: originalId }
      } else {
        // Organization does not exist, add new
        profile.associatedOrganizations.push(newOrganization)
      }
    }

    // Save the updated or new profile
    const updatedProfile = await profile.save()

    // Get the ID of the newly added or updated organization
    const organizationId = updatedProfile.associatedOrganizations.find(
      org => org.organization === newOrganization.organization
    )._id

    // Add the organization ID to activeAssociatedOrganizationIds if it's not already there
    if (!updatedProfile.activeAssociatedOrganizationIds.includes(organizationId.toString())) {
      updatedProfile.activeAssociatedOrganizationIds.push(organizationId)
      await updatedProfile.save()
    }

    return { status: 'success', result: updatedProfile, message: 'Associated organization added successfully' }
  } catch (err) {
    console.error('createAssociatedOrganization function -> Error adding or updating associated organization:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Get all associated organizations from user profiles
export async function getAllAssociatedOrganizations(email) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email }).select('associatedOrganizations').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
    const associatedOrganizations = profile.associatedOrganizations

    return {
      status: 'success',
      result: associatedOrganizations,
      message: 'Associated orgnactions fetched successfully'
    }
  } catch (err) {
    console.error('getAllAssociatedOrganizations function -> Error fetching associated organizations:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Fetch all schools
export async function getAllSchools(email) {
  await connectMongo()
  try {
    const profile = await UserProfile.findOne({ email }).select('schools').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
    const schools = profile.schools

    return { status: 'success', result: schools, message: 'Schools fetched successfully' }
  } catch (err) {
    console.error('getAllSchools functions -> Error fetching schools:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Fetch all working positions
export async function getAllWorkingPositions(email) {
  await connectMongo()
  try {
    const profile = await UserProfile.findOne({ email }).select('workingPositions').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
    const workingPositions = profile.workingPositions

    return { status: 'success', result: workingPositions, message: 'Working positions fetched successfully' }
  } catch (err) {
    console.error('getAllWorkingPositions function -> Error fetching working positions:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Fetch all languages
export async function getAllLanguages(email) {
  await connectMongo()
  try {
    const profile = await UserProfile.findOne({ email }).select('languages').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }
    const languages = profile.languages

    return { status: 'success', result: languages, message: 'Languages fetched successfully' }
  } catch (err) {
    console.error('getAllLanguages function -> Error fetching languages:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Update a school in the user's profile
export async function updateSchool(schoolId, { email, school: updatedSchool }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const schoolIndex = profile.schools.findIndex(school => school._id.toString() === schoolId)
    if (schoolIndex === -1) {
      return { status: 'error', result: null, message: 'School not found' }
    }

    // Update the school data
    profile.schools[schoolIndex] = { ...profile.schools[schoolIndex].toObject(), ...updatedSchool }
    await profile.save()

    return { status: 'success', result: profile, message: 'School updated successfully' }
  } catch (err) {
    console.error('updateSchool function -> Error updating school:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Delete a school from the user's profile
export async function deleteSchool(schoolId) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ 'schools._id': schoolId })
    if (!profile) {
      return { status: 'error', result: null, message: 'School not found' }
    }

    // Remove the school from the array
    profile.schools = profile.schools.filter(school => school._id.toString() !== schoolId)

    // If the deleted school was the current school, clear currentSchoolId
    if (profile.currentSchoolId === schoolId) {
      profile.currentSchoolId = null
    }

    await profile.save()

    return { status: 'success', result: profile, message: 'School deleted successfully' }
  } catch (err) {
    console.error('deleteSchool function -> Error deleting school:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Update a working position in the user's profile
export async function updateWorkingPosition(positionId, { email, workingPosition: updatedPosition }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const positionIndex = profile.workingPositions.findIndex(position => position._id.toString() === positionId)
    if (positionIndex === -1) {
      return { status: 'error', result: null, message: 'Working position not found' }
    }

    // Update the working position data
    profile.workingPositions[positionIndex] = {
      ...profile.workingPositions[positionIndex].toObject(),
      ...updatedPosition
    }
    await profile.save()

    return { status: 'success', result: profile, message: 'Working position updated successfully' }
  } catch (err) {
    console.error('updateWorkingPosition function -> Error updating working position:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Delete a working position from the user's profile
export async function deleteWorkingPosition(positionId) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ 'workingPositions._id': positionId })
    if (!profile) {
      return { status: 'error', result: null, message: 'Working position not found' }
    }

    // Remove the working position from the array
    profile.workingPositions = profile.workingPositions.filter(position => position._id.toString() !== positionId)

    // If the deleted position was the current position, clear currentWorkingPositionId
    if (profile.currentWorkingPositionId === positionId) {
      profile.currentWorkingPositionId = null
    }

    await profile.save()

    return { status: 'success', result: profile, message: 'Working position deleted successfully' }
  } catch (err) {
    console.error('deleteWorkingPosition function -> Error deleting working position:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Update a language in the user's profile
export async function updateLanguage(languageId, { email, language: updatedLanguage }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const languageIndex = profile.languages.findIndex(language => language._id.toString() === languageId)
    if (languageIndex === -1) {
      return { status: 'error', result: null, message: 'Language not found' }
    }

    // Update the language data
    profile.languages[languageIndex] = { ...profile.languages[languageIndex].toObject(), ...updatedLanguage }
    await profile.save()

    return { status: 'success', result: profile, message: 'Language updated successfully' }
  } catch (err) {
    console.error('updateLanguage function -> Error updating language:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Delete a language from the user's profile
export async function deleteLanguage(languageId) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ 'languages._id': languageId })
    if (!profile) {
      return { status: 'error', result: null, message: 'Language not found' }
    }

    // Remove the language from the array
    profile.languages = profile.languages.filter(language => language._id.toString() !== languageId)

    // Remove from knownLanguageIds if it exists
    profile.knownLanguageIds = profile.knownLanguageIds.filter(id => id !== languageId)

    await profile.save()

    return { status: 'success', result: profile, message: 'Language deleted successfully' }
  } catch (err) {
    console.error('deleteLanguage function -> Error deleting language:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Update an associated organization in the user's profile
export async function updateAssociatedOrganization(organizationId, { email, organization: updatedOrganization }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    const organizationIndex = profile.associatedOrganizations.findIndex(org => org._id.toString() === organizationId)
    if (organizationIndex === -1) {
      return { status: 'error', result: null, message: 'Associated organization not found' }
    }

    // Update the associated organization data
    profile.associatedOrganizations[organizationIndex] = {
      ...profile.associatedOrganizations[organizationIndex].toObject(),
      ...updatedOrganization
    }
    await profile.save()

    return { status: 'success', result: profile, message: 'Associated organization updated successfully' }
  } catch (err) {
    console.error('updateAssociatedOrganization function -> Error updating associated organization:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Delete an associated organization from the user's profile
export async function deleteAssociatedOrganization(organizationId) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ 'associatedOrganizations._id': organizationId })
    if (!profile) {
      return { status: 'error', result: null, message: 'Associated organization not found' }
    }

    // Remove the associated organization from the array
    profile.associatedOrganizations = profile.associatedOrganizations.filter(
      org => org._id.toString() !== organizationId
    )

    // Remove from activeAssociatedOrganizationIds if it exists
    profile.activeAssociatedOrganizationIds = profile.activeAssociatedOrganizationIds.filter(
      id => id !== organizationId
    )

    await profile.save()

    return { status: 'success', result: profile, message: 'Associated organization deleted successfully' }
  } catch (err) {
    console.error('deleteAssociatedOrganization function -> Error deleting associated organization:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Add voter ID information
export async function addVoterId({ email, voterId: voterIdData }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    // Check if voter ID already exists
    if (profile.voterId && profile.voterId.epicNumber) {
      return { status: 'error', result: null, message: 'Voter ID already exists. Use update function to modify.' }
    }

    // Prepare voter ID data
    const voterIdCreate = {
      ...voterIdData
    }

    // Create voter ID information
    profile.voterId = voterIdCreate
    await profile.save()

    return {
      status: 'success',
      result: profile,
      message: 'Voter ID information added successfully'
    }
  } catch (err) {
    console.error('addVoterId function -> Error adding voter ID:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Update voter ID information
export async function updateVoterId({ email, voterId: voterIdData }) {
  await connectMongo()

  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    // Check if voter ID exists
    if (!profile.voterId) {
      return { status: 'error', result: null, message: 'No voter ID found. Use add function to create one.' }
    }

    // Prepare voter ID data
    const voterIdUpdate = {
      ...profile.voterId,
      ...voterIdData
    }

    // Update voter ID information
    profile.voterId = voterIdUpdate
    await profile.save()

    return {
      status: 'success',
      result: profile,
      message: 'Voter ID information updated successfully'
    }
  } catch (err) {
    console.error('updateVoterId function -> Error updating voter ID:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Get voter ID information
export async function getVoterId(email) {
  await connectMongo()
  try {
    const profile = await UserProfile.findOne({ email }).select('voterId').lean()
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    return {
      status: 'success',
      result: profile.voterId || {},
      message: 'Voter ID information retrieved successfully'
    }
  } catch (err) {
    console.error('getVoterId function -> Error fetching voter ID:', err)
    return { status: 'error', result: null, message: err.message }
  }
}

// Delete voter ID information
export async function deleteVoterId(email) {
  await connectMongo()
  try {
    const profile = await UserProfile.findOne({ email })
    if (!profile) {
      return { status: 'error', result: null, message: 'User profile not found' }
    }

    profile.voterId = undefined
    await profile.save()

    return {
      status: 'success',
      result: profile,
      message: 'Voter ID information deleted successfully'
    }
  } catch (err) {
    console.error('deleteVoterId function -> Error deleting voter ID:', err)
    return { status: 'error', result: null, message: err.message }
  }
}
