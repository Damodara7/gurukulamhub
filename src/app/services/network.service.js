import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from '../models/profile.model'

export const getUserNetworkTree = async email => {
  await connectMongo()
  try {
    // Get the logged-in user's profile
    let profile = await UserProfile.findOne({ email }).lean()
    if (!profile) {
      return { status: 'error', message: 'No user profile exists with this email', result: null }
    }

    // Recursively build the network tree
    const buildNetworkTree = async userProfile => {
      // Find users referred by the current user
      const referredUsers = await UserProfile.find({ referredBy: userProfile.email }).lean()

      // Build the network for each referred user recursively
      const network = await Promise.all(
        referredUsers.map(async referredUser => {
          const subNetwork = await buildNetworkTree(referredUser)
          return {
            // profile: referredUser,
            ...referredUser,
            name: referredUser.firstname + ' ' + referredUser.lastname,
            network: subNetwork
          }
        })
      )

      return network
    }

    // Start building the network tree from the logged-in user
    const networkTree = await buildNetworkTree(profile)

    const data = {
      // profile: profile,
      ...profile,
      name: profile.firstname + ' ' + profile.lastname,
      network: networkTree
    }

    return { status: 'success', message: 'Profile network fetched successfully', result: data }
  } catch (error) {
    console.error('getUserNetworkTree -> Error retrieving network tree: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}
