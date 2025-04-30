import React from 'react'
import SponsorshipList from '@/components/sponsor/SponsorshipList'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { auth } from '@/libs/auth'

export const dynamic = 'force-dynamic'

async function page({ searchParams }) {
  const session = await auth()
  const { sponsorType } = searchParams

  let url = `${API_URLS.v0.SPONSORSHIP}?email=${session?.user?.email}&sponsorshipStatus=completed`

  if (sponsorType) {
    url += `&sponsorType=${sponsorType}`
  }

  const res = await RestApi.get(url)

  console.log(res)
  return <SponsorshipList key={sponsorType} tableData={res.result} sponsorType={sponsorType || 'all'} />
}

export default page
