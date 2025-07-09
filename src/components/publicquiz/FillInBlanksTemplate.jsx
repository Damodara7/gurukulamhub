import { Card, CardContent, Typography, TextField, Box } from '@mui/material'
import { useState } from 'react'

const FillInBlanksTemplate = ({ question, onAnswer , readOnly= false }) => {
  const questionObj = question?.data?.question

  // Initialize with selectedAnswer if in readOnly mode, otherwise empty
  const [blankAnswers, setBlankAnswers] = useState(
    readOnly
      ? selectedAnswer || []
      : questionObj
          .filter(part => part.type === 'blank')
          .map(part => ({
            ...part,
            content: ''
          }))
  )
 
  // Handle content change for the blank parts
  const handleContentChange = (partId, value) => {
    if (readOnly) return
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
              ) : readOnly ? (
                <Typography
                  variant='body1'
                  component='span'
                  sx={{
                    minWidth: '100px',
                    maxWidth: '300px',
                    borderBottom: '1px solid',
                    borderColor: 'text.primary',
                    px: 1,
                    mx: 0.5
                  }}
                >
                  {blankAnswers.find(b => b.id === part.id)?.content || '______'}
                </Typography>
              ) : (
                <TextField
                  size='small'
                  variant='outlined'
                  placeholder='Enter answer'
                  value={blankAnswers.find(b => b.id === part.id)?.content || ''}
                  onChange={e => handleContentChange(part.id, e.target.value)}
                  sx={{
                    minWidth: '100px',
                    maxWidth: '300px',
                    marginBottom: '2px'
                  }}
                  disabled={readOnly}
                />
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default FillInBlanksTemplate
