'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Tooltip
} from '@mui/material'
import themeConfig from '@/configs/themeConfig'
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
import { toast } from 'react-toastify'
import {
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { useParams } from 'next/navigation'

const ShareGamePopup = ({ open, onClose, game }) => {
  const { lang: locale } = useParams()
  const [copied, setCopied] = useState(false)

  // Encode the redirect URL
  const getShareUrl = () => {
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}`
    const redirectPath = `public-games/join?gamepin=${game.pin}`
    const encodedRedirect = encodeURIComponent(redirectPath)
    return `${baseUrl}/auth/login?redirectTo=${encodedRedirect}`
  }

  const shareUrl = getShareUrl()

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='h5'>Share Game Link</Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <Stack direction='row' justifyContent='space-around' spacing={2}>
            <EmailShareButton
              url={shareUrl}
              subject={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes`}
              body={`🌟 Discover ${themeConfig.templateName}!\n\n${themeConfig.templateName} is a Quiz application designed to earn Rewards & Prizes while learning & spreading Indian Knowledge Systems.\n\nSign up now: ${shareUrl}`}
            >
              <EmailIcon size={32} round />
            </EmailShareButton>

            {/* Facebook Share */}
            <FacebookShareButton
              url={shareUrl}
              quote={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes\n\n${themeConfig.templateName} is designed to learn & spread Indian Knowledge Systems while having fun.`}
              hashtag={`#${themeConfig.templateName} ${shareUrl}`}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            {/* WhatsApp Share */}
            <WhatsappShareButton
              url={shareUrl} // Ensure the referral link is a complete, accessible URL
              title={`✨ ${themeConfig.templateName}: The Ultimate Quiz App ✨\n\n${themeConfig.templateName} is a Quiz application designed to earn Rewards & Prizes while learning & spreading Indian Knowledge Systems.\n\n🎯 Test your knowledge, challenge your friends, and enjoy the journey!\n\nSign up now to join the excitement:\n`}
              separator={'🔗 '}
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>

            {/* Telegram Share */}
            <TelegramShareButton
              url={shareUrl}
              title={`${themeConfig.templateName}: The Ultimate Quiz App for Fun, Learning, and Rewards!\n\n${themeConfig.templateName} is designed to promote Indian Knowledge Systems while earning Rewards & Prizes.\n\nJoin now: ${shareUrl}`}
            >
              <TelegramIcon size={32} round />
            </TelegramShareButton>

            {/* Twitter Share */}
            <TwitterShareButton
              url={shareUrl}
              title={`Discover ${themeConfig.templateName} 🧠✨\n\nA Quiz App to Learn, Challenge, and Earn Rewards! 🎉\n\nSign up now and explore Indian Knowledge Systems: ${shareUrl}`}
              hashtags={[themeConfig.templateName, 'QuizApp', 'Rewards']}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            {/* LinkedIn Share */}
            <LinkedinShareButton
              url={shareUrl}
              title={`${themeConfig.templateName}: A Quiz App to Earn Rewards & Prizes`}
              summary={`${themeConfig.templateName} is designed to spread Indian Knowledge Systems while allowing you to test your knowledge, challenge friends, and earn exciting prizes.`}
              source={themeConfig.templateName}
            >
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </Stack>
        </Box>
      </DialogContent>
      <Box sx={{ mt: 1, mb: 2, px: 2 }}>
        <TextField
          fullWidth
          size='medium'
          value={shareUrl}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                  <IconButton onClick={handleCopy}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            readOnly: true
          }}
          variant='outlined'
        />
      </Box>
    </Dialog>
  )
}

export default ShareGamePopup