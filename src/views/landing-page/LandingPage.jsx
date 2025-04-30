'use client'

import React from 'react'
import { Box, Typography, Card, CardContent, CardMedia, Grid, useTheme, useMediaQuery } from '@mui/material'
import { stringToColor } from '@/utils/stringToColor'
import Morque from '@/app/[lang]/(dashboard)/dashboards/myprogress/Marquee/Marquee'

// Dummy data for demonstration
const popularGames = [
  {
    id: 1,
    title: 'Game 1',
    description: 'Description for game 1',
    image: 'https://i.pinimg.com/originals/97/eb/07/97eb070a716533fa642bd6462e4727a2.jpg'
  },
  {
    id: 2,
    title: 'Game 2',
    description: 'Description for game 2',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSajsqjGXZgBU1LOb4hjr5A3bFlFX8A7wF2sA&s'
  },
  {
    id: 3,
    title: 'Game 3',
    description: 'Description for game 3',
    image: 'https://i0.wp.com/onwardsci.com/wp-content/uploads/2022/05/Onward-Science-Quiz.png?fit=1000%2C600&ssl=1'
  }
]

const popularSubjects = [
  { id: 1, title: 'Math' },
  { id: 2, title: 'Science' },
  { id: 3, title: 'Indian History' }
]

const popularQuizzes = [
  {
    id: 1,
    title: 'Math',
    description: 'Explore the world of Math',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSajsqjGXZgBU1LOb4hjr5A3bFlFX8A7wF2sA&s'
  },
  {
    id: 2,
    title: 'Science',
    description: 'Learn about Science',
    image: 'https://i0.wp.com/onwardsci.com/wp-content/uploads/2022/05/Onward-Science-Quiz.png?fit=1000%2C600&ssl=1'
  },
  {
    id: 3,
    title: 'Science',
    description: 'Learn about Science',
    image: 'https://i0.wp.com/onwardsci.com/wp-content/uploads/2022/05/Onward-Science-Quiz.png?fit=1000%2C600&ssl=1'
  },
  {
    id: 4,
    title: 'Indian History',
    description: 'Learn about Indian History',
    image: 'https://i.pinimg.com/originals/97/eb/07/97eb070a716533fa642bd6462e4727a2.jpg'
  }
]

const highlyRatedQuizzes = [
  {
    id: 1,
    title: 'Bhagavad Gita',
    description: 'This quiz is highly rated',
    image: 'https://miro.medium.com/v2/resize:fit:859/1*6wM8_vhSYJEaHzZiNz6Gyw.png'
  },
  {
    id: 2,
    title: 'Ramayana',
    description: 'Challenge yourself with this top quiz',
    image:
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhKbDMEpxDgpwZW_gTj54ovaNrYj_NxYoo2My3liWXG7IuN_R0SMnlz0TRGaVeXIcEp_BJZvq1jUvP8e45-y4vFO8it6XEUJCjqKxedu6ic-02Yr177RNPEEHBTAky5wj1sF7234I6M8A/s1600/286366a.jpg'
  }
]

const ScrollableRow = ({ title, data, showImageAndDescription = true }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme.breakpoints.down('lg'))
  const isXlScreen = useMediaQuery(theme.breakpoints.up('lg'))

  let cardWidth = 120
  if (isMobile) {
    cardWidth = 100
  } else if (isTablet) {
    cardWidth = 160
  } else if (isLargeScreen) {
    cardWidth = 180
  } else if (isXlScreen) {
    cardWidth = 200
  }

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box
        sx={{
          overflowX: 'auto', // Allows horizontal scrolling
          display: 'flex', // Aligns children in a row
          alignItems: 'stretch',
          flexWrap: 'nowrap', // Prevents wrapping to the next row
          gap: 2 // Adds space between items
        }}
      >
        {data.map(item => (
          <Box key={item.id}>
            {showImageAndDescription ? (
              <Card
                elevation={4}
                sx={{
                  minWidth: cardWidth,
                  maxWidth: cardWidth,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  height: '100%',
                  boxShadow: '0 2px 3px rgba(0, 0, 0, 0.045)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease', // Smooth transition on hover
                  '&:hover': {
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Stronger shadow on hover
                    transform: 'translateY(-5px)' // Slight lift effect
                  }
                }}
              >
                <CardMedia
                  component='img'
                  image={item.image}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease', // Smooth zoom on hover
                    '&:hover': {
                      transform: 'scale(1.05)' // Slight zoom on hover
                    }
                  }}
                />
                <CardContent sx={{ paddingBottom: '4px', paddingTop: '8px' }}>
                  <Typography
                    fontSize='0.8rem'
                    gutterBottom
                    variant='h6'
                    component='div'
                    sx={{
                      marginBottom: '4px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.3s ease', // Smooth color change on hover
                      '&:hover': {
                        color: 'primary.main', // Change text color on hover
                        textDecoration: 'underline' // Underline text on hover
                      }
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='subtitle1'
                    color='text.secondary'
                    fontSize='0.65rem'
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card
                elevation={4}
                sx={{
                  minWidth: cardWidth,
                  maxWidth: cardWidth,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  backgroundColor: stringToColor(item.title),
                  boxShadow: '0 2px 3px rgba(0, 0, 0, 0.045)',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)', // Stronger shadow on hover
                    transform: 'translateY(-5px)' // Slight lift effect
                  }
                }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center'
                  }}
                >
                  <Typography
                    gutterBottom
                    variant='h6'
                    component='div'
                    style={{
                      margin: '2px',
                      color: 'rgb(255,255,255)',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.3s ease, transform 0.3s ease', // Smooth interaction effects
                      '&:hover': {
                        // color: 'rgb(200,200,200)', // Change text color on hover
                        textDecoration: 'underline' // Underline text on hover
                      }
                    }}
                  >
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function LandingPage() {
  return (
    <Box>
      <Box sx={{ p: 2, mb: 12, mt: 12 }}>
        <ScrollableRow title='Popular Subjects' data={popularSubjects} showImageAndDescription={false} />
        <ScrollableRow title='Popular Games' data={popularGames} />
        <ScrollableRow title='Popular Quizzes' data={popularQuizzes} />
        <ScrollableRow title='Highly Rated Quizzes' data={highlyRatedQuizzes} />
      </Box>
    </Box>
  )
}

export default LandingPage
