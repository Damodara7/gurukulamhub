import bcryptjs from 'bcryptjs'
import connectMongo from '@/utils/dbConnect-mongo'
import * as MailService from './mail.service'
import * as OtpService from './otp.service'
import * as SMSService from './sms.service'
import User from '../models/user.model'
import UserProfile from '../api/profile/profile.model'
import * as UserProfileService from '../api/profile/profile.service'
import crypto from 'crypto'
import { resetPasswordTemplate } from '@/utils/email-templates/resetPasswordTemplate'
import { sendReferralLinkTemplate } from '@/utils/referralTemplate'
import { sendCredentialsTemplate } from '@/utils/email-templates/sendCredentialsTemplate'
import * as PwdUtils from '@/utils/password'
import * as AppCodes from '@/configs/appErrorCodes'
import { referrerNotificationTemplate } from '@/utils/email-templates/referrerNotificationTemplate'
import * as AlertsService from '../api/alerts/alerts.service'
import * as UserAlertService from '../api/user-alerts/user-alerts.service'

export async function getByEmail({ email }) {
  await connectMongo()
  try {
    let user = await User.findOne({ email }).select('-password').lean().populate('profile')
    if (user && !user.isActive) {
      return {
        status: 'error',
        result: null,
        message: 'Account deactivated. Please contact the administration for assistance.'
      }
    }
    if (!user) {
      return { status: 'error', result: null, message: 'User not found' }
    }
    return { status: 'success', result: user, message: 'User fetched successfully' }
  } catch (error) {
    console.error('getByEmail function -> Error fetching user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

// Get by query params
export async function getOneByQueryParams({ queryParams }) {
  await connectMongo()
  try {
    let user = await User.findOne({ ...queryParams })
      .select('-password')
      .lean()
      .populate('profile')
    if (!user) {
      return { status: 'error', result: null, message: 'No user found' }
    }
    const profile = await UserProfile.findOne({ email: queryParams.email }).lean()
    return { status: 'success', result: { user: user, profile: profile }, message: 'User fetched successfully' }
  } catch (error) {
    console.error('getOneByQueryParams function -> Error fetching user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getById({ id }) {
  await connectMongo()
  try {
    let user = await User.findOne({ _id: id }).select('-password').lean().populate('profile')
    if (user && !user.isActive) {
      return {
        status: 'error',
        result: null,
        message: 'Account deactivated. Please contact the administration for assistance.'
      }
    }
    if (!user) {
      return { status: 'error', result: null, message: 'User not found' }
    }
    return { status: 'success', result: user, message: 'User fetched successfully' }
  } catch (error) {
    console.error('getById function -> Error fetching user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getByReferralToken({ referralToken }) {
  await connectMongo()
  try {
    let user = await User.findOne({ referralToken, isActive: true }).select('-password').lean().populate('profile')
    if (user && !user.isActive) {
      return {
        status: 'error',
        result: null,
        message: 'Referrer account deactivated. Please contact the administration for assistance.'
      }
    }
    if (!user) {
      return { status: 'error', result: null, message: 'User not found' }
    }
    const profile = await UserProfile.findOne({ email: user.email }).lean()
    return { status: 'success', result: { ...user, ...profile }, message: 'User fetched successfully' }
  } catch (error) {
    console.error('getByReferralToken function -> Error fetching user: ', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function addGroupToUser(userId, groupId) {
  await connectMongo()
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { $addToSet: { groupIds: groupId } }, { new: true })

    if (!updatedUser) {
      return { status: 'error', result: null, message: 'User not found' }
    }

    return { status: 'success', result: updatedUser, message: 'Group added to user successfully' }
  } catch (error) {
    console.error('addGroupToUser function -> Error updating user:', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function getAll() {
  await connectMongo() // Connect to the MongoDB database

  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).populate('profile').lean()
    return { status: 'success', result: users, message: 'Users fetched successfully' }
  } catch (error) {
    console.error(`Error fetching users: ${error}`)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function updateOne({ email, data: updatedData }) {
  await connectMongo()
  try {
    const updatedUser = await User.findOneAndUpdate({ email }, updatedData, { new: true }).select('-password') // Return updated user without password
    return { status: 'success', result: updatedUser, message: 'User updated successfully' }
  } catch (error) {
    // console.log(`Error updating user: ${error}`)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function add({ data: userData }) {
  await connectMongo()
  try {
    //hash password.
    const salt = await bcryptjs.genSalt(12)
    const hashedPassword = await bcryptjs.hash(userData.password, salt)

    const referralToken = crypto.randomBytes(20).toString('hex')
    const memberId = await generateUniqueMemberId()

    var newUserData = new User({
      email: userData.email,
      ...userData,
      password: hashedPassword,
      memberId,
      referralToken
    })
    newUserData.socialLogin = 'credentials'

    // const userProfile = new UserProfile({ email: userData.email, ...userData, password: hashedPassword })
    // await userProfile.save()
    const userProfileResult = await UserProfileService.add({ data: { email: userData.email, ...userData } })

    newUserData.profile = userProfileResult?.result?._id
    var savedNewUser = await newUserData.save()

    if (savedNewUser) {
      await srvSendEmailOtp(userData.email, 'verifyEmail')
      return { status: 'success', result: savedNewUser, message: 'User added successfully' }
    } else {
      // console.log('User not added')
      return { status: 'error', result: null, message: 'User not added' }
    }
  } catch (err) {
    // console.log('Error occurred while creating new user', err)
    return { status: 'error', result: null, message: err.message }
  }
}

export async function addByAdmin({ data: userData }) {
  await connectMongo()
  try {
    let user = await User.findOne({ email: userData.email }).select('-password').lean()
    if (user) {
      return { status: 'error', result: null, message: 'User already exists' }
    }
    //hash password.
    const salt = await bcryptjs.genSalt(12)
    const hashedPassword = await bcryptjs.hash(userData.password, salt)

    const referralToken = crypto.randomBytes(20).toString('hex')
    const memberId = await generateUniqueMemberId()

    var newUserData = new User({
      email: userData.email,
      ...userData,
      password: hashedPassword,
      memberId,
      referralToken
    })
    newUserData.socialLogin = 'credentials'

    // const userProfile = new UserProfile({ email: userData.email, ...userData, password: hashedPassword })
    // await userProfile.save()
    const userProfileResult = await UserProfileService.addByAdmin({ data: { ...userData } })

    newUserData.profile = userProfileResult?.result?._id
    var savedNewUser = await newUserData.save()

    if (savedNewUser) {
      // await srvSendEmailOtp(userData.email, 'verifyEmail')
      const sendCredentialsResponse = await srvSendCredentials(userData)
      return { status: 'success', result: savedNewUser, message: 'User added successfully' }
    } else {
      // console.log('User not added')
      return { status: 'error', result: null, message: 'User not added' }
    }
  } catch (err) {
    // console.log('Error occurred while creating new user', err)
    return { status: 'error', result: null, message: err.message }
  }
}

export async function addOrUpdate({ email, data }) {
  // register
  await connectMongo()
  try {
    let user = await User.findOne({ email })
    if (!user) {
      // const createdUser = new User({ email, ...data })
      // await createdUser.save()
      // const createdUserProfile = await UserProfileService.addOrUpdate({ email, data })
      const createdUserResult = await add({ data: { email, ...data } })
      return createdUserResult
    } else {
      // Only update if there's any missing field
      if (Object.keys(data).length > 0) {
        try {
          const updatedUser = await UserProfileService.updateProfileByEmail({ email, data })
        } catch (error) {
          // console.log('Error updating firstname, lastname, image on Google SignIn', error)
        }
      }

      if (!user.isVerified) {
        await srvSendEmailOtp(email, 'verifyEmail')
        return { status: 'success', result: user, message: 'Otp resent successfully' }
      }
      const errorResponse = handleDuplicateUserFound(user)
      return { status: 'error', ...errorResponse }
    }
  } catch (error) {
    // console.log('Error occurred while adding or updating user', error)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function addByGoogleSignin({ email, data }) {
  await connectMongo()
  try {
    let user = await User.findOne({ email })
    if (user && !user.isActive) {
      return {
        status: 'error',
        result: null,
        message: 'Account deactivated. Please contact the administration for assistance.'
      }
    }

    if (!user) {
      const referralToken = crypto.randomBytes(20).toString('hex')
      const memberId = await generateUniqueMemberId()
      var newUserData = new User({
        email,
        ...data,
        memberId,
        referralToken
      })
      newUserData.socialLogin = 'google'
      newUserData.isVerified = true
      newUserData.loginCount = newUserData.loginCount + 1

      // Save the user to database first
      const savedUser = await newUserData.save()

      // Synchronize all alerts from AlertModel to the user's alerts list on login
      await UserAlertService.addAllAlertsToOneUser({ email })

      // TODO(DONE): User need to be created before adding profile
      const createdUserProfileResult = await UserProfileService.addOrUpdate({ email, data })

      savedUser.profile = createdUserProfileResult?.result?._id

      await savedUser.save()
      return { status: 'success', result: savedUser, message: 'User added successfully by google signin' }
    } else {
      if (!user.isVerified) {
        // Delete Unverified user & user profile of this email
        await User.deleteOne({ email })
        await UserProfile.deleteOne({ email })

        // Create a new user & user profile of this email
        const referralToken = crypto.randomBytes(20).toString('hex')
        const memberId = await generateUniqueMemberId()
        var newUserData = new User({
          email,
          ...data,
          memberId,
          referralToken
        })
        newUserData.socialLogin = 'google'
        newUserData.isVerified = true
        newUserData.loginCount = newUserData.loginCount + 1

        // Synchronize all alerts from AlertModel to the user's alerts list on login
        await UserAlertService.addAllAlertsToOneUser({ email })

        const createdUserProfileResult = await UserProfileService.addOrUpdate({
          email,
          data: { ...data, accountType: 'INDIVIDUAL' }
        })

        newUserData.profile = createdUserProfileResult?.result?._id
        await newUserData.save()

        return { status: 'success', result: newUserData, message: 'User added successfully by google signin' }
      }
      // Increase user login count
      user.loginCount = user.loginCount + 1
      if (!user?.profile) {
        const profile = await UserProfile.findOne({ email: email })
        user.profile = profile?._id
      }
      await user.save()

      // Synchronize all alerts from AlertModel to the user's alerts list on login
      await UserAlertService.addAllAlertsToOneUser({ email })

      // Only update if there's any missing field
      const profile = await UserProfile.findOne({ email })
      if (Object.keys(data).length > 0) {
        // Filter out fields that are already present in the profile
        const fieldsToCheck = ['firstname', 'lastname', 'image']
        fieldsToCheck.forEach(field => {
          // console.log('FIELD: ', field)
          if (profile?.[field]) {
            delete data[field] // Remove the field from data if it exists in profile
          }
        })
        try {
          const updatedUser = await UserProfileService.updateProfileByEmail({ email, data })
        } catch (error) {
          // console.log('Error updating firstname, lastname, image on Google SignIn', error)
        }
      }
      const errorResponse = handleDuplicateUserFound(user)
      return { status: 'success', result: null, message: 'User already exists', ...errorResponse }
    }
  } catch (error) {
    // console.log('Error occurred while adding or updating user', error)
    return { status: 'error', result: null, message: error.message }
  }
}

const handleDuplicateUserFound = user => {
  let errorCode = ''
  let nextActionCode = '/login'
  let context = {}

  if (user.currentStatus === 'VERIFY_OTP_SENT') {
    errorCode = AppCodes.ERROR_USER_ALREADY_EXISTS_UNVERIFIED
    nextActionCode = AppCodes.ACTION_SHOW_ALERT
    context = { email: user.email }
  } else {
    errorCode = AppCodes.ERROR_USER_ALREADY_EXISTS
    nextActionCode = AppCodes.ACTION_CONFIRM_TO_NAVIGATE_TO_PAGE
    context = { email: user.email, nextPage: '/auth/login' } // Additional context object
  }
  const errorResponse = { message: errorCode, result: context, nextActionCode }
  return errorResponse
}

export async function mobileLogin({ email }) {
  await connectMongo()
  try {
    let user = await User.findOne({ email })
    const userProfile = await UserProfile.findOne({ email: email })

    if (!user?.profile) {
      const profile = await UserProfile.findOne({ email: email })
      user.profile = profile?._id
    }

    // Synchronize all alerts from AlertModel to the user's alerts list on login
    await UserAlertService.addAllAlertsToOneUser({ email })

    return { status: 'success', result: { user, profile: userProfile }, message: 'Mobile login successful.' }
  } catch (error) {
    return { status: 'error', result: null, message: error?.message }
  }
}

export async function login({ email, password }) {
  await connectMongo()

  //check if user exists
  const user = await User.findOne({ email })

  if (user && !user.isActive) {
    return {
      status: 'error',
      result: null,
      message: 'Account deactivated. Please contact the administration for assistance.'
    }
  }

  if (!user) {
    return { status: 'error', result: null, message: 'User does not exist' }
  } else {
    //check if password exists
    if (!user?.password) {
      if (user?.socialLogin === 'google') {
        return {
          status: 'error',
          result: null,
          message: 'No password is associated with this account. Please use Google Sign-In.'
        }
      }
    }
    //check if password is correct
    // console.log('is user authenticated.. no..')
    const validPassword = await PwdUtils.verifyPassword(password, user.password)
    if (!validPassword) {
      // console.log('invalid password.')

      return { status: 'error', result: null, message: 'Invalid password' }
    }

    if (!user?.profile) {
      const profile = await UserProfile.findOne({ email: email })
      user.profile = profile?._id
    }

    // Increase user login count
    user.loginCount = user.loginCount + 1
    await user.save()

    // Synchronize all alerts from AlertModel to the user's alerts list on login
    await UserAlertService.addAllAlertsToOneUser({ email })

    return { status: 'success', result: { email: user.email, id: user._id }, message: 'Login successful' }
  }
}

export async function srvSendEmailOtp(email, purpose) {
  await connectMongo()
  try {
    // Create a hash token based on the user's ID
    const otp = OtpService.generateOTP()
    // const otp = await bcryptjs.hash(email.toString(), 10)
    var updatedData = {}
    var result = {}
    // Update the user document in the database with the generated token and expiry time
    if (purpose === 'verifyEmail') {
      updatedData = {
        verifyToken: otp,
        verifyTokenExpiry: new Date(new Date().getTime() + 2 * 60 * 1000), // 2 minutes expiration time
        currentStatus: 'VERIFY_OTP_SENT'
      }
      result = await updateOne({ email, data: updatedData })
    } else if (purpose === 'resetPassword') {
      updatedData = {
        forgotPasswordToken: otp,
        forgotPasswordTokenExpiry: new Date(new Date().getTime() + 2 * 60 * 1000),
        currentStatus: 'RESET_OTP_SENT'
      }
      result = await updateOne({ email, data: updatedData })
    }
    // console.log('Result:', result)
    //construct the message
    // var content = MailService.srvGetVerifyEmailLink({ purpose, otp })
    var purposeDetail = MailService.getPurposeDetail(purpose)
    var content = MailService.srvGetVerifyEmailOtpContent(purposeDetail, otp)

    // Send the email
    const mailResponse = await MailService.srvSendEmail({
      email,
      subject: 'OTP: ' + otp + ' to ' + purposeDetail,
      content
    })
    // console.log('Mail Response:', mailResponse)
    return mailResponse
  } catch (error) {
    // console.log('Error occurred while sending', error.message)
  }
}

export async function srvSendResetPasswordToken(email, locale) {
  // console.log('Locale:', locale)
  await connectMongo()
  try {
    const existingUser = await User.findOne({ email: email })
    if (existingUser && !existingUser.isActive) {
      return {
        status: 'error',
        result: null,
        message: 'Account deactivated. Please contact the administration for assistance.'
      }
    }

    if (!existingUser) {
      // throw new Error(`User ${email} does not exist`)
      return { status: 'error', result: null, message: 'User does not exist' }
    }

    // Remove existing forgot password token
    // if (existingUser?.forgotPasswordToken && existingUser?.forgotPasswordTokenExpiry) {
    //   existingUser.forgotPasswordToken = undefined
    //   existingUser.forgotPasswordTokenExpiry = undefined
    //   await existingUser.save()
    // }

    const resetPasswordToken = crypto.randomBytes(20).toString('hex')
    let forgotPasswordToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex')
    let expiryTime = new Date(Date.now() + 30 * 60 * 1000)

    let timezoneOffsetInMinutes = expiryTime.getTimezoneOffset()
    let localTimeInMillis = expiryTime.getTime() - timezoneOffsetInMinutes * 60 * 1000

    // Create a new Date object that represents the local time without conversion to UTC
    let localTimeDate = new Date(localTimeInMillis)

    // This `localTimeDate` is now in your local timezone and can be stored directly as a `Date` type
    let forgotPasswordTokenExpiry = localTimeDate

    existingUser.forgotPasswordToken = forgotPasswordToken
    existingUser.forgotPasswordTokenExpiry = forgotPasswordTokenExpiry
    await existingUser.save()

    const resetPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/en/reset-password?email=${email}&token=${forgotPasswordToken}`
    const messageTemplate = resetPasswordTemplate(resetPasswordLink)
    const mailResponse = await MailService.srvSendEmail({
      email,
      subject: 'Link to reset password',
      content: messageTemplate
    })
    // console.log('Mail Response:', mailResponse)
    return { status: 'success', result: { resetPasswordLink }, message: 'Reset password link sent' }
  } catch (error) {
    // console.log('Error occurred while sending', error)
    // throw new Error(error.message)
    return { status: 'error', result: null, message: error.message }
  }
}

export async function srvSendReferralLink({ fromEmail, toEmail, locale }) {
  // // console.log('Locale:', locale);
  await connectMongo() // Ensure the database connection is established

  try {
    const existingUser = await User.findOne({ email: fromEmail })
    if (!existingUser) {
      return { status: 'error', message: 'User not found', result: null }
    }

    // Check if a referral token already exists
    let referralToken = existingUser.referralToken

    if (!referralToken) {
      // Generate a new referral token if none exists
      referralToken = crypto.randomBytes(20).toString('hex')
      existingUser.referralToken = referralToken

      // Save the token to the user's record
      await existingUser.save()
    }

    // Create the referral link
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/register?ref=${referralToken}`

    // Construct the email content using the referral template
    const messageTemplate = sendReferralLinkTemplate(
      referralLink,
      existingUser?.name || existingUser.email || 'Your friend'
    )

    // Send the referral email
    const mailResponse = await MailService.srvSendEmail({
      email: toEmail,
      subject: `${existingUser?.name || existingUser.email || 'A friend'} has invited you to join!`,
      content: messageTemplate
    })

    // console.log('Mail Response:', mailResponse)
    return { status: 'success', result: mailResponse, message: 'Referral link sent successfully!' }
  } catch (error) {
    console.error('Error occurred while sending referral email:', error)
    return { status: 'error', message: error.message || 'An error occurred', result: null }
  }
}

export async function srvSendReferrerNotification({ data }) {
  await connectMongo() // Ensure the database connection is established

  try {
    const { newUserEmail, referrerEmail, referrerName, referrerMemberId } = data
    const newUserProfile = await UserProfile.findOne({ email: newUserEmail })
    if (!newUserProfile) {
      return { status: 'error', message: 'User not found', result: null }
    }
    if (!(referrerEmail && referrerMemberId && referrerName)) {
      return { status: 'error', message: 'Invalid referrer data', result: null }
    }

    // construct email content using notification template
    const messageTemplate = referrerNotificationTemplate({
      referrerName: referrerName,
      referrerEmail: referrerEmail,
      newUserName: `${newUserProfile?.firstname}${newUserProfile?.lastname && ' ' + newUserProfile?.lastname}`,
      newUserEmail: newUserEmail,
      newUserMobileNumber: newUserProfile?.phone,
      referrerMemberId: referrerMemberId
    })

    // Send the email notification to referrer
    const mailResponse = await MailService.srvSendEmail({
      email: referrerEmail,
      subject: 'Exciting News: A New User Joined GurukulHub with Your Referral!',
      content: messageTemplate
    })

    // console.log('Mail Response:', mailResponse)
    return { status: 'success', result: mailResponse, message: 'Notification to referrer sent successfully!' }
  } catch (error) {
    console.error('Error occurred while sending referral email:', error)
    return { status: 'error', message: error.message || 'An error occurred', result: null }
  }
}

export async function srvSendCredentials(data, locale = 'en') {
  const { email, password, firstName, lastName } = data
  const siteLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/login`

  try {
    // Construct the email content using the credentials template
    const messageTemplate = sendCredentialsTemplate(data, siteLink)

    // Send the credentials email
    const mailResponse = await MailService.srvSendEmail({
      email,
      subject: `Welcome to GurukulHub, ${firstName || 'User'}!`,
      content: messageTemplate
    })

    // console.log('Mail Response:', mailResponse)
    return { status: 'success', result: mailResponse, message: 'Credentials sent successfully!' }
  } catch (error) {
    console.error('Error occurred while sending credentials email:', error)
    return { status: 'error', message: error.message || 'An error occurred', result: null }
  }
}

export async function srvVerifyEmailOtp(email, otp) {
  await connectMongo()
  try {
    const user = await User.findOne({
      email: email,
      verifyToken: otp,
      verifyTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return 0 //("Invalid Token");
    } else {
      // console.log('User fetched..', user)
      user.isVerified = true
      user.verifyToken = null // Use null to clear the field
      user.verifyTokenExpiry = null // Use null to clear the field
      user.currentStatus = 'VERIFIED_EMAIL_OTP'
      await user.save()
      return 1
    }
  } catch (error) {
    // console.log('Error while saving / verifying otp :', error?.message)
    return -1
  }
}

export async function srvSendPhoneOtp(email, phone, name) {
  await connectMongo()
  try {
    // console.log('mobile number', phone)
    // Create a hash token based on the user's ID
    const otp = OtpService.generateOTP()
    // const otp = await bcryptjs.hash(email.toString(), 10)
    var updatedData = {}
    let result = {}

    updatedData = {
      verifyToken: otp,
      verifyTokenExpiry: new Date(Date.now() + 2 * 60 * 1000),
      currentStatus: 'VERIFY_PHONE_OTP_SENT'
    }
    result = await updateOne({ email, data: updatedData })

    // console.log('Result:', result)

    let content = SMSService.getOTPTemplate(phone, otp, name)
    // Send the sms
    const smsResponse = await SMSService.srvSendSMS(content)
    // console.log('SMS Response:', smsResponse)
    return smsResponse
  } catch (error) {
    // console.log('Error occurred while sending sms', error.message)
  }
}

export async function srvVerifyPhoneOtp(email, otp) {
  await connectMongo()
  try {
    const user = await User.findOne({
      email: email,
      verifyToken: otp,
      verifyTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return 0 //("Invalid Token");
    } else {
      // console.log('User fetched..', user)
      user.isVerified = true
      user.verifyToken = null // Use null to clear the field
      user.verifyTokenExpiry = null // Use null to clear the field
      user.currentStatus = 'VERIFIED_PHONE_OTP'
      await user.save()
      return 1
    }
  } catch (error) {
    // console.log('Error while saving / verifying otp :', error?.message)
    return -1
  }
}

export async function srvGetAccountsWithMobile(mobile) {
  await connectMongo()
  try {
    const result = await UserProfile.find({ phone: mobile }).lean()
    return { status: 'success', result, message: 'Fetched accounts with mobile succeesfully' }
  } catch (error) {
    console.error('Error while fetching users with mobile number: ', error)
    return { status: 'error', message: error.message || 'An error occurred', result: null }
  }
}

/*************** PASSWORD RELATED ****************/
export const setPassword = async ({ email, password }) => {
  await connectMongo()
  try {
    let user = await User.findOne({ email })

    if (!user) {
      return { status: 'error', message: 'User not found', result: null }
    }

    if (!password) {
      return { status: 'error', message: 'Password is required', result: null }
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    const newData = { password: hashedPassword }

    user = await User.findOneAndUpdate({ email }, newData, { new: true })

    await user.save()

    return { status: 'success', result: user, message: 'Password set successfully' }
  } catch (error) {
    console.error('setPassword function -> Error while setting user password: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}

export const resetPassword = async ({ email, token, password }) => {
  // console.log(`reset password started`)
  await connectMongo()
  try {
    if (!email || !token) {
      return { status: 'error', message: 'Invalid email or token!', result: null }
    }

    let user = await User.findOne({ email })

    if (!user) {
      return { status: 'error', message: 'User not found', result: null }
    }
    // let forgotPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    if (!user.forgotPasswordToken || user.forgotPasswordToken !== token) {
      return { status: 'error', message: 'Invalid link', result: null }
    }
    if (user.forgotPasswordTokenExpiry < Date.now()) {
      return { status: 'error', message: 'Link expired', result: null }
    }

    if (!password) {
      return { status: 'error', message: 'Password is required', result: null }
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    const newData = { password: hashedPassword }

    // console.log('Update password')

    user = await User.findOneAndUpdate({ email }, newData, { new: true })
    user.forgotPasswordToken = undefined
    user.forgotPasswordTokenExpiry = undefined

    // console.log('Updated password')

    await user.save()

    return { status: 'success', result: user, message: 'Password reset successfully' }
  } catch (error) {
    console.error('resetPassword function -> Error while resetting user password: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}

export const isValidResetPasswordLink = async (email, token) => {
  await connectMongo()
  try {
    if (!email || !token) {
      // throw new Error('Invalid email or token!')
      return { status: 'error', message: 'Invalid email or token!', result: null }
    }

    // let forgotPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    let user = await User.findOne({ email })
    if (!user) {
      // throw new Error('User not found!')
      return { status: 'error', message: 'User not found!', result: null }
    }
    if (!user.forgotPasswordToken || user.forgotPasswordToken !== token) {
      // throw new Error('Invalid link!')
      return { status: 'error', message: 'Invalid link!', result: null }
    }
    if (user.forgotPasswordTokenExpiry < Date.now()) {
      // throw new Error('Link expired!')
      return { status: 'error', message: 'Link expired!', result: null }
    }
    // let user = await User.findOne({ email, forgotPasswordToken, forgotPasswordTokenExpiry: { $gt: Date.now() } })

    // if (!user) {
    //   throw new Error('Invalid or expired token!')
    // }

    return { status: 'success', result: true, message: 'Reset password link is valid' }
  } catch (error) {
    console.error('isValidResetPasswordLink function -> Error while reaching reset password link: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}

export const changePassword = async ({ email, currentPassword, newPassword }) => {
  await connectMongo()
  try {
    let user = await User.findOne({ email })

    if (!user) {
      return { status: 'error', message: 'User not found!', result: null }
    }
    if (!currentPassword) {
      return { status: 'error', message: 'Current password is required!', result: null }
    }
    if (!newPassword) {
      return { status: 'error', message: 'New password is required!', result: null }
    }

    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return { status: 'error', message: 'Current password is incorrect!', result: null }
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    const newData = { password: hashedPassword }

    user = await User.findOneAndUpdate({ email }, newData, { new: true })

    await user.save()

    return { status: 'success', result: user, message: 'Password changed successfully' }
  } catch (error) {
    console.error('changePassword function -> Error while changing user password: ', error)
    return { status: 'error', message: error.message, result: null }
  }
}

export const doesUserHavePassword = async (userId, idType = 'email') => {
  await connectMongo()
  try {
    // console.log('Userid and idtype', userId, idType)
    var query = {}

    if (idType === 'email') query = { email: userId }
    if (idType === 'phone') query = { phone: userId }
    // console.log('user fetching query:', query)
    const user = await User.findOne(query).select('+password').lean()
    if (!user) {
      throw new Error('User not found.')
    }

    if (!user.password) {
      return false
    }
    return true
  } catch (error) {
    console.error('doesUserHavePassword function -> Error fetching user : ', error)
    return { status: 'error', message: error.message, result: null }
  }
}

/*************** CLEANUP RELATED ****************/
export async function cleanupUnverifiedUsers() {
  await connectMongo()
  try {
    // Find unverified users older than 1 day
    const users = await User.find({
      isVerified: false,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 1 day
    })

    if (users.length > 0) {
      // Extract user emails
      const userEmails = users.map(user => user.email)

      // Delete the unverified users
      await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Older than 1 day
      })

      // Delete associated user profiles
      await UserProfile.deleteMany({ email: { $in: userEmails } })

      return {
        status: 'success',
        message: `${users.length} unverified users and their profiles deleted successfully`
      }
    } else {
      return {
        status: 'error',
        message: 'No unverified users found'
      }
    }
  } catch (error) {
    console.error('cleanupUnverifiedUsers function -> Error while deleting unverified users: ', error)
    return {
      status: 'error',
      message: error.message,
      result: null
    }
  }
}

/*************** UNUSED ****************/

export async function createVerificationToken({ emailType, userId }) {
  try {
    // Create a hash token based on the user's ID
    const hashedToken = await bcryptjs.hash(userId.toString(), 10)

    // Update the user document in the database with the generated token and expiry time
    if (emailType === 'VERIFY') {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000
      })
    } else if (emailType === 'RESET') {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000
      })
    }
  } catch (err) {
    console.error(err)
  }
}
/********************************** UNUSED END */

/*************************** UTILITY FUNCTIONS ***************************/
// Function to generate a random Member ID
const generateUniqueMemberId = async () => {
  const generateMemberId = async () => {
    const currentDate = new Date()
    const yy = String(currentDate.getFullYear()).slice(-2) // Last two digits of the year
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0') // Month (01-12)
    const dd = String(currentDate.getDate()).padStart(2, '0') // Day (01-31)
    const datePrefix = `${yy}${mm}${dd}`

    // Count existing member IDs with the current date prefix
    const count = await User.countDocuments({ memberId: { $regex: `^${datePrefix}` } })

    // Generate the next 4-digit sequence
    const sequence = String(count + 1).padStart(4, '0')

    return `${datePrefix}${sequence}`
  }

  let memberId
  let isUnique = false

  // Ensure the memberId is unique by checking the database
  while (!isUnique) {
    memberId = await generateMemberId()
    const existingUser = await User.findOne({ memberId })
    if (!existingUser) {
      isUnique = true
    }
  }

  return memberId
}

// ************************* Some Helpers *************************
// async function addNewLoginIntroAlertHelper(email) {
//   await AlertsService.addGivenAlert({
//     email: email,
//     alertType: 'NEW_LOGIN_INTRO_ALERT',
//     priority: 1,
//   });
//   // console.log('New alert created for user login.');
// }
// async function addDummyAlertHelper(email) {
//   await AlertsService.addGivenAlert({
//     email: email,
//     alertType: 'DUMMY',
//     priority: 2,
//   });
//   // console.log('New alert created for user login.');
// }
// async function activateUserAlertsHelper(email) {
//   await AlertsService.activateAllAlertsOfUser({ email });
//   // console.log('User alerts activated.');
// }

// async function alertActionsOnLogin(email) {
//   await addNewLoginIntroAlertHelper(email);
//   await addDummyAlertHelper(email);
//   await activateUserAlertsHelper(email);
// }

export const removeGroupFromUser = async (userId, groupId) => {
  await connectMongo()
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { $pull: { groupIds: groupId } }, { new: true })

    if (!updatedUser) {
      return { status: 'error', result: null, message: 'User not found' }
    }

    return { status: 'success', result: updatedUser, message: 'Group removed from user successfully' }
  } catch (error) {
    console.error('removeGroupFromUser function -> Error updating user:', error)
    return { status: 'error', result: null, message: error.message }
  }
}

// Function to clean up orphaned groupIds from users
export const cleanupOrphanedGroupIds = async () => {
  await connectMongo()
  try {
    // Import Group model
    const Group = (await import('../api/group/group.model.js')).default

    // Find all users with groupIds
    const usersWithGroups = await User.find({ groupIds: { $exists: true, $ne: [] } }).lean()

    let cleanedCount = 0

    for (const user of usersWithGroups) {
      if (user.groupIds && user.groupIds.length > 0) {
        // Check which groupIds are valid (group exists and is not deleted)
        const validGroupIds = []

        for (const groupId of user.groupIds) {
          try {
            const group = await Group.findOne({ _id: groupId, isDeleted: false })
            if (group) {
              validGroupIds.push(groupId)
            }
          } catch (error) {
            console.error(`Error checking group ${groupId}:`, error)
          }
        }

        // Update user if there are invalid groupIds
        if (validGroupIds.length !== user.groupIds.length) {
          await User.updateOne({ _id: user._id }, { $set: { groupIds: validGroupIds } })
          cleanedCount++
          console.log(`Cleaned up orphaned groupIds for user ${user.email}`)
        }
      }
    }

    return {
      status: 'success',
      result: { cleanedCount },
      message: `Cleaned up ${cleanedCount} users with orphaned groupIds`
    }
  } catch (error) {
    console.error('cleanupOrphanedGroupIds function -> Error cleaning up orphaned groupIds:', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to cleanup orphaned groupIds'
    }
  }
}
