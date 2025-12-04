import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Box,
  Stack,
  Chip,
  alpha,
  useTheme
} from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const SingleChoiceTemplate = ({ question, selectedAnswer, onAnswerSelect, readOnly = false }) => {
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
        borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.92),
        boxShadow: isDarkMode ? '0 20px 44px rgba(0,0,0,0.3)' : '0 20px 44px rgba(15, 23, 42, 0.14)'
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
                  color: alpha(theme.palette.text.primary, 0.75),
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
                maxHeight: { xs: 200, sm: 240, md: 280, lg: 320 },
                objectFit: 'cover',
                borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
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

          <RadioGroup
            value={selectedAnswer || ''}
            onChange={e => handleOptionSelect(question._id, e.target.value)}
            sx={{ width: '100%' }}
          >
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%' }}>
              {question.data.options.map((option, index) => {
                const isSelected = selectedAnswer === option.id
                const optionLabel = String.fromCharCode(65 + index)

                return (
                  <Box
                    key={option.id}
                    onClick={() => handleOptionSelect(question?._id, option.id)}
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
                        ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.32)}, ${alpha(
                            theme.palette.secondary.main,
                            isDarkMode ? 0.3 : 0.25
                          )})`
                        : isDarkMode
                          ? `linear-gradient(150deg, ${alpha(theme.palette.primary.dark, 0.15)}, ${alpha(
                              theme.palette.background.paper,
                              0.9
                            )})`
                          : `linear-gradient(150deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(
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
                      {/* Radio Button */}
                      <Radio
                        checked={isSelected}
                        value={option.id}
                        disableRipple
                        sx={{
                          mt: -0.5,
                          p: 0.5,
                          color: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.dark, 0.65),
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
                              width: { xs: 36, sm: 40, md: 44 },
                              height: { xs: 36, sm: 40, md: 44 },
                              borderRadius: { xs: 2, md: 2.5 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                              flexShrink: 0,
                              background: isSelected
                                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(
                                    theme.palette.secondary.main,
                                    0.8
                                  )})`
                                : isDarkMode
                                  ? alpha(theme.palette.primary.main, 0.25)
                                  : alpha(theme.palette.primary.main, 0.15),
                              color: isSelected
                                ? theme.palette.primary.contrastText
                                : isDarkMode
                                  ? theme.palette.primary.light
                                  : theme.palette.primary.main,
                              boxShadow: isSelected
                                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                : 'none'
                            }}
                          >
                            {optionLabel}
                          </Box>

                          {/* Option Text */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {option.mediaType === 'text' && option.text && (
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
                        {option.mediaType === 'image' && option.image && (
                          <Box
                            component='img'
                            src={option.image}
                            alt={option.text}
                            sx={{
                              width: '100%',
                              maxHeight: { xs: 160, sm: 180, md: 200 },
                              objectFit: 'cover',
                              borderRadius: { xs: 1.5, md: 2 },
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          </RadioGroup>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SingleChoiceTemplate
