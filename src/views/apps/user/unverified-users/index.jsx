'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const formatDate = value => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

const getFullName = user => {
  const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim()
  return fullName || '-'
}

const UnverifiedUsersManagement = () => {
  const theme = useTheme()
  const [users, setUsers] = useState([])
  const [cleanupEligibleCount, setCleanupEligibleCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCleaning, setIsCleaning] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const filteredUsers = users.filter(user => {
    if (filterType === 'gt24') return user.isCleanupEligible
    if (filterType === 'lt24') return !user.isCleanupEligible
    return true
  })

  const fetchUnverifiedUsers = async () => {
    setIsLoading(true)
    try {
      const response = await RestApi.get(API_URLS.v0.CLEANUP_UNVERIFIED_USERS)
      if (response?.status === 'success') {
        const payload = response?.result || {}
        setUsers(payload?.users || [])
        setCleanupEligibleCount(payload?.cleanupEligibleCount || 0)
      } else {
        setUsers([])
        setCleanupEligibleCount(0)
        if (response?.message) toast.error(response.message)
      }
    } catch (error) {
      setUsers([])
      setCleanupEligibleCount(0)
      toast.error('Failed to fetch unverified users')
      console.error('Failed to fetch unverified users: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanup = async () => {
    setIsCleaning(true)
    try {
      const response = await RestApi.post(API_URLS.v0.CLEANUP)
      if (response?.status === 'success') toast.success(response?.message || 'Cleanup completed successfully')
      else toast.error(response?.message || 'Cleanup failed')
      await fetchUnverifiedUsers()
    } catch (error) {
      toast.error('Cleanup failed')
      console.error('Cleanup failed: ', error)
    } finally {
      setIsCleaning(false)
    }
  }

  useEffect(() => {
    fetchUnverifiedUsers()
  }, [])

  const waitingCount = users.length - cleanupEligibleCount

  const filterButtons = [
    { key: 'all', label: `All (${users.length})` },
    { key: 'gt24', label: `>24 hrs (${cleanupEligibleCount})` },
    { key: 'lt24', label: `<24 hrs (${waitingCount})` }
  ]

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-user-unfollow-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Unverified Users
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Monitor verification backlog, filter by age, and run manual cleanup from one place.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: { xs: 3, md: 4 } }}>
        <Container maxWidth='lg'>
          <Grid container spacing={{ xs: 3, sm: 4, md: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='caption' color='text.secondary'>
                    Total Unverified
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {users.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='caption' color='text.secondary'>
                    Eligible (&gt;24 hrs)
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 700, color: cleanupEligibleCount > 0 ? 'warning.main' : 'text.primary' }}>
                    {cleanupEligibleCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='caption' color='text.secondary'>
                    Waiting (&lt;24 hrs)
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 700, color: 'info.main' }}>
                    {waitingCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent='space-between' sx={{ mb: 2 }}>
                    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                      {filterButtons.map(button => (
                        <Chip
                          key={button.key}
                          clickable
                          label={button.label}
                          onClick={() => setFilterType(button.key)}
                          color={filterType === button.key ? 'primary' : 'default'}
                          variant={filterType === button.key ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Stack>

                    <Stack direction='row' spacing={1.2} alignItems='center'>
                      <Chip color={cleanupEligibleCount > 0 ? 'warning' : 'default'} label={`${cleanupEligibleCount} pending cleanup`} sx={{ fontWeight: 600 }} />
                      <Button
                        variant='contained'
                        color='error'
                        onClick={handleCleanup}
                        disabled={isCleaning || cleanupEligibleCount === 0}
                        startIcon={isCleaning ? <CircularProgress size={16} color='inherit' /> : <i className='ri-delete-bin-6-line' />}
                      >
                        {isCleaning ? 'Cleaning...' : 'Cleanup Now'}
                      </Button>
                    </Stack>
                  </Stack>

                  {isLoading ? (
                    <Stack alignItems='center' justifyContent='center' sx={{ py: 8 }}>
                      <CircularProgress />
                    </Stack>
                  ) : users.length === 0 ? (
                    <Alert severity='success'>No unverified users found.</Alert>
                  ) : filteredUsers.length === 0 ? (
                    <Alert severity='info'>No users match the selected filter.</Alert>
                  ) : (
                    <Stack spacing={2}>
                      <Alert severity={cleanupEligibleCount > 0 ? 'warning' : 'info'}>
                        {cleanupEligibleCount > 0
                          ? `${cleanupEligibleCount} user(s) are eligible for cleanup (older than 24 hours).`
                          : 'No users are eligible for cleanup yet (less than 24 hours old).'}
                      </Alert>
                      <TableContainer sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.4)}`, borderRadius: 2 }}>
                        <Table size='small'>
                          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredUsers.map(user => (
                              <TableRow key={user._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                <TableCell>{getFullName(user)}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                <TableCell>
                                  <Chip
                                    size='small'
                                    color={user.isCleanupEligible ? 'warning' : 'default'}
                                    label={user.isCleanupEligible ? 'Cleanup Eligible' : 'Waiting (<24h)'}
                                    variant={user.isCleanupEligible ? 'filled' : 'outlined'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default UnverifiedUsersManagement
