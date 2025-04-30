import React from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'

import dynamic from 'next/dynamic'

const PaymentSuccess = dynamic(() => import('@/components/sponsor/PaymentSucess'), { ssr: false })
// import PaymentSuccess from '@/components/sponsor/PaymentSucess'

async function page({ searchParams }) {
  const { sponsorshipId, paymentId, amount } = searchParams

  const res = await RestApi.get(`${API_URLS.v0.SPONSORSHIP}?id=${sponsorshipId}`)

  console.log(res)
  return <PaymentSuccess sponsorship={res.result} paymentId={paymentId} amount={amount} />
}

export default page
