'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import GroupCard from '@/components/group/GroupCard'
import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, CircularProgress, Container, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

const AllGroupPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Note: Individual handlers removed - WebSocket now updates entire state directly

  const fetchGroup = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        setGroups(res.result || [])
        console.log('total group data', res.result)
      } else {
        console.error('Error fetching group:', res)
        toast.error('Failed to load group')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      toast.error('An error occurred while loading group')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroup()
  }, [])

  // WebSocket connection for groups list updates
  useEffect(() => {
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/groups`
        : ''
    if (wsUrl) {
      const wsRef = new WebSocket(wsUrl)
      wsRef.onopen = () => {
        console.log('[WS] AllGroupPage connected to groups list updates')
        setIsConnected(true)
        setSocket(wsRef)
      }
      wsRef.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'groupsList') {
            console.log('[WS] AllGroupPage received groups list update:', msg.data)

            // Update groups state directly (like games do) - no refresh feeling
            setGroups(msg.data || [])
          }
        } catch (e) {
          console.error('[WS] AllGroupPage error parsing groups list message', e)
        }
      }
      wsRef.onerror = err => {
        console.error('[WS] AllGroupPage groups list error', err)
        setIsConnected(false)
      }
      wsRef.onclose = () => {
        console.log('[WS] AllGroupPage groups list connection closed')
        setIsConnected(false)
      }

      return () => {
        wsRef.close()
      }
    }
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `radial-gradient(circle at 20% 20%, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(
                         theme.palette.secondary.main,
                         0.05
                       )} 0%, transparent 50%),
                       ${theme.palette.background.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              mb: 2
            }}
          />
          <Typography
            variant='body1'
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 600
            }}
          >
            Loading groups...
          </Typography>
        </Box>
      </Box>
    )
  }

  const handleEditGroup = groupId => {
    console.log('Edit group:', groupId)
    router.push(`/management/group/${groupId}/edit`)
  }

  const handleViewGroup = groupId => {
    console.log('View group:', groupId)
    router.push(`/management/group/${groupId}`)
  }
  const handleCreateNewGroup = () => {
    router.push('/management/group/create')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
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
                <i className='ri-group-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Group Management
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
              Create, manage, and organize user groups with smart filtering
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <GroupCard groups={groups} onEditGroup={handleEditGroup} onViewGroup={handleViewGroup} />

        {/* Floating Action Button */}
        <Button
          variant='contained'
          component='label'
          sx={{
            color: 'white',
            position: 'fixed',
            fontsize: '1.2rem',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1001,
            borderRadius: '12px',
            px: 3,
            py: 1.5
          }}
          startIcon={<AddIcon />}
          onClick={handleCreateNewGroup}
        >
          Create Group
        </Button>
      </Container>
    </Box>
  )
}

export default AllGroupPage
