// QuizSummary.js
import React, { useState } from 'react'
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
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
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import { useRouter } from 'next/navigation'
import { formatTime, formatTimeWithUnits } from '../Timer'
import ReactPlayer from 'react-player'

const QuizSummary = ({
  questions,
  selectedAnswers,
  usedHints,
  handleReplay,
  time,
  quiz,
  completionResult,
  estimatedQuizPoints = 0,
  isPointsPending = false
}) => {
  const router = useRouter()
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const [imagePreviewOpen, setImagePreviewOpen] = useState({})

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
  const totalQuizPoints =
    completionResult?.totalPossiblePoints ?? estimatedQuizPoints ?? (questions?.length || 0) * Number(quiz?.weightage || 1)
  const awardedPoints = completionResult?.pointsAwarded ?? totalQuizPoints
  const isFirstAward = completionResult ? !completionResult?.alreadyAwarded : false

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
                  <Stack spacing={0.3}>
                    <Typography variant='caption' sx={{ letterSpacing: '0.08em', color: alpha(heroTextColor, 0.7) }}>
                      Quiz Points
                    </Typography>
                    <Typography variant='subtitle1' fontWeight={700}>
                      {awardedPoints} / {totalQuizPoints}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
            {completionResult && (
              <Chip
                icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 16 }} />}
                color={isFirstAward ? 'success' : 'warning'}
                label={
                  isFirstAward
                    ? `Congrats! You earned ${awardedPoints} quiz points on first completion`
                    : 'You already completed this quiz earlier and already received points'
                }
                sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 700, px: 1 }}
              />
            )}
            {isPointsPending && (
              <Chip
                color='info'
                label='Saving points in background...'
                sx={{ alignSelf: 'flex-start', borderRadius: 999, fontWeight: 700, px: 1 }}
              />
            )}

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

            // Check if all options are images
            const allOptionsAreImages = question?.data?.options?.every(opt => opt.mediaType === 'image' && opt.image) || false

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
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
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
                    <Stack spacing={0.8} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
                      <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
                        <Typography variant='overline' sx={{ letterSpacing: '0.18em', opacity: 0.6 }}>
                          Question {index + 1}
                        </Typography>
                        <Chip
                          label={
                            question.templateId === 'single-choice'
                              ? 'Multiple Choice'
                              : question.templateId === 'multiple-choice'
                                ? 'Multi Answer'
                                : question.templateId === 'true-or-false'
                                  ? 'True or False'
                                  : question.templateId === 'fill-in-blank'
                                    ? 'Fill in the Blanks'
                                    : 'Question'
                          }
                          size='small'
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            fontWeight: 600,
                            borderRadius: 999,
                            backgroundColor: alpha(theme.palette.info.main, isDarkMode ? 0.2 : 0.12),
                            color: isDarkMode ? theme.palette.info.light : theme.palette.info.main
                          }}
                        />
                      </Stack>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          width: '100%',
                          maxWidth: '100%',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          textAlign: 'left'
                        }}
                      >
                        {questionTitle}
                      </Typography>
                      {questionObj.mediaType === 'text-image' && questionObj.text && (
                        <Typography
                          variant='body2'
                          sx={{
                            color: alpha(theme.palette.text.primary, 0.76),
                            width: '100%',
                            maxWidth: '100%',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            textAlign: 'left'
                          }}
                        >
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
                    <>
                      <Box
                        onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [question._id]: true })}
                        sx={{
                          width: '100%',
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                              : '0 12px 32px rgba(15, 23, 42, 0.15)',
                          bgcolor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.common.black, 0.3)
                            : alpha(theme.palette.common.white, 0.8),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: { xs: 1, sm: 1.5 },
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 16px 40px rgba(0, 0, 0, 0.5)'
                                : '0 16px 40px rgba(15, 23, 42, 0.2)',
                            borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.25),
                            '& .enlarge-overlay': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <Box
                          component='img'
                          src={questionObj.image}
                          alt='Question'
                          sx={{
                            width: 'auto',
                            height: 'auto',
                            maxWidth: '100%',
                            maxHeight: { xs: 180, sm: 220, md: 240 },
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: 1
                          }}
                        />
                        <Box
                          className='enlarge-overlay'
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: alpha(theme.palette.common.black, 0.4),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            backdropFilter: 'blur(2px)'
                          }}
                        >
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <ZoomInIcon sx={{ color: theme.palette.common.white, fontSize: 28 }} />
                            <Typography
                              variant='body2'
                              sx={{
                                color: theme.palette.common.white,
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.common.black, 0.6),
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1
                              }}
                            >
                              Click to view full size
                            </Typography>
                          </Stack>
                        </Box>
                      </Box>
                      <Dialog
                        open={imagePreviewOpen[question._id] || false}
                        onClose={() => setImagePreviewOpen({ ...imagePreviewOpen, [question._id]: false })}
                        maxWidth='lg'
                        fullWidth
                      >
                        <DialogTitle>Question {index + 1} Image</DialogTitle>
                        <DialogContent>
                          <Box
                            component='img'
                            src={questionObj.image}
                            alt='Question Full Size'
                            sx={{
                              width: '100%',
                              height: 'auto',
                              maxHeight: '70vh',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [question._id]: false })}>Close</Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  )}

                  {(questionObj.mediaType === 'text-video' || questionObj.mediaType === 'video') && questionObj.video && (
                    <Box display='flex' flexDirection='column' alignItems='flex-start' gap={1} sx={{ width: '100%' }}>
                      {questionObj.text && (
                        <Typography
                          variant='body2'
                          color={alpha(theme.palette.text.primary, 0.8)}
                          sx={{
                            width: '100%',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal',
                            textAlign: 'left'
                          }}
                        >
                          {questionObj.text}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          width: '100%',
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                              : '0 12px 32px rgba(15, 23, 42, 0.15)',
                          bgcolor: theme.palette.mode === 'dark' ? '#000' : '#000',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 16px 40px rgba(0, 0, 0, 0.5)'
                                : '0 16px 40px rgba(15, 23, 42, 0.2)',
                            borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.25)
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            position: 'relative',
                            paddingTop: { xs: '40%', sm: '35%', md: '32%' }, // Smaller aspect ratio for summary
                            bgcolor: '#000',
                            maxHeight: { xs: 200, sm: 240, md: 280 }
                          }}
                        >
                          <ReactPlayer
                            url={questionObj.video || ''}
                            playing={false}
                            controls={true}
                            width='100%'
                            height='100%'
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}
                            config={{
                              youtube: {
                                playerVars: {
                                  autoplay: 0,
                                  modestbranding: 1,
                                  rel: 0
                                }
                              }
                            }}
                            onError={e => console.error('Video error occurred:', e)}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />

                  <Box>
                    <Grid 
                      container 
                      spacing={1.4}
                      sx={{ alignItems: allOptionsAreImages ? 'stretch' : 'flex-start' }}
                    >
                      {question.templateId === 'fill-in-blank' ? (
                        <Grid item xs={12}>
                          {question.data.question?.map(part => {
                            if (part.type === 'text') {
                              return (
                                <Typography
                                  key={part.id}
                                  variant='body1'
                                  component='span'
                                  sx={{
                                    mr: 1,
                                    color: 'inherit',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    whiteSpace: 'normal'
                                  }}
                                >
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
                        ? question.data.options?.map((option, optIndex) => {
                            const isUserAnswer = Array.isArray(selectedAnswer)
                              ? selectedAnswer.includes(option.id)
                              : selectedAnswer === option.id
                            const isCorrectAnswer = option.correct
                            const isCorrectSelection = isUserAnswer && isCorrectAnswer
                            const isWrongSelection = isUserAnswer && !isCorrectAnswer

                            return (
                              <Grid 
                                item 
                                xs={allOptionsAreImages ? 12 : 12} 
                                sm={allOptionsAreImages ? 6 : 6} 
                                key={option.id}
                                sx={{ display: 'flex', height: allOptionsAreImages ? '100%' : 'auto' }}
                              >
                                <Box
                                  sx={{
                                    p: allOptionsAreImages ? { xs: 1.2, md: 1.5 } : { xs: 1.8, md: 2.2 },
                                    borderRadius: 2,
                                    display: 'flex',
                                    flexDirection: allOptionsAreImages ? 'column' : 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    textAlign: 'center',
                                    height: allOptionsAreImages ? '100%' : 'auto',
                                    minHeight: allOptionsAreImages ? { xs: 140, md: 160 } : { xs: 80, md: 100 },
                                    width: '100%',
                                    maxWidth: '100%',
                                    overflow: 'hidden',
                                    border: `1px solid ${
                                      isCorrectSelection
                                        ? alpha(theme.palette.success.main, 0.6)
                                        : isWrongSelection
                                          ? alpha(theme.palette.error.main, 0.6)
                                          : alpha(theme.palette.primary.main, 0.12)
                                    }`,
                                    background: isCorrectSelection
                                      ? alpha(theme.palette.success.light, 0.32)
                                      : isWrongSelection
                                        ? alpha(theme.palette.error.light, 0.3)
                                        : alpha(theme.palette.background.paper, 0.92),
                                    color: isCorrectSelection
                                      ? theme.palette.success.dark
                                      : isWrongSelection
                                        ? theme.palette.error.dark
                                        : theme.palette.text.primary,
                                    boxShadow: isUserAnswer ? '0 12px 30px rgba(15, 23, 42, 0.1)' : 'none'
                                  }}
                                >
                                  {allOptionsAreImages && (
                                    <Stack spacing={1} sx={{ width: '100%', flex: 1, minHeight: 0 }}>
                                      <Stack
                                        direction='row'
                                        spacing={1}
                                        alignItems='center'
                                        justifyContent='space-between'
                                        sx={{ width: '100%', minHeight: { xs: 32, md: 36 } }}
                                      >
                                        <Box
                                          sx={{
                                            width: { xs: 28, md: 32 },
                                            height: { xs: 28, md: 32 },
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                            flexShrink: 0,
                                            backgroundColor: isCorrectSelection
                                              ? alpha(theme.palette.success.main, 0.2)
                                              : isWrongSelection
                                                ? alpha(theme.palette.error.main, 0.2)
                                                : alpha(theme.palette.primary.main, 0.15),
                                            color: isCorrectSelection
                                              ? theme.palette.success.dark
                                              : isWrongSelection
                                                ? theme.palette.error.dark
                                                : theme.palette.primary.main
                                          }}
                                        >
                                          {String.fromCharCode(65 + optIndex)}
                                        </Box>
                                      </Stack>
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <>
                                          <Box
                                            onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: true })}
                                            sx={{
                                              width: '100%',
                                              position: 'relative',
                                              borderRadius: 1.5,
                                              overflow: 'hidden',
                                              border: `1px solid ${alpha(
                                                theme.palette.primary.main,
                                                isCorrectSelection
                                                  ? 0.4
                                                  : isWrongSelection
                                                    ? 0.4
                                                    : 0.12
                                              )}`,
                                              backgroundColor: theme.palette.mode === 'dark' 
                                                ? alpha(theme.palette.common.black, 0.2)
                                                : alpha(theme.palette.common.white, 0.5),
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              height: { xs: 100, md: 120 },
                                              p: { xs: 1, md: 1.2 },
                                              flexShrink: 0,
                                              cursor: 'pointer',
                                              transition: 'all 0.3s ease',
                                              '&:hover': {
                                                '& .enlarge-overlay': {
                                                  opacity: 1
                                                }
                                              }
                                            }}
                                          >
                                            <Box
                                              component='img'
                                              src={option.image}
                                              alt={option.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                                              sx={{
                                                width: '100%',
                                                height: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                display: 'block'
                                              }}
                                            />
                                            <Box
                                              className='enlarge-overlay'
                                              sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                bgcolor: alpha(theme.palette.common.black, 0.4),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                backdropFilter: 'blur(2px)'
                                              }}
                                            >
                                              <Stack direction='row' spacing={0.75} alignItems='center'>
                                                <ZoomInIcon sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                                <Typography
                                                  variant='caption'
                                                  sx={{
                                                    color: theme.palette.common.white,
                                                    fontWeight: 600,
                                                    bgcolor: alpha(theme.palette.common.black, 0.6),
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.75
                                                  }}
                                                >
                                                  Click to view
                                                </Typography>
                                              </Stack>
                                            </Box>
                                          </Box>
                                          <Dialog
                                            open={imagePreviewOpen[`${question._id}-${option.id}`] || false}
                                            onClose={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}
                                            maxWidth='md'
                                            fullWidth
                                          >
                                            <DialogTitle>Option {String.fromCharCode(65 + optIndex)} Image</DialogTitle>
                                            <DialogContent>
                                              <Box
                                                component='img'
                                                src={option.image}
                                                alt={option.text || `Option ${String.fromCharCode(65 + optIndex)} Full Size`}
                                                sx={{
                                                  width: '100%',
                                                  height: 'auto',
                                                  maxHeight: '70vh',
                                                  objectFit: 'contain',
                                                  display: 'block'
                                                }}
                                              />
                                            </DialogContent>
                                            <DialogActions>
                                              <Button onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}>Close</Button>
                                            </DialogActions>
                                          </Dialog>
                                        </>
                                      )}
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          fontWeight: 500,
                                          fontSize: { xs: '0.75rem', md: '0.8125rem' },
                                          textAlign: 'center',
                                          minHeight: { xs: 20, md: 22 },
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {option.text || `option-${optIndex + 1}`}
                                      </Typography>
                                    </Stack>
                                  )}
                                  {!allOptionsAreImages && (
                                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                                      {/* Option Text */}
                                      {(option.mediaType === 'text' || option.mediaType === 'text-image') && option.text && (
                                        <Typography
                                          variant='body1'
                                          fontWeight={600}
                                          sx={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word',
                                            whiteSpace: 'normal',
                                            textAlign: 'center',
                                            lineHeight: 1.6,
                                            fontSize: { xs: '0.875rem', md: '0.9375rem' }
                                          }}
                                        >
                                          {option.text}
                                        </Typography>
                                      )}
                                      
                                      {/* Option Image */}
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <Box
                                          onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: true })}
                                          sx={{
                                            width: '100%',
                                            position: 'relative',
                                            borderRadius: 1.5,
                                            overflow: 'hidden',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                            bgcolor: theme.palette.mode === 'dark' 
                                              ? alpha(theme.palette.common.black, 0.2)
                                              : alpha(theme.palette.common.white, 0.5),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.75,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.15)}`,
                                              '& .enlarge-overlay': {
                                                opacity: 1
                                              }
                                            }
                                          }}
                                        >
                                          <Box
                                            component='img'
                                            src={option.image}
                                            alt={option.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                                            sx={{
                                              width: 'auto',
                                              height: 'auto',
                                              maxWidth: '100%',
                                              maxHeight: { xs: 100, sm: 120, md: 140 },
                                              objectFit: 'contain',
                                              display: 'block'
                                            }}
                                          />
                                          <Box
                                            className='enlarge-overlay'
                                            sx={{
                                              position: 'absolute',
                                              inset: 0,
                                              bgcolor: alpha(theme.palette.common.black, 0.4),
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              opacity: 0,
                                              transition: 'opacity 0.3s ease',
                                              backdropFilter: 'blur(2px)'
                                            }}
                                          >
                                            <Stack direction='row' spacing={0.75} alignItems='center'>
                                              <ZoomInIcon sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                              <Typography
                                                variant='caption'
                                                sx={{
                                                  color: theme.palette.common.white,
                                                  fontWeight: 600,
                                                  bgcolor: alpha(theme.palette.common.black, 0.6),
                                                  px: 1,
                                                  py: 0.5,
                                                  borderRadius: 0.75
                                                }}
                                              >
                                                Click to view
                                              </Typography>
                                            </Stack>
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {/* Image Preview Dialog */}
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <Dialog
                                          open={imagePreviewOpen[`${question._id}-${option.id}`] || false}
                                          onClose={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}
                                          maxWidth='md'
                                          fullWidth
                                        >
                                          <DialogTitle>Option {String.fromCharCode(65 + optIndex)} Image</DialogTitle>
                                          <DialogContent>
                                            <Box
                                              component='img'
                                              src={option.image}
                                              alt={option.text || `Option ${String.fromCharCode(65 + optIndex)} Full Size`}
                                              sx={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '70vh',
                                                objectFit: 'contain',
                                                display: 'block'
                                              }}
                                            />
                                          </DialogContent>
                                          <DialogActions>
                                            <Button onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}>Close</Button>
                                          </DialogActions>
                                        </Dialog>
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
                                    </Stack>
                                  )}
                                </Box>
                              </Grid>
                            )
                          })
                        : question.data.options?.map((option, optIndex) => {
                            const isUserAnswer = Array.isArray(selectedAnswer)
                              ? selectedAnswer.includes(option.id)
                              : selectedAnswer === option.id
                            const isCorrectAnswer = option.correct
                            const isMatch = isUserAnswer && isCorrectAnswer
                            const isWrongPick = isUserAnswer && !isCorrectAnswer

                            return (
                              <Grid 
                                item 
                                xs={allOptionsAreImages ? 12 : 12} 
                                sm={allOptionsAreImages ? 6 : 6} 
                                key={option.id}
                                sx={{ display: 'flex', height: allOptionsAreImages ? '100%' : 'auto' }}
                              >
                                <Box
                                  sx={{
                                    p: allOptionsAreImages ? { xs: 1.2, md: 1.5 } : { xs: 1.8, md: 2.2 },
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
                                    textAlign: 'left',
                                    height: allOptionsAreImages ? '100%' : 'auto',
                                    minHeight: allOptionsAreImages ? { xs: 140, md: 160 } : { xs: 80, md: 100 },
                                    display: 'flex',
                                    flexDirection: allOptionsAreImages ? 'column' : 'column',
                                    gap: 1,
                                    justifyContent: allOptionsAreImages ? 'flex-start' : 'center',
                                    alignItems: allOptionsAreImages ? 'stretch' : 'flex-start',
                                    boxShadow: isUserAnswer ? '0 12px 30px rgba(15, 23, 42, 0.1)' : 'none',
                                    width: '100%',
                                    maxWidth: '100%',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {allOptionsAreImages ? (
                                    <Stack spacing={1} sx={{ width: '100%', flex: 1, minHeight: 0 }}>
                                      <Stack
                                        direction='row'
                                        spacing={1}
                                        alignItems='center'
                                        justifyContent='space-between'
                                        sx={{ width: '100%', minHeight: { xs: 32, md: 36 } }}
                                      >
                                        <Box
                                          sx={{
                                            minWidth: { xs: 28, md: 32 },
                                            width: { xs: 28, md: 32 },
                                            height: { xs: 28, md: 32 },
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                            flexShrink: 0,
                                            backgroundColor: isMatch
                                              ? alpha(theme.palette.success.main, 0.2)
                                              : isWrongPick
                                                ? alpha(theme.palette.error.main, 0.2)
                                                : alpha(theme.palette.primary.main, 0.15),
                                            color: isMatch
                                              ? theme.palette.success.dark
                                              : isWrongPick
                                                ? theme.palette.error.dark
                                                : theme.palette.primary.main
                                          }}
                                        >
                                          {String.fromCharCode(65 + optIndex)}
                                        </Box>
                                      </Stack>
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <>
                                          <Box
                                            onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: true })}
                                            sx={{
                                              width: '100%',
                                              position: 'relative',
                                              borderRadius: 1.5,
                                              overflow: 'hidden',
                                              border: `1px solid ${alpha(
                                                theme.palette.primary.main,
                                                isMatch
                                                  ? 0.4
                                                  : isWrongPick
                                                    ? 0.4
                                                    : 0.12
                                              )}`,
                                              backgroundColor: theme.palette.mode === 'dark' 
                                                ? alpha(theme.palette.common.black, 0.2)
                                                : alpha(theme.palette.common.white, 0.5),
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              height: { xs: 100, md: 120 },
                                              p: { xs: 1, md: 1.2 },
                                              flexShrink: 0,
                                              cursor: 'pointer',
                                              transition: 'all 0.3s ease',
                                              '&:hover': {
                                                '& .enlarge-overlay': {
                                                  opacity: 1
                                                }
                                              }
                                            }}
                                          >
                                            <Box
                                              component='img'
                                              src={option.image}
                                              alt={option.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                                              sx={{
                                                width: '100%',
                                                height: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                display: 'block'
                                              }}
                                            />
                                            <Box
                                              className='enlarge-overlay'
                                              sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                bgcolor: alpha(theme.palette.common.black, 0.4),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                backdropFilter: 'blur(2px)'
                                              }}
                                            >
                                              <Stack direction='row' spacing={0.75} alignItems='center'>
                                                <ZoomInIcon sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                                <Typography
                                                  variant='caption'
                                                  sx={{
                                                    color: theme.palette.common.white,
                                                    fontWeight: 600,
                                                    bgcolor: alpha(theme.palette.common.black, 0.6),
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.75
                                                  }}
                                                >
                                                  Click to view
                                                </Typography>
                                              </Stack>
                                            </Box>
                                          </Box>
                                          <Dialog
                                            open={imagePreviewOpen[`${question._id}-${option.id}`] || false}
                                            onClose={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}
                                            maxWidth='md'
                                            fullWidth
                                          >
                                            <DialogTitle>Option {String.fromCharCode(65 + optIndex)} Image</DialogTitle>
                                            <DialogContent>
                                              <Box
                                                component='img'
                                                src={option.image}
                                                alt={option.text || `Option ${String.fromCharCode(65 + optIndex)} Full Size`}
                                                sx={{
                                                  width: '100%',
                                                  height: 'auto',
                                                  maxHeight: '70vh',
                                                  objectFit: 'contain',
                                                  display: 'block'
                                                }}
                                              />
                                            </DialogContent>
                                            <DialogActions>
                                              <Button onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}>Close</Button>
                                            </DialogActions>
                                          </Dialog>
                                        </>
                                      )}
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          fontWeight: 500,
                                          fontSize: { xs: '0.75rem', md: '0.8125rem' },
                                          textAlign: 'center',
                                          minHeight: { xs: 20, md: 22 },
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {option.text || `option-${optIndex + 1}`}
                                      </Typography>
                                    </Stack>
                                  ) : (
                                    <Stack spacing={1.5} sx={{ width: '100%' }}>
                                      {/* Option Label and Text */}
                                      {(option.mediaType === 'text' || option.mediaType === 'text-image') && option.text && (
                                        <Stack direction='row' spacing={1} alignItems='flex-start' sx={{ width: '100%', maxWidth: '100%' }}>
                                          <Box
                                            sx={{
                                              minWidth: { xs: 28, md: 32 },
                                              width: { xs: 28, md: 32 },
                                              height: { xs: 28, md: 32 },
                                              borderRadius: 1.5,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontWeight: 700,
                                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                              flexShrink: 0,
                                              backgroundColor: isMatch
                                                ? alpha(theme.palette.success.main, 0.2)
                                                : isWrongPick
                                                  ? alpha(theme.palette.error.main, 0.2)
                                                  : alpha(theme.palette.primary.main, 0.15),
                                              color: isMatch
                                                ? theme.palette.success.dark
                                                : isWrongPick
                                                  ? theme.palette.error.dark
                                                  : theme.palette.primary.main
                                            }}
                                          >
                                            {String.fromCharCode(65 + optIndex)}
                                          </Box>
                                          <Typography
                                            variant='body1'
                                            sx={{
                                              flex: 1,
                                              minWidth: 0,
                                              fontWeight: 600,
                                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                                              lineHeight: 1.6,
                                              wordWrap: 'break-word',
                                              overflowWrap: 'break-word',
                                              whiteSpace: 'normal',
                                              textAlign: 'left',
                                              width: '100%',
                                              maxWidth: '100%'
                                            }}
                                          >
                                            {option.text}
                                          </Typography>
                                        </Stack>
                                      )}
                                      
                                      {/* Option Image */}
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <Box
                                          onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: true })}
                                          sx={{
                                            width: '100%',
                                            position: 'relative',
                                            borderRadius: 1.5,
                                            overflow: 'hidden',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                                            bgcolor: theme.palette.mode === 'dark' 
                                              ? alpha(theme.palette.common.black, 0.2)
                                              : alpha(theme.palette.common.white, 0.5),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.75,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.15)}`,
                                              '& .enlarge-overlay': {
                                                opacity: 1
                                              }
                                            }
                                          }}
                                        >
                                          <Box
                                            component='img'
                                            src={option.image}
                                            alt={option.text || `Option ${String.fromCharCode(65 + optIndex)}`}
                                            sx={{
                                              width: 'auto',
                                              height: 'auto',
                                              maxWidth: '100%',
                                              maxHeight: { xs: 100, sm: 120, md: 140 },
                                              objectFit: 'contain',
                                              display: 'block'
                                            }}
                                          />
                                          <Box
                                            className='enlarge-overlay'
                                            sx={{
                                              position: 'absolute',
                                              inset: 0,
                                              bgcolor: alpha(theme.palette.common.black, 0.4),
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              opacity: 0,
                                              transition: 'opacity 0.3s ease',
                                              backdropFilter: 'blur(2px)'
                                            }}
                                          >
                                            <Stack direction='row' spacing={0.75} alignItems='center'>
                                              <ZoomInIcon sx={{ color: theme.palette.common.white, fontSize: 20 }} />
                                              <Typography
                                                variant='caption'
                                                sx={{
                                                  color: theme.palette.common.white,
                                                  fontWeight: 600,
                                                  bgcolor: alpha(theme.palette.common.black, 0.6),
                                                  px: 1,
                                                  py: 0.5,
                                                  borderRadius: 0.75
                                                }}
                                              >
                                                Click to view
                                              </Typography>
                                            </Stack>
                                          </Box>
                                        </Box>
                                      )}
                                      
                                      {/* Image Preview Dialog */}
                                      {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                                        <Dialog
                                          open={imagePreviewOpen[`${question._id}-${option.id}`] || false}
                                          onClose={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}
                                          maxWidth='md'
                                          fullWidth
                                        >
                                          <DialogTitle>Option {String.fromCharCode(65 + optIndex)} Image</DialogTitle>
                                          <DialogContent>
                                            <Box
                                              component='img'
                                              src={option.image}
                                              alt={option.text || `Option ${String.fromCharCode(65 + optIndex)} Full Size`}
                                              sx={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '70vh',
                                                objectFit: 'contain',
                                                display: 'block'
                                              }}
                                            />
                                          </DialogContent>
                                          <DialogActions>
                                            <Button onClick={() => setImagePreviewOpen({ ...imagePreviewOpen, [`${question._id}-${option.id}`]: false })}>Close</Button>
                                          </DialogActions>
                                        </Dialog>
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
                                    </Stack>
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
                      <Typography
                        variant='body2'
                        color='error'
                        sx={{
                          fontStyle: 'italic',
                          width: '100%',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          textAlign: 'left'
                        }}
                      >
                        {(() => {
                          const correctOption = correctAnswers[0]
                          const correctIndex = question.data.options?.findIndex(opt => opt.id === correctOption?.id) ?? -1
                          const correctAnswerText = correctOption?.text || `option-${correctIndex + 1}`
                          return `The correct answer is "${correctAnswerText}".`
                        })()}
                      </Typography>
                    )}

                  {question.templateId === 'single-choice' &&
                    attempted &&
                    selectedAnswer !== correctAnswers[0]?.id && (
                      <Typography
                        variant='body2'
                        color='error'
                        sx={{
                          fontStyle: 'italic',
                          width: '100%',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal',
                          textAlign: 'left'
                        }}
                      >
                        {(() => {
                          const correctOption = correctAnswers[0]
                          const correctIndex = question.data.options?.findIndex(opt => opt.id === correctOption?.id) ?? -1
                          const correctAnswerText = correctOption?.text || `option-${correctIndex + 1}`
                          return `The correct answer is "${correctAnswerText}".`
                        })()}
                      </Typography>
                    )}

                  {question.templateId === 'multiple-choice' && attempted && (
                    <Typography
                      variant='body2'
                      color={incorrectSelected.length > 0 ? 'error' : 'info'}
                      sx={{
                        fontStyle: 'italic',
                        width: '100%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: 'left'
                      }}
                    >
                      {(() => {
                        const correctAnswersList = correctAnswers.map(correctOpt => {
                          const correctIndex = question.data.options?.findIndex(opt => opt.id === correctOpt.id) ?? -1
                          return correctOpt.text || `option-${correctIndex + 1}`
                        })
                        const answersText = correctAnswersList.map(a => `"${a}"`).join(', ')
                        return incorrectSelected.length > 0
                          ? `Correct answers: ${answersText}.`
                          : `Great attempt! Correct answers: ${answersText}.`
                      })()}
                    </Typography>
                  )}

                  {question.templateId === 'fill-in-blank' && (
                    <Typography
                      variant='body2'
                      color='info'
                      sx={{
                        fontStyle: 'italic',
                        width: '100%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        textAlign: 'left'
                      }}
                    >
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

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.2, sm: 1.6 }}
          justifyContent='center'
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
      </Stack>
    </Container>
  )
}

export default QuizSummary
