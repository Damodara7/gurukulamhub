// 'use client'
// import React, { useState } from 'react'
// import { Box, Button, Typography } from '@mui/material'
// import RegisterForm from '@/components/public-games/registered-game/RegisterForm';
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'


// const RegisterPage = ({ params }) => {
//   const [open , setOpen ] = useState(true);
//   const [game, setGame] = useState(null);
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const RegisterData = async () => {
//       try{
//         const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}?id=${params.id}`)
//         if(res.status === 'success'){
//           setGame(res.result)
//         }
//         else{
//           console.error('API Error:', res.message)
//           setError(res.message)
//         }
//       }
//       catch(err){
//         console.error('Fetch Error:', err)
//         setError(err.message)
//       }
//       finally{
//         setLoading(false)
//       }
//     }
//     if (params?.id) {
//       RegisterData()
//     }
//   }, [params?.id, router])

//   if (loading) {
//     return (
//       <Box p={4} display='flex' justifyContent='center'>
//         <CircularProgress />
//       </Box>
//     )
//   }  
//   if (error || !game) {
//     return (
//       <Box p={4}>
//         <Typography color='error'>Error loading game.</Typography>
//       </Box>
//     )
//   }
//   return (
//     <Box p={4}>
//       <RegisterForm open={open} handleClose={() => setOpen(false)} game = { game }  />
//     </Box>
//   )
// }

// export default RegisterPage





// 'use client'
// import React, { useState, useEffect } from 'react'
// import { Box, CircularProgress, Typography } from '@mui/material'
// import RegisterForm from '@/components/public-games/registered-game/RegisterForm'
// import * as RestApi from '@/utils/restApiUtil'
// import { API_URLS } from '@/configs/apiConfig'
// import { useRouter } from 'next/navigation'

// const RegisterPage = ({ params }) => {
//   const [game, setGame] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const router = useRouter()

//   useEffect(() => {
//     const fetchGameData = async () => {
//       try {
//         const res = await RestApi.get(`${API_URLS.v0.USERS_GAME}/${params.id}`)
//         if (res.status === 'success') {
//           setGame(res.result)
//         } else {
//           setError(res.message || 'Failed to load game data')
//         }
//       } catch (err) {
//         console.error('Fetch Error:', err)
//         setError(err.message)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (params?.id) {
//       fetchGameData()
//     }
//   }, [params?.id])

//   if (loading) {
//     return (
//       <Box p={4} display='flex' justifyContent='center'>
//         <CircularProgress />
//       </Box>
//     )
//   }

//   if (error || !game) {
//     return (
//       <Box p={4}>
//         <Typography color='error'>{error || 'Game not found'}</Typography>
//       </Box>
//     )
//   }

//   return (
//     <Box p={4}>
//       <RegisterForm game={game} handleClose={() => router.push('/public-games')} />
//     </Box>
//   )
// }

// export default RegisterPage