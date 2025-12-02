import { Card, CardContent, Typography, TextField, Box, Stack, alpha, useTheme, Chip, useMediaQuery } from '@mui/material'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'

const FillInBlanksTemplate = ({ question, onAnswer, selectedAnswer, readOnly = false }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const questionObj = question?.data?.question
  
  // Store the latest onAnswer callback in a ref to avoid re-renders
  const onAnswerRef = useRef(onAnswer)
  useEffect(() => {
    onAnswerRef.current = onAnswer
  }, [onAnswer])

  const initialAnswers = useMemo(() => {
    if (readOnly) {
      return selectedAnswer || []
    }

    if (!Array.isArray(questionObj)) {
      return []
    }

    return questionObj
      .filter(part => part.type === 'blank')
      .map(part => ({
        ...part,
        content: ''
      }))
  }, [questionObj, readOnly, selectedAnswer])

  const [blankAnswers, setBlankAnswers] = useState(initialAnswers)

  useEffect(() => {
    setBlankAnswers(initialAnswers)
  }, [question?._id])

  // Handle content change for the blank parts
  const handleContentChange = useCallback(
    (partId, value) => {
      if (readOnly) return

      setBlankAnswers(prevAnswers => {
        const updatedAnswers = prevAnswers.map(part => {
          if (part.id === partId) {
            return { ...part, content: value }
          }
          return part
        })
        
        // Call onAnswer with updated answers using ref to avoid re-renders
        onAnswerRef.current(question._id, updatedAnswers)
        return updatedAnswers
      })
    },
    [readOnly, question._id]
  )

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 3, md: 3.5 },
        overflow: 'hidden',
        border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.primary.main, 0.08)}`,
        background: isDarkMode
          ? alpha(theme.palette.background.paper, 0.6)
          : alpha(theme.palette.background.paper, 0.92),
        boxShadow: isDarkMode
          ? `0 20px 44px ${alpha(theme.palette.common.black, 0.4)}`
          : `0 20px 44px ${alpha(theme.palette.common.black, 0.14)}`
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1.5} alignItems='center' textAlign='center'>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.015em',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                color: 'text.primary'
              }}
            >
              Fill in the missing words to complete the sentence.
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: alpha(theme.palette.text.primary, isDarkMode ? 0.7 : 0.65),
                fontSize: { xs: '0.875rem', sm: '0.9375rem' }
              }}
            >
              Type your answers in the highlighted blanks below. We'll save each blank as soon as you complete it.
            </Typography>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: 3, md: 3.5 },
              border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.2) : alpha(theme.palette.primary.main, 0.16)}`,
              background: isDarkMode
                ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )})`
                : `linear-gradient(140deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                    theme.palette.common.white,
                    0.95
                  )})`,
              px: { xs: 2, md: 2.6 },
              py: { xs: 2, md: 2.6 },
              boxShadow: isDarkMode
                ? `0 24px 54px ${alpha(theme.palette.common.black, 0.4)}`
                : `0 24px 54px ${alpha(theme.palette.common.black, 0.16)}`,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-40% 10% auto -35%',
                height: '220%',
                width: '120%',
                background: isDarkMode
                  ? `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 65%)`
                  : `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 65%)`,
                transform: 'rotate(8deg)',
                opacity: isDarkMode ? 0.6 : 0.85
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 'auto -25% -55% 55%',
                height: '220%',
                width: '140%',
                background: isDarkMode
                  ? `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 70%)`
                  : `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.16)} 0%, transparent 70%)`,
                opacity: isDarkMode ? 0.7 : 1
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {Array.isArray(questionObj) &&
              questionObj.map(part => {
                const answerValue = blankAnswers.find(b => b.id === part.id)?.content || ''
                if (part.type === 'text') {
                  return (
                    <Typography
                      key={part.id}
                      variant='body1'
                      component='span'
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.02rem', md: '1.08rem' },
                        fontWeight: 600,
                        lineHeight: 1.5
                      }}
                    >
                      {part.content}
                    </Typography>
                  )
                }

                if (readOnly) {
                  return (
                    <Chip
                      key={part.id}
                      label={answerValue || '—'}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        height: 'auto',
                        fontSize: { xs: '1.02rem', md: '1.08rem' },
                        fontWeight: 600,
                        borderRadius: 2,
                        backgroundColor: isDarkMode
                          ? alpha(theme.palette.success.main, 0.25)
                          : alpha(theme.palette.success.main, 0.18),
                        color: isDarkMode ? theme.palette.success.light : theme.palette.success.dark,
                        '& .MuiChip-label': {
                          padding: '4px 8px'
                        }
                      }}
                    />
                  )
                }

                return (
                  <TextField
                    key={part.id}
                    size='small'
                    variant='outlined'
                    placeholder='Type answer'
                    value={answerValue}
                    onChange={e => handleContentChange(part.id, e.target.value)}
                    sx={{
                      minWidth: { xs: 120, sm: 150 },
                      maxWidth: 260,
                      '& .MuiInputBase-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: '1.02rem', md: '1.08rem' },
                        backgroundColor: isDarkMode
                          ? alpha(theme.palette.background.paper, 0.8)
                          : alpha(theme.palette.common.white, 0.92),
                        boxShadow: isDarkMode
                          ? `0 14px 32px ${alpha(theme.palette.common.black, 0.3)}`
                          : `0 14px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                        height: 'auto',
                        color: 'text.primary'
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                        color: 'text.primary'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDarkMode
                          ? alpha(theme.palette.divider, 0.3)
                          : alpha(theme.palette.primary.main, 0.24)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDarkMode
                          ? alpha(theme.palette.primary.main, 0.5)
                          : alpha(theme.palette.primary.main, 0.4)
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main
                      }
                    }}
                    disabled={readOnly}
                  />
                )
              })}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default FillInBlanksTemplate
