// MUI Imports
import { Grid, Skeleton, Box, Stack, Typography, Chip } from '@mui/material'

import { useTheme, alpha } from '@mui/material/styles'

const UserListCards = ({ users, isLoading }) => {
  const theme = useTheme()
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.isActive).length
  const inactiveUsers = totalUsers - activeUsers
  const nonVerifiedUsers = users.filter(user => !user.isVerified).length

  const cardData = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: 'ri-group-line',
      accent: theme.palette.primary.main,
      subtitle: 'All registered users',
      change: totalUsers ? `${((totalUsers / totalUsers) * 100).toFixed(1)}% Total ` : '0%'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: 'ri-user-follow-line',
      accent: theme.palette.success.main,
      subtitle: 'Currently active',
      change: totalUsers ? `${((activeUsers / totalUsers) * 100).toFixed(1)}% Active ` : '0%'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      icon: 'ri-user-unfollow-line',
      accent: theme.palette.error.main,
      subtitle: 'Not active recently',
      change: totalUsers ? `${((inactiveUsers / totalUsers) * 100).toFixed(1)}% Inactive ` : '0%'
    },
    {
      title: 'Unverified Users',
      value: nonVerifiedUsers,
      icon: 'ri-user-search-line',
      accent: theme.palette.warning.main,
      subtitle: 'Pending verification',
      change: totalUsers ? `${((nonVerifiedUsers / totalUsers) * 100).toFixed(1)}%  Unverified` : '0%'
    }
  ]

  if (isLoading) {
    return (
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {[1, 2, 3, 4].map(item => (
          <Grid key={item} item xs={6} sm={6} md={3}>
            <Skeleton variant='rounded' height={120} />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {cardData.map((card, index) => (
        <Grid key={index} item xs={6} sm={6} md={3}>
          <Box
            sx={{
              borderRadius: 3,
              background: theme.palette.background.paper,
              border: `1px solid ${alpha(card.accent, 0.12)}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 15px 35px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 15px 35px rgba(15, 23, 42, 0.08)',
              p: { xs: 1.75, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1,
              minHeight: 130,
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: alpha(card.accent, 0.12),
                  color: card.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20
                }}
              >
                <i className={card.icon} />
              </Box>
              <Box>
                <Typography variant='subtitle2' color='text.secondary' sx={{ letterSpacing: '0.03em' }}>
                  {card.title}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </Box>
            </Stack>
            <Typography variant='body2' color='text.secondary'>
              {card.subtitle}
            </Typography>
            <Chip
              label={card.change}
              size='small'
              sx={{
                width: 'fit-content',
                fontWeight: 600,
                borderRadius: 2,
                background: alpha(card.accent, 0.14),
                color: card.accent
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
