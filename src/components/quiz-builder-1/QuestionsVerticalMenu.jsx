import React, { useState } from 'react'
import { 
  Card, 
  Box, 
  Typography, 
  Button, 
  Alert,
  Tooltip,
  Badge,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Collapse,
  Divider
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import {
  DummySingleChoiceTemplate,
  DummyMultipleChoiceTemplate,
  DummyTrueOrFalseTemplate,
  DummyFillInTheBlanksTemplate
} from '@/components/quizbuilder/Templates'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import Loading from '../Loading'

export default function QuestionsVerticalMenu({
  questions,
  onSelect,
  onClickNew,
  selectedQuestion,
  hasClickedNew,
  loading,
  validationErrors = [],
  isCollapsed = false,
  onToggleCollapse
}) {
  const theme = useTheme()
  
  const getQuestionErrors = (questionId) => {
    return validationErrors.filter(error => error.questionId === questionId)
  }

  const renderDummyTemplate = (question, title, questionNumber) => {
    const errors = getQuestionErrors(question._id)
    const hasErrors = errors.length > 0
    
    return (
      <Box sx={{ position: 'relative' }}>
        {hasErrors && (
          <IconButtonTooltip 
            title={
              <Box>
                {errors.map((err, i) => (
                  <div key={i} className='flex gap-2 items-start'>
                    <span>{i+1}. </span>
                    <span>{err.field} - {err.message}</span>
                    </div>
                ))}
              </Box>
            }
            
            tooltipProps = {{placement:"right", arrow: true}}
            sx={{ 
              position: 'absolute', 
              bottom: 8, 
              right: 8,
              color: 'error.main',
              zIndex: 1
            }}
            size="small"
          >
              <ErrorOutlineIcon />
          </IconButtonTooltip>
        )}
        
        <Box sx={{ opacity: hasErrors ? 0.8 : 1, maxWidth: '250px', maxHeight: '250px', overflowY:'hidden' }}>
          {(() => {
            switch (question.templateId) {
              case 'single-choice':
                return <DummySingleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
              case 'multiple-choice':
                return <DummyMultipleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
              case 'true-or-false':
                return <DummyTrueOrFalseTemplate question={question} title={title} questionNumber={questionNumber} />
              case 'fill-in-blank':
                return <DummyFillInTheBlanksTemplate question={question} title={title} questionNumber={questionNumber} />
              default:
                return <Typography>No Template Found</Typography>
            }
          })()}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header with Toggle */}
      <Box
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          alignItems: 'center'
        }}
      >
        {!isCollapsed && (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QuestionMarkIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
              Questions
            </Typography>
          </Stack>
        )}
        
        <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'} arrow>
          <IconButton
            onClick={() => onToggleCollapse(!isCollapsed)}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Expanded State - Full Menu */}
      {!isCollapsed && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Create New Button */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e8eaed' }}>
            <Button
              variant={hasClickedNew ? 'contained' : 'outlined'}
              component='label'
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => onClickNew()}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: '2px solid',
                borderColor: theme.palette.primary.main,
                bgcolor: hasClickedNew ? theme.palette.primary.main : 'white',
                color: hasClickedNew ? 'white' : theme.palette.primary.main,
                boxShadow: hasClickedNew 
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  : 'none',
                '&:hover': {
                  borderWidth: '2px'
                }
              }}
            >
              Create New
            </Button>
          </Box>
          
          {/* Scrollable questions list */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, minHeight: 0 }}>
            {loading.primaryQuestions && <Loading />}
            {!loading.primaryQuestions && questions?.length === 0 && (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <QuestionMarkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No questions yet
                </Typography>
              </Box>
            )}
            {!loading.primaryQuestions && questions?.map((question, index) => {
              const errors = getQuestionErrors(question._id)
              const hasErrors = errors.length > 0
              return (
                <Card
                  key={question._id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: hasErrors 
                      ? theme.palette.error.main
                      : selectedQuestion?._id === question._id 
                        ? theme.palette.primary.main
                        : '#e8eaed',
                    borderRadius: 2,
                    bgcolor: hasErrors 
                      ? alpha(theme.palette.error.main, 0.05)
                      : selectedQuestion?._id === question._id 
                        ? alpha(theme.palette.primary.main, 0.05)
                        : 'white',
                    boxShadow: selectedQuestion?._id === question._id 
                      ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                      : hasErrors 
                        ? `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: selectedQuestion?._id === question._id ? 'translateX(4px)' : 'none',
                    position: 'relative',
                    '&:hover': {
                      borderColor: hasErrors ? theme.palette.error.main : theme.palette.primary.main,
                      transform: 'translateX(4px)',
                      boxShadow: hasErrors 
                        ? `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                        : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                    }
                  }}
                  onClick={() => onSelect(question)}
                >
                  {renderDummyTemplate(
                    question,
                    `${index + 1}. ${question?.data?.question?.text || '* Question is not completed!'}`,
                    index + 1
                  )}
                </Card>
              )
            })}
          </Box>
        </Box>
      )}

      {/* Collapsed State - Question Numbers */}
      {isCollapsed && (
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            py: 2,
            px: 1
          }}
        >
          {loading.primaryQuestions && (
            <Box sx={{ py: 4 }}>
              <Typography variant="caption" color="text.secondary">
                ...
              </Typography>
            </Box>
          )}
          
          {!loading.primaryQuestions && questions?.length === 0 && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                0
              </Typography>
            </Box>
          )}
          
          {!loading.primaryQuestions && questions?.map((question, index) => {
            const errors = getQuestionErrors(question._id)
            const hasErrors = errors.length > 0
            const isSelected = selectedQuestion?._id === question._id
            
            return (
              <Tooltip 
                key={question._id}
                title={question?.data?.question?.text || 'Question ' + (index + 1)}
                placement="right"
                arrow
              >
                <Box
                  onClick={() => onSelect(question)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    border: '2px solid',
                    borderColor: hasErrors 
                      ? theme.palette.error.main
                      : isSelected 
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.3),
                    bgcolor: hasErrors
                      ? alpha(theme.palette.error.main, 0.1)
                      : isSelected
                        ? theme.palette.primary.main
                        : 'white',
                    color: isSelected ? 'white' : hasErrors ? theme.palette.error.main : theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: isSelected 
                      ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                      : hasErrors
                        ? `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`
                        : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: hasErrors ? theme.palette.error.main : theme.palette.primary.main,
                      bgcolor: hasErrors
                        ? alpha(theme.palette.error.main, 0.15)
                        : isSelected
                          ? theme.palette.primary.dark
                          : alpha(theme.palette.primary.main, 0.1),
                      transform: 'scale(1.1)',
                      boxShadow: hasErrors
                        ? `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`
                        : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  {index + 1}
                </Box>
              </Tooltip>
            )
          })}
        </Box>
      )}
    </Box>
  )
}


// import React, { useState } from 'react'
// import { Card, Box, Stack, Typography, Button, Alert } from '@mui/material'
// import {
//   DummySingleChoiceTemplate,
//   DummyMultipleChoiceTemplate,
//   DummyTrueOrFalseTemplate,
//   DummyFillInTheBlanksTemplate
// } from '@/components/quizbuilder/Templates'
// import CenterBox from '../CenterBox'
// import Loading from '../Loading'

// export default function QuestionsVerticalMenu({
//   questions,
//   onSelect,
//   onClickNew,
//   selectedQuestion,
//   hasClickedNew,
//   loading,
//   validationErrors = []
// }) {
//   const getQuestionErrors = (questionId) => {
//     return validationErrors.filter(error => error.questionId === questionId)
//   }

//   const renderDummyTemplate = (question, title, questionNumber) => {
//     const errors = getQuestionErrors(question._id)
//     const hasErrors = errors.length > 0

//     switch (question.templateId) {
//       case 'single-choice':
//         return <DummySingleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
//       case 'multiple-choice':
//         return <DummyMultipleChoiceTemplate question={question} title={title} questionNumber={questionNumber} />
//       case 'true-or-false':
//         return <DummyTrueOrFalseTemplate question={question} title={title} questionNumber={questionNumber} />
//       case 'fill-in-blank':
//         return <DummyFillInTheBlanksTemplate question={question} title={title} questionNumber={questionNumber} />
//       default:
//         return <Typography>No Template Found</Typography>
//     }
//   }

//   return (
//     <Box sx={{ maxHeight: '85vh', overflowY: 'auto' }}>
//       <Card
//         sx={{
//           m: 1,
//           mb: 2,
//           p: 2,
//           cursor: 'pointer',
//           border: hasClickedNew ? '3px solid' : '1px solid',
//           borderColor: hasClickedNew ? 'primary.main' : 'divider', // Enhanced border when selected
//           boxShadow: hasClickedNew ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : 'none', // Shadow for depth when selected
//           transition: 'box-shadow 0.3s ease, border-color 0.3s ease', // Smooth transition for the effect
//           transform: hasClickedNew ? 'scale(1.02)' : 'none', // Slightly larger when selected
//           textAlign: 'center'
//         }}
//         onClick={() => onClickNew()}
//       >
//         Create New
//       </Card>
//       {loading.primaryQuestions && <Loading />}
//       {!loading.primaryQuestions &&
//         questions?.map((question, index) => (
//           <Card
//             key={question._id}
//             sx={{
//               m: 1,
//               mb: 2,
//               // padding: '0px',
//               width: '97%',
//               // display: 'inline-block',
//               cursor: 'pointer',
//               border: selectedQuestion?._id === question._id ? '3px solid' : '1px solid',
//               borderColor: selectedQuestion?._id === question._id ? 'primary.main' : 'divider', // Enhanced border when selected
//               boxShadow: selectedQuestion?._id === question._id ? '0px 4px 20px rgba(0, 0, 0, 0.1)' : 'none', // Shadow for depth when selected
//               transition: 'box-shadow 0.3s ease, border-color 0.3s ease', // Smooth transition for the effect
//               transform: selectedQuestion?._id === question._id ? 'scale(1.02)' : 'none' // Slightly larger when selected
//             }}
//             onClick={() => onSelect(question)}
//           >
//             {renderDummyTemplate(
//               question,
//               `${index + 1}. ${question?.data?.question || '* Question is not completed!'}`,
//               index + 1
//             )}
//           </Card>
//         ))}
//     </Box>
//   )
// }
