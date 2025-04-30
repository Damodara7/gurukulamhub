'use client'
import {
  Button,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tab,
  Tooltip,
  Typography,
  useMediaQuery
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
import FileOpenIcon from '@mui/icons-material/FileOpen'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import PublishIcon from '@mui/icons-material/Publish'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import PublicOffOutlinedIcon from '@mui/icons-material/PublicOffOutlined'

import Image from 'mui-image'

import TabContext from '@mui/lab/TabContext'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import CenterBox from '@/components/CenterBox'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const QuizBuilderView = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [myQuizzes, setMyQuizzes] = useState([])
  const [activeTab, setActiveTab] = useState('PUBLIC')
  const mdScreenMatches = useMediaQuery('(min-width:768px)')

  function handleBuildQuiz(quiz) {
    router.push(`/myquizzes/builder/${quiz._id}`)
  }

  async function handleViewQuiz(quiz) {
    router.push(`/myquizzes/view/${quiz._id}`)
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
    <TabContext value={activeTab}>
      <CenterBox>
        <Typography className='mb-1'>Draft Quizzes</Typography>
      </CenterBox>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <div className='w-full flex justify-center'>
            <CustomTabList
              onChange={handleChangeTab}
              variant='scrollable'
              pill='true'
              scrollButtons='auto'
              allowScrollButtonsMobile
            >
              <Tab
                value='PUBLIC'
                label={
                  <div className='flex items-center gap-1.5'>
                    <PublicOutlinedIcon />
                    Public
                  </div>
                }
              />
              <Tab
                value='PRIVATE'
                label={
                  <div className='flex items-center gap-1.5'>
                    <PublicOffOutlinedIcon />
                    Private
                  </div>
                }
              />
            </CustomTabList>
          </div>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab}>
            <ImageList className='myImageList' gap={10} cols={mdScreenMatches ? 4 : 2}>
              {myQuizzes.length > 0
                ? myQuizzes?.map(item => {
                    if (item.thumbnail.length === 0) {
                      item.thumbnail = 'https://fakeimg.pl/250x250/?text=' + item.title
                    }
                    return (
                      <ImageListItem
                        key={item.id}
                        style={{
                          minHeight: '248px',
                          padding: '0',
                          alignContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleBuildQuiz(item)}
                      >
                        <Image
                          //srcSet={`${item.thumbnail}?w=248&fit=crop&auto=format&dpr=2 2x`}
                          src={`${item.thumbnail}`}
                          //?w=248&fit=crop&auto=format`}
                          alt={item.title}
                          // sx={{ maxHeight: '300px', maxWidth: '300px' }}
                          fit='fill'
                        />

                        <ImageListItemBar
                          sx={{
                            '& .MuiImageListItemBar-titleWrap': {
                              padding: '2px 4px'
                              // color: 'red', // Override title color
                              // fontSize: '18px', // Override font size
                            }
                          }}
                          style={{ padding: '1px', margin: '0px' }}
                          title={<div style={{ padding: '0px' }}>{item.title.substring(0, 12)}</div>}
                          subtitle={item.details.substring(0, 16) + '..'}
                          actionIcon={
                            <div
                              style={{ display: 'flex', gap: mdScreenMatches ? '10px' : '5px', alignItems: 'center' }}
                            >
                                <IconButtonTooltip title='Build'
                                  sx={{ color: 'white' }}
                                  aria-label={`build quiz ${item.title}`}
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleBuildQuiz(item)
                                  }}
                                >
                                  <BuildOutlinedIcon />
                                </IconButtonTooltip>
                              {/*
                                  <IconButtonTooltip title=''
                                    sx={{ color: 'white' }}
                                    aria-label={`view quiz ${item.title}`}
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleViewQuiz(item)
                                    }}
                                  >
                                    <VisibilityOutlinedIcon />
                                  </IconButtonTooltip> */}

                              {/* {item.privacy === 'PUBLIC' && (
                                    <IconButtonTooltip title=''
                                      sx={{ color: 'white' }}
                                      aria-label='send for approval'
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleSendToApproval(item)
                                      }}
                                    >
                                      <SendIcon />
                                    </IconButtonTooltip>
                                )} */}
                              {/* {item.privacy === 'PRIVATE' && (
                                <IconButtonTooltip title=''
                                  sx={{ color: 'white' }}
                                  aria-label='publish'
                                  onClick={e => {
                                    e.stopPropagation()
                                    handlePublishPrivateQuiz(item)
                                  }}
                                >
                                  <PublishIcon />
                                </IconButtonTooltip>
                            )} */}
                              {/* 
                              <IconButtonTooltip title=''
                                sx={{ color: 'red' }}
                                aria-label={`info about ${item.owner}`}
                                onClick={e => {
                                  handleStartDeleteQuiz(item, e)
                                }}
                              >
                                <DeleteIcon />
                              </IconButtonTooltip> */}
                            </div>
                          }
                        />
                      </ImageListItem>
                    )
                  })
                : 'No Quizzes Exist'}
            </ImageList>
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default QuizBuilderView
