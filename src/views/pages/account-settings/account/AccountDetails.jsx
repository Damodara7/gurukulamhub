'use client'

import countryList from 'react-select-country-list'
import ReactCropperComponet, { ReactCropperComponent } from './ReactCropperComponent'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
// import timezonesWithGMT from '@/data/timezoneswithgmt'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

// Components Imports
import SearchableSelect from './SearchableSelect'
import EducationModal, { EducationViewModal } from './EducationModal'
import NewAssociatedOrganization, { AssociatedOrganizationViewModal } from './NewAssociatedOrganization'
import NewLanguageModal from './NewLanguageModal'
import CurrentWorkingPositionModal, { WorkingPositionViewModal } from './CurrentWorkingPositionModal'
import CircularProgressWithValueLabel from './CircularProgressWithValueLabel'

// Section Components Imports
import EducationSection from './EducationSection'
import WorkExperienceSection from './WorkExperienceSection'
import OrganizationSection from './OrganizationSection'
import BusinessDetailsSection from './BusinessDetailsSection'
import ResumeSection from './ResumeSection'

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
import { useEffect, useMemo, useState, useRef } from 'react'

// react-icons Imports
import { RiAddFill, RiCloseFill } from 'react-icons/ri'
import { IoMdAttach } from 'react-icons/io'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CropIcon from '@mui/icons-material/Crop'
import VisibilityIcon from '@mui/icons-material/Visibility'

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
  pincode: '',
  postoffice: '',
  locality: '',
  // timezone: '',
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
  const { data: session } = useSession()
  const theme = useTheme()

  // States
  const [formData, setFormData] = useState(initialData)
  const [imgSrc, setImgSrc] = useState(null)

  const [phoneInput, setPhoneInput] = useState('')
  const [phoneValid, setPhoneValid] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [countryDialCode, setCountryDialCode] = useState('')
  const [countryCode, setCountryCode] = useState('')

  // Location-related states
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCountryObject, setSelectedCountryObject] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedZipcode, setSelectedZipcode] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [zipcodeFromDb, setZipcodeFromDb] = useState('')
  const [localityFromDb, setLocalityFromDb] = useState('')
  const [postOffices, setPostOffices] = useState([])
  const [loadingPincodesOrPostOffices, setLoadingPincodesOrPostOffices] = useState(false)
  const [pinCodes, setPinCodes] = useState([])

  // Timezone-related states
  // const [filteredTimezones, setFilteredTimezones] = useState(timezonesWithGMT || [])

  // File-related states
  const [fileInput, setFileInput] = useState(null)
  const [resumeFileInput, setResumeFileInput] = useState(null)
  const [organizationRegistrationDocument, setOrganizationRegistrationDocument] = useState(null)
  const [organizationGSTDocument, setOrganizationGSTDocument] = useState(null)
  const [organizationPANDocument, setOrganizationPANDocument] = useState(null)

  // Voter ID related states
  const [isCropMode, setIsCropMode] = useState({ front: false, back: false })
  const [voterIdPhotos, setVoterIdPhotos] = useState({ front: '', back: '' })
  const [voterIdPhotoFiles, setVoterIdPhotoFiles] = useState({ front: '', back: '' })

  // Options-related states
  const [languageOptions, setLanguageOptions] = useState([])
  const [associatedOrganizationOptions, setAssociatedOrganizationOptions] = useState([])
  const [schoolOptions, setSchoolOptions] = useState([])
  const [workingPositionOptions, setWorkingPositionOptions] = useState([])

  // Pending/removed states for state management
  const [pendingLanguages, setPendingLanguages] = useState([])
  const [removedLanguageIds, setRemovedLanguageIds] = useState([])
  const [pendingVoterId, setPendingVoterId] = useState(null)
  const [pendingEducations, setPendingEducations] = useState([])
  const [removedEducationIds, setRemovedEducationIds] = useState([])
  const [pendingPositions, setPendingPositions] = useState([])
  const [removedPositionIds, setRemovedPositionIds] = useState([])
  const [pendingOrganizations, setPendingOrganizations] = useState([])
  const [removedOrganizationIds, setRemovedOrganizationIds] = useState([])

  // Other state variables
  const [profileData, setProfileData] = useState(null)
  const [getLoading, setGetLoading] = useState(false)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [isFormValid, setIsFormValid] = useState(true)
  const [shouldRefetchData, setShouldRefetchData] = useState(false)
  const [profilePercentage, setProfilePercentage] = useState(0)

  // Validation and modal states
  const [isUrlsValid, setIsUrlsValid] = useState({ instagramUrl: true, linkedInUrl: true, facebookUrl: true })
  const [isEpicValid, setIsEpicValid] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState({
    language: false,
    education: false,
    workingPosition: false,
    associatedOrganization: false
  })

  // Editing/viewing states
  const [editingEducation, setEditingEducation] = useState(null)
  const [editingWorkingPosition, setEditingWorkingPosition] = useState(null)
  const [editingAssociatedOrganization, setEditingAssociatedOrganization] = useState(null)
  const [viewingPosition, setViewingPosition] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingOrganization, setViewingOrganization] = useState(null)
  const [isViewOrgModalOpen, setIsViewOrgModalOpen] = useState(false)
  const [viewingEducation, setViewingEducation] = useState(null)
  const [isViewEducationModalOpen, setIsViewEducationModalOpen] = useState(false)

  // Refs for timer cleanup
  const viewModalTimerRef = useRef(null)
  const viewEducationTimerRef = useRef(null)
  const viewOrgTimerRef = useRef(null)

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
  // Removed conflicting useEffect hooks - zipcode/locality are now handled by country-specific logic

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
      try {
        const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}?email=${session.user.email}`)
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

          // Update knownLanguageIds to include all language IDs from the database
          const updatedKnownLanguageIds = profile?.languages?.map(lang => lang._id) || []

          setFormData({
            ...formData,
            ...filteredProfile,
            memberId: user?.memberId,
            knownLanguageIds: updatedKnownLanguageIds
          })
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
          if (profile?.country && profile?.country.trim() !== '') {
            setSelectedCountry(profile.country)
          } else {
            // Clear country state if database value is empty
            setSelectedCountry('')
            setSelectedCountryObject(null)
          }
          if (profile?.region && profile?.region.trim() !== '') {
            setSelectedRegion(profile.region)
          } else {
            // Clear region state if database value is empty
            setSelectedRegion('')
          }
          // Handle address fields based on country - only load if country and region match saved data
          if (profile?.country === 'India') {
            // For India: only load pincode and postoffice if the region matches the saved region
            if (profile?.region === selectedRegion) {
              if (profile?.pincode && profile?.pincode.trim() !== '') {
                setZipcodeFromDb(profile?.pincode)
                setSelectedZipcode(profile?.pincode)
              } else {
                setZipcodeFromDb('')
                setSelectedZipcode('')
              }
              if (profile?.postoffice && profile?.postoffice.trim() !== '') {
                setLocalityFromDb(profile?.postoffice)
                setSelectedLocality(profile?.postoffice)
              } else {
                setLocalityFromDb('')
                setSelectedLocality('')
              }
            } else {
              // Clear pincode and postoffice if region doesn't match
              setZipcodeFromDb('')
              setSelectedZipcode('')
              setLocalityFromDb('')
              setSelectedLocality('')
            }
          } else {
            // For non-India: only load zipcode and locality if the region matches the saved region
            if (profile?.region === selectedRegion) {
              if (profile?.zipcode && profile?.zipcode.trim() !== '') {
                setZipcodeFromDb(profile?.zipcode)
                setSelectedZipcode(profile?.zipcode)
              } else {
                setZipcodeFromDb('')
                setSelectedZipcode('')
              }
              if (profile?.locality && profile?.locality.trim() !== '') {
                setLocalityFromDb(profile?.locality)
                setSelectedLocality(profile?.locality)
              } else {
                setLocalityFromDb('')
                setSelectedLocality('')
              }
            } else {
              // Clear zipcode and locality if region doesn't match
              setZipcodeFromDb('')
              setSelectedZipcode('')
              setLocalityFromDb('')
              setSelectedLocality('')
            }
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
      } catch (error) {
        console.error('Error fetching profile data:', error)
        setGetLoading(false)
        // Don't show error toast for background refetch to avoid user confusion
        // The optimistic update already shows the correct data
      }
    }

    if (session && session.user && session.user.email) {
      getData()
    }
    console.log('THE USER PROFILE RESULT ')
  }, [session, shouldRefetchData])

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (viewModalTimerRef.current) clearTimeout(viewModalTimerRef.current)
      if (viewEducationTimerRef.current) clearTimeout(viewEducationTimerRef.current)
      if (viewOrgTimerRef.current) clearTimeout(viewOrgTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (selectedRegion) {
      setSelectedLocality('')
      setSelectedZipcode('')
      setPinCodes([])
      fetchPinCodesForState(selectedRegion)
    }
  }, [selectedRegion])

  // Filter timezones when country changes
  // useEffect(() => {
  //   if (selectedCountry) {
  //     filterTimezonesByCountry(selectedCountry)
  //   }
  // }, [selectedCountry])

  const fetchPinCodesForState = async selectedStateName => {
    if (!selectedStateName) {
      setPinCodes([])
      setPostOffices([])
      return
    }
    console.log('Selected selectedStateName:', selectedStateName)
    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pincodes/${selectedStateName}`)

      const data = await response.json()
      console.log('pinCode data...', data)
      setPinCodes(data?.pinCodes || data?.PinCodes || [])
    } catch (e) {
      console.error('Error fetching pincodes:', e)
      setPinCodes([])
    } finally {
      setLoadingPincodesOrPostOffices(false)
    }
  }

  const fetchPostOffices = async selectedZipcode => {
    console.log('Selected zipcode Object:', selectedZipcode)

    // Clear selectedLocality when fetching new post offices for a different zipcode
    setSelectedLocality('')
    handleFormChange('postoffice', '')

    setLoadingPincodesOrPostOffices(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/localities/${selectedZipcode}`)

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

  // Sync state variables with formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, country: selectedCountry }))
  }, [selectedCountry])

  useEffect(() => {
    setFormData(prev => ({ ...prev, region: selectedRegion }))
  }, [selectedRegion])

  // Clear selectedZipcode and selectedLocality when switching to India to prevent old data
  useEffect(() => {
    if (selectedCountry === 'India') {
      setSelectedZipcode('')
      setSelectedLocality('')
    }
  }, [selectedCountry])

  // Handle zipcode/pincode based on country
  useEffect(() => {
    if (selectedCountry === 'India') {
      // For India: store selectedZipcode in pincode field, clear zipcode
      // Only store if selectedZipcode is not empty (to prevent old data from appearing)
      setFormData(prev => ({
        ...prev,
        pincode: selectedZipcode || '',
        zipcode: '' // Clear zipcode for India
      }))
    } else {
      // For non-India or empty country: clear pincode, don't auto-store selectedZipcode
      // The manual text field will handle zipcode storage
      setFormData(prev => ({
        ...prev,
        pincode: '' // Clear pincode for non-India and empty country
      }))

      // If country is empty (removed), also clear zipcode
      if (!selectedCountry || selectedCountry === '') {
        setFormData(prev => ({
          ...prev,
          zipcode: '' // Clear zipcode when country is removed
        }))
      }
    }
  }, [selectedZipcode, selectedCountry])

  // Clear zipcode and locality when country is removed (empty)
  useEffect(() => {
    if (!selectedCountry || selectedCountry === '') {
      setFormData(prev => ({
        ...prev,
        zipcode: '',
        locality: ''
      }))
    }
  }, [selectedCountry])

  // Handle locality/postoffice based on country
  useEffect(() => {
    if (selectedCountry === 'India') {
      // For India: store selectedLocality in postoffice field, clear locality
      // Only store if selectedLocality is not empty (to prevent old data from appearing)
      setFormData(prev => ({
        ...prev,
        postoffice: selectedLocality || '',
        locality: '' // Clear locality for India
      }))
    } else {
      // For non-India or empty country: clear postoffice, don't auto-store selectedLocality
      // The manual text field will handle locality storage
      setFormData(prev => ({
        ...prev,
        postoffice: '' // Clear postoffice for non-India and empty country
      }))

      // If country is empty (removed), also clear locality
      if (!selectedCountry || selectedCountry === '') {
        setFormData(prev => ({
          ...prev,
          locality: '' // Clear locality when country is removed
        }))
      }
    }
  }, [selectedLocality, selectedCountry])

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

  function handleDeleteEducation(schoolId) {
    if (!schoolId) return

    // Check if it's a pending education (starts with 'temp_')
    if (schoolId.startsWith('temp_')) {
      handleRemovePendingEducation(schoolId)
      return
    }

    // Handle existing education deletion - just mark for removal
    handleRemoveExistingEducation(schoolId)
  }

  function handleEditWorkingPosition(position) {
    setEditingWorkingPosition(position)
    setIsModalOpen(prev => ({ ...prev, workingPosition: true }))
  }

  function handleViewWorkingPosition(position) {
    setViewingPosition(position)
    setIsViewModalOpen(true)
  }

  function handleCloseViewModal() {
    setIsViewModalOpen(false)
    // Clear any existing timer
    if (viewModalTimerRef.current) {
      clearTimeout(viewModalTimerRef.current)
    }
    // Clear the viewing position after a small delay to ensure smooth closing
    viewModalTimerRef.current = setTimeout(() => {
      setViewingPosition(null)
      viewModalTimerRef.current = null
    }, 150)
  }

  function handleViewEducation(education) {
    setViewingEducation(education)
    setIsViewEducationModalOpen(true)
  }

  function handleCloseViewEducationModal() {
    setIsViewEducationModalOpen(false)
    // Clear any existing timer
    if (viewEducationTimerRef.current) {
      clearTimeout(viewEducationTimerRef.current)
    }
    // Clear the viewing education after a small delay to ensure smooth closing
    viewEducationTimerRef.current = setTimeout(() => {
      setViewingEducation(null)
      viewEducationTimerRef.current = null
    }, 150)
  }

  function handleViewAssociatedOrganization(organization) {
    setViewingOrganization(organization)
    setIsViewOrgModalOpen(true)
  }

  function handleCloseViewOrgModal() {
    setIsViewOrgModalOpen(false)
    // Clear any existing timer
    if (viewOrgTimerRef.current) {
      clearTimeout(viewOrgTimerRef.current)
    }
    // Clear the viewing organization after a small delay to ensure smooth closing
    viewOrgTimerRef.current = setTimeout(() => {
      setViewingOrganization(null)
      viewOrgTimerRef.current = null
    }, 150)
  }

  function handleDeleteWorkingPosition(positionId) {
    if (!positionId) return

    // Check if it's a pending position (starts with 'temp_')
    if (positionId.startsWith('temp_')) {
      handleRemovePendingPosition(positionId)
      return
    }

    // Handle existing position deletion - just mark for removal
    handleRemoveExistingPosition(positionId)
  }

  function handleEditAssociatedOrganization(organization) {
    setEditingAssociatedOrganization(organization)
    setIsModalOpen(prev => ({ ...prev, associatedOrganization: true }))
  }

  function handleDeleteAssociatedOrganization(organizationId) {
    if (!organizationId) return

    // Check if it's a pending organization (starts with 'temp_')
    if (organizationId.startsWith('temp_')) {
      handleRemovePendingOrganization(organizationId)
      return
    }

    // Handle existing organization deletion - just mark for removal
    handleRemoveExistingOrganization(organizationId)
  }

  const handleDeleteChipFromMultiSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field]].filter(each => each !== value) }))
  }

  function handleDeleteLanguage(languageId) {
    if (!languageId) return

    // Check if it's a pending language (starts with 'temp_')
    if (languageId.startsWith('temp_')) {
      handleRemovePendingLanguage(languageId)
      return
    }

    // Handle existing language deletion - just remove from state
    handleRemoveExistingLanguage(languageId)
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

  // Function to add language to pending state
  function handleAddLanguageToState(newLanguage) {
    setPendingLanguages(prev => [...prev, newLanguage])

    // Also update the language options for display
    setLanguageOptions(prev => [...prev, { value: newLanguage._id, label: newLanguage.language }])

    // Update formData to include the new language ID
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: [...prev.knownLanguageIds, newLanguage._id]
    }))
  }

  // Function to remove language from pending state
  function handleRemovePendingLanguage(languageId) {
    setPendingLanguages(prev => prev.filter(lang => lang._id !== languageId))
    setLanguageOptions(prev => prev.filter(option => option.value !== languageId))
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: prev.knownLanguageIds.filter(id => id !== languageId)
    }))
  }

  // Function to remove existing language from state (mark for removal)
  function handleRemoveExistingLanguage(languageId) {
    // Add to removed languages list
    setRemovedLanguageIds(prev => [...prev, languageId])

    // Remove from UI immediately
    setLanguageOptions(prev => prev.filter(option => option.value !== languageId))
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: prev.knownLanguageIds.filter(id => id !== languageId)
    }))
  }

  // Function to add education to pending state
  function handleAddEducationToState(newEducation) {
    setPendingEducations(prev => [...prev, newEducation])
  }

  // Function to update education in pending state
  function handleUpdateEducationInState(updatedEducation) {
    // Check if it's a pending education (temp ID) or existing education
    if (updatedEducation._id.startsWith('temp_')) {
      // Update existing pending education
      setPendingEducations(prev => prev.map(edu => (edu._id === updatedEducation._id ? updatedEducation : edu)))
    } else {
      // For existing education, mark original for removal and add updated version to pending with new temp ID
      setRemovedEducationIds(prev => [...prev, updatedEducation._id])
      const updatedEducationWithTempId = {
        ...updatedEducation,
        _id: `temp_${Date.now()}` // New temp ID for the updated version
      }
      setPendingEducations(prev => [...prev, updatedEducationWithTempId])
    }
  }

  // Function to remove education from pending state
  function handleRemovePendingEducation(educationId) {
    setPendingEducations(prev => prev.filter(edu => edu._id !== educationId))
  }

  // Function to remove existing education from state (mark for removal)
  function handleRemoveExistingEducation(educationId) {
    // Add to removed education list
    setRemovedEducationIds(prev => [...prev, educationId])
  }

  // Function to add position to pending state
  function handleAddPositionToState(newPosition) {
    setPendingPositions(prev => [...prev, newPosition])
  }

  // Function to update position in pending state
  function handleUpdatePositionInState(updatedPosition) {
    // Check if it's a pending position (temp ID) or existing position
    if (updatedPosition._id.startsWith('temp_')) {
      // Update existing pending position
      setPendingPositions(prev => prev.map(pos => (pos._id === updatedPosition._id ? updatedPosition : pos)))
    } else {
      // For existing position, mark original for removal and add updated version to pending with new temp ID
      setRemovedPositionIds(prev => [...prev, updatedPosition._id])
      const updatedPositionWithTempId = {
        ...updatedPosition,
        _id: `temp_${Date.now()}` // New temp ID for the updated version
      }
      setPendingPositions(prev => [...prev, updatedPositionWithTempId])
    }
  }

  // Function to remove position from pending state
  function handleRemovePendingPosition(positionId) {
    setPendingPositions(prev => prev.filter(pos => pos._id !== positionId))
  }

  // Function to remove existing position from state (mark for removal)
  function handleRemoveExistingPosition(positionId) {
    // Add to removed position list
    setRemovedPositionIds(prev => [...prev, positionId])
  }

  // Function to add organization to pending state
  function handleAddOrganizationToState(newOrganization) {
    setPendingOrganizations(prev => [...prev, newOrganization])
  }

  // Function to update organization in pending state
  function handleUpdateOrganizationInState(updatedOrganization) {
    // Check if it's a pending organization (temp ID) or existing organization
    if (updatedOrganization._id.startsWith('temp_')) {
      // Update existing pending organization
      setPendingOrganizations(prev =>
        prev.map(org => (org._id === updatedOrganization._id ? updatedOrganization : org))
      )
    } else {
      // For existing organization, mark original for removal and add updated version to pending with new temp ID
      setRemovedOrganizationIds(prev => [...prev, updatedOrganization._id])
      const updatedOrganizationWithTempId = {
        ...updatedOrganization,
        _id: `temp_${Date.now()}` // New temp ID for the updated version
      }
      setPendingOrganizations(prev => [...prev, updatedOrganizationWithTempId])
    }
  }

  // Function to remove organization from pending state
  function handleRemovePendingOrganization(organizationId) {
    setPendingOrganizations(prev => prev.filter(org => org._id !== organizationId))
  }

  // Function to remove existing organization from state (mark for removal)
  function handleRemoveExistingOrganization(organizationId) {
    // Add to removed organization list
    setRemovedOrganizationIds(prev => [...prev, organizationId])
  }

  const handleFormChange = (field, value) => {
    if (field === 'voterId') {
      setIsEpicValid(validateEpic(value)) // Validate EPIC format
      const updatedVoterId = {
        ...formData.voterId,
        epicNumber: value
      }
      setFormData(prev => ({
        ...prev,
        voterId: updatedVoterId
      }))
      // Also update pending voter ID state
      setPendingVoterId(updatedVoterId)
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
    // First try to find in languageOptions (for existing languages)
    const option = languageOptions.find(option => option.value === value)
    if (option) {
      return option.label
    }

    // If not found, try to find in profileData.languages (for newly added languages)
    if (profileData?.languages) {
      const language = profileData.languages.find(lang => lang._id === value)
      if (language) {
        return language.language
      }
    }

    // If still not found, try to find in pendingLanguages (for temporary languages)
    const pendingLanguage = pendingLanguages.find(lang => lang._id === value)
    if (pendingLanguage) {
      return pendingLanguage.language
    }

    return 'Unknown'
  }

  function getAssocaiatedOrganizationLabel(value) {
    return associatedOrganizationOptions.find(option => option.value === value)?.label || 'Unknown'
  }

  function getPhoneWithoutCountryDialCode(phoneInput, countryDialCode) {
    return phoneInput.startsWith(countryDialCode) ? phoneInput.slice(countryDialCode.length) : phoneInput
  }

  // Function to filter timezones based on selected country
  // const filterTimezonesByCountry = countryName => {
  //   if (!countryName || !timezonesWithGMT) {
  //     setFilteredTimezones(timezonesWithGMT || [])
  //     return
  //   }

  //   const filtered = timezonesWithGMT.filter(timezone => {
  //     // Check if the country name appears in the timezone's country field
  //     return (
  //       timezone.country.toLowerCase().includes(countryName.toLowerCase()) ||
  //       timezone.countryCode.toLowerCase().includes(countryName.toLowerCase())
  //     )
  //   })

  //   setFilteredTimezones(filtered)

  //   // If only one timezone found for this country, auto-select it
  //   if (filtered.length === 1) {
  //     handleFormChange('timezone', filtered[0].timezoneWithGMT)
  //   }
  // }

  function handleChangeCountry(countryValue) {
    // Clear all address fields when country changes (same as registration flow)
    setSelectedRegion('')
    setSelectedZipcode('')
    setSelectedLocality('')
    setPinCodes([])
    setPostOffices([])

    // Clear database values to prevent them from being reloaded
    setZipcodeFromDb('')
    setLocalityFromDb('')

    // Clear all address fields in formData
    handleFormChange('region', '')
    handleFormChange('zipcode', '')
    handleFormChange('locality', '')
    handleFormChange('pincode', '')
    handleFormChange('postoffice', '')
    handleFormChange('street', '')
    handleFormChange('colony', '')
    handleFormChange('village', '')

    setCountryCode(countryValue?.countryCode || '')

    // Update formData with selected country
    if (countryValue && countryValue.country) {
      handleFormChange('country', countryValue.country)
      handleFormChange('countryCode', countryValue.countryCode)
    } else {
      handleFormChange('country', '')
      handleFormChange('countryCode', '')
      setSelectedCountry('')
      setSelectedCountryObject(null)

      // Directly clear all address fields when country is removed
      setFormData(prev => ({
        ...prev,
        country: '',
        countryCode: '',
        region: '',
        zipcode: '',
        locality: '',
        pincode: '',
        postoffice: '',
        street: '',
        colony: '',
        village: ''
      }))
      return
    }

    if (countryValue) {
      const countryObj = countries.find(country => country.countryCode === countryValue.countryCode)

      // Filter timezones based on selected country
      // filterTimezonesByCountry(countryValue.country)
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

    try {
      if (
        (formData.age && (+formData.age > 120 || +formData.age < 6 || formData.age.toString().length > 3)) ||
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

      // Efficiently process form data using Object.entries and reduce
      const allFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        // Always include address fields even if empty (to allow clearing them)
        const addressFields = [
          'country',
          'countryCode',
          'region',
          'zipcode',
          'locality',
          'pincode',
          'postoffice',
          'street',
          'colony',
          'village'
        ]
        if (addressFields.includes(key)) {
          acc[key] = value || '' // Include address fields even if empty
        }
        // Handle string values
        else if (typeof value === 'string' && value.trim()) {
          acc[key] = value
        }
        // Handle array values
        else if (Array.isArray(value) && value.length > 0) {
          acc[key] = value
        }
        // Handle other non-null, non-undefined, non-empty values
        else if (value !== null && value !== undefined && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      let data = { ...allFormData, age: +allFormData.age }

      // Debug: Log address fields to verify they're included
      console.log('Address fields being sent:', {
        country: data.country,
        region: data.region,
        zipcode: data.zipcode,
        locality: data.locality,
        street: data.street,
        colony: data.colony,
        village: data.village
      })

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

      // Handle voter ID - include pending changes
      if (pendingVoterId) {
        data.voterId = pendingVoterId
      }

      // Generic function to process entity changes (eliminates code duplication)
      const processEntityChanges = (pendingItems, removedIds, currentItems, dataKey, fieldsToExtract) => {
        if (pendingItems.length > 0 || removedIds.length > 0) {
          // Filter out removed items
          const filteredItems = currentItems.filter(item => !removedIds.includes(item._id))

          // Extract only required fields from pending items (remove temp IDs)
          const newItems = pendingItems.map(item => {
            const cleanItem = {}
            fieldsToExtract.forEach(field => {
              cleanItem[field] = item[field]
            })
            return cleanItem
          })

          // Combine filtered existing items with new ones
          data[dataKey] = [...filteredItems, ...newItems]
        }
      }

      // Process different entity types using the generic function
      processEntityChanges(pendingLanguages, removedLanguageIds, profileData?.languages || [], 'languages', [
        'language',
        'canRead',
        'canWrite',
        'canSpeak'
      ])

      processEntityChanges(pendingEducations, removedEducationIds, profileData?.schools || [], 'schools', [
        'school',
        'degree',
        'highestQualification',
        'fieldOfStudy',
        'startDate',
        'endDate',
        'description'
      ])

      processEntityChanges(
        pendingPositions,
        removedPositionIds,
        profileData?.workingPositions || [],
        'workingPositions',
        [
          'title',
          'employmentType',
          'companyName',
          'location',
          'locationType',
          'isCurrentlyWorking',
          'startDate',
          'endDate',
          'description'
        ]
      )

      processEntityChanges(
        pendingOrganizations,
        removedOrganizationIds,
        profileData?.associatedOrganizations || [],
        'associatedOrganizations',
        ['organization', 'organizationType', 'websiteUrl']
      )

      console.log('User profile data sending to POST:', data)

      const result = await RestApi.put(API_URLS.v0.USERS_PROFILE, { email: session?.user?.email, ...data })
      // const result = await clientApi.updateUserProfile(session.user.email, data)
      if (result.status === 'success') {
        console.log('Updated  result', result.result)
        toast.success('Profile updated successfully!')
        console.log('user profile updating result', result.result)
        if (result.result.accountType === 'INDIVIDUAL') {
          // Handle S3 uploads for other documents
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

        // Optimistically update profileData to prevent flicker
        const updatedProfile = { ...profileData }

        // Update languages optimistically
        if (pendingLanguages.length > 0 || removedLanguageIds.length > 0) {
          const currentLanguages = profileData?.languages || []
          const filteredLanguages = currentLanguages.filter(lang => !removedLanguageIds.includes(lang._id))
          const newLanguages = pendingLanguages.map(lang => ({
            language: lang.language,
            canRead: lang.canRead,
            canWrite: lang.canWrite,
            canSpeak: lang.canSpeak
          }))
          updatedProfile.languages = [...filteredLanguages, ...newLanguages]
        }

        // Update education optimistically
        if (pendingEducations.length > 0 || removedEducationIds.length > 0) {
          const currentEducations = profileData?.schools || []
          const filteredEducations = currentEducations.filter(edu => !removedEducationIds.includes(edu._id))
          const newEducations = pendingEducations.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            highestQualification: edu.highestQualification,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: edu.description
          }))
          updatedProfile.schools = [...filteredEducations, ...newEducations]
        }

        // Update working positions optimistically
        if (pendingPositions.length > 0 || removedPositionIds.length > 0) {
          const currentPositions = profileData?.workingPositions || []
          const filteredPositions = currentPositions.filter(pos => !removedPositionIds.includes(pos._id))
          const newPositions = pendingPositions.map(pos => ({
            title: pos.title,
            employmentType: pos.employmentType,
            companyName: pos.companyName,
            location: pos.location,
            locationType: pos.locationType,
            isCurrentlyWorking: pos.isCurrentlyWorking,
            startDate: pos.startDate,
            endDate: pos.endDate,
            description: pos.description
          }))
          updatedProfile.workingPositions = [...filteredPositions, ...newPositions]
        }

        // Update organizations optimistically
        if (pendingOrganizations.length > 0 || removedOrganizationIds.length > 0) {
          const currentOrganizations = profileData?.associatedOrganizations || []
          const filteredOrganizations = currentOrganizations.filter(org => !removedOrganizationIds.includes(org._id))
          const newOrganizations = pendingOrganizations.map(org => ({
            organization: org.organization,
            organizationType: org.organizationType,
            websiteUrl: org.websiteUrl
          }))
          updatedProfile.associatedOrganizations = [...filteredOrganizations, ...newOrganizations]
        }

        // Update voter ID optimistically
        if (pendingVoterId) {
          updatedProfile.voterId = pendingVoterId
        }

        // Update profileData immediately to prevent flicker
        setProfileData(updatedProfile)

        // Clear pending and removed states after optimistic update
        setPendingLanguages([])
        setRemovedLanguageIds([])
        setPendingVoterId(null)
        setPendingEducations([])
        setRemovedEducationIds([])
        setPendingPositions([])
        setRemovedPositionIds([])
        setPendingOrganizations([])
        setRemovedOrganizationIds([])

        // Refetch user profile data in background to ensure data consistency
        // This will update the profileData with real database IDs
        setShouldRefetchData(prev => !prev)

        setIsFormSubmitting(false)
      } else {
        console.error('Error in handleSubmit:', result, result?.message)

        // Handle validation errors
        if (result?.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.slice(0, 3) // Show first 3 errors
          errorMessages.forEach(error => {
            toast.error(error)
          })
          if (result.errors.length > 3) {
            toast.error(`And ${result.errors.length - 3} more validation errors...`)
          }
        } else {
          toast.error(result?.message || 'Failed to update profile. Please try again.')
        }

        setIsFormSubmitting(false)
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error)
      toast.error('An unexpected error occurred. Please try again.')
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

  const handleVoterIdPhotosInputChange = (file, side) => {
    const reader = new FileReader()
    const { files } = file.target

    if (files && files.length !== 0) {
      reader.onload = () => {
        const imageData = reader.result
        setVoterIdPhotos(prev => ({ ...prev, [side]: imageData }))

        // Update pending voter ID state - use current pendingVoterId as base, fallback to formData.voterId
        const currentVoterId = pendingVoterId || formData.voterId || {}
        const updatedVoterId = {
          ...currentVoterId,
          [side === 'front' ? 'frontImage' : 'backImage']: imageData
        }
        setPendingVoterId(updatedVoterId)

        // Set crop mode to true for the uploaded image
        setIsCropMode(prev => ({ ...prev, [side]: true }))
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleVoterIdPhotoDelete = side => {
    setVoterIdPhotos(prev => ({ ...prev, [side]: '' }))
    setIsCropMode(prev => ({ ...prev, [side]: false }))

    // Update pending voter ID state - use current pendingVoterId as base, fallback to formData.voterId
    const currentVoterId = pendingVoterId || formData.voterId || {}
    const updatedVoterId = {
      ...currentVoterId,
      [side === 'front' ? 'frontImage' : 'backImage']: ''
    }
    setPendingVoterId(updatedVoterId)
  }

  const handleVoterIdImageCrop = (side, croppedImageUrl) => {
    // Update both local state and form data with cropped image
    setVoterIdPhotos(prev => ({ ...prev, [side]: croppedImageUrl }))

    // Update pending voter ID state - use current pendingVoterId as base, fallback to formData.voterId
    const currentVoterId = pendingVoterId || formData.voterId || {}
    const updatedVoterId = {
      ...currentVoterId,
      [side === 'front' ? 'frontImage' : 'backImage']: croppedImageUrl
    }
    setPendingVoterId(updatedVoterId)
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

      // Note: Removed automatic country mapping to address section
      // The mobile number country selection should not affect the address country dropdown
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
              handleDeleteLanguage={handleDeleteLanguage}
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
              fetchPinCodesForState={fetchPinCodesForState}
              loadingPincodesOrPostOffices={loadingPincodesOrPostOffices}
              selectedZipcode={selectedZipcode}
              setSelectedZipcode={setSelectedZipcode}
              pinCodes={pinCodes}
              setSelectedLocality={setSelectedLocality}
              selectedLocality={selectedLocality}
              setZipcodeFromDb={setZipcodeFromDb}
              setLocalityFromDb={setLocalityFromDb}
              // filteredTimezones={filteredTimezones}
            />

            {/* Education Section */}
            <EducationSection
              formData={formData}
              profileData={profileData}
              pendingEducations={pendingEducations}
              removedEducationIds={removedEducationIds}
              isModalOpen={isModalOpen}
              editingEducation={editingEducation}
              viewingEducation={viewingEducation}
              isViewEducationModalOpen={isViewEducationModalOpen}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              handleCloseViewEducationModal={handleCloseViewEducationModal}
              handleEditEducation={handleEditEducation}
              handleViewEducation={handleViewEducation}
              handleDeleteEducation={handleDeleteEducation}
              handleAddEducationToState={handleAddEducationToState}
              handleUpdateEducationInState={handleUpdateEducationInState}
              session={session}
            />

            {/* Work Experience Section */}
            <WorkExperienceSection
              formData={formData}
              profileData={profileData}
              pendingPositions={pendingPositions}
              removedPositionIds={removedPositionIds}
              isModalOpen={isModalOpen}
              editingWorkingPosition={editingWorkingPosition}
              viewingPosition={viewingPosition}
              isViewWorkingPositionModalOpen={isViewModalOpen}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              handleCloseViewWorkingPositionModal={handleCloseViewModal}
              handleEditWorkingPosition={handleEditWorkingPosition}
              handleViewWorkingPosition={handleViewWorkingPosition}
              handleDeleteWorkingPosition={handleDeleteWorkingPosition}
              handleAddWorkingPositionToState={handleAddPositionToState}
              handleUpdateWorkingPositionInState={handleUpdatePositionInState}
              handleFormChange={handleFormChange}
              session={session}
            />

            {/* Organization Section */}
            <OrganizationSection
              formData={formData}
              profileData={profileData}
              pendingOrganizations={pendingOrganizations}
              removedOrganizationIds={removedOrganizationIds}
              isModalOpen={isModalOpen}
              editingAssociatedOrganization={editingAssociatedOrganization}
              viewingOrganization={viewingOrganization}
              isViewAssociatedOrganizationModalOpen={isViewOrgModalOpen}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              handleCloseViewAssociatedOrganizationModal={handleCloseViewOrgModal}
              handleEditAssociatedOrganization={handleEditAssociatedOrganization}
              handleViewAssociatedOrganization={handleViewAssociatedOrganization}
              handleDeleteAssociatedOrganization={handleDeleteAssociatedOrganization}
              handleAddAssociatedOrganizationToState={handleAddOrganizationToState}
              handleUpdateAssociatedOrganizationInState={handleUpdateOrganizationInState}
              session={session}
            />

            {/* Business Details Section */}
            <BusinessDetailsSection
              formData={formData}
              handleFormChange={handleFormChange}
              organizationRegistrationDocument={organizationRegistrationDocument}
              organizationGSTDocument={organizationGSTDocument}
              organizationPANDocument={organizationPANDocument}
              handleOrganizationRegistrationDocumentChange={e =>
                handleFileInputChangeByFieldName('organizationRegistrationDocument', e)
              }
              handleOrganizationGSTDocumentChange={e => handleFileInputChangeByFieldName('organizationGSTDocument', e)}
              handleOrganizationPANDocumentChange={e => handleFileInputChangeByFieldName('organizationPANDocument', e)}
              uploadOrganizationRegistrationDocToS3={handleUploadOrganizationRegistrationDocToS3}
              uploadOrganizationGSTDocToS3={handleUploadOrganizationGSTDocToS3}
              uploadOrganizationPANDocToS3={handleUploadOrganizationPANDocToS3}
              deleteFileFromS3Handler={handleDeleteFileFromS3}
            />

            {/* Resume Section */}
            <ResumeSection
              formData={formData}
              resumeFileInput={resumeFileInput}
              handleResumeFileInputChange={handleResumeFileInputChange}
              uploadResumeFileToS3={handleUploadResumeFileToS3}
              deleteFileFromS3Handler={handleDeleteFileFromS3}
            />

            {/* ----Socaial Media Profiles---- */}
            <SocialMediaInfo formData={formData} handleFormChange={handleFormChange} isUrlsValid={isUrlsValid} />

            {isModalOpen.language && (
              <NewLanguageModal
                email={session?.user?.email}
                open={isModalOpen.language}
                onClose={() => handleCloseModal('language')}
                onAddLanguageToState={handleAddLanguageToState}
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
                onAddOrganizationToState={handleAddOrganizationToState}
                onUpdateOrganizationInState={handleUpdateOrganizationInState}
                editingAssociatedOrganization={editingAssociatedOrganization}
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
                onAddEducationToState={handleAddEducationToState}
                onUpdateEducationInState={handleUpdateEducationInState}
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
                onAddPositionToState={handleAddPositionToState}
                onUpdatePositionInState={handleUpdatePositionInState}
                existingPositions={profileData?.workingPositions || []}
                editingWorkingPosition={editingWorkingPosition}
              />
            )}

            {/* View Working Position Modal */}
            <WorkingPositionViewModal
              open={isViewModalOpen}
              onClose={handleCloseViewModal}
              position={viewingPosition}
              onEdit={handleEditWorkingPosition}
            />

            {/* View Associated Organization Modal */}
            <AssociatedOrganizationViewModal
              open={isViewOrgModalOpen}
              onClose={handleCloseViewOrgModal}
              organization={viewingOrganization}
              onEdit={handleEditAssociatedOrganization}
            />

            {/* View Education Modal */}
            <EducationViewModal
              open={isViewEducationModalOpen}
              onClose={handleCloseViewEducationModal}
              education={viewingEducation}
              onEdit={handleEditEducation}
            />

            {/* Actions */}
            <Grid item xs={12} mt={4}>
              <Stack direction='row' spacing={2} justifyContent='center'>
                <Button variant='outlined' type='reset' onClick={handleResetForm}>
                  Reset
                </Button>
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
                  {isFormSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
