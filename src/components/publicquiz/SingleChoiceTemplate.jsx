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
        borderRadius: { xs: 3, md: 3.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.92),
        boxShadow: isDarkMode ? '0 20px 44px rgba(0,0,0,0.3)' : '0 20px 44px rgba(15, 23, 42, 0.14)'
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
              {question.data.options.map((option, index) => {
                const isSelected = selectedAnswer === option.id
                const optionLabel = String.fromCharCode(65 + index)
                const indicatorStyles = {
                  mx: 1.5,
                  mt: 0.5,
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  color: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.dark, 0.65),
                  '&.Mui-checked': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: 26,
                    filter: isSelected ? 'drop-shadow(0px 6px 14px rgba(15,23,42,0.25))' : 'none'
                  }
                }

                return (
                  <Grid item xs={12} md={6} key={option.id} sx={{ display: 'flex' }}>
                    <Box
                      onClick={() => handleOptionSelect(question?._id, option.id)}
                      sx={{
                        position: 'relative',
                        flexGrow: 1,
                        borderRadius: { xs: 3, md: 3.8 },
                        p: { xs: 2, sm: 2.4, md: 3 },
                        border: `1px solid ${alpha(theme.palette.primary.main, isSelected ? (isDarkMode ? 0.45 : 0.3) : isDarkMode ? 0.25 : 0.14)}`,
                        background: isSelected
                          ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, isDarkMode ? 0.4 : 0.32)}, ${alpha(
                              theme.palette.secondary.main,
                              isDarkMode ? 0.3 : 0.25
                            )})`
                          : isDarkMode
                            ? `linear-gradient(150deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(
                                theme.palette.background.paper,
                                0.95
                              )})`
                            : `linear-gradient(150deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                                theme.palette.common.white,
                                0.95
                              )})`,
                        transition:
                          'transform 0.3s ease, border-color 0.24s ease, box-shadow 0.3s ease, background 0.3s ease',
                        cursor: readOnly ? 'default' : 'pointer',
                        pointerEvents: readOnly ? 'none' : 'auto',
                        minHeight: { xs: 92, sm: 108, md: 122 },
                        display: 'flex',
                        alignItems: 'stretch',
                        boxShadow: isSelected
                          ? isDarkMode
                            ? '0 32px 74px rgba(0,0,0,0.4)'
                            : '0 32px 74px rgba(15, 23, 42, 0.28)'
                          : isDarkMode
                            ? '0 22px 48px rgba(0,0,0,0.2)'
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
                                0.2
                              )})`
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 'inherit',
                          background: isSelected
                            ? `linear-gradient(160deg, ${alpha(theme.palette.common.white, 0.22)}, transparent 60%)`
                            : `radial-gradient(circle at top left, ${alpha(
                                theme.palette.primary.light,
                                0.24
                              )}, transparent 55%)`,
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
                      <FormControlLabel
                        value={option.id}
                        control={<Radio disableRipple sx={indicatorStyles} />}
                        label={
                          <Stack spacing={1.2} sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
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
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Box
                                  sx={{
                                    width: { xs: 38, md: 44 },
                                    height: { xs: 38, md: 44 },
                                    borderRadius: { xs: 3.2, md: 3.8 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                                    background: isSelected
                                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.4)}, ${alpha(
                                          theme.palette.secondary.main,
                                          0.3
                                        )})`
                                      : alpha(theme.palette.primary.main, 0.14),
                                    color: isSelected ? theme.palette.primary.contrastText : theme.palette.primary.main,
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
                                    fontSize: { xs: '0.96rem', md: '1.08rem' },
                                        lineHeight: 1.32
                                      }}
                                    >
                                      {option.text}
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>

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
                                  borderRadius: 2.5,
                                  border: `1px solid ${alpha(theme.palette.common.white, isSelected ? 0.32 : 0.14)}`,
                                  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.2)'
                                }}
                              />
                            )}
                          </Stack>
                        }
                        sx={{
                          alignItems: 'flex-start',
                          width: '100%',
                          m: 0,
                          py: 0,
                          pr: { xs: 1, md: 1.5 },
                          gap: 2
                        }}
                      />
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </RadioGroup>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SingleChoiceTemplate
