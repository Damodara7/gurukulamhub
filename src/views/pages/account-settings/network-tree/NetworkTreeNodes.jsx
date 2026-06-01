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
  useMediaQuery,
  Chip,
  TablePagination
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
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from '@/libs/Recharts'

const formatDateTime = value => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

const statusToChipColor = status => {
  if (status === 'Joined & Verified') return 'success'
  if (status === 'Joined but Unverified') return 'warning'
  if (status === 'Not Joined Yet') return 'default'
  return 'info'
}

const DEFAULT_REFERRAL_SETTINGS = {
  directReferrerPoints: 500,
  maxDistributionLevels: 4,
  promotionPointsThreshold: 1000
}

const buildDistributionLevels = ({ directReferrerPoints, maxDistributionLevels }) => {
  const direct = Math.max(0, Number(directReferrerPoints) || 0)
  const levels = Math.max(1, Number(maxDistributionLevels) || 1)
  return Array.from({ length: levels }, (_, index) => ({
    level: index + 1,
    points: direct / Math.pow(2, index)
  }))
}

const formatDateLabel = value =>
  new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short'
  })

const buildReferralTrend = referralHistory => {
  const items = Array.isArray(referralHistory?.items) ? referralHistory.items : []
  const sentByDate = new Map()
  const successByDate = new Map()

  items.forEach(item => {
    if (item?.lastSentAt) {
      const key = new Date(item.lastSentAt).toISOString().slice(0, 10)
      sentByDate.set(key, (sentByDate.get(key) || 0) + Math.max(1, Number(item.sentCount || 1)))
    }
    if (item?.joinedAt && (item.status === 'Joined & Verified' || item.status === 'Joined but Unverified')) {
      const key = new Date(item.joinedAt).toISOString().slice(0, 10)
      successByDate.set(key, (successByDate.get(key) || 0) + 1)
    }
  })

  const allDates = [...new Set([...sentByDate.keys(), ...successByDate.keys()])].sort()
  const categories = allDates.map(date => formatDateLabel(date))

  return {
    categories: categories.filter(Boolean),
    sentSeries: allDates.map(date => {
      const value = Number(sentByDate.get(date) || 0)
      return Number.isFinite(value) ? value : 0
    }),
    successSeries: allDates.map(date => {
      const value = Number(successByDate.get(date) || 0)
      return Number.isFinite(value) ? value : 0
    })
  }
}

const flattenNetworkUsers = rootNode => {
  if (!rootNode) return []
  const output = []
  const walk = node => {
    const children = Array.isArray(node?.network) ? node.network : []
    children.forEach(child => {
      output.push(child)
      walk(child)
    })
  }
  walk(rootNode)
  return output
}

const getTotalQuizPoints = user => Number(user?.totalQuizPoints || 0)
const getComputedCumulativePoints = user =>
  Number(
    user?.cumulativePoints ??
      (Number(user?.referralPoints || 0) +
        Number(user?.totalGamePoints || 0) +
        Number(user?.totalLearningPoints || 0) +
        getTotalQuizPoints(user))
  )

const ReferralStatsChartsSection = ({ rootData, isDarkMode, theme }) => {
  const referralTrend = useMemo(() => buildReferralTrend(rootData?.referralHistory), [rootData?.referralHistory])
  const networkUsers = useMemo(() => flattenNetworkUsers(rootData), [rootData])

  const networkSummary = useMemo(() => {
    const total = networkUsers.length
    const verified = networkUsers.filter(user => Boolean(user?.isVerified)).length
    const unverified = Math.max(0, total - verified)
    const totalReferralPoints = networkUsers.reduce((sum, user) => sum + Number(user?.referralPoints || 0), 0)
    const totalQuizPoints = networkUsers.reduce((sum, user) => sum + getTotalQuizPoints(user), 0)
    const totalCumulativePoints = networkUsers.reduce((sum, user) => sum + getComputedCumulativePoints(user), 0)
    return { total, verified, unverified, totalReferralPoints, totalQuizPoints, totalCumulativePoints }
  }, [networkUsers])

  const topUsers = useMemo(
    () =>
      [...networkUsers]
        .sort((a, b) => getComputedCumulativePoints(b) - getComputedCumulativePoints(a))
        .slice(0, 5),
    [networkUsers]
  )

  const sanitizedCategories = Array.isArray(referralTrend.categories) ? referralTrend.categories.filter(Boolean) : []
  const sanitizedSentSeries = Array.isArray(referralTrend.sentSeries)
    ? referralTrend.sentSeries.map(value => (Number.isFinite(Number(value)) ? Number(value) : 0))
    : []
  const sanitizedSuccessSeries = Array.isArray(referralTrend.successSeries)
    ? referralTrend.successSeries.map(value => (Number.isFinite(Number(value)) ? Number(value) : 0))
    : []

  const chartLength = Math.min(sanitizedCategories.length, sanitizedSentSeries.length, sanitizedSuccessSeries.length)
  const chartCategories = sanitizedCategories.slice(0, chartLength)
  const chartSentSeries = sanitizedSentSeries.slice(0, chartLength)
  const chartSuccessSeries = sanitizedSuccessSeries.slice(0, chartLength)
  const canRenderTrendChart = chartLength > 0
  const chartData = useMemo(
    () =>
      chartCategories.map((label, index) => ({
        label,
        referralsSent: chartSentSeries[index] || 0,
        successfulJoins: chartSuccessSeries[index] || 0
      })),
    [chartCategories, chartSentSeries, chartSuccessSeries]
  )

  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: { xs: 1.5, sm: 2 },
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
        boxShadow: isDarkMode ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}` : '0 2px 12px rgba(0,0,0,0.04)'
      }}
    >
      <CardHeader title='Referral & Network Stats' subheader='Track your referral performance over time and network quality.' />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <Typography variant='caption'>Network Users</Typography>
              <Typography variant='h6'>{networkSummary.total}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
              <Typography variant='caption'>Verified</Typography>
              <Typography variant='h6'>{networkSummary.verified}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <Typography variant='caption'>Unverified</Typography>
              <Typography variant='h6'>{networkSummary.unverified}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
              <Typography variant='caption'>Referral Points (Network)</Typography>
              <Typography variant='h6'>{Number(networkSummary.totalReferralPoints.toFixed(2))}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <Typography variant='caption'>Quiz Points (Network)</Typography>
              <Typography variant='h6'>{Number(networkSummary.totalQuizPoints.toFixed(2))}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
              <Typography variant='caption'>Cumulative Points</Typography>
              <Typography variant='h6'>{Number(networkSummary.totalCumulativePoints.toFixed(2))}</Typography>
            </Box>
          </Grid>
        </Grid>

        {canRenderTrendChart ? (
          <Box sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, borderRadius: 2, p: 1.5 }}>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 14, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey='label' tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    background: theme.palette.background.paper
                  }}
                />
                <Legend />
                <Line type='monotone' dataKey='referralsSent' name='Referrals Sent' stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type='monotone' dataKey='successfulJoins' name='Successful Joins' stroke={theme.palette.success.main} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Alert severity='info' sx={{ mb: 2 }}>
            No referral trend data yet.
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
            Top Users in Your Network
          </Typography>
          {topUsers.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No network users found yet.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                      Name
                    </th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                      Email
                    </th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                      Quiz Points
                    </th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                      Cumulative Points
                    </th>
                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                      Referral Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map(user => (
                    <tr key={user.email}>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                        {user?.name || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Unknown'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                        {user?.email || '-'}
                      </td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                        {getTotalQuizPoints(user)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                        {getComputedCumulativePoints(user)}
                      </td>
                      <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                        {Number(user?.referralPoints || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

const ReferralHistorySection = ({ referralHistory, isDarkMode, theme }) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const summary = referralHistory?.summary || {
    totalSent: 0,
    joinedAndVerified: 0,
    joinedButUnverified: 0,
    notJoinedYet: 0
  }
  const items = Array.isArray(referralHistory?.items) ? referralHistory.items : []
  const paginatedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: { xs: 1.5, sm: 2 },
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
        boxShadow: isDarkMode ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}` : '0 2px 12px rgba(0,0,0,0.04)'
      }}
    >
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            My Referral History
          </Typography>
        }
        subheader='Track who joined, who is still unverified, and who has not joined yet.'
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <Typography variant='caption'>Total referrals sent</Typography>
              <Typography variant='h6'>{summary.totalSent || 0}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08) }}>
              <Typography variant='caption'>Joined & verified</Typography>
              <Typography variant='h6'>{summary.joinedAndVerified || 0}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
              <Typography variant='caption'>Joined but unverified</Typography>
              <Typography variant='h6'>{summary.joinedButUnverified || 0}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.12) }}>
              <Typography variant='caption'>Not joined yet</Typography>
              <Typography variant='h6'>{summary.notJoinedYet || 0}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                  Referred To
                </th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                  Status
                </th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                  Sent Count
                </th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                  Last Sent
                </th>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.45)}` }}>
                  Joined At
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '14px', textAlign: 'center', color: theme.palette.text.secondary }}>
                    No referral history available yet.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => (
                  <tr key={`${item.inviteeEmail}-${item.lastSentAt || ''}`}>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                      <Stack spacing={0.25}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {item.inviteeName || 'Unknown'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {item.inviteeEmail}
                        </Typography>
                      </Stack>
                    </td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                      <Chip size='small' label={item.status} color={statusToChipColor(item.status)} variant='outlined' />
                    </td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                      {item.sentCount || 1}
                    </td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                      {formatDateTime(item.lastSentAt)}
                    </td>
                    <td style={{ padding: '10px', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}` }}>
                      {formatDateTime(item.joinedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
        {items.length > 0 && (
          <TablePagination
            component='div'
            rowsPerPageOptions={[5, 10, 25]}
            count={items.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={event => {
              setRowsPerPage(parseInt(event.target.value, 10))
              setPage(0)
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

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
  const totalReferralPoints = Number(profileAndNetworkData?.referralPoints || 0)
  const totalGamePoints = Number(profileAndNetworkData?.totalGamePoints || 0)
  const totalLearningPoints = Number(profileAndNetworkData?.totalLearningPoints || 0)
  const totalQuizPoints = getTotalQuizPoints(profileAndNetworkData)
  const cumulativePoints =
    profileAndNetworkData?.cumulativePoints ??
    totalReferralPoints + totalGamePoints + totalLearningPoints + totalQuizPoints

  const labelSx = {
    fontWeight: 600,
    fontSize: { xs: '0.78rem', sm: '0.85rem' },
    color: isDarkMode ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
    whiteSpace: 'nowrap'
  }

  const valueSx = bold => ({
    fontWeight: bold ? 700 : 600,
    fontSize: { xs: '0.78rem', sm: '0.85rem' },
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 36
  })

  const pointRows = [
    { label: 'Referral Points:', value: profileAndNetworkData?.referralPoints || 0, color: 'primary.main' },
    { label: 'Game Points:', value: profileAndNetworkData?.totalGamePoints || 0, color: 'secondary.main' },
    { label: 'Learning Points:', value: profileAndNetworkData?.totalLearningPoints || 0, color: 'success.main' },
    { label: 'Quiz Points:', value: totalQuizPoints, color: 'info.main' },
    { label: 'Cumulative:', value: Number(cumulativePoints || 0), color: 'success.main', bold: true }
  ]

  return (
    <Stack
      spacing={0.75}
      alignItems='center'
      sx={{
        backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'background.paper',
        borderRadius: { xs: 1.5, sm: 2 },
        p: { xs: 1, sm: 1.5 },
        border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
        animation: 'fadeIn 1s ease-in-out',
        width: 'fit-content',
        maxWidth: '100%'
      }}
    >
      <Typography
        variant='caption'
        sx={{
          fontWeight: 500,
          color: isDarkMode ? alpha(theme.palette.common.white, 0.8) : 'text.primary',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontSize: { xs: '0.65rem', sm: '0.75rem' },
          textAlign: 'center',
          width: '100%'
        }}
      >
        My Points
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          columnGap: 0.75,
          rowGap: 0.5,
          alignItems: 'center'
        }}
      >
        {pointRows.map(({ label, value, color, bold }) => (
          <React.Fragment key={label}>
            <Typography variant='body2' sx={{ ...labelSx, fontWeight: bold ? 700 : labelSx.fontWeight }}>
              {label}
            </Typography>
            <Typography variant='body2' color={color} sx={valueSx(bold)}>
              {value}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
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
  const [referralSettings, setReferralSettings] = useState(DEFAULT_REFERRAL_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parentUserNodes, setParentUserNodes] = useState([])
  const distributionLevels = useMemo(() => buildDistributionLevels(referralSettings), [referralSettings])

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

  useEffect(() => {
    async function fetchReferralSettings() {
      try {
        const response = await RestApi.get(API_URLS.v0.REFERRAL_SETTINGS)
        if (response?.status === 'success' && response?.result) {
          setReferralSettings({
            directReferrerPoints: Number(
              response.result.directReferrerPoints ?? DEFAULT_REFERRAL_SETTINGS.directReferrerPoints
            ),
            maxDistributionLevels: Number(
              response.result.maxDistributionLevels ?? DEFAULT_REFERRAL_SETTINGS.maxDistributionLevels
            ),
            promotionPointsThreshold: Number(
              response.result.promotionPointsThreshold ?? DEFAULT_REFERRAL_SETTINGS.promotionPointsThreshold
            )
          })
        }
      } catch (settingsError) {
        console.error('Failed to fetch referral settings for network tree view:', settingsError)
      }
    }
    fetchReferralSettings()
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
                    } | Quiz Points: ${getTotalQuizPoints(findUserByEmail(nodeEmail, networkData))} | Cumulative: ${getComputedCumulativePoints(findUserByEmail(nodeEmail, networkData))}`}
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
                } | Quiz Points: ${getTotalQuizPoints(findUserByEmail(currentUserNodeEmail, networkData))} | Cumulative: ${getComputedCumulativePoints(findUserByEmail(currentUserNodeEmail, networkData))}`}
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
        <ReferralHistorySection
          referralHistory={profileAndNetworkData?.referralHistory || networkData?.referralHistory}
          isDarkMode={isDarkMode}
          theme={theme}
        />
        <ReferralStatsChartsSection
          rootData={profileAndNetworkData || networkData}
          isDarkMode={isDarkMode}
          theme={theme}
        />
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
                {distributionLevels.map(item => (
                  <Typography key={item.level} variant='body2'>
                    Level {item.level}
                    {item.level === 1 ? ' (Direct Referrer)' : ''}: {Number(item.points.toFixed(2))} points
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.85rem', sm: '0.88rem', md: '0.92rem' }, lineHeight: 1.65 }}
            >
              The reward halves at each next level starting from {Number(referralSettings.directReferrerPoints || 0)}{' '}
              points for the direct referrer, up to {Number(referralSettings.maxDistributionLevels || 1)} levels.
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.85rem', sm: '0.88rem', md: '0.92rem' }, lineHeight: 1.65 }}
            >
              Threshold Rule: For every {Number(referralSettings.promotionPointsThreshold || 0)} referral points earned,
              you unlock +1 extra distribution level (beyond base max levels).
            </Typography>

            <Box sx={{ pt: 0.5 }}>
              <Button
                variant='contained'
                color='primary'
                component='label'
                onClick={() => router.push(`/${locale}/refer-earn`)}
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
