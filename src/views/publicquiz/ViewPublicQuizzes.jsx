'use client'
import React, { useState, useEffect } from 'react'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import ListSubheader from '@mui/material/ListSubheader'
import IconButton from '@mui/material/IconButton'
import InfoIcon from '@mui/icons-material/Info'
import { Grid, Tooltip, Typography } from '@mui/material'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import YouTubeIcon from '@mui/icons-material/YouTube'
import useMediaQuery from '@mui/material/useMediaQuery'

// components

// utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// import '@/QuizCardList.css'
//import Image from 'next/image';
import Image from 'mui-image'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import IconButtonTooltip from '@/components/IconButtonTooltip'

export default function ViewPublicQuizzes({}) {
  const router = useRouter()
  const mdScreenMatches = useMediaQuery('(min-width:768px)') // Adjust breakpoint as needed
  const [publishedQuizzes, setPublishedQuizzes] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleViewQuiz(quiz) {
    router.push(`/publicquiz/view/${quiz._id}`)
  }
  async function handlePlayQuiz(quiz) {
    router.push(`/publicquiz/play/${quiz._id}`)
  }

  async function getPublishedQuizzes() {
    setLoading(true)
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}?approvalState=published&privacyFilter=PUBLIC`)
    if (result?.status === 'success') {
      // toast.success('Published quizzes fetched successfully.')
      setLoading(false)
      setPublishedQuizzes(result.result)
    } else {
      // toast.error('Error fetching quizzes: ' + result?.result?.message)
      setLoading(false)
      setPublishedQuizzes([])
    }
  }

  useEffect(() => {
    getPublishedQuizzes()
  }, [])

  return (
    <>
      <Grid container rowSpacing={2} justifyContent='center'>
        <Typography variant='h4'>All Public Quizzes</Typography>
        <Grid item xs={12} md={12}>
          {loading && <Loading />}
          {!loading && (
            <ImageList
              className='myImageList'
              style={{ margin: 'auto', width: mdScreenMatches ? '100%' : '85%' }}
              gap={10}
              cols={mdScreenMatches ? 4 : 1}
            >
              {publishedQuizzes.length > 0 ? (
                <>
                  {publishedQuizzes.map(item => (
                    <ImageListItem
                      key={item.id}
                      style={{
                        minHeight: '248px',
                        maxHeight: '300px',
                        maxWidth: '350px',
                        padding: '0',
                        alignContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePlayQuiz(item)}
                    >
                      <Image
                        src={`${item.thumbnail || 'https://fakeimg.pl/250x250/?text=' + item.title}`}
                        alt={item.title}
                        // sx={{ maxHeight: '300px', maxWidth: '300px' }}
                        fit='fill'
                      />

                      <ImageListItemBar
                        sx={{
                          background: 'rgba(0, 0, 0, 0.7)', // Darker background for better visibility of text and icons
                          display: 'flex',
                          flexDirection: 'column', // Stack items vertically
                          alignItems: 'stretch', // Align items to the left
                          padding: 0,
                          '& .MuiImageListItemBar-titleWrap': {
                            marginBottom: '2px', // Space between title/details and the buttons
                            padding: '1px 4px'
                          },
                          '& .MuiImageListItemBar-title': {
                            fontSize: '14px', // Font size for title
                            color: '#fff', // White title color
                            marginBottom: '2px'
                          },
                          '& .MuiImageListItemBar-subtitle': {
                            fontSize: '12px', // Font size for subtitle
                            color: '#ccc', // Lighter color for subtitle/details
                            marginTop: '0px'
                          }
                        }}
                        title={
                          <div
                            style={{
                              fontSize: '14px',
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.title}
                          </div>
                        }
                        subtitle={
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#ccc',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {item.details}
                          </div>
                        }
                        actionIcon={
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.1)', // Background for button container
                              borderRadius: '4px',
                              padding: '1px',
                              alignSelf: 'stretch',
                              width: '100%'
                            }}
                          >
                            {/*
                              <IconButtonTooltip title='View'
                                sx={{ color: 'white' }}
                                aria-label={`view quiz ${item.title}`}
                                onClick={e => {
                                  e.stopPropagation()
                                  handleViewQuiz(item)
                                }}
                              >
                                <VisibilityOutlinedIcon />
                              </IconButtonTooltip> */}
                              <IconButtonTooltip title='Play'
                                sx={{ color: 'white' }}
                                aria-label={`play quiz ${item.title}`}
                                onClick={e => {
                                  e.stopPropagation()
                                  handlePlayQuiz(item)
                                }}
                              >
                                <PlayCircleFilledWhiteOutlinedIcon />
                              </IconButtonTooltip>
                          </div>
                        }
                      />
                    </ImageListItem>
                  ))}
                </>
              ) : (
                'No Published Quizzes'
              )}
            </ImageList>
          )}
        </Grid>
      </Grid>
    </>
  )
}
