import React from 'react'
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Box,
  Grid,
  Stack,
  Chip,
  alpha,
  useTheme
} from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const MultipleChoiceTemplate = ({ question, selectedAnswers, onAnswerSelect, readOnly = false }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()

  // Handle checkbox change
  const handleCheckboxChange = optionId => {
    if (readOnly) return
    let updatedAnswers
    if (selectedAnswers.includes(optionId)) {
      updatedAnswers = selectedAnswers.filter(id => id !== optionId) // Remove if already selected
    } else {
      updatedAnswers = [...selectedAnswers, optionId] // Add if not selected
    }
    onAnswerSelect(question._id, updatedAnswers)
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
            {(questionObj?.mediaType === 'text' ||
              questionObj?.mediaType === 'text-image' ||
              questionObj?.mediaType === 'text-video') && (
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.015em'
                }}
              >
                {questionObj?.text}
              </Typography>
            )}
            {questionObj?.mediaType === 'video' && (
              <Typography variant='subtitle1' sx={{ color: alpha(theme.palette.text.primary, 0.75), fontWeight: 600 }}>
                Watch the video carefully and answer the question.
              </Typography>
            )}
          </Stack>

          {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
            <Box
              component='img'
              src={questionObj.image}
              alt='Question'
              sx={{
                width: '100%',
                maxHeight: { xs: 260, md: 320 },
                objectFit: 'cover',
                borderRadius: { xs: 2, md: 2.5 },
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)'
              }}
            />
          )}

          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <Stack spacing={1.5} alignItems='center'>
              <VideoAd url={questionObj.video || ''} height='240px' showPause autoPlay={false} />
              <ImagePopup imageUrl={questionObj.video || ''} mediaType='video' />
            </Stack>
          )}

          <Grid
            container
            spacing={3}
            justifyContent='center'
            sx={{
              mx: 'auto',
              width: '100%',
            }}
          >
            {question.data.options.map((option, index) => {
              const isSelected = selectedAnswers?.includes(option.id)
              const optionLabel = String.fromCharCode(65 + index)
              return (
                <Grid item xs={12} md={6} key={option.id}>
                  <Box
                    onClick={() => !readOnly && handleCheckboxChange(option.id)}
                    sx={{
                      flexGrow: 1,
                      position: 'relative',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      borderRadius: { xs: 3.2, md: 4 },
                      p: { xs: 2.2, md: 3.2 },
                      border: `1px solid ${alpha(theme.palette.primary.main, isSelected ? 0.32 : 0.14)}`,
                      background: isSelected
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.32)}, ${alpha(
                            theme.palette.secondary.main,
                            0.26
                          )})`
                        : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
                            theme.palette.common.white,
                            0.94
                          )})`,
                      transition:
                        'transform 0.32s ease, border-color 0.26s ease, box-shadow 0.32s ease, background 0.32s ease',
                      cursor: readOnly ? 'default' : 'pointer',
                      pointerEvents: readOnly ? 'none' : 'auto',
                      height: '100%',
                      minHeight: { xs: 106, md: 138 },
                      boxShadow: isSelected
                        ? '0 36px 88px rgba(15, 23, 42, 0.34)'
                        : '0 24px 52px rgba(15, 23, 42, 0.15)',
                      '&:hover': {
                        transform: readOnly ? 'none' : 'translateY(-10px)',
                        boxShadow: readOnly
                          ? '0 24px 52px rgba(15, 23, 42, 0.15)'
                          : '0 42px 96px rgba(15, 23, 42, 0.32)',
                        borderColor: alpha(theme.palette.primary.main, 0.34),
                        background: readOnly
                          ? undefined
                          : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.18)}, ${alpha(
                              theme.palette.secondary.main,
                              0.16
                            )})`
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: isSelected
                          ? `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.2)}, transparent 55%)`
                          : `radial-gradient(circle at top left, ${alpha(theme.palette.primary.light, 0.24)}, transparent 60%)`,
                        pointerEvents: 'none',
                        opacity: 0.9
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 1,
                        borderRadius: 'inherit',
                        border: `1px solid ${alpha(theme.palette.common.white, isSelected ? 0.4 : 0.15)}`,
                        pointerEvents: 'none',
                        opacity: 0.5
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      sx={{
                        mt: 0.5,
                        alignSelf: { xs: 'center', sm: 'flex-start' },
                        color: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.dark, 0.7),
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 26,
                          filter: isSelected ? 'drop-shadow(0px 8px 18px rgba(15,23,42,0.28))' : 'none'
                        }
                      }}
                      onChange={e => {
                        e.stopPropagation()
                        handleCheckboxChange(option.id)
                      }}
                      onClick={e => {
                        if (readOnly) e.preventDefault()
                        e.stopPropagation()
                      }}
                      disabled={readOnly}
                    />

                    <Stack spacing={1.4} sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto',
                          alignItems: 'center',
                          columnGap: 12,
                          rowGap: 10,
                          minWidth: 0
                        }}
                      >
                        <Stack direction='row' spacing={1.1} alignItems='center' sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: { xs: 40, md: 46 },
                              height: { xs: 40, md: 46 },
                              borderRadius: { xs: 3.2, md: 4 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              background: isSelected
                                ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.5)}, ${alpha(
                                    theme.palette.secondary.dark,
                                    0.35
                                  )})`
                                : alpha(theme.palette.primary.main, 0.14),
                              color: isSelected ? theme.palette.secondary.contrastText : theme.palette.primary.main,
                              boxShadow: isSelected ? '0 18px 32px rgba(15, 23, 42, 0.22)' : 'none'
                            }}
                          >
                            {optionLabel}
                          </Box>

                          <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                            {option.mediaType === 'text' && option.text && (
                              <Typography
                                variant='body1'
                                sx={{
                                  fontWeight: 700,
                                  color: isSelected ? alpha(theme.palette.common.white, 0.95) : theme.palette.text.primary,
                                  fontSize: { xs: '0.95rem', sm: '1.02rem', md: '1.1rem' },
                                  lineHeight: 1.32
                                }}
                              >
                                {option.text}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        <Box />

                        <Stack alignItems='flex-end'>
                          {isSelected && (
                            <Chip
                              size='small'
                              label='Selected'
                              sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                bgcolor: alpha(theme.palette.success.light, 1),
                                color: 'white',
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      {option.mediaType === 'image' && option.image && (
                        <Box
                          component='img'
                          src={option.image}
                          alt={option.text}
                          sx={{
                            width: '100%',
                            maxHeight: { xs: 180, md: 220 },
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.common.white, isSelected ? 0.3 : 0.12)}`,
                            boxShadow: '0 20px 46px rgba(15, 23, 42, 0.22)'
                          }}
                        />
                      )}
                    </Stack>

                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MultipleChoiceTemplate
