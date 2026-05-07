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
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import BadgeIcon from '@mui/icons-material/Badge'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// MUI Imports
import Grid from '@mui/material/Grid'
import { styled, alpha } from '@mui/material/styles'
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
  referredBy: '',
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
  address: '',
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
  youtubeUrl: '',
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

const PROFILE_PHOTO_UPLOAD_TARGET_BYTES = 900 * 1024 // ~900KB to stay under strict proxy/body limits in prod

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
  const [originalDbPhone, setOriginalDbPhone] = useState('')
  const [originalDbDialCode, setOriginalDbDialCode] = useState('')

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
  const [memberIdCopied, setMemberIdCopied] = useState(false)
  const memberIdCopyTimerRef = useRef(null)

  // Validation and modal states
  const [isUrlsValid, setIsUrlsValid] = useState({
    instagramUrl: true,
    linkedInUrl: true,
    facebookUrl: true,
    youtubeUrl: true
  })
  const [isEpicValid, setIsEpicValid] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState({
    language: false,
    education: false,
    workingPosition: false,
    associatedOrganization: false
  })

  // Editing/viewing states
  const [editingEducation, setEditingEducation] = useState(null)
  const [editingLanguage, setEditingLanguage] = useState(null)
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

  const getProfileFileViewUrl = category => {
    if (!session?.user?.email) return ''
    return `/api/profile/files?email=${encodeURIComponent(session.user.email)}&category=${encodeURIComponent(
      category
    )}&action=content`
  }

  function setExistingFilesFromProfile(profile) {
    setImgSrc(
      profile?.profilePhotoFile?.key
        ? `${getProfileFileViewUrl('profilePhoto')}&_t=${Date.now()}`
        : profile?.image || session?.user?.image || '/images/avatars/1.png'
    )

    // Keep file input values for newly selected files only.
    setFileInput(null)
    setResumeFileInput(null)
    setOrganizationRegistrationDocument(null)
    setOrganizationGSTDocument(null)
    setOrganizationPANDocument(null)
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
            referredBy: user?.referredBy || profile?.referredBy || '',
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
            const dbPhoneWithDialCode = `${profile.countryDialCode}${profile.phone}`
            setPhoneInput(dbPhoneWithDialCode)
            setOriginalDbPhone(dbPhoneWithDialCode)
            setOriginalDbDialCode(String(profile.countryDialCode))
            validatePhone(dbPhoneWithDialCode, profile?.countryDialCode)
          } else {
            setOriginalDbPhone('')
            setOriginalDbDialCode('')
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

          // Populate file previews and rely on profile file metadata for existing files
          setExistingFilesFromProfile(profile)
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
      if (memberIdCopyTimerRef.current) clearTimeout(memberIdCopyTimerRef.current)
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

  function normalizeLanguageId(id) {
    if (id === null || id === undefined) return ''
    return String(id)
  }

  function isSameLanguageId(idA, idB) {
    return normalizeLanguageId(idA) === normalizeLanguageId(idB)
  }

  function getLanguageById(languageId) {
    const pendingLanguage = pendingLanguages.find(language => isSameLanguageId(language._id, languageId))
    if (pendingLanguage) return pendingLanguage

    const profileLanguage = profileData?.languages?.find(language => isSameLanguageId(language._id, languageId))
    if (profileLanguage) return profileLanguage

    return null
  }

  function handleEditLanguage(languageId) {
    const language = getLanguageById(languageId)
    if (!language) return

    setEditingLanguage(language)
    setIsModalOpen(prev => ({ ...prev, language: true }))
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
    if (normalizeLanguageId(languageId).startsWith('temp_')) {
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
    } else if (field === 'youtubeUrl') {
      const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/
      return youtubeRegex.test(value)
    }
  }

  function handleRefetchUserProfileData() {
    setShouldRefetchData(prev => !prev)
  }

  // Function to add language to pending state
  function handleAddLanguageToState(newLanguage) {
    const normalizedLanguage = newLanguage?.language?.trim().toLowerCase()
    const activeProfileLanguages = (profileData?.languages || []).filter(
      language => !removedLanguageIds.includes(language._id)
    )
    const duplicateLanguageExists = [...activeProfileLanguages, ...pendingLanguages].some(language => {
      return language.language?.trim().toLowerCase() === normalizedLanguage
    })

    if (duplicateLanguageExists) {
      toast.error('This language is already added.')
      return
    }

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
    setPendingLanguages(prev => prev.filter(lang => !isSameLanguageId(lang._id, languageId)))
    setLanguageOptions(prev => prev.filter(option => !isSameLanguageId(option.value, languageId)))
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: prev.knownLanguageIds.filter(id => !isSameLanguageId(id, languageId))
    }))
  }

  // Function to remove existing language from state (mark for removal)
  function handleRemoveExistingLanguage(languageId) {
    // Add to removed languages list
    setRemovedLanguageIds(prev =>
      prev.some(existingId => isSameLanguageId(existingId, languageId)) ? prev : [...prev, languageId]
    )

    // Remove from UI immediately
    setLanguageOptions(prev => prev.filter(option => !isSameLanguageId(option.value, languageId)))
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: prev.knownLanguageIds.filter(id => !isSameLanguageId(id, languageId))
    }))
  }

  function handleUpdateLanguageInState(updatedLanguage) {
    if (!updatedLanguage?._id) return

    const normalizedLanguage = updatedLanguage.language?.trim().toLowerCase()
    const removedLanguageIdSet = new Set(removedLanguageIds.map(id => normalizeLanguageId(id)))
    const activeProfileLanguages = (profileData?.languages || []).filter(
      language => !removedLanguageIdSet.has(normalizeLanguageId(language._id))
    )
    const duplicateLanguageExists = [...activeProfileLanguages, ...pendingLanguages].some(language => {
      if (isSameLanguageId(language._id, updatedLanguage._id)) return false

      return language.language?.trim().toLowerCase() === normalizedLanguage
    })

    if (duplicateLanguageExists) {
      toast.error('This language is already added.')
      return
    }

    // Update pending language directly if it is already pending
    if (normalizeLanguageId(updatedLanguage._id).startsWith('temp_')) {
      setPendingLanguages(prev =>
        prev.map(language =>
          isSameLanguageId(language._id, updatedLanguage._id) ? { ...language, ...updatedLanguage } : language
        )
      )
      setLanguageOptions(prev =>
        prev.map(option =>
          isSameLanguageId(option.value, updatedLanguage._id)
            ? { ...option, label: updatedLanguage.language }
            : option
        )
      )
      return
    }

    // Existing language edited: mark old as removed, add updated version as pending
    const tempUpdatedLanguage = {
      ...updatedLanguage,
      _id: `temp_${Date.now()}`
    }

    setRemovedLanguageIds(prev =>
      prev.some(existingId => isSameLanguageId(existingId, updatedLanguage._id))
        ? prev
        : [...prev, updatedLanguage._id]
    )
    setPendingLanguages(prev => [...prev, tempUpdatedLanguage])
    setLanguageOptions(prev => [
      ...prev.filter(option => !isSameLanguageId(option.value, updatedLanguage._id)),
      { value: tempUpdatedLanguage._id, label: tempUpdatedLanguage.language }
    ])
    setFormData(prev => ({
      ...prev,
      knownLanguageIds: prev.knownLanguageIds.map(id =>
        isSameLanguageId(id, updatedLanguage._id) ? tempUpdatedLanguage._id : id
      )
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
    if (field === 'youtubeUrl') {
      setIsUrlsValid(prev => ({ ...prev, [field]: validateUrl(field, value) }))
    }
    setFormData(prev => ({ ...prev, [field]: value }))
    console.log('Value: ', value, typeof value)
  }

  /** Sync map search / pin selection with profile fields saved via PUT /profile */
  function handleMapAddressChange(location) {
    setFormData(prev => {
      if (!location) {
        return { ...prev, address: '', coordinates: [] }
      }
      const next = {
        ...prev,
        address: location.address || ''
      }
      if (typeof location.lat === 'number' && typeof location.lng === 'number') {
        next.coordinates = [location.lng, location.lat]
      }
      if (location.street) next.street = location.street
      if (location.colony) next.colony = location.colony
      if (location.village) next.village = location.village
      return next
    })
  }

  const handleFileInputChange = event => {
    console.log('photo file event', event)
    const { files } = event.target
    console.log('photo file', files[0])

    if (files && files.length > 0) {
      const file = files[0] // Get the first file object

      const optimizeProfilePhoto = async originalFile => {
        // Keep non-image files unchanged (should not happen due accept attr, but safe fallback)
        if (!originalFile?.type?.startsWith('image/')) return originalFile
        if (originalFile.size <= PROFILE_PHOTO_UPLOAD_TARGET_BYTES) return originalFile

        const imageElement = await new Promise((resolve, reject) => {
          const img = new Image()
          const objectUrl = URL.createObjectURL(originalFile)
          img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(img)
          }
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Unable to process selected image'))
          }
          img.src = objectUrl
        })

        const canvas = document.createElement('canvas')
        const maxDimension = 1280
        const ratio = Math.min(1, maxDimension / imageElement.width, maxDimension / imageElement.height)
        canvas.width = Math.max(1, Math.round(imageElement.width * ratio))
        canvas.height = Math.max(1, Math.round(imageElement.height * ratio))
        const context = canvas.getContext('2d')
        if (!context) {
          return originalFile
        }
        context.drawImage(imageElement, 0, 0, canvas.width, canvas.height)

        let quality = 0.9
        let optimizedFile = null

        // Iteratively reduce quality until size target is reached.
        while (quality >= 0.5) {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
          if (!blob) break

          optimizedFile = new File([blob], `${originalFile.name.replace(/\.[^/.]+$/, '')}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })

          if (optimizedFile.size <= PROFILE_PHOTO_UPLOAD_TARGET_BYTES) {
            break
          }
          quality -= 0.1
        }

        return optimizedFile || originalFile
      }

      ;(async () => {
        try {
          const optimizedFile = await optimizeProfilePhoto(file)
          const reader = new FileReader()
          reader.onload = () => {
            setImgSrc(reader.result) // Set image preview
          }
          reader.readAsDataURL(optimizedFile)
          setFileInput(optimizedFile)
        } catch (error) {
          console.error('Error processing profile image:', error)
          toast.error('Unable to process selected image. Please try a smaller image.')
        }
      })()
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

  const languageDetails = useMemo(() => {
    return (formData?.knownLanguageIds || [])
      .map(id => {
        const pendingLanguage = pendingLanguages.find(language => language._id === id)
        if (pendingLanguage) return pendingLanguage

        const profileLanguage = profileData?.languages?.find(language => language._id === id)
        if (profileLanguage) return profileLanguage

        const option = languageOptions.find(each => each.value === id)
        if (option) {
          return {
            _id: id,
            language: option.label,
            canRead: false,
            canWrite: false,
            canSpeak: false
          }
        }

        return null
      })
      .filter(Boolean)
  }, [formData?.knownLanguageIds, pendingLanguages, profileData?.languages, languageOptions])

  const existingLanguageNames = useMemo(() => {
    return languageDetails.map(language => language.language).filter(Boolean)
  }, [languageDetails])

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
    handleFormChange('address', '')
    handleFormChange('coordinates', [])

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
        village: '',
        address: '',
        coordinates: []
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
        (formData.instagramUrl && !isUrlsValid.instagramUrl) ||
        (formData.youtubeUrl && !isUrlsValid.youtubeUrl)
      ) {
        setIsFormValid(false)
        setIsFormSubmitting(false)
        // toast.error('Invalid form data. Recheck and submit valid data.')
        return
      }

      setIsFormValid(true)

      // Efficiently process form data using Object.entries and reduce
      const allFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (key === 'coordinates') {
          if (Array.isArray(value) && value.length === 2) {
            acc[key] = value
          } else if (Array.isArray(value) && value.length === 0) {
            acc[key] = []
          }
          return acc
        }
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
          'village',
          'address'
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
        village: data.village,
        address: data.address,
        coordinates: data.coordinates
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
        [
          'organization',
          'organizationType',
          'websiteUrl',
          'isCurrentlyInAssociation',
          'associationStartDate',
          'associationEndDate'
        ]
      )

      console.log('User profile data sending to POST:', data)

      const result = await RestApi.put(API_URLS.v0.USERS_PROFILE, { email: session?.user?.email, ...data })
      // const result = await clientApi.updateUserProfile(session.user.email, data)
      if (result.status === 'success') {
        console.log('Updated  result', result.result)
        toast.success('Profile updated successfully!')
        console.log('user profile updating result', result.result)
        // Upload files based on user selections (independent of account type)
        await handleUploadResumeFileToS3()
        await handleUploadOrganizationRegistrationDocToS3()
        await handleUploadOrganizationGSTDocToS3()
        await handleUploadOrganizationPANDocToS3()

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
            websiteUrl: org.websiteUrl,
            isCurrentlyInAssociation: org.isCurrentlyInAssociation,
            associationStartDate: org.associationStartDate,
            associationEndDate: org.associationEndDate
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

  async function uploadProfileFileByCategory({ category, file }) {
    if (!file || !session?.user?.email) return null

    const formData = new FormData()
    formData.append('email', session.user.email)
    formData.append('category', category)
    formData.append('file', file)

    try {
      const response = await RestApi.submitFormData('/profile/files', formData)
      if (response?.status !== 'success') {
        throw new Error(response?.message || `Failed to upload ${category}`)
      }
      return response?.result
    } catch (error) {
      if (error?.status === 413) {
        throw new Error('Selected file is too large for upload. Please choose a smaller file.')
      }
      throw new Error(error?.message || `Failed to upload ${category}`)
    }
  }

  async function deleteProfileFileByCategory(category) {
    if (!session?.user?.email) return
    const response = await RestApi.del('/profile/files', { email: session.user.email, category })
    if (response?.status !== 'success') {
      throw new Error(response?.message || `Failed to delete ${category}`)
    }
  }

  async function handleUploadProfilePhotoToS3() {
    if (!fileInput) return
    const uploadedMeta = await uploadProfileFileByCategory({ category: 'profilePhoto', file: fileInput })
    if (uploadedMeta?.key) {
      setImgSrc(`${getProfileFileViewUrl('profilePhoto')}&_t=${Date.now()}`)
    }
  }

  async function handleUploadResumeFileToS3() {
    if (!resumeFileInput) return
    await uploadProfileFileByCategory({ category: 'resume', file: resumeFileInput })
  }

  async function handleUploadOrganizationRegistrationDocToS3() {
    if (!organizationRegistrationDocument) return
    await uploadProfileFileByCategory({ category: 'organizationRegistration', file: organizationRegistrationDocument })
  }

  async function handleUploadOrganizationGSTDocToS3() {
    if (!organizationGSTDocument) return
    await uploadProfileFileByCategory({ category: 'organizationGST', file: organizationGSTDocument })
  }

  async function handleUploadOrganizationPANDocToS3() {
    if (!organizationPANDocument) return
    await uploadProfileFileByCategory({ category: 'organizationPAN', file: organizationPANDocument })
  }

  async function handleDeleteFileFromS3(fileCategory) {
    if (!fileCategory) return
    await deleteProfileFileByCategory(fileCategory)
  }

  async function handleDeleteResumeFile() {
    try {
      await handleDeleteFileFromS3('resume')
      setResumeFileInput(null)
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              resumeFile: null
            }
          : prev
      )
      toast.success('Resume deleted successfully.')
    } catch (error) {
      console.error('Failed to delete resume:', error)
      toast.error(error?.message || 'Failed to delete resume.')
    }
  }

  async function handleDeleteOrganizationRegistrationFile() {
    try {
      await handleDeleteFileFromS3('organizationRegistration')
      setOrganizationRegistrationDocument(null)
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              organizationRegistrationFile: null
            }
          : prev
      )
      toast.success('Registration document deleted successfully.')
    } catch (error) {
      console.error('Failed to delete registration document:', error)
      toast.error(error?.message || 'Failed to delete registration document.')
    }
  }

  async function handleDeleteOrganizationGSTFile() {
    try {
      await handleDeleteFileFromS3('organizationGST')
      setOrganizationGSTDocument(null)
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              organizationGSTFile: null
            }
          : prev
      )
      toast.success('GST document deleted successfully.')
    } catch (error) {
      console.error('Failed to delete GST document:', error)
      toast.error(error?.message || 'Failed to delete GST document.')
    }
  }

  async function handleDeleteOrganizationPANFile() {
    try {
      await handleDeleteFileFromS3('organizationPAN')
      setOrganizationPANDocument(null)
      setProfileData(prev =>
        prev
          ? {
              ...prev,
              organizationPANFile: null
            }
          : prev
      )
      toast.success('PAN document deleted successfully.')
    } catch (error) {
      console.error('Failed to delete PAN document:', error)
      toast.error(error?.message || 'Failed to delete PAN document.')
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

  const handleRestoreVerifiedPhone = () => {
    if (!originalDbPhone || !originalDbDialCode) return

    const restoredPhone = originalDbPhone
    setPhoneInput(restoredPhone)
    setCountryDialCode(originalDbDialCode)
    validatePhone(restoredPhone, originalDbDialCode)
    setIsPhoneVerified(true)
  }

  const handlePhoneVerified = async () => {
    // Phone is intentionally persisted only on "Save Changes".
    setIsPhoneVerified(true)
  }

  const handleCopyMemberId = async () => {
    const memberId = formData?.memberId
    if (!memberId) return

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(memberId)
      }
      setMemberIdCopied(true)
    } catch (error) {
      console.error('Failed to copy member ID:', error)
      setMemberIdCopied(false)
    }

    if (memberIdCopyTimerRef.current) {
      clearTimeout(memberIdCopyTimerRef.current)
    }

    memberIdCopyTimerRef.current = setTimeout(() => {
      setMemberIdCopied(false)
      memberIdCopyTimerRef.current = null
    }, 1500)
  }

  const referredByValue = formData?.referredBy
  const hasReferrer = Boolean(
    referredByValue &&
      referredByValue.trim() &&
      referredByValue.toLowerCase() !== 'none@gurukulamhub.org' &&
      referredByValue.toLowerCase() !== 'none@gurukulamhub.com'
  )

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 20px 45px rgba(15, 30, 67, 0.08)',
        bgcolor: theme.palette.background.paper,
        overflow: 'hidden'
      }}
    >
      <CardContent
        sx={{
          position: 'relative',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(
                  theme.palette.secondary.main,
                  0.22
                )})`
              : `linear-gradient(125deg, ${alpha(theme.palette.primary.light, 0.18)}, ${alpha(
                  theme.palette.secondary.light,
                  0.12
                )})`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          pb: { xs: 4, md: 5 },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.primary.light, 0.25)}`
              : `1px solid ${alpha(theme.palette.common.white, 0.35)}`,
            pointerEvents: 'none'
          }
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ position: 'relative', zIndex: 2 }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              '& .avatar-upload-action': {
                position: 'absolute',
                left: '50%',
                bottom: -12,
                transform: 'translateX(-50%)',
                width: 54,
                height: 54,
                bgcolor: alpha(theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.common.white, 0.9),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.28)}`,
                transition: 'all 0.3s ease',
                opacity: 0
              },
              '&:hover .avatar-upload-action': {
                opacity: 1,
                bottom: -2
              }
            }}
          >
            <Box
              component='img'
              src={imgSrc || session?.user?.image || '/images/avatars/1.png'}
              alt='Profile'
              onError={event => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/images/avatars/1.png'
              }}
              sx={{
                width: { xs: 112, md: 132 },
                height: { xs: 112, md: 132 },
                borderRadius: 3,
                objectFit: 'cover',
                border: `2px solid ${alpha(theme.palette.common.white, 0.85)}`,
                boxShadow: `0 18px 36px ${alpha(
                  theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
                  0.25
                )}`
              }}
            />
            <IconButtonTooltip
              title='Upload'
              component='label'
              size='large'
              color='primary'
              className='avatar-upload-action'
              htmlFor='account-settings-upload-image'
            >
              <CloudUploadIcon />
              <input hidden type='file' accept='.jpg, .png, .jpeg' onChange={handleFileInputChange} id='account-settings-upload-image' />
            </IconButtonTooltip>
          </Box>

          <Stack spacing={4} sx={{ flex: 1, minWidth: 0 }}>
            {/* Header Section */}
            <Box>
              <Typography
                variant='overline'
                sx={{
                  letterSpacing: 2.5,
                  fontWeight: 700,
                  color: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.7 : 0.6),
                  fontSize: '0.7rem',
                  mb: 1.5,
                  display: 'block'
                }}
              >
                Account Overview
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', md: '2.15rem' },
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                  mb: 1.5,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Manage Your Profile
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.8) : 'text.secondary',
                  maxWidth: 600,
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}
              >
                Keep your personal information, professional milestones, and supporting documents up to date to unlock
                the full Gurukulam Hub experience.
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 3,
                mt: 1
              }}
            >
              {/* Member ID */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.12 : 0.05
                  ),
                  border: `1px solid ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.2 : 0.15
                  )}`,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === 'dark' ? 0.16 : 0.08
                    ),
                    borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.25),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BadgeIcon
                      sx={{
                        fontSize: 22,
                        color: theme.palette.primary.main
                      }}
                    />
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  >
                    Member ID
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Typography
                    variant='h5'
                    sx={{
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      wordBreak: 'break-word',
                      flex: 1,
                      minWidth: 0,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' }
                    }}
                  >
                    {formData?.memberId || '—'}
                  </Typography>
                  {formData?.memberId && (
                    <Tooltip title={memberIdCopied ? 'Copied!' : 'Copy member ID'} placement='top' arrow>
                      <IconButton
                        size='small'
                        onClick={handleCopyMemberId}
                        sx={{
                          bgcolor: alpha(
                            memberIdCopied ? theme.palette.success.main : theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.3 : 0.15
                          ),
                          color: memberIdCopied ? theme.palette.success.main : theme.palette.primary.main,
                          width: 40,
                          height: 40,
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: alpha(
                              memberIdCopied ? theme.palette.success.main : theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.4 : 0.25
                            ),
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {memberIdCopied ? (
                          <CheckIcon sx={{ fontSize: 20 }} />
                        ) : (
                          <ContentCopyIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              {/* Profile Completion */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  bgcolor: alpha(
                    theme.palette.secondary.main,
                    theme.palette.mode === 'dark' ? 0.12 : 0.05
                  ),
                  border: `1px solid ${alpha(
                    theme.palette.secondary.main,
                    theme.palette.mode === 'dark' ? 0.2 : 0.15
                  )}`,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: alpha(
                      theme.palette.secondary.main,
                      theme.palette.mode === 'dark' ? 0.16 : 0.08
                    ),
                    borderColor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.25),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckCircleIcon
                      sx={{
                        fontSize: 22,
                        color: theme.palette.secondary.main
                      }}
                    />
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  >
                    Profile Completion
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={2.5} alignItems='center' sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <CircularProgressWithValueLabel
                      value={profilePercentage}
                      size={72}
                      thickness={4.5}
                      fontSize={17}
                      textcolor={theme.palette.mode === 'dark' ? 'text.primary' : 'text.secondary'}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                        fontWeight: 800,
                        mb: 0.75,
                        fontSize: { xs: '1.15rem', sm: '1.3rem' },
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {profilePercentage}% Complete
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.75) : 'text.secondary',
                        lineHeight: 1.6,
                        fontSize: '0.875rem'
                      }}
                    >
                      {profilePercentage >= 80
                        ? 'Great job! Your profile is nearly complete.'
                        : 'Complete the remaining sections to boost your visibility.'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Referred By */}
              {hasReferrer && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.success.main,
                      theme.palette.mode === 'dark' ? 0.2 : 0.15
                    )}`,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
                      borderColor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.3 : 0.25),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.3 : 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className='ri-user-follow-line' style={{ fontSize: 20, color: theme.palette.success.main }} />
                    </Box>
                    <Typography
                      variant='caption'
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem'
                      }}
                    >
                      Referred By
                    </Typography>
                  </Stack>

                  <Typography
                    variant='h6'
                    sx={{
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      wordBreak: 'break-word',
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    {referredByValue}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>

        <Divider sx={{ mt: { xs: 3, md: 4 }, borderColor: alpha(theme.palette.common.white, 0.3) }} />
      </CardContent>
      <CardContent sx={{ pt: { xs: 4, md: 5 } }}>
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
                phoneDialCode: countryDialCode,
                originalDbPhone: originalDbPhone,
                onRestoreVerifiedPhone: handleRestoreVerifiedPhone,
                onPhoneVerified: handlePhoneVerified
              }}
              formData={formData}
              getLanguageLabel={getLanguageLabel}
              isFormValid={isFormValid}
              handleFormChange={handleFormChange}
              handleOpenModal={handleOpenModal}
              languageOptions={languageOptions}
              handleDeleteChipFromMultiSelect={handleDeleteChipFromMultiSelect}
              handleDeleteLanguage={handleDeleteLanguage}
              handleEditLanguage={handleEditLanguage}
              languageDetails={languageDetails}
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
              handleMapAddressChange={handleMapAddressChange}
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
              existingOrganizationRegistrationFile={profileData?.organizationRegistrationFile}
              existingOrganizationGSTFile={profileData?.organizationGSTFile}
              existingOrganizationPANFile={profileData?.organizationPANFile}
              profileFileViewUrlBuilder={getProfileFileViewUrl}
              onDeleteOrganizationRegistrationFile={handleDeleteOrganizationRegistrationFile}
              onDeleteOrganizationGSTFile={handleDeleteOrganizationGSTFile}
              onDeleteOrganizationPANFile={handleDeleteOrganizationPANFile}
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
              existingResumeFile={profileData?.resumeFile}
              profileFileViewUrlBuilder={getProfileFileViewUrl}
              onDeleteResumeFile={handleDeleteResumeFile}
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
                onClose={() => {
                  setEditingLanguage(null)
                  handleCloseModal('language')
                }}
                onAddLanguageToState={handleAddLanguageToState}
                onUpdateLanguageInState={handleUpdateLanguageInState}
                editingLanguage={editingLanguage}
                existingLanguageNames={existingLanguageNames}
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
                    (formData.linkedInUrl && !isUrlsValid.linkedInUrl) ||
                    (formData.youtubeUrl && !isUrlsValid.youtubeUrl)
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
