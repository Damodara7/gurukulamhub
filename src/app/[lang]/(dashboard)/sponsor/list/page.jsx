import React from 'react'
import SponsorshipList from '@/components/sponsor/SponsorshipList'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import { auth } from '@/libs/auth'

export const dynamic = 'force-dynamic'

async function page({ searchParams }) {
  const session = await auth()
  const { sponsorType, filter } = searchParams

  let url = `${API_URLS.v0.SPONSORSHIP}?email=${session?.user?.email}`

  // Fetch completed sponsorships for both types and pending physical gift sponsorships
  if (filter === 'awaiting') {
    // For awaiting admin response tab - only pending physical gift sponsorships
    url += `&filter=awaiting`
  } else if (filter === 'rejected') {
    // For rejected tab - only rejected physical gift sponsorships
    url += `&filter=rejected`
  } else if (sponsorType === 'all' || !sponsorType) {
    // For all tab - completed sponsorships for both types, pending physical gift sponsorships, and rejected physical gift sponsorships
    url += `&status=completed,pending_physical_only,rejected_physical_only`
  } else {
    // For other specific tabs (game, quiz, area) - completed sponsorships for both types, pending physical gift sponsorships, and rejected physical gift sponsorships
    url += `&status=completed,pending_physical_only,rejected_physical_only`
  }

  if (sponsorType && sponsorType !== 'all') {
    url += `&sponsorType=${sponsorType}`
  }

  const res = await RestApi.get(url)

  console.log(res)
  return <SponsorshipList key={filter || sponsorType} tableData={res.result} sponsorType={sponsorType || 'all'} filter={filter} />
}

export default page
