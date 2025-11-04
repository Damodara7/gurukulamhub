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
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Chip,
  Divider
} from '@mui/material'
import VideoAd from '@/views/apps/advertisements/VideoAd/VideoAd'
import ImagePopup from '../ImagePopup'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import {
  CheckBoxOutlineBlankTwoTone,
  CheckBoxRounded,
  RadioButtonCheckedRounded,
  RadioButtonUnchecked
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SpaceBarIcon from '@mui/icons-material/SpaceBar'

export const SingleChoiceTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  
  return (
    <CardContent sx={{ p: 4, bgcolor: 'background.default' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2.5,
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box sx={{ 
              width: 4, 
              height: 24, 
              bgcolor: 'primary.main',
              borderRadius: 2
            }} />
            Single Choice Question
          </Typography>
          {questionObj?.mediaType && (
            <Chip 
              label={questionObj.mediaType.replace('-', ' + ')}
              size="small"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>

        {/* Question Content */}
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {(questionObj?.mediaType === 'text' ||
            questionObj?.mediaType === 'text-image' ||
            questionObj?.mediaType === 'text-video') && (
            <Typography 
              variant='h5' 
              fontWeight={600}
              sx={{ 
                color: questionObj?.text?.trim() ? 'text.primary' : 'error.main',
                lineHeight: 1.7,
                mb: questionObj?.image || questionObj?.video ? 3 : 0
              }}
            >
              {questionObj?.text?.trim() || '* Question is not completed'}
            </Typography>
          )}
          
          {questionObj?.mediaType === 'video' && (
            <Typography variant='h5' fontWeight={600} sx={{ color: 'text.primary', mb: 3 }}>
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
                maxWidth: '600px',
                maxHeight: '400px',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          )}
          
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj.video && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2, 
              border: '2px solid', 
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
              </Box>
            </Box>
          )}
          
          {!questionObj && (
            <Typography variant='h5' color='error.main' fontWeight={600}>
              * Question is not completed!
            </Typography>
          )}
        </Box>

        {/* Options */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5, color: 'text.primary' }}>
            Answer Options
          </Typography>
          <RadioGroup>
            <Grid container spacing={2.5}>
              {question?.data?.options.map((option, index) => {
                const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
                return (
                  <Grid item xs={12} sm={6} lg={3} key={option.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '2px solid',
                        borderColor: option.correct ? 'success.main' : alpha(theme.palette.primary.main, 0.3),
                        borderRadius: 2,
                        p: 0,
                        height: '100%',
                        minHeight: 140,
                        bgcolor: 'background.paper',
                        boxShadow: option.correct 
                          ? `0 6px 20px ${alpha(theme.palette.success.main, 0.25)}`
                          : '0 3px 12px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: option.correct ? 'success.dark' : 'primary.main',
                          boxShadow: option.correct
                            ? `0 8px 28px ${alpha(theme.palette.success.main, 0.35)}`
                            : `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                        }
                      }}
                    >
                      {/* Header with Label */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: option.correct 
                          ? alpha(theme.palette.success.main, 0.12)
                          : alpha(theme.palette.primary.main, 0.08),
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: option.correct ? 'success.main' : 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: option.correct
                              ? `0 2px 8px ${alpha(theme.palette.success.main, 0.4)}`
                              : `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                          }}>
                            {optionLabels[index]}
                          </Box>
                          <Radio
                            disabled
                            checked={option.correct}
                            size="small"
                            sx={{ 
                              color: option.correct ? 'success.main' : 'action.disabled',
                              '&.Mui-checked': { color: 'success.main' }
                            }}
                          />
                        </Stack>
                        {option.correct && (
                          <Chip 
                            label="✓" 
                            size="small"
                            sx={{
                              bgcolor: 'success.main',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              height: 24,
                              width: 24,
                              borderRadius: '50%',
                              '& .MuiChip-label': { px: 0 }
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Content */}
                      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {option.mediaType === 'image' && option.image ? (
                          <Box
                            component='img'
                            src={option.image}
                            alt={option.text}
                            sx={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: 1.5,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          />
                        ) : (
                          <Typography variant='body1' fontWeight={500} sx={{ 
                            color: 'text.primary',
                            lineHeight: 1.6,
                            textAlign: 'center'
                          }}>
                            {option.text}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </RadioGroup>
        </Box>
      </Stack>
    </CardContent>
  )
}

export const MultipleChoiceTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  
  return (
    <CardContent sx={{ p: 4, bgcolor: 'background.default' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2.5,
          borderBottom: '2px solid',
          borderColor: 'secondary.main'
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ 
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box sx={{ 
              width: 4, 
              height: 24, 
              bgcolor: 'secondary.main',
              borderRadius: 2
            }} />
            Multiple Choice Question
          </Typography>
          {questionObj?.mediaType && (
            <Chip 
              label={questionObj.mediaType.replace('-', ' + ')}
              size="small"
              sx={{ 
                bgcolor: 'secondary.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>

        {/* Question Content */}
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {(questionObj?.mediaType === 'text' ||
            questionObj?.mediaType === 'text-image' ||
            questionObj?.mediaType === 'text-video') && (
            <Typography 
              variant='h5' 
              fontWeight={600}
              sx={{ 
                color: questionObj?.text?.trim() ? 'text.primary' : 'error.main',
                lineHeight: 1.7,
                mb: questionObj?.image || questionObj?.video ? 3 : 0
              }}
            >
              {questionObj?.text?.trim() || '* Question is not completed'}
            </Typography>
          )}
          
          {questionObj?.mediaType === 'video' && (
            <Typography variant='h5' fontWeight={600} sx={{ color: 'text.primary', mb: 3 }}>
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
                maxWidth: '600px',
                maxHeight: '400px',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          )}
          
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj.video && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2, 
              border: '2px solid', 
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
              </Box>
            </Box>
          )}
          
          {!questionObj && (
            <Typography variant='h5' color='error.main' fontWeight={600}>
              * Question is not completed!
            </Typography>
          )}
        </Box>

        {/* Options */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5, color: 'text.primary' }}>
            Answer Options (Select all that apply)
          </Typography>
          <Grid container spacing={2.5}>
            {question?.data?.options.map((option, index) => {
              const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
              return (
                <Grid item xs={12} sm={6} lg={3} key={option.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      border: '2px solid',
                      borderColor: option.correct ? 'success.main' : alpha(theme.palette.secondary.main, 0.3),
                      borderRadius: 2,
                      p: 0,
                      height: '100%',
                      minHeight: 140,
                      bgcolor: 'background.paper',
                      boxShadow: option.correct 
                        ? `0 6px 20px ${alpha(theme.palette.success.main, 0.25)}`
                        : '0 3px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: option.correct ? 'success.dark' : 'secondary.main',
                        boxShadow: option.correct
                          ? `0 8px 28px ${alpha(theme.palette.success.main, 0.35)}`
                          : `0 6px 20px ${alpha(theme.palette.secondary.main, 0.2)}`
                      }
                    }}
                  >
                    {/* Header with Label */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: option.correct 
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.secondary.main, 0.08),
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: option.correct ? 'success.main' : 'secondary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: option.correct
                            ? `0 2px 8px ${alpha(theme.palette.success.main, 0.4)}`
                            : `0 2px 8px ${alpha(theme.palette.secondary.main, 0.3)}`
                        }}>
                          {optionLabels[index]}
                        </Box>
                        <Checkbox
                          disabled
                          checked={option.correct}
                          size="small"
                          sx={{ 
                            color: option.correct ? 'success.main' : 'action.disabled',
                            '&.Mui-checked': { color: 'success.main' }
                          }}
                        />
                      </Stack>
                      {option.correct && (
                        <Chip 
                          label="✓" 
                          size="small"
                          sx={{
                            bgcolor: 'success.main',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            height: 24,
                            width: 24,
                            borderRadius: '50%',
                            '& .MuiChip-label': { px: 0 }
                          }}
                        />
                      )}
                    </Box>
                    
                    {/* Content */}
                    <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {option.mediaType === 'image' && option.image ? (
                        <Box
                          component='img'
                          src={option.image}
                          alt={option.text}
                          sx={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      ) : (
                        <Typography variant='body1' fontWeight={500} sx={{ 
                          color: 'text.primary',
                          lineHeight: 1.6,
                          textAlign: 'center'
                        }}>
                          {option.text}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Stack>
    </CardContent>
  )
}

export const TrueOrFalseTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  
  return (
    <CardContent sx={{ p: 4, bgcolor: 'background.default' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2.5,
          borderBottom: '2px solid',
          borderColor: 'info.main'
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ 
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box sx={{ 
              width: 4, 
              height: 24, 
              bgcolor: 'info.main',
              borderRadius: 2
            }} />
            True / False Question
          </Typography>
          {questionObj?.mediaType && (
            <Chip 
              label={questionObj.mediaType.replace('-', ' + ')}
              size="small"
              sx={{ 
                bgcolor: 'info.main',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            />
          )}
        </Box>

        {/* Question Content */}
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {(questionObj?.mediaType === 'text' ||
            questionObj?.mediaType === 'text-image' ||
            questionObj?.mediaType === 'text-video') && (
            <Typography 
              variant='h5' 
              fontWeight={600}
              sx={{ 
                color: questionObj?.text?.trim() ? 'text.primary' : 'error.main',
                lineHeight: 1.7,
                mb: questionObj?.image || questionObj?.video ? 3 : 0
              }}
            >
              {questionObj?.text?.trim() || '* Question is not completed'}
            </Typography>
          )}
          
          {questionObj?.mediaType === 'video' && (
            <Typography variant='h5' fontWeight={600} sx={{ color: 'text.primary', mb: 3 }}>
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
                maxWidth: '600px',
                maxHeight: '400px',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          )}
          
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2, 
              border: '2px solid', 
              borderColor: 'divider',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <VideoAd url={questionObj.video || ''} showPause autoPlay={false} />
              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                <ImagePopup imageUrl={questionObj.video || ''} mediaType={'video'} />
              </Box>
            </Box>
          )}
          
          {!questionObj && (
            <Typography variant='h5' color='error.main' fontWeight={600}>
              * Question is not completed!
            </Typography>
          )}
        </Box>

        {/* Options */}
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5, color: 'text.primary' }}>
            Answer Options
          </Typography>
          <RadioGroup>
            <Grid container spacing={3}>
              {question?.data?.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={option.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                      border: '2px solid',
                      borderColor: option.correct ? 'success.main' : alpha(theme.palette.info.main, 0.3),
                      borderRadius: 2,
                      p: 0,
                      bgcolor: 'background.paper',
                      boxShadow: option.correct 
                        ? `0 6px 20px ${alpha(theme.palette.success.main, 0.25)}`
                        : '0 3px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: option.correct ? 'success.dark' : 'info.main',
                        boxShadow: option.correct
                          ? `0 8px 28px ${alpha(theme.palette.success.main, 0.35)}`
                          : `0 6px 20px ${alpha(theme.palette.info.main, 0.2)}`
                      }
                    }}
                  >
                    {/* Icon Section */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      bgcolor: option.correct 
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.info.main, 0.08),
                      borderRight: '1px solid',
                      borderColor: 'divider',
                      minWidth: 80
                    }}>
                      {option.id === 'true' ? (
                        <CheckCircleIcon sx={{ 
                          fontSize: 40, 
                          color: option.correct ? 'success.main' : alpha(theme.palette.info.main, 0.6),
                          filter: option.correct ? `drop-shadow(0 2px 6px ${alpha(theme.palette.success.main, 0.4)})` : 'none'
                        }} />
                      ) : (
                        <CancelIcon sx={{ 
                          fontSize: 40, 
                          color: option.correct ? 'success.main' : alpha(theme.palette.info.main, 0.6),
                          filter: option.correct ? `drop-shadow(0 2px 6px ${alpha(theme.palette.success.main, 0.4)})` : 'none'
                        }} />
                      )}
                    </Box>
                    
                    {/* Text Section */}
                    <Box sx={{ p: 2.5, flex: 1 }}>
                      <Stack spacing={1}>
                        <Typography variant='h5' fontWeight={600} sx={{ color: 'text.primary' }}>
                          {option.text}
                        </Typography>
                        {option.correct && (
                          <Chip 
                            label="✓ Correct Answer" 
                            size="small"
                            sx={{
                              bgcolor: 'success.main',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 24,
                              width: 'fit-content',
                              '& .MuiChip-label': { px: 1.5 }
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </Box>
      </Stack>
    </CardContent>
  )
}

export const FillInTheBlanksTemplate = ({ question }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  const blankCount = questionObj?.filter(p => p.type === 'blank').length || 0

  return (
    <CardContent sx={{ p: 4, bgcolor: 'background.default' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2.5,
          borderBottom: '2px solid',
          borderColor: 'warning.main'
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ 
            color: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Box sx={{ 
              width: 4, 
              height: 24, 
              bgcolor: 'warning.main',
              borderRadius: 2
            }} />
            Fill in the Blanks Question
          </Typography>
          <Chip 
            label={`${blankCount} Blank${blankCount !== 1 ? 's' : ''}`}
            size="small"
            sx={{ 
              bgcolor: 'warning.main',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {/* Question Content */}
        <Box sx={{
          p: 3.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {questionObj?.length === 0 ? (
            <Typography variant='h5' color='error.main' fontWeight={600}>
              * Question is not completed
            </Typography>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              alignItems: 'center',
              lineHeight: 2.5
            }}>
              {questionObj?.map((part, index) => (
                <Box key={part.id} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  {part.type === 'text' ? (
                    <Typography 
                      variant='h5' 
                      component='span' 
                      fontWeight={500}
                      sx={{ 
                        color: part.content.trim() ? 'text.primary' : 'error.main',
                        lineHeight: 1.8,
                        fontSize: '1.3rem'
                      }}
                    >
                      {part.content.trim() || '* Empty text'}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 2.5,
                        py: 1,
                        borderRadius: 1.5,
                        bgcolor: part.content.trim() 
                          ? alpha(theme.palette.warning.main, 0.1)
                          : alpha(theme.palette.error.main, 0.1),
                        border: '2px solid',
                        borderColor: part.content.trim()
                          ? 'warning.main'
                          : 'error.main',
                        minWidth: 120,
                        boxShadow: part.content.trim()
                          ? `0 2px 8px ${alpha(theme.palette.warning.main, 0.2)}`
                          : `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`,
                        position: 'relative',
                        '&::after': part.content.trim() ? {
                          content: '""',
                          position: 'absolute',
                          bottom: -2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '70%',
                          height: 2,
                          bgcolor: 'warning.main',
                          borderRadius: 1
                        } : {}
                      }}
                    >
                      <Typography 
                        variant='h6' 
                        fontWeight={700}
                        sx={{ 
                          color: part.content.trim() ? 'warning.dark' : 'error.main',
                          fontSize: '1.1rem'
                        }}
                      >
                        {part.content.trim() || '______'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Info */}
        <Box sx={{ 
          p: 2.5, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.info.main, 0.06),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.25),
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Typography variant="body1" sx={{ color: 'info.dark', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{ fontSize: '1.2rem' }}>💡</Box>
            Players will need to fill in the <Box component="span" sx={{ 
              fontWeight: 700, 
              color: 'warning.main'
            }}>highlighted blanks</Box> with correct answers.
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  )
}

export const DummySingleChoiceTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  
  return (
    <CardContent sx={{ p: 1.5 }} key={question._id}>
      <Stack spacing={1.5}>
        {/* Question Header */}
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant='subtitle1'
            fontWeight={700}
            noWrap
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#202124' : 'error.main',
              pr: 5
            }}
          >
            {questionNumber}. {' '}
            {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
              ? questionObj.text
              : questionObj?.mediaType === 'text-video' && questionObj?.text
                ? questionObj.text
                : questionObj?.mediaType === 'video'
                  ? 'Watch the video carefully'
                  : questionObj?.mediaType === 'image'
                    ? null
                    : '* Question is not completed!'}
          </Typography>

          {/* Media Type Icons */}
          {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
            <ImageIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'info.main',
                fontSize: '24px'
              }}
            />
          )}
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <VideoLibraryIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'error.main',
                fontSize: '24px'
              }}
            />
          )}
        </Box>

        {/* Type Badge */}
        <Chip 
          label="Single Choice" 
          size="small"
          sx={{ 
            width: 'fit-content',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main'
          }}
        />

        {/* Options Preview */}
        <Grid container spacing={1}>
          {question?.data?.options.map(option => (
            <Grid item xs={6} key={option.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 0.75,
                  bgcolor: option.text.trim() 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.error.main, 0.1),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: option.correct
                    ? theme.palette.success.main
                    : 'transparent',
                  minHeight: 32
                }}
              >
                {option.correct ? (
                  <RadioButtonCheckedRounded sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.secondary' }} />
                )}
                {option.mediaType === 'image' && option?.image ? (
                  <Box
                    component='img'
                    src={option.image}
                    alt={option.text}
                    sx={{
                      width: 32,
                      height: 32,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Typography
                    variant='caption'
                    fontWeight={500}
                    noWrap
                    sx={{
                      flex: 1,
                      color: option.text.trim() ? 'text.primary' : 'error.main'
                    }}
                  >
                    {option.text.trim() || '* Empty'}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </CardContent>
  )
}

export const DummyMultipleChoiceTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  
  return (
    <CardContent sx={{ p: 1.5 }} key={question._id}>
      <Stack spacing={1.5}>
        {/* Question Header */}
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant='subtitle1'
            fontWeight={700}
            noWrap
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#202124' : 'error.main',
              pr: 5
            }}
          >
            {questionNumber}. {' '}
            {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
              ? questionObj.text
              : questionObj?.mediaType === 'text-video' && questionObj?.text
                ? questionObj.text
                : questionObj?.mediaType === 'video'
                  ? 'Watch the video carefully'
                  : questionObj?.mediaType === 'image'
                    ? null
                    : '* Question is not completed!'}
          </Typography>

          {/* Media Type Icons */}
          {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
            <ImageIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'info.main',
                fontSize: '24px'
              }}
            />
          )}
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <VideoLibraryIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'error.main',
                fontSize: '24px'
              }}
            />
          )}
        </Box>

        {/* Type Badge */}
        <Chip 
          label="Multiple Choice" 
          size="small"
          sx={{ 
            width: 'fit-content',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
            color: 'secondary.main'
          }}
        />

        {/* Options Preview */}
        <Grid container spacing={1}>
          {question?.data?.options.map((option, index) => (
            <Grid item xs={6} key={option.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 0.75,
                  bgcolor: option.text.trim() 
                    ? alpha(theme.palette.secondary.main, 0.08)
                    : alpha(theme.palette.error.main, 0.1),
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: option.correct
                    ? theme.palette.success.main
                    : 'transparent',
                  minHeight: 32
                }}
              >
                {option.correct ? (
                  <CheckBoxRounded sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <CheckBoxOutlineBlankTwoTone sx={{ fontSize: 16, color: 'text.secondary' }} />
                )}
                {option.mediaType === 'image' && option?.image ? (
                  <Box
                    component='img'
                    src={option.image}
                    alt={option.text}
                    sx={{
                      width: 32,
                      height: 32,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <Typography
                    variant='caption'
                    fontWeight={500}
                    noWrap
                    sx={{
                      flex: 1,
                      color: option.text.trim() ? 'text.primary' : 'error.main'
                    }}
                  >
                    {option.text.trim() || '* Empty'}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </CardContent>
  )
}

export const DummyFillInTheBlanksTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  const blankCount = questionObj?.filter(p => p.type === 'blank').length || 0

  return (
    <CardContent sx={{ p: 1.5 }} key={question._id}>
      <Stack spacing={1.5}>
        {/* Question Header with Number */}
        <Stack direction="row" alignItems="flex-start" spacing={0.5}>
          <Typography variant='subtitle1' fontWeight={700} sx={{ color: '#202124' }}>
            {questionNumber}.
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
            {questionObj?.length === 0 ? (
              <Typography variant='subtitle1' color='error.main' fontWeight={700}>
                * Question is not completed
              </Typography>
            ) : (
              questionObj?.map((part, index) => (
                <Box key={index} sx={{ display: 'inline-flex' }}>
                  {part.type === 'text' ? (
                    <Typography
                      variant='subtitle1'
                      component='span'
                      fontWeight={500}
                      sx={{ color: part.content.trim() ? '#202124' : 'error.main' }}
                    >
                      {part.content.trim() || '* Empty'}
                    </Typography>
                  ) : (
                    <Box
                      component='span'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: part.content.trim() 
                          ? alpha(theme.palette.warning.main, 0.15)
                          : alpha(theme.palette.error.main, 0.15),
                        border: '1px solid',
                        borderColor: part.content.trim()
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                        minWidth: 60
                      }}
                    >
                      <Typography
                        variant='caption'
                        fontWeight={700}
                        noWrap
                        sx={{
                          color: part.content.trim() ? 'warning.dark' : 'error.main',
                          maxWidth: 80
                        }}
                      >
                        {part.content.trim() || '_____'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))
            )}
          </Box>
        </Stack>

        {/* Type Badge */}
        <Stack direction="row" spacing={1}>
          <Chip 
            label="Fill in Blanks" 
            size="small"
            sx={{ 
              width: 'fit-content',
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              color: 'warning.main'
            }}
          />
          <Chip 
            label={`${blankCount} blank${blankCount !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            sx={{ 
              height: 20,
              fontSize: '0.6rem',
              fontWeight: 600
            }}
          />
        </Stack>
      </Stack>
    </CardContent>
  )
}

export const DummyTrueOrFalseTemplate = ({ question, title, questionNumber }) => {
  const questionObj = question?.data?.question
  const theme = useTheme()
  const trueOption = question?.data?.options.find(op => op.id === 'true')
  const falseOption = question?.data?.options.find(op => op.id === 'false')
  
  return (
    <CardContent sx={{ p: 1.5 }} key={question._id}>
      <Stack spacing={1.5}>
        {/* Question Header */}
        <Box sx={{ position: 'relative' }}>
          <Typography
            variant='subtitle1'
            fontWeight={700}
            noWrap
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: questionObj && (questionObj.text || questionObj.image || questionObj.video) ? '#202124' : 'error.main',
              pr: 5
            }}
          >
            {questionNumber}. {' '}
            {(questionObj?.mediaType === 'text' || questionObj?.mediaType === 'text-image') && questionObj?.text
              ? questionObj.text
              : questionObj?.mediaType === 'text-video' && questionObj?.text
                ? questionObj.text
                : questionObj?.mediaType === 'video'
                  ? 'Watch the video carefully'
                  : questionObj?.mediaType === 'image'
                    ? null
                    : '* Question is not completed!'}
          </Typography>

          {/* Media Type Icons */}
          {(questionObj?.mediaType === 'image' || questionObj?.mediaType === 'text-image') && questionObj?.image && (
            <ImageIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'info.main',
                fontSize: '24px'
              }}
            />
          )}
          {(questionObj?.mediaType === 'video' || questionObj?.mediaType === 'text-video') && questionObj?.video && (
            <VideoLibraryIcon
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'error.main',
                fontSize: '24px'
              }}
            />
          )}
        </Box>

        {/* Type Badge */}
        <Chip 
          label="True/False" 
          size="small"
          sx={{ 
            width: 'fit-content',
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            color: 'info.main'
          }}
        />

        {/* Options Preview */}
        <RadioGroup>
          <Stack spacing={0.75}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.75,
                bgcolor: (trueOption?.text || trueOption?.image)
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.grey[500], 0.1),
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: trueOption?.correct 
                  ? theme.palette.success.main
                  : 'transparent',
                minHeight: 32
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 18, color: trueOption?.correct ? 'success.main' : 'text.secondary' }} />
              <Typography variant='caption' fontWeight={600}>
                {trueOption?.text || 'True'}
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.75,
                bgcolor: (falseOption?.text || falseOption?.image)
                  ? alpha(theme.palette.error.main, 0.1)
                  : alpha(theme.palette.grey[500], 0.1),
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: falseOption?.correct
                  ? theme.palette.success.main
                  : 'transparent',
                minHeight: 32
              }}
            >
              <CancelIcon sx={{ fontSize: 18, color: falseOption?.correct ? 'success.main' : 'text.secondary' }} />
              <Typography variant='caption' fontWeight={600}>
                {falseOption?.text || 'False'}
              </Typography>
            </Box>
          </Stack>
        </RadioGroup>
      </Stack>
    </CardContent>
  )
}
