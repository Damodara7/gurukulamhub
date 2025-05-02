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
import { CheckBoxOutlineBlankTwoTone, CheckBoxRounded, RadioButtonCheckedRounded, RadioButtonUnchecked } from '@mui/icons-material'

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
                <Radio
                  disabled
                  checked={option.correct}
                  color='success'
                  size='small'
                  defaultChecked={false}
                  sx={{ mr: 2 }}
                />{' '}
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
              <Checkbox checked={option.correct} color='success' disabled size='small' sx={{ mr: 2 }} />{' '}
              {/* Checkbox is disabled */}
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
                <Radio checked={option.correct} color='success' disabled size='small' sx={{ mr: 2 }} />{' '}
                {/* Disabled radio button */}
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
                disabled
                value={part.content}
                style={{ color: 'green', fontWeight: 'bold' }}
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
            color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#000' : 'red', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
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
                backgroundColor: option.text.trim() ? 'lightblue' : 'rgba(240, 182, 182, 0.5)',
                borderRadius: '4px',
                width: '100%',
                height: '40px',
                cursor: 'pointer'
              }}
            >
              {option.correct ? (
                <RadioButtonCheckedRounded size='small' color='primary' />
              ) : (
                <RadioButtonUnchecked
                  size='small'
                  // color='primary'
                />
              )}

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
                  variant={option.text.trim() ? 'body1' : 'body2'}
                  sx={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    color: option.text.trim() ? 'inherit' : 'red'
                  }}
                >
                  {option.text.trim() || '* Empty'}
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
            color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#000' : 'red', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
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
                backgroundColor: option.text.trim() ? 'lightblue' : 'rgba(240, 182, 182, 0.5)',
                borderRadius: '4px',
                width: '100%',
                height: '40px',
                cursor: 'pointer'
              }}
            >
              {option.correct ? (
                <CheckBoxRounded size='small' color='primary' />
              ) : (
                <CheckBoxOutlineBlankTwoTone
                  size='small'
                  // color='primary'
                />
              )}

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
                  variant={option.text.trim() ? 'body1' : 'body2'}
                  sx={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    color: option.text.trim() ? 'inherit' : 'red'
                  }}
                >
                  {option.text.trim() || '* Empty'}
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
        <Box mt={2} className='flex flex-wrap'>
          <Typography color={questionObj.length === 0 && 'red'} fontWeight='bold' variant='h6' component='span' mr={1}>
            {questionNumber}.
          </Typography>
          {questionObj?.map((part, index) => (
            <Box key={index} className='flex flex-wrap' sx={{ mr: 1 }}>
              {part.type === 'text' ? (
                // Display text part
                <Typography fontWeight='bold' variant='h6' color={part.content.trim() ? '' : 'red'} component='span'>
                  {part.content.trim() || '* Empty text'}
                </Typography>
              ) : (
                // Display blank space
                <Box
                  component='span'
                  sx={{
                    display: 'inline-block',
                    borderBottom: '1px solid gray',
                    bgcolor: part.content.trim() ? 'rgba(0,0,0,0.05)' : 'rgba(240, 182, 182, 0.5)',
                    color: part.content.trim() ? 'inherit' : 'red',
                    width: '80px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    height: '24px',
                    verticalAlign: 'bottom',
                    fontSize: '14px',
                    mx: 0.5
                  }}
                >
                  {part.content.trim() || '* blank'}
                  {/* Placeholder for blank */}
                </Box>
              )}
            </Box>
          ))}
          {questionObj.length === 0 && (
            <Typography variant='h6' color='red' fontWeight='bold' component='span'>
              * Question is not completed
            </Typography>
          )}
        </Box>
      </Typography>

      {/* Subtitle */}
      <Typography variant='body2' mt={2} fontSize='11px' color='text.secondary'>
        Fill in the blanks
      </Typography>

      {/* <Grid container sx={{ width: '100%', marginBottom: '0px', marginLeft: 1, marginTop: '6px' }} spacing={2}>
        <Typography variant='subtitle1' className='flex items-end'>
          Fill in the blank{' '}
          <Box sx={{ borderBottom: '1px solid gray', bgcolor: 'rgba(0,0,0,0.05)', mx: 2 }} width='120px' height={30} />
        </Typography>
      </Grid> */}
    </CardContent>
  )
}

export const DummyTrueOrFalseTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  console.log(question)
  const trueOption = question?.data?.options.find(op => op.id === 'true')
  const falseOption = question?.data?.options.find(op => op.id === 'false')
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
            color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#000' : 'red', // Text is clearly visible
            fontWeight: 'bold',
            position: 'relative',
            zIndex: 1 // Places text above icons
          }}
          variant='h6'
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
              control={<Radio size='small' readOnly checked={trueOption.correct} />}
              label={'True'}
              sx={{
                backgroundColor: trueOption?.text || trueOption?.image ? 'lightgreen' : '',
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
              control={<Radio size='small' readOnly checked={falseOption?.correct} />}
              label={'False'}
              sx={{
                backgroundColor: falseOption?.text || falseOption?.image ? 'lightcoral' : '',
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
