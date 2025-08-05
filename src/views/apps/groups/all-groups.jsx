// 'use client'
// import React, { useEffect, useState } from 'react'
// import { toast } from 'react-toastify'
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { Box } from '@mui/material'

// const AllGroupsPage = ( ) => {
//   const router = useRouter()
//   const [groups, setGroups] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { data: session } = useSession()

//   const fechGroups = async () => {
//     setLoading(true)
//     try {
//       const result = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
//       console.log('complete api response' , result);
//       if (result?.status === 'success') {
//         setGroups(result.result || [])
//         console.log('groups data ', result.result)
//       } else {
//         console.error('Error fetching groups:', result)
//         toast.error('Failed to load groups')
//         setGroups([])
//       }
//     } catch (error) {
//       console.error('Error fetching groups:', error)
//       toast.error('An error occurred while loading groups')
//       setGroups([])
//     } finally {
//       setLoading(false)
//     }
//   }
  
//   useEffect(() => {
//     fechGroups()
//   }, [])




//   return (
//     <>
//       <Box className='flex flex-col items-center gap-5'>
        
//       </Box>
//     </>
//   )
// }

// export default AllGroupsPage

'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography, List, ListItem, ListItemText } from '@mui/material'

const AllGroupsPage = () => {
  const router = useRouter()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await RestApi.get(`${API_URLS.v0.USERS_GROUP}`)
      console.log('Complete API response:', res)

      if (res?.status === 'success') {
        setGroups(res.result || [])
      } else {
        console.error('Error fetching groups:', result)
        toast.error('Failed to load groups')
        setGroups([])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('An error occurred while loading groups')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' mt={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className='flex flex-col items-center gap-5'>
      <Typography variant='h4' component='h1' gutterBottom>
        All Groups
      </Typography>

      {groups.length === 0 ? (
        <Typography>No groups found</Typography>
      ) : (
        <List sx={{ width: '100%', maxWidth: 360 }}>
          {groups.map(group => (
            <ListItem key={group._id}>
              <ListItemText
                primary={group.groupName}
                secondary={`Age: ${group.ageGroup.min}-${group.ageGroup.max}, Gender: ${group.gender}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}

export default AllGroupsPage