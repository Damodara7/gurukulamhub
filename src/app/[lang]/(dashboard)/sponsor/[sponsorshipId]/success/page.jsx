import React from 'react'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import NonCashSponsorshipClient from '@/components/sponsor/NonCashSponsorshipClient'

async function Page({ params }) {
  const { sponsorshipId } = params

  if (!sponsorshipId) {
    return <NonCashSponsorshipClient errorType="missingId" />
  }

  try {
    const res = await RestApi.get(`${API_URLS.v0.SPONSORSHIP}?id=${sponsorshipId}`)
    
    if (res?.status === 'success') {
      return <NonCashSponsorshipClient sponsorship={res.result} />
    } else {
      return <NonCashSponsorshipClient errorType="notFound" sponsorshipId={sponsorshipId} message={res?.message} />
    }
  } catch (error) {
    console.log('Error fetching sponsorship:', error)
    return <NonCashSponsorshipClient errorType="serverError" message={error.message} />
  }
}

export default Page