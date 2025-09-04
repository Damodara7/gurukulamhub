'use client'
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Stack,
  Button,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Group as GroupIcon,
  Campaign as ChannelIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Search as SearchIcon
} from '@mui/icons-material'

const GroupChannellist = ({ groups = [], channels = [] }) => {
  console.log('hello welcome to this page')
  const [viewMode, setViewMode] = useState('groups')
  const [searchQuery, setSearchQuery] = useState('')

  console.log('GroupChannellist received - groups:', groups.length, 'channels:', channels.length)
  console.log('Groups data:', groups)
  console.log('Channels data:', channels)

  console.log('viewMode')

  // Filter channels based on search query
  const filteredChannels = channels.filter(channel =>
    channel.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle view mode change and clear search
  const handleViewModeChange = mode => {
    setViewMode(mode)
    if (mode === 'groups') {
      setSearchQuery('') // Clear search when switching to groups
    }
  }

  const renderGroupItem = item => (
    <ListItem
      key={item._id}
      sx={{
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        backgroundColor: 'background.paper'
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            width: 50,
            height: 50
          }}
        >
          <GroupIcon />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant='subtitle1'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mr: 1
              }}
            >
              {item.groupName || 'Untitled Group'}
            </Typography>

            <Chip
              size='small'
              icon={
                item?.status === 'public' ? <PublicIcon sx={{ fontSize: 14 }} /> : <LockIcon sx={{ fontSize: 14 }} />
              }
              label={item?.status === 'public' ? 'Public' : 'Private'}
              color={item?.status === 'public' ? 'success' : 'warning'}
              variant='outlined'
              sx={{ minWidth: 'auto' }}
            />
          </Box>
        }
        secondary={
          <Box>
            {item.description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.5
                }}
              >
                {item.description}
              </Typography>
            )}
            <Typography variant='caption' color='text.secondary'>
              {item.membersCount || item.members?.length || 0} members
            </Typography>
          </Box>
        }
      />
    </ListItem>
  )

  const renderChannelItem = item => (
    <ListItem
      key={item._id}
      sx={{
        px: 2,
        py: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        backgroundColor: 'background.paper'
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 50,
            height: 50
          }}
        >
          <ChannelIcon />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant='subtitle1'
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                mr: 1
              }}
            >
              {item.groupName || 'Untitled Channel'}
            </Typography>

            <Chip
              size='small'
              icon={<ChannelIcon sx={{ fontSize: 14 }} />}
              label='Channel'
              color='primary'
              variant='outlined'
              sx={{ minWidth: 'auto' }}
            />
          </Box>
        }
        secondary={
          <Box>
            {item.description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.5
                }}
              >
                {item.description}
              </Typography>
            )}
            <Typography variant='caption' color='text.secondary'>
              {item.membersCount || item.members?.length || 0} members
            </Typography>
          </Box>
        }
      />

      <Button
        variant='contained'
        component='label'
        size='small'
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          color: 'white',
          minWidth: 'auto',
          px: 2
        }}
        onClick={() => {
          console.log('Send request clicked for channel:', item.groupName)
          // TODO: Implement send request functionality
        }}
      >
        Sent request
      </Button>
    </ListItem>
  )

  const currentData = viewMode === 'groups' ? groups : filteredChannels
  const currentTitle = viewMode === 'groups' ? 'My Groups' : 'Channels'

  return (
    <Box>
      {/* Header with Toggle Buttons */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'groups' ? 'contained' : 'outlined'}
            component={viewMode === 'groups' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('groups')}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              color: viewMode === 'groups' ? 'white' : 'black',
              px: 3,
              py: 1
            }}
          >
            Groups ({groups.length})
          </Button>
          <Button
            variant={viewMode === 'channels' ? 'contained' : 'outlined'}
            component={viewMode === 'channels' ? 'label' : 'button'}
            size='medium'
            onClick={() => handleViewModeChange('channels')}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              color: viewMode === 'channels' ? 'white' : 'black',
              px: 3,
              py: 1
            }}
          >
            Channels ({channels.length})
          </Button>
        </Box>

        {/* Selected button text below */}
        <Typography variant='h6' sx={{ color: 'text.primary', fontWeight: 500 }}>
          {currentTitle} ({currentData.length})
        </Typography>

        {/* Search bar for channels */}
        {viewMode === 'channels' && (
          <TextField
            placeholder='Search channels by name...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size='small'
            sx={{
              width: '100%',
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              )
            }}
          />
        )}
      </Box>

      {/* Content */}
      {currentData.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar sx={{ bgcolor: 'grey.300', width: 80, height: 80 }}>
            {viewMode === 'groups' ? <GroupIcon sx={{ fontSize: 40 }} /> : <ChannelIcon sx={{ fontSize: 40 }} />}
          </Avatar>
          <Typography variant='h6' color='text.secondary'>
            {viewMode === 'groups' ? 'You are not a member of any groups yet' : 'No public channels available'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {viewMode === 'groups' ? 'Join groups to see them here' : 'Check back later for new public channels'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          {viewMode === 'groups'
            ? groups.map(item => renderGroupItem(item))
            : filteredChannels.map(item => renderChannelItem(item))}
        </Box>
      )}
    </Box>
  )
}

export default GroupChannellist
