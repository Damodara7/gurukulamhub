import React from 'react'
import { Card, CardContent, Checkbox, FormControlLabel, Typography, FormGroup, Box, Grid } from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const MultipleChoiceTemplate = ({ question, selectedAnswers, onAnswerSelect }) => {
  const questionObj = question?.data?.question
  // Handle checkbox change
  const handleCheckboxChange = optionId => {
    let updatedAnswers
    if (selectedAnswers.includes(optionId)) {
      updatedAnswers = selectedAnswers.filter(id => id !== optionId) // Remove if already selected
    } else {
      updatedAnswers = [...selectedAnswers, optionId] // Add if not selected
    }
    onAnswerSelect(question._id, updatedAnswers)
  }

  return (
    <Card>
      <CardContent>
        {/* Render Question */}
        <Box mb={3} display='flex' flexDirection='column' alignItems='center'>
          {(questionObj.mediaType === 'text' ||
            questionObj.mediaType === 'text-image' ||
            questionObj.mediaType === 'text-video') && (
            <Typography variant='h5' gutterBottom>
              {questionObj.text}
            </Typography>
          )}
          {/* Video Only - Display Instructional Text */}
          {questionObj.mediaType === 'video' && (
            <Typography variant='h5' gutterBottom>
              Watch the video carefully and answer the question.
            </Typography>
          )}
          {(questionObj.mediaType === 'image' || questionObj.mediaType === 'text-image') && questionObj.image && (
            <Box
              component='img'
              src={questionObj.image}
              alt='Question'
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginBottom: '16px'
              }}
            />
          )}
          {(questionObj.mediaType === 'video' || questionObj.mediaType === 'text-video') && questionObj.video && (
            <Box className='flex flex-col gap-1 items-center'>
              <Box className='flex flex-col gap-1 items-center'>
                <VideoAd url={questionObj.video || ''} height='200px' showPause autoPlay={false} />
                <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
              </Box>
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          {question.data.options.map(option => (
            <Grid item xs={12} sm={6} key={option.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: selectedAnswers.includes(option.id) ? '2px solid' : '2px solid',
                  borderColor: selectedAnswers.includes(option.id) ? 'primary.main' : '#ccc',
                  borderRadius: 2,
                  p: 2,
                  height: '100%',
                  transition: 'background-color 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
                onClick={() => handleCheckboxChange(option.id)} // Now the entire box is clickable
              >
                <Checkbox
                  checked={selectedAnswers.includes(option.id)}
                  sx={{ mr: 1 }}
                  onChange={e => {
                    e.stopPropagation()
                    handleCheckboxChange(option.id)
                  }}
                  onClick={e => e.stopPropagation()} // Prevent checkbox click from triggering the entire box
                />
                <Box display='flex' alignItems='center' sx={{ flexGrow: 1 }}>
                  {option.mediaType === 'image' && option.image && (
                    <Box
                      component='img'
                      src={option.image}
                      alt={option.text}
                      style={{
                        width: '200px',
                        minWidth: '100%',
                        maxWidth: '100%',
                        height: '100px',
                        objectFit: 'fill',
                        borderRadius: '4px',
                        marginRight: 2,
                        border: '1px solid #ccc'
                      }}
                    />
                  )}
                  {option.mediaType === 'text' && option.text && <Typography variant='body1'>{option.text}</Typography>}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MultipleChoiceTemplate
