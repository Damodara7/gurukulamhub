'use client'
import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateAudienceForm from '@/components/audience/CreateAduienceForm'
function CreateAudiencePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async values => {
    try {
      console.log(' form Data', values)
      // Prepare the payload
      const payload = {
        audienceName: values.audienceName,
        description: values.description,
        location: values.location,
        gender: values.gender,
        ageGroup: values.ageGroup,
        createdBy: session?.user?.id, // Use the found user ID
        creatorEmail: session?.user?.email,
        members: values.members,
        membersCount: values.membersCount
      }

      console.log('payload data ', payload)

      // Call your API
      const result = await RestApi.post(API_URLS.v0.USERS_AUDIENCE, payload)
      console.log('result', result)

      if (result?.status === 'success') {
        const audienceId = result.result._id
        console.log('Audience created successfully with ID:', audienceId)
        toast.success('Audience created successfully!')
        router.push('/management/audience')
      } else {
        console.error('Error creating audience:', result.message)
        toast.error(result?.message || 'Failed to create audience')
      }
    } catch (error) {
      console.error('Error creating audience:', error)
      toast.error('An error occurred while creating the audience')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/audience') // Redirect to groups list
  }

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>Create New Audience</h1>
        <p className='text-muted-foreground'>Fill in the details below to create a new audience</p>
      </div>

      <CreateAudienceForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </div>
  )
}

export default CreateAudiencePage
