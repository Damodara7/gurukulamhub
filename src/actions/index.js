'use server'

import { srvSendEmailOtp, srvSendPhoneOtp } from '@/app/services/user.service'
import { API_URLS } from '@/configs/apiConfig'
import { signIn } from '@/libs/auth'
import * as RestApiUtils from '@/utils/restApiUtil'
import axios from 'axios'
import { AuthError } from 'next-auth'
import * as clientApi from '@/app/api/client/client.api'
import { fetchDoesUserHasPassword } from './user'

export async function signInWithMobile({ email, mobile, password }) {
  console.log('In handleMobileLogin: ', email, mobile, password)

  try {
    await signIn('credentials', {
      email: email,
      password: password,
      mobile: mobile,
      loginMethod: 'mobile',
      // redirect: true,
      // redirectTo: redirectUrl
      // role: 'ADMIN',
    })
    // return { success: true }
  } catch (error) {
    // throw new Error(error.message)
    if (error instanceof AuthError) {
      console.log('AuthError type: ', error?.type)
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        case 'CallbackRouteError':
          //   console.log('ERROR::::', error, error.cause)
          return { error: error.cause.err?.message }
        case 'AccessDenied':
          return { error: 'Access Denied!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }

    throw error
    // return { error: error?.message || 'Something went wrong!' }
  }
}

// In use for LoginForm
export async function handleMobileLogin({ email, mobile, otp, captcha, redirectUrl }) {
  console.log('In handleMobileLogin: ', email, mobile, otp)
  const wholeRedirectUrl = `${process.env.NEXTAUTH_URL}${redirectUrl}`
  console.log('Whole redirect url: ', wholeRedirectUrl)

  try {
    const captchaFormData = `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`
    const response = await axios({
      url: `https://www.google.com/recaptcha/api/siteverify`,
      method: 'post',
      data: captchaFormData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*'
      }
    })
    if (!response?.data?.success) {
      console.log('captcha error codes: ', response.data['error-codes'])
      // throw new Error('Timeout or duplicate captcha. Please try again.')
      return { error: 'Timeout or duplicate captcha. Please try again.' }
    }

    const result = await RestApiUtils.post(API_URLS.v0.USERS_VERIFY_PHONE_OTP, {
      email,
      phone: mobile,
      otp: otp,
      action: 'verifyPhoneOtp'
    })
    if (result?.status === 'error') {
      return { error: result?.message || 'Mobile number verification failed.' }
    }
  } catch (error) {
    return { error: error.message }
  }

  try {
    await signIn('credentials', {
      email: email,
      password: null,
      mobile: mobile,
      loginMethod: 'mobile',
      // redirect: true,
      // redirectTo: redirectUrl
      // role: 'ADMIN',
    })
    // return { success: true }
  } catch (error) {
    // throw new Error(error.message)
    if (error instanceof AuthError) {
      console.log('AuthError type: ', error?.type)
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        case 'CallbackRouteError':
          //   console.log('ERROR::::', error, error.cause)
          return { error: error.cause.err?.message }
        case 'AccessDenied':
          return { error: 'Access Denied!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }

    throw error
    // return { error: error?.message || 'Something went wrong!' }
  }
}
export async function handleCredentialsLogin({ email, password, code, captcha, redirectUrl }) {
  const wholeRedirectUrl = `${process.env.NEXTAUTH_URL}${redirectUrl}`
  console.log('Whole redirect url: ', wholeRedirectUrl)

  if (!captcha) {
    console.log('No captcha provided.')
    // throw new Error('Invalid captcha. Please try again.')
    return { error: 'Invalid captcha. Please try again.' }
  }
  if (!email) {
    console.log('No email provided.')
    return { error: 'Email is required!' }
  }
  if (!email.includes('@')) {
    console.log('Invalid email.')
    return { error: 'Invalid email!' }
  }
  if (!password) {
    console.log('No password provided.')
    return { error: 'Password is required!' }
  }

  try {
    if (!code) {
      const captchaFormData = `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`
      const response = await axios({
        url: `https://www.google.com/recaptcha/api/siteverify`,
        method: 'post',
        data: captchaFormData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*'
        }
      })
      if (!response?.data?.success) {
        console.log('captcha error codes: ', response.data['error-codes'])
        // throw new Error('Timeout or duplicate captcha. Please try again.')
        return { error: 'Timeout or duplicate captcha. Please try again.' }
      }
    }

    const result = await RestApiUtils.get(`${API_URLS.v0.USER}/${email}`)
    // const result = await clientApi.getUserByEmail(email)
    console.log('User exists or not result before credentials signIn: ', result)
    // if user exists then continue, if user exists but email not verified then send confirmation code, if user does not return error
    if (result?.status === 'error') {
      return { error: result?.message }
    } else {
      console.log('Email exists.')

      if (result?.result?.socialLogin === 'google') {
        const doesUserHavePassword = await fetchDoesUserHasPassword(email)
        if (!doesUserHavePassword) {
          return { error: 'No password is associated with this account. Please use Google Sign-In & set password.' }
        }
      }

      if (code) {
        const result = await RestApiUtils.post(API_URLS.v0.USERS_VERIFY_EMAIL_OTP, {
          email,
          otp: code,
          action: 'verifyEmailOtp'
        })
        if (result?.status === 'error') {
          return { error: result?.message }
        } else {
          console.log('Email verified.')
        }
      } else {
        // console.log('Result: ', result)

        if (!result?.result?.isVerified) {
          // await srvSendEmailOtp(email, 'verifyEmail')
          // return { success: 'Confirmation email sent.', code: true }
          return { error: 'User not found.' }
        } else {
          console.log('Email already verified. Continue to sign in...')
        }
      }
    }
  } catch (error) {
    return { error: error.message }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      // redirect: false,
      // redirectTo: redirectUrl
      // role: 'ADMIN',
    })
    // return { success: true }
  } catch (error) {
    // throw new Error(error.message)
    if (error instanceof AuthError) {
      console.log('AuthError type: ', error?.type)
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        case 'CallbackRouteError':
          //   console.log('ERROR::::', error, error.cause)
          return { error: error.cause.err?.message }
        case 'AccessDenied':
          return { error: 'Access Denied!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }

    throw error
    // return { error: error?.message || 'Something went wrong!' }
  }
}

export async function handleSocialLogin(formData) {
  const action = formData.get('action')

  console.log('action: ', action)
  await signIn(action)
  // try {
  //   return { success: true }
  // } catch (error) {
  //   // console.error('Signin with Google error:', error)
  //   if (error instanceof AuthError) {
  //     console.log('AuthError type: ', error?.type)
  //     switch (error.type) {
  //       case 'CredentialsSignin':
  //         // console.log('ERROR::::', error)
  //         return { error: 'Invalid credentials' }
  //       case 'CallbackRouteError':
  //         //   console.log('ERROR::::', error, error.cause)
  //         return { error: error.cause.err?.message }
  //       case 'AccessDenied':
  //         return { error: 'Access Denied!' }
  //       default:
  //         return { error: 'Something went wrong!' }
  //     }
  //   }

  //   if (isRedirectError(error)) {
  //     console.error('REDIRECT ERROR: ')
  //     // return { message: 'Something went wrong!' }
  //     throw error
  //   }

  //   throw error
  // }
}

export async function handleLoginAfterRegister(email, password) {
  try {
    await signIn('credentials', {
      email,
      password,
      // redirect: false,
      // redirectTo: redirectUrl
      // role: 'ADMIN',
    })
    // return { success: true }
  } catch (error) {
    // throw new Error(error.message)
    if (error instanceof AuthError) {
      console.log('AuthError type: ', error?.type)
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        case 'CallbackRouteError':
          //   console.log('ERROR::::', error, error.cause)
          return { error: error.cause.err?.message }
        case 'AccessDenied':
          return { error: 'Access Denied!' }
        default:
          return { error: 'Something went wrong!' }
      }
    }

    throw error
    // return { error: error?.message || 'Something went wrong!' }
  }
}
