// apiConfig.prod.js

// export const API_BASE_URL = 'http://ec2-13-51-204-221.eu-north-1.compute.amazonaws.com:3000/api'
// export const API_BASE_URL = 'https://gurukulamhub-production.up.railway.app/api'
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gurukulamhub.up.railway.app/api'
// export const API_BASE_URL = 'https://gurukulamhub.up.railway.app/api'
// export const API_BASE_URL = 'http://192.168.31.199:3000/api'
// export const API_BASE_URL = 'http://172.17.27.250:3000/api'
export const API_BASE_URL = 'https://willyard-larue-acquiescingly.ngrok-free.dev/api'

export const API_URLS = {
  v0: {
    USERS_SIGNUP: `${API_BASE_URL}/users/signup`,
    USERS_SIGNIN_WITH_GOOGLE: `${API_BASE_URL}/users/google-signin`,
    USERS_SEND_REFERRER_NOTIFICATION_EMAIL: `${API_BASE_URL}/users/referrer-notification`,
    USERS_LOGIN: `${API_BASE_URL}/users/login`,
    USERS_MOBILE_LOGIN: `${API_BASE_URL}/users/mobile-login`,
    USERS_REFERRAL_INFO: `${API_BASE_URL}/users/referral-info`,
    USER: `${API_BASE_URL}/user`,
    EVENT_USER: `${API_BASE_URL}/eventuser`,
    NETWORK: `${API_BASE_URL}/network`,
    FEATURE: `${API_BASE_URL}/feature`,
    GEO_FEATURE: `${API_BASE_URL}/geo-feature`,
    ROLE: `${API_BASE_URL}/role`,
    GEO_ROLE: `${API_BASE_URL}/geo-role`,
    USERS_SEND_EMAIL_OTP: `${API_BASE_URL}/email`,
    USERS_VERIFY_EMAIL_OTP: `${API_BASE_URL}/users/verifyemail`,
    USERS_SEND_PHONE_OTP: `${API_BASE_URL}/phone`,
    USERS_VERIFY_PHONE_OTP: `${API_BASE_URL}/users/verifyphone`,
    USERS_PROFILE: `${API_BASE_URL}/profile`,
    USERS_QUIZ: `${API_BASE_URL}/quiz`,
    USERS_GROUP: `${API_BASE_URL}/group`,
    USERS_QUIZ_TRANSLATION: `${API_BASE_URL}/translation`,
    USERS_QUIZ_QUESTION: `${API_BASE_URL}/question`,
    USERS_CONTEXT: `${API_BASE_URL}/context`,
    USERS_REFERRER_PROFILE: `${API_BASE_URL}/profile/referrer`,
    ADMIN_ADD_ADVERTISEMENT: `${API_BASE_URL}/game-advt`,
    ADMIN_DEL_ADVERTISEMENT: `${API_BASE_URL}/game-advt`,
    ADMIN_GET_ADVERTISEMENT: `${API_BASE_URL}/game-advt`,
    USERS_GAME: `${API_BASE_URL}/game`,
    USERS_AUDIENCE: `${API_BASE_URL}/audience`,
    USERS_GAME_LIVE: `${API_BASE_URL}/game-live`,
    REFER_EARN: `${API_BASE_URL}/refer-earn`,
    CLEANUP: `${API_BASE_URL}/cleanup`,
    VIDEOS: `${API_BASE_URL}/videos`,
    ALERTS: `${API_BASE_URL}/alerts`,
    USER_ALERTS: `${API_BASE_URL}/user-alerts`,
    USER_LEARNING: `${API_BASE_URL}/user-learning`,
    SPONSORSHIP: `${API_BASE_URL}/sponsorship`,
    SPONSORSHIP_PAYMENT: `${API_BASE_URL}/sponsorship-payment`,
    USERS_GROUP_REQUEST: `${API_BASE_URL}/group-request`,

    GAME_SPONSORSHIP: `${API_BASE_URL}/game-sponsorship`,
    GAME_SPONSORSHIP_PAYMENT: `${API_BASE_URL}/game-sponsorship-payment`
  },
  v1: {
    USERS_SIGNUP: `${API_BASE_URL}/v1/users/signup`,
    USERS_SIGNIN_WITH_GOOGLE: `${API_BASE_URL}/v1/users/google-signin`,
    USERS_SEND_REFERRER_NOTIFICATION_EMAIL: `${API_BASE_URL}/v1/users/referrer-notification`,
    USERS_LOGIN: `${API_BASE_URL}/v1/users/login`,
    USERS_MOBILE_LOGIN: `${API_BASE_URL}/v1/users/mobile-login`,
    USERS_REFERRAL_INFO: `${API_BASE_URL}/v1/users/referral-info`,
    USER: `${API_BASE_URL}/v1/user`,
    EVENT_USER: `${API_BASE_URL}/v1/eventuser`,
    NETWORK: `${API_BASE_URL}/v1/network`,
    FEATURE: `${API_BASE_URL}/v1/feature`,
    GEO_FEATURE: `${API_BASE_URL}/v1/geo-feature`,
    USERS_AUDIENCE: `${API_BASE_URL}/v1/audience`,
    ROLE: `${API_BASE_URL}/v1/role`,
    GEO_ROLE: `${API_BASE_URL}/v1/geo-role`,
    USERS_SEND_EMAIL_OTP: `${API_BASE_URL}/v1/email`,
    USERS_VERIFY_EMAIL_OTP: `${API_BASE_URL}/v1/users/verifyemail`,
    USERS_SEND_PHONE_OTP: `${API_BASE_URL}/phone`,
    USERS_VERIFY_PHONE_OTP: `${API_BASE_URL}/users/verifyphone`,
    USERS_PROFILE: `${API_BASE_URL}/v1/profile`,
    USERS_QUIZ: `${API_BASE_URL}/v1/quiz`,
    USERS_GROUP: `${API_BASE_URL}/v1/group`,
    USERS_QUIZ_TRANSLATION: `${API_BASE_URL}/v1/translation`,
    USERS_CONTEXT: `${API_BASE_URL}/v1/context`,
    USERS_QUIZ_QUESTION: `${API_BASE_URL}/v1/question`,
    USERS_REFERRER_PROFILE: `${API_BASE_URL}/v1/profile/referrer`,
    ADMIN_ADD_ADVERTISEMENT: `${API_BASE_URL}/v1/advertisements`,
    ADMIN_GET_ADVERTISEMENT: `${API_BASE_URL}/v1/advertisements`,
    USERS_GAME: `${API_BASE_URL}/v1/game`,
    USERS_GAME_LIVE: `${API_BASE_URL}/v1/game-live`,
    REFER_EARN: `${API_BASE_URL}/v1/refer-earn`,
    CLEANUP: `${API_BASE_URL}/v1/cleanup`,
    VIDEOS: `${API_BASE_URL}/v1/videos`,
    ALERTS: `${API_BASE_URL}/v1/alerts`,
    USER_ALERTS: `${API_BASE_URL}/v1/user-alerts`,
    USER_LEARNING: `${API_BASE_URL}/v1/user-learning`,
    SPONSORSHIP: `${API_BASE_URL}/v1/sponsorship`,
    SPONSORSHIP_PAYMENT: `${API_BASE_URL}/v1/sponsorship-payment`,
    USERS_GROUP_REQUEST: `${API_BASE_URL}/v1/group-request`


    // Add more URLs for API version 1
  },
  v2: {
    USERS: `${API_BASE_URL}/v2/users`,
    POSTS: `${API_BASE_URL}/v2/posts`
    // Add more URLs for API version 2
  }
  // Add more API versions if needed
}
