'use client'
// Component Imports
import AdvList from '@/views/apps/advertisements/list/AdvList'
/********** Standard imports.*********************/
import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import CenterBox from '@components/CenterBox'
import Typography from '@mui/material/Typography'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
/********************************************/

const AdvtListApp = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true)
        const result = await RestApi.get(ApiUrls.v0.ADMIN_GET_ADVERTISEMENT)

        if (result?.status === 'success') {
          toast.success('Advertisements fetched successfully.')
          setData(result.result || [])
        } else {
          toast.error(`Error: ${result?.message || 'Unable to fetch advertisements'}`)
          setData([])
        }
      } catch (error) {
        console.error('Error while fetching advertisements', error)
        toast.error('An unexpected error occurred while fetching advertisements')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [])

  if (loading) {
    return (
      <CenterBox
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          px: { xs: 2, sm: 4 },
          textAlign: 'center'
        }}
      >
        <Typography variant='body1' sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, fontWeight: 500 }}>
          Fetching advertisements. Please wait...
        </Typography>
      </CenterBox>
    )
  }

  return (
    <Box
      component='section'
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme => theme.palette.background.default,
      }}
    >
      <AdvList tableData={data} />
    </Box>
  )
}

export default AdvtListApp
