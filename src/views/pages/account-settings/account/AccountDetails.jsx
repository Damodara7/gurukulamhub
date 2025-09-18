'use client'

import countryList from 'react-select-country-list'
import ReactCropperComponet, { ReactCropperComponent } from './ReactCropperComponent'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

// Components Imports
import SearchableSelect from './SearchableSelect'
import EducationModal from './EducationModal'
import NewAssociatedOrganization from './NewAssociatedOrganization'
import NewLanguageModal from './NewLanguageModal'
import CurrentWorkingPositionModal from './CurrentWorkingPositionModal'
import CircularProgressWithValueLabel from './CircularProgressWithValueLabel'

// Country region data
import { CountryRegionData } from '../../../../data/regions'
import { countries } from '@/data/countries'
import { countriesWithRegex } from '../../../../data/countries-regex'

// react-phone-input-2 Imports
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// Mui-file-input Imports
import { MuiFileInput } from 'mui-file-input'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// react-icons Imports
import { RiAddFill, RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CropIcon from '@mui/icons-material/Crop'

// MUI Imports
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import {
  getFileFromS3,
  convertFileToBufferFile,
  deleteFileFromS3,
  uploadFileToS3,
  deleteFileWithUnknownExtension,
  userProfileBucketName,
  getFileFromS3WithUnknownExtension,
  getFileExtension,
  getFileUrlFromS3WithUnknownExtension
} from '@/utils/awsS3Utils'
import * as clientApi from '@/app/api/client/client.api'
import { calculateProfileCompletion } from '@/utils/profileUtils'

import PersonalInfo from './PersonalInfo'
import VoterIdInfo from './VoterIdInfo'
import AddressInfo from './AddressInfo'
import SocialMediaInfo from './SocialMediaInfo'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Vars
const initialData = {
  email: '',
  password: '',
  firstname: '',
  lastname: '',
  gender: '',
  age: '',
  accountType: '',
  phone: '',
  street: '',
  colony: '',
  village: '',
  country: '',
  countryCode: '',
  countryDialCode: '',
  region: '',
  zipcode: '',
  locality: '',
  timezone: '',
  religion: '',
  caste: '',
  category: '',
  knownLanguageIds: [],
  motherTongue: '',
  voterId: {
    epicNumber: '',
    frontImage: '',
    backImage: ''
  },
  schools: [],
  currentSchoolId: '',
  currentWorkingPositionId: '',
  linkedInUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  openToWork: false,
  hiring: false,
  organization: '',
  websiteUrl: '',
  activeAssociatedOrganizationIds: [],

  nickname: '',
  organizationRegistrationNumber: '',
  organizationGSTNumber: '',
  organizationPANNumber: ''
}

const AccountDetails = () => {
  // Country options
  // const options = useMemo(() => countryList().getData(), [])

  const { data: session } = useSession()

  const theme = useTheme()

  // States
  const [formData, setFormData] = useState(initialData)
  const [fileInput, setFileInput] = useState(null)
  const [resumeFileInput, setResumeFileInput] = useState(null)

  const [organizationRegistrationDocument, setOrganizationRegistrationDocument] = useState(null)
  const [organizationGSTDocument, setOrganizationGSTDocument] = useState(null)
  const [organizationPANDocument, setOrganizationPANDocument] = useState(null)

  const [imgSrc, setImgSrc] = useState(null)

  const [isEpicValid, setIsEpicValid] = useState(true) // State to manage EPIC validity
  const [isUrlsValid, setIsUrlsValid] = useState({ instagramUrl: true, linkedInUrl: true, facebookUrl: true }) // State to
  const [isModalOpen, setIsModalOpen] = useState({
    language: false,
    education: false,
    workingPosition: false,
    associatedOrganization: false
  })
  const [editingEducation, setEditingEducation] = useState(null)
  const [editingWorkingPosition, setEditingWorkingPosition] = useState(null)
  const [editingAssociatedOrganization, setEditingAssociatedOrganization] = useState(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isFormValid, setIsFormValid] = useState(true)
  const [getLoading, setGetLoading] = useState(false)
  const [languageOptions, setLanguageOptions] = useState([])
  const [associatedOrganizationOptions, setAssociatedOrganizationOptions] = useState([])
  const [schoolOptions, setSchoolOptions] = useState([])
  const [workingPositionOptions, setWorkingPositionOptions] = useState([])
  const [shouldRefetchData, setShouldRefetchData] = useState(false)
  const [profilePercentage, setProfilePercentage] = useState(0)
  const [voterIdPhotos, setVoterIdPhotos] = useState({ front: '', back: '' })
  const [voterIdPhotoFiles, setVoterIdPhotoFiles] = useState({ front: '', back: '' })
  const [isCropMode, setIsCropMode] = useState({ front: false, back: false })
  const [profileData, setProfileData] = useState(null)

  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [zipcodeFromDb, setZipcodeFromDb] = useState('')
  const [localityFromDb, setLocalityFromDb] = useState('')
  const [selectedZipcode, setSelectedZipcode] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [postOffices, setPostOffices] = useState([])
  const [loadingPincodesOrPostOffices, setLoadingPincodesOrPostOffices] = useState(false)
  const [pinCodes, setPinCodes] = useState([])

  const [phoneInput, setPhoneInput] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [countryDialCode, setCountryDialCode] = useState('')
  const [countryCode, setCountryCode] = useState('')

  useEffect(() => {
    if (session && session.user) {
      if (session.user.email) {
        setFormData({ ...formData, email: session.user.email })
      }
      if (session.user.image) {
        setImgSrc(session.user.image)
      }
    }
  }, [session])

  useEffect(() => {
    setFormData(prev => ({ ...prev, country: selectedCountry }))
  }, [selectedCountry])
  useEffect(() => {
    setFormData(prev => ({ ...prev, region: selectedRegion }))
  }, [selectedRegion])
  useEffect(() => {
    setFormData(prev => ({ ...prev, zipcode: selectedZipcode }))
  }, [selectedZipcode])
  useEffect(() => {
    setFormData(prev => ({ ...prev, locality: selectedLocality }))
  }, [selectedLocality])

  async function getProfilePhoto() {
    // image url
    try {
      const fileUrl = await getFileUrlFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/profile_photo`
      })
      console.log('Profile photo url: ', fileUrl)
      if (fileUrl) {
        setImgSrc(fileUrl)
      }
    } catch (error) {
      console.log('Error getting profile photo url: ', error)
    }

    // actual file
    try {
      const file = await getFileFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/profile_photo`
      })
      console.log('Profile photo file: ', file)
      if (file) {
        setFileInput(file)
      } else {
        console.log('No profile photo file found')
        setFileInput(null)
      }
    } catch (err) {
      console.log('Error getting profile photo file: ', err)
    }
  }
  async function getResumeFile() {
    try {
      const file = await getFileFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/resume`
      })
      console.log('Resume file: ', file)
      if (file) {
        setResumeFileInput(file)
      } else {
        console.log('No resume file found')
        setResumeFileInput(null)
      }
    } catch (err) {
      console.log('Error getting resume file: ', err)
    }
  }
  async function getOrganizationRegistrationDoc() {
    try {
      const file = await getFileFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/organization_registration`
      })
      console.log('Reg file: ', file)
      if (file) {
        setOrganizationRegistrationDocument(file)
      } else {
        console.log('No reg file found')
        setOrganizationRegistrationDocument(null)
      }
    } catch (err) {
      console.log('Error getting reg file: ', err)
    }
  }
  async function getOrganizationGSTDoc() {
    try {
      const file = await getFileFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/organization_gst`
      })
      console.log('GST file: ', file)
      if (file) {
        setOrganizationGSTDocument(file)
      } else {
        console.log('No GST file found')
        setOrganizationGSTDocument(null)
      }
    } catch (error) {
      console.log('Error getting GST file: ', error)
    }
  }
  async function getOrganizationPANDoc() {
    try {
      const file = await getFileFromS3WithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: `${session?.user?.email}/organization_pan`
      })
      console.log('PAN file: ', file)
      if (file) {
        setOrganizationPANDocument(file)
      } else {
        console.log('No PAN file found')
        setOrganizationPANDocument(null)
      }
    } catch (error) {
      console.log('Error getting PAN file: ', error)
    }
  }

  useEffect(() => {
    async function getData() {
      // toast.success('Fetching user profile now...')
      setGetLoading(true)
      const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}/${session.user.email}`)
      // const result = await clientApi.getUserProfileByEmail(session.user.email)

      console.log('RESULT: ', result)
      if (result?.status === 'success') {
        console.log('User profile Fetched result', result)
        const { profile, user } = result?.result

        const profileCompletionPercentage = calculateProfileCompletion(profile)
        console.log(`Profile Completion Percentage: ${profileCompletionPercentage}%`)
        setProfilePercentage(profileCompletionPercentage)
        // toast.success('User profile Fetched Successfully .')
        setGetLoading(false)
        // Filter out education data for non-INDIVIDUAL account types
        let filteredProfile = { ...profile }
        if (profile?.accountType !== 'INDIVIDUAL') {
          filteredProfile = {
            ...profile,
            schools: [],
            currentSchoolId: ''
          }
        }

        setFormData({ ...formData, ...filteredProfile, memberId: user?.memberId })
        setProfileData(profile) // Keep original profile data for other purposes

        // Handle voter ID data
        if (profile?.voterId) {
          if (typeof profile.voterId === 'string') {
            // Handle old string format
            setFormData(prev => ({
              ...prev,
              voterId: {
                ...prev.voterId,
                epicNumber: profile.voterId
              }
            }))
          } else if (typeof profile.voterId === 'object') {
            // Handle new object format
            setFormData(prev => ({
              ...prev,
              voterId: {
                epicNumber: profile.voterId.epicNumber || '',
                frontImage: profile.voterId.frontImage || '',
                backImage: profile.voterId.backImage || ''
              }
            }))

            // Set voter ID photos for display
            setVoterIdPhotos({
              front: profile.voterId.frontImage || '',
              back: profile.voterId.backImage || ''
            })

            // Set crop mode to false for existing images (they should display normally)
            setIsCropMode({
              front: !profile.voterId.frontImage, // Only show crop mode if no image exists
              back: !profile.voterId.backImage // Only show crop mode if no image exists
            })
          }
        } else {
          // No voter ID data exists, reset to initial state
          setVoterIdPhotos({ front: '', back: '' })
          setIsCropMode({ front: false, back: false })
        }

        if (profile?.image) {
          setImgSrc(profile.image)
        }
        if (profile?.schools?.length > 0) {
          setSchoolOptions(profile.schools.map(item => ({ value: item._id, label: item.school })))
        }
        if (profile?.workingPositions?.length > 0) {
          setWorkingPositionOptions(profile.workingPositions.map(item => ({ value: item._id, label: item.title })))
        }
        if (profile?.languages?.length > 0) {
          setLanguageOptions(profile.languages.map(item => ({ value: item._id, label: item.language })))
        }
        if (profile?.associatedOrganizations?.length > 0) {
          setAssociatedOrganizationOptions(
            profile.associatedOrganizations.map(item => ({ value: item._id, label: item.organization }))
          )
        }
        if (profile?.country) {
          setSelectedCountry(profile.country)
        }
        if (profile?.region) {
          setSelectedRegion(profile.region)
        }
        if (profile?.zipcode) {
          setZipcodeFromDb(profile?.zipcode)
          setSelectedZipcode(profile?.zipcode)
        }
        if (profile?.locality) {
          setLocalityFromDb(profile?.locality)
          setSelectedLocality(profile?.locality)
        }
        if (profile?.phone && profile?.countryDialCode) {
          setPhoneInput(profile?.countryDialCode + profile?.phone)
          validatePhone(profile?.countryDialCode + profile?.phone, profile?.countryDialCode)
        }
        if (profile?.countryCode) {
          setCountryCode(profile.countryCode)
          // Map country code to country name
          const countryObj = CountryRegionData.find(
            data => data[1]?.toLowerCase() === profile.countryCode?.toLowerCase()
          )

          if (countryObj) {
            // console.log('Mapped Country Object:', countryObj)
            setSelectedCountryObject({ country: countryObj[0], countryCode: countryObj[1] })
            setSelectedCountry(countryObj[0])
          }
        }
        if (profile?.countryDialCode) {
          setCountryDialCode(profile.countryDialCode)
        }

        // Getting files as per account type

        await getProfilePhoto() // Common for Individual & Organization

        if (profile?.accountType === 'INDIVIDUAL') {
          await getResumeFile()
        } else {
          await getOrganizationRegistrationDoc()
          await getOrganizationGSTDoc()
          await getOrganizationPANDoc()
        }
        // handleClose();
      } else {
        // toast.error('Error:' + result.message)
        setGetLoading(false)
        // setFormData({ ...formData, ...profile })
      }
    }

    if (session && session.user && session.user.email) {
      getData()
    }
    console.log('THE USER PROFILE RESULT ')
  }, [session, shouldRefetchData])

  useEffect(() => {
    if (selectedRegion) {
      setSelectedLocality('')
      setSelectedZipcode('')
      setPinCodes([])
      fetchPinCodesForState(selectedRegion)
    }
  }, [selectedRegion])

  const fetchPinCodesForState = async selectedStateName => {
    console.log('Selected selectedStateName:', selectedStateName)
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`http://localhost:3000/api/pincodes/${selectedStateName}`)

      const data = await response.json()
      console.log('pinCode data...', data)
      setPinCodes(data?.PinCodes || [])
    } catch (e) {
      setLoadingPincodesOrPostOffices(false)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  const fetchPostOffices = async selectedZipcode => {
    console.log('Selected zipcode Object:', selectedZipcode)
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`http://localhost:3000/api/localities/${selectedZipcode}`)

      const data = await response.json()
      console.log('pincode data...', data)

      setPostOffices(data?.localities || []) // Assuming data is an array of post office objects
    } catch (error) {
      console.error('Error fetching post offices:', error)
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  useEffect(() => {
    if (zipcodeFromDb) {
      setSelectedZipcode(zipcodeFromDb)
    }
  }, [pinCodes])
  useEffect(() => {
    if (localityFromDb) {
      setSelectedLocality(localityFromDb)
    }
  }, [postOffices])

  useEffect(() => {
    if (selectedZipcode) {
      fetchPostOffices(selectedZipcode)
    }
  }, [selectedZipcode])

  const getCountryCodeByCountry = countryName => {
    const result = CountryRegionData.find(([country]) => country === countryName)
    return result ? result[1] : null
  }

  function handleCloseModal(identifier) {
    setIsModalOpen(prev => ({ ...prev, [identifier]: false }))
  }
  function handleOpenModal(identifier) {
    setIsModalOpen(prev => ({ ...prev, [identifier]: true }))
  }

  function handleEditEducation(school) {
    setEditingEducation(school)
    setIsModalOpen(prev => ({ ...prev, education: true }))
  }

  async function handleDeleteEducation(schoolId) {
    if (!schoolId) return

    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_PROFILE}/schools?id=${schoolId}`)
      if (response.status === 'success') {
        console.log('Education deleted successfully')
        toast.success('Education deleted successfully.')
        handleRefetchUserProfileData()
      } else {
        toast.error('Error: ' + response.message)
        console.error('Error deleting education:', response.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Error deleting education:', error)
    }
  }

  function handleEditWorkingPosition(position) {
    setEditingWorkingPosition(position)
    setIsModalOpen(prev => ({ ...prev, workingPosition: true }))
  }

  async function handleDeleteWorkingPosition(positionId) {
    if (!positionId) return

    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_PROFILE}/working-positions?id=${positionId}`)
      if (response.status === 'success') {
        console.log('Working position deleted successfully')
        toast.success('Working position deleted successfully.')
        handleRefetchUserProfileData()
      } else {
        toast.error('Error: ' + response.message)
        console.error('Error deleting working position:', response.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Error deleting working position:', error)
    }
  }

  function handleEditAssociatedOrganization(organization) {
    setEditingAssociatedOrganization(organization)
    setIsModalOpen(prev => ({ ...prev, associatedOrganization: true }))
  }

  async function handleDeleteAssociatedOrganization(organizationId) {
    if (!organizationId) return

    try {
      const response = await RestApi.del(`${API_URLS.v0.USERS_PROFILE}/associated-organizations?id=${organizationId}`)
      if (response.status === 'success') {
        console.log('Associated organization deleted successfully')
        toast.success('Associated organization deleted successfully.')
        handleRefetchUserProfileData()
      } else {
        toast.error('Error: ' + response.message)
        console.error('Error deleting associated organization:', response.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred.')
      console.error('Error deleting associated organization:', error)
    }
  }

  const handleDeleteChipFromMultiSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field]].filter(each => each !== value) }))
  }

  function validateUrl(field, value) {
    if (field === 'linkedInUrl') {
      const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
      return linkedinRegex.test(value)
    } else if (field === 'facebookUrl') {
      const facebookRegex = /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/
      return facebookRegex.test(value)
    } else if (field === 'instagramUrl') {
      const instagramRegex = /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/
      return instagramRegex.test(value)
    }
  }

  function handleRefetchUserProfileData() {
    setShouldRefetchData(prev => !prev)
  }

  const handleFormChange = (field, value) => {
    if (field === 'voterId') {
      setIsEpicValid(validateEpic(value)) // Validate EPIC format
      setFormData(prev => ({
        ...prev,
        voterId: {
          ...prev.voterId,
          epicNumber: value
        }
      }))
      return
    }
    if (field === 'linkedInUrl') {
      setIsUrlsValid(prev => ({ ...prev, [field]: validateUrl(field, value) }))
    }
    if (field === 'facebookUrl') {
      setIsUrlsValid(prev => ({ ...prev, [field]: validateUrl(field, value) }))
    }
    if (field === 'instagramUrl') {
      setIsUrlsValid(prev => ({ ...prev, [field]: validateUrl(field, value) }))
    }
    setFormData(prev => ({ ...prev, [field]: value }))
    console.log('Value: ', value, typeof value)
  }

  const handleFileInputChange = event => {
    console.log('photo file event', event)
    const { files } = event.target
    console.log('photo file', files[0])

    if (files && files.length > 0) {
      const file = files[0] // Get the first file object

      // Use FileReader to preview the image
      const reader = new FileReader()
      reader.onload = () => {
        setImgSrc(reader.result) // Set image preview
      }
      reader.readAsDataURL(file) // Read file for preview

      // Set the actual file object as fileInput
      setFileInput(file)
    }
  }

  const handleResumeFileInputChange = file => {
    console.log('resume file', file)
    setResumeFileInput(file)
  }

  const handleFileInputChangeByFieldName = (fieldName, file) => {
    console.log('resume file', file)
    if (fieldName === 'organizationRegistrationDocument') {
      setOrganizationRegistrationDocument(file)
    } else if (fieldName === 'organizationGSTDocument') {
      setOrganizationGSTDocument(file)
    } else if (fieldName === 'organizationPANDocument') {
      setOrganizationPANDocument(file)
    }
  }

  const validateEpic = epic => {
    // Check if EPIC is exactly 10 characters (numbers and letters)
    if (epic.length !== 10) {
      return false
    }

    // Check if all characters are alphanumeric (letters and numbers)
    if (!/^[A-Za-z0-9]{10}$/.test(epic)) {
      return false
    }

    return true
  }

  function getLanguageLabel(value) {
    return languageOptions.find(option => option.value === value)?.label || 'Unknown'
  }

  function getAssocaiatedOrganizationLabel(value) {
    return associatedOrganizationOptions.find(option => option.value === value)?.label || 'Unknown'
  }

  function getPhoneWithoutCountryDialCode(phoneInput, countryDialCode) {
    return phoneInput.startsWith(countryDialCode) ? phoneInput.slice(countryDialCode.length) : phoneInput
  }

  function handleChangeCountry(countryValue) {
    setSelectedRegion('') // Reset region when country changes
    setCountryCode(countryValue?.countryCode || '')

    if (countryValue) {
      const countryObj = countries.find(country => country.countryCode === countryValue.countryCode)
      if (countryObj) {
        if (formData.countryDialCode !== +countryObj.countryDialCode) {
          setCountryDialCode(countryObj.countryDialCode)
          setPhoneInput('')
        } else {
          setPhoneInput(formData.countryDialCode + formData.phone)
        }
      }
    }
  }

  function handleResetFiles() {
    setFileInput(null)
    setImgSrc('/images/avatars/1.png')
    setResumeFileInput(null)
    setOrganizationRegistrationDocument(null)
    setOrganizationGSTDocument(null)
    setOrganizationPANDocument(null)
  }

  function handleResetForm() {
    setFormData(initialData)
    setPhoneInput('')
    setPhoneValid(false)
    setIsPhoneVerified(false)
    setCountryDialCode('')
    setCountryCode('')
    handleResetFiles()
    setShouldRefetchData(prev => !prev)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    console.log(formData)
    console.log('photo file: ', fileInput)
    console.log('resume file: ', resumeFileInput)
    console.log('reg file: ', organizationRegistrationDocument)
    console.log('GST file: ', organizationGSTDocument)
    console.log('PAN file: ', organizationPANDocument)

    // return
    setIsFormSubmitting(true)
    // toast.success('Updating user profile...')

    if (
      (formData.age && (+formData.age > 120 || +formData.age < 6)) ||
      (formData.linkedInUrl && !isUrlsValid.linkedInUrl) ||
      (formData.facebookUrl && !isUrlsValid.facebookUrl) ||
      (formData.instagramUrl && !isUrlsValid.instagramUrl)
    ) {
      setIsFormValid(false)
      setIsFormSubmitting(false)
      // toast.error('Invalid form data. Recheck and submit valid data.')
      return
    }

    setIsFormValid(true)

    let allFormData = {}

    for (let key in formData) {
      if (typeof formData[key] === 'string') {
        if (formData[key].trim() !== '') {
          allFormData[key] = formData[key]
        }
      } else if (Array.isArray(formData[key])) {
        if (formData[key].length > 0) {
          allFormData[key] = formData[key]
        }
      } else if (typeof formData[key] !== 'NaN') {
        allFormData[key] = formData[key]
      }
    }

    let data = { ...allFormData, age: +allFormData.age }

    if (phoneInput && phoneValid && isPhoneVerified) {
      console.log({ phoneInput, countryDialCode })
      const phone = getPhoneWithoutCountryDialCode(phoneInput, String(countryDialCode))
      console.log({ phone })
      data = {
        ...data,
        phone: phone
      }
    }
    if (!phoneInput) {
      data = {
        ...data,
        phone: ''
      }
    }
    if (countryDialCode) {
      data = { ...data, countryDialCode }
    }
    if (countryCode) {
      data = { ...data, countryCode }
    }

    if (data.accountType === 'BUSINESS' || data.accountType === 'NGO') {
      data = { ...data, school: '', openToWork: false, nickname: '', schools: [], currentSchoolId: '' }
    } else if (data.accountType === 'INDIVIDUAL') {
      data = {
        ...data,
        organization: '',
        organizationRegistrationNumber: '',
        organizationGSTNumber: '',
        organizationPANNumber: '',
        websiteUrl: '',
        hiring: false,
        associatedOrganization: '',
        associatedOrganizationType: '',
        associatedOrganizationWebsiteUrl: ''
      }
    }

    // Remove voter ID from main profile update since it's handled separately
    if (data.voterId) {
      delete data.voterId
    }

    console.log('User profile data sending to POST:', data)

    const result = await RestApi.put(`${API_URLS.v0.USERS_PROFILE}/${session?.user?.email}`, data)
    // const result = await clientApi.updateUserProfile(session.user.email, data)
    if (result.status === 'success') {
      console.log('Updated  result', result.result)
      // toast.success('User profile Updated .')
      console.log('user profile updating result', result.result)
      if (result.result.accountType === 'INDIVIDUAL') {
        await handleUploadResumeFileToS3()

        await handleDeleteFileFromS3(`${session?.user?.email}/organization_registration`)
        await handleDeleteFileFromS3(`${session?.user?.email}/organization_gst`)
        await handleDeleteFileFromS3(`${session?.user?.email}/organization_pan`)
      } else {
        await handleUploadOrganizationRegistrationDocToS3()
        await handleUploadOrganizationGSTDocToS3()
        await handleUploadOrganizationPANDocToS3()
      }

      await handleUploadProfilePhotoToS3()

      setFormData(initialData)
      setIsFormSubmitting(false)
      handleResetForm()
    } else {
      console.error('Error in handleSubmit:', result, result?.message)
      // toast.error('Error:' + result.message)
      // toast.error('Error:', result)
      setIsFormSubmitting(false)
    }
  }

  async function handleUploadProfilePhotoToS3() {
    const fileNameWithoutExtension = `${session?.user?.email}/profile_photo`

    if (fileInput && fileInput.name.startsWith(fileNameWithoutExtension)) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteProfilePhotoToS3:', error)
    }

    if (fileInput) {
      const bufferFile = await convertFileToBufferFile(fileInput)
      const fileType = getFileExtension(fileInput.name)
      const fileName = `${session?.user?.email}/profile_photo.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: userProfileBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('Profile photo uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadProfilePhotoToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function handleUploadResumeFileToS3() {
    const fileNameWithoutExtension = `${session?.user?.email}/resume`

    if (resumeFileInput && resumeFileInput.name.startsWith(fileNameWithoutExtension)) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteResumeFileToS3:', error)
    }

    if (resumeFileInput) {
      const bufferFile = await convertFileToBufferFile(resumeFileInput)
      const fileType = getFileExtension(resumeFileInput.name) // organizationRegistrationDocument.type.split('/')[1]
      const fileName = `${session?.user?.email}/resume.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: userProfileBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('Resume Doc uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadResumeToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function handleUploadOrganizationRegistrationDocToS3() {
    const fileNameWithoutExtension = `${session?.user?.email}/organization_registration`

    if (
      organizationRegistrationDocument &&
      organizationRegistrationDocument.name.startsWith(fileNameWithoutExtension)
    ) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteOrganizationRegistrationDocToS3:', error)
    }

    if (organizationRegistrationDocument) {
      const bufferFile = await convertFileToBufferFile(organizationRegistrationDocument)
      const fileType = getFileExtension(organizationRegistrationDocument.name) // organizationRegistrationDocument.type.split('/')[1]
      const fileName = `${session?.user?.email}/organization_registration.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: userProfileBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('Organization Registartion Doc uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadOrganizationRegistrationDocToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function handleUploadOrganizationGSTDocToS3() {
    const fileNameWithoutExtension = `${session?.user?.email}/organization_gst`

    if (organizationGSTDocument && organizationGSTDocument.name.startsWith(fileNameWithoutExtension)) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteOrganizationGSTDocToS3:', error)
    }

    if (organizationGSTDocument) {
      const bufferFile = await convertFileToBufferFile(organizationGSTDocument)
      const fileType = getFileExtension(organizationGSTDocument.name) // organizationGSTDocument.type.split('/')[1]
      const fileName = `${session?.user?.email}/organization_gst.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: userProfileBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('Organization GST Doc uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadOrganizationGSTDocToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function handleUploadOrganizationPANDocToS3() {
    const fileNameWithoutExtension = `${session?.user?.email}/organization_pan`

    if (organizationPANDocument && organizationPANDocument.name.startsWith(fileNameWithoutExtension)) {
      return // Don't reupload the same file
    }

    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error('Error in handleDeleteOrganizationPANDocToS3:', error)
    }

    if (organizationPANDocument) {
      const bufferFile = await convertFileToBufferFile(organizationPANDocument)
      const fileType = getFileExtension(organizationPANDocument.name) // organizationPANDocument.type.split('/')[1]
      const fileName = `${session?.user?.email}/organization_pan.${fileType}`

      try {
        await uploadFileToS3({
          bucketName: userProfileBucketName,
          fileBuffer: bufferFile,
          fileName,
          fileType
        })
        console.log('Organization PAN Doc uploaded to S3 successfully.')
      } catch (error) {
        console.error('Error in handleUploadOrganizationPANDocToS3:', error)
        // toast.error('Error uploading profile photo to S3:', error.message)
      }
    }
  }

  async function handleDeleteFileFromS3(fileNameWithoutExtension) {
    try {
      await deleteFileWithUnknownExtension({
        bucketName: userProfileBucketName,
        fileNamePrefix: fileNameWithoutExtension
      })
    } catch (error) {
      console.error(`Error in delete ${fileNameWithoutExtension}:`, error)
    }
  }

  // Consolidated function to handle voter ID updates
  const updateVoterIdData = async voterIdData => {
    try {
      let response
      if (formData.voterId?.epicNumber) {
        // Update existing voter ID
        response = await RestApi.put(`${API_URLS.v0.USERS_PROFILE}/voter-id`, {
          email: session?.user?.email,
          voterId: voterIdData
        })
      } else {
        // Add new voter ID
        response = await RestApi.post(`${API_URLS.v0.USERS_PROFILE}/voter-id`, {
          email: session?.user?.email,
          voterId: voterIdData
        })
      }

      if (response.status === 'success') {
        console.log('Voter ID updated successfully:', response.result)
        // Update local form data
        setFormData(prev => ({
          ...prev,
          voterId: voterIdData
        }))
        handleRefetchUserProfileData()
        return true
      } else {
        console.error('Error updating voter ID:', response.message)
        return false
      }
    } catch (error) {
      console.error('Unexpected error updating voter ID:', error)
      return false
    }
  }

  const handleVoterIdPhotosInputChange = async (file, side) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.onload = async () => {
        const imageData = reader.result
        setVoterIdPhotos(prev => ({ ...prev, [side]: imageData }))

        // Update voter ID via consolidated function
        const voterIdData = {
          ...formData.voterId,
          [side === 'front' ? 'frontImage' : 'backImage']: imageData
        }

        await updateVoterIdData(voterIdData)

        // Set crop mode to true for the uploaded image
        setIsCropMode(prev => ({ ...prev, [side]: true }))
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleVoterIdPhotoDelete = async side => {
    setVoterIdPhotos(prev => ({ ...prev, [side]: '' }))
    setIsCropMode(prev => ({ ...prev, [side]: false }))

    // Update voter ID via consolidated function
    const voterIdData = {
      ...formData.voterId,
      [side === 'front' ? 'frontImage' : 'backImage']: ''
    }

    await updateVoterIdData(voterIdData)
  }

  const handleVoterIdImageCrop = async (side, croppedImageUrl) => {
    // Update both local state and form data with cropped image
    setVoterIdPhotos(prev => ({ ...prev, [side]: croppedImageUrl }))

    // Update voter ID via consolidated function
    const voterIdData = {
      ...formData.voterId,
      [side === 'front' ? 'frontImage' : 'backImage']: croppedImageUrl
    }

    await updateVoterIdData(voterIdData)
  }

  // const validatePhone = (value, countryDialCode) => {
  //   const indianRegex = new RegExp('^[6-9][0-9]{9}$')
  //   if (countryDialCode == 91) {
  //     let contactWithoutCountryCode = value.substring(2, value.length)
  //     var result = indianRegex.test(contactWithoutCountryCode)
  //     setPhoneValid(result)
  //   }
  // }

  const validatePhone = (value, countryDialCode) => {
    const foundCountry = countriesWithRegex.find(country => country.countryDialCode === String(countryDialCode))

    if (foundCountry && foundCountry.regex instanceof RegExp) {
      setPhoneValid(foundCountry.regex.test(value))
    } else {
      setPhoneValid(false) // If no valid regex is found, set the phone validity to false
    }
  }

  const handlePhoneInputChange = (value, country) => {
    // Update phone number
    setPhoneInput(value)
    // setCountryDialCode(country.dialCode)
    validatePhone(value, country.dialCode)

    // Check if the dial code or country code has changed
    console.log(country.dialCode, countryDialCode)
    if (country.dialCode !== countryDialCode) {
      // Update country dial code
      setCountryDialCode(country.dialCode)

      // Map country code to country name
      const countryObj = CountryRegionData.find(data => data[1]?.toLowerCase() === country.countryCode?.toLowerCase())

      if (countryObj) {
        // console.log('Mapped Country Object:', countryObj)
        setSelectedCountryObject({ country: countryObj[0], countryCode: countryObj[1] })
        setSelectedCountry(countryObj[0])
      } else {
        console.warn('Country not found in CountryRegionData:', country.countryCode)
      }
    }
  }

  return (
    <Card>
      <CardContent className='mbe-1'>
        <div className='flex items-start sm:items-center justify-between gap-4'>
          <div className='relative group'>
            <img
              height={100}
              width={100}
              className='rounded'
              src={imgSrc || session?.user?.image || '/images/avatars/1.png'}
              alt='Profile'
            />
            <IconButtonTooltip
              title='Upload'
              component='label'
              size='large'
              color='primary'
              className='absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[100px] p-0 flex items-center justify-center bg-white bg-opacity-75 rounded-none opacity-0 group-hover:opacity-100 transition-opacity'
              htmlFor='account-settings-upload-image'
            >
              <CloudUploadIcon />
              <input
                hidden
                type='file'
                // value={fileInput}
                accept='.jpg, .png, .jpeg'
                onChange={handleFileInputChange}
                id='account-settings-upload-image'
              />
            </IconButtonTooltip>
          </div>

          {/* My Member Id */}
          <Stack direction='column' gap={'5px'} sx={{ alignSelf: 'flex-start', alignItems: 'center' }}>
            <Typography sx={{ textAlign: 'center' }} variant='h6'>
              My Member Id
            </Typography>
            <Box>
              <Typography variant='h6' color={'primary'}>
                {formData?.memberId}
              </Typography>
            </Box>
          </Stack>

          {/* My Profile ( Percentage ) */}
          <Stack direction='column' gap={'5px'} sx={{ alignSelf: 'flex-start', alignItems: 'center' }}>
            <Typography sx={{ textAlign: 'center' }} variant='h6'>
              My Profile
            </Typography>
            <Box>
              <CircularProgressWithValueLabel
                value={profilePercentage}
                size={50}
                thickness={5}
                fontSize={14}
                textcolor='text.secondary'
              />
            </Box>
          </Stack>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            {/* Personal Information */}
            <PersonalInfo
              phoneProps={{
                phoneInput: phoneInput,
                country: selectedCountryObject?.countryCode?.toLowerCase(),
                phoneValid: phoneValid,
                onChange: handlePhoneInputChange,
                setIsPhoneVerified: setIsPhoneVerified,
                dbPhone: formData.countryDialCode + formData.phone
              }}
              formData={formData}
              getLanguageLabel={getLanguageLabel}
              isFormValid={isFormValid}
              handleFormChange={handleFormChange}
              handleOpenModal={handleOpenModal}
              languageOptions={languageOptions}
              handleDeleteChipFromMultiSelect={handleDeleteChipFromMultiSelect}
            />

            {/* ----Voter Id---- */}
            <VoterIdInfo
              voterIdPhotos={voterIdPhotos}
              handleVoterIdPhotoDelete={handleVoterIdPhotoDelete}
              handleVoterIdPhotosInputChange={handleVoterIdPhotosInputChange}
              setVoterIdPhotoFiles={setVoterIdPhotoFiles}
              setVoterIdPhotos={setVoterIdPhotos}
              setIsCropMode={setIsCropMode}
              isCropMode={isCropMode}
              isEpicValid={isEpicValid}
              formData={formData}
              handleFormChange={handleFormChange}
              handleVoterIdImageCrop={handleVoterIdImageCrop}
              session={session}
              onRefetchUserProfileData={handleRefetchUserProfileData}
            />
            {/* ----Address---- */}
            <AddressInfo
              formData={formData}
              handleFormChange={handleFormChange}
              setSelectedRegion={setSelectedRegion}
              setCountryCode={setCountryCode}
              handleChangeCountry={handleChangeCountry}
              selectedCountryObject={selectedCountryObject}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              setSelectedCountryObject={setSelectedCountryObject}
              selectedRegion={selectedRegion}
              postOffices={postOffices}
              fetchPostOffices={fetchPostOffices}
              loadingPincodesOrPostOffices={loadingPincodesOrPostOffices}
              selectedZipcode={selectedZipcode}
              setSelectedZipcode={setSelectedZipcode}
              pinCodes={pinCodes}
              setSelectedLocality={setSelectedLocality}
              selectedLocality={selectedLocality}
            />

            {/* ----Education---- */}
            {formData.accountType === 'INDIVIDUAL' && (
              <>
                <Grid item xs={12} marginLeft={'0.25rem'}>
                  <Divider> Education </Divider>
                </Grid>
                {/* Add Education Button */}
                <Grid item xs={12} sm={6}>
                  <Button
                    startIcon={<RiAddFill />}
                    sx={{ alignSelf: 'flex-start' }}
                    variant='text'
                    color='primary'
                    onClick={() => handleOpenModal('education')}
                  >
                    Add Education
                  </Button>
                </Grid>

                {/* Display Education List */}
                {profileData?.schools && profileData.schools.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        {profileData.schools.map((school, index) => (
                          <Grid item xs={12} md={6} key={school._id || index}>
                            <Box
                              sx={{
                                p: 2,
                                height: '100%',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: 'background.paper'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant='h6'
                                    sx={{
                                      fontWeight: 'bold',
                                      mb: 1,
                                      width: '300px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {school.highestQualification === '7th Grade' ||
                                    school.highestQualification === '10th Grade'
                                      ? 'School Name'
                                      : 'College Name'}
                                    : {school.school}
                                  </Typography>
                                  {school.degree && (
                                    <Typography
                                      variant='body1'
                                      color='text.secondary'
                                      sx={{
                                        mb: 0.5,
                                        width: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      <strong>Degree:</strong> {school.degree}
                                    </Typography>
                                  )}
                                  {school.fieldOfStudy && (
                                    <Typography
                                      variant='body1'
                                      color='text.secondary'
                                      sx={{
                                        mb: 0.5,
                                        width: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      <strong>Field of Study:</strong> {school.fieldOfStudy}
                                    </Typography>
                                  )}
                                  {school.highestQualification && (
                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                      <strong>Highest Qualification:</strong> {school.highestQualification}
                                    </Typography>
                                  )}
                                  <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                                    <strong>Duration:</strong>{' '}
                                    {school.startDate ? new Date(school.startDate).toLocaleDateString() : 'N/A'} -{' '}
                                    {school.endDate ? new Date(school.endDate).toLocaleDateString() : 'Present'}
                                  </Typography>
                                  {school.description && (
                                    <Typography variant='body2' sx={{ mt: 1 }}>
                                      <strong>Description:</strong> {school.description}
                                    </Typography>
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton size='small' color='primary' onClick={() => handleEditEducation(school)}>
                                    <EditIcon fontSize='small' />
                                  </IconButton>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => handleDeleteEducation(school._id)}
                                  >
                                    <DeleteIcon fontSize='small' />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            {/* ----Work History---- */}
            <Grid item xs={12} marginLeft={'0.25rem'}>
              <Divider> Work History </Divider>
            </Grid>
            {/* Add New Position Button and Open To Work / Hiring */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 2
                }}
              >
                {/* Add New Position Button - Left Side */}
                <Button
                  startIcon={<RiAddFill />}
                  variant='text'
                  color='primary'
                  onClick={() => handleOpenModal('workingPosition')}
                  sx={{ flexShrink: 0 }}
                >
                  Add New Position
                </Button>

                {/* Open To Work for Individual - Right Side */}
                {formData.accountType === 'INDIVIDUAL' && (
                  <FormGroup sx={{ flexShrink: 0 }}>
                    <FormControlLabel
                      checked={formData.openToWork}
                      control={<Checkbox />}
                      label='Open to work'
                      name='openToWork'
                      onChange={(e, checked) => handleFormChange('openToWork', checked)}
                    />
                  </FormGroup>
                )}

                {/* Hiring for Business/NGO - Right Side */}
                {(formData.accountType === 'BUSINESS' || formData.accountType === 'NGO') && (
                  <FormGroup sx={{ flexShrink: 0 }}>
                    <FormControlLabel
                      name='hiring'
                      checked={formData.hiring}
                      control={<Checkbox />}
                      label='Hiring'
                      onChange={(e, checked) => handleFormChange('hiring', checked)}
                    />
                  </FormGroup>
                )}
              </Box>
            </Grid>

            {/* Display Working Positions List */}
            {profileData?.workingPositions && profileData.workingPositions.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {profileData.workingPositions.map((position, index) => (
                      <Grid item xs={12} md={6} key={position._id || index}>
                        <Box
                          sx={{
                            p: 2,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant='h6'
                                sx={{
                                  fontWeight: 'bold',
                                  mb: 1,
                                  width: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <strong>Job Title:</strong> {position.title}
                              </Typography>
                              <Typography
                                variant='body1'
                                color='text.secondary'
                                sx={{
                                  mb: 0.5,
                                  width: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <strong>Company:</strong> {position.companyName}
                              </Typography>
                              {position.employmentType && (
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                  <strong>Employment Type:</strong> {position.employmentType}
                                </Typography>
                              )}
                              {position.location && (
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                                  <strong>Location:</strong> {position.location}
                                </Typography>
                              )}
                              <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                                <strong>Duration:</strong>{' '}
                                {position.startDate ? new Date(position.startDate).toLocaleDateString() : 'N/A'} -{' '}
                                {position.isCurrentlyWorking
                                  ? 'Present'
                                  : position.endDate
                                    ? new Date(position.endDate).toLocaleDateString()
                                    : 'N/A'}
                              </Typography>
                              {position.description && (
                                <Typography variant='body2' sx={{ mt: 1 }}>
                                  <strong>Description:</strong> {position.description}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleEditWorkingPosition(position)}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDeleteWorkingPosition(position._id)}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Add New Associated Organization Button */}
            <Grid item xs={12} sm={6}>
              <Button
                startIcon={<RiAddFill />}
                sx={{ alignSelf: 'flex-start' }}
                variant='text'
                color='primary'
                onClick={() => handleOpenModal('associatedOrganization')}
              >
                Add New Associated Organization
              </Button>
            </Grid>

            {/* Display Associated Organizations List */}
            {profileData?.associatedOrganizations && profileData.associatedOrganizations.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    {profileData.associatedOrganizations.map((organization, index) => (
                      <Grid item xs={12} md={6} key={organization._id || index}>
                        <Box
                          sx={{
                            p: 2,
                            height: '100%',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: 'background.paper'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant='h6'
                                sx={{
                                  fontWeight: 'bold',
                                  mb: 1,
                                  width: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <strong>Organization:</strong> {organization.organization}
                              </Typography>
                              {organization.organizationType && (
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                  <strong>Organization Type:</strong> {organization.organizationType}
                                </Typography>
                              )}
                              {organization.websiteUrl && (
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                  sx={{
                                    mb: 0.5,
                                    width: '300px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <strong>Website:</strong> {organization.websiteUrl}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleEditAssociatedOrganization(organization)}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleDeleteAssociatedOrganization(organization._id)}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* ----Business Details---- */}
            {(formData.accountType === 'BUSINESS' || formData.accountType === 'NGO') && (
              <>
                <Grid item xs={12} marginLeft={'0.25rem'}>
                  <Divider>{formData.accountType === 'NGO' ? 'Organization Details' : 'Business Details'}</Divider>
                </Grid>

                {/* Organization */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name='organization'
                    label='Your Organization'
                    value={formData.organization}
                    placeholder='ThemeSelection'
                    onChange={e => handleFormChange('organization', e.target.value)}
                  />
                </Grid>

                {/* Website Url */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.accountType === 'NGO' ? 'Organization Website Url' : 'Business Website Url'}
                    name='websiteUrl'
                    value={formData.websiteUrl}
                    placeholder='Ex: https://www.triesoltech.com'
                    onChange={e => handleFormChange('websiteUrl', e.target.value)}
                  />
                </Grid>

                {/* Registration No. */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={
                      formData.accountType === 'NGO' ? 'Organization Registration No.' : 'Business Registration No.'
                    }
                    name='organizationRegistrationNumber'
                    value={formData.organizationRegistrationNumber}
                    // placeholder='Ex: https://www.triesoltech.com'
                    onChange={e => handleFormChange('organizationRegistrationNumber', e.target.value)}
                  />
                </Grid>

                {/* Registration Document */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <MuiFileInput
                      label={
                        formData.accountType === 'NGO' ? 'Organization Registration Doc.' : 'Business Registration Doc.'
                      }
                      name='organizationRegistrationDocument'
                      value={organizationRegistrationDocument}
                      onChange={e => handleFileInputChangeByFieldName('organizationRegistrationDocument', e)}
                      fullWidth
                      clearIconButtonProps={{
                        title: 'Remove',
                        children: <RiCloseFill />
                      }}
                      placeholder='upload registration document (pdf/doc/image)'
                      InputProps={{
                        inputProps: {
                          accept: '.pdf,.doc,.docx,.jpeg,.png,.jpg'
                        },
                        startAdornment: <IoMdAttach />
                      }}
                    />
                  </FormControl>
                </Grid>

                {/* GST No. */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.accountType === 'NGO' ? 'Organization GST No.' : 'Business GST No.'}
                    name='organizationGSTNumber'
                    value={formData.organizationGSTNumber}
                    // placeholder='Ex: https://www.triesoltech.com'
                    onChange={e => handleFormChange('organizationGSTNumber', e.target.value)}
                  />
                </Grid>

                {/* GST Document */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <MuiFileInput
                      label={formData.accountType === 'NGO' ? 'GST Doc.' : 'Business GST Doc.'}
                      name='organizationGSTDocument'
                      value={organizationGSTDocument}
                      onChange={e => handleFileInputChangeByFieldName('organizationGSTDocument', e)}
                      fullWidth
                      clearIconButtonProps={{
                        title: 'Remove',
                        children: <RiCloseFill />
                      }}
                      placeholder='upload GST document (pdf/doc/image)'
                      InputProps={{
                        inputProps: {
                          accept: '.pdf,.doc,.docx,.jpeg,.png,.jpg'
                        },
                        startAdornment: <IoMdAttach />
                      }}
                    />
                  </FormControl>
                </Grid>

                {/* PAN No. */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={formData.accountType === 'NGO' ? 'Organization PAN No.' : 'Business PAN No.'}
                    name='organizationPANNumber'
                    value={formData.organizationPANNumber}
                    // placeholder='Ex: https://www.triesoltech.com'
                    onChange={e => handleFormChange('organizationPANNumber', e.target.value)}
                  />
                </Grid>

                {/* PAN Document */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <MuiFileInput
                      label={formData.accountType === 'NGO' ? 'GST Doc.' : 'Business GST Doc.'}
                      name='organizationPANDocument'
                      value={organizationPANDocument}
                      onChange={e => handleFileInputChangeByFieldName('organizationPANDocument', e)}
                      fullWidth
                      clearIconButtonProps={{
                        title: 'Remove',
                        children: <RiCloseFill />
                      }}
                      placeholder='upload PAN document (pdf/doc/image)'
                      InputProps={{
                        inputProps: {
                          accept: '.pdf,.doc,.docx,.jpeg,.png,.jpg'
                        },
                        startAdornment: <IoMdAttach />
                      }}
                    />
                  </FormControl>
                </Grid>
              </>
            )}

            {/* ----Upload Resume---- */}
            {formData.accountType === 'INDIVIDUAL' && (
              <>
                <Grid item xs={12} marginLeft={'0.25rem'}>
                  <Divider> Upload Resume </Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    {/* <InputLabel>Resume</InputLabel> */}
                    <MuiFileInput
                      label='Resume'
                      name='resumeFileInput'
                      value={resumeFileInput}
                      onChange={handleResumeFileInputChange}
                      fullWidth
                      clearIconButtonProps={{
                        title: 'Remove',
                        children: <RiCloseFill />
                      }}
                      placeholder='upload your resume (.pdf/.doc/.docx)'
                      InputProps={{
                        inputProps: {
                          accept: '.pdf,.doc,.docx'
                        },
                        startAdornment: <IoMdAttach />
                      }}
                    />
                  </FormControl>
                </Grid>
              </>
            )}

            {/* ----Socaial Media Profiles---- */}
            <SocialMediaInfo formData={formData} handleFormChange={handleFormChange} isUrlsValid={isUrlsValid} />

            {isModalOpen.language && (
              <NewLanguageModal
                email={session?.user?.email}
                open={isModalOpen.language}
                onClose={() => handleCloseModal('language')}
                onRefetchUserProfileData={handleRefetchUserProfileData}
              />
            )}
            {isModalOpen.associatedOrganization && (
              <NewAssociatedOrganization
                email={session?.user?.email}
                open={isModalOpen.associatedOrganization}
                onClose={() => {
                  setEditingAssociatedOrganization(null)
                  handleCloseModal('associatedOrganization')
                }}
                onRefetchUserProfileData={handleRefetchUserProfileData}
                existingOrganizations={profileData?.associatedOrganizations || []}
                editingOrganization={editingAssociatedOrganization}
              />
            )}
            {isModalOpen.education && (
              <EducationModal
                email={session?.user?.email}
                open={isModalOpen.education}
                onClose={() => {
                  setEditingEducation(null)
                  handleCloseModal('education')
                }}
                onRefetchUserProfileData={handleRefetchUserProfileData}
                existingSchools={profileData?.schools || []}
                editingEducation={editingEducation}
              />
            )}
            {isModalOpen.workingPosition && (
              <CurrentWorkingPositionModal
                email={session?.user?.email}
                open={isModalOpen.workingPosition}
                onClose={() => {
                  setEditingWorkingPosition(null)
                  handleCloseModal('workingPosition')
                }}
                onRefetchUserProfileData={handleRefetchUserProfileData}
                existingPositions={profileData?.workingPositions || []}
                editingPosition={editingWorkingPosition}
              />
            )}

            {/* Actions */}
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button
                disabled={
                  isFormSubmitting ||
                  getLoading ||
                  !isEpicValid ||
                  (formData.facebookUrl && !isUrlsValid.facebookUrl) ||
                  (formData.instagramUrl && !isUrlsValid.instagramUrl) ||
                  (formData.linkedInUrl && !isUrlsValid.linkedInUrl)
                }
                variant='contained'
                type='submit'
                color='primary'
                style={{ color: 'white', backgroundColor: theme.palette.primary.main }}
              >
                Save Changes
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={handleResetForm}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
