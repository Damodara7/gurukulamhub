import React, { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Alert,
  Box,
  Tooltip
} from '@mui/material'
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, PushPin as PushPinIcon } from '@mui/icons-material'
import IconButtonTooltip from '../IconButtonTooltip'

const VideoPortions = ({ videoUrl, videoDuration, onSetRecommendedSegments, recommendedSegments }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentClip, setCurrentClip] = useState({ id: null, startTime: 0, endTime: 10, description: '' })
  const [playingClipId, setPlayingClipId] = useState(null); 

  const playerRef = useRef(null)
  const playerRefs = useRef({})

  // Open Add/Edit Dialog
  const handleOpenDialog = (clip = { id: null, startTime: 0, endTime: 10 }) => {
    setCurrentClip(clip)
    setOpenDialog(true)
  }

  // Close Dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setErrorMessage('') // Clear previous error when opening the dialog
  }

  // Validate dynamically when startTime or endTime changes
  useEffect(() => {
    if (!currentClip.startTime && currentClip.startTime !== 0) {
      setErrorMessage('Start time cannot be empty')
    } else if (!currentClip.endTime && currentClip.endTime !== 0) {
      setErrorMessage('End time cannot be empty')
    } else if (currentClip.endTime == 0) {
      setErrorMessage('End time cannot be zero')
    } else if (currentClip.endTime <= currentClip.startTime) {
      setErrorMessage('End time must be greater than start time')
    } else {
      setErrorMessage('')
    }
  }, [currentClip.startTime, currentClip.endTime])

  // Function to check for overlapping clips
  const isOverlapping = newClip => {
    return recommendedSegments.some(clip => {
      if (clip.id === newClip.id) return false // Skip the current clip being edited
      return (
        (newClip.startTime >= clip.startTime && newClip.startTime < clip.endTime) ||
        (newClip.endTime > clip.startTime && newClip.endTime <= clip.endTime) ||
        (newClip.startTime <= clip.startTime && newClip.endTime >= clip.endTime)
      )
    })
  }

  // Save Clip
  const handleSaveClip = () => {
    if (currentClip.endTime > currentClip.startTime) {
      if (isOverlapping(currentClip)) {
        setErrorMessage('This time range overlaps with an existing portion.')
      } else {
        if (currentClip.id) {
          // Edit existing
          onSetRecommendedSegments(recommendedSegments.map(clip => (clip.id === currentClip.id ? currentClip : clip)))
        } else {
          // Add new
          onSetRecommendedSegments([...recommendedSegments, { ...currentClip, id: Date.now() }])
        }
        setOpenDialog(false)
      }
    } else {
      setErrorMessage('End time must be greater than start time') // Show error message
    }
  }

  // Delete Clip
  const deleteTrimmedPortion = id => {
    onSetRecommendedSegments(recommendedSegments.filter(clip => clip.id !== id))
  }

  // Play specific range and stop at endTime
  const handleProgress = (id, playedSeconds) => {
    const clip = recommendedSegments.find(clip => clip.id === id)
    if (clip && (playedSeconds >= clip.endTime || playedSeconds < clip.startTime)) {
      playerRefs.current[id]?.seekTo(clip.startTime, 'seconds')
      playerRefs.current[id]?.props.onPause() // Correct way to pause
    }
  }

  // Set time from video
  const setCurrentTime = field => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime()
      setCurrentClip(prev => ({ ...prev, [field]: Math.floor(time) }))
    }
  }

  const formatTime = (timeInSeconds) => {
    const pad = (num) => num.toString().padStart(2, '0'); // Helper to pad single-digit numbers
  
    const hours = Math.floor(timeInSeconds / 3600);
    const remainingSeconds = timeInSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
  
    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`; // Format: H:MM:SS
    } else {
      return `${minutes}:${pad(seconds)}`; // Format: M:SS
    }
  };

  const renderMarkers = clip => {
    const duration = videoDuration

    const startPosition = (clip.startTime / duration) * 100
    const endPosition = (clip.endTime / duration) * 100

    return (
      <>
        {/* Start Time Marker */}
        <Tooltip title={`Start: ${formatTime(clip.startTime)}`} placement='top'>
          <div
            style={{
              position: 'absolute',
              left: `${startPosition - 2}%`,
              bottom: '8px',
              cursor: 'pointer',
              zIndex: 0
            }}
          >
            <PushPinIcon
              color='primary'
              sx={{ color: 'white' }}
              onClick={() => playerRefs.current[clip.id]?.seekTo(clip.startTime, 'seconds')}
            />
          </div>
        </Tooltip>

        {/* End Time Marker */}
        <Tooltip title={`End: ${formatTime(clip.endTime)}`} placement='top'>
          <div
            style={{
              position: 'absolute',
              left: `${endPosition - 2}%`,
              bottom: '8px',
              cursor: 'pointer',
              zIndex: 0
            }}
          >
            <PushPinIcon
              color='secondary'
              sx={{ color: 'white' }}
              onClick={() => playerRefs.current[clip.id]?.seekTo(clip.endTime, 'seconds')}
            />
          </div>
        </Tooltip>
      </>
    )
  }

  return (
    <div className='mt-4'>
      <Typography my={2} variant='h5'>
        Recommended Video Portions : <span style={{ fontWeight: '400', fontSize: '15px' }}>(Optional)</span>
      </Typography>

      {/* Trimmed Video Portions */}
      {recommendedSegments.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
          <Typography variant='body1' color='textSecondary'>
            No recommended portions added yet.
          </Typography>
          {/* Add Button */}
          <Button
            variant='contained'
            component='label'
            sx={{ color: 'white' }}
            startIcon={<AddIcon />}
            className='my-1'
            onClick={() => handleOpenDialog()}
          >
            Add Recommended Portion
          </Button>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {/* Add Button */}
          <Button
            variant='contained'
            component='label'
            sx={{ color: 'white' }}
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Recommended Portion
          </Button>
          <div
            style={{
              maxHeight: '300px', // Set a height limit for visibility
              overflowY: 'auto', // Enable vertical scrolling
              padding: '4px',
              paddingRight: '8px' // Prevent scrollbar from covering content
            }}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[...recommendedSegments]
                .sort((a, b) => a.startTime - b.startTime)
                .map(({ id, startTime, endTime, description }) => (
                  <Card key={id}>
                    <CardContent>
                      <Typography variant='subtitle1'>
                        Start: {formatTime(startTime)} | End: {formatTime(endTime)}
                      </Typography>
                      <div style={{ position: 'relative', marginBottom: '10px' }}>
                        <ReactPlayer
                          ref={el => (playerRefs.current[id] = el)}
                          url={videoUrl}
                          controls
                          width='100%'
                          height='150px'
                          playing
                          loop={false}
                          onStart={() => playerRefs.current[id]?.seekTo(startTime, 'seconds')}
                          progressInterval={100}
                          onProgress={({ playedSeconds }) => {
                            handleProgress(id, playedSeconds)
                          }}
                          config={{
                            youtube: {
                              playerVars: {
                                start: startTime,
                                end: endTime
                              }
                            }
                          }}
                        />
                        {/* Custom Track Markers */}
                        <Box
                          sx={{
                            position: 'absolute',
                            height: '5px',
                            left: '11px',
                            right: '11px',
                            bottom: '35px'
                            // background: 'white'
                          }}
                        >
                          {renderMarkers({ id, startTime, endTime })}
                        </Box>
                      </div>
                      <Typography variant='body2' color='textSecondary'>
                        {description || 'No description provided'}
                      </Typography>

                      <div className='flex justify-between mt-2'>
                        <IconButtonTooltip title='Edit'
                          color='primary'
                          onClick={() => handleOpenDialog({ id, startTime, endTime, description })}
                        >
                          <EditIcon />
                        </IconButtonTooltip>
                        <IconButtonTooltip title='Delete' color='error' onClick={() => deleteTrimmedPortion(id)}>
                          <DeleteIcon />
                        </IconButtonTooltip>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Adding/Editing Clips */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{currentClip.id ? 'Edit Recommended Video Portion' : 'Add Recommended Video Portion'}</DialogTitle>
        <DialogContent>
          <div className='mb-2'>
            <ReactPlayer ref={playerRef} url={videoUrl} controls width='100%' height='200px' />
          </div>

          <TextField
            label='Start Time (s)'
            type='number'
            fullWidth
            margin='dense'
            value={currentClip.startTime}
            onChange={e => setCurrentClip({ ...currentClip, startTime: parseFloat(e.target.value) })}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Button size='small' onClick={() => setCurrentTime('startTime')} variant='outlined'>
                    Set Current Time
                  </Button>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label='End Time (s)'
            type='number'
            fullWidth
            margin='dense'
            value={currentClip.endTime}
            onChange={e => setCurrentClip({ ...currentClip, endTime: parseFloat(e.target.value) })}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Button size='small' onClick={() => setCurrentTime('endTime')} variant='outlined'>
                    Set Current Time
                  </Button>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label='Description'
            type='text'
            fullWidth
            margin='dense'
            value={currentClip.description}
            onChange={e => setCurrentClip({ ...currentClip, description: e.target.value })}
          />

          {/* Display Error Message */}
          {errorMessage && (
            <Alert icon={false} color='error' className='text-center px-3 py-2 mx-auto text-sm mt-1'>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleSaveClip}
            color='primary'
            sx={{ color: 'white' }}
            variant='contained'
            component='label'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default VideoPortions
