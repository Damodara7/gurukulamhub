'use client'
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
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
  Grid,
  Stack,
  Typography
} from '@mui/material'
import CenterBox from '@/components/CenterBox'
import { useRouter } from 'next/navigation'
import { Description, Quiz } from '@mui/icons-material'
import GoBackButton from '@/components/GoBackButton'

function CreateQuiz({ isAdmin = false }) {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { uuid, regenerateUUID, getUUID } = useUUID()
  // const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const user = session?.user

  // const handleInputChange = event => {
  //   const { name, value } = event.target
  //   setFormData({ ...formData, [name]: value })
  // }

  // // Yup validation schema
  // const createQuizSchema = yup.object().shape({
  //   title: yup.string().min(3, 'Title must be at least 3 characters').required('Quiz title is required'),
  //   details: yup.string().min(10, 'Details must be at least 10 characters').required('Quiz details are required'),
  //   syllabus: yup.string().required('Quiz syllabus is required'),
  //   contextIds: yup.array().min(1, 'At least one context must be selected'),
  //   thumbnail: yup.string().required('Thumbnail is required')
  // })

  const createQuizDefaultValues = {
    details: '',
    documents: [],
    courseLinks: [],
    syllabus: '',
    id: getUUID('QZ_'),
    title: '',
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
    remarks: [],
    isAdmin: isAdmin
  }

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
    reset,
    trigger
  } = useForm({
    defaultValues: { ...createQuizDefaultValues }
  })

  // async function handleDeleteQuizDocuments() {
  //   const fileNameWithoutExtension = `${getValues().id}/documents` // deleting the folder of quiz documents

  //   try {
  //     await deleteAllMatchingFilesWithUnknownExtension({
  //       bucketName: quizBucketName,
  //       fileNamePrefix: fileNameWithoutExtension
  //     })
  //   } catch (error) {
  //     console.error('Error in handleDeleteQuizDocuments:', error)
  //   }
  // }

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

  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    contextIds: false,
    details: false,
    syllabus: false,
    thumbnail: false
  })

  // Validate form fields
  const validateForm = () => {
    const values = getValues()
    const newErrors = {
      title: !values.title || values.title.trim() === '',
      contextIds: values.contextIds.length === 0,
      details: !values.details || values.details.trim() === '',
      syllabus: !values.syllabus || values.syllabus.trim() === '',
      thumbnail: !values.thumbnail
    }

    setFieldErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }
  // Handle field interaction (focus/blur)
  const handleFieldInteraction = (fieldName, forceError = false) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: forceError
        ? !getValues()[fieldName] || (Array.isArray(getValues()[fieldName]) && getValues()[fieldName].length === 0)
        : false
    }))
  }

  const onSubmit = async () => {
    setFormSubmitted(true)
    if (!validateForm()) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    const formValues = getValues()

    try {
      const result = await RestApi.post(ApiUrls.v0.USERS_QUIZ, formValues)
      if (result?.status === 'success') {
        await uploadQuizDocs()

        console.log('Quiz Added result', result)
        toast.success('Quiz Added Successfully .')
        reset()
        router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/builder/${result?.result?._id}`)
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
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          p: { xs: 2, sm: 3, md: 4 },
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }
        }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box className='flex flex-col gap-1 mb-4 text-center'>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Typography
                  variant='h3'
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontWeight: 800,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    letterSpacing: '-1px'
                  }}
                >
                  Create Your Quiz
                </Typography>
              </Box>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontSize: '0.95rem', maxWidth: '600px', mx: 'auto' }}
              >
                Design an engaging quiz experience with beautiful customization options
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
              fieldErrors={fieldErrors}
              formSubmitted={formSubmitted}
              onFieldInteraction={handleFieldInteraction}
              loading={loading}
              isAdmin={isAdmin}
            />
            {/* Form Actions */}
            
            <Grid item xs={12} mt={5}>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button variant='outlined' onClick={() => router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view`)}>
                Cancel
              </Button>
              <Button
                sx={{ mt: 2 }}
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
          </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default CreateQuiz
