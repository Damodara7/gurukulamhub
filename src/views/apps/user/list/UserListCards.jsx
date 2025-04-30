// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'

// Vars

const UserListCards = ({ users }) => {
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
      change: getChangeType(activePercentage), // Adjusted dynamic change
      changeNumber: `${activePercentage}%`,
      subTitle: 'All registered users'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      avatarIcon: 'ri-user-follow-line',
      avatarColor: 'success',
      change: getChangeType(activePercentage), // Adjusted dynamic change
      changeNumber: `${activePercentage}%`,
      subTitle: 'Currently active users'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers,
      avatarIcon: 'ri-user-unfollow-line',
      avatarColor: 'error',
      change: getChangeType(inactivePercentage), // Adjusted dynamic change
      changeNumber: `${inactivePercentage}%`,
      subTitle: 'Not active recently'
    },
    {
      title: 'Unverified Users',
      value: nonVerifiedUsers,
      avatarIcon: 'ri-user-search-line',
      avatarColor: 'warning',
      change: getChangeType(nonVerifiedPercentage), // Adjusted dynamic change
      changeNumber: `${nonVerifiedPercentage}%`,
      subTitle: 'Users pending email verification'
    }
  ]

  return (
    <Grid container spacing={6} className='flex'>
      {data.map((item, i) => (
        <Grid key={i} item xs={12} sm={6} md={3} className='flex'>
          <div className='w-full h-full flex flex-col justify-between'>
            <HorizontalWithSubtitle {...item} />
          </div>
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
