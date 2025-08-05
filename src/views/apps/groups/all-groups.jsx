'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Box } from '@mui/material'

const AllGroupsPage = ( ) => {
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const fechGroups = async () => {
    setLoading(true)
    try {
      let url = `${API_URLS.v0.USERS_GROUP}`
      const result = await RestApi.get(url)
      if (result?.status === 'success') {
        setGroups(result.result || [])
        console.log('groups data ', result.result)
      } else {
        console.error('Error fetching groups:', result)
        toast.error('Failed to load groups')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('An error occurred while loading groups')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fechGroups()
  }, [])




  return (
    <>
      <Box className='flex flex-col items-center gap-5'>
        
      </Box>
    </>
  )
}

export default AllGroupsPage
