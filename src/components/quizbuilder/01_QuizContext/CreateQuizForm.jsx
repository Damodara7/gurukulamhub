// React Imports
import React, { useState, useEffect, useRef } from 'react'
// MUI Imports
import {
  Tabs,
  Tab,
  Box,
  Grid,
  TextField,
  Chip,
  Dialog,
  IconButton,
  DialogContent,
  Typography,
  Autocomplete
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  VideocamOff as VideocamOffIcon
} from '@mui/icons-material'
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

const CreateQuizForm = ({
  control,
  setValue,
  errors,
  user,
  quiz = {},
  quizId = null,
  formData = {},
  fieldErrors = {},
  formSubmitted = false,
  onFieldInteraction = () => {}
}) => {
  const [isGenericPopupOpen, setIsGenericPopupOpen] = useState(false)
  const fileInputRef = useRef(null)

  const setTheFormValue = (name, val) => {
    setValue(name, val, { shouldValidate: true, shouldDirty: true })
  }

  const fieldRefs = {
    tags: useRef()
  }

  const handleOpenPopup = () => {
    setIsGenericPopupOpen(true)
  }

  const handleClosePopup = () => {
    setIsGenericPopupOpen(false)
  }

  // Handle field focus - clear error state
  const handleFocus = fieldName => {
    onFieldInteraction(fieldName)
  }

  const handleBlur = fieldName => {
    if (formSubmitted) {
      const value = formData[fieldName]
      let isEmpty = false

      if (fieldName === 'contextIds') {
        isEmpty = value?.length === 0
      } else if (fieldName === 'thumbnail') {
        isEmpty = !value
      } else {
        isEmpty = !value || value.trim() === ''
      }

      // Use the passed onFieldInteraction prop instead of setFieldErrors
      onFieldInteraction(fieldName, true)
    }
  }

  // Image upload
  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    // Resize image if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const compressedFile = await compressImage(file)
        setTheFormValue('thumbnail', compressedFile)
      } catch (error) {
        console.error('Compression error:', error)
      }
    } else {
      const reader = new FileReader()
      reader.onload = event => {
        setTheFormValue('thumbnail', event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target
    // Make sure name is a string
    if (typeof name !== 'string') {
      console.error('Expected string for field name', name)
      return
    }
    setTheFormValue(prev => ({ ...prev, [name]: value }))
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
                error={fieldErrors.title}
                helperText={fieldErrors.title ? 'Quiz title is required' : ''}
                onFocus={() => handleFocus('title')}
                onBlur={() => handleBlur('title')}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('title', e.target.value)
                  if (fieldErrors.title && e.target.value.trim() !== '') {
                    handleFocus('title') // Clear error when typing
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: fieldErrors.title ? 'error.main' : ''
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.title ? 'error.main' : ''
                    }
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Generic Context IDs */}
        <Grid item xs={12} md={6}>
          <TextField
            label='Context IDs'
            value={formData.contextIds.join(', ') || ''}
            onClick={() => handleOpenPopup()}
            fullWidth
            InputProps={{ readOnly: true }}
            error={fieldErrors.contextIds}
            helperText={fieldErrors.contextIds ? 'At least one context ID is required' : ''}
            onFocus={() => handleFocus('contextIds')}
            onBlur={() => handleBlur('contextIds')}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: fieldErrors.contextIds ? 'error.main' : ''
                },
                '&:hover fieldset': {
                  borderColor: fieldErrors.contextIds ? 'error.main' : ''
                }
              }
            }}
          />
          {/* Generic Context Popup */}
          <Dialog fullWidth maxWidth='sm' open={isGenericPopupOpen} onClose={() => handleClosePopup()}>
            <IconButtonTooltip
              title='Close'
              onClick={() => handleClosePopup()}
              className='absolute block-start-4 inline-end-4'
            >
              <i className='ri-close-line text-textSecondary' />
            </IconButtonTooltip>
            <DialogContent>
              <ContextTreeSearch
                setTheFormValue={(field, value) => setTheFormValue('contextIds', value)}
                data={{ formData, genericContextIds: formData.contextIds }}
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

        <Grid item xs={12}>
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
                error={fieldErrors.details}
                helperText={fieldErrors.details ? 'Quiz details are required' : ''}
                onFocus={() => handleFocus('details')}
                onBlur={() => handleBlur('details')}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('details', e.target.value)
                  if (fieldErrors.details && e.target.value.trim() !== '') {
                    handleFocus('details')
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: fieldErrors.details ? 'error.main' : ''
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.details ? 'error.main' : ''
                    }
                  }
                }}
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
                error={fieldErrors.syllabus}
                helperText={fieldErrors.syllabus ? 'Quiz syllabus is required' : ''}
                onFocus={() => handleFocus('syllabus')}
                onBlur={() => handleBlur('syllabus')}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('syllabus', e.target.value)
                  if (fieldErrors.syllabus && e.target.value.trim() !== '') {
                    handleFocus('syllabus')
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: fieldErrors.syllabus ? 'error.main' : ''
                    },
                    '&:hover fieldset': {
                      borderColor: fieldErrors.syllabus ? 'error.main' : ''
                    }
                  }
                }}
              />
            )}
          />
        </Grid>

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

        <Grid item xs={12}>
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              mb: 2
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Typography variant='subtitle2' gutterBottom>
                    Thumbnail Image
                  </Typography>
                  <Controller
                    name='thumbnail'
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type='file'
                          ref={fileInputRef}
                          onChange={e => {
                            // You'll need to handle the file input change
                            // and connect it to your ImageUploader logic
                            handleImageUpload(e)
                            field.onChange(e)
                          }}
                          accept='image/*'
                          style={{ display: 'none' }}
                        />
                        {formData.thumbnail ? (
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <img
                              src={formData.thumbnail}
                              alt='Game thumbnail'
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: 4,
                                border: '1px solid #e0e0e0'
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                display: 'flex',
                                gap: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: 1,
                                p: 0.5,
                                boxShadow: 1
                              }}
                            >
                              <IconButton
                                color='primary'
                                size='small'
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                color='error'
                                size='small'
                                onClick={() => {
                                  if (formData.thumbnail.startsWith('blob:')) {
                                    URL.revokeObjectURL(formData.thumbnail)
                                  }
                                  setTheFormValue('thumbnail', '')
                                }}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                              height: '200px',
                              border: '2px dashed',
                              borderColor: 'divider',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              backgroundColor: 'action.hover',
                              '&:hover': {
                                backgroundColor: 'action.selected'
                              }
                            }}
                          >
                            <Typography color='text.secondary'>Click to upload thumbnail image</Typography>
                          </Box>
                        )}
                        <TextField
                          fullWidth
                          label='Or enter image URL'
                          name='thumbnail'
                          value={formData.thumbnail || ''}
                          onChange={e => {
                            handleChange(e)
                            field.onChange(e.target.value)
                          }}
                          placeholder='https://example.com/image.jpg'
                          type='url'
                          sx={{ mt: 2 }}
                        />
                      </>
                    )}
                  />
                </Box>
              </Grid>

              {/*documents uploading and course links */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <Typography gutterBottom variant='subtitle2'>
                    Upload Related Documents and Course Links
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <QuizDocuments documents={formData?.documents} setTheFormValue={setTheFormValue} />
                  </Box>

                  <Box sx={{ flexGrow: 1, mt: 2 }}>
                    <QuizCourseLinks courseLinks={formData?.courseLinks} setTheFormValue={setTheFormValue} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
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
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.tags || []}
            onChange={(event, newValue) => {
              setTheFormValue('tags', newValue)
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip key={index} variant='outlined' label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={params => (
              <TextField {...params} label='Tags' placeholder='Add tags' inputRef={fieldRefs.tags} />
            )}
          />
        </Grid>

        {/* <Grid item xs={12} md={6}>
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
        </Grid> */}

        {/* <Grid item xs={12} md={6}>
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
        </Grid> */}

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

        {/* <Grid item xs={12} md={6}>
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
        </Grid> */}

        {/*         
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
        </Grid> */}

        {/* <Grid item xs={12} md={6}>
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
        </Grid> */}

        {/* <Grid item xs={12} className='mb-2'>
          <TagInput value={quiz?.tags} setFormValue={setTheFormValue} />
        </Grid>*/}
      </Grid>
    </Box>
  )
}

export default CreateQuizForm
