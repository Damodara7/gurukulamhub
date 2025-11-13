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
        borderRadius: { xs: 3, md: 3.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.92),
        boxShadow: '0 20px 44px rgba(15, 23, 42, 0.14)'
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1.5} alignItems='center' textAlign='center'>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.015em'
              }}
            >
              Fill in the missing words to complete the sentence.
            </Typography>
            <Typography variant='body2' sx={{ color: alpha(theme.palette.text.primary, 0.65) }}>
              Type your answers in the highlighted blanks below. We’ll save each blank as soon as you complete it.
            </Typography>
          </Stack>

          <Box
            sx={{
              position: 'relative',
              borderRadius: { xs: 3, md: 3.5 },
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              background: `linear-gradient(140deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                theme.palette.common.white,
                0.95
              )})`,
              px: { xs: 2, md: 2.6 },
              py: { xs: 2, md: 2.6 },
              boxShadow: '0 24px 54px rgba(15, 23, 42, 0.16)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-40% 10% auto -35%',
                height: '220%',
                width: '120%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 65%)`,
                transform: 'rotate(8deg)',
                opacity: 0.85
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 'auto -25% -55% 55%',
                height: '220%',
                width: '140%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.16)} 0%, transparent 70%)`
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1, lineHeight: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                        fontWeight: 600
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
                        px: 1.7,
                        py: 1,
                        fontSize: '1rem',
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.18),
                        color: theme.palette.success.dark
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
                      minWidth: { xs: 120, sm: 150 },
                      maxWidth: 260,
                      '& .MuiInputBase-root': {
                        borderRadius: 2.5,
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.common.white, 0.92),
                        boxShadow: '0 14px 32px rgba(15, 23, 42, 0.1)'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.24)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.primary.main, 0.4)
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
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
