'use client'
import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import GroupdetailsPage from '@/views/apps/groups/group-details'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function Page({ params }) {
  const { id } = params
  const [groupData, setGroupData] = useState(null)
  const [gamesData, setGamesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch group data and games data in parallel
        const [groupResult, gamesResult] = await Promise.all([
          RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${id}`),
          RestApi.get(`${API_URLS.v0.USERS_GAME}?groupId=${id}`)
        ])

        if (groupResult?.status === 'success') {
          setGroupData(groupResult.result)
          console.log('groupdata in the group details page', groupResult.result)
        } else {
          setError(groupResult.message || 'Failed to fetch group data')
        }

        if (gamesResult?.status === 'success') {
          setGamesData(gamesResult.result || [])
        } else {
          console.warn('Failed to fetch games:', gamesResult.message)
          // Don't set error for games failure, just log warning
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
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

  return <GroupdetailsPage groupId={id} groupData={groupData} gamesData={gamesData} />
}
