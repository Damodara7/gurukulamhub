'use client'
import React, { useState, useEffect } from 'react'
import CreateGroupForm from '@/components/groups/CreateGroupForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import FallBackCard from '@/components/apps/games/FallBackCard'

const EditGroupPage = ({ groupId = null }) => {
  const [loading, setLoading] = useState(true)
  const [groupData, setGroupData] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { data: session } = useSession()

  // Fetch group data on component mount
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)

        if (res?.status === 'success') {
          // Transform the data to match CreateGroupForm expectations
          const data = res.result
          console.log('i am getting the group data in the edit mode ', data)
          console.log('groupdata members', data.members)

          const transformedData = {
            ...data,
            ageGroup: data.ageGroup || null,
            location: data.location || null,
            gender: data.gender || null,
            members: data.members || []
          }

          setGroupData(transformedData)
        } else {
          console.error('Error Fetching group:', res.message)
          setError(res.message || 'Failed to fetch group data')
        }
      } catch (error) {
        console.error('Error fetching group:', error)
        setError('An error occurred while fetching group data')
      } finally {
        setLoading(false)
      }
    }

    fetchGroupData()
  }, [groupId])

  const handleSubmit = async values => {
    try {
      console.log('form Data INTHE EDIT PAGE: ', values)
      setLoading(true)
      let payload = {
        ...values,
        updatedBy: session?.user?.id,
        updaterEmail: session?.user?.email,
        membersCount: values.members.length,
        members: values.members,
        // Ensure filter criteria is included
        ageGroup: values.ageGroup,
        location: values.location,
        gender: values.gender
      }
      console.log('payload IN THE EDIT PAGE: ', payload)

      let result
      if (groupId) {
        // Update the existing group
        result = await RestApi.put(`${API_URLS.v0.USERS_GROUP}`, payload)
      } else {
        // Create a new group
        result = await RestApi.post(`${API_URLS.v0.USERS_GROUP}`, payload)
      }

      if (result?.status === 'success') {
        toast.success(`Group ${groupId ? 'updated' : 'created'} successfully!`)
        router.push('/management/groups') // Redirect to groups list
      } else {
        console.error(`Error ${groupId ? 'updating' : 'creating'} group:`, result.message)
        toast.error(result?.message || `Failed to ${groupId ? 'update' : 'create'} group`)
      }
    } catch (error) {
      console.error(`Error ${groupId ? 'updating' : 'creating'} group:`, error)
      toast.error(`An error occurred while ${groupId ? 'updating' : 'creating'} the group`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/groups')
  }

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  // Show error state
  if (error || !groupData) {
    return (
      <FallBackCard
        content='Failed to load group data. You can go back to All Groups'
        path='/management/groups'
        btnText='Back To All Groups'
      />
    )
  }

  console.log('groupData members array  in the edit page', groupData.members)
  console.log('groupData  in the edit page', groupData)

  const updatedGroupData = { ...groupData, members: groupData?.members || [] }
  console.log('i am fetting the updated data', updatedGroupData)

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>{groupId ? 'Edit Group' : 'Create New Group'}</h1>
        <p className='text-muted-foreground'>
          {groupId ? 'Update the group details below' : 'Fill in the details below to create a new group'}
        </p>
      </div>
      <CreateGroupForm key={updatedGroupData} onSubmit={handleSubmit} onCancel={handleCancel} data={updatedGroupData} />
    </div>
  )
}

export default EditGroupPage
