'use client'
import {
  Button,
  Grid,
  Tab,
  Typography,
  useMediaQuery,
  Box,
  Card,
  CardContent,
  Stack,
  Container,
  useTheme,
  alpha,
  CircularProgress,
  Chip
} from '@mui/material'
import ViewQuizzesPopup from '../../components/quizbuilder/01_QuizContext/ViewQuizzesPopup'
import ViewQuiz from '@/components/quizbuilder/01_QuizContext/ViewQuiz'
import { useEffect, useState } from 'react'
import theme from '@/@core/theme'
import { useRouter } from 'next/navigation'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import CustomTabList from '@/@core/components/mui/TabList'
import TabPanel from '@mui/lab/TabPanel'

// MUI icons
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import PublicOffOutlinedIcon from '@mui/icons-material/PublicOffOutlined'
import DraftIcon from '@mui/icons-material/Draft'
import LanguageIcon from '@mui/icons-material/Language'
import QuizIcon from '@mui/icons-material/Quiz'

import TabContext from '@mui/lab/TabContext'
import * as RestApi from '@/utils/restApiUtil'

const QuizBuilderView = ({isAdmin=false}) => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [myQuizzes, setMyQuizzes] = useState([])
  const [activeTab, setActiveTab] = useState('PUBLIC')
  const mdScreenMatches = useMediaQuery('(min-width:768px)')
  const theme = useTheme()

  function handleBuildQuiz(quiz) {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/builder/${quiz._id}`)
  }

  async function handleViewQuiz(quiz) {
    router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view/${quiz._id}`)
  }

  async function getQuizData() {
    // toast.success('Fetching My Quiz Data now...')
    setLoading(true)
    const result = await RestApi.get(
      `${API_URLS.v0.USERS_QUIZ}?email=${session?.user?.email}&approvalState=draft&privacyFilter=${activeTab}`
    )
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
  }, [activeTab])

  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 6 }}>
      <TabContext value={activeTab}>
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: 'white',
            pt: { xs: 3, md: 4 },
            pb: { xs: 3, md: 4 },
            borderBottom: '1px solid #e8eaed',
            mb: 4
          }}
        >
          <Container maxWidth="xl">
            <Stack spacing={2}>
              {/* Title */}
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <DraftIcon sx={{ fontSize: { xs: 28, md: 36 }, color: 'primary.main' }} />
                Draft Quizzes
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#5f6368', maxWidth: '800px' }}>
                Manage and build your draft quizzes. Filter by privacy settings to organize your work.
              </Typography>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl">
          {/* Tabs Section */}
          <Box
            sx={{
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px solid #e8eaed',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              mb: 4,
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CustomTabList
                onChange={handleChangeTab}
                variant='scrollable'
                pill='true'
                scrollButtons='auto'
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 44,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }
                }}
              >
                <Tab
                  value='PUBLIC'
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PublicOutlinedIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1" fontWeight={600}>Public</Typography>
                    </Stack>
                  }
                />
                <Tab
                  value='PRIVATE'
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PublicOffOutlinedIcon sx={{ fontSize: 20 }} />
                      <Typography variant="body1" fontWeight={600}>Private</Typography>
                    </Stack>
                  }
                />
              </CustomTabList>
            </Box>
          </Box>

          {/* Content Area */}
          <TabPanel value={activeTab}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '400px' 
              }}>
                <Stack spacing={2} alignItems="center">
                  <CircularProgress size={48} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Loading quizzes...
                  </Typography>
                </Stack>
              </Box>
            ) : myQuizzes.length > 0 ? (
              <Grid container spacing={3}>
                {myQuizzes.map(item => {
                  const thumbnail = item.thumbnail?.length > 0 
                    ? item.thumbnail 
                    : `https://fakeimg.pl/400x250/?text=${encodeURIComponent(item.title || 'Quiz')}`
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'white',
                          border: '1px solid #e8eaed',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            transform: 'scaleX(0)',
                            transformOrigin: 'left',
                            transition: 'transform 0.3s ease',
                            zIndex: 1
                          },
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                            '&::before': {
                              transform: 'scaleX(1)'
                            },
                            '& .quiz-image': {
                              transform: 'scale(1.08)'
                            },
                            '& .build-button': {
                              opacity: 1,
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                        onClick={() => handleBuildQuiz(item)}
                      >
                        {/* Thumbnail */}
                        <Box
                          sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            height: 180,
                            bgcolor: alpha(theme.palette.primary.main, 0.08)
                          }}
                        >
                          <Box
                            component="img"
                            className="quiz-image"
                            src={thumbnail}
                            alt={item.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s ease'
                            }}
                            onError={(e) => {
                              e.target.src = `https://fakeimg.pl/400x250/?text=${encodeURIComponent(item.title || 'Quiz')}`
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)'
                            }}
                          />
                          
                          {/* Privacy Badge */}
                          <Chip
                            icon={item.privacy === 'PUBLIC' ? <PublicOutlinedIcon /> : <PublicOffOutlinedIcon />}
                            label={item.privacy || 'DRAFT'}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: item.privacy === 'PUBLIC' 
                                ? alpha(theme.palette.success.main, 0.9)
                                : alpha(theme.palette.warning.main, 0.9),
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />

                          {/* Build Button Overlay */}
                          <Box
                            className="build-button"
                            sx={{
                              position: 'absolute',
                              bottom: 12,
                              left: 12,
                              opacity: 0,
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<BuildOutlinedIcon />}
                              component="label"
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                                '&:hover': {
                                  bgcolor: 'primary.dark',
                                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.5)}`
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleBuildQuiz(item)
                              }}
                            >
                              Build
                            </Button>
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <CardContent
                          sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            p: 2.5,
                            gap: 1.5
                          }}
                        >
                          {/* Title */}
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              fontSize: '1.1rem',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: 52,
                              color: 'text.primary'
                            }}
                          >
                            {item.title || 'Untitled Quiz'}
                          </Typography>

                          {/* Details */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.6,
                              fontSize: '0.875rem',
                              minHeight: 40,
                              flexGrow: 1
                            }}
                          >
                            {item.details || 'No description available'}
                          </Typography>

                          {/* Footer Info */}
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1.5}
                            sx={{
                              pt: 1.5,
                              borderTop: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            {item.language && (
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <LanguageIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                </Box>
                                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                                  {item.language?.name || 'Unknown'}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  p: 8
                }}
              >
                <QuizIcon
                  sx={{
                    fontSize: 80,
                    color: 'text.secondary',
                    mb: 3,
                    opacity: 0.5
                  }}
                />
                <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                  No Draft Quizzes Found
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: '400px' }}>
                  {activeTab === 'PUBLIC' 
                    ? "You don't have any public draft quizzes yet. Create one to get started!"
                    : "You don't have any private draft quizzes yet. Create one to get started!"}
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Container>
      </TabContext>
    </Box>
  )
}

export default QuizBuilderView
