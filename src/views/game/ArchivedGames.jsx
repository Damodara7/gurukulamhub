import React from 'react'
import { Box, Card, CardContent, CardMedia, Typography, Grid, ButtonBase, Button } from '@mui/material'
import { styled } from '@mui/system'


const archivedGames = [
  // Replace with your games data
  {
    id: 1,
    title: 'Game 1',
    details: 'Details of Game 1',
    image: 'https://via.placeholder.com/150',
    completedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Game 2',
    details: 'Details of Game 2',
    image: 'https://via.placeholder.com/150',
    completedAt: new Date().toISOString()
  }
]

// Styled Card component for archived games
const ArchivedCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.025)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
  }
}))

const ArchivedGames = ({archivedGames}) => {

  const formatDateTime = dateString => {
    const date = new Date(dateString)
    return date.toLocaleString() // Format date and time in a user-friendly format
  }

  return (
    <Box sx={{ pb: 1 }}>
      {/* <Typography variant='h4' gutterBottom textAlign='center' color='primary'>
        Archived Games
      </Typography> */}
      <Grid container spacing={4} rowSpacing={6}>
        {archivedGames.map(game => (
          <Grid item xs={12} sm={6} md={4} key={game._id}>
            <ButtonBase sx={{ display: 'flex', width: '100%', textAlign: 'initial', height: '100%' }}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.025)'
                  }
                }}
              >
                <CardMedia
                  component='img'
                  height='200'
                  image={game.thumbnailUrl || 'https://via.placeholder.com/150'}
                  alt={game.title}
                  sx={{
                    filter: 'brightness(0.8)',
                    transition: 'filter 0.3s',
                    '&:hover': { filter: 'brightness(1)' },
                    height: { xs: '180px', md: '200px' }, // Responsive height
                    objectFit:"contain",
                  }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: { xs: '12px', md: '14px' }
                  }}
                >
                  <Box>
                    <Typography
                      variant='h6'
                      fontWeight='bold'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {game.title}
                    </Typography>
                    <Typography
                      sx={{
                        overflow: 'hidden', // Hides overflow content
                        textOverflow: 'ellipsis', // Adds ellipsis when text overflows
                        whiteSpace: 'nowrap' // Prevents text from wrapping to the next line
                      }}
                      variant='body2'
                      color='text.secondary'
                      paragraph
                    >
                      {game.details}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='textSecondary'>
                      Completed at: {formatDateTime(game.completedAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      variant='contained'
                      color='primary'
                      component='label'
                      onClick={() => handleCloneGame(game.id)}
                      sx={{ marginTop: 2, color: 'white' }}
                    >
                      Clone Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ArchivedGames
