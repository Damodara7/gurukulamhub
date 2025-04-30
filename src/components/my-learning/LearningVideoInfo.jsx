import React, { useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import IconButton from '@mui/material/IconButton'
import {
  Dialog,
  DialogTitle,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  DialogContent,
  RadioGroup,
  Radio,
  Box,
  Grid,
  DialogActions
} from '@mui/material'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material'

const QuestionSummaryDialog = ({ open, question, answers, handleContinue }) => {
  const answer = answers.find(ans => ans.questionId === question._id)

  const isCorrect = answer.isCorrect
  const marks = answer.marks
  const selectedOptions = answer.selectedOptionIds || []

  console.log({ question, selectedOptions })

  return (
    <Dialog open={open} fullWidth maxWidth='sm'>
      <DialogContent>
        <Typography variant='h6' gutterBottom>
          {question.text}
        </Typography>
        <>
          {/* Show the options with correct/wrong indications */}
          {question.type === 'single-choice' && (
            <RadioGroup>
              <Grid container spacing={0}>
                {question.options.map((option, idx) => (
                  <Grid item xs={12} key={option._id}>
                    <FormControlLabel
                      value={option._id}
                      control={<Radio checked={selectedOptions.includes(option._id)} />}
                      label={
                        <>
                          {option.text}{' '}
                          <span
                            style={{
                              color: option.isCorrect
                                ? 'green'
                                : selectedOptions.includes(option._id)
                                  ? 'red'
                                  : 'inherit'
                            }}
                          >
                            {option.isCorrect ? '✓' : selectedOptions.includes(option._id) ? '✗' : ''}
                          </span>
                        </>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          )}

          {question.type === 'multiple-choice' && (
            <Grid container spacing={0}>
              {question.options.map((option, idx) => (
                <Grid item xs={12} key={option._id}>
                  <FormControlLabel
                    control={<Checkbox checked={selectedOptions.includes(option._id)} />}
                    label={
                      <>
                        {option.text}{' '}
                        <span
                          style={{
                            color: option.isCorrect ? 'green' : selectedOptions.includes(option._id) ? 'red' : 'inherit'
                          }}
                        >
                          {option.isCorrect ? '✓' : selectedOptions.includes(option._id) ? '✗' : ''}
                        </span>
                      </>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <Box mt={5}>
            <Box display='flex' alignItems='center' mb={2}>
              {isCorrect ? (
                <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
              ) : (
                <CancelIcon style={{ color: 'red', marginRight: 8 }} />
              )}
              <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red' }}>
                {isCorrect ? ' Your answer is correct.' : 'Your answer is incorrect.'}
              </Typography>
            </Box>

            <Typography variant='h6'>Explanation:</Typography>
            <Typography variant='body1' gutterBottom>
              {question.explanation}
            </Typography>
            {isCorrect && (
              <Typography variant='h6' mt={4} style={{ color: 'green' }}>
                You gained <span style={{ color: 'green' }}>{` +${marks} Mark(s) `}</span>
              </Typography>
            )}
          </Box>

          <Box display='flex' justifyContent='flex-end' mt={2}>
            <Button
              component='label'
              sx={{ color: 'white' }}
              variant='contained'
              color='primary'
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </>
      </DialogContent>
    </Dialog>
  )
}

function LearningVideoInfo({ data, open, onClose }) {
  const playerRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [duration, setDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [questionsToShow, setQuestionsToShow] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showedAnswersCount, setShowedAnswersCount] = useState(0)
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [isManualPlay, setIsManualPlay] = useState(false) // New state to track manual play

  const questions = data?.video?.questions || []

  const sortedInsertedQuestions = questions
    .filter(q => !q.invocationAtEnd)
    .sort((a, b) => a.invocationTime - b.invocationTime || new Date(a.createdAt) - new Date(b.createdAt))

  const sortedEndQuestions = questions
    .filter(q => q.invocationAtEnd)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const allSortedQuestions = [...sortedInsertedQuestions, ...sortedEndQuestions]

  useEffect(() => {
    if (!playerRef.current || isManualPlay) return // Skip if manual play is active

    const interval = setInterval(() => {
      const time = Math.floor(playerRef.current.getCurrentTime())
      setCurrentTime(time)

      const questionsAtCurrentTime = allSortedQuestions.filter(q => q.invocationTime === time)

      if (questionsAtCurrentTime.length > 0 && !isPaused) {
        setIsPaused(true)
        setIsPlaying(false)
        setQuestionsToShow(questionsAtCurrentTime)
        setShowQuestion(true)
        setCurrentQuestionIndex(0) // Start with the first question
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isPaused, allSortedQuestions, isManualPlay])

  useEffect(() => {
    // Whenever the currentQuestionIndex of questionsToShow is changed
    // & the questionsToShow.length > 0
    //  then do ->  setShowQuestion(true)
    if (!showQuestion && questionsToShow.length > 0) {
      setShowQuestion(true)
    }
  }, [currentQuestionIndex])

  const handleContinue = () => {
    setShowedAnswersCount(showedAnswersCount + 1)
    if (currentQuestionIndex < questionsToShow.length - 1) {
      // Close the current question by -> setShowQuestion(false)
      // move currentQuestionIndex to the next question
      // And then make the setShowQuestion(true) if(!showQuestion && questionsToShow.length > 0) using above useEffect
      setShowQuestion(false)
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      if (showedAnswersCount + 1 === allSortedQuestions.length) {
        onEnded()
      }

      // All questions have been answered, resume the video
      setShowQuestion(false)
      setIsPaused(false)
      setIsPlaying(true)
      setQuestionsToShow([])
      setCurrentQuestionIndex(0) // Reset the current question index
      setIsManualPlay(false)
      playerRef.current.seekTo(currentTime + 1, 'seconds')
    }
  }

  useEffect(() => {
    if (isPaused && playerRef.current) {
      playerRef.current.seekTo(currentTime, 'seconds')
    }
  }, [isPaused, currentTime])

  const handleOnProgress = state => {
    setCurrentTime(state.playedSeconds)
  }

  const handleOnDuration = videoDuration => {
    setDuration(videoDuration)
  }

  const onEnded = () => {
    setIsPlaying(false)
    setIsMuted(false)
    setIsPaused(false)
    setCurrentQuestionIndex(0)
    setShowQuestion(false)
  }

  const handleOnVideoEnd = () => {
    setIsPlaying(false)
    setIsMuted(false)

    if (sortedEndQuestions.length > 0) {
      setQuestionsToShow(sortedEndQuestions)
      setShowQuestion(true)
      setCurrentQuestionIndex(0) // Start with the first question
    } else {
      onEnded()
    }
  }

  const toggleExpand = questionId => {
    setExpandedQuestions(prevState => ({
      ...prevState,
      [questionId]: !prevState[questionId]
    }))
  }

  const handlePlayQuestionConcept = (conceptStartTime, question) => {
    // console.log(question)
    // setCurrentTime(conceptStartTime)
    playerRef.current.seekTo(conceptStartTime+1, 'seconds')
    // setIsManualPlay(true) // Disable automatic question dialogs
    // setIsPlaying(true)
    // setIsPaused(false)
    // setQuestionsToShow([question]) // Show only the selected question
    // setShowQuestion(true)
    // setCurrentQuestionIndex(0)
  }

  return (
    <Dialog open={open} maxWidth='lg' fullWidth onClose={onClose}>
      <DialogTitle
        variant='h4'
        className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Video & Your Answers
        <Typography component='span' className='flex flex-col text-center'>
          Review your answer for this video.
        </Typography>
      </DialogTitle>
      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-10 sm:pli-16'>
        <IconButtonTooltip title='Close' onClick={onClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>
        <ReactPlayer
          ref={playerRef}
          playsinline
          width={'100%'}
          height={'400px'}
          url={data?.video?.url}
          playing={isPlaying} // Ensure this is linked to the `isPlaying` state
          loop={false}
          controls={true}
          muted={isMuted}
          onError={e => console.error('Video error occurred:', e)}
          onEnded={handleOnVideoEnd}
          onProgress={handleOnProgress}
          onDuration={handleOnDuration}
        />

        {/* Answers summary */}
        <div className='mt-2' style={{ maxHeight: '410px', overflowY: 'auto', padding: '4px', paddingRight: '8px' }}>
          <Typography variant='h5' className='mb-3'>
            Your Answers Summary:
          </Typography>
          {questions.map((question, index) => {
            const answer = data?.answers.find(ans => ans.questionId === question._id)
            const isCorrect = answer.isCorrect
            const marks = answer.marks
            const selectedOptions = answer.selectedOptionIds || []
            const isExpanded = expandedQuestions[question._id]

            return (
              <div
                key={question._id}
                style={{
                  borderBottom: index < questions.length - 1 ? '1px solid #ccc' : 'none',
                  marginBottom: index < questions.length - 1 ? '10px' : '0'
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <div>
                    <Typography variant='h6' gutterBottom>
                      {index + 1}. {question.text}
                    </Typography>
                    {!isExpanded && (
                      <Box mt={1}>
                        <Box display='flex' alignItems='center' mb={2}>
                          {isCorrect ? (
                            <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
                          ) : (
                            <CancelIcon style={{ color: 'red', marginRight: 8 }} />
                          )}
                          <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red' }}>
                            {isCorrect ? `Correct.` : 'Incorrect.'}
                          </Typography>
                          {isCorrect && (
                            <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red', marginLeft: '40px' }}>
                              {` +${marks} Mark(s) `}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </div>
                  <Box>
                    <IconButtonTooltip title={isExpanded ? 'Hide' : 'View'} onClick={() => toggleExpand(question._id)}>
                      <i className={isExpanded ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButtonTooltip>
                    <IconButtonTooltip title='Play' onClick={() => handlePlayQuestionConcept(question.conceptStartTime, question)}>
                      <i className='ri-play-circle-line' />
                    </IconButtonTooltip>
                  </Box>
                </Box>
                {isExpanded && (
                  <>
                    {question.type === 'single-choice' && (
                      <RadioGroup>
                        <Grid container spacing={0}>
                          {question.options.map((option, idx) => (
                            <Grid item xs={12} key={option._id}>
                              <FormControlLabel
                                value={option._id}
                                control={<Radio checked={selectedOptions.includes(option._id)} />}
                                label={
                                  <>
                                    {option.text}{' '}
                                    <span
                                      style={{
                                        color: option.isCorrect
                                          ? 'green'
                                          : selectedOptions.includes(option._id)
                                            ? 'red'
                                            : 'inherit'
                                      }}
                                    >
                                      {option.isCorrect ? '✓' : selectedOptions.includes(option._id) ? '✗' : ''}
                                    </span>
                                  </>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </RadioGroup>
                    )}

                    {question.type === 'multiple-choice' && (
                      <Grid container spacing={0}>
                        {question.options.map((option, idx) => (
                          <Grid item xs={12} key={option._id}>
                            <FormControlLabel
                              control={<Checkbox checked={selectedOptions.includes(option._id)} />}
                              label={
                                <>
                                  {option.text}{' '}
                                  <span
                                    style={{
                                      color: option.isCorrect
                                        ? 'green'
                                        : selectedOptions.includes(option._id)
                                          ? 'red'
                                          : 'inherit'
                                    }}
                                  >
                                    {option.isCorrect ? '✓' : selectedOptions.includes(option._id) ? '✗' : ''}
                                  </span>
                                </>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    <Box mt={4}>
                      <Box display='flex' alignItems='center' mb={2}>
                        {isCorrect ? (
                          <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
                        ) : (
                          <CancelIcon style={{ color: 'red', marginRight: 8 }} />
                        )}
                        <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red' }}>
                          {isCorrect ? 'Your answer is correct.' : 'Your answer is incorrect.'}
                        </Typography>
                        {isCorrect && (
                          <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red', marginLeft: '40px' }}>
                            {` +${marks} Mark(s) `}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant='h6'>Explanation:</Typography>
                      <Typography variant='body1' gutterBottom>
                        {question.explanation}
                      </Typography>
                    </Box>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Show inserted questions while the video is playing */}
        {showQuestion && questionsToShow.length > 0 && (
          <QuestionSummaryDialog
            question={questionsToShow[currentQuestionIndex]}
            answers={data.answers}
            handleContinue={handleContinue}
            open={showQuestion}
          />
        )}
      </DialogContent>
      <DialogActions className='gap-2 justify-center'>
        <Button component='label' variant='contained' style={{ color: 'white' }} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LearningVideoInfo
