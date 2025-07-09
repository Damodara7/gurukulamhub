import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Box,
  Avatar,
  Divider
} from '@mui/material'

function AdminForwardQuizCard({ game }) {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
const cardstyle = game?.status === 'approved' || game?.status === 'lobby' || game?.status === 'cancelled'
  return (
    <>
      <Grid item xs={12} sm={6} md={cardstyle ?4 :3}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 3,
              transform: 'scale(1.02)',
              transition: 'all 0.3s ease-in-out'
            }
          }}
          onClick={handleClickOpen}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' component='div' gutterBottom>
              Quiz Title
            </Typography>
            <Typography
              variant='h4'
              component='div'
              sx={{
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {game?.quiz?.title || 'No Quiz'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle variant='h4' sx={{ textAlign: 'center', fontWeight: '700' }}>
          {game?.quiz?.title || 'Quiz Details'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Thumbnail Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center' , mb:3 }}>
              <Avatar
                src={game?.quiz?.thumbnail}
                variant='rounded'
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: 400,
                  maxHeight: 300
                }}
              />
            </Box>

            {/* Details Section */}
            <Box sx={{ display:'flex' , flexDirection:'column' , gap:2 }}>
              {/* Quiz Details */}
              <Typography variant='h6' gutterBottom>
                Details:
              </Typography>
              <Typography paragraph>{game?.quiz?.details || 'No details available'}</Typography>

              {/* Language and Syllabus Chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {game?.quiz?.language && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Language:
                    </Typography>
                    <Chip label={`${game?.quiz?.language?.name}`} color='primary' variant='outlined' />
                  </Box>
                )}
                {game?.quiz?.syllabus && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Syllabus:
                    </Typography>
                    <Chip label={`${game?.quiz?.syllabus}`} color='primary' variant='outlined' />
                  </Box>
                )}
                {game?.quiz?.status && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      status:
                    </Typography>
                    <Chip label={`${game?.quiz?.status}`} color='primary' variant='outlined' />
                  </Box>
                )}
              </Box>

              {/* Additional Info */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, mt: 3 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Created by: {game?.quiz?.createdBy}
                </Typography>
                {/* <Typography variant='subtitle2' color='text.secondary'>
                  Approval: {game?.quiz?.approvalState}
                </Typography> */}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}
export default AdminForwardQuizCard
