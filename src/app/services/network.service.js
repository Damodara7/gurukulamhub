import connectMongo from '@/utils/dbConnect-mongo'
import UserProfile from '../api/profile/profile.model'
import User from '../models/user.model'
import UserLearning from '../api/user-learning/user-learning.model'
import ReferralInvite from '../models/referral-invite.model'

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

    const users = await User.find({ email: { $in: uniqueEmails } }).select('email gamePointHistory isVerified').lean()

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
    const verificationByEmail = new Map(users.map(user => [user.email, Boolean(user?.isVerified)]))

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
        isVerified: Boolean(verificationByEmail.get(node.email)),
        cumulativePoints,
        network: Array.isArray(node.network) ? node.network.map(attachGamePointMetrics) : []
      }
    }

    const inviterEmail = String(email || '').trim().toLowerCase()
    const invites = await ReferralInvite.find({ inviterEmail }).sort({ lastSentAt: -1 }).lean()
    const invitedEmails = [...new Set(invites.map(invite => String(invite.inviteeEmail || '').trim().toLowerCase()).filter(Boolean))]
    const invitedUsers = invitedEmails.length
      ? await User.find({ email: { $in: invitedEmails } }).select('email firstname lastname isVerified referredBy createdAt').lean()
      : []
    const invitedUsersByEmail = new Map(invitedUsers.map(user => [String(user.email || '').trim().toLowerCase(), user]))

    const referralHistoryItems = invites.map(invite => {
      const inviteeEmail = String(invite.inviteeEmail || '').trim().toLowerCase()
      const inviteeUser = invitedUsersByEmail.get(inviteeEmail)
      const joinedWithThisReferral = Boolean(
        inviteeUser && String(inviteeUser.referredBy || '').trim().toLowerCase() === inviterEmail
      )
      const isVerified = Boolean(inviteeUser?.isVerified)
      let status = 'Not Joined Yet'
      if (joinedWithThisReferral && isVerified) status = 'Joined & Verified'
      else if (joinedWithThisReferral && !isVerified) status = 'Joined but Unverified'
      else if (inviteeUser) status = 'Joined (Different Referral)'

      return {
        inviteeEmail,
        inviteeName: inviteeUser ? `${inviteeUser.firstname || ''} ${inviteeUser.lastname || ''}`.trim() : '',
        status,
        sentCount: Number(invite.sentCount || 1),
        firstSentAt: invite.firstSentAt || invite.createdAt,
        lastSentAt: invite.lastSentAt || invite.updatedAt,
        joinedAt: inviteeUser?.createdAt || null
      }
    })

    const directlyReferredUsers = await User.find({ referredBy: inviterEmail })
      .select('email firstname lastname isVerified createdAt')
      .lean()

    const referralItemsByEmail = new Map(referralHistoryItems.map(item => [item.inviteeEmail, item]))
    directlyReferredUsers.forEach(user => {
      const joinedEmail = String(user.email || '').trim().toLowerCase()
      if (!joinedEmail || referralItemsByEmail.has(joinedEmail)) return
      referralHistoryItems.push({
        inviteeEmail: joinedEmail,
        inviteeName: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
        status: user.isVerified ? 'Joined & Verified' : 'Joined but Unverified',
        sentCount: 0,
        firstSentAt: null,
        lastSentAt: null,
        joinedAt: user.createdAt || null
      })
    })

    const referralHistorySummary = referralHistoryItems.reduce(
      (acc, item) => {
        acc.totalSent += 1
        if (item.status === 'Joined & Verified') acc.joinedAndVerified += 1
        else if (item.status === 'Joined but Unverified') acc.joinedButUnverified += 1
        else if (item.status === 'Not Joined Yet') acc.notJoinedYet += 1
        else acc.joinedWithDifferentReferral += 1
        return acc
      },
      {
        totalSent: 0,
        joinedAndVerified: 0,
        joinedButUnverified: 0,
        notJoinedYet: 0,
        joinedWithDifferentReferral: 0
      }
    )

    const data = {
      // profile: profile,
      ...profile,
      name: profile.firstname + ' ' + profile.lastname,
      network: networkTree,
      referralHistory: {
        summary: referralHistorySummary,
        items: referralHistoryItems
      }
    }

    const enrichedData = attachGamePointMetrics(data)

    return { status: 'success', message: 'Profile network fetched successfully', result: enrichedData }
  } catch (error) {
    console.error('getUserNetworkTree -> Error retrieving network tree: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}
