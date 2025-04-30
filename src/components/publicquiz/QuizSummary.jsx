// QuizSummary.js
import React from 'react'
import { Box, Typography, Button, Card, Grid, Divider, TextField } from '@mui/material'
import { useRouter } from 'next/navigation'
import { formatTime, formatTimeWithUnits } from '../Timer'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const QuizSummary = ({ questions, selectedAnswers, usedHints, handleReplay, time }) => {
  const router = useRouter()

  console.log({ selectedAnswers })

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
    } else if (question.templateId === 'fill-in-blank') {
      const correctBlanks = question.data.question.filter(part => part.type === 'blank') || [] // Get all the correct blanks
      const selectedBlankAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer] // Ensure selected answers are an array

      // Check if every selected blank answer matches the corresponding correct blank
      const isAllCorrect = selectedBlankAnswers.every(answer => {
        const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
        return correctBlank && answer.content.trim().toLowerCase() === correctBlank.content.trim().toLowerCase()
      })

      // Check if any blank answer is incorrect (not matching any correct blank)
      const isAnyIncorrect = selectedBlankAnswers.some(answer => {
        const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
        return !correctBlank || answer.content.trim().toLowerCase() !== correctBlank.content.trim().toLowerCase()
      })

      // Ensure the number of selected answers matches the number of correct blanks
      const isExactMatch = selectedBlankAnswers.length === correctBlanks.length

      // Add to total if all selected answers are correct, none are incorrect, and the number of selected answers matches
      return isAllCorrect && !isAnyIncorrect && isExactMatch ? total + 1 : total
    }

    return total // Return total if none of the conditions match
  }, 0)

  // Total marks gained
  // const totalMarks = questions.reduce((total, question) => {
  //   const selectedAnswer = selectedAnswers[question._id]
  //   const correctAnswerIds = question.data?.options?.filter(option => option.correct).map(option => option.id) || []

  //   let gainedMarks = 0

  //   if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
  //     // Gain marks if the selected answer is correct
  //     if (selectedAnswer === correctAnswerIds[0]) {
  //       gainedMarks += +question.data.marks
  //     }
  //   } else if (question.templateId === 'multiple-choice') {
  //     const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
  //     const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length
  //     const incorrectSelected = selectedAnswerIds.filter(answerId => !correctAnswerIds.includes(answerId)).length

  //     // // Award marks only if no incorrect answers are selected
  //     // if (incorrectSelected === 0) {
  //     gainedMarks += (correctSelected / correctAnswerIds.length) * +question.data.marks
  //     // }
  //   } else if (question.templateId === 'fill-in-blank') {
  //     const correctBlanks = question.data.question.filter(part => part.type === 'blank') || [] // Get all the correct blanks
  //     const selectedBlankAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer] // Ensure selected answers are an array

  //     // Filter correct answers
  //     const correctSelected = selectedBlankAnswers.filter(answer => {
  //       const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
  //       return correctBlank && answer.content.trim().toLowerCase() === correctBlank.content.trim().toLowerCase()
  //     }).length

  //     // Filter incorrect answers
  //     const incorrectSelected = selectedBlankAnswers.filter(answer => {
  //       const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
  //       return !correctBlank || answer.content.trim().toLowerCase() !== correctBlank.content.trim().toLowerCase()
  //     }).length

  //     // Award marks only if no incorrect answers are selected
  //     // if (incorrectSelected === 0) {
  //     gainedMarks += (correctSelected / correctBlanks.length) * +question.data.marks
  //     // }
  //   }

  //   // Add hintMarks if a hint was used
  //   const hintUsed = usedHints[question._id]
  //   const finalMarks = gainedMarks + (hintUsed ? +question.data.hintMarks : 0)

  //   return total + finalMarks
  // }, 0)
  // Total marks gained
  const totalMarks = questions.reduce((total, question) => {
    const selectedAnswer = selectedAnswers[question._id] || [] // Ensure fallback to an array or value
    const correctAnswerIds = question.data?.options?.filter(option => option.correct).map(option => option.id) || []

    let gainedMarks = 0

    if (question.templateId === 'single-choice' || question.templateId === 'true-or-false') {
      // Gain marks if the selected answer is correct
      if (selectedAnswer === correctAnswerIds[0]) {
        gainedMarks += Number(question.data?.marks) || 0 // Safeguard against invalid marks
      }
    } else if (question.templateId === 'multiple-choice') {
      const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer]
      const correctSelected = selectedAnswerIds.filter(answerId => correctAnswerIds.includes(answerId)).length
      const incorrectSelected = selectedAnswerIds.filter(answerId => !correctAnswerIds.includes(answerId)).length

      // Avoid division by zero
      if (correctAnswerIds.length > 0) {
        gainedMarks += (correctSelected / correctAnswerIds.length) * (Number(question.data?.marks) || 0)
      }
    } else if (question.templateId === 'fill-in-blank') {
      const correctBlanks = question.data?.question?.filter(part => part.type === 'blank') || [] // Safeguard correct blanks
      const selectedBlankAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []

      // Filter correct answers
      const correctSelected = selectedBlankAnswers.filter(answer => {
        const correctBlank = correctBlanks.find(blank => blank.id === answer.id)
        return correctBlank && answer.content?.trim().toLowerCase() === correctBlank.content?.trim().toLowerCase()
      }).length

      if (correctBlanks.length > 0) {
        gainedMarks += (correctSelected / correctBlanks.length) * (Number(question.data?.marks) || 0)
      }
    }

    // Add hintMarks if a hint was used
    const hintUsed = usedHints[question._id]
    const hintMarks = hintUsed ? Number(question.data?.hintMarks) || 0 : 0

    return total + gainedMarks + hintMarks // Add safe values
  }, 0)

  console.log('Total Marks:', totalMarks)

  // Optional: Calculate the total percentage based on total marks
  const totalPossibleMarks = questions.reduce((total, question) => total + +question.data.marks, 0)
  const scorePercentage = totalPossibleMarks > 0 ? Math.round((totalMarks / totalPossibleMarks) * 100) : 0

  return (
    <Box
      sx={{
        maxWidth: '700px',
        mx: 'auto',
        mt: 4,
        p: 3,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Typography variant='h4' gutterBottom sx={{ textAlign: 'center', fontWeight: 600, color: '#333' }}>
        Quiz Summary
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
        Time Taken: {formatTimeWithUnits(time)} {/* Displaying formatted time */}
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
          } else if (question.templateId === 'fill-in-blank') {
            // Handle the fill-in-blank logic
            const correctBlanks = question.data.question.filter(part => part.type === 'blank') || [] // Assuming correct answers are stored in correctBlanks
            selectedAnswer.forEach(blankAnswer => {
              const correctBlank = correctBlanks.find(correct => correct.id === blankAnswer.id)
              if (
                correctBlank &&
                blankAnswer.content.trim().toLowerCase() === correctBlank.content.trim().toLowerCase()
              ) {
                gainedMarks += +question.data.marks / correctBlanks.length // Assign marks based on the number of blanks
              }
            })
          }

          const hintUsed = usedHints[question._id]
          const finalMarks = gainedMarks + (hintUsed ? question.data.hintMarks || 0 : 0) // hintMarks already negative
          console.log('index: ', index, 'gainedMarks: ', gainedMarks, 'finalMarks: ', finalMarks)

          const questionObj = question?.data?.question

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
                          ? '#f44336' // Default color for zero marks
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

              {/* <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                {`${index + 1}. ${question.data.question}`}
              </Typography> */}
              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                {index + 1}.{' '}
                {(questionObj.mediaType === 'text' ||
                  questionObj.mediaType === 'text-image' ||
                  questionObj.mediaType === 'text-video') &&
                  questionObj.text && <span>{questionObj.text}</span>}
                {/* Video Only - Display Instructional Text */}
                {questionObj.mediaType === 'video' && <span>Watch the video carefully and answer the question.</span>}
                {(questionObj.mediaType === 'image' || questionObj.mediaType === 'text-image') && questionObj.image && (
                  <Box
                    component='img'
                    src={questionObj.image}
                    alt='Question'
                    sx={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      mt: 2 // Adds spacing above the image
                    }}
                  />
                )}
                {(questionObj.mediaType === 'text-video' || questionObj.mediaType === 'video') && (
                  <Box display='flex' flexDirection='column' alignItems='center'>
                    {/* <span>{questionObj.text}</span> */}
                    {questionObj.video && (
                      <Box className='flex flex-col gap-1 items-center'>
                        <Box className='flex flex-col gap-1 items-center'>
                          <VideoAd url={questionObj.video || ''} height='100px' showPause autoPlay={false} />
                          {/* <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} /> */}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  {
                    question.templateId === 'fill-in-blank' ? (
                      <Grid item xs={12}>
                        {question.data.question?.map((part, index) => (
                          <Box key={part.id} display='inline-flex' alignItems='center' sx={{ mr: 1, mb: 1 }}>
                            {part.type === 'text' ? (
                              <Typography variant='body1' component='span'>
                                {part.content}
                              </Typography>
                            ) : (
                              <TextField
                                size='small'
                                variant='outlined'
                                readOnly
                                value={selectedAnswer.find(answer => answer.id === part.id)?.content || ''}
                                color={
                                  selectedAnswer
                                    .find(answer => answer.id === part.id)
                                    ?.content.trim()
                                    .toLowerCase() === part.content.trim().toLowerCase()
                                    ? 'success'
                                    : 'error'
                                }
                                sx={{
                                  minWidth: '100px', // Ensures the input has a minimum width
                                  maxWidth: '300px', // Max width for larger inputs
                                  marginBottom: '2px', // Space below the input field
                                  '& .MuiOutlinedInput-root': {
                                    pointerEvents: 'none', // Prevent interaction
                                    border: '1px solid', // Custom border color
                                    borderColor:
                                      selectedAnswer
                                        .find(answer => answer.id === part.id)
                                        ?.content.trim()
                                        .toLowerCase() === part.content.trim().toLowerCase()
                                        ? 'green'
                                        : 'red',
                                    '& fieldset': {
                                      display: 'none' // Hides the default outline
                                    },
                                    '&:hover': {
                                      borderColor:
                                        selectedAnswer
                                          .find(answer => answer.id === part.id)
                                          ?.content.trim()
                                          .toLowerCase() === part.content.trim().toLowerCase()
                                          ? 'green'
                                          : 'red'
                                    },
                                    '&.Mui-focused': {
                                      borderColor:
                                        selectedAnswer
                                          .find(answer => answer.id === part.id)
                                          ?.content.trim()
                                          .toLowerCase() === part.content.trim().toLowerCase()
                                          ? 'green'
                                          : 'red'
                                    }
                                  },
                                  backgroundColor: '#f5f5f5', // Gives a subtle box background color
                                  borderRadius: '4px' // Optional: Makes it look more like a box
                                }}
                                InputProps={{
                                  disableUnderline: true, // Disables underline in case of variant='standard'
                                  style: {
                                    color:
                                      selectedAnswer
                                        .find(answer => answer.id === part.id)
                                        ?.content.trim()
                                        .toLowerCase() === part.content.trim().toLowerCase()
                                        ? 'green'
                                        : 'red'
                                  }
                                }}
                              />
                            )}
                          </Box>
                        ))}
                        .
                      </Grid>
                    ) : question.templateId === 'true-or-false' ? (
                      question.data.options?.map(option => {
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
                    ) : (
                      question.data.options?.map(option => {
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
                      }) || null
                    ) // Ensure to return null if options are undefined
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
              {question.templateId === 'fill-in-blank' && (
                <Typography variant='body2' color='error' sx={{ mt: 1, fontStyle: 'italic' }}>
                  {selectedAnswer &&
                  selectedAnswer.every(blankAnswer => {
                    const correctBlank = question.data.question
                      .filter(part => part.type === 'blank')
                      .find(correct => correct.id === blankAnswer.id)
                    return (
                      correctBlank &&
                      blankAnswer.content.trim().toLowerCase() === correctBlank.content.trim().toLowerCase()
                    )
                  })
                    ? null // All answers are correct, show no message
                    : selectedAnswer.some(blankAnswer => {
                          const correctBlank = question.data.question
                            .filter(part => part.type === 'blank')
                            .find(correct => correct.id === blankAnswer.id)
                          return (
                            correctBlank &&
                            blankAnswer.content.trim().toLowerCase() === correctBlank.content.trim().toLowerCase()
                          )
                        })
                      ? `Your answer is partially correct. The correct answers are: ${question.data.question
                          .filter(part => part.type === 'blank')
                          .map(blank => `"${blank.content}"`)
                          .join(', ')}.` // Partial correctness
                      : `Your answer is incorrect. The correct answers are: ${question.data.question
                          .filter(part => part.type === 'blank')
                          .map(blank => `"${blank.content}"`)
                          .join(', ')}.`}{' '}
                </Typography>
              )}
            </Card>
          )
        })}
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
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
        </Button>
        <Button
          variant='outlined'
          onClick={() => router.push('/publicquiz/view')}
          color='primary'
          component='label'
          sx={{
            fontWeight: 600,
            padding: '10px 20px'
          }}
        >
          Back to All Quizzes
        </Button>
      </Box>
    </Box>
  )
}

export default QuizSummary
