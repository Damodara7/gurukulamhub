import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'

function UserProfileInfo({ profile }) {
  if (!profile) return <Typography color="text.secondary">No profile data</Typography>
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={3} mb={3}>
          <Avatar src={profile.image || '/images/avatars/1.png'} alt="avatar" sx={{ width: 72, height: 72, border: '2px solid #eee' }} />
          <div>
            <Typography variant="h6" fontWeight={700}>{profile.firstname} {profile.lastname}</Typography>
            <Typography color="text.secondary">{profile.email}</Typography>
            {profile.accountType && <Typography color="text.secondary">{profile.accountType}</Typography>}
          </div>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><Typography><b>Age:</b> {profile.age || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Gender:</b> {profile.gender || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Phone:</b> {profile.phone || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Nickname:</b> {profile.nickname || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Role in Org:</b> {profile.roleInOrganization || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Country:</b> {profile.country || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Region:</b> {profile.region || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Zipcode:</b> {profile.zipcode || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Locality:</b> {profile.locality || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Street:</b> {profile.street || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Colony:</b> {profile.colony || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Village:</b> {profile.village || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Timezone:</b> {profile.timezone || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Religion:</b> {profile.religion || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Caste:</b> {profile.caste || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Category:</b> {profile.category || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography><b>Mother Tongue:</b> {profile.motherTongue || <span style={{color:'#aaa'}}>N/A</span>}</Typography></Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default UserProfileInfo 