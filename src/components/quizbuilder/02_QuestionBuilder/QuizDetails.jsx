// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import { Card, CardContent, CardHeader, FormControl, FormControlLabel, InputLabel, TextField } from '@mui/material'
import MinimizableComponent from '@/components/quizbuilder/05_Components/MinimizableComponent'

const QuizDetails = ({ selectedQuiz, isMinimizedBool, setIsMinimizedBool }) => {
  console.log('Selected Quiz: ', selectedQuiz)
  return (
    <MinimizableComponent
      isMinimizedBool={isMinimizedBool}
      setIsMinimizedBool={setIsMinimizedBool}
      maximizePanelName='Quiz Details'
      containerStyles={{ display: 'flex', flexDirection: 'column' }}
      buttonStyles={{ alignSelf: 'center' }}
    >
      <Card>
        <CardHeader title='Quiz Details' />
        <CardContent>
          <Grid container spacing={3}>
            {!selectedQuiz && (
              <Grid item xs={12}>
                <h5 style={{ color: 'red' }} className='mb-1'>
                  *Please select a quiz or create new
                </h5>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                label='Quiz Title'
                variant='outlined'
                fullWidth
                aria-readonly
                value={selectedQuiz?.title}
                InputLabelProps={{ shrink: selectedQuiz?.title }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Quiz Details'
                variant='outlined'
                fullWidth
                aria-readonly
                value={selectedQuiz?.details}
                InputLabelProps={{ shrink: selectedQuiz?.details }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label='Primary Language'
                variant='outlined'
                fullWidth
                aria-readonly
                value={selectedQuiz?.language?.name}
                InputLabelProps={{ shrink: selectedQuiz?.language?.name }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Id'
                variant='outlined'
                fullWidth
                aria-readonly
                value={selectedQuiz?.id}
                InputLabelProps={{ shrink: selectedQuiz?.id }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </MinimizableComponent>
  )
}

export default QuizDetails
