import React from 'react'
import { Card, CardContent, Checkbox, Typography, Box, Grid, Stack, Chip, alpha, useTheme } from '@mui/material'
import ReactPlayer from 'react-player'

const MultipleChoiceTemplate = ({ question, selectedAnswers, onAnswerSelect, readOnly = false }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

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

  // Check if all options are images
  const allOptionsAreImages = question?.data?.options?.every(opt => opt.mediaType === 'image' && opt.image) || false

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
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
              sx={{
                width: '100%',
                position: 'relative',
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                overflow: 'hidden',
                border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 20px 48px rgba(0, 0, 0, 0.5)'
                    : '0 20px 48px rgba(15, 23, 42, 0.2)',
                bgcolor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.black, 0.3)
                  : alpha(theme.palette.common.white, 0.8),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 1.5, sm: 2, md: 2.5 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 24px 56px rgba(0, 0, 0, 0.6)'
                      : '0 24px 56px rgba(15, 23, 42, 0.25)',
                  borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.25)
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
                  maxHeight: { xs: 220, sm: 280, md: 350, lg: 420 },
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: { xs: 1, sm: 1.5, md: 2 }
                }}
              />
            </Box>
          )}

          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <Box
              sx={{
                width: '100%',
                position: 'relative',
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                overflow: 'hidden',
                border: `2px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15)}`,
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 20px 48px rgba(0, 0, 0, 0.5)'
                    : '0 20px 48px rgba(15, 23, 42, 0.2)',
                bgcolor: theme.palette.mode === 'dark' ? '#000' : '#000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 24px 56px rgba(0, 0, 0, 0.6)'
                      : '0 24px 56px rgba(15, 23, 42, 0.25)',
                  borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.35 : 0.25)
                }
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  bgcolor: '#000'
                }}
              >
                <ReactPlayer
                  url={questionObj.video || ''}
                  playing={true}
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
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0
                      }
                    }
                  }}
                  onError={e => console.error('Video error occurred:', e)}
                />
              </Box>
            </Box>
          )}

          {allOptionsAreImages ? (
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{ width: '100%', alignItems: 'stretch' }}
            >
              {question.data.options.map((option, index) => {
                const isSelected = selectedAnswers?.includes(option.id)
                const optionLabel = String.fromCharCode(65 + index)
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={option.id}
                    sx={{ display: 'flex', height: '100%' }}
                  >
                    <Box
                      onClick={() => !readOnly && handleCheckboxChange(option.id)}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        borderRadius: { xs: 2.5, md: 3 },
                        p: { xs: 2, sm: 2.5, md: 3 },
                        border: `2px solid ${alpha(
                          theme.palette.primary.main,
                          isSelected ? (isDarkMode ? 0.5 : 0.4) : isDarkMode ? 0.25 : 0.15
                        )}`,
                        background: isSelected
                          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.32)}, ${alpha(
                              theme.palette.secondary.main,
                              isDarkMode ? 0.3 : 0.26
                            )})`
                          : isDarkMode
                            ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(
                                theme.palette.background.paper,
                                0.9
                              )})`
                            : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                                theme.palette.common.white,
                                0.95
                              )})`,
                        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                        cursor: readOnly ? 'default' : 'pointer',
                        pointerEvents: readOnly ? 'none' : 'auto',
                        boxShadow: isSelected
                          ? isDarkMode
                            ? `0 8px 24px ${alpha(theme.palette.common.black, 0.4)}`
                            : `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                          : isDarkMode
                            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                            : `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                        '&:hover': readOnly
                          ? {}
                          : {
                              transform: 'translateY(-4px)',
                              boxShadow: isDarkMode
                                ? `0 12px 32px ${alpha(theme.palette.common.black, 0.5)}`
                                : `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                              borderColor: alpha(theme.palette.primary.main, 0.5)
                            },
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Stack spacing={2} sx={{ width: '100%', position: 'relative', zIndex: 1, flex: 1, minHeight: 0 }}>
                        <Stack
                          direction='row'
                          spacing={1.5}
                          alignItems='center'
                          justifyContent='space-between'
                          sx={{ width: '100%', px: 0.5, minHeight: { xs: 48, sm: 52, md: 56 } }}
                        >
                          <Box
                            sx={{
                              width: { xs: 40, sm: 44, md: 48 },
                              height: { xs: 40, sm: 44, md: 48 },
                              borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                              flexShrink: 0,
                              background: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.primary.main, 0.5)
                                  : alpha(theme.palette.common.white, 0.4)
                                : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.18),
                              color: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? theme.palette.primary.contrastText
                                  : theme.palette.primary.dark
                                : theme.palette.mode === 'dark'
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.main,
                              boxShadow: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? '0 8px 16px rgba(0, 0, 0, 0.4)'
                                  : '0 8px 16px rgba(15, 23, 42, 0.15)'
                                : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {optionLabel}
                          </Box>
                          <Checkbox
                            checked={isSelected}
                            sx={{
                              color: isSelected
                                ? theme.palette.primary.main
                                : theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.primary.light, 0.7)
                                  : alpha(theme.palette.primary.dark, 0.65),
                              '&.Mui-checked': {
                                color: theme.palette.primary.main
                              },
                              '& .MuiSvgIcon-root': {
                                fontSize: { xs: 26, sm: 28, md: 30 },
                                filter: isSelected
                                  ? `drop-shadow(0px 4px 10px ${alpha(theme.palette.primary.main, 0.3)})`
                                  : 'none'
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
                        </Stack>
                        {option.mediaType === 'image' && option.image && (
                          <Box
                            sx={{
                              width: '100%',
                              position: 'relative',
                              borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
                              overflow: 'hidden',
                              border: `2px solid ${alpha(
                                theme.palette.primary.main,
                                isSelected
                                  ? theme.palette.mode === 'dark'
                                    ? 0.5
                                    : 0.4
                                  : theme.palette.mode === 'dark'
                                    ? 0.15
                                    : 0.12
                              )}`,
                              boxShadow: isSelected
                                ? theme.palette.mode === 'dark'
                                  ? '0 16px 32px rgba(0, 0, 0, 0.5)'
                                  : '0 16px 32px rgba(15, 23, 42, 0.25)'
                                : theme.palette.mode === 'dark'
                                  ? '0 8px 20px rgba(0, 0, 0, 0.3)'
                                  : '0 8px 20px rgba(15, 23, 42, 0.12)',
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? alpha(theme.palette.common.black, 0.3)
                                : alpha(theme.palette.common.white, 0.6),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: { xs: 200, sm: 240, md: 280 },
                              p: { xs: 1.5, sm: 2, md: 2.5 },
                              transition: 'all 0.3s ease',
                              flexShrink: 0
                            }}
                          >
                            <Box
                              component='img'
                              src={option.image}
                              alt={option.text || `Option ${optionLabel}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: readOnly ? 'none' : 'scale(1.02)'
                                }
                              }}
                            />
                          </Box>
                        )}
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            color: isSelected
                              ? alpha(theme.palette.common.white, 0.95)
                              : theme.palette.text.primary,
                            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                            textAlign: 'center',
                            px: 1,
                            minHeight: { xs: 24, sm: 26, md: 28 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {option.text || `option-${index + 1}`}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          ) : (
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%' }}>
              {question.data.options.map((option, index) => {
                const isSelected = selectedAnswers?.includes(option.id)
                const optionLabel = String.fromCharCode(65 + index)
                return (
                  <Box
                    key={option.id}
                    onClick={() => !readOnly && handleCheckboxChange(option.id)}
                    sx={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: { xs: 2.5, md: 3 },
                      p: { xs: 2, sm: 2.5, md: 3 },
                      border: `2px solid ${alpha(
                        theme.palette.primary.main,
                        isSelected ? (isDarkMode ? 0.5 : 0.4) : isDarkMode ? 0.25 : 0.15
                      )}`,
                      background: isSelected
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.32)}, ${alpha(
                            theme.palette.secondary.main,
                            isDarkMode ? 0.3 : 0.26
                          )})`
                        : isDarkMode
                          ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(
                              theme.palette.background.paper,
                              0.9
                            )})`
                          : `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                              theme.palette.common.white,
                              0.95
                            )})`,
                      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                      cursor: readOnly ? 'default' : 'pointer',
                      pointerEvents: readOnly ? 'none' : 'auto',
                      boxShadow: isSelected
                        ? isDarkMode
                          ? `0 8px 24px ${alpha(theme.palette.common.black, 0.4)}`
                          : `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                        : isDarkMode
                          ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
                          : `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                      '&:hover': readOnly
                        ? {}
                        : {
                            transform: 'translateY(-4px)',
                            boxShadow: isDarkMode
                              ? `0 12px 32px ${alpha(theme.palette.common.black, 0.5)}`
                              : `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                            borderColor: alpha(theme.palette.primary.main, 0.5)
                          }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, width: '100%' }}>
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        sx={{
                          mt: -0.5,
                          p: 0.5,
                          color: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.dark, 0.7),
                          '&.Mui-checked': {
                            color: theme.palette.primary.main
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: { xs: 24, sm: 26 },
                            filter: isSelected
                              ? `drop-shadow(0px 4px 10px ${alpha(theme.palette.primary.main, 0.3)})`
                              : 'none'
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

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {/* Option Label and Text */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: { xs: 1, sm: 1.5 },
                            width: '100%',
                            flexWrap: 'wrap'
                          }}
                        >
                          {/* Label Badge */}
                          <Box
                            sx={{
                              width: { xs: 36, sm: 40, md: 46 },
                              height: { xs: 36, sm: 40, md: 46 },
                              borderRadius: { xs: 2, md: 2.5 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                              flexShrink: 0,
                              background: isSelected
                                ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.9)}, ${alpha(
                                    theme.palette.secondary.dark,
                                    0.7
                                  )})`
                                : isDarkMode
                                  ? alpha(theme.palette.primary.main, 0.25)
                                  : alpha(theme.palette.primary.main, 0.15),
                              color: isSelected
                                ? theme.palette.secondary.contrastText
                                : isDarkMode
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.main,
                              boxShadow: isSelected ? `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}` : 'none'
                            }}
                          >
                            {optionLabel}
                          </Box>

                          {/* Option Text */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {(option.mediaType === 'text' || option.mediaType === 'text-image') && option.text && (
                              <Typography
                                variant='body1'
                                sx={{
                                  fontWeight: 600,
                                  color: isSelected
                                    ? isDarkMode
                                      ? theme.palette.common.white
                                      : alpha(theme.palette.common.white, 0.98)
                                    : theme.palette.text.primary,
                                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                                  lineHeight: 1.6,
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  width: '100%'
                                }}
                              >
                                {option.text}
                              </Typography>
                            )}
                          </Box>

                          {/* Selected Chip */}
                          {isSelected && (
                            <Chip
                              size='small'
                              label='Selected'
                              sx={{
                                borderRadius: 999,
                                fontWeight: 600,
                                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 },
                                bgcolor: theme.palette.success.main,
                                color: 'white',
                                boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`
                              }}
                            />
                          )}
                        </Box>

                        {/* Image if present */}
                        {(option.mediaType === 'image' || option.mediaType === 'text-image') && option.image && (
                          <Box
                            sx={{
                              width: '100%',
                              borderRadius: { xs: 1.5, md: 2 },
                              overflow: 'hidden',
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
                              bgcolor: theme.palette.mode === 'dark' 
                                ? alpha(theme.palette.common.black, 0.2)
                                : alpha(theme.palette.common.white, 0.5),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 1
                            }}
                          >
                            <Box
                              component='img'
                              src={option.image}
                              alt={option.text}
                              sx={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: { xs: 160, sm: 180, md: 200 },
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MultipleChoiceTemplate
