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
  ListItemText,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material'

const UserDetailsPopup = ({ open, userDetails, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDarkMode = theme.palette.mode === 'dark'

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
          m: { xs: 2, sm: 2, md: 3 },
          maxHeight: { xs: '85vh', sm: '90vh', md: '85vh' },
          width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 32px)', md: 'auto' },
          bgcolor: isDarkMode ? theme.palette.background.paper : '#fff',
          backgroundImage: 'none',
          borderRadius: { xs: 2, sm: 2, md: 3 }
        }
      }}
    >
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          pb: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.95) : alpha('#fff', 0.95),
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
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
              width: { xs: 52, sm: 64, md: 72 },
              height: { xs: 52, sm: 64, md: 72 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
                theme.palette.secondary?.main || theme.palette.primary.light
              })`,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              fontWeight: 600,
              flexShrink: 0,
              boxShadow: isDarkMode
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {profile?.firstname?.[0] || profile?.lastname?.[0] || email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant='h6'
              component='div'
              sx={{
                fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.35rem' },
                fontWeight: 600,
                wordBreak: 'break-word',
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {getFullName()}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                wordBreak: 'break-word',
                mb: memberId ? 0.25 : 0
              }}
            >
              {email}
            </Typography>
            {memberId && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                  display: 'block'
                }}
              >
                Member ID: {memberId}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size='small'
            sx={{
              position: 'absolute',
              right: { xs: 8, sm: 12 },
              top: { xs: 8, sm: 12 },
              color: 'text.secondary',
              bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.5) : alpha('#000', 0.05),
              '&:hover': {
                bgcolor: isDarkMode ? alpha(theme.palette.background.default, 0.7) : alpha('#000', 0.1)
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: {
            xs: 'calc(85vh - 200px)',
            sm: 'calc(90vh - 220px)',
            md: 'calc(85vh - 220px)'
          },
          overflow: 'auto',
          p: { xs: 2, sm: 2.5, md: 3 },
          bgcolor: isDarkMode ? theme.palette.background.default : alpha('#f5f5f5', 0.5),
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? alpha(theme.palette.background.default, 0.5) : '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? alpha(theme.palette.divider, 0.5) : '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: isDarkMode ? alpha(theme.palette.divider, 0.7) : '#a8a8a8'
            }
          }
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card
              variant='outlined'
              sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                borderColor: isDarkMode ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.3),
                boxShadow: isDarkMode
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: isDarkMode
                    ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}`
                    : '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                    fontWeight: 600,
                    mb: { xs: 1.5, sm: 2 },
                    color: 'text.primary'
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } }} color='primary' />
                  Personal Information
                </Typography>
                <List dense>
                  <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                      <PersonIcon
                        sx={{
                          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                          color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Full Name'
                      secondary={getFullName()}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                      <EmailIcon
                        sx={{
                          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                          color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Email'
                      secondary={email}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        color: 'text.primary'
                      }}
                    />
                  </ListItem>
                  {profile?.phone && (
                    <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                        <PhoneIcon
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                            color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary='Phone'
                        secondary={profile.phone}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                          fontWeight: 500,
                          color: 'text.secondary'
                        }}
                        secondaryTypographyProps={{
                          fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  )}
                  {memberId && (
                    <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                        <BadgeIcon
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                            color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary='Member ID'
                        secondary={memberId}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                          fontWeight: 500,
                          color: 'text.secondary'
                        }}
                        secondaryTypographyProps={{
                          fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Demographics */}
          <Grid item xs={12} md={6}>
            <Card
              variant='outlined'
              sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                borderColor: isDarkMode ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.3),
                boxShadow: isDarkMode
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: isDarkMode
                    ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}`
                    : '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                    fontWeight: 600,
                    mb: { xs: 1.5, sm: 2 },
                    color: 'text.primary'
                  }}
                >
                  <CakeIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } }} color='primary' />
                  Demographics
                </Typography>
                <List dense>
                  {profile?.age && (
                    <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                        <CakeIcon
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                            color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary='Age'
                        secondary={`${profile.age} years old`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                          fontWeight: 500,
                          color: 'text.secondary'
                        }}
                        secondaryTypographyProps={{
                          fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  )}
                  {profile?.gender && (
                    <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                        <GenderIcon
                          sx={{
                            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                            color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary='Gender'
                        secondary={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                          fontWeight: 500,
                          color: 'text.secondary'
                        }}
                        secondaryTypographyProps={{
                          fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  )}
                  <ListItem sx={{ px: { xs: 0, sm: 0.5, md: 1 }, py: { xs: 0.75, sm: 1 } }}>
                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40, md: 44 } }}>
                      <LocationIcon
                        sx={{
                          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
                          color: isDarkMode ? theme.palette.text.secondary : theme.palette.action.active
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Location'
                      secondary={getLocationString()}
                      primaryTypographyProps={{
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                      secondaryTypographyProps={{
                        fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        color: 'text.primary'
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
              <Card
                variant='outlined'
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderColor: isDarkMode ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.divider, 0.3),
                  boxShadow: isDarkMode
                    ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                    : '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: isDarkMode
                      ? `0 4px 12px ${alpha(theme.palette.common.black, 0.4)}`
                      : '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
                      fontWeight: 600,
                      mb: { xs: 1.5, sm: 2 },
                      color: 'text.primary'
                    }}
                  >
                    <CalendarIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' } }} color='primary' />
                    Additional Information
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {profile.nickname && (
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                            wordBreak: 'break-word',
                            color: 'text.primary'
                          }}
                        >
                          <strong
                            style={{ color: isDarkMode ? theme.palette.text.secondary : theme.palette.text.primary }}
                          >
                            Nickname:
                          </strong>{' '}
                          {profile.nickname}
                        </Typography>
                      </Grid>
                    )}
                    {profile.bio && (
                      <Grid item xs={12}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                            wordBreak: 'break-word',
                            color: 'text.primary'
                          }}
                        >
                          <strong
                            style={{ color: isDarkMode ? theme.palette.text.secondary : theme.palette.text.primary }}
                          >
                            Bio:
                          </strong>{' '}
                          {profile.bio}
                        </Typography>
                      </Grid>
                    )}
                    {profile.interests && profile.interests.length > 0 && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                          <Typography
                            variant='body2'
                            sx={{
                              mb: 1,
                              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                              fontWeight: 600,
                              color: isDarkMode ? theme.palette.text.secondary : theme.palette.text.primary
                            }}
                          >
                            Interests:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.75, sm: 1 } }}>
                            {profile.interests.map((interest, index) => (
                              <Chip
                                key={index}
                                label={interest}
                                size='small'
                                variant='outlined'
                                color='primary'
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                  height: { xs: 26, sm: 28, md: 30 },
                                  borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.5 : 0.3),
                                  bgcolor: isDarkMode
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : alpha(theme.palette.primary.main, 0.05),
                                  '&:hover': {
                                    bgcolor: isDarkMode
                                      ? alpha(theme.palette.primary.main, 0.2)
                                      : alpha(theme.palette.primary.main, 0.1),
                                    borderColor: alpha(theme.palette.primary.main, isDarkMode ? 0.7 : 0.5)
                                  }
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

      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          pt: { xs: 1.5, sm: 2 },
          borderTop: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.12 : 0.08)}`,
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.95) : alpha('#fff', 0.95),
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          justifyContent: 'flex-end'
        }}
      >
        <Button
          onClick={onClose}
          variant='outlined'
          color='primary'
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
            px: { xs: 4, sm: 5, md: 6 },
            py: { xs: 1.25, sm: 1.5 },
            minWidth: { xs: 140, sm: 150, md: 160 },
            fontWeight: 600,
            borderRadius: 2,
            borderWidth: { xs: 1.5, sm: 2 },
            ...(isDarkMode && {
              borderColor: alpha(theme.palette.divider, 0.3),
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08)
              }
            })
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDetailsPopup
