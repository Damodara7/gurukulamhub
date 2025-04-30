import React from 'react'

import { Box, Button, Fab, Tooltip, useTheme, useMediaQuery } from '@mui/material'

const LanguageDropDown = ({
  selectedSecondaryQuestion,
  handleQuestionClick,
  onAddNew,
  primaryQuestion,
  secQuestions
}) => {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  var secondaryQuestions = primaryQuestion?.data?.secondaryQuestions
  secondaryQuestions = [
    {
      id: 1,
      languageId: 'om',
      languageName: 'Oriya',
      data: {
        secondaryQuestions: [
          { id: 1, languageId: 'om', question: 'ମୁଁ ପ୍ରଭୁମାନଙ୍କୁ କେଉଁ କାରଣ ଅନୁମତି ଦେଇଛି?', answer: 'ମୁଁ ପ୍ରଭୁମାନଙ୍କ' }
        ]
      }
    }
  ]
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          gap: '15px'
          // overflowY: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2,
            border: '1px dashed',
            borderColor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isMdUp ? '100px' : 'auto'
          }}
        >
          <Fab style={{ backgroundColor: 'white' }} variant='outlined' onClick={() => onAddNew()}>
            Add New
          </Fab>
        </Box>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', overflowX: 'auto' }}>
          {secQuestions?.map(question => {
            const isSelectedQuestion = selectedSecondaryQuestion?.id === question.id
            const languageCode = question?.language.split('|')[0]
            const languageName = question?.language.split('|')[1]
            return (
              <Box
                key={question.language}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: theme.palette.primary.main,
                  backgroundColor: isSelectedQuestion ? theme.palette.primary.dark : 'transparent',
                  cursor: 'move',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: isMdUp ? '100px' : 'auto',
                  color: isSelectedQuestion ? 'white' : theme.palette.primary.dark
                }}
              >
                <label>
                  <Fab
                    style={{
                      color: isSelectedQuestion ? theme.palette.primary.main : 'white',
                      backgroundColor: isSelectedQuestion ? 'white' : theme.palette.primary.main
                    }}
                    // color='primary'
                    variant='contained'
                    onClick={() => {
                      console.log('QUESTION CLICKED')
                      handleQuestionClick(question)
                    }}
                  >
                    {languageCode}
                  </Fab>
                </label>
                <Tooltip title={languageName}>{languageName}</Tooltip>
              </Box>
            )
          })}
        </div>
      </Box>
    </>
  )
}

export default LanguageDropDown
