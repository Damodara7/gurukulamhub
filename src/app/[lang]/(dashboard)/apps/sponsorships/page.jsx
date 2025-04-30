import React from 'react'
import AdminSponsorshipList from '@/views/apps/sponsorships/AdminSponsorshipList'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'

export const dynamic = 'force-dynamic'

async function page({ searchParams }) {
  const { sponsorType, sponsorshipStatus } = searchParams

  let url = `${API_URLS.v0.SPONSORSHIP}`
  const params = []

  if (sponsorType) {
    params.push(`sponsorType=${sponsorType}`)
  }
  if (sponsorshipStatus) {
    params.push(`sponsorshipStatus=${sponsorshipStatus}`)
  }

  // Only add ? if there are any parameters
  if (params.length > 0) {
    url += `?${params.join('&')}`
  }

  const res = await RestApi.get(url)

  console.log(res)
  return (
    <AdminSponsorshipList
      key={`${sponsorType}-${sponsorshipStatus}`}
      tableData={res.result}
      sponsorType={sponsorType || 'all'}
      sponsorshipStatus={sponsorshipStatus || 'all'}
    />
  )
}

export default page