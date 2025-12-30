'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { Box, Card, CardContent, Container, Stack, useTheme, alpha, Paper } from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Api utils
import * as clientApi from '@/app/api/client/client.api'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

// next-share imports
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon
} from 'next-share'
import { useParams } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import SendIcon from '@mui/icons-material/Send'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'

// Vars
const options = [
  {
    icon: <SendIcon sx={{ fontSize: 32 }} />,
    title: 'Send Invitation',
    subtitle: 'Share your unique referral link with friends',
    color: 'primary'
  },
  {
    icon: <GroupAddIcon sx={{ fontSize: 32 }} />,
    title: 'Registration',
    subtitle: 'They sign up and join the platform',
    color: 'secondary'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 32 }} />,
    title: 'Learn & Win',
    subtitle: 'Both of you earn rewards and learn together',
    color: 'success'
  }
]

const ReferAndEarn = () => {
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const theme = useTheme()
  const [toEmail, setToEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [referralToken, setReferralToken] = useState(session?.user?.referralToken || '')

  const fromEmail = session?.user?.email

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isEmailValid = validateEmail(toEmail)

  function handleEmailChange(e) {
    if (e.target.value === fromEmail) {
      toast.error(`Email cannot be the same as your's.`)
      e.target.value = ''
    }
    setToEmail(e.target.value)
  }

  const handleSendReferral = async () => {
    setLoading(true)
    try {
      // const response = await clientApi.sendReferralLink(fromEmail, toEmail) // Replace with dynamic user name
      const response = await RestApi.post(`${API_URLS.v0.REFER_EARN}`, { fromEmail, toEmail })
      if ((response.status = 'success')) {
        toast.success('Referral link sent successfully!')
        setToEmail('')
      }
    } catch (error) {
      toast.error('Failed to send referral link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function getUserData() {
    try {
      // const response = await clientApi.getUserByEmail(fromEmail) // Replace with dynamic user name
      const response = await RestApi.get(`${API_URLS.v0.USER}/${fromEmail}`)
      if ((response.status = 'success')) {
        setReferralToken(response.result?.referralToken)
      }
    } catch (error) {
      toast.error('Failed to fetch user data. Please try again.')
    }
  }

  useEffect(() => {
    if (!referralToken) {
      getUserData()
    }
  }, [])

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/register?ref=${referralToken}`

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy referral link. Please try again.')
    }
  }

  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        height: 'calc(100vh - 56px)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDarkMode ? theme.palette.background.default : '#f8f9fa',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : theme.palette.common.white,
          pt: { xs: 2, md: 2.5 },
          pb: { xs: 2, md: 2.5 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
          flexShrink: 0
        }}
      >
        <Container maxWidth='lg'>
          <Stack spacing={1} alignItems='center' textAlign='center'>
            {/* Icon and Title */}
            <Stack direction='row' spacing={1.5} alignItems='center' justifyContent='center'>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  flexShrink: 0
                }}
              >
                <CardGiftcardIcon sx={{ fontSize: 24 }} />
              </Box>

              <Typography
                variant='h4'
                fontWeight={700}
                sx={{
                  fontSize: { xs: '1.35rem', sm: '1.6rem', md: '1.85rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Refer & Earn Rewards
              </Typography>
            </Stack>

            {/* Subtitle */}
            <Typography
              variant='body2'
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                color: isDarkMode ? alpha(theme.palette.common.white, 0.8) : '#5f6368',
                maxWidth: '700px',
                lineHeight: 1.5,
                px: { xs: 2, sm: 0 }
              }}
            >
              Invite your friends to {themeConfig.templateName}. When they sign up, both of you will earn rewards and
              start your learning journey together!
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: 2,
          pb: { xs: 8, sm: 10, md: 12 },
          minHeight: 0,
          maxHeight: 'calc(100% - 16px)',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
          // Custom scrollbar styling for better appearance
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: isDarkMode ? alpha(theme.palette.common.black, 0.1) : alpha(theme.palette.common.black, 0.05),
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? alpha(theme.palette.common.white, 0.3) : alpha(theme.palette.common.black, 0.2),
            borderRadius: '4px',
            '&:hover': {
              background: isDarkMode ? alpha(theme.palette.common.white, 0.4) : alpha(theme.palette.common.black, 0.3)
            }
          }
        }}
      >
        <Container
          maxWidth='lg'
          sx={{
            width: '100%',
            boxSizing: 'border-box',
            pb: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          <Stack spacing={3}>
            {/* How It Works */}
            <Box>
              <Typography
                variant='h5'
                fontWeight={700}
                gutterBottom
                sx={{
                  mb: { xs: 2.5, sm: 3 },
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                  color: isDarkMode ? theme.palette.common.white : '#202124'
                }}
              >
                How It Works
              </Typography>
              <Grid container spacing={3}>
                {options?.map((option, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        height: '100%',
                        borderRadius: { xs: 1.5, sm: 2 },
                        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette[option.color].main,
                          boxShadow: isDarkMode
                            ? `0 4px 20px ${alpha(theme.palette[option.color].main, 0.2)}`
                            : `0 4px 20px ${alpha(theme.palette[option.color].main, 0.1)}`,
                          transform: 'translateY(-4px)'
                        }
                      }}
                    >
                      <Stack spacing={2} alignItems='center'>
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette[option.color].main, 0.1),
                            color: theme.palette[option.color].main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Box>
                          <Typography
                            variant='h6'
                            fontWeight={700}
                            gutterBottom
                            sx={{
                              color: isDarkMode ? theme.palette.common.white : '#202124',
                              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                            }}
                          >
                            {option.title}
                          </Typography>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              lineHeight: 1.6,
                              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' }
                            }}
                          >
                            {option.subtitle}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Invite by Email */}
            <Card
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                boxShadow: isDarkMode
                  ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                <Stack direction='row' alignItems='center' spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SendIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant='h6' fontWeight={700}>
                    Invite Your Friends
                  </Typography>
                </Stack>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={2}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' } }}
                  >
                    Enter your friend's email address and invite them to join {themeConfig.templateName}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      type='email'
                      value={toEmail}
                      onChange={handleEmailChange}
                      fullWidth
                      placeholder='friend@email.com'
                      id='refer-email'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : 'white'
                        }
                      }}
                    />
                    <Button
                      variant='contained'
                      component='label'
                      size='large'
                      startIcon={<SendIcon />}
                      onClick={handleSendReferral}
                      disabled={loading || !isEmailValid}
                      sx={{
                        px: 4,
                        color: 'white',
                        textTransform: 'none',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Share Referral Link */}
            <Card
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'white',
                border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`,
                boxShadow: isDarkMode
                  ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
                  : '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'visible',
                mb: { xs: 2, sm: 2.5 }
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  borderBottom: '2px solid',
                  borderColor: 'secondary.main'
                }}
              >
                <Stack direction='row' alignItems='center' spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShareIcon sx={{ fontSize: 22 }} />
                  </Box>
                  <Typography variant='h6' fontWeight={700}>
                    Share Your Referral Link
                  </Typography>
                </Stack>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack spacing={3}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: { xs: '0.88rem', sm: '0.9rem', md: '0.95rem' } }}
                  >
                    Copy your unique referral link or share it directly on social media
                  </Typography>

                  {/* Referral Link Display */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: { xs: 1.5, sm: 2 },
                      bgcolor: isDarkMode
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.05),
                      border: '1px dashed',
                      borderColor: theme.palette.primary.main
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction='row' alignItems='center' spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.5 }
                            }
                          }}
                        />
                        <Typography
                          variant='caption'
                          fontWeight={700}
                          sx={{ color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}
                        >
                          Your Unique Referral Link
                        </Typography>
                      </Stack>

                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Typography
                          variant='body1'
                          sx={{
                            flex: 1,
                            fontFamily: 'monospace',
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                            color: isDarkMode ? theme.palette.common.white : '#202124',
                            wordBreak: 'break-all',
                            bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : 'white',
                            p: { xs: 1.25, sm: 1.5 },
                            borderRadius: { xs: 0.75, sm: 1 },
                            border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.1)}`
                          }}
                        >
                          {referralLink}
                        </Typography>

                        <Button
                          variant='contained'
                          component='label'
                          size='small'
                          startIcon={<ContentCopyIcon />}
                          onClick={copyLinkToClipboard}
                          sx={{
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
                            }
                          }}
                        >
                          Copy
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Social Share Buttons */}
                  <Box sx={{ pt: 1 }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={600}
                      gutterBottom
                      sx={{
                        mb: 2,
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        color: isDarkMode ? theme.palette.common.white : 'text.primary'
                      }}
                    >
                      Share on Social Media
                    </Typography>
                    <Stack
                      direction='row'
                      spacing={1.5}
                      flexWrap='wrap'
                      sx={{
                        gap: { xs: 1, sm: 1.5 },
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}
                    >
                      <EmailShareButton
                        url={referralLink}
                        subject={`${themeConfig.templateName}: Learn & Win with Quizzes`}
                        body={`🌟 Discover ${themeConfig.templateName}!\n\n${themeConfig.templateName} is a Quiz application where you can earn Rewards & Prizes while learning & spreading Indian Knowledge Systems.\n\nJoin me and start learning: ${referralLink}`}
                      >
                        <EmailIcon size={40} round />
                      </EmailShareButton>

                      <FacebookShareButton
                        url={referralLink}
                        quote={`${themeConfig.templateName}: Learn & Win with Quizzes\n\n${themeConfig.templateName} is designed to learn & spread Indian Knowledge Systems while having fun.`}
                        hashtag={`#${themeConfig.templateName}`}
                      >
                        <FacebookIcon size={40} round />
                      </FacebookShareButton>

                      <WhatsappShareButton
                        url={referralLink}
                        title={`✨ ${themeConfig.templateName}: Learn & Win! ✨\n\n${themeConfig.templateName} is a Quiz application where you earn Rewards & Prizes while learning Indian Knowledge Systems.\n\n🎯 Test your knowledge, challenge friends, and win prizes!\n\nJoin me now:\n`}
                        separator={'\n\n🔗 '}
                      >
                        <WhatsappIcon size={40} round />
                      </WhatsappShareButton>

                      <TelegramShareButton
                        url={referralLink}
                        title={`${themeConfig.templateName}: Learn & Win with Quizzes!\n\n${themeConfig.templateName} lets you earn Rewards & Prizes while learning Indian Knowledge Systems.\n\nJoin now: ${referralLink}`}
                      >
                        <TelegramIcon size={40} round />
                      </TelegramShareButton>

                      <TwitterShareButton
                        url={referralLink}
                        title={`Discover ${themeConfig.templateName} 🧠✨\n\nLearn, Challenge & Win Rewards! 🎉\n\nJoin me and explore Indian Knowledge Systems: ${referralLink}`}
                        hashtags={[themeConfig.templateName, 'QuizApp', 'LearnAndWin']}
                      >
                        <TwitterIcon size={40} round />
                      </TwitterShareButton>

                      <LinkedinShareButton
                        url={referralLink}
                        title={`${themeConfig.templateName}: Learn & Win with Quizzes`}
                        summary={`${themeConfig.templateName} is designed to spread Indian Knowledge Systems while allowing you to test your knowledge, challenge friends, and earn exciting prizes.`}
                        source={themeConfig.templateName}
                      >
                        <LinkedinIcon size={40} round />
                      </LinkedinShareButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default ReferAndEarn
