import { useState } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { IoMdAttach, IoMdClose } from 'react-icons/io'
import { RiCloseFill } from 'react-icons/ri'
import VideocamIcon from '@mui/icons-material/Videocam'
import CloseIcon from '@mui/icons-material/Close'
import YouTubeIcon from '@mui/icons-material/YouTube'
const QuizCourseLinks = ({ courseLinks = [], setTheFormValue, loading }) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [newLink, setNewLink] = useState('')
  const [error, setError] = useState('')
  const [isTouched, setIsTouched] = useState(false)

  const hasLinks = courseLinks.some(link => link.link)

  // Function to validate video URLs
  const isValidVideoUrl = url => {
    try {
      // Basic URL validation
      const parsedUrl = new URL(url)

      // List of common video hosting domains
      const videoDomains = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'dailymotion.com',
        'twitch.tv',
        'facebook.com',
        'instagram.com',
        'streamable.com'
      ]

      // Check if the domain is in our video domains list
      return videoDomains.some(
        domain => parsedUrl.hostname.includes(domain) || parsedUrl.hostname.replace('www.', '').includes(domain)
      )
    } catch (e) {
      return false // Not a valid URL
    }
  }

  // Handle opening the popup
  const handleOpen = () => {
    setOpen(true)
    setIsTouched(false)
  }

  // Handle closing the popup
  const handleClose = () => {
    setOpen(false)
    setNewLink('')
    setIsTouched(false)
  }

  // Handle saving the new link
  const handleSave = () => {
    setIsTouched(true)
    if (newLink.trim()) {
      if (isValidVideoUrl(newLink)) {
        setTheFormValue('courseLinks', [
          ...courseLinks,
          {
            id: courseLinks.length + 1,
            mediaType: 'video',
            link: newLink.trim()
          }
        ])
        handleClose()
      } else {
        setError('Please enter a valid video URL (YouTube, Vimeo, etc.)')
      }
    }
  }

  // Handle removing a link
  const handleRemoveLink = index => {
    const updatedLinks = courseLinks.filter((_, i) => i !== index)
    setTheFormValue('courseLinks', updatedLinks)
  }

  const handleInputChange = e => {
    setNewLink(e.target.value)
    // Clear error when user starts typing again
    if (error) setError('')
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        opacity: loading ? 0.7 : 1
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Course Links</Typography>

        <IconButtonTooltip
          title='Add Links'
          color='primary'
          onClick={!loading ? handleOpen : undefined}
          disabled={loading}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: !loading ? 'action.hover' : undefined
            }
          }}
        >
          <AddIcon />
          <Typography color='primary'>Add Links</Typography>
        </IconButtonTooltip>
      </Box>

      {/* Display links as chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          maxHeight: '70px', // Height for 2 rows (adjust as needed)
          overflowY: 'auto'
        }}
      >
        {hasLinks ? (
          courseLinks.map((link, index) => (
            <Tooltip key={index} title={link.link} arrow>
              <Chip
                key={index}
                label={link.link}
                icon={
                  link.link.includes('youtube.com') || link.link.includes('youtu.be') ? (
                    <YouTubeIcon color='error' />
                  ) : (
                    <VideocamIcon color='warning' />
                  )
                }
                onClick={() => window.open(link.link, '_blank')}
                onDelete={e => {
                  e.stopPropagation()
                  handleRemoveLink(index)
                }}
                deleteIcon={<IoMdClose />}
                variant='outlined'
                sx={{
                  maxWidth: 200,
                  cursor: 'pointer',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: '170px' // Adjust width as needed
                  },
                  flexShrink: 0, // Prevent chips from shrinking
                  '&:hover': {
                    backgroundColor: 'action.hover' // Optional: Add hover effect
                  }
                }}
              />
            </Tooltip>
          ))
        ) : (
          <Box
            sx={{
              width: '100%', // Take full width
              textAlign: 'center' // Center text within the Box
            }}
          >
            <Typography variant='body2' fontSize='1rem' color='textSecondary'>
              No Links added
            </Typography>
          </Box>
        )}
      </Box>
      {/* Popup Dialog */}
      <Dialog open={open} onClose={!loading ? handleClose : undefined} maxWidth='md' fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: { xs: 1, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600
          }}
        >
          Add New Course Link
          <IconButton
            onClick={!loading ? handleClose : undefined}
            disabled={loading}
            size='small'
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Video link URL'
            type='url'
            fullWidth
            variant='outlined'
            value={newLink}
            onChange={handleInputChange}
            onFocus={() => setIsTouched(true)}
            placeholder='https://www.youtube.com/shorts/Aak8yjC_nT0'
            error={isTouched && !!error}
            helperText={error || 'Only video links (YouTube, Vimeo, etc.) are accepted'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={handleClose}
            sx={{
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant='contained'
            component='label'
            sx={{ color: 'white' }}
            disabled={!newLink.trim() || loading}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizCourseLinks
