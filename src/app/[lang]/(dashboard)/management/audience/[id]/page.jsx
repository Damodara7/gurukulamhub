'use client'
import React, { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import AudiencedetailsPage from '@/views/apps/audience/audience-details'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function Page({ params }) {
  const { id } = params
  const [audienceData, setAudienceData] = useState(null)
  const [gamesData, setGamesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch audience data and games data in parallel
        const [audienceResult, gamesResult] = await Promise.all([
          RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${id}`),
          RestApi.get(`${API_URLS.v0.USERS_GAME}?audienceId=${id}`)
        ])

        if (audienceResult?.status === 'success') {
          setAudienceData(audienceResult.result)
          console.log('audiencedata in the audience details page', audienceResult.result)
        } else {
          setError(audienceResult.message || 'Failed to fetch audience data')
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

  if (error || !audienceData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error'>
          {error || 'No audience found'}
        </Typography>
      </Box>
    )
  }

  return <AudiencedetailsPage audienceId={id} audienceData={audienceData} gamesData={gamesData} />
}
