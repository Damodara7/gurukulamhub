import Payment from '@/components/sponsor/Payment'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import React from 'react'

async function page({params}) {
  const {sponsorshipId} = params

  const res = await RestApi.get(`${API_URLS.v0.SPONSORSHIP}?id=${sponsorshipId}`)

  console.log(res)

  return (
    <Payment sponsorship={res.result}/>
  )
}

export default page