import { Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio, Grid, Box } from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'

const SingleChoiceTemplate = ({ question, selectedAnswer, onAnswerSelect }) => {
  const questionObj = question?.data?.question
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

        <RadioGroup value={selectedAnswer || ''} onChange={e => onAnswerSelect(question._id, e.target.value)}>
          <Grid container spacing={2}>
            {question.data.options.map(option => (
              <Grid item xs={12} sm={6} key={option.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: selectedAnswer === option.id ? '2px solid' : '2px solid',
                    borderColor: selectedAnswer === option.id ? 'primary.main' : '#ccc',
                    borderRadius: 2,
                    p: 2,
                    height: '100%',
                    transition: 'background-color 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                  onClick={() => onAnswerSelect(question._id, option.id)}
                >
                  <FormControlLabel
                    value={option.id}
                    control={<Radio sx={{ mr: 1 }} />}
                    label={
                      <Box display='flex' alignItems='center' sx={{ flexGrow: 1 }}>
                        {option.mediaType === 'image' && option.image && (
                          <Box
                            component='img'
                            src={option.image}
                            alt={option.text}
                            style={{
                              minWidth: '100%',
                              maxWidth: '100%',
                              height: '100%',
                              maxHeight: '200px',
                              objectFit: 'fill',
                              borderRadius: '4px',
                              marginRight: 2,
                              border: '1px solid #ccc'
                            }}
                          />
                        )}
                        {option.mediaType === 'text' && option.text && (
                          <Typography variant='body1'>{option.text}</Typography>
                        )}
                      </Box>
                    }
                    sx={{
                      width: '100%',
                      m: 0, // Removes the default margin
                      '.MuiTypography-root': { fontSize: '1rem' } // Adjusts typography inside label
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

export default SingleChoiceTemplate
