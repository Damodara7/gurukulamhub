// QuizSummary.js
import React from 'react'
import { Box, Typography, Button, Card, Grid, Divider } from '@mui/material'
import { useRouter } from 'next/navigation'
import { formatTime, formatTimeWithUnits } from '@/components/Timer'

const QuizSummary = ({ questions,
  initNewGame,
  selectedAnswers,
  usedHints,
  handleReplay,
  time }) => {
  const router = useRouter()

 // console.log("Selected answers:",selectedAnswers,questions,time)
  // Correct answers count
  const correctAnswersCount = questions.reduce((total, question) => {
    const selectedAnswer = selectedAnswers[question._id]
    // Safely access options; defaults to an empty array if options do not exist
    const correctAnswerIds = question.data.options?.filter(option => option.correct).map(option => option.id) || []

    if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
      // Check if the selected answer is correct
      return selectedAnswer === correctAnswerIds[0] ? total + 1 : total
    } else if (question.templateId === 'multiple-choice') {
      const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
      const isAllCorrect = selectedAnswerIds.every(answerId => correctAnswerIds.includes(answerId))
      const isAnyIncorrect = selectedAnswerIds.some(answerId => !correctAnswerIds.includes(answerId))
      const isExactMatch = selectedAnswerIds.length === correctAnswerIds.length // Ensure exact number of selected answers

      // Add to total if all selected answers are correct, none are incorrect, and the number of selected answers matches
      return isAllCorrect && !isAnyIncorrect && isExactMatch ? total + 1 : total
    }
    return total // Return total if none of the conditions match
  }, 0)

  // Total marks gained
  const totalMarks = questions.reduce((total, question) => {
    const selectedAnswer = selectedAnswers[question._id]
    const correctAnswerIds = question.data.options?.filter(option => option.correct).map(option => option.id) || []

    let gainedMarks = 0

    if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
      // Gain marks if the selected answer is correct
      if (selectedAnswer === correctAnswerIds[0]) {
        gainedMarks += +question.data.marks
      }
    } else if (question.templateId === 'multiple-choice') {
      const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
      const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length
      const incorrectSelected = selectedAnswerIds.filter(answerId => !correctAnswerIds.includes(answerId)).length

      // Award marks only if no incorrect answers are selected
      if (incorrectSelected === 0) {
        gainedMarks += (correctSelected / correctAnswerIds.length) * +question.data.marks
      }
    }

    // Add hintMarks if a hint was used
    const hintUsed = usedHints[question._id]
    const finalMarks = gainedMarks + (hintUsed ? +question.data.hintMarks : 0)

    return total + finalMarks
  }, 0)

  // Optional: Calculate the total percentage based on total marks
  const totalPossibleMarks = questions.reduce((total, question) => total + +question.data.marks, 0)
  const scorePercentage = totalPossibleMarks > 0 ? Math.round((totalMarks / totalPossibleMarks) * 100) : 0

  return (
    <Box
      sx={{
        maxWidth: '700px',
        mx: 'auto',
        mt: 2,
        p: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
     <Box sx={{ mt: 4, textAlign: 'center' }}>
        {/* <Button
          variant='contained'
          onClick={handleReplay}
          color='primary'
          component='label'
          sx={{
            mr: 2,
            color: 'white',
            fontWeight: 600,
            '&:hover': {},
            padding: '10px 20px'
          }}
        >
          Replay Quiz
        </Button>*/}
        <Button
          variant='outlined'
          onClick={() => initNewGame()}//('/game/run')}
          color='primary'
          component='label'
          sx={{
            fontWeight: 600,
            padding: '10px 20px'
          }}
        >
          &lt;- Game Home
        </Button>
      </Box>
      <Typography variant='h4' gutterBottom sx={{ textAlign: 'center',
      fontWeight: 600, color: '#333' }}>
       Game Over : Your Score
      </Typography>

      {/* Time Taken Display */}
      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          mx: 'auto',
          background: 'linear-gradient(45deg, #FF4081 30%, #FFAB40 90%)', // Gradient background
          padding: '10px', // Increased padding for a more spacious feel
          borderRadius: 5,
          color: '#fff',
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', // Strong shadow for depth
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)', // Text shadow for emphasis
          my: 2,
          transition: 'transform 0.3s ease', // Smooth scaling effect
          '&:hover': {},
          position: 'relative', // Positioning for before pseudo-element
          overflow: 'hidden' // To ensure before pseudo-element doesn't overflow
        }}
      >
        <span>⏳ {/* Optional emoji for fun */}</span>
        Time Taken: {time/1000} sec {/* Displaying formatted time */}
      </Typography>

      <Typography
        variant='h6'
        sx={{
          textAlign: 'center',
          backgroundColor: scorePercentage >= 70 ? '#e3f2fd' : '#ffebee',
          padding: '10px',
          borderRadius: 1,
          color: scorePercentage >= 70 ? '#1e88e5' : '#e53935',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        <span>
          You answered {correctAnswersCount} out of {questions.length} correctly
        </span>

        {/* Vertical Divider */}
        <Divider
          orientation='vertical'
          flexItem
          sx={{
            alignSelf: 'stretch', // Ensure the divider stretches to match content height
            borderWidth: '1px',
            borderColor: scorePercentage >= 70 ? '#1e88e5' : '#e53935' // Match the color of the text
          }}
        />

        <span
          sx={{
            fontWeight: 700, // Bold for emphasis
            color: '#333' // Color for total marks
          }}
        >
          Marks: {totalMarks.toFixed(2)} {/* Show two decimal points for precision */}
        </span>
      </Typography>

      <Box sx={{ mt: 4 }}>
        {questions.map((question, index) => {
          const selectedAnswer = selectedAnswers[question._id]
          // Safely access correctAnswers, defaults to an empty array if options do not exist
          const correctAnswers = question.data.options?.filter(option => option.correct) || []

          let gainedMarks = 0
          let incorrectSelected = []

          if (question.templateId === 'single-choice') {
            gainedMarks = selectedAnswer === correctAnswers[0]?.id ? +question.data.marks : 0
          } else if (question.templateId === 'multiple-choice') {
            const correctSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.filter(id => correctAnswers.some(option => option.id === id))
              : []
            incorrectSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.filter(id => !correctAnswers.some(option => option.id === id))
              : []

            // If any incorrect answers are selected, mark the answer as wrong
            if (incorrectSelected.length > 0) {
              gainedMarks = 0
            } else {
              gainedMarks = (correctSelected.length / correctAnswers.length) * +question.data.marks
            }
          } else if (question.templateId === 'true-or-false') {
            gainedMarks = selectedAnswer === correctAnswers[0]?.id ? +question.data.marks : 0
          }

          const hintUsed = usedHints[question._id]
          const finalMarks = gainedMarks + (hintUsed ? question.data.hintMarks || 0 : 0) // hintMarks already negative
        //  console.log('index: ', index, 'gainedMarks: ', gainedMarks, 'finalMarks: ', finalMarks)

          return (
            <Card
              key={question._id}
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}
            >
              <Box className='flex items-center gap-1' sx={{ float: 'right' }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    color:
                      finalMarks > 0
                        ? '#4caf50' // Success green for positive marks
                        : finalMarks === 0
                          ? 'text.primary' // Default color for zero marks
                          : '#f44336' // Error red for negative marks
                  }}
                >
                  {finalMarks > 0
                    ? `+${finalMarks.toFixed(2)} Marks`
                    : finalMarks === 0
                      ? 'No Marks'
                      : `${finalMarks.toFixed(2)} Marks`}
                </Typography>
                {hintUsed && <Typography variant='subtitle1'>{`(Hint used: ${question?.data?.hintMarks})`}</Typography>}
              </Box>

              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                {`${index + 1}. ${question.data.question}`}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  {
                    question.templateId === 'true-or-false'
                      ? question.data.options?.map(option => {
                          const isUserAnswer = Array.isArray(selectedAnswer)
                            ? selectedAnswer.includes(option.id)
                            : selectedAnswer === option.id
                          const isCorrectAnswer = option.correct

                          return (
                            <Grid item xs={6} key={option.id}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 1,
                                  backgroundColor: isUserAnswer
                                    ? isCorrectAnswer
                                      ? '#4caf50' // Correctly answered
                                      : '#f44336' // Incorrectly answered
                                    : isCorrectAnswer
                                      ? '#c8e6c9' // Correct answer, not selected
                                      : '#e0e0e0', // Incorrect answer, not selected
                                  color: isUserAnswer ? 'white' : '#333',
                                  boxShadow: 2,
                                  display: 'flex', // Use flex to align items
                                  flexDirection: 'column', // Stack items vertically
                                  alignItems: 'center', // Center items horizontally
                                  textAlign: 'center', // Center text
                                  height: '100%', // Set height to fill the grid item
                                  flexGrow: 1 // Allow the box to grow and fill space
                                }}
                              >
                                {/* Conditional rendering based on media type */}
                                {option.mediaType === 'image' && option.image && (
                                  <Box
                                    component='img'
                                    src={option.image}
                                    alt={option.text}
                                    sx={{
                                      width: '100%',
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      marginBottom: 1
                                    }}
                                  />
                                )}

                                {option.mediaType === 'video' && option.videoUrl && (
                                  <video
                                    src={option.videoUrl}
                                    controls
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      borderRadius: '4px',
                                      marginBottom: '8px'
                                    }}
                                  />
                                )}

                                {option.mediaType === 'audio' && option.audioUrl && (
                                  <audio
                                    src={option.audioUrl}
                                    controls
                                    style={{
                                      width: '100%',
                                      marginBottom: '8px'
                                    }}
                                  />
                                )}

                                {/* Text Label */}
                                {option.mediaType === 'text' && option.text && (
                                  <Typography variant='body1' sx={{ color: isUserAnswer ? 'white' : '#333' }}>
                                    {option.text}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )
                        }) || null // Ensure to return null if options are undefined
                      : question.data.options?.map(option => {
                          const isUserAnswer = Array.isArray(selectedAnswer)
                            ? selectedAnswer.includes(option.id)
                            : selectedAnswer === option.id
                          const isCorrectAnswer = option.correct

                          return (
                            <Grid item xs={6} sm={3} key={option.id}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 1,
                                  backgroundColor: isUserAnswer
                                    ? isCorrectAnswer
                                      ? '#4caf50' // Correctly answered
                                      : '#f44336' // Incorrectly answered
                                    : isCorrectAnswer
                                      ? '#c8e6c9' // Correct answer, not selected
                                      : '#e0e0e0', // Incorrect answer, not selected
                                  color: isUserAnswer ? 'white' : '#333',
                                  boxShadow: 2,
                                  display: 'flex', // Use flex to align items
                                  flexDirection: 'column', // Stack items vertically
                                  alignItems: 'center', // Center items horizontally
                                  textAlign: 'center', // Center text
                                  height: '100%', // Set height to fill the grid item
                                  flexGrow: 1 // Allow the box to grow and fill space
                                }}
                              >
                                {/* Conditional rendering based on media type */}
                                {option.mediaType === 'image' && option.image && (
                                  <Box
                                    component='img'
                                    src={option.image}
                                    alt={option.text}
                                    sx={{
                                      width: '100%',
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      marginBottom: 1
                                    }}
                                  />
                                )}

                                {option.mediaType === 'video' && option.videoUrl && (
                                  <video
                                    src={option.videoUrl}
                                    controls
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      borderRadius: '4px',
                                      marginBottom: '8px'
                                    }}
                                  />
                                )}

                                {option.mediaType === 'audio' && option.audioUrl && (
                                  <audio
                                    src={option.audioUrl}
                                    controls
                                    style={{
                                      width: '100%',
                                      marginBottom: '8px'
                                    }}
                                  />
                                )}

                                {/* Text Label */}
                                {option.mediaType === 'text' && option.text && (
                                  <Typography variant='body1' sx={{ color: isUserAnswer ? 'white' : '#333' }}>
                                    {option.text}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )
                        }) || null // Ensure to return null if options are undefined
                  }
                </Grid>
              </Box>

              {!correctAnswers.some(answer => selectedAnswer === answer.id) &&
                question.templateId === 'true-or-false' && (
                  <Typography variant='body2' color='error' sx={{ mt: 1, fontStyle: 'italic' }}>
                    {`Your answer is incorrect. The correct answer is "${correctAnswers[0]?.text}".`}
                  </Typography>
                )}
              {!correctAnswers.some(answer => selectedAnswer === answer.id) &&
                question.templateId === 'single-choice' && (
                  <Typography variant='body2' color='error' sx={{ mt: 1, fontStyle: 'italic' }}>
                    {`Your answer is incorrect. The correct answer is "${correctAnswers[0]?.text}".`}
                  </Typography>
                )}
              {question.templateId === 'multiple-choice' && (
                <Typography variant='body2' color='error' sx={{ mt: 1, fontStyle: 'italic' }}>
                  {selectedAnswer &&
                  selectedAnswer.length === correctAnswers.length &&
                  selectedAnswer.every(answerId => correctAnswers.some(answer => answer.id === answerId)) &&
                  incorrectSelected.length === 0
                    ? null // All selected answers are correct, and no incorrect answers, show no message
                    : incorrectSelected.length > 0
                      ? `Your answer is incorrect. The correct answers are ${correctAnswers
                          .map(a => `"${a.text}"`)
                          .join(', ')}.` // Selected incorrect options, entire answer wrong
                      : `Your answer is partially correct. The correct answers are ${correctAnswers
                          .map(a => `"${a.text}"`)
                          .join(', ')}.`}
                </Typography>
              )}
            </Card>
          )
        })}
      </Box>


    </Box>
  )
}

export default QuizSummary
