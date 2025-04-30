'use client'

import React, { useState } from 'react'
import { Box, Typography, Card, CardContent, CardMedia, Grid, useTheme, useMediaQuery, Tabs, Tab } from '@mui/material'
import { stringToColor } from '@/utils/stringToColor'
import MyQuizes from './MyQuizes'
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
  }
]

const upcomingGames = [
  {
    id: 1,
    title: 'Game 3',
    description: 'Upcoming game description',
    image: 'https://i0.wp.com/onwardsci.com/wp-content/uploads/2022/05/Onward-Science-Quiz.png?fit=1000%2C600&ssl=1'
  },
  {
    id: 2,
    title: 'Game 4',
    description: 'Upcoming game description',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSajsqjGXZgBU1LOb4hjr5A3bFlFX8A7wF2sA&s'
  }
]

const myGames = [
  {
    id: 1,
    title: 'My Game 1',
    description: 'Description of my game',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSajsqjGXZgBU1LOb4hjr5A3bFlFX8A7wF2sA&s'
  },
  {
    id: 2,
    title: 'My Game 2',
    description: 'Another game description',
    image: 'https://i.pinimg.com/originals/97/eb/07/97eb070a716533fa642bd6462e4727a2.jpg'
  },
  {
    id: 3,
    title: 'My Game 3',
    description: 'Yet another game',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtsis7QJ-K8T6l7M57XaSwozssP2vWOh6pFQ&s'
  },
  {
    id: 4,
    title: 'My Game 4',
    description: 'The final game in my collection',
    image: 'https://i0.wp.com/onwardsci.com/wp-content/uploads/2022/05/Onward-Science-Quiz.png?fit=1000%2C600&ssl=1'
  }
]

const popularSubjects = [
  { id: 1, title: 'Math' },
  { id: 2, title: 'Science' },
  { id: 3, title: 'Indian History' }
]

const mySubjects = [
  { id: 1, title: 'English' },
  { id: 2, title: 'Geography' }
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
  },

  {
    id: 3,
    title: 'Mahabharata',
    description: 'Test your knowledge with Mahabharata quizzes',
    image: 'https://i.pinimg.com/originals/97/eb/07/97eb070a716533fa642bd6462e4727a2.jpg'
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
    <Box sx={{ mx: 'auto' }}>
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
          <Box
            key={item.id}
            className='mb-1'
            style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', borderRadius: '5px' }}
          >
            {showImageAndDescription && (
              <Card
                style={{
                  minWidth: cardWidth, // Adjust based on desired card width
                  maxWidth: cardWidth,
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: 'none'
                }}
              >
                <CardMedia
                  component='img'
                  image={item.image}
                  alt={item.title}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9', // This ensures responsive sizing, adjust ratio as needed
                    objectFit: 'cover' // Keeps the image well proportioned inside the container
                  }}
                />
                <CardContent style={{ padding: '4px 6px 6px' }}>
                  <Typography
                    fontSize='0.7rem'
                    gutterBottom
                    variant='h6'
                    component='div'
                    style={{
                      marginBottom: '4px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='subtitle1'
                    color='text.secondary'
                    fontSize='0.6rem'
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      marginBottom: 0 /* Ensure no extra space at the bottom */
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            )}
            {!showImageAndDescription && (
              <Card
                key={item.id}
                style={{
                  minWidth: cardWidth, // Adjust based on desired card width
                  maxWidth: cardWidth,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: 'none',
                  height: '100%',
                  backgroundColor: stringToColor(item.title)
                }}
              >
                <CardContent
                  style={{
                    padding: '8px'
                  }}
                >
                  <Typography
                    gutterBottom
                    variant='h6'
                    component='div'
                    sx={{ marginBottom: '2px', color: 'rgb(255,255,255)' }} /* Reduce space between items */
                    style={{
                      marginBottom: '2px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis'
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

const GamesTabs = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box
      sx={{
        mb: 5,
        background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 25%, rgba(225,213,254,1) 99%)',
        pb: 1,
        borderRadius: 1
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor='primary'
        textColor='primary'
        variant='scrollable' // Makes the tabs scrollable
        scrollButtons='auto' // Adds scroll buttons when necessary
        allowScrollButtonsMobile // Allows the scroll buttons to appear on mobile devices
        aria-label='games tabs'
        sx={{
          mb: 2,
          background: 'transparent',
          borderRadius: '5px',
          minHeight: 'unset', // Remove default padding
          '& .MuiTabs-flexContainer': {
            justifyContent: 'flex-start',
            marginLeft: 0,
            paddingLeft: 0
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '12px',
            px: 2, // Padding inside each tab
            minWidth: 'auto', // Ensures tabs shrink on smaller screens
            margin: 0 // Remove any extra margin
          },
          '& .MuiTabScrollButton-root': {
            width: 'auto' // Adjust scroll buttons to avoid extra space
          }
        }}
      >
        <Tab label='My Games' />
        <Tab label='Popular Games' />
        <Tab label='Upcoming Games' />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <ScrollableRow data={myGames} />}
        {activeTab === 1 && <ScrollableRow data={popularGames} />}
        {activeTab === 2 && <ScrollableRow data={upcomingGames} />}
      </Box>
    </Box>
  )
}

const SubjectsTabs = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box
      sx={{
        mb: 5,
        background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 25%, rgba(225,213,254,1) 99%)',
        pb: 1,
        borderRadius: 1
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor='primary'
        textColor='primary'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        aria-label='subjects tabs'
        sx={{
          mb: 2,
          background: 'transparent',
          borderRadius: '5px',
          minHeight: 'unset',
          '& .MuiTabs-flexContainer': {
            justifyContent: 'flex-start',
            marginLeft: 0,
            paddingLeft: 0
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '12px',
            px: 2,
            minWidth: 'auto',
            margin: 0
          },
          '& .MuiTabScrollButton-root': {
            width: 'auto'
          }
        }}
      >
        <Tab label='My Subjects' />
        <Tab label='Popular Subjects' />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <ScrollableRow data={mySubjects} showImageAndDescription={false} />}
        {activeTab === 1 && <ScrollableRow data={popularSubjects} showImageAndDescription={false} />}
      </Box>
    </Box>
  )
}

// Tab component for Highly Rated Quizzes
const HighlyRatedQuizzesTabs = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box
      sx={{
        mb: 5,
        background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 25%, rgba(225,213,254,1) 99%)',
        pb: 1,
        borderRadius: 1
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor='primary'
        textColor='primary'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        aria-label='highly rated quizzes tabs'
        sx={{
          borderRadius: '5px',
          mb: 2,
          background: 'transparent',
          minHeight: 'unset',
          '& .MuiTabs-flexContainer': {
            justifyContent: 'flex-start'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '12px',
            px: 2,
            minWidth: 'auto',
            margin: 0
          }
        }}
      >
        <Tab label='Highly Rated Quizzes' />
      </Tabs>

      <Box sx={{ mt: 3 }}>{activeTab === 0 && <ScrollableRow data={highlyRatedQuizzes} />}</Box>
    </Box>
  )
}

function HomeDashboardPage() {
  return (
    <Box className='flex justify-center'>
      <Box sx={{ p: 0, mb: 10, mt: 22 }}>
        <MyQuizes />
        <SubjectsTabs />
        <GamesTabs />
        <HighlyRatedQuizzesTabs />
      </Box>
    </Box>
  )
}

export default HomeDashboardPage
