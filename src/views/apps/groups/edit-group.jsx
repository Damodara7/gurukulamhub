'use client'
import React, { useState } from 'react'
import CreateGroupForm from '@/components/groups/CreateGroupForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'

const EditGroupPage = ({ groupId = null, groupData = null }) => {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  const handleSubmit = async values => {
    try {
      console.log('form Data: ', values)
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
      console.log('payload: ', payload)

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

  if (loading && (groupData.length === 0 || (groupId && !groupData))) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
      </div>
    )
  }

  const updatedGroupData = { ...groupData, members: groupData?.members || [] }

  return (
    <div className='p-4'>
      <CreateGroupForm onSubmit={handleSubmit} onCancel={handleCancel} data={updatedGroupData} />
    </div>
  )
}

export default EditGroupPage
