import { useEffect, forwardRef, useState, useImperativeHandle } from 'react'
import { Box, Stack } from '@mui/material'
import QuestionsVerticalMenu from './QuestionsVerticalMenu'
import QuestionTemplateArea from './QuestionTemplateArea'
import { API_URLS } from '@/configs/apiConfig'
import * as RestApi from '@/utils/restApiUtil'
import SelectTemplateType from './SelectTemplateType'
import { useSession } from 'next-auth/react'
import useUUID from '@/app/hooks/useUUID'
import { toast } from 'react-toastify'

const QuestionBuilderArea = forwardRef(
  ({ quiz, validationErrors = [], validateQuizQuestions, setQuestionsLength }, ref) => {
    const { data: session } = useSession()
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [primaryQuestions, setPrimaryQuestions] = useState([])
    const [loading, setLoading] = useState({ primaryQuestions: false, createNew: false })
    const [hasClickedNew, setHasClickedNew] = useState(false)
    const [refetch, setRefetch] = useState({ primaryQuestions: false })
    const [initialValidationDone, setInitialValidationDone] = useState(false)
    const [initialQuestionsFetched, setInitialQuestionsFetched] = useState(false)

    const { uuid, regenerateUUID, getUUID } = useUUID()

    const pID = 'PQ_' + quiz.language.name.toUpperCase() + '_' + getUUID()

    const fetchPrimaryQuestions = async (quizId, justCreatedQuestionId) => {
      console.log('Fetching primary questions...')
      setLoading(prev => ({ ...prev, primaryQuestions: true }))
      try {
        const result = await RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quiz._id}&isPrimary=true`)
        if (result.status === 'success') {
          console.log(`result: primary questions of quiz= ${quizId}...`, result)
          setPrimaryQuestions(result?.result || [])
          setInitialQuestionsFetched(true)
          if (justCreatedQuestionId) {
            const justCreatedQuestion = result?.result?.find(question => question.id === justCreatedQuestionId)
            // Skip validation after creating a new question
            setSelectedQuestion(justCreatedQuestion)
          }
        } else {
          console.log('Error Fetching primary questions:', result)
          setPrimaryQuestions([])
          // toast.error('Error Fetching primary questions:' + result?.message)
        }
      } catch (error) {
        console.error('Error fetching primary questions:', error)
      } finally {
        setLoading(prev => ({ ...prev, primaryQuestions: false }))
      }
    }

    useEffect(() => {
      fetchPrimaryQuestions(quiz._id) // Fetch primary questions after getting quiz data
    }, [quiz._id, refetch.primaryQuestions])

    useEffect(() => {
      if (!initialValidationDone && initialQuestionsFetched) {
        console.log('....')
        validateQuizQuestions()
        setInitialValidationDone(true)
      }
    }, [primaryQuestions, initialValidationDone, initialQuestionsFetched])

    // useEffect(()=>{
    //   let questionsToValidate = primaryQuestions
    //   if(primaryQuestions.length > 0){
    //     questionsToValidate = questionsToValidate.filter(q=>q.id!==pID)
    //   }
    //   validateQuizQuestions(questionsToValidate)
    // },[primaryQuestions])

    function onClickNew() {
      setHasClickedNew(true)
      setSelectedQuestion(null)
    }

    function onSelectQuestion(question, isNew = false) {
      if (selectedQuestion && selectedQuestion?._id === question?._id) {
        return
      }
      setSelectedQuestion(question)
      setHasClickedNew(false)
      if (question) {
        let questionsToValidate = [...primaryQuestions]
        if (isNew) {
          questionsToValidate = [...questionsToValidate, question].filter(q => q._id !== question._id)
        }
        validateQuizQuestions(
          questionsToValidate
        )
      } else {
        setQuestionsLength(0)
        validateQuizQuestions([])
      }
    }

    async function onCreateQuestion(templateId) {
      const reqObj = {
        id: pID,
        quizId: quiz._id,
        language: quiz.language.code + '|' + quiz.language.name,
        templateId: templateId,
        createdBy: session?.user?.email,
        isPrimary: true,
        data: {
          // question
          ...((templateId === 'single-choice' ||
            templateId === 'multiple-choice' ||
            templateId === 'true-or-false') && {
            question: {
              text: '',
              image: '',
              video: '',
              mediaType: 'text'
            }
          }),
          ...(templateId === 'fill-in-blank' && { question: [{ id: 'part-1', type: 'text', content: '' }] }),
          //optiopns:
          ...((templateId === 'single-choice' || templateId === 'multiple-choice') && {
            options: [
              { id: '1', text: '', correct: false, image: '', file: null, mediaType: 'text' },
              { id: '2', text: '', correct: false, image: '', file: null, mediaType: 'text' }
            ]
          }),
          ...(templateId === 'true-or-false' && {
            options: [
              { id: 'true', text: 'True', correct: false, image: '', file: null, mediaType: 'text' },
              { id: 'false', text: 'False', correct: false, image: '', file: null, mediaType: 'text' }
            ]
          }),
          // other fields
          marks: '',
          timerSeconds: '',
          hint: '',
          hintMarks: '',
          skippable: false
        }
      }

      console.log('ReqObj for creating primary Question', reqObj)

      setLoading(prev => ({ ...prev, createNew: true }))

      try {
        const result = await RestApi.post(`${API_URLS.v0.USERS_QUIZ_QUESTION}`, reqObj)
        if (result?.status === 'success') {
          console.log('Question Added result', result)
          setPrimaryQuestions(result?.result)
          const createdQuestion = result?.result?.find(q => q.id === pID)
          onSelectQuestion(createdQuestion, true)
          // validateQuizQuestions(primaryQuestions) // do not validate just created question
        } else {
          console.log('Error creating primary question:', result)
          // toast.error('Error:' + result.message)
        }
      } catch (error) {
        console.error('Error creating primary question(catch):', error)
        // toast.error('Error creating primary question:' + error?.message)
      } finally {
        setLoading(prev => ({ ...prev, createNew: false }))
      }
    }

    function onCancelCreateQuestion() {
      setHasClickedNew(false)
    }

    const onSaveQuestion = async questionRequest => {
      console.log('Saving question:', questionRequest)
      // const isValidQuestion = validateQuizQuestions([questionRequest])
      // if (!isValidQuestion) {
      //   toast.error('Faild to save question due to the errors.')
      //   return
      // }
      const result = await RestApi.put(API_URLS.v0.USERS_QUIZ_QUESTION, {
        ...questionRequest,
        data: {
          ...questionRequest?.data,
          hintMarks: questionRequest?.data?.hintMarks ? -1 * questionRequest?.data?.hintMarks : 0
        }
      })
      if (result?.status === 'success') {
        console.log('Question Added result', result)
        setPrimaryQuestions(result?.result)
        const savedQuestion = result?.result?.find(q => q._id === questionRequest._id)
        onSelectQuestion(savedQuestion)
        // if(!isValidQuestion){
        //   toast.error('Faild to save question due to the errors.')
        //   return
        // }

        const latestQuestions = result?.result

        const isallQuestionsValid = validateQuizQuestions(latestQuestions) // validate all questions

        if (isallQuestionsValid) {
          toast.success('Question Saved Successfully')
        } else {
          // toast.error('Question Saved Successfully.')
          toast.error('Solve the issues for all questions.')
        }
      } else {
        // toast.error('Error:' + result?.message)
      }
    }

    async function onDeleteQuestion(id) {
      const result = await RestApi.del(`${API_URLS.v0.USERS_QUIZ_QUESTION}?id=${id}`)
      if (result?.status === 'success') {
        console.log('Question deleted result', result)
        toast.success('Question deleted Successfully')

        setPrimaryQuestions(result?.result)
        validateQuizQuestions(result?.result || []) // validate all questions

        const deletedQuestionIndex = primaryQuestions.findIndex(each => each._id === id)

        if (deletedQuestionIndex >= 0) {
          // Try to select the previous question first
          if (deletedQuestionIndex > 0) {
            onSelectQuestion(primaryQuestions[deletedQuestionIndex - 1])
          }
          // If no previous question, try to select the next one
          else if (primaryQuestions.length > deletedQuestionIndex + 1) {
            onSelectQuestion(primaryQuestions[deletedQuestionIndex + 1])
          }
          // If neither exists, select null
          else {
            onSelectQuestion(null)
          }
        }
      } else {
        // toast.error('Error:' + result?.message)
      }
    }

    useImperativeHandle(ref, () => ({
      getQuizQuestions: () => primaryQuestions
    }))

    return (
      <Stack spacing={2} sx={{ height: '100%', overflow: 'hidden', flexDirection: 'row', minHeight: 0 }}>
        <Box sx={{ flex: 1, height: '100%', minWidth: 0, pr: 1 }}>
          <QuestionsVerticalMenu
            questions={primaryQuestions}
            selectedQuestion={selectedQuestion}
            onClickNew={onClickNew}
            onSelect={onSelectQuestion}
            hasClickedNew={hasClickedNew}
            loading={loading}
            validationErrors={validationErrors}
          />
        </Box>
        <Box sx={{ flex: 3, height: '100%', minWidth: 0 }}>
          <Box
            sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 0, height: '100%' }}
          >
            {!hasClickedNew && (
              <QuestionTemplateArea
                selectedQuestion={selectedQuestion}
                onSaveQuestion={onSaveQuestion}
                onDeleteQuestion={onDeleteQuestion}
                hasClickedNew={hasClickedNew}
                validationErrors={validationErrors}
                questionsLength={primaryQuestions?.length || 0}
              />
            )}
            {hasClickedNew && (
              <SelectTemplateType onCreateQuestion={onCreateQuestion} onCancel={onCancelCreateQuestion} />
            )}
          </Box>
        </Box>
      </Stack>
    )
  }
)

export default QuestionBuilderArea
