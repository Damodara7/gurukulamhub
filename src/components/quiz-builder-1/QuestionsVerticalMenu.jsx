import React from 'react'
import { 
  Card, 
  Box, 
  Typography, 
  Button, 
  Alert,
  Tooltip,
  Badge,
  IconButton
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
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
  validationErrors = []
}) {
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
      {/* Place Create New at the top. To move to bottom, move this block below the scrollable Box. */}
      <Card
        sx={{
          m: 1,
          mb: 2,
          py: 1.5,
          px: 3,
          minHeight: 48,
          alignSelf: 'stretch',
          width: '97%',
          cursor: 'pointer',
          border: hasClickedNew ? '2px solid' : '2px solid',
          borderColor: hasClickedNew ? '#667eea' : '#667eea',
          borderRadius: '12px',
          backgroundColor: hasClickedNew ? '#667eea' : 'white',
          color: hasClickedNew ? 'white' : '#667eea',
          boxShadow: hasClickedNew ? '0 4px 15px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(102, 126, 234, 0.15)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          fontWeight: 700,
          fontSize: '1rem',
          transition: 'all 0.3s ease',
          outline: 'none',
          mx: 'auto',
          '&:hover': {
            backgroundColor: '#667eea',
            color: 'white',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            '& .MuiSvgIcon-root': {
              color: 'white'
            },
            '& .MuiTypography-root': {
              color: 'white'
            }
          },
        }}
        onClick={() => onClickNew()}
        tabIndex={0}
        role="button"
        aria-label="Create New Question"
      >
        <AddCircleOutlineIcon sx={{ fontSize: 28, color: hasClickedNew ? 'white' : '#667eea', transition: 'color 0.3s ease' }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1, color: 'inherit', transition: 'color 0.3s ease' }}>
          + Create New
        </Typography>
      </Card>
      {/* Scrollable questions list */}
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, minHeight: 0 }}>
        {loading.primaryQuestions && <Loading />}
        {!loading.primaryQuestions && questions?.map((question, index) => {
          const errors = getQuestionErrors(question._id)
          const hasErrors = errors.length > 0
          return (
            <Card
              key={question._id}
              sx={{
                m: 1,
                mb: 2,
                width: '97%',
                cursor: 'pointer',
                border: selectedQuestion?._id === question._id ? '2px solid' : '1px solid',
                borderColor: hasErrors 
                  ? '#ef4444' 
                  : selectedQuestion?._id === question._id 
                    ? '#667eea' 
                    : '#d0d0d0',
                borderRadius: '12px',
                backgroundColor: hasErrors 
                  ? 'rgba(239, 68, 68, 0.05)' 
                  : selectedQuestion?._id === question._id 
                    ? 'rgba(102, 126, 234, 0.05)' 
                    : 'white',
                boxShadow: selectedQuestion?._id === question._id 
                  ? '0 4px 15px rgba(102, 126, 234, 0.25)' 
                  : hasErrors 
                    ? '0 2px 8px rgba(239, 68, 68, 0.15)' 
                    : '0 1px 4px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                transform: selectedQuestion?._id === question._id ? 'translateX(4px)' : 'none',
                position: 'relative',
                '&:hover': {
                  borderColor: hasErrors ? '#ef4444' : '#667eea',
                  borderWidth: '2px',
                  transform: 'translateX(4px)',
                  boxShadow: hasErrors 
                    ? '0 4px 15px rgba(239, 68, 68, 0.25)' 
                    : '0 4px 15px rgba(102, 126, 234, 0.25)'
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
      {/* To place Create New at the bottom, move the Card here and remove it from the top. */}
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
