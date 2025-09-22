import React from 'react'
import { Button, Chip, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import PhoneVerification from './PhoneVerification'

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

const categoryOptions = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other']

const motherTongueLanguagesData = [
  'Arabic',
  'Assamese',
  'Awadhi',
  'Bengali',
  'Bhojpuri',
  'Chinese',
  'English',
  'French',
  'German',
  'Gujarati',
  'Hindi',
  'Haryanvi',
  'Kannada',
  'Konkani',
  'Magahi',
  'Malayalam',
  'Marathi',
  'Nepali',
  'Odia',
  'Portuguese',
  'Punjabi',
  'Sanskrit',
  'Sindhi',
  'Tamil',
  'Telugu',
  'Urdu'
]

const religionOptions = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'christian', label: 'Christian' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'jain', label: 'Jain' },
  { value: 'zoroastrian', label: 'Zoroastrian' },
  { value: 'pagan', label: 'Pagan' },
  { value: 'islam', label: 'Islam' },
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
  languageOptions
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
            onChange={e => handleFormChange('knownLanguageIds', e.target.value)}
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
            {languageOptions.map(each => (
              <MenuItem key={each.value} value={each.value}>
                {each.label}
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
