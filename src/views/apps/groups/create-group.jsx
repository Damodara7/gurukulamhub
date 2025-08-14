'use client'
import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateGroupForm from '@/components/groups/CreateGroupForm'
function CreateGroupPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async values => {
    try {
      console.log(' form Data', values)
      // Prepare the payload
      const payload = {
        groupName: values.groupName,
        description: values.description,
        location: values.location,
        gender: values.gender,
        ageGroup: values.ageGroup,
        createdBy: session?.user?.id, // Use the found user ID
        creatorEmail: session?.user?.email
      }

      console.log('payload data ', payload)

      // Call your API
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP, payload)
      console.log('result', result)

      if (result?.status === 'success') {
        const groupId = result.result._id
        console.log('Group created successfully with ID:', groupId)
        toast.success('Group created successfully!')
        router.push('/management/groups')
      } else {
        console.error('Error creating group:', result.message)
        toast.error(result?.message || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('An error occurred while creating the group')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/groups') // Redirect to groups list
  }

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Create New Group</h1>
        <p className='text-muted-foreground'>Fill in the details below to create a new group</p>
      </div>

      <CreateGroupForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </div>
  )
}

export default CreateGroupPage
