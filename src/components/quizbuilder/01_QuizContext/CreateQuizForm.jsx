// React Imports
import React, { useState, useEffect } from 'react'
// MUI Imports
import { Tabs, Tab, Box, Grid, TextField, Dialog, IconButton, DialogContent, Typography } from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'
// Components Imports
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import TagInput from '../../TagInput'
import { Controller } from 'react-hook-form'
import ImageUploader from '@/components/media-viewer/ImageUploader'
import LanguageSelect from '../05_Components/LanguageSelect'
import QuizDocuments from './QuizDocuments'
import QuizCourseLinks from './QuizCourseLinks'
import ContextTreeSearch from '@/components/quizbuilder/01_QuizContext/ContextTreeSearch'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const CreateQuizForm = ({ control, setValue, errors, user, quiz = {}, quizId = null, formData = {} }) => {
  const [isGenericPopupOpen, setIsGenericPopupOpen] = useState(false)

  const setTheFormValue = (name, val) => {
    setValue(name, val, { shouldValidate: true, shouldDirty: true })
  }

  const handleOpenPopup = () => {
    setIsGenericPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsGenericPopupOpen(false)
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {/* <Grid item xs={12}>
            <Box style={{border: '1px solid gray', borderRadius: '5px'}} className='pt-2'>


              <TabPanel value={contextType}>
                <Box className='w-full' style={{ overflow: 'auto' }}>
                  <SubjectTreeSearch
                    data={quiz}
                    contextType={contextType}
                    setTheFormValue={setTheFormValue}
                  ></SubjectTreeSearch>
                </Box>
              </TabPanel>
            </Box>
          </Grid> */}
        <Grid item xs={12} md={6}>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Quiz Title'
                variant='outlined'
                fullWidth
                required
                aria-readonly
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        {/* Generic Context IDs */}
        <Grid item xs={12} md={6}>
          <TextField
            label='Context IDs'
            value={formData.contextIds.join(', ')}
            onClick={() => handleOpenPopup()}
            fullWidth
            InputProps={{ readOnly: true }}
          />
          {/* Generic Context Popup */}
          <Dialog fullWidth maxWidth='sm' open={isGenericPopupOpen} onClose={() => handleClosePopup()}>
            <IconButtonTooltip title='Close' onClick={() => handleClosePopup()} className='absolute block-start-4 inline-end-4'>
              <i className='ri-close-line text-textSecondary' />
            </IconButtonTooltip>
            <DialogContent>
              <ContextTreeSearch
                setTheFormValue={(field, value) => setTheFormValue('contextIds', value)}
                data={{formData, genericContextIds: formData.contextIds}}
                contextType='GENERIC'
              />
            </DialogContent>
          </Dialog>
          {/* <Controller
              name='contextIds'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Context IDs'
                  variant='outlined'
                  multiline
                  inputProps={{
                    readOnly: true
                  }}
                  required
                  fullWidth
                  error={!!errors.id}
                  helperText={errors.id?.message}
                />
              )}
            /> */}
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='details'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Quiz Details'
                variant='outlined'
                fullWidth
                required
                rows={4}
                multiline
                error={!!errors.details}
                helperText={errors.details?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='syllabus'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Quiz Syllabus'
                variant='outlined'
                fullWidth
                required
                multiline
                error={!!errors.syllabus}
                helperText={errors.syllabus?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <QuizDocuments documents={formData?.documents} setTheFormValue={setTheFormValue} />
        </Grid>

        <Grid item xs={12} md={6}>
          <QuizCourseLinks courseLinks={formData?.courseLinks} setTheFormValue={setTheFormValue} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='thumbnail'
            control={control}
            render={({ field }) => (
              <ImageUploader
                {...field}
                bucketName={process.env.NEXT_PUBLIC_AWS_S3_QUIZ_UPLOAD_BUCKET}
                regionName={process.env.NEXT_PUBLIC_AWS_S3_REGION}
                heading={'Upload Poster *'}
                minimizedSubHeading={'Click the chevron to view poster'}
                mediaUrl={formData.thumbnail}
                saveCompressedFileName={`${quizId}-poster-image.jpg`}
                saveThumbnailFileName={`${quizId}-thumbnail-image.jpg`}
                formFieldName={'thumbnail'}
                setTheFormValue={setTheFormValue}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='owner'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Owner'
                variant='outlined'
                fullWidth
                aria-readonly
                inputProps={{
                  readOnly: 'true'
                }}
                value={user?.email}
              />
            )}
          />
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <Controller
            name='createdBy'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Created By'
                variant='outlined'
                fullWidth
                inputProps={{
                  readOnly: 'true'
                }}
                value={user?.email}
              />
            )}
          />
        </Grid> */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id='privacy-label'>Privacy</InputLabel>
            <Controller
              name='privacy'
              control={control}
              render={({ field }) => (
                <Select {...field} labelId='privacy-label' label='Privacy'>
                  <MenuItem value='PUBLIC'>Public</MenuItem>
                  <MenuItem value='PRIVATE'>Private</MenuItem>
                </Select>
              )}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Status'
                variant='outlined'
                fullWidth
                inputProps={{
                  readOnly: 'true'
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name='language'
            control={control}
            render={({ field }) => (
              <LanguageSelect
                {...field}
                setTheFormValue={setTheFormValue}
                defaultLanguage={{ code: 'en', name: 'English' }}
                fieldName='language'
              ></LanguageSelect>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name='id'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Quiz ID'
                variant='outlined'
                multiline
                inputProps={{
                  readOnly: true
                }}
                fullWidth
                error={!!errors.id}
                helperText={errors.id?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name='approvalState'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Approval State'
                variant='outlined'
                multiline
                inputProps={{
                  readOnly: true
                }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid item xs={12} className='mb-2'>
          <TagInput value={quiz?.tags} setFormValue={setTheFormValue} />
        </Grid>
      </Grid>
    </Box>
  )
}

export default CreateQuizForm
