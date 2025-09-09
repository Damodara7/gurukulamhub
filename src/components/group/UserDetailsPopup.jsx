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

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 600
            }}
          >
            {profile?.firstname?.[0] || profile?.lastname?.[0] || email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant='h6' component='div'>
              {getFullName()}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {email}
            </Typography>
            {memberId && (
              <Typography variant='caption' color='text.secondary'>
                Member ID: {memberId}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color='primary' />
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary='Full Name' secondary={getFullName()} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary='Email' secondary={email} />
                  </ListItem>
                  {profile?.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText primary='Phone' secondary={profile.phone} />
                    </ListItem>
                  )}
                  {memberId && (
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText primary='Member ID' secondary={memberId} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Demographics */}
          <Grid item xs={12} md={6}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeIcon color='primary' />
                  Demographics
                </Typography>
                <List dense>
                  {profile?.age && (
                    <ListItem>
                      <ListItemIcon>
                        <CakeIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText primary='Age' secondary={`${profile.age} years old`} />
                    </ListItem>
                  )}
                  {profile?.gender && (
                    <ListItem>
                      <ListItemIcon>
                        <GenderIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText
                        primary='Gender'
                        secondary={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary='Location' secondary={getLocationString()} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Information */}
          {profile && (
            <Grid item xs={12}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color='primary' />
                    Additional Information
                  </Typography>
                  <Grid container spacing={2}>
                    {profile.nickname && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Nickname:</strong> {profile.nickname}
                        </Typography>
                      </Grid>
                    )}
                    {profile.bio && (
                      <Grid item xs={12}>
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Bio:</strong> {profile.bio}
                        </Typography>
                      </Grid>
                    )}
                    {profile.interests && profile.interests.length > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                            <strong>Interests:</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {profile.interests.map((interest, index) => (
                              <Chip key={index} label={interest} size='small' variant='outlined' color='primary' />
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

      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsPopup
