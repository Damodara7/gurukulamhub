import React from 'react'
import {
  Card,
  CardContent,
  RadioGroup,
  Radio,
  Typography,
  Grid,
  Box,
  Stack,
  Chip,
  alpha,
  useTheme
} from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const TrueFalseTemplate = ({ question, selectedAnswer, onAnswerSelect, readOnly = false }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const handleOptionSelect = (questionId, optionId) => {
    if (!readOnly && onAnswerSelect) {
      onAnswerSelect(questionId, optionId)
    }
  }
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 3, md: 3.5 },
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.12) : alpha(theme.palette.primary.main, 0.08)}`,
        background: isDarkMode
          ? alpha(theme.palette.background.paper, 0.6)
          : alpha(theme.palette.background.paper, 0.92),
        boxShadow: isDarkMode
          ? `0 20px 44px ${alpha(theme.palette.common.black, 0.4)}`
          : `0 20px 44px ${alpha(theme.palette.common.black, 0.14)}`
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 }, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '100%' }}>
          <Stack spacing={1.5} alignItems='flex-start' sx={{ width: '100%', maxWidth: '100%' }}>
            {(questionObj?.mediaType === 'text' ||
              questionObj?.mediaType === 'text-image' ||
              questionObj?.mediaType === 'text-video') && (
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.015em',
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  color: 'text.primary',
                  width: '100%',
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.5,
                  textAlign: 'left'
                }}
              >
                {questionObj?.text}
              </Typography>
            )}
            {questionObj?.mediaType === 'video' && (
              <Typography
                variant='subtitle1'
                sx={{
                  color: alpha(theme.palette.text.primary, isDarkMode ? 0.8 : 0.75),
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
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

        <RadioGroup
          value={selectedAnswer || ''}
          onChange={e => handleOptionSelect(question._id, e.target.value)}
          sx={{ width: '100%' }}
        >
          <Grid
            container
            spacing={{ xs: 2.2, md: 3 }}
            justifyContent='center'
            sx={{ mx: 'auto', width: '100%' }}
          >
            {question?.data?.options?.map((option, index) => {
              const isSelected = selectedAnswer === option.id
              const optionLabel = String.fromCharCode(65 + index)

              return (
                <Grid item xs={12} key={option.id}>
                  <Box
                    onClick={() => handleOptionSelect(question._id, option.id)}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      gap: { xs: 1.6, md: 2.4 },
                      alignItems: 'center',
                      borderRadius: { xs: 3, md: 3.8 },
                      p: { xs: 2.2, md: 3 },
                      border: `1px solid ${alpha(theme.palette.primary.main, isSelected ? 0.32 : 0.14)}`,
                      background: isSelected
                        ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.32)}, ${alpha(
                            theme.palette.secondary.main,
                            0.25
                          )})`
                        : `linear-gradient(150deg, ${alpha(theme.palette.primary.light, 0.16)}, ${alpha(
                            theme.palette.common.white,
                            0.94
                          )})`,
                      transition:
                        'transform 0.3s ease, border-color 0.24s ease, box-shadow 0.3s ease, background 0.3s ease',
                      cursor: readOnly ? 'default' : 'pointer',
                      pointerEvents: readOnly ? 'none' : 'auto',
                      minHeight: { xs: 94, md: 118 },
                      boxShadow: isSelected
                        ? '0 32px 74px rgba(15, 23, 42, 0.28)'
                        : '0 22px 48px rgba(15, 23, 42, 0.14)',
                      '&:hover': {
                        transform: readOnly ? 'none' : 'translateY(-10px)',
                        boxShadow: readOnly
                          ? '0 22px 48px rgba(15, 23, 42, 0.14)'
                          : '0 38px 86px rgba(15, 23, 42, 0.3)',
                        borderColor: alpha(theme.palette.primary.main, 0.32),
                        background: readOnly
                          ? undefined
                          : `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.24)}, ${alpha(
                              theme.palette.secondary.main,
                              0.19
                            )})`
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: isSelected
                          ? `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.2)}, transparent 55%)`
                          : `radial-gradient(circle at top left, ${alpha(theme.palette.primary.light, 0.22)}, transparent 55%)`,
                        pointerEvents: 'none',
                        opacity: 0.9
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 1,
                        borderRadius: 'inherit',
                        border: `1px solid ${alpha(theme.palette.common.white, isSelected ? 0.38 : 0.15)}`,
                        pointerEvents: 'none',
                        opacity: 0.5
                      }
                    }}
                  >
                    <Radio
                      disableRipple
                      checked={isSelected}
                      value={option.id}
                      sx={{
                        mr: 1.5,
                        color: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.dark, 0.65),
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 26,
                          filter: isSelected ? 'drop-shadow(0px 8px 18px rgba(15,23,42,0.28))' : 'none'
                        }
                      }}
                    />

                      <Stack
                        direction='row'
                        spacing={{ xs: 1.4, md: 2 }}
                        alignItems='center'
                        justifyContent='space-between'
                        sx={{ flexGrow: 1, position: 'relative', zIndex: 1, flexWrap: 'wrap', minWidth: 0 }}
                      >
                        <Stack direction='row' spacing={1.2} alignItems='center' sx={{ minWidth: 0 }}>
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
                                ? alpha(theme.palette.common.white, 0.34)
                                : alpha(theme.palette.primary.main, 0.18),
                              color: isSelected ? theme.palette.primary.dark : theme.palette.primary.main,
                              boxShadow: isSelected ? '0 16px 36px rgba(15, 23, 42, 0.2)' : 'none'
                            }}
                          >
                            {optionLabel}
                          </Box>

                          <Stack spacing={0.35} sx={{ minWidth: 0, flex: 1 }}>
                            {option.mediaType === 'text' && option.text && (
                              <Typography
                                variant='body1'
                                sx={{
                                  fontWeight: 700,
                                  color: isSelected
                                    ? alpha(theme.palette.common.white, 0.95)
                                    : theme.palette.text.primary,
                                  fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.1rem' },
                                  lineHeight: 1.5,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal'
                                }}
                              >
                                {option.text}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>

                        {option.mediaType === 'image' && option.image && (
                          <Box
                            component='img'
                            src={option.image}
                            alt={option.text}
                            sx={{
                              width: { xs: 54, md: 68 },
                              height: { xs: 54, md: 68 },
                              objectFit: 'cover',
                              borderRadius: 2.5,
                              border: `1px solid ${alpha(theme.palette.common.white, isSelected ? 0.3 : 0.12)}`,
                              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)'
                            }}
                          />
                        )}
                      </Stack>

                  </Box>
                </Grid>
              )})}
          </Grid>
        </RadioGroup>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TrueFalseTemplate
