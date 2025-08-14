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
      setLoading(true)
      console.log('values we are getting :', values)
      console.log('Session data:', session)
      console.log('Session user:', session?.user)

      // Check if session exists and has user data
      if (!session?.user) {
        toast.error('User session not found. Please login again.')
        return
      }

      // Get user ID from database using email from session
      let userId = null
      try {
        console.log('Attempting to fetch user ID for email:', session.user.email)

        // Get all users and find by email
        const userResult = await RestApi.get(`${API_URLS.v0.USER}`)
        console.log('All users result:', userResult)

        if (userResult?.status === 'success' && userResult.result) {
          // Handle both array and single object responses
          const users = Array.isArray(userResult.result) ? userResult.result : [userResult.result]
          const user = users.find(u => u.email === session.user.email)
          console.log('Found user by email:', user)
          if (user) {
            userId = user._id
          }
        }

        console.log('Final user ID found:', userId)
      } catch (error) {
        console.error('Error fetching user ID:', error)
        toast.error('Failed to fetch user information. Please try again.')
        setLoading(false)
        return
      }

      if (!userId) {
        toast.error('User ID not found. Please login again.')
        setLoading(false)
        return
      }

      // Prepare the payload
      const payload = {
        groupName: values.groupName,
        description: values.description,
        location: values.location,
        gender: values.gender,
        ageGroup: values.ageGroup,
        createdBy: userId, // Use the found user ID
        creatorEmail: session.user.email
      }

      console.log('Submitting group:', payload)

      // Call your API
      const result = await RestApi.post(API_URLS.v0.USERS_GROUP, payload)
      console.log('result', result)

      if (result?.status === 'success') {
        const groupId = result.result._id
        console.log('groupid aing', groupId)
        // Then, add the group to each user's groupIds array
        if (values.members && values.members.length > 0) {
          console.log(`Updating ${values.members.length} users with group ID ${groupId}`)

          try {
            await Promise.all(
              values.members.map(async userId => {
                // Get user details to find email
                const userResult = await RestApi.get(`${API_URLS.v0.USER}`)
                if (userResult?.status === 'success' && userResult.result) {
                  const users = Array.isArray(userResult.result) ? userResult.result : [userResult.result]
                  const user = users.find(u => u._id === userId)

                  if (user && user.email) {
                    // Get current user data to see existing groupIds
                    const currentUserResult = await RestApi.get(`${API_URLS.v0.USER}`)
                    let currentUser = null
                    if (currentUserResult?.status === 'success' && currentUserResult.result) {
                      const allUsers = Array.isArray(currentUserResult.result)
                        ? currentUserResult.result
                        : [currentUserResult.result]
                      currentUser = allUsers.find(u => u._id === userId)
                    }

                    if (currentUser) {
                      // Prepare updated groupIds array
                      const currentGroupIds = currentUser.groupIds || []
                      const updatedGroupIds = [...new Set([...currentGroupIds, groupId])]

                      // Update user with new groupIds
                      await RestApi.put(`${API_URLS.v0.USER}`, {
                        email: user.email,
                        groupIds: updatedGroupIds
                      })

                      console.log(`Updated user ${user.email} with group ID ${groupId}`)
                    }
                  }
                }
              })
            )

            console.log('Successfully updated all users with group ID')
          } catch (error) {
            console.error('Error updating users:', error)
            toast.warning('Group created but some users could not be updated')
          }
        }
        toast.success('Group created successfully!')
        router.push('/management/groups')
        // router.push(isSuperUser ? '/manage-games' : '/management/games') // Redirect to games list
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
