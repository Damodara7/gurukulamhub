'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useUUID from '@/app/hooks/useUUID'
import * as RestApi from '@/utils/restApiUtil'
import {
  convertFileToBufferFile,
  deleteAllMatchingFilesWithUnknownExtension,
  deleteFileWithUnknownExtension,
  getAllMatchingFilesFromS3WithUnknownExtension,
  getFileExtension,
  getFileFromS3WithUnknownExtension,
  quizBucketName,
  uploadFileToS3
} from '@/utils/awsS3Utils'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateQuizForm from '@/components/quizbuilder/01_QuizContext/CreateQuizForm'

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  Typography
} from '@mui/material'
import CenterBox from '@/components/CenterBox'
import { useRouter } from 'next/navigation'
import { Description } from '@mui/icons-material'
import GoBackButton from '@/components/GoBackButton'

function CreateQuiz() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)

  const user = session?.user

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  // Define a yup schema for form validation
  const createQuizSchema = yup.object().shape({
    //quizId: yup.string().min(3).max(10).notRequired(),
    title: yup.string().min(3).required(),
    details: yup.string().min(10).required()
    // Add more fields and validation rules as needed
  })

  const createQuizDefaultValues = {
    details: 'test details',
    documents: [],
    courseLinks: [],
    syllabus: '',
    id: getUUID('QZ_'),
    title: 'My Quiz',
    tags: [],
    owner: user?.email,
    privacy: 'PUBLIC',
    createdBy: user?.email,
    contextIds: [],
    genericContextIds: [],
    academicContextIds: [],
    nodeType: 'QUIZ',
    status: 'active',
    thumbnail: '',
    approvalState: 'draft',
    language: { code: 'en', name: 'English' },
    remarks: []
  }

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: { ...createQuizDefaultValues },
    resolver: yupResolver(createQuizSchema)
  })

  async function handleDeleteQuizDocuments() {
    const fileNameWithoutExtension = `${getValues().id}/documents` // deleting the folder of quiz documents

    try {
      await deleteAllMatchingFilesWithUnknownExtension({
        bucketName: quizBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteQuizDocuments:', error)
    }
  }

  async function handleUploadQuizDocToS3(docObj) {
    // const fileNameWithoutExtension = `${getValues().id}/documents/${docObj.id}`

    // console.log(docObj.document.name, fileNameWithoutExtension)

    // if (docObj.document.name && docObj.document.name.startsWith(fileNameWithoutExtension)) {
    //   return // Don't reupload the same file
    // }

    // try {
    //   await deleteFileWithUnknownExtension({
    //     bucketName: quizBucketName,
    //     fileNamePrefix: fileNameWithoutExtension
    //   })
    // } catch (error) {
    //   console.error(`Error in handleDelete QuizDoc-${docObj.document.id} from S3:`, error)
    // }

    if (docObj.document) {
      const bufferFile = await convertFileToBufferFile(docObj.document)
      const fileType = getFileExtension(docObj.document.name) // docObj.document.type.split('/')[1]
      const fileName = `${getValues().id}/documents/${docObj.id}.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: quizBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('quiz Doc uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadQuizDocToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function uploadQuizDocs() {
    try {
      // await handleDeleteQuizDocuments()

      const quizDocs = getValues().documents

      for (let i = 0; i < quizDocs.length; i++) {
        if (quizDocs[i].document) {
          await handleUploadQuizDocToS3(quizDocs[i])
        }
      }

      console.log('Quiz Docs uploaded successfully')
    } catch (error) {
      console.error('Error in uploadQuizDocs:', error)
      toast.error('Error uploading quiz docs to S3.')
    }
  }

  const onSubmit = async () => {
    const formValues = getValues()
    console.log('formValues: ', formValues) // Access form values here
    setLoading(true)

    // Validations
    if (formValues.contextIds?.length === 0) {
      toast.error('Please select the quiz context')
      setLoading(false)
      return
    }

    try {
      const result = await RestApi.post(ApiUrls.v0.USERS_QUIZ, formValues)
      if (result?.status === 'success') {
        await uploadQuizDocs()

        console.log('Quiz Added result', result)
        toast.success('Quiz Added Successfully .')
        reset()
        router.push(`/myquizzes/builder/${result?.result?._id}`)
      } else {
        toast.error('Error:' + result.message)
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast.error('Failed to create quiz. Please try again')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <GoBackButton />
      <Card>
        <CardContent>
          <Box className='flex flex-col gap-2 mb-6 mt-2 text-center'>
            <Typography variant='h4'>Create Your Quiz</Typography>
            <Typography variant='body1' color='text.secondary'>
              Create a new quiz by providing following quiz details.
            </Typography>
          </Box>
          <CreateQuizForm
            quizId={getValues().id}
            regenerateUUID={regenerateUUID}
            user={session?.user}
            control={control}
            errors={errors}
            formData={getValues()}
            quiz={getValues()}
            setValue={setValue}
          />
          <Stack className='w-full' flexDirection='row' alignItems='center' justifyContent='flex-end'>
            <Button
              variant='contained'
              style={{ color: 'white' }}
              color='primary'
              component='label'
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}

export default CreateQuiz
