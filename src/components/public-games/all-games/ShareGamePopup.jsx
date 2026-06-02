'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
import { ContentCopy as ContentCopyIcon, Close as CloseIcon } from '@mui/icons-material'
import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

const formatGameStartTime = startTime => {
  if (!startTime) return 'Time is not specified'
  try {
    const date = new Date(startTime)
    if (Number.isNaN(date.getTime())) return 'Time is not specified'
    return format(date, 'PPpp')
  } catch {
    return 'Time is not specified'
  }
}

const buildShareMessage = (game, { twitterStyle = false } = {}) => {
  const title = game?.title || 'Game'
  const description = game?.description || 'Join the fun!'
  const location = game?.location?.country || game?.location?.region || game?.location?.city || 'Anywhere'
  const startsAt = formatGameStartTime(game?.startTime)
  const syllabus = game?.quiz?.syllabus || 'General Knowledge & Fun!'

  if (twitterStyle) {
    return `
🎮 *${title}* 🎮

📌 *Game Details:*
✨ ${description}
📍 ${location}
⏰ Starts at: ${startsAt}
📚 Syllabus: ${syllabus}

🏆 Exciting Prizes | 👥 Challenge Friends | 🧠 Test Your Knowledge

🔗 Register now:`
  }

  return `
🎮 *${title}* 🎮

📌 *Game Details:*
✨ *Description:* ${description}
📍 *Location:* ${location}
⏰ *Starts at:* ${startsAt}
📚 *Syllabus:* ${syllabus}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Friends 👥  
✅ Test Your Knowledge 🧠  

🔗 *Click the link to join now!*  
`
}

const ShareGamePopup = ({ open, onClose, game }) => {
  const { lang: locale } = useParams()
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => {
    if (!game?.pin) return ''
    const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}`
    const redirectPath = `public-games/join?gamepin=${game.pin}`
    const encodedRedirect = encodeURIComponent(redirectPath)
    return `${baseUrl}/auth/login?redirectTo=${encodedRedirect}`
  }, [game?.pin, locale])

  const shareMessage = useMemo(() => buildShareMessage(game), [game])
  const twitterMessage = useMemo(() => buildShareMessage(game, { twitterStyle: true }), [game])

  const handleCopy = () => {
    if (!shareUrl) return
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
        {!game?.pin ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
            Game details are not available to share yet.
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Stack direction='row' justifyContent='space-around' spacing={2}>
              <WhatsappShareButton url={shareUrl} title={shareMessage} separator=''>
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>

              <FacebookShareButton url={shareUrl} quote={shareMessage}>
                <FacebookIcon size={32} round />
              </FacebookShareButton>

              <EmailShareButton
                url={shareUrl}
                subject={`Join ${game?.title || 'Game'} - Challenge & Win!`}
                body={`${shareMessage}

Regards,
${themeConfig.templateName} Team
`}
              >
                <EmailIcon size={32} round />
              </EmailShareButton>

              <TelegramShareButton url={shareUrl} title={shareMessage}>
                <TelegramIcon size={32} round />
              </TelegramShareButton>

              <TwitterShareButton url={shareUrl} title={twitterMessage}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>

              <LinkedinShareButton
                url={shareUrl}
                title={`${game?.title || 'Game'} - Knowledge Challenge`}
                summary={`${shareMessage}

Perfect for professionals, students, and lifelong learners!`}
              >
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <Box sx={{ mt: 1, mb: 2, px: 2 }}>
        <TextField
          fullWidth
          size='medium'
          value={shareUrl}
          placeholder={game?.pin ? undefined : 'Share link unavailable'}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                  <IconButton onClick={handleCopy} disabled={!shareUrl}>
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
