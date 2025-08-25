import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import CreateAudienceForm from '@/components/audience/CreateAduienceForm'
import FallBackCard from '@/components/apps/games/FallBackCard'

const EditAudiencePage = ({ audienceId = null }) => {
  const [loading, setLoading] = useState(true)
  const [audienceData, setAudienceData] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { data: session } = useSession()

  // Fetch audience data on component mount
  useEffect(() => {
    const fetchAudienceData = async () => {
      if (!audienceId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await RestApi.get(`${API_URLS.v0.USERS_AUDIENCE}?id=${audienceId}`)

        if (res?.status === 'success') {
          // Transform the data to match CreateAudienceForm expectations
          const data = res.result
          console.log('i am getting the audience data in the edit mode ', data)
          console.log('audiencedata members', data.members)

          const transformedData = {
            ...data,
            ageGroup: data.ageGroup || null,
            location: data.location || null,
            gender: data.gender || null,
            members: data?.members?.map(member => member._id) || []
          }

          setAudienceData(transformedData)
        } else {
          console.error('Error Fetching audience:', res.message)
          setError(res.message || 'Failed to fetch audience data')
        }
      } catch (error) {
        console.error('Error fetching audience:', error)
        setError('An error occurred while fetching audience data')
      } finally {
        setLoading(false)
      }
    }

    fetchAudienceData()
  }, [audienceId])

  const handleSubmit = async values => {
    try {
      console.log('form Data INTHE EDIT PAGE: ', values)
      setLoading(true)
      let payload = {
        ...values,
        updatedBy: session?.user?.id,
        updaterEmail: session?.user?.email,
        members: values.members,
        membersCount: values.members.length,
        // Ensure filter criteria is included
        ageGroup: values.ageGroup,
        location: values.location,
        gender: values.gender
      }
      console.log('payload IN THE EDIT PAGE: ', payload)

      let result
      if (audienceId) {
        // Update the existing audience
        result = await RestApi.put(`${API_URLS.v0.USERS_AUDIENCE}`, payload)
      } else {
        // Create a new audience
        result = await RestApi.post(`${API_URLS.v0.USERS_AUDIENCE}`, payload)
      }

      if (result?.status === 'success') {
        toast.success(`Audience ${audienceId ? 'updated' : 'created'} successfully!`)
        router.push('/management/audience') // Redirect to audience list
      } else {
        console.error(`Error ${audienceId ? 'updating' : 'creating'} audience:`, result.message)
        toast.error(result?.message || `Failed to ${audienceId ? 'update' : 'create'} audience`)
      }
    } catch (error) {
      console.error(`Error ${audienceId ? 'updating' : 'creating'} audience:`, error)
      toast.error(`An error occurred while ${audienceId ? 'updating' : 'creating'} the audience`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/management/audience')
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
  if (error || !audienceData) {
    return (
      <FallBackCard
        content='Failed to load audience data. You can go back to All Audiences'
        path='/management/audience'
        btnText='Back To All Audiences'
      />
    )
  }

  console.log('audienceData members array  in the edit page', audienceData.members)
  console.log('audienceData  in the edit page', audienceData)

  const updatedAudienceData = { ...audienceData, members: audienceData?.members || [] }
  console.log('i am fetting the updated data', updatedAudienceData)

  return (
    <div className='p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>{audienceId ? 'Edit Audience' : 'Create New Audience'}</h1>
        <p className='text-muted-foreground'>
          {audienceId ? 'Update the audience details below' : 'Fill in the details below to create a new audience'}
        </p>
      </div>
      <CreateAudienceForm
        key={updatedAudienceData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        data={updatedAudienceData}
      />
    </div>
  )
}

export default EditAudiencePage
