import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import FallBackCard from '@/components/apps/games/FallBackCard'
import EditGroupPage from '@/views/apps/groups/edit-group'

// Force fresh data on every visit - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getGroupData(groupId) {
  try {
    const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}?id=${groupId}`)
    if (res?.status === 'success') {
      // Transform the data to match CreateGroupForm expectations
      const groupData = res.result
      console.log('i am getting the group data in the edit mode ', groupData)
      console.log('groupdata members', groupData.members)
      return {
        ...groupData,
        ageGroup: groupData.ageGroup || null,
        location: groupData.location || null,
        gender: groupData.gender || null,
        members: groupData.members || []
      }
    }
    console.error('Error Fetching group:', res.message)
    return null
  } catch (error) {
    console.error('Error fetching group:', error)
    return null
  }
}

export default async function page({ params }) {
  const { id } = params

  // Force fresh data by adding cache control
  const groupData = await getGroupData(id)

  if (!groupData) {
    return (
      <FallBackCard content='You can go back to All Groups' path='/management/groups' btnText='Back To All Groups' />
    )
  }
  return <EditGroupPage groupId={id} groupData={groupData} />
}
