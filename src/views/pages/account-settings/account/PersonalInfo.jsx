import React from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import PhoneVerification from './PhoneVerification'
import { motherTongueLanguagesData } from '@/data/userprofile/mothertonguelanguage'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import EditNoteIcon from '@mui/icons-material/EditNote'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// react-icons Imports
import { RiAddFill, RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'

const casteOptions = [
  'Brahmin',
  'Kshatriya',
  'Vaishya',
  'Shudra',
  'Dalit',
  'Adivasi',
  'OBC',
  'SC',
  'ST',
  'General',
  'Other'
]

const categoryOptions = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority Community', 'Other']

const religionOptions = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'christian', label: 'Christian' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'jain', label: 'Jain' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'bahai', label: 'Bahai' },
  { value: 'indigenous', label: 'Indigenous/Tribal' },
  { value: 'spiritual_not_religious', label: 'Spiritual but not Religious' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'other', label: 'Other' }
]

function PersonelInfo({
  formData,
  handleFormChange,
  isFormValid,
  phoneProps,
  getLanguageLabel,
  handleDeleteChipFromMultiSelect,
  handleDeleteLanguage,
  handleOpenModal,
  languageOptions,
  languageDetails,
  handleEditLanguage
}) {
  return (
    <>
      {/* ----Personal Information---- */}
      <Grid item xs={12} marginLeft={'0.25rem'}>
        <Divider> Personal Information </Divider>
      </Grid>
      {/* First Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='firstname'
          label='First Name'
          value={formData.firstname}
          placeholder='John'
          onChange={e => handleFormChange('firstname', e.target.value)}
        />
      </Grid>

      {/* Last Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name='lastname'
          label='Last Name'
          value={formData.lastname}
          placeholder='Doe'
          onChange={e => handleFormChange('lastname', e.target.value)}
        />
      </Grid>

      {/* Nick Name */}
      {formData.accountType === 'INDIVIDUAL' && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name='nickname'
            label='Nick Name'
            value={formData.nickname}
            placeholder='Doe'
            onChange={e => handleFormChange('nickname', e.target.value)}
          />
        </Grid>
      )}

      {/* Gender */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            name='gender'
            label='Gender'
            value={formData.gender}
            onChange={e => handleFormChange('gender', e.target.value)}
          >
            <MenuItem value='male'>Male</MenuItem>
            <MenuItem value='female'>Female</MenuItem>
            <MenuItem value='transgender'>Transgender</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Age */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Age'
          name='age'
          type='number'
          value={formData.age}
          InputProps={{
            inputProps: {
              min: 6,
              max: 120,
              step: 1,
              maxLength: 3
            }
          }}
          error={formData.age && (formData.age < 6 || formData.age > 120 || formData.age.toString().length > 3)}
          helperText={
            formData.age && formData.age.toString().length > 3
              ? 'Age cannot have more than 3 digits'
              : formData.age && formData.age < 6
                ? 'Age must be at least 6 years'
                : formData.age && formData.age > 120
                  ? 'Age cannot be more than 120 years'
                  : ''
          }
          placeholder='21'
          onChange={e => {
            const value = e.target.value
            // Prevent input if more than 3 digits
            if (value && value.toString().length > 3) {
              return
            }
            handleFormChange('age', value)
          }}
        />
      </Grid>

      {/* Email */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          disabled
          label='Email'
          name='email'
          value={formData.email}
          placeholder='john.doe@gmail.com'
          onChange={e => handleFormChange('email', e.target.value)}
        />
      </Grid>

      {/* Account Type */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Account Type</InputLabel>
          <Select
            label='Account Type'
            name='accountType'
            value={formData.accountType}
            onChange={e => handleFormChange('accountType', e.target.value)}
          >
            <MenuItem value='INDIVIDUAL'>Individual</MenuItem>
            <MenuItem value='BUSINESS'>Business</MenuItem>
            <MenuItem value='NGO'>NGO</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Phone Number */}
      <Grid item xs={12} sm={6}>
        <PhoneVerification {...phoneProps} />
      </Grid>

      {/* Languages */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Languages</InputLabel>
          <Select
            multiple
            name='knownLanguageIds'
            label='Languages'
            value={formData.knownLanguageIds}
            onChange={() => {}}
            renderValue={selected => (
              <div className='flex flex-wrap gap-2'>
                {selected &&
                  selected.length > 0 &&
                  selected.map(value => (
                    <Chip
                      key={value}
                      clickable
                      deleteIcon={
                        <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()}></i>
                      }
                      size='small'
                      label={getLanguageLabel(value)}
                      onDelete={() => handleDeleteLanguage(value)}
                    />
                  ))}
              </div>
            )}
          >
            {languageDetails.map(each => (
              <MenuItem key={each._id} value={each._id} onClick={event => event.preventDefault()}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {each.language}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                      {each.canSpeak && <RecordVoiceOverIcon fontSize='small' titleAccess='Can speak' />}
                      {each.canRead && <MenuBookIcon fontSize='small' titleAccess='Can read' />}
                      {each.canWrite && <EditNoteIcon fontSize='small' titleAccess='Can write' />}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      size='small'
                      onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        handleEditLanguage(each._id)
                      }}
                    >
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        handleDeleteLanguage(each._id)
                      }}
                    >
                      <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          startIcon={<RiAddFill />}
          sx={{ alignSelf: 'flex-start' }}
          variant='text'
          color='primary'
          onClick={() => handleOpenModal('language')}
        >
          Add New Language
        </Button>
      </Grid>

      {/* Mother Tongue */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Mother Tongue</InputLabel>
          <Select
            name='motherTongue'
            label='Mother Tongue'
            value={formData.motherTongue}
            onChange={e => handleFormChange('motherTongue', e.target.value)}
          >
            {motherTongueLanguagesData.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Religion */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Religion</InputLabel>
          <Select
            label='Religion'
            name='religion'
            value={formData.religion}
            onChange={e => handleFormChange('religion', e.target.value)}
          >
            {religionOptions.map(religion => (
              <MenuItem key={religion.value} value={religion.value}>
                {religion.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Caste */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Caste</InputLabel>
          <Select
            name='caste'
            label='Caste'
            value={formData.caste}
            onChange={e => handleFormChange('caste', e.target.value)}
          >
            {casteOptions.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Category */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            name='category'
            label='Category'
            value={formData.category}
            onChange={e => handleFormChange('category', e.target.value)}
          >
            {categoryOptions.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}

export default PersonelInfo
