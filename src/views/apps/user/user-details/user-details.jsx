import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import BlockIcon from '@mui/icons-material/Block'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LoginIcon from '@mui/icons-material/Login'
import GroupIcon from '@mui/icons-material/Group'
import TodayIcon from '@mui/icons-material/Today'
import Divider from '@mui/material/Divider'

function StatCard({ icon, label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, minWidth: 120, textAlign: 'center', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, boxShadow: 'none', borderColor: 'divider' }}>
      <Box sx={{ mb: 1, color: 'text.secondary', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
      <Typography variant="h6" fontWeight={600} color="text.primary">{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
      {icon && <Box color="text.secondary">{icon}</Box>}
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 500 }}>{label}</Typography>
      <Typography variant="body2" color="text.primary">{value}</Typography>
    </Stack>
  )
}

function UserDetailsPage({ data }) {
  if (!data) return <Box p={4}><Typography color="text.secondary">No user data found.</Typography></Box>
  const { profile, ...user } = data
  const avatarUrl = profile?.image || '/images/avatars/1.png'
  const fullName = `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim() || 'User'

  // Stat cards
  const stats = [
    { icon: <LoginIcon fontSize="medium" />, label: 'Logins', value: user?.loginCount || 0 },
    { icon: <GroupIcon fontSize="medium" />, label: 'Roles', value: user?.roles?.length || 1 },
    { icon: <TodayIcon fontSize="medium" />, label: 'Created', value: user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : '-' },
    { icon: <EmailIcon fontSize="medium" />, label: 'Email', value: user?.email },
    { icon: <PhoneIcon fontSize="medium" />, label: 'Phone', value: user?.phone || '-' }
  ]

  // Account Info rows
  const accountRows = [
    { label: 'Email', value: user?.email, icon: <EmailIcon fontSize="small" /> },
    { label: 'Phone', value: user?.phone || 'N/A', icon: <PhoneIcon fontSize="small" /> },
    { label: 'Roles', value: user?.roles?.join(', ') || 'N/A', icon: <GroupIcon fontSize="small" /> },
    { label: 'Geo Roles', value: user?.geoRoles?.join(', ') || 'N/A' },
    { label: 'Country Code', value: user?.countryCode || 'N/A' },
    { label: 'Member ID', value: user?.memberId || 'N/A' },
    { label: 'Referral Token', value: user?.referralToken || 'N/A' },
    { label: 'Referred By', value: user?.referredBy },
    { label: 'Referral Source', value: user?.referralSource || 'N/A' },
    { label: 'Login Count', value: user?.loginCount },
    { label: 'Current Status', value: user?.currentStatus },
    { label: 'Social Login', value: user?.socialLogin || 'N/A' },
    { label: 'Created', value: user?.createdAt ? new Date(user?.createdAt).toLocaleString() : 'N/A' },
    { label: 'Updated', value: user?.updatedAt ? new Date(user?.updatedAt).toLocaleString() : 'N/A' }
  ]

  // Profile Info rows
  const profileRows = [
    { label: 'Age', value: profile?.age || 'N/A' },
    { label: 'Gender', value: profile?.gender || 'N/A' },
    { label: 'Nickname', value: profile?.nickname || 'N/A' },
    { label: 'Role in Org', value: profile?.roleInOrganization || 'N/A' },
    { label: 'Country', value: profile?.country || 'N/A' },
    { label: 'Region', value: profile?.region || 'N/A' },
    { label: 'Zipcode', value: profile?.zipcode || 'N/A' },
    { label: 'Locality', value: profile?.locality || 'N/A' },
    { label: 'Street', value: profile?.street || 'N/A' },
    { label: 'Colony', value: profile?.colony || 'N/A' },
    { label: 'Village', value: profile?.village || 'N/A' },
    { label: 'Timezone', value: profile?.timezone || 'N/A' },
    { label: 'Religion', value: profile?.religion || 'N/A' },
    { label: 'Caste', value: profile?.caste || 'N/A' },
    { label: 'Category', value: profile?.category || 'N/A' },
    { label: 'Mother Tongue', value: profile?.motherTongue || 'N/A' }
  ]

  return (
    <Box maxWidth={1200} mx="auto" mt={6} px={2}>
      {/* Header Section */}
      <Paper variant="outlined" sx={{ borderRadius: 1, mb: 5, p: { xs: 2, md: 4 }, boxShadow: 'none', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar src={avatarUrl} alt={fullName} sx={{ width: 96, height: 96, fontSize: 36, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>{fullName}</Typography>
              <Typography color="text.secondary" fontSize={16}>{profile?.email || user?.email}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" mt={0.5}>
                <Chip label={user?.isActive ? 'Active' : 'Inactive'} color={user?.isActive ? 'success' : 'error'} size="small" variant="outlined" />
                <Chip label={user?.isVerified ? 'Verified' : 'Unverified'} color={user?.isVerified ? 'success' : 'warning'} size="small" variant="outlined" icon={user?.isVerified ? <VerifiedUserIcon fontSize="small" /> : null} />
                {user?.isAdmin && <Chip label="Admin" color="primary" size="small" variant="outlined" icon={<AdminPanelSettingsIcon fontSize="small" />} />}
                {user?.currentStatus && <Chip label={user?.currentStatus} color="info" size="small" variant="outlined" />}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <IconButton color="primary" aria-label="edit user" size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton color="error" aria-label="deactivate user" size="small">
                <BlockIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary">Member ID</Typography>
              <Typography variant="body1" color="primary">{user?.memberId || '-'}</Typography>
            </Box>
          </Grid>
        </Grid>
        {/* Stat Cards Row */}
        <Box mt={4}>
          <Grid container spacing={2} justifyContent="center">
            {stats.map((stat, idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={idx}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      {/* Info Sections */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ borderRadius: 1, p: 3, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Account Information</Typography>
            <Divider sx={{ mb: 2 }} />
            {accountRows.map((row, idx) => (
              <InfoRow key={idx} {...row} />
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ borderRadius: 1, p: 3, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Profile Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <InfoRow label="Name" value={fullName} />
              <InfoRow label="Email" value={profile?.email || user?.email} />
              {profileRows.map((row, idx) => (
                <InfoRow key={idx} {...row} />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      {/* More sections (Organizations, Languages, Education, Work, etc.) can be added below as needed */}
    </Box>
  )
}

export default UserDetailsPage
