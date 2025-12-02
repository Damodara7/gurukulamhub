import React from 'react'
import { Card, CardContent, Checkbox, Typography, Box, Grid, Stack, Chip, alpha, useTheme } from '@mui/material'
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
        borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
        background: theme.palette.background.paper,
        boxShadow:
          theme.palette.mode === 'dark' ? '0 20px 44px rgba(0, 0, 0, 0.4)' : '0 20px 44px rgba(15, 23, 42, 0.14)',
        mx: { xs: 1, sm: 0 },
        width: { xs: 'calc(100% - 16px)', sm: '100%' },
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3, lg: 4 } }}>
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          <Stack spacing={{ xs: 1, sm: 1.5 }} alignItems='center' textAlign='center'>
            {(questionObj?.mediaType === 'text' ||
              questionObj?.mediaType === 'text-image' ||
              questionObj?.mediaType === 'text-video') && (
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.015em',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
                  px: { xs: 1, sm: 0 },
                  lineHeight: { xs: 1.4, sm: 1.5 }
                }}
              >
                {questionObj?.text}
              </Typography>
            )}
            {questionObj?.mediaType === 'video' && (
              <Typography
                variant='subtitle1'
                sx={{
                  color: alpha(theme.palette.text.primary, 0.75),
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  px: { xs: 1, sm: 0 }
                }}
              >
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
                border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.15)}`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 18px 40px rgba(0, 0, 0, 0.5)'
                    : '0 18px 40px rgba(15, 23, 42, 0.18)'
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
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            justifyContent='center'
            sx={{
              mx: 'auto',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {question.data.options.map((option, index) => {
              const isSelected = selectedAnswers?.includes(option.id)
              const optionLabel = String.fromCharCode(65 + index)
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  key={option.id}
                  sx={{
                    display: 'flex',
                    mb: { xs: 0, sm: 0 },
                    position: 'relative',
                    zIndex: isSelected ? 3 : 1,
                    mt: { xs: 0, sm: 0 },
                    overflow: 'visible',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <Box
                    onClick={() => !readOnly && handleCheckboxChange(option.id)}
                    sx={{
                      flexGrow: 1,
                      position: 'relative',
                      display: 'flex',
                      gap: { xs: 1.5, sm: 1.75, md: 2 },
                      alignItems: 'flex-start',
                      borderRadius: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
                      p: { xs: 1.5, sm: 2, md: 2.5, lg: 3.2 },
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        isSelected
                          ? theme.palette.mode === 'dark'
                            ? 0.4
                            : 0.32
                          : theme.palette.mode === 'dark'
                            ? 0.2
                            : 0.14
                      )}`,
                      background: isSelected
                        ? `linear-gradient(135deg, ${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.4 : 0.32
                          )}, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.35 : 0.26)})`
                        : theme.palette.mode === 'dark'
                          ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                              theme.palette.background.default,
                              0.8
                            )})`
                          : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(
                              theme.palette.common.white,
                              0.94
                            )})`,
                      transition:
                        'transform 0.2s ease, border-color 0.26s ease, box-shadow 0.2s ease, background 0.32s ease, scale 0.2s ease',
                      cursor: readOnly ? 'default' : 'pointer',
                      pointerEvents: readOnly ? 'none' : 'auto',
                      height: '100%',
                      minHeight: { xs: 'auto', sm: 100, md: 120, lg: 138 },
                      maxHeight: 'none',
                      boxShadow: isSelected
                        ? theme.palette.mode === 'dark'
                          ? '0 20px 50px rgba(0, 0, 0, 0.6)'
                          : '0 20px 50px rgba(15, 23, 42, 0.25)'
                        : theme.palette.mode === 'dark'
                          ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                          : '0 12px 32px rgba(15, 23, 42, 0.12)',
                      transform: isSelected ? 'scale(1)' : 'scale(1)',
                      transformOrigin: 'center',
                      '&:hover': {
                        transform: readOnly ? 'scale(1)' : 'scale(1)',
                        boxShadow: readOnly
                          ? theme.palette.mode === 'dark'
                            ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                            : '0 12px 32px rgba(15, 23, 42, 0.12)'
                          : isSelected
                            ? theme.palette.mode === 'dark'
                              ? '0 24px 60px rgba(0, 0, 0, 0.7)'
                              : '0 24px 60px rgba(15, 23, 42, 0.32)'
                            : theme.palette.mode === 'dark'
                              ? '0 18px 48px rgba(0, 0, 0, 0.5)'
                              : '0 18px 48px rgba(15, 23, 42, 0.22)',
                        borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.45 : 0.34),
                        background: readOnly
                          ? undefined
                          : theme.palette.mode === 'dark'
                            ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(
                                theme.palette.secondary.main,
                                0.2
                              )})`
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
                          : `radial-gradient(circle at top left, ${alpha(
                              theme.palette.primary.light,
                              0.24
                            )}, transparent 60%)`,
                        pointerEvents: 'none',
                        opacity: 0.9
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 1,
                        borderRadius: 'inherit',
                        border: `1px solid ${alpha(
                          theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
                          isSelected
                            ? theme.palette.mode === 'dark'
                              ? 0.2
                              : 0.4
                            : theme.palette.mode === 'dark'
                              ? 0.08
                              : 0.15
                        )}`,
                        pointerEvents: 'none',
                        opacity: 0.5
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      sx={{
                        mt: { xs: 0.25, sm: 0.5 },
                        alignSelf: { xs: 'center', sm: 'flex-start' },
                        color: isSelected
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.light, 0.7)
                            : alpha(theme.palette.primary.dark, 0.7),
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: 22, sm: 24, md: 26 },
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

                    <Stack
                      spacing={{ xs: 1, sm: 1.4 }}
                      sx={{
                        flexGrow: 1,
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: { xs: 1, sm: 1.5, md: 2 },
                          minWidth: 0,
                          width: '100%',
                          flexWrap: { xs: 'wrap', sm: 'nowrap' },
                          overflow: 'hidden'
                        }}
                      >
                        <Stack
                          direction='row'
                          spacing={{ xs: 0.75, sm: 1.1 }}
                          alignItems='center'
                          sx={{ minWidth: 0, flex: 1 }}
                        >
                          <Box
                            sx={{
                              width: { xs: 32, sm: 36, md: 40, lg: 46 },
                              height: { xs: 32, sm: 36, md: 40, lg: 46 },
                              borderRadius: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 400,
                              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem', lg: '1.1rem' },
                              flexShrink: 0,
                              background: isSelected
                                ? `linear-gradient(135deg, ${alpha(
                                    theme.palette.secondary.light,
                                    theme.palette.mode === 'dark' ? 0.6 : 0.5
                                  )}, ${alpha(
                                    theme.palette.secondary.dark,
                                    theme.palette.mode === 'dark' ? 0.45 : 0.35
                                  )})`
                                : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.14),
                              color: isSelected
                                ? theme.palette.secondary.contrastText
                                : theme.palette.mode === 'dark'
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.main,
                              boxShadow: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? '0 12px 24px rgba(0, 0, 0, 0.5)'
                                  : '0 12px 24px rgba(15, 23, 42, 0.18)'
                                : 'none'
                            }}
                          >
                            {optionLabel}
                          </Box>

                          <Stack spacing={{ xs: 0.25, sm: 0.35 }} sx={{ minWidth: 0, flex: 1 }}>
                            {option.mediaType === 'text' && option.text && (
                              <Typography
                                variant='body1'
                                sx={{
                                  fontWeight: 400,
                                  color: isSelected
                                    ? theme.palette.mode === 'dark'
                                      ? theme.palette.common.white
                                      : alpha(theme.palette.common.white, 0.95)
                                    : theme.palette.text.primary,
                                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem', lg: '1.1rem' },
                                  lineHeight: { xs: 1.4, sm: 1.5 },
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  display: '-webkit-box',
                                  WebkitLineClamp: { xs: 3, sm: 4, md: 5 },
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {option.text}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        {isSelected && (
                          <Chip
                            size='small'
                            label='Selected'
                            sx={{
                              borderRadius: 999,
                              fontWeight: 500,
                              bgcolor: alpha(theme.palette.success.light, 1),
                              color: 'white',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                              flexShrink: 0,
                              ml: { xs: 0, sm: 'auto' },
                              alignSelf: { xs: 'flex-start', sm: 'center' },
                              whiteSpace: 'nowrap'
                            }}
                          />
                        )}
                      </Box>

                      {option.mediaType === 'image' && option.image && (
                        <Box
                          component='img'
                          src={option.image}
                          alt={option.text}
                          sx={{
                            width: '100%',
                            maxWidth: '100%',
                            maxHeight: { xs: 150, sm: 180, md: 200, lg: 220 },
                            objectFit: 'cover',
                            borderRadius: { xs: 1.5, sm: 2 },
                            border: `1px solid ${alpha(
                              theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
                              isSelected
                                ? theme.palette.mode === 'dark'
                                  ? 0.15
                                  : 0.3
                                : theme.palette.mode === 'dark'
                                  ? 0.08
                                  : 0.12
                            )}`,
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? '0 12px 32px rgba(0, 0, 0, 0.5)'
                                : '0 12px 32px rgba(15, 23, 42, 0.18)',
                            mt: { xs: 0.5, sm: 0 },
                            display: 'block'
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
