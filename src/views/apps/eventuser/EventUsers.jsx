'use client'

import React, { useEffect, useState } from 'react'
import EventUserTable from '@/components/eventuser/EventUserTable'
import * as RestApi from '@/utils/restApiUtil' // Assuming RestApi and ApiUrls are defined
import { API_URLS } from '@/configs/apiConfig'

function EventUsers() {
  const [usersData, setUsersData] = useState([])

  // Fetch the Event users from the API
  const getEventUsersData = async () => {
    console.log('Fetching Event users Data now...')
    const result = await RestApi.get(API_URLS.v0.EVENT_USER) // Adjust this to your correct endpoint
    if (result?.status === 'success') {
      console.log('Event users Fetched result', result)
      setUsersData(result?.result || [])
    } else {
      console.log('Error:', result?.message)
    }
  }

  useEffect(() => {
    getEventUsersData()
  }, [])

  return <EventUserTable refreshData={getEventUsersData} data={usersData} />
}

export default EventUsers
