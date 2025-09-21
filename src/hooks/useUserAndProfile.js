import { useState, useEffect } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const useUserAndProfile = ({ email }) => {
  const [userAndProfile, setUserAndProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasFetchedUser, setHasFetchedUser] = useState(false)
  const [error, setError] = useState('') // To store the error message

  // Function to validate email
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
    const fetchRoles = async () => {
      if (!email) {
        setError('Email is required')
        return
      }

      if (!validateEmail(email)) {
        setError('Please provide a valid email address')
        return
      }

      if (hasFetchedUser) return // Skip if already fetched

      setLoading(true)
      try {
        const result = await RestApi.get(`${API_URLS.v0.USERS_PROFILE}?email=${email}`)
        if (result?.status === 'success') {
          setUserAndProfile(result.result)
          setHasFetchedUser(true)
          setError('') // Reset error on successful fetch
        } else {
          setError(`Error fetching roles: ${result?.message}`)
        }
      } catch (error) {
        console.error('Error fetching roles:', error)
        setError('An error occurred while fetching user data')
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [hasFetchedUser, email]) // Re-run when email changes

  const { user, profile } = userAndProfile

  return { user, profile, loading, error } // Return error state as well
}

export default useUserAndProfile
