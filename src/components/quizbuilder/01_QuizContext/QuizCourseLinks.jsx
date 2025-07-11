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
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { IoMdAttach, IoMdClose } from 'react-icons/io'
import { RiCloseFill } from 'react-icons/ri'
import VideocamIcon from '@mui/icons-material/Videocam';
import YouTubeIcon from '@mui/icons-material/YouTube'
const QuizCourseLinks = ({ courseLinks = [], setTheFormValue }) => {
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
      if(isValidVideoUrl(newLink)){
        setTheFormValue('courseLinks', [
          ...courseLinks,
          {
            id: courseLinks.length + 1,
            mediaType: 'video',
            link: newLink.trim()
          }
        ])
        handleClose()
      }
      else
      {
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
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        height: '100%',
        p: 2
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Course Links</Typography>

        <IconButtonTooltip
          title='Add Links'
          color='primary'
          onClick={handleOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
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
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Course Link</DialogTitle>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!newLink.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizCourseLinks
