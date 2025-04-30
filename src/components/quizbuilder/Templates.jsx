import React from 'react'
import {
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  Skeleton
} from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import { CheckBoxOutlineBlankTwoTone, RadioButtonUnchecked } from '@mui/icons-material'

export const SingleChoiceTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent style={{ padding: '10px 15px' }}>
      {/* <Typography variant='h6' color={questionObj ? '' : 'error'}>
      {questionObj || '* Question is not completed!'}
    </Typography> */}
      <Box>
        {(questionObj?.mediaType === 'text' ||
          questionObj?.mediaType === 'text-image' ||
          questionObj?.mediaType === 'text-video') &&
          questionObj?.text && (
            <Typography variant='h6' className='font-bold' color={questionObj ? '' : 'error'}>
              {questionObj.text}
            </Typography>
          )}
        {questionObj.mediaType === 'video' && (
          <Typography variant='h6' className='font-bold' color={questionObj ? '' : 'error'}>
            Watch the video carefully and answer the question.
          </Typography>
        )}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <Box
            component='img'
            src={questionObj?.image}
            alt='Question Image'
            sx={{
              width: '100%',
              maxWidth: '320px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              mt: 2 // Adds spacing above the image
            }}
          />
        )}{' '}
        {(questionObj.mediaType === 'video' || questionObj.mediaType === 'text-video') && questionObj.video && (
          <Box className='flex flex-col gap-1 items-center'>
            <Box className='flex flex-col gap-1 items-center'>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
            </Box>
          </Box>
        )}
        {!questionObj && '* Question is not completed!'}
      </Box>

      <Typography variant='body2' color='text.secondary'>
        Single Choice Question
      </Typography>
      <RadioGroup>
        <Grid container spacing={2} className='mt-3'>
          {question?.data?.options.map((option, index) => (
            <Grid item xs={6} lg={3} key={option.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  height: '100%',
                  backgroundColor: '#f9f9f9',
                  cursor: 'default' // No interactivity
                }}
              >
                {/* Radio button without FormControlLabel */}
                <Radio disabled checked={false} size='small' defaultChecked={false} sx={{ mr: 2 }} />{' '}
                {/* Margin-right to space from label */}
                {/* Image or text label */}
                {option.mediaType === 'image' && option.image ? (
                  <Box
                    component='img'
                    src={option.image}
                    alt={option.text}
                    sx={{
                      width: '200px',
                      minWidth: '100px',
                      maxWidth: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      opacity: 1 // Explicitly set opacity for the image
                    }}
                  />
                ) : (
                  <Typography variant='body1'>{option.text}</Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </CardContent>
  )
}

export const MultipleChoiceTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent style={{ padding: '10px 15px' }}>
      {/* <Typography variant='h6' color={questionObj ? '' : 'error'}>
      {questionObj || '* Question is not completed!'}
    </Typography> */}
      <Typography variant='h6' className='font-bold' color={questionObj ? '' : 'error'}>
        {(questionObj?.mediaType === 'text' ||
          questionObj?.mediaType === 'text-image' ||
          questionObj?.mediaType === 'text-video') &&
          questionObj?.text &&
          questionObj.text}
        {questionObj.mediaType === 'video' && <span>Watch the video carefully and answer the question.</span>}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <Box
            component='img'
            src={questionObj?.image}
            alt='Question Image'
            sx={{
              width: '100%',
              maxWidth: '320px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              mt: 2 // Adds spacing above the image
            }}
          />
        )}{' '}
        {(questionObj.mediaType === 'video' || questionObj.mediaType === 'text-video') && questionObj.video && (
          <Box className='flex flex-col gap-1 items-center'>
            <Box className='flex flex-col gap-1 items-center'>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
            </Box>
          </Box>
        )}
        {!questionObj && '* Question is not completed!'}
      </Typography>

      <Typography variant='body2' color='text.secondary'>
        Multiple Choice Question
      </Typography>
      <Grid container spacing={2} className='mt-3'>
        {question?.data?.options.map(option => (
          <Grid item xs={6} lg={3} key={option.id}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: 2,
                p: 2,
                height: '100%',
                backgroundColor: '#f9f9f9',
                cursor: 'default' // No interactivity
              }}
            >
              <Checkbox disabled size='small' sx={{ mr: 2 }} /> {/* Checkbox is disabled */}
              {/* Image or text label */}
              {option.mediaType === 'image' && option.image ? (
                <Box
                  component='img'
                  src={option.image}
                  alt={option.text}
                  sx={{
                    width: '200px',
                    minWidth: '100px',
                    maxWidth: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    opacity: 1 // Ensure full opacity for the image
                  }}
                />
              ) : (
                <Typography variant='body1'>{option.text}</Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  )
}

export const TrueOrFalseTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent style={{ padding: '10px 15px' }}>
      {/* <Typography variant='h6' color={questionObj ? '' : 'error'}>
      {questionObj || '* Question is not completed!'}
    </Typography> */}
      <Typography variant='h6' className='font-bold' color={questionObj ? '' : 'error'}>
        {(questionObj?.mediaType === 'text' ||
          questionObj?.mediaType === 'text-image' ||
          questionObj?.mediaType === 'text-video') &&
          questionObj?.text &&
          questionObj.text}
        {questionObj?.mediaType === 'video' && <span>Watch the video carefully and answer the question.</span>}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <Box
            component='img'
            src={questionObj?.image}
            alt='Question Image'
            sx={{
              width: '100%',
              maxWidth: '320px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              mt: 2 // Adds spacing above the image
            }}
          />
        )}{' '}
        {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
          <Box className='flex flex-col gap-1 items-center'>
            <Box className='flex flex-col gap-1 items-center'>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
            </Box>
          </Box>
        )}
        {!questionObj && '* Question is not completed!'}
      </Typography>

      <Typography variant='body2' color='text.secondary'>
        True or False Question
      </Typography>
      <RadioGroup>
        <Grid container spacing={2} className='mt-3'>
          {question?.data?.options.map(option => (
            <Grid item xs={6} key={option.id}>
              {' '}
              {/* Two options per row (6 out of 12 columns) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  height: '100%',
                  backgroundColor: '#f9f9f9',
                  cursor: 'default' // No interactivity
                }}
              >
                <Radio disabled checked={false} size='small' sx={{ mr: 2 }} /> {/* Disabled radio button */}
                <Typography variant='body1'>{option.text}</Typography> {/* Display option text */}
              </Box>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </CardContent>
  )
}

export const FillInTheBlanksTemplate = ({ question }) => {
  const questionObj = question?.data?.question

  return (
    <CardContent style={{ padding: '10px 15px' }}>
      {/* Render Question */}
      <Box mb={3}>
        {questionObj?.map(part => (
          <Box key={part.id} display='inline-flex' alignItems='center' sx={{ mr: 1, mb: 1 }}>
            {part.type === 'text' ? (
              // Render static text parts
              <Typography variant='body1' component='span'>
                {part.content}
              </Typography>
            ) : (
              // Render blanks with placeholders or pre-filled values
              <TextField
                size='small'
                variant='outlined'
                value={part.answer} // Show answer if available, otherwise placeholder
                disabled
                sx={{
                  minWidth: '100px', // Ensures consistent input size
                  maxWidth: '300px',
                  marginBottom: '2px',
                  backgroundColor: '#f0f0f0' // Light background for view mode
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    </CardContent>
  )
}

export const DummySingleChoiceTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent sx={{ padding: '8px', paddingBottom: '0px' }} key={question._id}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '4px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Question Text */}
        <Typography
          noWrap
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: questionObj ? '#000' : 'error', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
          color={questionObj ? '' : 'error'}
        >
          {questionNumber}.{' '}
          {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
            ? // Text Only or Text-Image
              questionObj.text
            : questionObj?.mediaType === 'text-video' && questionObj?.text
              ? // Text-Video
                questionObj.text
              : questionObj?.mediaType === 'video'
                ? // Video Only
                  'Watch the video carefully and answer the question.'
                : questionObj?.mediaType === 'image'
                  ? null // Show nothing if mediaType is image
                  : // Default case
                    '* Question is not completed!'}
        </Typography>

        {/* Media Type Icon */}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <ImageIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#1976d2', // Blue for image
              fontSize: '32px'
            }}
          />
        )}

        {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
          <VideoLibraryIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#d32f2f', // Red for video
              fontSize: '32px'
            }}
          />
        )}
      </Box>

      <Typography variant='body2' fontSize={'11px'} color='text.secondary'>
        Single Choice Question
      </Typography>
      <Grid container sx={{ width: '100%', marginBottom: '0px', marginLeft: 1, marginTop: '2px' }} spacing={2}>
        {question?.data?.options.map(option => (
          <Grid item xs={6} key={option}>
            <Box
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: 'lightblue',
                borderRadius: '4px',
                width: '100%',
                height: '40px',
                cursor: 'pointer',
              }}
            >
              <RadioButtonUnchecked
                size='small'
                // color='primary'
              />

              {option.mediaType === 'image' && option?.image ? (
                <Box
                  component='img'
                  src={option.image}
                  alt={option.text}
                  sx={{
                    width: '40px',
                    minWidth: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <Typography
                  variant='body1'
                  sx={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {option.text}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  )
}

export const DummyMultipleChoiceTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent sx={{ padding: '8px', paddingBottom: '0px' }} key={question._id}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '4px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Question Text */}
        <Typography
          noWrap
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: questionObj ? '#000' : 'error', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
          color={questionObj ? '' : 'error'}
        >
          {questionNumber}.{' '}
          {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
            ? // Text Only or Text-Image
              questionObj.text
            : questionObj?.mediaType === 'text-video' && questionObj?.text
              ? // Text-Video
                questionObj.text
              : questionObj?.mediaType === 'video'
                ? // Video Only
                  'Watch the video carefully and answer the question.'
                : questionObj?.mediaType === 'image'
                  ? null // Show nothing if mediaType is image
                  : // Default case
                    '* Question is not completed!'}
        </Typography>

        {/* Media Type Icon */}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <ImageIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#1976d2', // Blue for image
              fontSize: '32px'
            }}
          />
        )}

        {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
          <VideoLibraryIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#d32f2f', // Red for video
              fontSize: '32px'
            }}
          />
        )}
      </Box>

      <Typography variant='body2' fontSize={'11px'} color='text.secondary'>
        Mutiple Choice Question
      </Typography>
      <Grid container sx={{ width: '100%', marginBottom: '0px', marginLeft: 1, marginTop: '2px' }} spacing={2}>
        {question?.data?.options.map((option, index) => (
          <Grid item xs={6} key={option.id}>
            <Box
              key={option.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: 'lightblue',
                borderRadius: '4px',
                width: '100%',
                height: '40px',
                cursor: 'pointer',
              }}
            >
              <CheckBoxOutlineBlankTwoTone
                size='small'
              />

              {option.mediaType === 'image' && option?.image ? (
                <Box
                  component='img'
                  src={option.image}
                  alt={option.text}
                  sx={{
                    width: '40px',
                    minWidth: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              ) : (
                <Typography
                  variant='body1'
                  sx={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {option.text}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  )
}

export const DummyFillInTheBlanksTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question

  return (
    <CardContent sx={{ padding: '8px', paddingBottom: '0px' }} key={question._id}>
      {/* Title Section */}
      <Typography
        variant='h6'
        color={questionObj ? '' : 'error'}
        noWrap
        sx={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        {/* {title} */}
        {/* Display Question */}
        <Box mt={2}>
          <Typography fontWeight='bold' variant='h6' component='span' mr={1}>
            {questionNumber}.
          </Typography>
          {questionObj?.map((part, index) => (
            <Box key={index} display='inline' sx={{ mr: 1 }}>
              {part.type === 'text' ? (
                // Display text part
                <Typography fontWeight='bold' variant='h6' color={questionObj ? '' : 'error'} component='span'>
                  {part.content}
                </Typography>
              ) : (
                // Display blank space
                <Box
                  component='span'
                  sx={{
                    display: 'inline-block',
                    borderBottom: '1px solid gray',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    width: '120px',
                    height: '24px',
                    verticalAlign: 'bottom',
                    mx: 0.5
                  }}
                >
                  {/* Placeholder for blank */}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Typography>

      {/* Subtitle */}
      <Typography variant='body2' fontSize='11px' color='text.secondary'>
        Fill in the blanks
      </Typography>

      <Grid container sx={{ width: '100%', marginBottom: '0px', marginLeft: 1, marginTop: '6px' }} spacing={2}>
        <Typography variant='subtitle1' className='flex items-end'>
          Fill in the blank{' '}
          <Box sx={{ borderBottom: '1px solid gray', bgcolor: 'rgba(0,0,0,0.05)', mx: 2 }} width='120px' height={30} />
        </Typography>
      </Grid>
    </CardContent>
  )
}

export const DummyTrueOrFalseTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  return (
    <CardContent sx={{ padding: '8px', paddingBottom: '0px' }} key={question._id}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '4px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Question Text */}
        <Typography
          noWrap
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: questionObj ? '#000' : 'error', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
          color={questionObj ? '' : 'error'}
        >
          {questionNumber}.{' '}
          {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
            ? // Text Only or Text-Image
              questionObj.text
            : questionObj?.mediaType === 'text-video' && questionObj?.text
              ? // Text-Video
                questionObj.text
              : questionObj?.mediaType === 'video'
                ? // Video Only
                  'Watch the video carefully and answer the question.'
                : questionObj?.mediaType === 'image'
                  ? null // Show nothing if mediaType is image
                  : // Default case
                    '* Question is not completed!'}
        </Typography>

        {/* Media Type Icon */}
        {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
          <ImageIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#1976d2', // Blue for image
              fontSize: '32px'
            }}
          />
        )}

        {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
          <VideoLibraryIcon
            sx={{
              position: 'absolute',
              top: '1px',
              right: '1px',
              color: '#d32f2f', // Red for video
              fontSize: '32px'
            }}
          />
        )}
      </Box>

      <Typography variant='body2' fontSize={'11px'} color='text.secondary'>
        True or false Question
      </Typography>
      <Grid container sx={{ width: '100%', marginBottom: '0px', marginLeft: 1, marginTop: '2px' }} spacing={2}>
        <Grid item xs={12}>
          <RadioGroup>
            <FormControlLabel
              value='false'
              control={<Radio size='small' disabled />}
              label={'True'}
              sx={{
                backgroundColor: 'lightgreen',
                borderRadius: '4px',
                mb: 1,
                width: '100%',
                height: '25px',
                fontSize: '15px',
                marginBottom: '6px'
              }}
            />
            <FormControlLabel
              value='true'
              control={<Radio size='small' disabled />}
              label={'False'}
              sx={{
                backgroundColor: 'lightcoral',
                borderRadius: '4px',
                mb: 1,
                width: '100%',
                height: '25px'
              }}
            />
          </RadioGroup>
        </Grid>
      </Grid>
    </CardContent>
  )
}
