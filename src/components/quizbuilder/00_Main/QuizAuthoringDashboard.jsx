// React Imports
'use client'
import { useState, useContext } from 'react'
//AIzaSyA94nv6wyjZdFlcEBKzBXQVON2pyf8iRCU google api key.
// MUI Imports
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import useUser from '@/utils/useUser' // Replace with your hook path
import QuizTreeSearch from '../QuizTreeSearch'
import QuizQuestionBuilder from '../02_QuestionBuilder/MainQuizQuestionBuilder'

import MainSelectQuizContextForm from '@components/quizbuilder/01_QuizContext/MainSelectQuizContextForm'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material'
import QuizDetails from '@/components/quiz-builder-1/QuizDetails'
import CustomTabList from '@/@core/components/mui/TabList'
import QuizIcon from '@mui/icons-material/Quiz'
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined'
import ViewQuizzesPopup from '../01_QuizContext/ViewQuizzesPopup'
import QuizPlayer from '@components/quizplayer/00_Main'

const quizData = {
  id: 'QZ_280c09fa-0e70-40cf-b268-fe7762cd8ece',
  title: 'My Quiz',
  details: 'test details',
  owner: 'pvr@triesoltech.com',
  language: {
    code: 'te',
    name: 'Telugu',
    _id: {
      $oid: '66c6e59a2f6fe7c0ba077abe'
    }
  }
}

const QuizAuthoringDashboard = () => {
  // States
  const [value, setValue] = useState('quiz-context')
  const { user, isLoading } = useUser()
  const [isMinimizedBool, setIsMinimizedBool] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null) //quizData
  const [isQuizzesPopupOpen, setIsQuizzesPopupOpen] = useState(false)

  const tabContentsObject = {
    'quiz-context': (
      <MainSelectQuizContextForm
        setIsMinimizedBool={setIsMinimizedBool}
        setSelectedQuiz={setSelectedQuiz}
        user={user}
      />
    ),
    'question-builder': <QuizQuestionBuilder data={selectedQuiz} />,
    preview: (
      <>
        <QuizPlayer selectedQuiz={selectedQuiz}></QuizPlayer>
      </>
    ),
    translate: <Typography>translate Panel</Typography>
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  function handleOpenQuizzesPopup() {
    setIsQuizzesPopupOpen(true)
  }
  function handleCloseQuizzesPopup() {
    setIsQuizzesPopupOpen(false)
  }

  function handleSelectQuiz(quiz) {
    setSelectedQuiz(quiz)
    setIsMinimizedBool(false)
    handleCloseQuizzesPopup()
  }

  const TranslateSVGIcon = () => {
    const svgMarkup = `
            <svg  xmlns="http://www.w3.org/2000/svg"
            width="32" height="32"
            viewBox="0 0 32 32"
            fill="currentColor"
            >
               {/* // <g class="layer">
                  //  <title>Translate</title>
                  //  <g id="svg_8"> */}
                        <path d="m7.62017,27.725195l0,-5.891896l2.474435,2.463712l1.347085,-1.346448l-4.776901,-4.774632l-4.776901,4.774632l1.347088,1.346448l2.474435,-2.463712l0,5.891896c0,1.053285 0.856975,1.909854 1.91076,1.909854l8.598422,0l0,-1.909854l-8.598422,0zm19.671278,-19.49005l-2.474435,2.463712l0,-5.891898c0,-1.052328 -0.856977,-1.909851 -1.91076,-1.909851l-8.598422,0l0,1.909851l8.598422,0l0,5.891898l-2.474435,-2.463712l-1.347088,1.346448l4.776901,4.774632l4.776901,-4.774632l-1.347085,-1.346448z"/>

                        <text font-family="serif" font-weight="bold" font-size="24" id="svg_2" strokeWidth="2" text-anchor="middle" transform="matrix(1.20342 0 0 0.749751 51.4665 84.2324)" x="-36.427829" xml:space="preserve" y="-94.136469">a</text>
                         <text  font-family="serif" font-size="24" id="svg_4" strokeWidth="2" text-anchor="middle" transform="matrix(0.240997 0 0 0.234543 -102.151 -145.735)" x="508.767739" xml:space="preserve" y="693.209692" />
                        <text  font-family="serif" font-weight="bold" font-size="24" id="svg_7" strokeWidth="2" text-anchor="middle" transform="matrix(0.61848 0 0 0.665295 -118.129 -140.24)" x="229.147386" xml:space="preserve" y="253.187568">ఆ</text>

                   {/* // </g>
                </g> */}
            </svg>`

    return <div dangerouslySetInnerHTML={{ __html: svgMarkup }} />
  }

  if (isLoading) {
    return <p>Loading Data...</p>
  }

  return (
    <div style={{}}>
      <TabContext value={value}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                value='quiz-context'
                label={
                  <div className='flex items-center gap-1.5'>
                    <TrackChangesOutlinedIcon />
                    {/* <i className='fluent-mdl2:learning-tools' /> */}
                    Quiz Context
                  </div>
                }
                // icon={<i icon='fluent-mdl2:learning-tools' />}
              ></Tab>
              <Tab
                value='question-builder'
                label={
                  <div className='flex items-center gap-1.5'>
                    <PsychologyAltOutlinedIcon />
                    {/* <i className='ri-group-line text-lg' /> */}
                    Question Builder
                  </div>
                }
                // icon={<i fontWeight='bold' strokeWidth='2px' icon='arcticons:lego-builder' />}
              />
              <Tab
                value='preview'
                label={
                  <div className='flex items-center gap-1.5'>
                    <PreviewOutlinedIcon />
                    {/* <i className='ri-group-line text-lg' /> */}
                    Play
                  </div>
                }
                // icon={<i icon='material-symbols:preview-outline-sharp' />}
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <TranslateOutlinedIcon />
                    {/* <i className='ri-group-line text-lg' /> */}
                    Translate
                  </div>
                }
                value='translate'
                // icon={<TranslateSVGIcon />}
              />
              {/* <Tab value='4' label='Comments' icon={<i icon="vaadin:comments-o" width="2.2rem" height="2.2rem" />} /> */}
              {/* <Tab value='5' label='Review' icon={<i icon="pajamas:review-checkmark" width="2.2rem" height="2.2rem" />} /> */}
            </CustomTabList>
          </Grid>

          {value !== 'quiz-context' && (
            <Grid item xs={12} textAlign='center'>
              <Button variant='outlined' onClick={handleOpenQuizzesPopup}>
                Select Quiz
              </Button>
              {isQuizzesPopupOpen && (
                <ViewQuizzesPopup
                  isOpen={isQuizzesPopupOpen}
                  onClose={handleCloseQuizzesPopup}
                  onSelectQuiz={handleSelectQuiz}
                />
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            <QuizDetails
              quiz={selectedQuiz}
            />
          </Grid>

          <Grid item xs={12}>
            <TabPanel value={value} className='p-0'>
              {tabContentsObject[value]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </div>
  )
}

export default QuizAuthoringDashboard
