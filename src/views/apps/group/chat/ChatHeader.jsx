'use client'
import React from 'react'
import { Paper, Stack, Box, Typography, IconButton, Tooltip, Chip, Avatar, useTheme, alpha, useMediaQuery } from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Campaign as CampaignIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon
} from '@mui/icons-material'

const ChatHeader = ({
  groupData,
  isConnected,
  isCreator,
  onBack,
  onMembersClick,
  onSettingsClick,
  soundEnabled,
  onToggleSound,
  onMoreOptionsClick,
  isIndividualChat = false, // Flag to indicate individual chat
  avatarText = null, // Avatar initial text
  avatarColor = null, // Avatar background color
  isGroup = false // Flag to show group icon instead of avatar
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
        background: isDarkMode
          ? alpha(theme.palette.background.paper, 0.95)
          : alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(20px)',
        zIndex: 10
      }}
    >
      <Stack direction='row' alignItems='center' spacing={{ xs: 1, sm: 2 }}>
        <IconButton
          onClick={onBack}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            color: theme.palette.text.primary
          }}
        >
          <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
        {/* Avatar */}
        {isGroup ? (
          <Avatar
            sx={{
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              bgcolor: avatarColor || theme.palette.primary.main,
              color: 'white'
            }}
          >
            <GroupIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </Avatar>
        ) : avatarText ? (
          <Avatar
            sx={{
              width: { xs: 40, sm: 50 },
              height: { xs: 40, sm: 50 },
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600,
              bgcolor: avatarColor || theme.palette.primary.main,
              color: 'white'
            }}
          >
            {avatarText}
          </Avatar>
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction='row'
            alignItems='center'
            spacing={{ xs: 0.5, sm: 1 }}
            sx={{ flexWrap: 'wrap' }}
          >
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: { xs: '150px', sm: '300px', md: 'none' }
              }}
            >
              {groupData?.groupName || 'Group Chat'}
            </Typography>
            {groupData?.isAnnouncementOnly && (
              <Tooltip title='Announcement mode - Only creator can send messages' arrow>
                <Chip
                  icon={<CampaignIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                  label={isMobile ? '' : 'Announcement'}
                  size='small'
                  sx={{
                    height: { xs: 18, sm: 20 },
                    fontSize: { xs: '0.6rem', sm: '0.65rem' },
                    background: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.12),
                    color: theme.palette.info.main,
                    border: `1px solid ${alpha(theme.palette.info.main, isDarkMode ? 0.3 : 0.2)}`
                  }}
                />
              </Tooltip>
            )}
            {groupData?.status === 'public' ? (
              <Chip
                icon={<PublicIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                label={isMobile ? '' : 'Public'}
                size='small'
                sx={{
                  height: { xs: 18, sm: 20 },
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  background: alpha(theme.palette.success.main, isDarkMode ? 0.2 : 0.12),
                  color: theme.palette.success.main
                }}
              />
            ) : (
              <Chip
                icon={<LockIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                label={isMobile ? '' : 'Private'}
                size='small'
                sx={{
                  height: { xs: 18, sm: 20 },
                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                  background: alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.12),
                  color: theme.palette.warning.main
                }}
              />
            )}
          </Stack>
          {!isIndividualChat && (
            <Stack
              direction='row'
              gap={{ xs: 1, sm: 2 }}
              sx={{ mt: { xs: 0.5, sm: 0 } }}
            >
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {groupData?.membersCount || 0} members
              </Typography>
              <Typography
                variant='caption'
                color={!isConnected ? 'text.secondary' : 'success.main'}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {!isConnected ? ' • Connecting...' : ' • Connected'}
              </Typography>
            </Stack>
          )}
          {isIndividualChat && (
            <Typography
              variant='caption'
              color={!isConnected ? 'text.secondary' : 'success.main'}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mt: { xs: 0.5, sm: 0 } }}
            >
              {!isConnected ? 'Connecting...' : 'Connected'}
            </Typography>
          )}
        </Box>
        <Stack direction='row' spacing={{ xs: 0.5, sm: 1 }}>
          <Tooltip title={soundEnabled ? 'Sound On' : 'Sound Off'} arrow>
            <IconButton
              onClick={onToggleSound}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: soundEnabled ? theme.palette.success.main : theme.palette.text.secondary
              }}
            >
              {soundEnabled ? (
                <VolumeUpIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              ) : (
                <VolumeOffIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              )}
            </IconButton>
          </Tooltip>
          {!isIndividualChat && (
            <IconButton
              onClick={onMembersClick}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: theme.palette.text.primary
              }}
            >
              <InfoIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          )}
          {isCreator && (
            <IconButton
              onClick={onSettingsClick}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: theme.palette.text.primary
              }}
            >
              <SettingsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          )}
          {onMoreOptionsClick && (
            <IconButton
              onClick={onMoreOptionsClick}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: theme.palette.text.primary
              }}
            >
              <MoreVertIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}

export default ChatHeader

