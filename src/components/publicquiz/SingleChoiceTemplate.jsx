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
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              justifyContent='center'
              sx={{ mx: 'auto', width: '100%', overflow: 'hidden' }}
            >
              {question.data.options.map((option, index) => {
                const isSelected = selectedAnswer === option.id
                const optionLabel = String.fromCharCode(65 + index)
                const indicatorStyles = {
                  mx: { xs: 1, sm: 1.25, md: 1.5 },
                  mt: { xs: 0.25, sm: 0.5 },
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.light, 0.7)
                      : alpha(theme.palette.primary.dark, 0.65),
                  '&.Mui-checked': {
                    color: theme.palette.primary.main
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: 22, sm: 24, md: 26 },
                    filter: isSelected ? 'drop-shadow(0px 6px 14px rgba(15,23,42,0.25))' : 'none'
                  }
                }

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
                      onClick={() => handleOptionSelect(question?._id, option.id)}
                      sx={{
                        position: 'relative',
                        flexGrow: 1,
                        borderRadius: { xs: 2.5, sm: 3, md: 3.5, lg: 3.8 },
                        p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          isSelected
                            ? theme.palette.mode === 'dark'
                              ? 0.4
                              : 0.3
                            : theme.palette.mode === 'dark'
                              ? 0.2
                              : 0.14
                        )}`,
                        background: isSelected
                          ? `linear-gradient(140deg, ${alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.4 : 0.32
                            )}, ${alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.25)})`
                          : theme.palette.mode === 'dark'
                            ? `linear-gradient(150deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                                theme.palette.background.default,
                                0.8
                              )})`
                            : `linear-gradient(150deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                                theme.palette.common.white,
                                0.95
                              )})`,
                        transition:
                          'transform 0.2s ease, border-color 0.24s ease, box-shadow 0.2s ease, background 0.3s ease, scale 0.2s ease',
                        cursor: readOnly ? 'default' : 'pointer',
                        pointerEvents: readOnly ? 'none' : 'auto',
                        minHeight: { xs: 'auto', sm: 100, md: 110, lg: 122 },
                        maxHeight: 'none',
                        display: 'flex',
                        alignItems: 'stretch',
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
                          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.32),
                          background: readOnly
                            ? undefined
                            : theme.palette.mode === 'dark'
                              ? `linear-gradient(140deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(
                                  theme.palette.secondary.main,
                                  0.25
                                )})`
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
                          border: `1px solid ${alpha(
                            theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.white,
                            isSelected
                              ? theme.palette.mode === 'dark'
                                ? 0.2
                                : 0.38
                              : theme.palette.mode === 'dark'
                                ? 0.08
                                : 0.15
                          )}`,
                          pointerEvents: 'none',
                          opacity: 0.5
                        }
                      }}
                    >
                      <FormControlLabel
                        value={option.id}
                        control={<Radio disableRipple sx={indicatorStyles} />}
                        label={
                          <Stack
                            spacing={{ xs: 1, sm: 1.2 }}
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
                                spacing={{ xs: 0.75, sm: 1 }}
                                alignItems='center'
                                sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
                              >
                                <Box
                                  sx={{
                                    width: { xs: 32, sm: 36, md: 40, lg: 44 },
                                    height: { xs: 32, sm: 36, md: 40, lg: 44 },
                                    borderRadius: { xs: 2.5, sm: 3, md: 3.5, lg: 3.8 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 400,
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem', lg: '1.05rem' },
                                    flexShrink: 0,
                                    background: isSelected
                                      ? `linear-gradient(135deg, ${alpha(
                                          theme.palette.primary.main,
                                          theme.palette.mode === 'dark' ? 0.5 : 0.4
                                        )}, ${alpha(
                                          theme.palette.secondary.main,
                                          theme.palette.mode === 'dark' ? 0.4 : 0.3
                                        )})`
                                      : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.14),
                                    color: isSelected
                                      ? theme.palette.primary.contrastText
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
                                        fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem', lg: '1.08rem' },
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
                                  borderRadius: { xs: 2, sm: 2.25, md: 2.5 },
                                  border: `1px solid ${alpha(
                                    theme.palette.mode === 'dark'
                                      ? theme.palette.common.white
                                      : theme.palette.common.white,
                                    isSelected
                                      ? theme.palette.mode === 'dark'
                                        ? 0.15
                                        : 0.32
                                      : theme.palette.mode === 'dark'
                                        ? 0.08
                                        : 0.14
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
                        }
                        sx={{
                          alignItems: 'flex-start',
                          width: '100%',
                          m: 0,
                          py: 0,
                          pr: { xs: 0.75, sm: 1, md: 1.25, lg: 1.5 },
                          gap: { xs: 1.5, sm: 2 },
                          flex: 1
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
