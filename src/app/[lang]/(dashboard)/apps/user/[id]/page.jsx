import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import UserDetailsPage from '@/views/apps/user/user-details/user-details'
import React from 'react'

async function page({ params }) {
  const { id: userEmail } = params

  let userData = null
  
  try {

    const res = await RestApi.get(`${API_URLS.v0.USER}/${userEmail}`)

    if (res?.status === 'success') {
      userData = res?.result
    } else {
      return <p>Failed to Load user data!</p>
    }
  } catch (error) {
    return <p>{error?.message || 'Something went wrong!'}</p>
  }

  return (
      <UserDetailsPage data={userData} />
  )
}

export default page
