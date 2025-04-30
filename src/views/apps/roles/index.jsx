'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Component Imports
import RoleCards from './RoleCards'
import RolesTable from './RolesTable'
import { useEffect, useState } from 'react'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'

const Roles = ({}) => {
  const [users, setUsers] = useState([])

  const getUsersData = async () => {
    console.log('Fetching Users Data now...')

    try {
      const result = await RestApi.get(API_URLS.v0.USER) // Change this to the correct endpoint for users
      // const result = await clientApi.getAllUsers()
      if (result?.status === 'success') {
        console.log('Users Fetched result', result)
        setUsers(result?.result || []) // Store the fetched users data
      } else {
        console.log('Error:' + result?.message)
        console.log('Error Fetching users:', result)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    getUsersData() // Call the updated function to fetch users data
  }, [])

  async function refreshUsers() {
    await getUsersData() // Call fetchUsers to refresh users
  }
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h5' className='mbe-1'>
          Roles List
        </Typography>
        <Typography>
          A role provided access to predefined menus and features so that depending on assigned role an administrator
          can have access to what he need
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RoleCards />
      </Grid>
      <Grid item xs={12} className='!pbs-12'>
        <Typography variant='h5' className='mbe-1'>
          Total users with their roles
        </Typography>
        <Typography>Find all of your company&#39;s administrator accounts and their associate roles.</Typography>
      </Grid>
      <Grid item xs={12}>
        <RolesTable tableData={users} refreshUsers={refreshUsers} />
      </Grid>
    </Grid>
  )
}

export default Roles
