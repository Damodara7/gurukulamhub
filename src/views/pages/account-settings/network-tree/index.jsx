import { Grid } from '@mui/material'
import React from 'react'
import NetworkTreeNodes from './NetworkTreeNodes'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { auth } from '@/libs/auth'

async function NetworkTree() {
  const session = await auth()
  const profileAndNetwork = await RestApi.get(`${ApiUrls.v0.NETWORK}/${session?.user?.email}`)
  console.log('Profile and network: ', profileAndNetwork?.result)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <NetworkTreeNodes networkData={profileAndNetwork?.result} />
      </Grid>
    </Grid>
  )
}

export default NetworkTree
