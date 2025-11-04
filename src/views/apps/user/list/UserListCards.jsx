// MUI Imports
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

const UserListCards = ({ users, isLoading }) => {
  // Calculate dynamic values
  const totalUsers = users.length

  // Calculate dynamic values
  const activeUsers = users.filter(user => user.isActive).length
  const inactiveUsers = totalUsers - activeUsers
  const nonVerifiedUsers = users.filter(user => !user.isVerified).length

  // Calculate percentages dynamically
  const activePercentage = totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
  const inactivePercentage = totalUsers ? ((inactiveUsers / totalUsers) * 100).toFixed(2) : 0
  const nonVerifiedPercentage = totalUsers ? ((nonVerifiedUsers / totalUsers) * 100).toFixed(2) : 0

  const getChangeType = change => {
    if (change > 0) return 'positive'
    if (change < 0) return 'negative'
    return 'zero'
  }

  // Dynamic data array
  const data = [
    {
      title: 'Total Users',
      value: totalUsers,
      avatarIcon: 'ri-group-line',
      avatarColor: 'primary',
      change: getChangeType(activePercentage),
      changeNumber: `${activePercentage}%`,
      subTitle: 'All registered users'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      change: getChangeType(activePercentage),
      changeNumber: `${activePercentage}%`,
      subTitle: 'Currently active users'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      avatarIcon: 'ri-user-unfollow-line',
      avatarColor: 'error',
      change: getChangeType(inactivePercentage),
      changeNumber: `${inactivePercentage}%`,
      subTitle: 'Not active recently'
    },
    {
      title: 'Unverified Users',
      value: nonVerifiedUsers,
      avatarIcon: 'ri-user-search-line',
      avatarColor: 'warning',
      change: getChangeType(nonVerifiedPercentage),
      changeNumber: `${nonVerifiedPercentage}%`,
      subTitle: 'Users pending email verification'
    }
  ]

  if (isLoading) {
    return (
      <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
        {[1, 2, 3, 4].map(item => (
          <Grid key={item} item xs={12} sm={6} md={3}>
            <Skeleton variant='rounded' height={120} />
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
      {data.map((item, i) => (
        <Grid key={i} item xs={12} sm={6} md={3}>
          <Box
            sx={{
              height: '100%',
              position: 'relative',
              '& > div': {
                height: '100%',
                background: '#ffffff',
                borderRadius: 3,
                boxShadow: theme => theme.shadows[3],
                border: theme => `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: theme =>
                    item.avatarColor === 'primary'
                      ? theme.palette.primary.main
                      : item.avatarColor === 'success'
                        ? theme.palette.success.main
                        : item.avatarColor === 'error'
                          ? theme.palette.error.main
                          : item.avatarColor === 'warning'
                            ? theme.palette.warning.main
                            : theme.palette.primary.main,
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out'
                },
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme => theme.shadows[8],
                  '&::before': {
                    opacity: 1
                  }
                }
              }
            }}
          >
            <HorizontalWithSubtitle {...item} />
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
