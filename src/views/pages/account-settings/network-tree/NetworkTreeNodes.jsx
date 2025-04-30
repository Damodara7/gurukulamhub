'use client'

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  Box,
  Badge,
  Tooltip
} from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react'
import EastIcon from '@mui/icons-material/East'
import UserBackgroundLetterAvatar from './UserBackgroundLetterAvatar'
import NetworkTreeTable from './NetworkTreeTable'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import Loading from '../security/Loading'
import TreeComponent from '@/components/TreeComponent'

function findUserByEmail(email, userNode) {
  if (userNode?.email === email) return userNode
  if (!Array.isArray(userNode?.network)) return null
  for (const friend of userNode?.network) {
    const result = findUserByEmail(email, friend)
    if (result) return result
  }
  return null
}

async function fetchUserProfileAndNetwork(email) {
  const profileAndNetwork = await RestApi.get(`${ApiUrls.v0.NETWORK}/${email}`)
  return profileAndNetwork
}

const StyledReferralPointsStack = ({ profileAndNetworkData }) => {
  return (
    <Stack
      alignItems='center'
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        animation: 'fadeIn 1s ease-in-out'
      }}
    >
      {/* Title */}
      <Typography
        variant='caption'
        sx={{
          fontWeight: 500,
          color: 'text.primary',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        My Referral Points
      </Typography>

      {/* Referral Points */}
      <Typography
        variant='h6'
        color='primary'
        sx={{
          fontWeight: 700,
          transform: 'scale(1)',
          transition: 'transform 0.3s ease, color 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            color: 'primary.main'
          }
        }}
      >
        {profileAndNetworkData?.referralPoints || 0}
      </Typography>
    </Stack>
  )
}

function NetworkTreeNodes({ networkData }) {
  const { data: session, status, update } = useSession()
  const [currentUserNodeEmail, setCurrentUserNodeEmail] = useState(session?.user?.email)
  const [profileAndNetworkData, setProfileAndNetworkData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parentUserNodes, setParentUserNodes] = useState([])

  const currentUserNode = useMemo(() => findUserByEmail(currentUserNodeEmail, networkData), [currentUserNodeEmail])

  function handleChangeNode(friendEmail) {
    console.log('Clicked node email: ', friendEmail)
    setParentUserNodes(prev => [...prev, currentUserNodeEmail])
    setCurrentUserNodeEmail(friendEmail)
  }

  function handleBackToParentNode() {
    setParentUserNodes(prev => {
      const newParentNodes = [...prev]
      const lastParentNodeEmail = newParentNodes.pop()
      setCurrentUserNodeEmail(lastParentNodeEmail)
      return newParentNodes
    })
  }

  function handleIconClick(nodeEmail, index) {
    console.log('Clicked node icon email: ', nodeEmail)
    setParentUserNodes(prev => prev.slice(0, index))
    setCurrentUserNodeEmail(nodeEmail)
  }

  useEffect(() => {
    async function fetchNetwork() {
      setLoading(true)
      const profileAndNetwork = await fetchUserProfileAndNetwork(session?.user?.email)
      console.log('Profile and network response: ', profileAndNetwork)
      if (profileAndNetwork?.status === 'success') {
        console.log('Profile and network fetched successfully: ', profileAndNetwork.result)
        setProfileAndNetworkData({
          ...profileAndNetwork.result
        })
      } else {
        console.error('Error fetching profile and network:', profileAndNetwork.message)
        // toast.error('Error fetching profile and network.')
        setError(profileAndNetwork.message)
      }
      setLoading(false)
    }
    fetchNetwork()
  }, [])

  if (loading) return <Loading />

  if (error) {
    return (
      <Alert severity='error'>
        <AlertTitle>Error occured!</AlertTitle>
        {error}
      </Alert>
    )
  }

  const referralPointsBoxStyles = {
    position: 'absolute',
    top: '-12px',
    left: '60%',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
  }

  // Recursion Use-Case
  function transformToNode(user) {
    return {
      name: user.name,
      email: user.email,
      referralPoints: user.referralPoints,
      children: user?.network?.length > 0 ? user.network.map(u => transformToNode(u)) : null
    }
  }

  const rootTree = transformToNode(networkData)

  return (
    <Card>
      <CardHeader
        title='My Network'
        style={{ alignItems: 'flex-start' }}
        action={<StyledReferralPointsStack profileAndNetworkData={profileAndNetworkData} />}
      />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} className='flex gap-1'>
            {parentUserNodes.map((nodeEmail, index) => (
              <Stack key={index} flexDirection='row' alignItems='center' gap={1} position='relative'>
                {/* Avatar with Referral Points */}
                <Box position='relative' display='inline-flex'>
                  <Tooltip placement='top' title={findUserByEmail(nodeEmail, networkData)?.name}>
                    <Box>
                      <UserBackgroundLetterAvatar
                        name={findUserByEmail(nodeEmail, networkData)?.name}
                        onClick={() => handleIconClick(nodeEmail, index)}
                        isCurrentNode={false}
                      />
                    </Box>
                  </Tooltip>
                  {/* Referral Points */}
                  <Tooltip
                    placement='top'
                    title={`Referral Points: ${findUserByEmail(nodeEmail, networkData)?.referralPoints}`}
                  >
                    <Box
                      sx={{
                        ...referralPointsBoxStyles,
                        backgroundColor: 'secondary.light'
                      }}
                    >
                      {findUserByEmail(nodeEmail, networkData)?.referralPoints}
                    </Box>
                  </Tooltip>
                </Box>
                <EastIcon fontSize='10px' />
              </Stack>
            ))}

            {/* Current User Node */}
            <Box position='relative' display='inline-flex'>
              <UserBackgroundLetterAvatar
                name={findUserByEmail(currentUserNodeEmail, networkData)?.name}
                isCurrentNode={true}
              />
              {/* Referral Points for Current User */}
              <Tooltip
                placement='top'
                title={`Referral Points: ${findUserByEmail(currentUserNodeEmail, networkData)?.referralPoints}`}
              >
                <Box
                  sx={{
                    ...referralPointsBoxStyles,
                    backgroundColor: 'primary.main'
                  }}
                >
                  {findUserByEmail(currentUserNodeEmail, networkData)?.referralPoints}
                </Box>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        {/* {!currentUserNode || !currentUserNode.network || currentUserNode.network.length === 0 ? (
          <p>{currentUserNodeName} has no network.</p>
        ) : (
          <NetworkTreeTable currentUserNode={currentUserNode} handleChangeNode={handleChangeNode} />
        )} */}
        <NetworkTreeTable currentUserNode={currentUserNode} handleChangeNode={handleChangeNode} />

        <Typography color='primary.main' variant='h5'>
          Your Network Tree
        </Typography>
        <Box
          width='100%'
          height='400px'
          overflow='auto'
          backgroundColor='rgba(0,4,0,0.05)'
          border='1px solid gray'
          borderRadius='5px'
          padding='10px'
        >
          <TreeComponent tree={rootTree} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default NetworkTreeNodes
