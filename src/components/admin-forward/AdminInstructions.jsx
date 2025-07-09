// import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
// import React from 'react'

// function AdminInstructions({game = null}) {
//   console.log('game data from the AdminInstructions', game);
//   return (
//     <Grid xs={12} md={6}>
//       <Card sx={{ p: 3, textAlign: 'center' }}>
//         <CardContent>
//           <Typography variant='h5' gutterBottom>
//             🎉🎉 welcome to <strong>Forwarding Admin</strong>! 🎉🎉
//           </Typography>

//           <Typography
//             variant='h4'
//             sx={{
//               color: 'primary.main', // Use theme color or replace with a hex
//               fontWeight: 700, // Bold weight
//               letterSpacing: 1, // Slight spacing between letters
//               mb: 1, // Bottom margin
//               textTransform: 'capitalize' // Optional: Capitalizes each word
//             }}
//           >
//             {game?.forwardingAdmin?.email}
//           </Typography>

//           <Typography variant='body1' sx={{ mt: 2 }}>
//             You are playing a crucial role and in this role u are the key player and ur main task is to forward the
//             question based on the higher authority instruction.
//           </Typography>
//           <Typography variant='body1' sx={{ mt: 2 }}>
//             You have the access to see the participatedusers and registeredusers and also the leaderboard while the game is going on.
//           </Typography>

//           <Box display='flex' gap={6} flexWrap='wrap' mt={2} alignItems='center' justifyContent='center'></Box>

//           <Typography variant='body2' color='error' sx={{ mt: 3 }}>
//             Please be ready and instruct the users to join the game before 5 min. give the instructions to the users
//             that join the game with stable internet and won the prizes and gain the knowledge.
//           </Typography>
//         </CardContent>
//       </Card>
//     </Grid>
//   )
// }

// export default AdminInstructions

import { Box, Card, CardContent, Grid, Typography, Divider, Chip } from '@mui/material'
import React from 'react'

function AdminInstructions({ game = null }) {
  return (
    <Grid item xs={12}>
      <Card
        sx={{
          textAlign: 'center',
          boxShadow: 3,
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          borderRadius: 2
        }}
      >
        <CardContent>
          {/* Header Section */}
          <Box >
            {/* <Chip label='Admin Portal' color='primary' size='small' sx={{ mb: 1, fontWeight: 'bold' }} /> */}
            <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold' }}>
              Welcome to <span style={{ color: '#1976d2' }}>Forwarding Admin</span>
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          {/* Admin Info */}
          <Box
            display='flex'
            gap={2}
            sx={{
              p: 2
            }}
          >
            <Typography variant='subtitle1' sx={{ color: 'primary.contrastText' }}>
              Forwarding Admin Details :
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'lowercase'
              }}
            >
              {game?.forwardingAdmin?.email || 'admin@example.com'}
            </Typography>
          </Box>

          {/* Instructions */}
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              Your Responsibilities:
            </Typography>
            <Box component='ul' sx={{ pl: 2, '& li': { mb: 1 } }}>
              <Typography component='li' variant='body1'>
                You play a crucial role as the key administrator for this game session.
              </Typography>
              <Typography component='li' variant='body1'>
                Forward questions based on higher authority instructions.
              </Typography>
              <Typography component='li' variant='body1'>
                Monitor and manage game flow in real-time.
              </Typography>
              <Typography component='li' variant='body1'>
                Access Participated users data, registered users data , and leaderboard analytics.
              </Typography>
            </Box>
          </Box>

          {/* Best Practices */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              textAlign: 'left'
            }}
          >
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
              Best Practices:
            </Typography>
            <Box component='ul' sx={{ pl: 2, '& li': { mb: 1 } }}>
              <Typography component='li' variant='body2'>
                Ensure all participants join at least 5 minutes before game start.
              </Typography>
              <Typography component='li' variant='body2'>
                Advise users to use stable internet connections for optimal experience.
              </Typography>
              <Typography component='li' variant='body2'>
                Monitor the game timeline and keep things running smoothly.
              </Typography>
            </Box>
          </Box>

          {/* Important Note */}
          <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'error.main', borderRadius: 1 }}>
            <Typography variant='body2' color='error' sx={{ fontWeight: 'bold' }}>
              ⚠️ Important: The game cannot proceed without your active participation. Please remain attentive
              throughout the session.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AdminInstructions