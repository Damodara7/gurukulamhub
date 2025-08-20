'use client'
import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GroupdetailsPage from '@/views/apps/groups/group-details'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function Page({ params }) {
  const { id } = params
  const [groupData, setGroupData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true)
        const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${id}`)
        if (result?.status === 'success') {
          setGroupData(result.result)
          console.log('groupdata in the group details page', result.result)
        } else {
          setError(result.message || 'Failed to fetch group data')
        }
      } catch (error) {
        console.error('Error fetching group:', error)
        setError('An error occurred while fetching group data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGroupData()
    }
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !groupData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>
          {error || 'No group found'}
        </Typography>
      </Box>
    )
  }

  return <GroupdetailsPage groupId={id} groupData={groupData} />
}
