import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'

function UserAccountInfo({ user }) {
  if (!user) return null
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Account Information
        </Typography>
        <Stack spacing={1}>
          <Typography><b>Email:</b> {user.email}</Typography>
          <Typography><b>Phone:</b> {user.phone || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Roles:</b> {user.roles?.join(', ')}</Typography>
          <Typography><b>Geo Roles:</b> {user.geoRoles?.join(', ') || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Country Code:</b> {user.countryCode || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Member ID:</b> {user.memberId || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Referral Token:</b> {user.referralToken || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Referred By:</b> {user.referredBy}</Typography>
          <Typography><b>Referral Source:</b> {user.referralSource || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography><b>Login Count:</b> {user.loginCount}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'error'} size="small" />
            <Chip label={user.isVerified ? 'Verified' : 'Unverified'} color={user.isVerified ? 'success' : 'warning'} size="small" />
            <Chip label={user.isAdmin ? 'Admin' : 'User'} color={user.isAdmin ? 'primary' : 'default'} size="small" />
          </Stack>
          <Typography><b>Current Status:</b> {user.currentStatus}</Typography>
          <Typography><b>Social Login:</b> {user.socialLogin || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
          <Typography variant="caption" color="text.secondary">Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</Typography>
          <Typography variant="caption" color="text.secondary">Updated: {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default UserAccountInfo 