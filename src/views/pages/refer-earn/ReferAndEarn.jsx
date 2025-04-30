'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'
import { Alert, Card, CardContent, CardHeader } from '@mui/material'

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

// Vars
const options = [
  {
    icon: 'ri-send-plane-2-line',
    title: 'Send Invitation 👍🏻',
    subtitle: 'Send your referral link to your friend'
  },
  {
    icon: 'ri-clipboard-line',
    title: 'Registration 😎',
    subtitle: 'Let them register to our services'
  },
  {
    icon: 'ri-gift-line',
    title: 'Free Trial  🎉',
    subtitle: 'Your friend will get 30 days free trial'
  }
]

const ReferAndEarn = () => {
  const { lang: locale } = useParams()
  const { data: session } = useSession()
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

  return (
    <>
      <Card maxwidth='md' scroll='body'>
        <CardHeader
          variant='h4'
          className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
          title={
            <>
              Refer & Earn
              <Typography component='span' className='flex flex-col text-center'>
                Invite your friend to {themeConfig.templateName}, if they sign up, you and your friend will get 30 days
                free trial
              </Typography>
            </>
          }
        />
        <CardContent className='flex flex-col gap-6 pbs-0 pbe-10 pli-10 sm:pli-16 sm:pbe-16'>
          <Grid container spacing={6} className='pbs-6'>
            {options?.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <div className='flex items-center flex-col gap-4'>
                  <CustomAvatar className='bs-[66px] is-[66px] sm:bs-[88px] sm:is-[88px]' color='primary' skin='light'>
                    {typeof option.icon === 'string' ? (
                      <i className={classnames('text-[32px] sm:text-[40px]', option.icon)} />
                    ) : (
                      option.icon
                    )}
                  </CustomAvatar>
                  <div className='flex flex-col gap-2 text-center'>
                    <Typography className='font-medium' color='text.primary'>
                      {option.title}
                    </Typography>
                    <Typography>{option.subtitle}</Typography>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
          <Divider className='mbs-6' />
          <div className='flex flex-col gap-5'>
            <Typography variant='h5'>Invite your friends</Typography>
            <div className='inline-flex flex-col gap-2 flex-wrap items-start'>
              <Typography component={InputLabel} htmlFor='refer-email' className='inline-flex whitespace-break-spaces'>
                Enter your friend&#39;s email address and invite them to join {themeConfig.templateName} 😍
              </Typography>
              <div className='flex items-center is-full gap-4 flex-wrap sm:flex-nowrap'>
                <TextField
                  type='email'
                  value={toEmail}
                  onChange={handleEmailChange}
                  fullWidth
                  size='small'
                  id='refer-email'
                  placeholder='johnDoe@email.com'
                />
                <Button
                  variant='contained'
                  color='primary'
                  component='label'
                  style={{ color: 'white' }}
                  className='is-full sm:is-auto'
                  onClick={handleSendReferral}
                  disabled={loading || !isEmailValid}
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-5'>
            <Typography variant='h5'>Share the referral link</Typography>
            <div className='inline-flex flex-col gap-2 items-start'>
              <Typography component={InputLabel} htmlFor='refer-social' className='inline-flex whitespace-break-spaces'>
                You can also copy and send it or share it on your social media. 🚀
              </Typography>
              <div className='flex items-center justify-end sm:justify-initial is-full gap-4 flex-wrap sm:flex-nowrap'>
                <OutlinedInput
                  fullWidth
                  size='small'
                  value={referralLink}
                  readOnly
                  // disabled
                  id='refer-social'
                  className='pie-1'
                  placeholder='http://referral.link'
                  endAdornment={
                    <InputAdornment position='end' className='text-primary'>
                      <Button size='small' className='uppercase' onClick={copyLinkToClipboard}>
                        Copy Link
                      </Button>
                    </InputAdornment>
                  }
                />
                <div className='flex items-center gap-1'>
                  {/* Email Share */}
                  <EmailShareButton
                    url={referralLink}
                    subject={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes`}
                    body={`🌟 Discover ${themeConfig.templateName}!\n\n${themeConfig.templateName} is a Quiz application designed to earn Rewards & Prizes while learning & spreading Indian Knowledge Systems.\n\nSign up now: ${referralLink}`}
                  >
                    <EmailIcon size={32} round />
                  </EmailShareButton>

                  {/* Facebook Share */}
                  <FacebookShareButton
                    url={referralLink}
                    quote={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes\n\n${themeConfig.templateName} is designed to learn & spread Indian Knowledge Systems while having fun.`}
                    hashtag={`#${themeConfig.templateName}`}
                  >
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>

                  {/* WhatsApp Share */}
                  <WhatsappShareButton
                    url={referralLink} // Ensure the referral link is a complete, accessible URL
                    title={`✨ ${themeConfig.templateName}: The Ultimate Quiz App ✨\n\n${themeConfig.templateName} is a Quiz application designed to earn Rewards & Prizes while learning & spreading Indian Knowledge Systems.\n\n🎯 Test your knowledge, challenge your friends, and enjoy the journey!\n\nSign up now to join the excitement:\n`}
                    separator={'\n\n🔗 '}
                  >
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>

                  {/* Telegram Share */}
                  <TelegramShareButton
                    url={referralLink}
                    title={`${themeConfig.templateName}: The Ultimate Quiz App for Fun, Learning, and Rewards!\n\n${themeConfig.templateName} is designed to promote Indian Knowledge Systems while earning Rewards & Prizes.\n\nJoin now: ${referralLink}`}
                  >
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>

                  {/* Twitter Share */}
                  <TwitterShareButton
                    url={referralLink}
                    title={`Discover ${themeConfig.templateName} 🧠✨\n\nA Quiz App to Learn, Challenge, and Earn Rewards! 🎉\n\nSign up now and explore Indian Knowledge Systems: ${referralLink}`}
                    hashtags={[themeConfig.templateName, 'QuizApp', 'Rewards']}
                  >
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>

                  {/* LinkedIn Share */}
                  <LinkedinShareButton
                    url={referralLink}
                    title={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes`}
                    summary={`${themeConfig.templateName} is designed to spread Indian Knowledge Systems while allowing you to test your knowledge, challenge friends, and earn exciting prizes.`}
                    source={themeConfig.templateName}
                  >
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ReferAndEarn
