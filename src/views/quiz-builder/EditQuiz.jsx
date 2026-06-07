'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import useUUID from '@/app/hooks/useUUID'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateQuizForm from '@components/quizbuilder/01_QuizContext/CreateQuizForm'
import { deleteRemovedDocuments, uploadPendingDocuments } from '@/utils/quizDocumentsClient'

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
    defaultWeightage: quiz?.defaultWeightage ?? 1,
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

  // Documents flow on edit:
  //   - Existing docs from MongoDB already have { url, key, ... } and are passed through.
  //   - Newly added docs are staged with a `file` field (no URL yet).
  //   - On submit we (1) upload the new files, (2) delete S3 keys for docs the
  //     user removed, and (3) PUT the quiz with the cleaned `documents` array.
  const onSubmit = async () => {
    const formValues = getValues()
    setLoading(true)

    setTimeout(() => {
      if (formValues.contextIds?.length === 0) {
        toast.error('Please select the quiz context')
        setLoading(false)
        return
      }
    }, 3000)

    try {
      // 1) Upload any staged document files. Abort the save if any fails.
      try {
        const persistedDocs = await uploadPendingDocuments(formValues.documents, formValues.id)
        formValues.documents = persistedDocs
      } catch (uploadError) {
        console.error('Document upload failed:', uploadError)
        toast.error(uploadError?.message || 'Failed to upload one or more documents. Quiz was not updated.')
        setLoading(false)
        return
      }

      // 2) Clean up S3 objects for documents the user removed during this edit.
      await deleteRemovedDocuments(quiz?.documents || [], formValues.documents)

      // 3) Save the quiz.
      if (isAdmin) {
        formValues.editedBy = session?.user?.email
      }
      const result = await RestApi.put(`${ApiUrls.v0.USERS_QUIZ}/${quiz._id}`, formValues)
      if (result?.status === 'success') {
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
