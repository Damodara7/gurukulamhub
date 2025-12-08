'use client' // Add this at the top for client components

import React, { useEffect, useState } from 'react'
import FreshLoginPopup from './FreshLoginPopup'
import { getUserWithAlertsByEmail } from '@/actions/userAlerts'
import { useSession } from 'next-auth/react'

// Map alert types to their components
const alertTypeToComponentMap = {
  LOGIN_ALERT: FreshLoginPopup
}

function getHighPriorityAlert(userAlerts) {
  // Use conditional nested access to safely check userAlerts
  if (!Array.isArray(userAlerts) || userAlerts.length === 0) return null

  // Filter alerts based on completionStatus and status
  // Use conditional nested access to safely check alert properties
  const filteredAlerts = userAlerts.filter(
    eachAlert =>
      eachAlert?.completionStatus === 'pending' &&
      eachAlert?.status === 'active' &&
      eachAlert?.alert?.priority !== undefined && // Ensure priority exists
      eachAlert?.alert !== null && // Ensure alert exists
      eachAlert?.alert !== undefined // Ensure alert is defined
  )

  if (filteredAlerts.length === 0) return null

  // Find the alert with the lowest priority
  // Use conditional nested access to safely access priority
  return (
    filteredAlerts.reduce(
      (lowest, current) => {
        const currentPriority = current?.alert?.priority ?? Infinity
        const lowestPriority = lowest?.alert?.priority ?? Infinity
        return currentPriority < lowestPriority ? current : lowest
      },
      filteredAlerts[0]
    ) || null
  )
}

export default function AlertComponentRenderer() {
  const { data: session } = useSession()
  const [highPriorityAlert, setHighPriorityAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const userAlertsResponse = await getUserWithAlertsByEmail({ email: session?.user?.email })
      if (userAlertsResponse?.status === 'success') {
        // Use conditional nested access to safely get alerts array
        const userAlerts = userAlertsResponse?.result?.alerts || []
        const alert = getHighPriorityAlert(userAlerts)
        setHighPriorityAlert(alert)
      } else {
        console.error('Error fetching user alerts:', userAlertsResponse?.message || 'Unknown error')
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // Fetch only when the component mounts

  if (loading) return null
  if (!highPriorityAlert) return null

  // Use conditional nested access to safely get alertType
  const alertType = highPriorityAlert?.alert?.alertType
  if (!alertType) return null

  const AlertComponent = alertTypeToComponentMap[alertType]
  if (!AlertComponent) return null

  return <AlertComponent alertData={highPriorityAlert} refreshData={fetchData} />
}
