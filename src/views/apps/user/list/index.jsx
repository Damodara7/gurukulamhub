'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserListTable from './UserListTable'
import UserListCards from './UserListCards'
import { useEffect, useState } from 'react'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '@/app/api/client/client.api'

const UserList = ({ userData }) => {
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
        <UserListCards users={users} />
      </Grid>
      <Grid item xs={12}>
        <UserListTable tableData={users} refreshUsers={refreshUsers} />
      </Grid>
    </Grid>
  )
}

export default UserList
