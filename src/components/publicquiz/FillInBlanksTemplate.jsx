import { Card, CardContent, Typography, TextField, Box } from '@mui/material'
import { useState } from 'react'

const FillInBlanksTemplate = ({ question, onAnswer }) => {
  const questionObj = question?.data?.question

  const [blankAnswers, setBlankAnswers] = useState(
    questionObj
      .filter(part => part.type === 'blank')
      .map(part => ({
        ...part,
        content: ''
      }))
  )

  // Handle content change for the blank parts
  const handleContentChange = (partId, value) => {
    // Find the index of the part in blankAnswers based on partId
    const updatedBlankAnswers = blankAnswers.map(part => {
      if (part.id === partId) {
        return { ...part, content: value } // Update the content of the matching part
      }
      return part // Keep other parts unchanged
    })

    // Update the state with the updated blank answers
    setBlankAnswers(updatedBlankAnswers)

    // Send the updated question parts to the parent
    onAnswer(question._id, updatedBlankAnswers)
  }

  return (
    <Card>
      <CardContent>
        {/* Render Question */}
        <Box mb={3}>
          {questionObj?.map((part, index) => (
            <Box key={part.id} display='inline-flex' alignItems='center' sx={{ mr: 1, mb: 1 }}>
              {part.type === 'text' ? (
                <Typography variant='body1' component='span'>
                  {part.content}
                </Typography>
              ) : (
                <TextField
                  size='small'
                  variant='outlined'
                  placeholder='Enter answer'
                  onChange={e => handleContentChange(part.id, e.target.value)}
                  sx={{
                    minWidth: '100px', // Ensures the input has a minimum width
                    maxWidth: '300px', // Max width for larger inputs
                    marginBottom: '2px' // Space below the input field
                  }}
                />
              )}
            </Box>
          ))}
          .
        </Box>
      </CardContent>
    </Card>
  )
}

export default FillInBlanksTemplate
