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
  Typography,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import CenterBox from '@/components/CenterBox'
import { useRouter } from 'next/navigation'
import { Description, Quiz } from '@mui/icons-material'
import GoBackButton from '@/components/GoBackButton'

function CreateQuiz({ isAdmin = false }) {
  const theme = useTheme()
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
          minHeight: '100vh',
          background: `radial-gradient(circle at 20% 20%, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, ${alpha(
                         theme.palette.secondary.main,
                         0.05
                       )} 0%, transparent 50%),
                       ${theme.palette.background.default}`
        }}
      >
        {/* Elegant Header */}
        <Box
          sx={{
            backdropFilter: 'blur(20px)',
            bgcolor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : alpha(theme.palette.background.paper, 0.7),
            borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
            pt: { xs: 4, md: 6 },
            pb: { xs: 4, md: 6 }
          }}
        >
          <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ textAlign: 'center' }}>
              {/* Icon and Title */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Quiz sx={{ fontSize: '28px', color: 'white' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Create Your Quiz
                </Typography>
              </Box>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  fontWeight: 400,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Design an engaging quiz experience with beautiful customization options
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
          <Card
            sx={{
              borderRadius: 2,
              background: theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
              overflow: 'hidden',
              '&:hover': {
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 4px 16px ${alpha(theme.palette.common.black, 0.4)}`
                    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
                  <Button
                    variant='outlined'
                    onClick={() => router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view`)}
                    sx={{
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
                    }}
                  >
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
      </Box>
    </>
  )
}

export default CreateQuiz
