'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'

const GroupContext = createContext()

export const useGroupContext = () => {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error('useGroupContext must be used within a GroupProvider')
  }
  return context
}

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const refreshGroups = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const addGroup = useCallback(newGroup => {
    setGroups(prev => [newGroup, ...prev])
  }, [])

  const updateGroup = useCallback(updatedGroup => {
    setGroups(prev => prev.map(group => (group._id === updatedGroup._id ? updatedGroup : group)))
  }, [])

  const removeGroup = useCallback(groupId => {
    setGroups(prev => prev.filter(group => group._id !== groupId))
  }, [])

  const value = {
    groups,
    refreshTrigger,
    refreshGroups,
    addGroup,
    updateGroup,
    removeGroup
  }

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
}
