import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import IconButton from '@mui/material/IconButton'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import MuteIcon from '@mui/icons-material/VolumeUp'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import {
  Dialog,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  DialogContent,
  RadioGroup,
  Radio,
  Box,
  Grid
} from '@mui/material'
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material'

const QuestionDialog = ({ open, question, handleAnswer, handleContinue }) => {
  const [selectedOptions, setSelectedOptions] = useState([]) // Ids
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  console.log({ question, selectedOptions })

  const handleOptionChange = (event, optionId) => {
    if (question.type === 'single-choice') {
      setSelectedOptions([optionId])
    } else {
      // For multiple-choice questions
      const updatedOptions = event.target.checked
        ? [...selectedOptions, optionId]
        : selectedOptions.filter(id => id !== optionId)
      setSelectedOptions(updatedOptions)
    }
  }

  const handleSubmit = () => {
    if (!question || !question.options) return

    if (question.type === 'multiple-choice') {
      const correctOptions = question.options.map((o, idx) => (o.isCorrect ? o._id : null)).filter(id => id !== null)

      // Ensure all correct options are selected and no extra options are chosen
      const correct =
        selectedOptions.length === correctOptions.length && selectedOptions.every(id => correctOptions.includes(id))

      setIsCorrect(correct)
    } else {
      // Single-choice logic remains the same
      const correct =
        selectedOptions.length === 1 && question.options.find(op => op._id === selectedOptions[0])?.isCorrect

      setIsCorrect(correct)
    }

    setSubmitted(true)

    // Log the user's answer
    handleAnswer(question, selectedOptions)
  }

  return (
    <Dialog open={open} fullWidth maxWidth='sm'>
      <DialogContent>
        <Typography variant='h6' gutterBottom>
          {question.text}
        </Typography>
        {!submitted ? (
          <>
            {question.type === 'single-choice' && (
              <RadioGroup onChange={event => handleOptionChange(event, event.target.value)}>
                <Grid container spacing={1}>
                  {question.options.map((option, idx) => (
                    <Grid item xs={12} key={option._id}>
                      <FormControlLabel value={option._id} control={<Radio />} label={option.text} />
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            )}
            {question.type === 'multiple-choice' && (
              <Grid container spacing={1}>
                {question.options.map((option, idx) => (
                  <Grid item xs={12} key={option._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOptions.includes(option._id)}
                          onChange={event => handleOptionChange(event, option._id)}
                        />
                      }
                      label={option.text}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            <Box display='flex' justifyContent='flex-end' mt={2}>
              <Button
                component='label'
                sx={{ color: 'white' }}
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                disabled={selectedOptions.length === 0} // Disable until at least one option is selected
              >
                Submit
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* Show the options with correct/wrong indications */}
            {question.type === 'single-choice' && (
              <RadioGroup>
                <Grid container spacing={1}>
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
              <Grid container spacing={1}>
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

            <Box mt={5}>
              <Box display='flex' alignItems='center' mb={2}>
                {isCorrect ? (
                  <CheckCircleIcon style={{ color: 'green', marginRight: 8 }} />
                ) : (
                  <CancelIcon style={{ color: 'red', marginRight: 8 }} />
                )}
                <Typography variant='h6' style={{ color: isCorrect ? 'green' : 'red' }}>
                  {isCorrect ? 'Great! Your answer is correct.' : "Oops! That's not correct."}
                </Typography>
              </Box>
              <Typography variant='h6'>Explanation:</Typography>
              <Typography variant='body1' gutterBottom>
                {question.explanation}
              </Typography>
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
        )}
      </DialogContent>
    </Dialog>
  )
}

const VideoPlayer = ({
  url,
  showPause = false,
  width = '100%',
  height = '300px',
  showMute = false,
  muted = true,
  autoPlay = true,
  row = true,
  loop = false,
  controls = false, // Start with controls off, will turn on when video completes
  onEnded = () => {},
  isLastVideo = false, // Determines if this is the last video
  remainingVideos = 0, // Number of remaining videos
  questions = [],
  isVideoCompleted = false,
  onPlay = () => {}
}) => {
  const playerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(muted)
  const [videoControls, setVideoControls] = useState(isVideoCompleted)
  const [duration, setDuration] = useState(0)
  const [lastPlayedTime, setLastPlayedTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [questionsToShow, setQuestionsToShow] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // Track the current question index in questionsToShow at a particualr time

  const sortedInsertedQuestions = questions
    .filter(q => !q.invocationAtEnd)
    .sort((a, b) => a.invocationTime - b.invocationTime || new Date(a.createdAt) - new Date(b.createdAt))

  const sortedEndQuestions = questions
    .filter(q => q.invocationAtEnd)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const allSortedQuestions = [...sortedInsertedQuestions, ...sortedEndQuestions]

  useEffect(() => {
    setQuestionsToShow([])
    setUserAnswers([])
    setShowQuestion(false)
    setIsPaused(false)
    setIsPlaying(autoPlay)
    setCurrentQuestionIndex(0) // Reset the current question index
  }, [url])

  useEffect(() => {
    setIsPlaying(autoPlay)
  }, [autoPlay])

  useEffect(() => {
    if (!playerRef.current) return

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
  }, [isPaused, allSortedQuestions])

  const handleAnswer = (question, selectedOptions) => {
    if (!question || !question.options) return

    const isCorrect =
      question.type === 'multiple-choice'
        ? selectedOptions.length === question.options.filter(o => o.isCorrect).length &&
          selectedOptions.every(id => question.options.find(o => o._id === id)?.isCorrect)
        : selectedOptions.length === 1 && question.options.find(o => o._id === selectedOptions[0])?.isCorrect

    const answerSummary = {
      questionId: question._id,
      marks: question.marks,
      isCorrect,
      selectedOptionIds: selectedOptions,
      correctOptionIds: question.options.filter(o => o.isCorrect).map(o => o._id)
    }

    setUserAnswers(prev => [...prev, answerSummary])
  }

  useEffect(() => {
    // Whenever the currentQuestionIndex of questionsToShow is changed
    // & the questionsToShow.length > 0
    //  then do ->  setShowQuestion(true) 
    if (!showQuestion && questionsToShow.length > 0) {
      setShowQuestion(true)
    }
  }, [currentQuestionIndex])

  const handleContinue = () => {
    if (currentQuestionIndex < questionsToShow.length - 1) {
       // Close the current question by -> setShowQuestion(false)
       // move currentQuestionIndex to the next question
       // And then make the setShowQuestion(true) if(!showQuestion && questionsToShow.length > 0) using above useEffect
      setShowQuestion(false)
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      if (userAnswers.length === allSortedQuestions.length) {
        onEnded(userAnswers)
      }

      // All questions have been answered, resume the video
      setShowQuestion(false)
      setIsPaused(false)
      setIsPlaying(true)
      setQuestionsToShow([])
      setCurrentQuestionIndex(0) // Reset the current question index
      playerRef.current.seekTo(currentTime + 1, 'seconds')
    }
  }

  const handlePlayPause = () => setIsPlaying(prev => !prev)
  const handleMute = () => setIsMuted(prev => !prev)

  const handleOnVideoEnd = () => {
    setIsPlaying(false)
    setIsMuted(false)
    setVideoControls(true)

    if (sortedEndQuestions.length > 0) {
      setQuestionsToShow(sortedEndQuestions)
      setShowQuestion(true)
      setCurrentQuestionIndex(0) // Start with the first question
    } else {
      onEnded(userAnswers)
    }
  }

  useEffect(() => {
    if (isPaused && playerRef.current) {
      playerRef.current.seekTo(currentTime, 'seconds')
    }
  }, [isPaused, currentTime])

  const handleOnProgress = state => {
    setLastPlayedTime(state.playedSeconds)
    setCurrentTime(state.playedSeconds)
  }

  const handleOnDuration = videoDuration => {
    setDuration(videoDuration)
  }

  useEffect(() => {
    if (isLastVideo && remainingVideos === 0) {
      setVideoControls(true)
    }
  }, [isLastVideo, remainingVideos])

  return (
    <div
      className='video-ad'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: row ? 'row' : 'column',
        minWidth: width,
        minHeight: height,
        gap: '8px'
      }}
    >
      <ReactPlayer
        ref={playerRef}
        playsinline
        width={width}
        height={height}
        url={url}
        playing={isPlaying} // Ensure this is linked to the `isPlaying` state
        loop={loop}
        controls={videoControls}
        muted={isMuted}
        onError={e => console.error('Video error occurred:', e)}
        onEnded={handleOnVideoEnd}
        onProgress={handleOnProgress}
        onDuration={handleOnDuration}
        onPlay={onPlay}
      />
      {!videoControls && (
        <div className='flex items-center'>
          {showMute && (
            <IconButtonTooltip
            title={"Volume Off"} onClick={handleMute} color='info' aria-label='Mute/Unmute'>
              {isMuted ? <VolumeOffIcon /> : <MuteIcon />}
            </IconButtonTooltip>
          )}
          {showPause && (
            <IconButtonTooltip title={"Pause"} onClick={handlePlayPause} color='info' aria-label='Play/Pause'>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButtonTooltip>
          )}
        </div>
      )}

      {/* Show questions while the video is playing */}
      {showQuestion && questionsToShow.length > 0 && (
        <QuestionDialog
          question={questionsToShow[currentQuestionIndex]} // Show the current question
          handleContinue={handleContinue}
          handleAnswer={handleAnswer}
          open={showQuestion}
        />
      )}
    </div>
  )
}

export default VideoPlayer
