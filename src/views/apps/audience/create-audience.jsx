'use client'
import React, { useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'
import CreateAudienceForm from '@/components/audience/CreateAudienceForm'
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
        console.error('Error creating audience:', result)
        const errorMessage = result?.message || result?.error || 'Failed to create audience'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error creating audience:', error)
      const errorMessage =
        error?.message || error?.response?.data?.message || 'An error occurred while creating the audience'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/audience') // Redirect to audiences list
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
