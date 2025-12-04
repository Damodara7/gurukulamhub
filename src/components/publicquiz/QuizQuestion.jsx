import React from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Paper,
  Chip,
  Collapse,
  alpha,
  useTheme
} from '@mui/material'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import SingleChoiceTemplate from './SingleChoiceTemplate'
import MultipleChoiceTemplate from './MultipleChoiceTemplate'
import TrueFalseQuizTemplate from './TrueFalseQuizTemplate'
import FillInBlanksTemplate from './FillInBlanksTemplate'

const QuizQuestion = ({
  currentQuestion,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  handleAnswerSelect,
  handleAnswerFillInBlanks,
  handleShowHint,
  hintUsed,
  hasHint,
  isSkippable,
  handleSkip,
  isAnswerSelected,
  handleNext
}) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const totalQuestions = questions.length
  const progress = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0
  const instruction =
    currentQuestion?.data?.question?.instruction ||
    (currentQuestion?.templateId === 'multiple-choice' ? 'Select every answer that applies' : 'Select the best answer')

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 3, md: 3.5 },
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 3, md: 4 },
        width: '100%',
        maxWidth: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.12)}`,
        background: isDarkMode
          ? `linear-gradient(160deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.background.paper, 0.95)})`
          : `linear-gradient(160deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(
              theme.palette.background.paper,
              0.95
            )})`,
        boxShadow: isDarkMode ? '0 18px 32px rgba(0,0,0,0.3)' : '0 20px 44px rgba(15, 23, 42, 0.14)'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.18)}, transparent 55%)`
        }}
      />

      <Stack spacing={{ xs: 2.5, md: 3.5 }} position='relative' zIndex={1} sx={{ width: '100%', maxWidth: '100%' }}>
        <Stack spacing={{ xs: 1.2, md: 1.8 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.4, md: 1 }} alignItems='center' sx={{ width: '100%', maxWidth: '100%' }}>
            <Typography
              variant='overline'
              sx={{ letterSpacing: '0.2em', color: alpha(theme.palette.text.primary, 0.6), fontWeight: 700 }}
            >
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Typography>

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              {instruction}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.2, md: 2 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent='space-between'
            sx={{ width: '100%', maxWidth: '100%' }}
          >
            {/* <Typography
              variant='h4'
              sx={{
                fontSize: { xs: '1.8rem', md: '2.35rem' },
                fontWeight: 900,
                letterSpacing: '-0.02em'
              }}
            >
              {currentQuestion?.data?.question?.title || currentQuestion?.data?.question?.text || 'Quiz Question'}
            </Typography> */}

            <Box sx={{ minWidth: { xs: '100%', md: 220 }, width: '100%', maxWidth: '100%' }}>
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: alpha(theme.palette.primary.main, 0.14),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }
                }}
              />
            </Box>
          </Stack>
        </Stack>

        <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {/* Dynamically render the correct template based on the question type */}
          {currentQuestion?.templateId === 'single-choice' && (
            <SingleChoiceTemplate
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
          {currentQuestion?.templateId === 'multiple-choice' && (
            <MultipleChoiceTemplate
              question={currentQuestion}
              selectedAnswers={selectedAnswers[currentQuestion._id] || []}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
          {currentQuestion?.templateId === 'true-or-false' && (
            <TrueFalseQuizTemplate
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion._id] || ''}
              onAnswerSelect={handleAnswerSelect}
            />
          )}
          {currentQuestion?.templateId === 'fill-in-blank' && (
            <FillInBlanksTemplate
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion._id] || {}}
              onAnswer={handleAnswerFillInBlanks}
            />
          )}
        </Box>

        <Stack spacing={1.5}>
          {/* Hint section */}
          {hasHint && (
            <Box
              sx={{
                borderRadius: 20,
                px: { xs: 2.6, sm: 3.2 },
                py: { xs: 2.2, sm: 2.6 },
                background: isDarkMode
                  ? `linear-gradient(150deg, ${alpha(theme.palette.info.main, hintUsed ? 0.3 : 0.2)}, ${alpha(
                      theme.palette.background.paper,
                      0.96
                    )})`
                  : `linear-gradient(150deg, ${alpha(theme.palette.info.light, hintUsed ? 0.4 : 0.26)}, ${alpha(
                      theme.palette.background.paper,
                      0.96
                    )})`,
                border: `1px solid ${alpha(theme.palette.info.main, hintUsed ? (isDarkMode ? 0.5 : 0.48) : isDarkMode ? 0.4 : 0.3)}`,
                boxShadow: hintUsed
                  ? isDarkMode
                    ? '0 24px 48px rgba(2, 136, 209, 0.4)'
                    : '0 24px 48px rgba(2, 136, 209, 0.3)'
                  : isDarkMode
                    ? '0 20px 44px rgba(2, 136, 209, 0.3)'
                    : '0 20px 44px rgba(2, 136, 209, 0.2)'
              }}
            >
              <Stack spacing={hintUsed ? 1.8 : 1.4}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.6, sm: 2 }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent='space-between'
                >
                  <Stack
                    direction='row'
                    spacing={1.8}
                    alignItems='center'
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        position: 'relative',
                        borderRadius: '46%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(145deg, ${alpha(theme.palette.info.main, 0.24)}, ${alpha(
                          theme.palette.info.light,
                          0.32
                        )})`,
                        color: theme.palette.info.dark,
                        boxShadow: '0 14px 28px rgba(2, 136, 209, 0.2)'
                      }}
                    >
                      <LightbulbOutlinedIcon fontSize='small' />
                    </Box>

                    <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                      <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
                        <Typography
                          variant='subtitle1'
                          fontWeight={800}
                          color={theme.palette.info.dark}
                          sx={{ letterSpacing: '0.01em' }}
                        >
                          {hintUsed ? 'Hint unlocked' : 'Hint locked'}
                        </Typography>
                        <Chip
                          icon={hintUsed ? <LockOpenOutlinedIcon sx={{ fontSize: '1rem' }} /> : <LockOutlinedIcon sx={{ fontSize: '1rem' }} />}
                          label={hintUsed ? 'Unlocked' : 'Locked'}
                          size='small'
                          color={hintUsed ? 'success' : 'info'}
                        />
                      </Stack>
                      {!hintUsed && <Typography
                        variant='body2'
                        color={alpha(theme.palette.text.primary, 0.85)}
                        sx={{ lineHeight: 1.65 }}
                      >
                        Be cautious — revealing the hint might deduct points, so unlock it only if you truly need it.
                      </Typography>}
                      {hintUsed && <Typography
                        variant='h5'
                        color={alpha(theme.palette.text.primary, 0.92)}
                        sx={{ lineHeight: 1.7 }}
                      >
                        {currentQuestion.data.hint}
                      </Typography>}
                    </Stack>
                  </Stack>

                  {!hintUsed && (
                    <Button
                      variant='contained'
                      component='label'
                      color='info'
                      startIcon={<LightbulbOutlinedIcon />}
                      onClick={() => handleShowHint(currentQuestion._id)}
                      sx={{
                        alignSelf: { xs: 'stretch', sm: 'center' },
                        borderRadius: 14,
                        px: { xs: 3.1, sm: 3.8 },
                        py: { xs: 1.2, sm: 1.45 },
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        letterSpacing: '0.01em',
                        boxShadow: '0 20px 42px rgba(2, 136, 209, 0.28)',
                        background: `linear-gradient(125deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                        color: theme.palette.common.white,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 28px 52px rgba(2, 136, 209, 0.32)',
                          background: `linear-gradient(125deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`
                        },
                        '& .MuiButton-startIcon': {
                          mr: 1.2
                        }
                      }}
                    >
                      Reveal Hint
                    </Button>
                  )}
                </Stack>

 
              </Stack>
            </Box>
          )}
        </Stack>

        {/* Bottom action buttons */}
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 2 }}
          justifyContent='flex-end'
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          {isSkippable && (
            <Button
              variant='outlined'
              color='warning'
              onClick={handleSkip}
              sx={{
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 600,
                px: 4
              }}
            >
              Skip
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!isAnswerSelected}
            variant='contained'
            color='primary'
            component='label'
            sx={{
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 700,
              px: { xs: 4, sm: 6 },
              py: { xs: 1.4, sm: 1.6 },
              minWidth: { xs: '100%', sm: 220 },
              fontSize: { xs: '1rem', sm: '1.1rem' },
              boxShadow: '0 24px 48px rgba(76, 29, 149, 0.25)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              color: theme.palette.common.white,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 30px 60px rgba(76, 29, 149, 0.32)'
              },
              '&.Mui-disabled': {
                boxShadow: 'none',
                color: alpha(theme.palette.common.white, 0.6)
              }
            }}
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default QuizQuestion
