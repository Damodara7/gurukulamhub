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
import { format } from 'date-fns'
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
            {/* WhatsApp Share */}
            <WhatsappShareButton
              url={shareUrl}
              title={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ *Description:* ${game?.description || 'Join the fun!'}
📍 *Location:* ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ *Starts at:*  ${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'} 
📚 *Syllabus:* ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Friends 👥  
✅ Test Your Knowledge �  

🔗 *Click the link to join now!*  
`}
              separator=''
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            {/* Facebook Share */}
            <FacebookShareButton
              url={shareUrl}
              quote={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ *Description:* ${game?.description || 'Join the fun!'}
📍 *Location:* ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ *Starts at:* ${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'} 
📚 *Syllabus:* ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Friends 👥  
✅ Test Your Knowledge  

🔗 *Click the link to join now!*  

`}
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>

            {/* Email Share */}
            <EmailShareButton
              url={`https://www.geeksforgeeks.org/`}
              subject={`Join ${game?.title} - Challenge & Win!`}
              body={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ *Description:* ${game?.description || 'Join the fun!'}
📍 *Location:* ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ *Starts at:* ${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'}
📚 *Syllabus:* ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Friends 👥  
✅ Test Your Knowledge  

🔗 *Click the link to join now!*  


Regards,
${themeConfig.templateName} Team
`}
            >
              <EmailIcon size={32} round />
            </EmailShareButton>

            {/* Telegram Share */}
            <TelegramShareButton
              url={shareUrl}
              title={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ *Description:* ${game?.description || 'Join the fun!'}
📍 *Location:* ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ *Starts at:* ${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'} 
📚 *Syllabus:* ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Friends 👥  
✅ Test Your Knowledge  

🔗 *Click the link to join now!*  
`}
            >
              <TelegramIcon size={32} round />
            </TelegramShareButton>

            {/* Twitter Share */}
            <TwitterShareButton
              url={shareUrl}
              title={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ ${game?.description || 'Join the fun!'}
📍 ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ Starts at:${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'} 
📚 Syllabus: ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🏆 Exciting Prizes | 👥 Challenge Friends | 🧠 Test Your Knowledge

🔗 Register now:`}
            >
              <TwitterIcon size={32} round />
            </TwitterShareButton>

            {/* LinkedIn Share */}

            <LinkedinShareButton
              url={shareUrl}
              title={`${game?.title} - Knowledge Challenge`}
              summary={`
🎮 *${game?.title}* 🎮

📌 *Game Details:*
✨ *Description:* ${game?.description || 'Join the fun!'}
📍 *Location:* ${game?.location?.country || game?.location?.region || game?.location?.city || 'AnyWhere'}
⏰ *Starts at:* ${format(new Date(game.startTime), 'PPpp') || 'time is not Specified'}
📚 *Syllabus:* ${game.quiz.syllabus || 'General Knowledge & Fun!'}

🔥 *Why Join?*
✅ Exciting Prizes 🏆  
✅ Challenge Connections 👥  
✅ Expand Your Knowledge 🧠  

Perfect for professionals, students, and lifelong learners!`}
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