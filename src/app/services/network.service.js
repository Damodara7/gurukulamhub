import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from '../api/profile/profile.model'
import User from '../models/user.model'
import UserLearning from '../api/user-learning/user-learning.model'

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

    const collectEmails = (node, acc = []) => {
      if (!node) return acc
      if (node.email) acc.push(node.email)
      if (Array.isArray(node.network)) {
        node.network.forEach(child => collectEmails(child, acc))
      }
      return acc
    }

    const uniqueEmails = [...new Set(collectEmails({ ...profile, network: networkTree }))]

    const users = await User.find({ email: { $in: uniqueEmails } }).select('email gamePointHistory').lean()

    const gamePointsByEmail = new Map(
      users.map(user => {
        const history = Array.isArray(user.gamePointHistory) ? user.gamePointHistory : []
        const totalGamePoints = history.reduce((sum, entry) => sum + Number(entry?.totalPossiblePoints || 0), 0)
        return [
          user.email,
          {
            totalGamePoints,
            totalGamesPlayed: history.length
          }
        ]
      })
    )

    const learningRecords = await UserLearning.find({ email: { $in: uniqueEmails } }).select('email learning').lean()

    const learningPointsByEmail = new Map(
      learningRecords.map(record => {
        const learning = Array.isArray(record.learning) ? record.learning : []
        const totalLearningPoints = learning.reduce((sum, entry) => sum + Number(entry?.learningPoints || 0), 0)
        return [record.email, totalLearningPoints]
      })
    )

    const attachGamePointMetrics = node => {
      const metrics = gamePointsByEmail.get(node.email) || { totalGamePoints: 0, totalGamesPlayed: 0 }
      const totalLearningPoints = Number(learningPointsByEmail.get(node.email) || 0)
      const referralPoints = Number(node?.referralPoints || 0)
      const cumulativePoints = referralPoints + Number(metrics.totalGamePoints || 0) + totalLearningPoints
      return {
        ...node,
        totalGamePoints: metrics.totalGamePoints,
        totalLearningPoints,
        totalGamesPlayed: metrics.totalGamesPlayed,
        cumulativePoints,
        network: Array.isArray(node.network) ? node.network.map(attachGamePointMetrics) : []
      }
    }

    const data = {
      // profile: profile,
      ...profile,
      name: profile.firstname + ' ' + profile.lastname,
      network: networkTree
    }

    const enrichedData = attachGamePointMetrics(data)

    return { status: 'success', message: 'Profile network fetched successfully', result: enrichedData }
  } catch (error) {
    console.error('getUserNetworkTree -> Error retrieving network tree: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}
