import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Stack
} from '@mui/material'
import React, { useState, useEffect, useMemo } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers'
import { Edit as EditIcon } from '@mui/icons-material'
import dayjs from 'dayjs'
import {
  buildEducationFromForm,
  EDUCATION_GRADE_TYPES,
  educationCompletionStatusOptions,
  formatEducationDuration,
  formatEducationGrade,
  getCompletionStatusLabel,
  getGradeTypeConfig,
  getEducationCategoriesByGroup,
  getEducationCategoryConfig,
  getEducationDetailOptions,
  getEducationDisplayTitle,
  getInstitutionLabel,
  mapEducationToFormDetail,
  mapEducationToFormMajor,
  resolveEducationCategory
} from '@/utils/educationUtils'

const initialFormData = {
  educationCategory: '',
  school: '',
  detail: '',
  major: '',
  highestQualification: '',
  startDate: '',
  endDate: '',
  isCurrentlyStudying: false,
  completionStatus: 'completed',
  gradeType: '',
  gradeObtained: '',
  gradeTotal: '',
  activities: '',
  description: ''
}

function mapEducationToFormData(education) {
  const category = resolveEducationCategory(education)
  const categoryConfig = getEducationCategoryConfig(category)

  return {
    educationCategory: category,
    school: education.school || '',
    detail: mapEducationToFormDetail(education),
    major: mapEducationToFormMajor(education),
    highestQualification: education.highestQualification || categoryConfig.label || '',
    startDate: education.startDate || '',
    endDate: education.endDate || '',
    isCurrentlyStudying: education.isCurrentlyStudying || false,
    completionStatus: education.isCurrentlyStudying ? 'in_progress' : education.completionStatus || 'completed',
    gradeType: education.gradeType || '',
    gradeObtained: education.gradeObtained || '',
    gradeTotal: education.gradeTotal || '',
    activities: education.activities || '',
    description: education.description || ''
  }
}

function EducationModal({
  open,
  onClose,
  onAddEducationToState,
  onUpdateEducationInState,
  editingEducation = null
}) {
  const [formData, setFormData] = useState(initialFormData)
  const [validationErrors, setValidationErrors] = useState({})
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  const categoryConfig = useMemo(
    () => getEducationCategoryConfig(formData.educationCategory),
    [formData.educationCategory]
  )

  const detailOptions = useMemo(
    () => getEducationDetailOptions(formData.educationCategory),
    [formData.educationCategory]
  )

  const groupedCategories = useMemo(() => getEducationCategoriesByGroup(), [])

  const showDetailField = Boolean(formData.educationCategory && categoryConfig.formMode !== 'none')
  const showMajorField = Boolean(formData.educationCategory && categoryConfig.showOptionalMajor)
  const useDetailAutocomplete = detailOptions.length > 0 && categoryConfig.formMode !== 'qualification'

  useEffect(() => {
    if (editingEducation) {
      setFormData(mapEducationToFormData(editingEducation))
    } else {
      setFormData(initialFormData)
    }
    setValidationErrors({})
  }, [editingEducation, open])

  useEffect(() => {
    if (formData.isCurrentlyStudying) {
      setFormData(prev => ({ ...prev, endDate: '', completionStatus: 'in_progress' }))
    } else {
      setFormData(prev =>
        prev.completionStatus === 'in_progress' ? { ...prev, completionStatus: 'completed' } : prev
      )
    }
  }, [formData.isCurrentlyStudying])

  function handleClose() {
    setFormData(initialFormData)
    setValidationErrors({})
    onClose()
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const gradeTypeConfig = useMemo(
    () => getGradeTypeConfig(formData.gradeType),
    [formData.gradeType]
  )

  const handleGradeTypeChange = gradeType => {
    if (!gradeType) {
      setFormData(prev => ({ ...prev, gradeType: '', gradeObtained: '', gradeTotal: '' }))
      return
    }

    const config = getGradeTypeConfig(gradeType)
    setFormData(prev => ({
      ...prev,
      gradeType,
      gradeObtained: '',
      gradeTotal: config?.defaultTotal || ''
    }))
  }

  const handleCategoryChange = categoryValue => {
    const config = getEducationCategoryConfig(categoryValue)
    setFormData(prev => {
      if (categoryValue === prev.educationCategory) return prev

      return {
        ...initialFormData,
        educationCategory: categoryValue,
        highestQualification: config.label
      }
    })
    setValidationErrors({})
  }

  function validateForm() {
    const errors = {}

    if (!formData.educationCategory) errors.educationCategory = 'Select your education type'
    if (!formData.school.trim()) errors.school = 'Institution name is required'

    if (categoryConfig.detailRequired && !formData.detail.trim()) {
      errors.detail = `${categoryConfig.detailLabel} is required`
    }

    if (formData.gradeType && formData.gradeObtained) {
      const obtained = parseFloat(formData.gradeObtained)
      const total = parseFloat(formData.gradeTotal)

      if (Number.isNaN(obtained) || obtained < 0) {
        errors.gradeObtained = 'Enter a valid obtained score'
      }

      if (formData.gradeTotal) {
        if (Number.isNaN(total) || total <= 0) {
          errors.gradeTotal = 'Enter a valid total score'
        } else if (!Number.isNaN(obtained) && obtained > total) {
          errors.gradeObtained = 'Obtained score cannot exceed total'
        }
      }
    } else if (formData.gradeType && !formData.gradeObtained.trim()) {
      errors.gradeObtained = 'Enter your obtained score'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSubmit() {
    setIsFormSubmitting(true)

    if (!validateForm()) {
      setIsFormSubmitting(false)
      return
    }

    try {
      const payload = buildEducationFromForm(formData)

      if (editingEducation) {
        onUpdateEducationInState({ ...payload, _id: editingEducation._id })
      } else {
        onAddEducationToState({ ...payload, _id: `temp_${Date.now()}` })
      }
      onClose()
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const institutionLabel = formData.educationCategory
    ? categoryConfig.institutionLabel
    : getInstitutionLabel(formData.highestQualification, formData.educationCategory)

  const renderDetailField = () => {
    if (!showDetailField) return null

    if (useDetailAutocomplete) {
      return (
        <Autocomplete
          key={formData.educationCategory}
          freeSolo
          options={detailOptions}
          value={formData.detail}
          onChange={(_, value) => handleFormChange('detail', value || '')}
          onInputChange={(_, value) => handleFormChange('detail', value)}
          renderInput={params => (
            <TextField
              {...params}
              required={categoryConfig.detailRequired}
              label={categoryConfig.detailLabel}
              placeholder={categoryConfig.detailPlaceholder}
              error={Boolean(validationErrors.detail)}
              helperText={
                validationErrors.detail || 'Select from list or type your own'
              }
            />
          )}
        />
      )
    }

    return (
      <TextField
        fullWidth
        required={categoryConfig.detailRequired}
        label={categoryConfig.detailLabel}
        value={formData.detail}
        placeholder={categoryConfig.detailPlaceholder}
        onChange={e => handleFormChange('detail', e.target.value)}
        error={Boolean(validationErrors.detail)}
        helperText={validationErrors.detail}
      />
    )
  }

  return (
    <Grid xs={12} sm={8} md={6}>
      <Dialog sx={{ width: '100%', margin: 'auto' }} open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>

        <DialogContent>
          <form>
            <Grid container spacing={3} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={Boolean(validationErrors.educationCategory)}>
                  <InputLabel>Education Type</InputLabel>
                  <Select
                    value={formData.educationCategory}
                    onChange={e => handleCategoryChange(e.target.value)}
                    label='Education Type'
                    MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                  >
                    {groupedCategories.map(({ group, categories }) => [
                      <ListSubheader key={group} sx={{ fontWeight: 700, lineHeight: '32px' }}>
                        {group}
                      </ListSubheader>,
                      ...categories.map(category => (
                        <MenuItem key={category.value} value={category.value} sx={{ pl: 3 }}>
                          {category.label}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                  {validationErrors.educationCategory && (
                    <FormHelperText>{validationErrors.educationCategory}</FormHelperText>
                  )}
                  {categoryConfig.durationHint && (
                    <FormHelperText>{categoryConfig.durationHint}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  disabled={!formData.educationCategory}
                  label={`${institutionLabel} name`}
                  value={formData.school}
                  placeholder={
                    formData.educationCategory
                      ? categoryConfig.institutionPlaceholder
                      : 'Select education type first'
                  }
                  onChange={e => handleFormChange('school', e.target.value)}
                  error={Boolean(validationErrors.school)}
                  helperText={validationErrors.school || `${institutionLabel} where you studied`}
                />
              </Grid>

              {showDetailField && <Grid item xs={12}>{renderDetailField()}</Grid>}

              {showMajorField && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={categoryConfig.majorLabel || 'Major / Subject'}
                    value={formData.major}
                    placeholder={categoryConfig.majorPlaceholder || 'Ex: Physics, Finance'}
                    onChange={e => handleFormChange('major', e.target.value)}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isCurrentlyStudying}
                      onChange={(e, checked) => handleFormChange('isCurrentlyStudying', checked)}
                    />
                  }
                  label='I am currently studying here'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    label='Start date'
                    views={['year', 'month']}
                    format='MMM YYYY'
                    value={formData.startDate ? dayjs(formData.startDate) : null}
                    onChange={value => handleFormChange('startDate', value ? value.startOf('month') : '')}
                    slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    sx={{ width: '100%' }}
                    label={formData.isCurrentlyStudying ? 'Expected end date' : 'End date'}
                    views={['year', 'month']}
                    format='MMM YYYY'
                    value={formData.endDate ? dayjs(formData.endDate) : null}
                    disabled={formData.isCurrentlyStudying}
                    onChange={value => handleFormChange('endDate', value ? value.startOf('month') : '')}
                    minDate={formData.startDate ? dayjs(formData.startDate) : undefined}
                    slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              {!formData.isCurrentlyStudying && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Completion Status</InputLabel>
                    <Select
                      value={formData.completionStatus}
                      onChange={e => handleFormChange('completionStatus', e.target.value)}
                      label='Completion Status'
                    >
                      {educationCompletionStatusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Grade / Score Type</InputLabel>
                  <Select
                    value={formData.gradeType}
                    onChange={e => handleGradeTypeChange(e.target.value)}
                    label='Grade / Score Type'
                  >
                    <MenuItem value=''>
                      <em>None</em>
                    </MenuItem>
                    {EDUCATION_GRADE_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Optional — choose CGPA, Percentage, or Marks</FormHelperText>
                </FormControl>
              </Grid>

              {formData.gradeType && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type='number'
                      inputProps={{ min: 0, step: formData.gradeType === 'cgpa' ? '0.01' : '1' }}
                      label={gradeTypeConfig?.obtainedLabel || 'Score obtained'}
                      value={formData.gradeObtained}
                      placeholder={gradeTypeConfig?.obtainedPlaceholder}
                      onChange={e => handleFormChange('gradeObtained', e.target.value)}
                      error={Boolean(validationErrors.gradeObtained)}
                      helperText={validationErrors.gradeObtained}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type='number'
                      inputProps={{ min: 0, step: formData.gradeType === 'cgpa' ? '0.01' : '1' }}
                      label={gradeTypeConfig?.totalLabel || 'Total score'}
                      value={formData.gradeTotal}
                      placeholder={gradeTypeConfig?.totalPlaceholder}
                      onChange={e => handleFormChange('gradeTotal', e.target.value)}
                      error={Boolean(validationErrors.gradeTotal)}
                      helperText={
                        validationErrors.gradeTotal ||
                        (formData.gradeType === 'cgpa'
                          ? 'Default total is 10'
                          : formData.gradeType === 'percentage'
                            ? 'Default total is 100'
                            : 'Enter total marks')
                      }
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Activities and societies'
                  value={formData.activities}
                  placeholder='Ex: NSS, Coding Club, Sports captain'
                  onChange={e => handleFormChange('activities', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  multiline
                  rows={4}
                  value={formData.description}
                  placeholder='Write a brief description of your education experience.'
                  onChange={e => handleFormChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions>
          <Grid item xs={12} mt={2}>
            <Stack direction='row' spacing={2} justifyContent='center' sx={{ pb: 2 }}>
              <Button variant='outlined' onClick={handleClose} disabled={isFormSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                component='label'
                variant='contained'
                color='primary'
                sx={{ color: 'white' }}
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Saving...' : editingEducation ? 'Update' : 'Save education'}
              </Button>
            </Stack>
          </Grid>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export function EducationViewModal({ open, onClose, education, onEdit }) {
  function handleEdit() {
    onEdit(education)
    onClose()
  }

  if (!education) return null

  const category = resolveEducationCategory(education)
  const categoryConfig = getEducationCategoryConfig(category)
  const institutionLabel = getInstitutionLabel(education.highestQualification, category)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Education Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <DialogContentText component='div'>
            <Box sx={{ mb: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                {getEducationDisplayTitle(education)}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Education Type
              </Typography>
              <Typography variant='body1'>{categoryConfig.label || education.highestQualification}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {institutionLabel}
              </Typography>
              <Typography variant='body1'>{education.school}</Typography>
            </Box>

            {categoryConfig.formMode === 'class' && education.degree && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Class / Standard
                </Typography>
                <Typography variant='body1'>{education.degree}</Typography>
              </Box>
            )}

            {categoryConfig.formMode === 'specialization' && education.fieldOfStudy && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {categoryConfig.detailLabel}
                </Typography>
                <Typography variant='body1'>{education.fieldOfStudy}</Typography>
              </Box>
            )}

            {categoryConfig.formMode === 'program' && education.degree && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {categoryConfig.detailLabel}
                </Typography>
                <Typography variant='body1'>{education.degree}</Typography>
              </Box>
            )}

            {categoryConfig.formMode === 'program' && education.fieldOfStudy && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {categoryConfig.majorLabel || 'Specialization'}
                </Typography>
                <Typography variant='body1'>{education.fieldOfStudy}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Duration
              </Typography>
              <Typography variant='body1'>{formatEducationDuration(education)}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Completion Status
              </Typography>
              <Typography variant='body1'>
                {getCompletionStatusLabel(
                  education.isCurrentlyStudying ? 'in_progress' : education.completionStatus || 'completed'
                )}
              </Typography>
            </Box>

            {formatEducationGrade(education) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Grade / Score
                </Typography>
                <Typography variant='body1'>{formatEducationGrade(education)}</Typography>
              </Box>
            )}

            {education.activities && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Activities and Societies
                </Typography>
                <Typography variant='body1'>{education.activities}</Typography>
              </Box>
            )}

            {education.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant='body1'>{education.description}</Typography>
              </Box>
            )}
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
        <Button onClick={handleEdit} variant='contained' component='label' color='primary' sx={{ color: 'white' }} startIcon={<EditIcon />}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EducationModal
