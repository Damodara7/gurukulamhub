import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  useTheme,
  Alert,
  Stack,
  alpha,
  Tooltip,
  IconButton,
  Divider,
  Avatar
} from '@mui/material'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'
import Link from 'next/link'
import ChevronToggleComponent from '@/components/media-viewer/ChevronToggleComponent'

const HeroStat = ({ icon, label, value, tone }) => (
  <Stack
    direction='row'
    spacing={1.6}
    alignItems='center'
    sx={{
      borderRadius: 2,
      px: 2.2,
      py: 1.6,
      border: `1px solid ${alpha(tone.main, 0.18)}`,
      bgcolor: alpha(tone.main, 0.08),
      minWidth: 0
    }}
  >
    <Avatar
      variant='rounded'
      sx={{
        width: 44,
        height: 44,
        borderRadius: 14,
        bgcolor: alpha(tone.main, 0.18),
        color: tone.main
      }}
    >
      {icon}
    </Avatar>
    <Stack spacing={0.2} minWidth={0}>
      <Typography variant='caption' sx={{ letterSpacing: '0.08em', color: alpha(tone.main, 0.9), fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant='subtitle1' fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Typography>
    </Stack>
  </Stack>
)

function QuizPosterScreen({
  quizData,
  onClickStart,
  language = null,
  quizLanguages = [],
  resolvedQuestionCount = 0,
  possibleQuizPoints = 0
}) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const {
    thumbnail,
    title,
    details,
    owner,
    syllabus,
    contextIds,
    courseLinks,
    documents,
    duration,
    difficulty,
    questionCount
  } = quizData
  const effectiveQuestionCount = resolvedQuestionCount || questionCount || 0
  const totalQuizPoints = possibleQuizPoints || effectiveQuestionCount

  const sectionShell = (children, key, sx = {}) => (
    <Box
      key={key}
      sx={{
        width: '100%',
        borderRadius: { xs: 2.5, md: 3 },
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.2 : 0.16)}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: isDarkMode
          ? '0 18px 38px rgba(0,0,0,0.3)'
          : '0 18px 38px rgba(15, 23, 42, 0.08)',
        overflow: 'hidden',
        ...sx
      }}
    >
      {children}
    </Box>
  )

  const renderLanguageFallback = () => (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 980, mx: 'auto', px: { xs: 2, md: 0 } }}>
      <Alert
        icon={false}
        severity='error'
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          bgcolor: alpha(theme.palette.error.main, 0.06),
          fontWeight: 600
        }}
      >
        Quiz does not exist in this language. Please check the available languages below.
      </Alert>

      {sectionShell(
        <Box sx={{ p: { xs: 2.6, md: 3.2 } }}>
          <ChevronToggleComponent heading='Available Languages' minimizedSubHeading='Choose another language to continue'>
            <Stack spacing={1.6}>
              {quizLanguages.map(lang => (
                <Link
                  key={lang.code}
                  href={`/publicquiz/play/${quizData?._id}?languageCode=${lang.code}`}
                  replace
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 22px rgba(15,23,42,0.12)'
                      }
                    }}
                  >
                    <Typography fontWeight={600}>{lang.name}</Typography>
                    <Chip
                      label={lang.isPrimaryLanguage ? 'Primary' : 'Alternate'}
                      size='small'
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.12),
                        color: theme.palette.secondary.main,
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Link>
              ))}
            </Stack>
          </ChevronToggleComponent>
        </Box>,
        'languages'
      )}
    </Stack>
  )

  if (!language) {
    return renderLanguageFallback()
  }

  const highlightStats = [
    {
      icon: <AccessTimeRoundedIcon fontSize='small' />,
      label: 'Duration',
      value: duration ? `${duration} mins` : 'Flexible',
      tone: theme.palette.info
    },
    {
      icon: <QuizOutlinedIcon fontSize='small' />,
      label: 'Questions',
      value: effectiveQuestionCount ? `${effectiveQuestionCount} questions` : 'Curated set',
      tone: theme.palette.primary
    },
    {
      icon: <WorkspacePremiumOutlinedIcon fontSize='small' />,
      label: 'Difficulty',
      value: difficulty || 'Adaptive',
      tone: theme.palette.warning
    }
  ]

  const metadata = [
    {
      label: 'Owner',
      value: owner || 'Not specified',
      tone: theme.palette.primary,
      icon: <PersonOutlineRoundedIcon fontSize='small' />
    },
    {
      label: 'Syllabus',
      value: syllabus || 'Not specified',
      tone: theme.palette.secondary,
      icon: <MenuBookRoundedIcon fontSize='small' />
    },
    {
      label: 'Context IDs',
      value: contextIds || 'Not specified',
      tone: theme.palette.warning,
      icon: <FingerprintRoundedIcon fontSize='small' />
    },
    {
      label: 'Quiz Points',
      value: `${totalQuizPoints}`,
      tone: theme.palette.success,
      icon: <WorkspacePremiumOutlinedIcon fontSize='small' />
    }
  ]

  return (
    <Stack spacing={3.6} sx={{ width: '100%', maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 0 }, pb: 8 }}>
      {sectionShell(
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2.6, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: { xs: 240, sm: 320, md: 340 },
                  boxShadow: '0 24px 44px rgba(15, 23, 42, 0.22)'
                }}
              >
                <Box
                  component='img'
                  src={thumbnail || `https://fakeimg.pl/1200x520/?text=${encodeURIComponent(title || 'Quiz')}`}
                  alt={title}
                  onError={e => {
                    e.currentTarget.src = 'https://fakeimg.pl/1200x520/?text=Quiz'
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.75) 100%)`
                  }}
                />
                <Stack
                  spacing={1}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: theme.palette.common.white,
                    p: { xs: 2, md: 3 }
                  }}
                >
                  <Stack spacing={1} alignSelf='flex-start'>
                    <Chip
                      icon={<TranslateOutlinedIcon fontSize='small' />}
                      label={language?.name || 'Selected language'}
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.92),
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        alignSelf: 'flex-start'
                      }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant='h4' fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                      {title}
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.85, maxWidth: 420 }}>
                      {details || 'Get ready to tackle engaging questions and boost your knowledge.'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2.4} sx={{ height: '100%', justifyContent: 'space-between' }}>
                <Stack spacing={1.4}>
                  <Typography variant='overline' sx={{ letterSpacing: '0.12em', color: alpha(theme.palette.text.primary, 0.6) }}>
                    Quiz Overview
                  </Typography>
                  <Grid container spacing={{ xs: 1.6, md: 2 }}>
                    {highlightStats.map(stat => (
                      <Grid item xs={12} sm={6} key={stat.label}>
                        <HeroStat {...stat} />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>

                <Divider />

                <Grid container spacing={{ xs: 1.6, md: 2 }}>
                  {metadata.map(meta => (
                    <Grid item xs={12} sm={6} md={4} key={meta.label}>
                      <Box
                        sx={{
                          borderRadius: 2,
                          border: `1px solid ${alpha(meta.tone.main, 0.18)}`,
                          bgcolor: alpha(meta.tone.main, 0.08),
                          px: 2.2,
                          py: 1.8,
                          minHeight: 96,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Stack direction='row' spacing={1.2} alignItems='center'>
                          <Avatar
                            variant='rounded'
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              bgcolor: alpha(meta.tone.main, 0.2),
                              color: meta.tone.main
                            }}
                          >
                            {meta.icon}
                          </Avatar>
                          <Typography variant='caption' sx={{ letterSpacing: '0.08em', fontWeight: 600, color: alpha(meta.tone.main, 0.88) }}>
                            {meta.label.toUpperCase()}
                          </Typography>
                        </Stack>
                        <Tooltip title={meta.value} placement='top' enterDelay={400}>
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              wordBreak: 'break-word',
                              lineHeight: 1.55,
                              color: theme.palette.text.primary
                            }}
                          >
                            {meta.value}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4}>
                  <Button
                    variant='contained'
                    color='primary'
                    component='label'
                    size='large'
                    onClick={onClickStart}
                    sx={{
                      flexBasis: { sm: '60%' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      color: 'white'
                    }}
                  >
                    Start Quiz
                  </Button>
                  <Button
                    variant='outlined'
                    size='large'
                    sx={{
                      flexBasis: { sm: '40%' },
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                    component={Link}
                    href='#documents'
                  >
                    View Resources
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>,
        'hero'
      )}

      {quizLanguages.length > 0 &&
        sectionShell(
          <Box sx={{ p: { xs: 2.6, md: 3 } }}>
            <Stack spacing={1.4}>
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='h6' fontWeight={700}>
                  Languages
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Tap to switch to localized content
                </Typography>
              </Stack>
              <Stack direction='row' spacing={1} flexWrap='wrap'>
                {quizLanguages.map(lang => {
                  const isActive = lang.code === language?.code
                  return (
                    <Chip
                      key={lang.code}
                      clickable
                      component={Link}
                      href={`/publicquiz/play/${quizData?._id}?languageCode=${lang.code}`}
                      label={lang.name}
                      sx={{
                        mr: 1,
                        mb: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.04),
                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                        border: `1px solid ${alpha(theme.palette.primary.main, isActive ? 0.4 : 0.16)}`
                      }}
                    />
                  )
                })}
              </Stack>
            </Stack>
          </Box>,
          'language-switch'
        )}

      {sectionShell(
        <Box sx={{ p: { xs: 2.8, md: 3.4 } }}>
          <ChevronToggleComponent heading='Course Links' minimizedSubHeading='Preview supporting course material'>
            {courseLinks?.length > 0 ? (
              <Grid container spacing={{ xs: 1.6, md: 2 }}>
                {courseLinks.map((link, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Stack
                      spacing={1.2}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
                        p: 2.1,
                        bgcolor: alpha(theme.palette.background.default, 0.6),
                        transition: 'transform 0.25s ease',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 16px 28px rgba(15,23,42,0.12)' }
                      }}
                    >
                      <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Stack spacing={0.3}>
                          <Typography variant='subtitle2' fontWeight={700}>
                            {link?.title || `Course ${index + 1}`}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {link.mediaType?.toUpperCase() || 'Video'}
                          </Typography>
                        </Stack>
                        <Tooltip title='Open in new tab'>
                          <IconButton
                            component={Link}
                            href={link?.link || '#'}
                            target='_blank'
                            rel='noopener noreferrer'
                            size='small'
                          >
                            <LaunchRoundedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Divider />
                      <VideoAd url={link?.link || ''} showPause autoPlay={false} height='140px' />
                      <ImagePopup imageUrl={link?.link || ''} mediaType={link.mediaType} />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Stack spacing={1} alignItems='center' py={4}>
                <ArticleOutlinedIcon color='disabled' fontSize='large' />
                <Typography variant='body2' color='text.secondary'>
                  No course links available.
                </Typography>
              </Stack>
            )}
          </ChevronToggleComponent>
        </Box>,
        'course'
      )}

      {sectionShell(
        <Box id='documents' sx={{ p: { xs: 2.8, md: 3.4 } }}>
          <ChevronToggleComponent heading='Documents' minimizedSubHeading='View reference documents'>
            {documents?.length > 0 ? (
              <Stack spacing={1.6}>
                {documents.map((document, index) => {
                  const docUrl = document?.url || document?.document || ''
                  const isValidUrl = typeof docUrl === 'string' && docUrl.trim().length > 0
                  const docTitle = document?.description || document?.fileName || `Document ${index + 1}`
                  const docTypeLabel = (document?.mediaType || document?.mimeType || '')
                    .toString()
                    .split('/')
                    .pop()
                    ?.toUpperCase()
                  return (
                    <Stack
                      key={document?.id || index}
                      direction='row'
                      spacing={1.6}
                      alignItems='center'
                      justifyContent='space-between'
                      sx={{
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.28)}`,
                        px: 2,
                        py: 1.4,
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }}
                    >
                      <Stack spacing={0.4} sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant='subtitle2' fontWeight={600} noWrap>
                          {docTitle}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' noWrap>
                          {docTypeLabel || 'Resource'}
                          {document?.fileName && document?.description ? ` • ${document.fileName}` : ''}
                        </Typography>
                      </Stack>
                      <Tooltip
                        title={isValidUrl ? 'Open in new tab' : 'This document is unavailable'}
                        placement='top'
                      >
                        <span>
                          <Button
                            component={isValidUrl ? Link : 'button'}
                            href={isValidUrl ? docUrl : undefined}
                            target={isValidUrl ? '_blank' : undefined}
                            rel={isValidUrl ? 'noopener noreferrer' : undefined}
                            variant='outlined'
                            size='small'
                            disabled={!isValidUrl}
                            startIcon={<LaunchRoundedIcon fontSize='small' />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            Open
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  )
                })}
              </Stack>
            ) : (
              <Stack spacing={1} alignItems='center' py={4}>
                <DescriptionOutlinedIcon color='disabled' fontSize='large' />
                <Typography variant='body2' color='text.secondary'>
                  No documents uploaded.
                </Typography>
              </Stack>
            )}
          </ChevronToggleComponent>
        </Box>,
        'documents'
      )}
    </Stack>
  )
}

export default QuizPosterScreen
