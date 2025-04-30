import CenterBox from '@/components/CenterBox'
import { API_URLS } from '@/configs/apiConfig'
import { auth } from '@/libs/auth'
import * as RestApi from '@/utils/restApiUtil'
import SelectedQuiz from '@/views/quiz-builder/SelectedQuiz'
import { Alert, AlertTitle } from '@mui/material'
import { isValidObjectId } from 'mongoose'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import LoadingDialog from '@/components/LoadingDialog'

export default async function SelectedQuizPage({ params }) {
  const { id } = params

  if (!isValidObjectId(id)) {
    return (
      <CenterBox>
        <Alert
          sx={{ padding: '0.5rem' }}
          severity=''
          icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
          color='error'
        >
          <AlertTitle>Not a valid quiz id!</AlertTitle>
          Please check and try again.
        </Alert>
      </CenterBox>
    )
  }

  async function getQuizData() {
    console.log('Fetching Selected Quiz Data now...')
    const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${id}`)
    if (result?.status === 'success') {
      console.log('Quizzes Fetched result', result)
      return result?.result
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching quizes:', result)
    }
  }

  const quiz = await getQuizData()

  if(!quiz){
    return (
      <CenterBox>
        <Alert
          sx={{ padding: '0.5rem' }}
          severity=''
          icon={<WarningAmberOutlinedIcon fontSize='inherit' />}
          color='error'
        >
          <AlertTitle>Quiz not found!</AlertTitle>
          Please check and try again.
        </Alert>
      </CenterBox>
    )
  }

  return <SelectedQuiz quiz={quiz} />
}
