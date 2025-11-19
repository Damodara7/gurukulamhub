'use client'
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'

const UserDetailsPopup = ({ open, userDetails, onClose }) => {
  if (!userDetails) return null

  const { profile, email, memberId } = userDetails

  const getLocationString = () => {
    if (!profile) return 'N/A'
    const parts = []
    if (profile.locality) parts.push(profile.locality)
    if (profile.region) parts.push(profile.region)
    if (profile.country) parts.push(profile.country)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  const getFullName = () => {
    if (!profile) return 'N/A'
    const parts = []
    if (profile.firstname) parts.push(profile.firstname)
    if (profile.lastname) parts.push(profile.lastname)
    return parts.length > 0 ? parts.join(' ') : 'N/A'
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          m: { xs: 2, sm: 3 },
          maxHeight: { xs: '90vh', sm: '85vh' },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          <Avatar
            sx={{
              width: { xs: 48, sm: 60 },
              height: { xs: 48, sm: 60 },
              bgcolor: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              flexShrink: 0
            }}
          >
            {profile?.firstname?.[0] || profile?.lastname?.[0] || email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant='h6'
              component='div'
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}
            >
              {getFullName()}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-word' }}
            >
              {email}
            </Typography>
            {memberId && (
              <Typography variant='caption' color='text.secondary' sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Member ID: {memberId}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{ maxHeight: { xs: 'calc(90vh - 200px)', sm: '70vh' }, overflow: 'auto', p: { xs: 2, sm: 3 } }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined' sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: { xs: 1.5, sm: 2 }
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} color='primary' />
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                      <PersonIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Full Name'
                      secondary={getFullName()}
                      primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                      <EmailIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Email'
                      secondary={email}
                      primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    />
                  </ListItem>
                  {profile?.phone && (
                    <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                        <PhoneIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary='Phone'
                        secondary={profile.phone}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                  )}
                  {memberId && (
                    <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                        <BadgeIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary='Member ID'
                        secondary={memberId}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Demographics */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined' sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    mb: { xs: 1.5, sm: 2 }
                  }}
                >
                  <CakeIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} color='primary' />
                  Demographics
                </Typography>
                <List dense>
                  {profile?.age && (
                    <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                        <CakeIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary='Age'
                        secondary={`${profile.age} years old`}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                  )}
                  {profile?.gender && (
                    <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                        <GenderIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary='Gender'
                        secondary={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                  )}
                  <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                      <LocationIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Location'
                      secondary={getLocationString()}
                      primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          {profile && (
            <Grid item xs={12}>
              <Card variant='outlined'>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      mb: { xs: 1.5, sm: 2 }
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} color='primary' />
                    Additional Information
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {profile.nickname && (
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, wordBreak: 'break-word' }}
                        >
                          <strong>Nickname:</strong> {profile.nickname}
                        </Typography>
                      </Grid>
                    )}
                    {profile.bio && (
                      <Grid item xs={12}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, wordBreak: 'break-word' }}
                        >
                          <strong>Bio:</strong> {profile.bio}
                        </Typography>
                      </Grid>
                    )}
                    {profile.interests && profile.interests.length > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 1, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
                          >
                            <strong>Interests:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 0.75 } }}>
                            {profile.interests.map((interest, index) => (
                              <Chip
                                key={index}
                                label={interest}
                                size='small'
                                variant='outlined'
                                color='primary'
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  height: { xs: 24, sm: 28 }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 2 } }}>
        <Button
          onClick={onClose}
          color='primary'
          variant='outlined'
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 3, sm: 4 },
            py: { xs: 0.75, sm: 1 },
            minWidth: { xs: 100, sm: 'auto' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsPopup
