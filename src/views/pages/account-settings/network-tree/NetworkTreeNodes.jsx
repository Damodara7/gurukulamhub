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
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react'
import EastIcon from '@mui/icons-material/East'
import UserBackgroundLetterAvatar from './UserBackgroundLetterAvatar'
import NetworkTreeTable from './NetworkTreeTable'
import { useSession } from 'next-auth/react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import Loading from '../security/Loading'
import TreeComponent from '@/components/TreeComponent'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { useParams, useRouter } from 'next/navigation'

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

const StyledReferralPointsStack = ({ profileAndNetworkData, isDarkMode, theme }) => {
  return (
    <Stack
      spacing={0.75}
      sx={{
        backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'background.paper',
        borderRadius: { xs: 1.5, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
        animation: 'fadeIn 1s ease-in-out'
      }}
    >
      <Typography
        variant='caption'
        sx={{
          fontWeight: 500,
          color: isDarkMode ? alpha(theme.palette.common.white, 0.8) : 'text.primary',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontSize: { xs: '0.65rem', sm: '0.75rem' }
        }}
      >
        My Points
      </Typography>

      <Stack direction='column' spacing={0.5} alignItems='flex-start'>
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.78rem', sm: '0.85rem' },
            color: isDarkMode ? alpha(theme.palette.common.white, 0.9) : 'text.primary'
          }}
        >
          Referral Points:{' '}
          <Typography component='span' color='primary.main'>
            {profileAndNetworkData?.referralPoints || 0}
          </Typography>
        </Typography>
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.78rem', sm: '0.85rem' },
            color: isDarkMode ? alpha(theme.palette.common.white, 0.9) : 'text.primary'
          }}
        >
          Game Points:{' '}
          <Typography component='span' color='secondary.main'>
            {profileAndNetworkData?.totalGamePoints || 0}
          </Typography>
        </Typography>
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.78rem', sm: '0.85rem' },
            color: isDarkMode ? alpha(theme.palette.common.white, 0.9) : 'text.primary'
          }}
        >
          Learning Points:{' '}
          <Typography component='span' color='success.main'>
            {profileAndNetworkData?.totalLearningPoints || 0}
          </Typography>
        </Typography>
      </Stack>
    </Stack>
  )
}

function NetworkTreeNodes({ networkData }) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()
  const { lang: locale } = useParams()
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
    <Card
      sx={{
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
        borderRadius: { xs: 1.5, sm: 2 },
        boxShadow: isDarkMode ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}` : '0 2px 12px rgba(0,0,0,0.04)'
      }}
    >
      <CardHeader
        title={
          <Typography
            variant='h6'
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              color: isDarkMode ? theme.palette.common.white : 'text.primary',
              fontWeight: 700
            }}
          >
            My Network
          </Typography>
        }
        sx={{ alignItems: 'flex-start' }}
        action={
          <StyledReferralPointsStack
            profileAndNetworkData={profileAndNetworkData}
            isDarkMode={isDarkMode}
            theme={theme}
          />
        }
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
                    title={`Referral Points: ${
                      findUserByEmail(nodeEmail, networkData)?.referralPoints || 0
                    } | Game Points: ${findUserByEmail(nodeEmail, networkData)?.totalGamePoints || 0} | Learning Points: ${
                      findUserByEmail(nodeEmail, networkData)?.totalLearningPoints || 0
                    }`}
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
                title={`Referral Points: ${
                  findUserByEmail(currentUserNodeEmail, networkData)?.referralPoints || 0
                } | Game Points: ${findUserByEmail(currentUserNodeEmail, networkData)?.totalGamePoints || 0} | Learning Points: ${
                  findUserByEmail(currentUserNodeEmail, networkData)?.totalLearningPoints || 0
                }`}
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
          sx={{
            width: '100%',
            height: { xs: '300px', sm: '400px' },
            overflow: 'auto',
            backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : 'rgba(0,4,0,0.05)',
            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`,
            borderRadius: { xs: 1, sm: 1.25 },
            padding: { xs: 1.5, sm: 2 }
          }}
        >
          <TreeComponent tree={rootTree} />
        </Box>
      </CardContent>
      {/* Referral Points Distribution */}
      <Card
        sx={{
          borderRadius: { xs: 1.5, sm: 2 },
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 2px 12px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}
        >
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant='h6' fontWeight={700}>
              Referral Points Distribution
            </Typography>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={1.75}>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }, lineHeight: 1.65 }}
            >
              Invite more friends to grow your network tree and gain more referral points. Once your friend completes
              registration, they are added to your network automatically.
            </Typography>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' }, lineHeight: 1.65 }}
            >
              Their Network Level (NWL) is calculated as:
              <strong> NWL = Referrer NWL + 1</strong>
            </Typography>

            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1.5,
                bgcolor: isDarkMode ? alpha(theme.palette.primary.main, 0.14) : alpha(theme.palette.primary.main, 0.08),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.45)}`
              }}
            >
              <Stack spacing={0.75}>
                <Typography variant='subtitle2' fontWeight={700}>
                  Points are distributed up the referral chain:
                </Typography>
                <Typography variant='body2'>Level 1 (Direct Referrer): 500 points</Typography>
                <Typography variant='body2'>Level 2 (Referrer&apos;s Referrer): 250 points</Typography>
                <Typography variant='body2'>Level 3: 125 points</Typography>
                <Typography variant='body2'>Level 4: 62.5 points</Typography>
              </Stack>
            </Box>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.85rem', sm: '0.88rem', md: '0.92rem' }, lineHeight: 1.65 }}
            >
              The reward halves at each next level (500, 250, 125, 62.5, ...), so everyone in your active network
              benefits when new members join.
            </Typography>

            <Box sx={{ pt: 0.5 }}>
              <Button
                variant='contained'
                color='primary'
                component='label'
                onClick={() => router.push(`/${locale}/pages/dialog-examples`)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                Refer & Earn
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Card>
  )
}

export default NetworkTreeNodes
