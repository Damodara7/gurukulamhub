import React, { useEffect, useState } from 'react'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle,
  CircularProgress,
  Tabs,
  Tab,
  Button
} from '@mui/material'
import CenterBox from '@/components/CenterBox'
// import FileOpenIcon from '@mui/icons-material/FileOpen'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function MyQuizCardList({ itemData = [], onSelectQuiz }) {
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

  function handleClickOnQuiz(quiz) {
    onSelectQuiz(quiz)
  }

  return (
    <Box
      sx={{
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: 2
      }}
    >
      {itemData.length > 0 ? (
        itemData.map(item => (
          <Box
            key={item.id}
            className='mb-1'
            style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', borderRadius: '5px', cursor: 'pointer' }}
          >
            <Card
              key={item.id}
              style={{
                minWidth: cardWidth,
                maxWidth: cardWidth,
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                height: '100%',
                boxShadow: 'none'
              }}
              onClick={() => handleClickOnQuiz(item)}
            >
              <CardMedia
                component='img'
                image={item.thumbnail || 'https://via.placeholder.com/150'}
                alt={item.title}
                sx={{
                  width: '100%',
                  aspectRatio: '16/9', // This ensures responsive sizing, adjust ratio as needed
                  objectFit: 'cover' // Keeps the image well proportioned inside the container
                }}
              />
              <CardContent style={{ padding: '4px 6px 6px' }}>
                <Typography
                  variant='h6'
                  fontSize='0.7rem'
                  component='div'
                  sx={{ marginBottom: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
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
                    marginBottom: 0
                  }}
                >
                  {item.details}
                </Typography>
              </CardContent>
              {/* <div style={{ padding: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButtonTooltip title='' sx={{ padding: '0px', color: 'rgb(255, 255, 255)' }}>
                    <FileOpenIcon />
                  </IconButtonTooltip>
                </div> */}
            </Card>
          </Box>
        ))
      ) : (
        <CenterBox>
          <Alert
            sx={{ padding: '0.5rem' }}
            severity=''
            icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
            color='error'
          >
            No quizes exist!
          </Alert>
        </CenterBox>
      )}
    </Box>
  )
}

const MyQuizes = ({ data, theme }) => {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [myQuizzes, setMyQuizzes] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const router = useRouter()

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  function handleOnSelectQuiz(quiz) {
    console.log('Selected quiz: ', quiz)
    router.push(`/myquizzes/view/${quiz._id}`)
  }

  async function getQuizData() {
    // toast.success('Fetching My Quiz Data now...')
    setLoading(true)
    const result = await RestApi.get(`${ApiUrls.v0.USERS_QUIZ}?email=${session?.user?.email}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      // toast.success('Quizzes Fetched Successfully .')
      setLoading(false)
      setMyQuizzes(result.result)
    } else {
      // toast.error('Error:' + result?.result?.message)
      console.log('Error Fetching quizes:', result)
      setLoading(false)
      setMyQuizzes([])
    }
  }

  useEffect(() => {
    getQuizData()
  }, [])

  return (
    <Box
      sx={{
        mb: 5,
        pb: 1,
        borderRadius: 1,
        background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 25%, rgba(225,213,254,1) 99%)'
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
        aria-label='quiz tabs'
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
        <Tab label='My Quizzes' />
        <Tab label='Create' />
      </Tabs>

      <Box sx={{ mt: 3, mx: 2 }}>
        {activeTab === 0 &&
          (!loading ? (
            <MyQuizCardList onSelectQuiz={handleOnSelectQuiz} itemData={myQuizzes} />
          ) : (
            <CenterBox>
              <CircularProgress />
            </CenterBox>
          ))}

        {activeTab === 1 && (
          <CenterBox>
            {/* Insert Create Quiz content here */}
            <Link href='/myquizzes/create'>
              <Button color='primary' component='label' variant='contained'>
                Create Quiz
              </Button>
            </Link>
          </CenterBox>
        )}
      </Box>
    </Box>
  )
}

export default MyQuizes
