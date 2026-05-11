'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ActiveRoleContext = createContext(null)

const STORAGE_KEY = 'gurukulamhub_activeRole'

export const ActiveRoleProvider = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setActiveRoleState(stored)
      }
    } catch {}
    setHydrated(true)
  }, [])

  const setActiveRole = useCallback((roleName) => {
    try {
      if (roleName === null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, roleName)
      }
    } catch {}
    setActiveRoleState(roleName)
  }, [])

  const clearActiveRole = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setActiveRoleState(null)
  }, [])

  const getEffectiveRoles = useCallback((userRoles) => {
    if (!activeRole || !userRoles || userRoles.length === 0) {
      return userRoles
    }
    if (userRoles.includes(activeRole)) {
      return [activeRole]
    }
    return userRoles
  }, [activeRole])

  return (
    <ActiveRoleContext.Provider value={{ activeRole, setActiveRole, clearActiveRole, getEffectiveRoles, hydrated }}>
      {children}
    </ActiveRoleContext.Provider>
  )
}

export const useActiveRole = () => {
  const context = useContext(ActiveRoleContext)
  if (!context) {
    return { activeRole: null, setActiveRole: () => {}, clearActiveRole: () => {}, getEffectiveRoles: (r) => r, hydrated: true }
  }
  return context
}

export default ActiveRoleContext
