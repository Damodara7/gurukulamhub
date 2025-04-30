import User from '../models/user.model'
import * as PwdUtils from '@/utils/password'
import connectMongo from '@/utils/dbConnect-mongo'

export async function getByEmail(email) {
  await connectMongo()
  // const isEmail = /\S+@\S+\.\S+/.test(email)
  console.log('--> User fetched with email', email)
  // const query = isEmail ? { email: userId } : { _id: userId }
  const user = await User.findOne({ email }).select('-password')
  console.log('--> User fetched with email', user)
  if (user) {
    return user
  } else {
    return false
  }
}

export async function login(email, password) {
  await connectMongo()

  //check if user exists
  const user = await User.findOne({ email })

  if (!user) {
    return { status: 'error', result: null, message: 'User does not exist' }
  } else {
    //check if password exists
    if (!user?.password) {
      if (user?.socialLogin) {
        return { status: 'error', result: null, message: `You created this account with ${user.socialLogin}. You have not set a password yet.` }
      }
    }
    //check if password is correct
    console.log('is user authenticated.. no..')
    const validPassword = await PwdUtils.verifyPassword(password, user.password)
    if (!validPassword) {
      console.log('invalid password.')

      return { status: 'error', result: null, message: 'Invalid password' }
    }

    return { status: 'success', result: user, message: 'Login successful' }
  }
}
