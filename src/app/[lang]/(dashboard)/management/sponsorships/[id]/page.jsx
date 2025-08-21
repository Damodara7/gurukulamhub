import React from 'react'
import SponsorshipDetailPage from '@/views/apps/sponsorships/admin-sponsorship-details'

export default async function page({params}) {
  const {id} = params

  return (
    <SponsorshipDetailPage id={id} />
  )
}
