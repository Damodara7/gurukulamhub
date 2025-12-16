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
import CreateQuizForm from '@components/quizbuilder/01_QuizContext/CreateQuizForm'

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
  Typography,
  Grid,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import CenterBox from '@/components/CenterBox'
import { useRouter } from 'next/navigation'
import GoBackButton from '@/components/GoBackButton'

function EditQuiz({ quiz, isAdmin = false }) {
  const theme = useTheme()
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const { uuid, regenerateUUID, getUUID } = useUUID()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [s3QuizDocs, setS3QuizDocs] = useState([])

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
    details: quiz?.details || 'test details',
    syllabus: quiz?.syllabus || '',
    documents: quiz?.documents || [], // { id: 0, description: '', document: null }
    courseLinks: quiz?.courseLinks || [], // { id: 0, mediaType: 'video', link: '' }
    id: quiz?.id || getUUID('QZ_'),
    title: quiz?.title || 'My Quiz',
    tags: quiz?.tags || [],
    owner: quiz?.owner || user?.email,
    privacy: quiz?.privacy || 'PUBLIC',
    createdBy: quiz?.createdBy || user?.email,
    contextIds: quiz?.contextIds || [],
    nodeType: quiz?.nodeType || 'QUIZ',
    status: quiz?.status || 'active',
    thumbnail: quiz?.thumbnail || '',
    approvalState: quiz?.approvalState || 'draft',
    language: quiz?.language || { code: 'en', name: 'English' },
    remarks: quiz?.remarks || []
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

  useEffect(() => {
    async function getQuizDocsFun() {
      const quizDocs = await getQuizDocs()
      setS3QuizDocs(quizDocs)
      console.log('quizDocs...: ', quizDocs)
      const mergeDocuments = getValues()?.documents?.map((doc, index) => {
        // Find corresponding document in quizDocs
        const matchingDoc = quizDocs?.find(quizDoc => quizDoc.id === doc.id) // Assuming they match by index

        return {
          id: doc.id,
          description: doc.description, // Get description from result.result.documents
          document: matchingDoc?.document || null // Get document from quizDocs or fallback to null if not found
        }
      })
      console.log('Merge Documents...: ', mergeDocuments)
      setValue('documents', mergeDocuments, { shouldValidate: true, shouldDirty: true })
    }
    if (quiz) {
      getQuizDocsFun()
    }
  }, [quiz])

  async function getQuizDocs() {
    try {
      const files = await getAllMatchingFilesFromS3WithUnknownExtension({
        bucketName: quizBucketName,
        fileNamePrefix: `${getValues().id}/documents`
      })
      console.log('quiz docs: ', files)
      if (files) {
        return files?.map((file, index) => {
          // Use a regex to capture the id from the URL (assuming the pattern is `${quizId}/documents/${id}.fileType`)
          const match = file.name.match(/\/documents\/([0-9a-fA-F-]+)\./)

          const id = match ? match[1] : null // If a match is found, extract the id (match[1])
          return { id: id, description: `document-${index}`, document: file }
        })
      } else {
        console.log('No quiz docs found')
        return []
      }
    } catch (error) {
      console.log('Error getting quiz docs: ', error)
    }
  }

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
    const fileNameWithoutExtension = `${getValues().id}/documents/${docObj.id}`

    console.log({ docObj, fileNameWithoutExtension })

    if (docObj.document.name && docObj.document.name.startsWith(fileNameWithoutExtension)) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: quizBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error(`Error in handleDelete QuizDoc-${docObj.id} from S3:`, error)
    }

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
      console.log('quizDocs: ', quizDocs)

      if (quizDocs.length === 0) {
        await handleDeleteQuizDocuments()
      }

      // Step 1: Find files to delete (in S3 but not in quizDocs)
      const quizDocIds = quizDocs.map(doc => doc.id) // IDs of documents to retain
      const docsToDelete = s3QuizDocs.filter(s3Doc => {
        // Keep files that do NOT have a matching document ID
        return !quizDocIds.includes(s3Doc.id)
      })

      // Step 2: Delete files from S3 that are not in quizDocs
      for (const doc of docsToDelete) {
        const fileNameWithoutExtension = `${getValues().id}/documents/${doc.id}`
        try {
          await deleteFileWithUnknownExtension({
            bucketName: quizBucketName,
            fileNamePrefix: fileNameWithoutExtension
          })
        } catch (error) {
          console.error(`Error in handleDelete QuizDoc-${docObj.id} from S3:`, error)
        }
      }

      for (let i = 0; i < quizDocs.length; i++) {
        await handleUploadQuizDocToS3(quizDocs[i])
      }

      console.log('Quiz Docs uploaded successfully')
    } catch (error) {
      console.error('Error in uploadQuizDocs:', error)
      // toast.error('Error uploading quiz docs to S3.')
    }
  }

  const onSubmit = async () => {
    const formValues = getValues()
    console.log('formValues: ', formValues) // Access form values here
    setLoading(true)

    setTimeout(() => {
      console.log('timeOut: ')
      if (formValues.contextIds?.length === 0) {
        toast.error('Please select the quiz context')
        setLoading(false)
        return
      }
    }, 3000)

    try {
      const result = await RestApi.put(`${ApiUrls.v0.USERS_QUIZ}/${quiz._id}`, formValues)
      if (result?.status === 'success') {
        await uploadQuizDocs()

        console.log('Quiz Added result', result)
        toast.success('Quiz Updated Successfully.')
        setLoading(false)
        reset()
        router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view`)
      } else {
        toast.error('Error:' + result.message)
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast.error('Failed to update quiz. Please try again')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
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
                  <i className='ri-question-line' style={{ fontSize: '28px', color: 'white' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Edit Your Quiz
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
                Edit quiz details as per your requirements
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 }, flex: 1, overflow: 'auto' }}>
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? `0 2px 8px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
              border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
              overflow: 'hidden',
              '&:hover': {
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                    : `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <CreateQuizForm
                regenerateUUID={regenerateUUID}
                user={session?.user}
                control={control}
                errors={errors}
                setValue={setValue}
                formData={getValues()}
                quiz={quiz}
                quizId={getValues().id}
                isAdmin={isAdmin}
              />
              {/* Form Actions */}
              <Grid item xs={12} mt={5}>
                <Stack direction='row' spacing={2} justifyContent='center'>
                  <Button
                    variant='outlined'
                    onClick={() => router.push(`/${isAdmin ? 'management/quizzes' : 'myquizzes'}/view/${quiz._id}`)}
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
                    {loading ? 'Updating...' : 'Update Quiz'}
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

export default EditQuiz

// QZ_53bddfba-e100-44b9-a04f-4fffc995e4e1/documents/0
// QZ_53bddfba-e100-44b9-a04f-4fffc995e4e1/documents/0.pdf
// const match = file.name.match(/\/documents\/([a-fA-F0-9-]+)\./);
