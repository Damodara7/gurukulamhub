'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
import IconButton from '@mui/material/IconButton'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import MuteIcon from '@mui/icons-material/VolumeUp'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
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
  Grid,
  Tooltip
} from '@mui/material'
import { CheckCircle as CheckCircleIcon, Cancel as CancelIcon, PushPin as PushPinIcon } from '@mui/icons-material'

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

const VideoPortionPlayer = ({ data }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [previousTime, setPreviousTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionsToShow, setQuestionsToShow] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSegmentId, setCurrentSegmentId] = useState(null); // Use segment _id instead of index
  const [hasStarted, setHasStarted] = useState(false); // Track if the video has started for the first time

  const questions = data?.questions || [];
  const recommendedSegments = data?.recommendedSegments || [];

  function onEnded(userAnswers) {
    setIsPlaying(false);
    setIsMuted(false);
    setIsPaused(false);
    console.log(userAnswers);
  }

  // Sort recommended segments by start time
  // If no recommended segments exist, consider the whole video as a segment
  const sortedSegments = recommendedSegments.length > 0
    ? recommendedSegments.sort((a, b) => a.startTime - b.startTime)
    : [{ _id: 'default', startTime: 0, endTime: duration }]; // Default full video segment

  // Filter and sort questions whose invocation time falls within any segment
  const filteredQuestions = questions.filter((q) => {
    return sortedSegments.some(
      (segment) => q.invocationTime >= segment.startTime && q.invocationTime <= segment.endTime
    );
  });

  // Sort filtered questions by invocation time
  const sortedInsertedQuestions = filteredQuestions
    .filter((q) => !q.invocationAtEnd)
    .sort((a, b) => a.invocationTime - b.invocationTime || new Date(a.createdAt) - new Date(b.createdAt));

  const sortedEndQuestions = filteredQuestions
    .filter((q) => q.invocationAtEnd)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const allSortedQuestions = [...sortedInsertedQuestions, ...sortedEndQuestions];

  // Calculate total marks based on filtered questions
  const totalMarks = allSortedQuestions.reduce((sum, q) => sum + q.marks, 0);

  useEffect(() => {
    if (!playerRef.current) return;

    // Start the video from the beginning of the first recommended segment on first play
    if (!hasStarted && sortedSegments.length > 0) {
      const firstSegment = sortedSegments[0];
      playerRef.current.seekTo(firstSegment.startTime, 'seconds');
      setCurrentSegmentId(firstSegment._id);
      setHasStarted(true);
    }

    const interval = setInterval(() => {
      const time = Math.floor(playerRef.current.getCurrentTime());
      setCurrentTime(time);

      // Check if there's a question at the current time within any segment
      const questionsAtCurrentTime = allSortedQuestions.filter((q) => {
        return q.invocationTime === time;
      });

      // Check if the current time is within a segment
      const currentSegment = sortedSegments.find(segment => segment._id === currentSegmentId);
      if (currentSegment && time >= currentSegment.endTime) {
        // Move to the next segment
        const nextSegment = sortedSegments.find(segment => segment.startTime > currentSegment.endTime);
        if (nextSegment) {
          // If no questions at currentSegment's endTime
          if (questionsAtCurrentTime.length === 0) {
            setCurrentSegmentId(nextSegment._id);
            playerRef.current.seekTo(nextSegment.startTime, 'seconds');
            // handleSeek(nextSegment.startTime)
            setIsPlaying(true); // Ensure the video resumes playing after seeking
            setIsPaused(false); // Ensure the video is not paused
          }
        } else {
          // If no questions at currentSegment's endTime
          if (questionsAtCurrentTime.length === 0) {
            // Loop back to the first segment
            const firstSegment = sortedSegments[0];
            setCurrentSegmentId(firstSegment._id);
            playerRef.current.seekTo(firstSegment.startTime, 'seconds');
            // handleSeek(firstSegment.startTime)
            setIsPlaying(true); // Ensure the video resumes playing after seeking
            setIsPaused(false); // Ensure the video is not paused
          }
        }
      }

      if (questionsAtCurrentTime.length > 0 && !isPaused) {
        // Pause the video immediately when a question is detected
        setIsPlaying(false);
        setIsPaused(true);
        // playerRef.current?.seekTo(time, 'seconds'); // Ensuring the video stays at the same time
        handleSeek(time)
        setQuestionsToShow(questionsAtCurrentTime);
        setShowQuestion(true);
        setCurrentQuestionIndex(0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPaused, allSortedQuestions, currentSegmentId, sortedSegments, hasStarted]);

  useEffect(() => {
    if (showQuestion && isPlaying) {
      setIsPlaying(false); // Ensure the video is paused when a question is shown
    }
  }, [showQuestion, isPlaying]);

  useEffect(() => {
    if (!showQuestion && questionsToShow.length > 0) {
      setShowQuestion(true);
    }
  }, [currentQuestionIndex]);


  const handleAnswer = (question, selectedOptions) => {
    if (!question || !question.options) return;

    // Check if the question already exists in userAnswers
    const isQuestionAlreadyAnswered = userAnswers.some(
      (answer) => answer.questionId === question._id
    );

    // If the question is already answered, return early
    if (isQuestionAlreadyAnswered) {
      return;
    }

    const isCorrect =
      question.type === 'multiple-choice'
        ? selectedOptions.length === question.options.filter((o) => o.isCorrect).length &&
        selectedOptions.every((id) => question.options.find((o) => o._id === id)?.isCorrect)
        : selectedOptions.length === 1 && question.options.find((o) => o._id === selectedOptions[0])?.isCorrect;

    const answerSummary = {
      questionId: question._id,
      marks: question.marks,
      isCorrect,
      selectedOptionIds: selectedOptions,
      correctOptionIds: question.options.filter((o) => o.isCorrect).map((o) => o._id),
    };

    setUserAnswers((prev) => [...prev, answerSummary]);
  };

  useEffect(() => {
    if (!showQuestion && questionsToShow.length > 0) {
      setShowQuestion(true);
    }
  }, [currentQuestionIndex]);

  const handleContinue = () => {
    if (currentQuestionIndex < questionsToShow.length - 1) {
      // If there are more questions in the current set, show the next question
      setShowQuestion(false);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions in the current set have been answered
      if (userAnswers.length === allSortedQuestions.length) {
        onEnded(userAnswers);
      }

      // Check if the current time is at or beyond the end of the current segment
      const currentSegment = sortedSegments.find(segment => segment._id === currentSegmentId);
      console.log('currentSegment: ', currentSegment);
      console.log('currentTime: ', currentTime);

      if (currentSegment && currentTime >= currentSegment.endTime) {
        console.log('Entered: if (currentSegment && currentTime >= currentSegment.endTime)');
        // Move to the next segment
        const nextSegment = sortedSegments.find(segment => segment.startTime > currentSegment.endTime);
        if (nextSegment) {
          console.log('Entered: if (nextSegment)');
          setCurrentSegmentId(nextSegment._id);
          playerRef.current.seekTo(nextSegment.startTime, 'seconds');
        } else {
          console.log('Not Entered: if (nextSegment)');
          // Loop back to the first segment
          const firstSegment = sortedSegments[0];
          setCurrentSegmentId(firstSegment._id);
          playerRef.current.seekTo(firstSegment.startTime, 'seconds');
        }
      } else {
        console.log('Not Entered: if (currentSegment && currentTime >= currentSegment.endTime)');
        // Resume playback from the current time + 1 second
        playerRef.current.seekTo(currentTime + 1, 'seconds');
      }

      // Resume the video
      setShowQuestion(false);
      setIsPaused(false);
      setIsPlaying(true);
      setQuestionsToShow([]);
      setCurrentQuestionIndex(0); // Reset the current question index
    }
  };

  const handleOnVideoEnd = () => {
    setIsPlaying(false);
    setIsMuted(false);

    if (sortedEndQuestions.length > 0) {
      setQuestionsToShow(sortedEndQuestions);
      setShowQuestion(true);
      setCurrentQuestionIndex(0);
    } else {
      onEnded(userAnswers);
    }
  };

  const handleOnProgress = (state) => {
    const currentTime = state.playedSeconds;

    // Detect a significant change in time (indicating a seek)
    if (Math.abs(currentTime - previousTime) > 2) {
      console.log('Seek detected:', currentTime);
      handleSeek(currentTime); // Call your seek logic
    }

    setCurrentTime(currentTime);
    setPreviousTime(currentTime); // Update previousTime
  };

  const handleOnDuration = (videoDuration) => {
    setDuration(videoDuration);
  };

  const handleSeek = (time) => {
    console.log('handleSeek: ', time);
    let targetTime = time; // Default to the seek time
    let targetSegment = null;

    // Case 1: If the seek time is before the first segment, start from the first segment's start time
    if (time < sortedSegments[0].startTime) {
      targetSegment = sortedSegments[0];
      targetTime = targetSegment.startTime; // Start from the beginning of the first segment
    }
    // Case 2: If the seek time is after the last segment, start from the last segment's start time
    else if (time > sortedSegments[sortedSegments.length - 1].endTime) {
      targetSegment = sortedSegments[sortedSegments.length - 1];
      targetTime = targetSegment.startTime; // Start from the beginning of the last segment
    }
    // Case 3: If the seek time is within a segment (including start and end time), play from that exact time
    else {
      for (let i = 0; i < sortedSegments.length; i++) {
        const segment = sortedSegments[i];
        if (time >= segment.startTime && time <= segment.endTime) {
          // If the seek time is within a segment, play from that exact time
          targetSegment = segment;
          targetTime = time; // Use the seek time directly
          break;
        } else if (i < sortedSegments.length - 1 && time > segment.endTime && time < sortedSegments[i + 1].startTime) {
          // If the seek time is between two segments, start from the next segment's start time
          targetSegment = sortedSegments[i + 1];
          targetTime = targetSegment.startTime; // Start from the beginning of the next segment
          break;
        }
      }
    }

    // Seek to the target time
    if (targetSegment) {
      playerRef.current.seekTo(targetTime, 'seconds');
      setCurrentSegmentId(targetSegment._id);
    }
  };

  const handlePlayQuestion = (question) => {
    // Seek to the conceptStartTime of the question
    playerRef.current.seekTo(question.conceptStartTime, 'seconds');
    setIsPlaying(true);
    setIsPaused(false);
  };

  const formatTime = (timeInSeconds) => {
    const pad = (num) => num.toString().padStart(2, '0'); // Helper to pad single-digit numbers
  
    const hours = Math.floor(timeInSeconds / 3600);
    const remainingSeconds = timeInSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
  
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`; // Format: H:MM:SS
    } else {
      return `${minutes}:${pad(seconds)}`; // Format: M:SS
    }
  };

  const calculateTotalDuration = (segments) => {
    return segments.reduce((total, segment) => {
      return total + (segment.endTime - segment.startTime);
    }, 0);
  };

  const renderMarkers = (clips) => {
    return (
      <>
        {clips.map((clip, index) => {
          const startPosition = (clip.startTime / duration) * 100;
          const endPosition = (clip.endTime / duration) * 100;
          const width = endPosition - startPosition; // Width of the highlighted portion

          return (
            <React.Fragment key={clip.id}>
              {/* Highlighted Clip Portion */}
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  bottom: '0px',
                  top: '-10px',
                  width: `${width}%`,
                  height: '4px', // Thickness of the highlight on progress bar
                  backgroundColor: 'white',
                  opacity: 0.8,
                  borderRadius: '2px',
                  zIndex: 0,
                }}
              />

              {/* Start Time Marker */}
              <Tooltip title={`${formatTime(clip.startTime)}`} placement='top'>
                <div
                  style={{
                    position: 'absolute',
                    left: `${startPosition-1}%`,
                    bottom: '8px',
                    cursor: 'pointer',
                    zIndex: 0
                  }}
                >
                  <PushPinIcon
                    color='primary'
                    sx={{ color: 'white' }}
                    onClick={() => playerRef.current?.seekTo(clip.startTime, 'seconds')}
                  />
                </div>
              </Tooltip>

              {/* End Time Marker */}
              <Tooltip title={`${formatTime(clip.endTime)}`} placement='top'>
                <div
                  style={{
                    position: 'absolute',
                    left: `${endPosition - 1}%`,
                    bottom: '8px',
                    cursor: 'pointer',
                    zIndex: 0
                  }}
                >
                  <PushPinIcon
                    color='secondary'
                    sx={{ color: 'white' }}
                    onClick={() => playerRef.current?.seekTo(clip.endTime, 'seconds')}
                  />
                </div>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <ReactPlayer
          ref={playerRef}
          playsinline
          width={'100%'}
          height={'300px'}
          url={data.url}
          playing={isPlaying}
          controls={true}
          muted={isMuted}
          onError={(e) => console.error('Video error occurred:', e)}
          onEnded={handleOnVideoEnd}
          onProgress={handleOnProgress}
          onDuration={handleOnDuration}
        />
        {/* Custom Track Markers for All Clips */}
        <Box
          sx={{
            position: 'absolute',
            height: '5px',
            left: '11px',
            right: '11px',
            bottom: '35px'
          }}
        >
          {renderMarkers(sortedSegments)}
        </Box>
      </div>

      {/* Total Recommended Duration */}
    <Typography variant='body1' className='mt-2'>
      Total Recommended Duration: {formatTime(calculateTotalDuration(sortedSegments))}
    </Typography>

      {/* Completed Questions */}
      {userAnswers.length > 0 && <div className='mt-3'>
        <Typography variant='h5' className='mb-2'>
          Questions:
        </Typography>
        <div className='mt-2' style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px', paddingRight: '8px' }}>
          {userAnswers
            // Map userAnswers to include invocationTime
            .map(({ questionId }) => {
              const question = allSortedQuestions.find((q) => q._id === questionId);
              return {
                questionId,
                invocationTime: question.invocationTime,
                question,
              };
            })
            // Sort by invocationTime
            .sort((a, b) => a.invocationTime - b.invocationTime).
            map(({ questionId, question }, index) => {
              return <div
                key={questionId}
                style={{
                  borderBottom: index < userAnswers.length - 1 ? '1px solid #ccc' : 'none',
                  marginBottom: index < userAnswers.length - 1 ? '10px' : '0'
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='h6' gutterBottom>
                    {index + 1}. {question.text}
                  </Typography>
                  <Button size='small' onClick={() => handlePlayQuestion(question)}>
                    Play Concept
                  </Button>
                </Box>
              </div>
            })}
        </div>
      </div>}

      {showQuestion && questionsToShow.length > 0 && (
        <QuestionDialog
          question={questionsToShow[currentQuestionIndex]}
          handleContinue={handleContinue}
          handleAnswer={handleAnswer}
          open={showQuestion}
        />
      )}
    </div>
  );
};

export default VideoPortionPlayer;