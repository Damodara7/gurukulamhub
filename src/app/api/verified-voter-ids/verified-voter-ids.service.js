import connectMongo from '@/utils/dbConnect-mongo'
import VerifiedVoterIds from './verified-voter-ids.model'

export async function getAllVerifiedVoterIds() {
  await connectMongo()
  try {
    const allVerifiedVoterIds = await VerifiedVoterIds.find({})
    if (allVerifiedVoterIds.length === 0) {
      console.log('No verified(failed/succeeded) voter ids available.')
      const finalResult = { status: 'success', result: {}, message: 'No verified(failed/succeeded) voter ids exists' }
      return finalResult
    } else {
      console.log('All verified(failed/succeeded) voter ids:', allVerifiedVoterIds)
      const finalResult = {
        status: 'success',
        result: allVerifiedVoterIds,
        message: `Verified(failed/succeeded) voter ids(${allVerifiedVoterIds.length}) retrieved successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting verified(failed/succeeded) voter ids:', err)
    const finalResult = { status: 'error', result: {}, message: err.message }
    return finalResult
  }
}

export async function createVerifiedVoterId(verifiedVoterIdObj) {
  await connectMongo()
  try {
    const newVerifiedVoterId = new VerifiedVoterIds(verifiedVoterIdObj)
    const result = await newVerifiedVoterId.save()

    const finalResult = {
      status: 'success',
      result: newVerifiedVoterId,
      message: 'Verified voter id created successfully'
    }
    return finalResult
  } catch (err) {
    console.error('Error creating verified voter id:', err)
    const finalResult = { status: 'error', result: {}, message: err.message }
    return finalResult
  }
}
