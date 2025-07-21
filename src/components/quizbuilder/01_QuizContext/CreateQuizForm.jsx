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
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select
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
  loading,
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

  

  // Image upload
  const handleImageUpload = async e => {
    const file = e.target.files[0]
    if (!file) return

    // Resize image if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      try {
        const compressedFile = await compressImage(file)
        setTheFormValue('thumbnail', compressedFile)
        onFieldInteraction('thumbnail', false)
      } catch (error) {
        console.error('Compression error:', error)
      }
    } else {
      const reader = new FileReader()
      reader.onload = event => {
        setTheFormValue('thumbnail', event.target.result)
        onFieldInteraction('thumbnail', false)
      }
      reader.readAsDataURL(file)
    }
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
                disabled={loading}
                error={fieldErrors.title}
                helperText={fieldErrors.title ? 'Quiz title is required' : ''}
                onFocus={() => onFieldInteraction('title')}
                onBlur={() => onFieldInteraction('title', true)}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('title', e.target.value)
                  if (fieldErrors.title && e.target.value.trim() !== '') {
                    onFieldInteraction('title') // Clear error when typing
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
            required
            disabled={loading}
            InputProps={{ readOnly: true }}
            error={fieldErrors.contextIds}
            helperText={fieldErrors.contextIds ? 'At least one context ID is required' : ''}
            onFocus={() => onFieldInteraction('contextIds')}
            onBlur={() => onFieldInteraction('contextIds', true)}
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
              disabled= {loading}
                setTheFormValue={(field, value) => {
                  if(!loading)
                    {
                      setTheFormValue('contextIds', value)
                  onFieldInteraction('contextIds', value.length === 0)
                }
              }}
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
                disabled={loading}
                rows={4}
                multiline
                error={fieldErrors.details}
                helperText={fieldErrors.details ? 'Quiz details are required' : ''}
                onFocus={() => onFieldInteraction('details')}
                onBlur={() => onFieldInteraction('details', true)}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('details', e.target.value)
                  if (fieldErrors.details && e.target.value.trim() !== '') {
                    onFieldInteraction('details')
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
                disabled={loading}
                multiline
                error={fieldErrors.syllabus}
                helperText={fieldErrors.syllabus ? 'Quiz syllabus is required' : ''}
                onFocus={() => onFieldInteraction('syllabus')}
                onBlur={() => onFieldInteraction('syllabus', true)}
                onChange={e => {
                  field.onChange(e)
                  setTheFormValue('syllabus', e.target.value)
                  if (fieldErrors.syllabus && e.target.value.trim() !== '') {
                    onFieldInteraction('syllabus')
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
              disabled={loading}
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
                          <Box
                            sx={{
                              position: 'relative',
                              mb: 2,
                              height: '200px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f5f5f5' // Light gray background for error state
                            }}
                          >
                            <img
                              src={formData.thumbnail}
                              alt='Game thumbnail'
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: 4,
                                border: '1px solid #e0e0e0',
                                position: 'absolute'
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
                                boxShadow: 1,
                                zIndex: 2,
                                transform: 'translateY(-1px)'
                              }}
                            >
                              <IconButton
                                color='primary'
                                size='small'
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                                disabled={loading}
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
                                  onFieldInteraction('thumbnail', true)
                                }}
                                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                                disabled={loading}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            onClick={!loading ? () => fileInputRef.current?.click() : undefined}
                            sx={{
                              height: '200px',
                              border: '2px dashed #e0e0e0',
                              borderColor: fieldErrors.thumbnail ? 'error.main' : 'divider',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              backgroundColor: 'action.hover',
                              opacity: loading ? 0.7 : 1, 
                              '&:hover': {
                                backgroundColor: 'action.selected'
                              }
                            }}
                          >
                            <Typography color={fieldErrors.thumbnail ? 'error' : 'text.secondary'}>
                              Click to upload thumbnail image
                            </Typography>
                          </Box>
                        )}

                        <TextField
                          fullWidth
                          label='Or enter image URL *'
                          value={formData.thumbnail || ''}
                          disabled={loading}
                          onChange={e => {
                            field.onChange(e)
                            setTheFormValue('thumbnail', e.target.value)
                            if (fieldErrors.thumbnail) {
                              onFieldInteraction('thumbnail')
                            }
                          }}
                          error={fieldErrors.thumbnail && !formData.thumbnail}
                          helperText={fieldErrors.thumbnail && !formData.thumbnail ? 'Thumbnail image is required' : ''}
                          onFocus={() => onFieldInteraction('thumbnail')}
                          onBlur={() => onFieldInteraction('thumbnail', true)}
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
                    <QuizDocuments
                      documents={formData?.documents}
                      setTheFormValue={setTheFormValue}
                      loading={loading}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1, mt: 2 }}>
                    <QuizCourseLinks
                      courseLinks={formData?.courseLinks}
                      setTheFormValue={setTheFormValue}
                      loading={loading}
                    />
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
            disabled={loading}
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
              <TextField {...params} label='Tags' placeholder='Add tags' inputRef={fieldRefs.tags} disabled={loading} />
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
