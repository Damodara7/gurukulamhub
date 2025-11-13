// QuizSummary.js
import React from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  TextField,
  Container,
  Stack,
  Paper,
  Chip,
  LinearProgress,
  Avatar
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { useRouter } from 'next/navigation'
import { formatTime, formatTimeWithUnits } from '../Timer'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'

const QuizSummary = ({ questions, selectedAnswers, usedHints, handleReplay, time }) => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

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

  // Optional: Calculate the total percentage based on total marks
  const totalPossibleMarks = questions.reduce((total, question) => total + +question.data.marks, 0)
  const scorePercentage = totalPossibleMarks > 0 ? Math.round((totalMarks / totalPossibleMarks) * 100) : 0

  const passThreshold = 70
  const isPassed = scorePercentage >= passThreshold
  const statusCopy = isPassed ? 'Epic work! You nailed this quiz.' : 'Keep going — every attempt levels you up.'
  const heroTextColor = isDarkMode ? alpha(theme.palette.common.white, 0.95) : alpha(theme.palette.text.primary, 0.96)
  const accentGradient = `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
  const heroHighlights = [
    {
      label: 'Time Taken',
      value: formatTimeWithUnits(time),
      icon: <AccessTimeRoundedIcon fontSize='medium' />,
      tone: theme.palette.info
    },
    {
      label: 'Score',
      value: `${totalMarks.toFixed(2)} / ${totalPossibleMarks.toFixed(2)}`,
      icon: <EmojiEventsOutlinedIcon fontSize='medium' />,
      tone: theme.palette.primary
    },
    {
      label: 'Accuracy',
      value: `${correctAnswersCount}/${questions.length}`,
      icon: <WorkspacePremiumOutlinedIcon fontSize='medium' />,
      tone: theme.palette.secondary
    }
  ]
  const hintsUsedCount = Object.values(usedHints || {}).filter(Boolean).length
  const avgSecondsPerQuestion = questions.length > 0 ? Math.round(time / questions.length) : 0
  const detailMetrics = [
    {
      label: 'Total Marks',
      value: `${totalMarks.toFixed(2)}`,
      helper: `Out of ${totalPossibleMarks.toFixed(2)} pts`,
      palette: theme.palette.primary
    },
    {
      label: 'Hints Used',
      value: `${hintsUsedCount}`,
      helper: hintsUsedCount ? 'Hint penalties applied' : 'No hints consumed',
      palette: theme.palette.info
    },
    {
      label: 'Avg Time / Question',
      value: formatTimeWithUnits(avgSecondsPerQuestion),
      helper: `Across ${questions.length} questions`,
      palette: theme.palette.secondary
    },
    {
      label: 'Correct Answers',
      value: `${correctAnswersCount}`,
      helper: `${questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0}% accuracy`,
      palette: theme.palette.success
    }
  ]

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3.5, md: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: 3, md: 4 },
            px: { xs: 3, md: 4 },
            py: { xs: 3.2, md: 4 },
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.15)}`,
            boxShadow: isDarkMode ? '0 14px 28px rgba(9, 12, 28, 0.4)' : '0 18px 32px rgba(15, 23, 42, 0.08)'
          }}
        >
          <Stack spacing={{ xs: 2.8, md: 3.4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.6, md: 2.2 }} justifyContent='space-between'>
              <Stack spacing={0.8}>
                <Typography variant='overline' sx={{ letterSpacing: '0.18em', fontWeight: 700 }}>
                  Quiz Completed
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.015em', color: heroTextColor }}>
                  Quiz Summary
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    maxWidth: 540,
                    color: isDarkMode ? alpha(theme.palette.common.white, 0.82) : alpha(theme.palette.text.primary, 0.75),
                    lineHeight: 1.65
                  }}
                >
                  {statusCopy}
                </Typography>
              </Stack>

              <Chip
                color={isPassed ? 'success' : 'warning'}
                label={isPassed ? 'Passed' : 'Keep Practicing'}
                sx={{
                  alignSelf: { xs: 'flex-start', md: 'center' },
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 2.4,
                  py: 0.9,
                  fontSize: '0.8rem'
                }}
              />
            </Stack>

            <Grid container spacing={{ xs: 1.4, md: 2 }}>
              {heroHighlights.map(highlight => (
                <Grid item xs={12} sm={4} key={highlight.label}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      px: 2.2,
                      py: 1.8,
                      border: `1px solid ${alpha(highlight.tone.main, isDarkMode ? 0.32 : 0.18)}`,
                      backgroundColor: alpha(highlight.tone.main, isDarkMode ? 0.16 : 0.08),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.4
                    }}
                  >
                    <Avatar
                      variant='rounded'
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        backgroundColor: alpha(highlight.tone.main, 0.2),
                        color: highlight.tone.dark
                      }}
                    >
                      {highlight.icon}
                    </Avatar>
                    <Stack spacing={0.4}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : alpha(theme.palette.text.primary, 0.6)
                        }}
                      >
                        {highlight.label}
                      </Typography>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 700, color: isDarkMode ? alpha(theme.palette.common.white, 0.92) : heroTextColor }}
                      >
                        {highlight.value}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box
              sx={{
                borderRadius: 3,
                px: 2.6,
                py: 2.4,
                border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.32 : 0.15)}`,
                backgroundColor: alpha(theme.palette.primary.main, isDarkMode ? 0.12 : 0.08)
              }}
            >
              <Stack spacing={1.6}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='subtitle2' sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Overall score
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 800 }}>
                    {scorePercentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  value={scorePercentage}
                  variant='determinate'
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                />
                <Stack direction='row' spacing={3}>
                  <Stack spacing={0.3}>
                    <Typography variant='caption' sx={{ letterSpacing: '0.08em', color: alpha(heroTextColor, 0.7) }}>
                      Marks Earned
                    </Typography>
                    <Typography variant='subtitle1' fontWeight={700}>
                      {totalMarks.toFixed(2)} pts
                    </Typography>
                  </Stack>
                  <Stack spacing={0.3}>
                    <Typography variant='caption' sx={{ letterSpacing: '0.08em', color: alpha(heroTextColor, 0.7) }}>
                      Total Time
                    </Typography>
                    <Typography variant='subtitle1' fontWeight={700}>
                      {formatTimeWithUnits(time)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            <Grid container spacing={{ xs: 1.2, md: 1.8 }}>
              {detailMetrics.map(detail => (
                <Grid item xs={12} sm={6} md={3} key={detail.label}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      px: 2.2,
                      py: 1.6,
                      border: `1px solid ${alpha(detail.palette.main, isDarkMode ? 0.28 : 0.16)}`,
                      backgroundColor: theme.palette.background.paper,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: alpha(heroTextColor, 0.65), fontWeight: 600 }}
                    >
                      {detail.label}
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: heroTextColor }}>
                      {detail.value}
                    </Typography>
                    <Typography variant='body2' sx={{ color: alpha(heroTextColor, 0.7) }}>
                      {detail.helper}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.2, sm: 1.6 }}
          justifyContent='flex-end'
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Button
            variant='contained'
            color='primary'
            component='label'
            startIcon={<ReplayRoundedIcon />}
            onClick={handleReplay}
            sx={{
              borderRadius: 999,
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.4 },
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.95rem', sm: '1rem' }
            }}
          >
            Replay Quiz
          </Button>

          <Button
            variant='outlined'
            color='primary'
            startIcon={<ArrowBackIosNewRoundedIcon />}
            onClick={() => router.push('/publicquiz/view')}
            sx={{
              borderRadius: 999,
              px: { xs: 2.6, sm: 3.2 },
              py: { xs: 1.1, sm: 1.25 },
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '0.95rem' }
            }}
          >
            Back to Quizzes
          </Button>
        </Stack>

        <Stack spacing={{ xs: 2.4, md: 3 }}>
          {questions.map((question, index) => {
            const rawSelectedAnswer = selectedAnswers[question._id]
            const selectedAnswer =
              question.templateId === 'multiple-choice' || question.templateId === 'fill-in-blank'
                ? (Array.isArray(rawSelectedAnswer) ? rawSelectedAnswer : [])
                : rawSelectedAnswer

            const correctAnswers = question.data.options?.filter(option => option.correct) || []
            let gainedMarks = 0
            let incorrectSelected = []

            if (question.templateId === 'single-choice') {
              gainedMarks = selectedAnswer === correctAnswers[0]?.id ? +question.data.marks : 0
            } else if (question.templateId === 'multiple-choice') {
              const selectedAnswerIds = Array.isArray(selectedAnswer) ? selectedAnswer : []
              const correctSelected = selectedAnswerIds.filter(id => correctAnswers.some(option => option.id === id))
              incorrectSelected = selectedAnswerIds.filter(id => !correctAnswers.some(option => option.id === id))

              if (incorrectSelected.length > 0) {
                gainedMarks = 0
              } else if (correctAnswers.length > 0) {
                gainedMarks = (correctSelected.length / correctAnswers.length) * +question.data.marks
              }
            } else if (question.templateId === 'true-or-false') {
              gainedMarks = selectedAnswer === correctAnswers[0]?.id ? +question.data.marks : 0
            } else if (question.templateId === 'fill-in-blank') {
              const correctBlanks = question.data.question.filter(part => part.type === 'blank') || []
              const selectedBlankAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []

              selectedBlankAnswers.forEach(blankAnswer => {
                const correctBlank = correctBlanks.find(correct => correct.id === blankAnswer.id)
                if (
                  correctBlank &&
                  blankAnswer.content?.trim().toLowerCase() === correctBlank.content?.trim().toLowerCase()
                ) {
                  gainedMarks += +question.data.marks / (correctBlanks.length || 1)
                }
              })
            }

            const hintUsed = usedHints[question._id]
            const finalMarks = gainedMarks + (hintUsed ? question.data.hintMarks || 0 : 0)
            const questionObj = question?.data?.question || {}

            const maxMarks = Number(question.data?.marks) || 0
            const attempted =
              question.templateId === 'multiple-choice'
                ? Array.isArray(selectedAnswer) && selectedAnswer.length > 0
                : question.templateId === 'fill-in-blank'
                  ? Array.isArray(selectedAnswer) && selectedAnswer.length > 0
                  : Boolean(selectedAnswer)

            let statusColor = 'default'
            let statusLabel = 'Not attempted'
            let StatusIcon = CancelRoundedIcon

            if (!attempted) {
              statusColor = 'default'
              statusLabel = 'Not attempted'
              StatusIcon = CancelRoundedIcon
            } else if (finalMarks <= 0) {
              statusColor = 'error'
              statusLabel = 'Incorrect'
              StatusIcon = CancelRoundedIcon
            } else if (maxMarks > 0 && finalMarks < maxMarks) {
              statusColor = 'warning'
              statusLabel = 'Partially correct'
              StatusIcon = CheckCircleRoundedIcon
            } else {
              statusColor = 'success'
              statusLabel = 'Correct'
              StatusIcon = CheckCircleRoundedIcon
            }

            const questionTitle =
              (['text', 'text-image', 'text-video'].includes(questionObj.mediaType) && questionObj.text) ||
              (questionObj.mediaType === 'video' ? 'Watch the video carefully and answer the question.' : '')
            const isLastQuestion = index === questions.length - 1

            return (
              <Stack
                key={question._id}
                direction='row'
                spacing={{ xs: 2, md: 2.6 }}
                alignItems='stretch'
              >
                <Stack alignItems='center' sx={{ position: 'relative', pt: 1 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: accentGradient,
                      color: theme.palette.common.white,
                      boxShadow: '0 12px 24px rgba(43, 89, 255, 0.25)'
                    }}
                  >
                    {index + 1}
                  </Box>
                  {/* {!isLastQuestion && ( */}
                    <Box
                      sx={{
                        width: 3,
                        flex: 1,
                        mt: 1,
                        borderRadius: 999,
                        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.4)}, transparent)`
                      }}
                    />
                  {/* )} */}
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                    px: { xs: 2.4, md: 3 },
                    py: { xs: 2.2, md: 2.6 },
                    background: isDarkMode
                      ? `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(
                          theme.palette.background.paper,
                          0.78
                        )})`
                      : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(
                          theme.palette.background.paper,
                          0.98
                        )})`,
                    border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.3 : 0.18)}`,
                    boxShadow: isDarkMode ? '0 18px 32px rgba(15, 23, 42, 0.32)' : '0 12px 24px rgba(15, 23, 42, 0.08)'
                  }}
                >
                <Stack spacing={{ xs: 1.8, md: 2.4 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 1.4, md: 2 }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                  >
                    <Stack spacing={0.8} sx={{ minWidth: 0 }}>
                      <Typography variant='overline' sx={{ letterSpacing: '0.18em', opacity: 0.6 }}>
                        Question {index + 1}
                      </Typography>
                      <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {questionTitle}
                      </Typography>
                      {questionObj.mediaType === 'text-image' && questionObj.text && (
                        <Typography variant='body2' sx={{ color: alpha(theme.palette.text.primary, 0.76) }}>
                          {questionObj.text}
                        </Typography>
                      )}
                    </Stack>

                    <Stack
                      direction={{ xs: 'row', md: 'row' }}
                      spacing={{ xs: 1, md: 1.4 }}
                      alignItems='center'
                      flexWrap='wrap'
                    >
                      <Chip
                        color={statusColor}
                        variant='filled'
                        icon={<StatusIcon fontSize='small' />}
                        label={statusLabel}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 999,
                          px: 1.8,
                          backgroundColor:
                            statusColor === 'default'
                              ? alpha(theme.palette.text.primary, isDarkMode ? 0.18 : 0.08)
                              : undefined
                        }}
                      />
                      {hintUsed && (
                        <Chip
                          color='info'
                          variant='outlined'
                          icon={<LightbulbOutlinedIcon sx={{ fontSize: '1rem' }} />}
                          label={`Hint used (${question?.data?.hintMarks || 0})`}
                          sx={{
                            fontWeight: 600,
                            borderRadius: 999
                          }}
                        />
                      )}
                      <Typography variant='body2' fontWeight={700}>
                        {finalMarks > 0 ? '+' : ''}
                        {finalMarks.toFixed(2)} / {maxMarks.toFixed(2)} pts
                      </Typography>
                    </Stack>
                  </Stack>

                  {(questionObj.mediaType === 'image' || questionObj.mediaType === 'text-image') && questionObj.image && (
                    <Box
                      component='img'
                      src={questionObj.image}
                      alt='Question'
                      sx={{
                        width: '100%',
                        maxHeight: 260,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                      }}
                    />
                  )}

                  {(questionObj.mediaType === 'text-video' || questionObj.mediaType === 'video') && questionObj.video && (
                    <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
                      {questionObj.text && (
                        <Typography variant='body2' color={alpha(theme.palette.text.primary, 0.8)}>
                          {questionObj.text}
                        </Typography>
                      )}
                      <VideoAd url={questionObj.video || ''} height='180px' showPause autoPlay={false} />
                    </Box>
                  )}

                  <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                  <Box>
                    <Grid container spacing={1.4}>
                      {question.templateId === 'fill-in-blank' ? (
                        <Grid item xs={12}>
                          {question.data.question?.map(part => {
                            if (part.type === 'text') {
                              return (
                                <Typography key={part.id} variant='body1' component='span' sx={{ mr: 1, color: 'inherit' }}>
                                  {part.content}
                                </Typography>
                              )
                            }

                            const blanksAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : []
                            const userResponse = blanksAnswers.find(answer => answer.id === part.id)
                            const isCorrect =
                              userResponse?.content?.trim().toLowerCase() === part.content?.trim().toLowerCase()

                            return (
                              <TextField
                                key={part.id}
                                value={userResponse?.content || ''}
                                size='small'
                                variant='outlined'
                                InputProps={{ readOnly: true }}
                                sx={{
                                  mr: 1,
                                  mb: 1,
                                  minWidth: 120,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    bgcolor: alpha(
                                      isCorrect ? theme.palette.success.light : theme.palette.error.light,
                                      0.18
                                    ),
                                    '& fieldset': {
                                      borderColor: alpha(
                                        isCorrect ? theme.palette.success.main : theme.palette.error.main,
                                        0.6
                                      )
                                    }
                                  }
                                }}
                                helperText={
                                  isCorrect
                                    ? 'Correct'
                                    : userResponse
                                      ? `Correct answer: ${part.content}`
                                      : 'Not answered'
                                }
                                FormHelperTextProps={{
                                  sx: {
                                    mt: 0.3,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: alpha(
                                      isCorrect ? theme.palette.success.main : theme.palette.error.main,
                                      0.9
                                    )
                                  }
                                }}
                              />
                            )
                          })}
                        </Grid>
                      ) : question.templateId === 'true-or-false'
                        ? question.data.options?.map(option => {
                            const isUserAnswer = Array.isArray(selectedAnswer)
                              ? selectedAnswer.includes(option.id)
                              : selectedAnswer === option.id
                            const isCorrectAnswer = option.correct
                            const isCorrectSelection = isUserAnswer && isCorrectAnswer
                            const isWrongSelection = isUserAnswer && !isCorrectAnswer

                            return (
                              <Grid item xs={12} sm={6} key={option.id}>
                                <Box
                                  sx={{
                                    p: { xs: 1.8, md: 2.2 },
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    textAlign: 'center',
                                    height: '100%',
                                    border: `1px solid ${
                                      isCorrectSelection
                                        ? alpha(theme.palette.success.main, 0.6)
                                        : isWrongSelection
                                          ? alpha(theme.palette.error.main, 0.6)
                                          : alpha(theme.palette.primary.main, 0.12)
                                    }`,
                                    background: `linear-gradient(135deg, ${
                                      isCorrectSelection
                                        ? alpha(theme.palette.success.light, 0.3)
                                        : isWrongSelection
                                          ? alpha(theme.palette.error.light, 0.3)
                                          : alpha(theme.palette.background.paper, 0.9)
                                    }, ${alpha(theme.palette.background.paper, 0.95)})`,
                                    color: isCorrectSelection
                                      ? theme.palette.success.dark
                                      : isWrongSelection
                                        ? theme.palette.error.dark
                                        : theme.palette.text.primary,
                                    boxShadow: isUserAnswer ? '0 10px 24px rgba(15, 23, 42, 0.12)' : 'none'
                                  }}
                                >
                                  {option.mediaType === 'image' && option.image && (
                                    <Box
                                      component='img'
                                      src={option.image}
                                      alt={option.text || ''}
                                      sx={{
                                        width: '100%',
                                        maxHeight: 120,
                                        objectFit: 'cover',
                                        borderRadius: 1.5
                                      }}
                                    />
                                  )}
                                  {option.mediaType === 'video' && option.videoUrl && (
                                    <video
                                      src={option.videoUrl}
                                      controls
                                      style={{
                                        width: '100%',
                                        borderRadius: 8
                                      }}
                                    />
                                  )}
                                  {option.mediaType === 'audio' && option.audioUrl && (
                                    <audio src={option.audioUrl} controls style={{ width: '100%' }} />
                                  )}

                                  {option.mediaType === 'text' && option.text && (
                                    <Typography variant='body1' fontWeight={600}>
                                      {option.text}
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            )
                          })
                        : question.data.options?.map(option => {
                            const isUserAnswer = Array.isArray(selectedAnswer)
                              ? selectedAnswer.includes(option.id)
                              : selectedAnswer === option.id
                            const isCorrectAnswer = option.correct
                            const isMatch = isUserAnswer && isCorrectAnswer
                            const isWrongPick = isUserAnswer && !isCorrectAnswer

                            return (
                              <Grid item xs={12} sm={6} md={3} key={option.id}>
                                <Box
                                  sx={{
                                    p: { xs: 1.6, md: 2 },
                                    borderRadius: 2,
                                    border: `1px solid ${
                                      isMatch
                                        ? alpha(theme.palette.success.main, 0.6)
                                        : isWrongPick
                                          ? alpha(theme.palette.error.main, 0.6)
                                          : alpha(theme.palette.primary.main, 0.12)
                                    }`,
                                    background: isMatch
                                      ? alpha(theme.palette.success.light, 0.32)
                                      : isWrongPick
                                        ? alpha(theme.palette.error.light, 0.3)
                                        : alpha(theme.palette.background.paper, 0.92),
                                    color: isMatch
                                      ? theme.palette.success.dark
                                      : isWrongPick
                                        ? theme.palette.error.dark
                                        : theme.palette.text.primary,
                                    textAlign: 'center',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: isUserAnswer ? '0 12px 30px rgba(15, 23, 42, 0.1)' : 'none'
                                  }}
                                >
                                  {option.mediaType === 'image' && option.image && (
                                    <Box
                                      component='img'
                                      src={option.image}
                                      alt={option.text || ''}
                                      sx={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 1.5 }}
                                    />
                                  )}
                                  {option.mediaType === 'video' && option.videoUrl && (
                                    <video
                                      src={option.videoUrl}
                                      controls
                                      style={{ width: '100%', borderRadius: 8 }}
                                    />
                                  )}
                                  {option.mediaType === 'audio' && option.audioUrl && (
                                    <audio src={option.audioUrl} controls style={{ width: '100%' }} />
                                  )}
                                  {option.mediaType === 'text' && option.text && (
                                    <Typography variant='body1' fontWeight={600}>
                                      {option.text}
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            )
                          })}
                    </Grid>
                  </Box>

                  {question.templateId === 'true-or-false' &&
                    attempted &&
                    selectedAnswer !== correctAnswers[0]?.id && (
                      <Typography variant='body2' color='error' sx={{ fontStyle: 'italic' }}>
                        {`The correct answer is "${correctAnswers[0]?.text}".`}
                      </Typography>
                    )}

                  {question.templateId === 'single-choice' &&
                    attempted &&
                    selectedAnswer !== correctAnswers[0]?.id && (
                      <Typography variant='body2' color='error' sx={{ fontStyle: 'italic' }}>
                        {`The correct answer is "${correctAnswers[0]?.text}".`}
                      </Typography>
                    )}

                  {question.templateId === 'multiple-choice' && attempted && (
                    <Typography variant='body2' color={incorrectSelected.length > 0 ? 'error' : 'info'} sx={{ fontStyle: 'italic' }}>
                      {incorrectSelected.length > 0
                        ? `Correct answers: ${correctAnswers.map(a => `"${a.text}"`).join(', ')}.`
                        : `Great attempt! Correct answers: ${correctAnswers.map(a => `"${a.text}"`).join(', ')}.`}
                    </Typography>
                  )}

                  {question.templateId === 'fill-in-blank' && (
                    <Typography variant='body2' color='info' sx={{ fontStyle: 'italic' }}>
                      {`Correct answers: ${question.data.question
                        .filter(part => part.type === 'blank')
                        .map(blank => `"${blank.content}"`)
                        .join(', ')}.`}
                    </Typography>
                  )}
                </Stack>
                </Paper>
              </Stack>
            )
          })}
        </Stack>
      </Stack>
    </Container>
  )
}

export default QuizSummary
