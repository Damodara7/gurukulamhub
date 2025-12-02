import { Card, CardContent, Typography, TextField, Box, Stack, alpha, useTheme, Chip } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

const FillInBlanksTemplate = ({ question, onAnswer, selectedAnswer, readOnly = false }) => {
  const theme = useTheme()
  const questionObj = question?.data?.question

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
  }, [initialAnswers, question?._id])

  // Handle content change for the blank parts
  const handleContentChange = (partId, value) => {
    if (readOnly) return

    const updatedBlankAnswers = blankAnswers.map(part => {
      if (part.id === partId) {
        return { ...part, content: value }
      }
      return part
    })

    setBlankAnswers(updatedBlankAnswers)
    onAnswer(question._id, updatedBlankAnswers)
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
        background: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === 'dark' ? '0 20px 44px rgba(0, 0, 0, 0.4)' : '0 20px 44px rgba(15, 23, 42, 0.14)',
        mx: { xs: 1, sm: 0 },
        width: { xs: 'calc(100% - 16px)', sm: '100%' }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3, lg: 4 } }}>
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Stack spacing={{ xs: 1, sm: 1.5 }} alignItems='center' textAlign='center'>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 400,
                letterSpacing: '-0.015em',
                fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
                px: { xs: 1, sm: 0 },
                lineHeight: { xs: 1.4, sm: 1.5 },
                color: theme.palette.text.primary
              }}
            >
              Fill in the missing words to complete the sentence.
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.75 : 0.65),
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                px: { xs: 1, sm: 0 },
                lineHeight: { xs: 1.4, sm: 1.5 }
              }}
            >
              Type your answers in the highlighted blanks below. We'll save each blank as soon as you complete it.
            </Typography>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
              border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.16)}`,
              background:
                theme.palette.mode === 'dark'
                  ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                      theme.palette.background.default,
                      0.8
                    )})`
                  : `linear-gradient(140deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                      theme.palette.common.white,
                      0.95
                    )})`,
              px: { xs: 1.5, sm: 2, md: 2.5, lg: 2.6 },
              py: { xs: 1.5, sm: 2, md: 2.5, lg: 2.6 },
              boxShadow:
                theme.palette.mode === 'dark' ? '0 24px 54px rgba(0, 0, 0, 0.5)' : '0 24px 54px rgba(15, 23, 42, 0.16)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-40% 10% auto -35%',
                height: '220%',
                width: '120%',
                background: `radial-gradient(circle, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.12 : 0.18
                )} 0%, transparent 65%)`,
                transform: 'rotate(8deg)',
                opacity: theme.palette.mode === 'dark' ? 0.6 : 0.85
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 'auto -25% -55% 55%',
                height: '220%',
                width: '140%',
                background: `radial-gradient(circle, ${alpha(
                  theme.palette.secondary.main,
                  theme.palette.mode === 'dark' ? 0.1 : 0.16
                )} 0%, transparent 70%)`,
                opacity: theme.palette.mode === 'dark' ? 0.5 : 1
              }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                lineHeight: { xs: 1.8, sm: 2, md: 2.2 },
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 0.75, sm: 1, md: 1.25 },
                alignItems: { xs: 'flex-start', sm: 'center' }
              }}
            >
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
                          fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem', lg: '1.125rem' },
                          fontWeight: 400,
                          lineHeight: { xs: 1.6, sm: 1.8, md: 2 },
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
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
                          px: { xs: 1.2, sm: 1.5, md: 1.7 },
                          py: { xs: 0.75, sm: 0.875, md: 1 },
                          fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                          borderRadius: { xs: 1.5, sm: 2 },
                          backgroundColor: alpha(
                            theme.palette.success.main,
                            theme.palette.mode === 'dark' ? 0.25 : 0.18
                          ),
                          color:
                            theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark,
                          fontWeight: 400,
                          height: { xs: 32, sm: 36, md: 40 }
                        }}
                      />
                    )
                  }

                  return (
                    <TextField
                      key={part.id}
                      size='medium'
                      variant='outlined'
                      placeholder='Type answer'
                      value={answerValue}
                      onChange={e => handleContentChange(part.id, e.target.value)}
                      sx={{
                        minWidth: { xs: 100, sm: 130, md: 150, lg: 180 },
                        maxWidth: { xs: 200, sm: 240, md: 260, lg: 300 },
                        width: { xs: '100%', sm: 'auto' },
                        '& .MuiInputBase-root': {
                          borderRadius: { xs: 2, sm: 2.25, md: 2.5 },
                          fontWeight: 400,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.default, 0.8)
                              : alpha(theme.palette.common.white, 0.92),
                          color: theme.palette.text.primary,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 14px 32px rgba(0, 0, 0, 0.4)'
                              : '0 14px 32px rgba(15, 23, 42, 0.1)',
                          '& input': {
                            py: { xs: 1, sm: 1.25, md: 1.5 },
                            px: { xs: 1.25, sm: 1.5, md: 1.75 }
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.5 : 0.4),
                          opacity: 1
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.24)
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.5 : 0.4)
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: theme.palette.mode === 'dark' ? '2px' : '1px'
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
