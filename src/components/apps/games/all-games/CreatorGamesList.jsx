import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
} from '@mui/material'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useSession } from 'next-auth/react'
import Loading from '@/components/Loading'
import CreatorGameCard from './CreatorGameCard'
import { toast } from 'react-toastify'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useRouter } from 'next/navigation'

const CreatorGameList = ({ games = [], loading = false, onRefresh, setGames, isSuperUser = false }) => {
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [gameToDelete, setGameToDelete] = useState(null) // Track the game to delete
  const wsRef = useRef(null)
  const [localGames, setLocalGames] = useState(games)
  const gamesToUse = setGames ? games : localGames
  console.log('GameList games: ', games)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    setLocalGames(games)
  }, [games])

  useEffect(() => {
    // WebSocket connection for real-time games list updates
    const wsUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/ws/games`
        : ''
    if (wsUrl) {
      wsRef.current = new WebSocket(wsUrl)
      wsRef.current.onopen = () => {
        console.log('[WS] Connected to games list updates')
      }
      wsRef.current.onmessage = event => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'gamesList') {
            if (setGames) {
              setGames(msg.data)
            } else {
              setLocalGames(msg.data)
            }
          }
        } catch (e) {
          console.error('[WS] Error parsing games list message', e)
        }
      }
      wsRef.current.onerror = err => {
        console.error('[WS] Games list error', err)
      }
      wsRef.current.onclose = () => {
        console.log('[WS] Games list connection closed')
      }
    }
    return () => {
        // if (wsRef.current) {
        //   wsRef.current.close()
        // }
    }
  }, [])

  const handleApproveGame = async gameId => {
    try {
      const result = await RestApi.post(`${API_URLS.v0.USERS_GAME}/${gameId}/approve`, {
        status: 'approved',
        approvedBy: session?.user?.id,
        approverEmail: session?.user?.email
      })

      if (result?.status === 'success') {
        toast.success('Game approved!')
        // onRefresh() // Refresh the list
      } else {
        console.error('Error approving game:', result)
        toast.error(result?.message || 'Failed to approve game')
      }
    } catch (error) {
      console.error('Error approving game:', error)
      toast.error('An error occurred while approving game')
    }
  }

  const handleFinalDeleteGame = async gameId => {
    if (!session?.user?.email) {
      toast.error('Authentication required')
      return
    }
    try {
      const result = await RestApi.del(`${API_URLS.v0.USERS_GAME}?id=${gameId}`, { email: session?.user?.email })
      if (result?.status === 'success') {
        // onRefresh() // Refresh the list
        toast.success('Game deleted successfully!')
      } else {
        console.error('Error deleting game:', result)
        toast.error(result?.message || 'Failed to delete game')
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('An error occurred while deleting game')
    }
  }

  async function handleViewGame(id) {
    console.log('Clicked View game of id: ', id)
    router.push(isSuperUser ? `/manage-games/${id}` : `/apps/games/${id}`)
  }
  async function handleEditGame(id) {
    console.log('Clicked Edit game of id: ', id)
    router.push(isSuperUser ? `/manage-games/${id}/edit` : `/apps/games/${id}/edit`)
  }

  async function handleLeaderboard(id) {
    console.log('Clicked Leaderboard game of id: ', id)
    router.push(isSuperUser ? `/manage-games/${id}/leaderboard` : `/apps/games/${id}/leaderboard`)
  }

  async function handleAdminForward(id) {
    console.log('Clicked Admin Forward game of id: ', id)
    router.push(`/apps/games/${id}/admin-forward`)
  }


  const handleDeleteConfirmation = game => {
    setGameToDelete(game)
    setConfirmationDialogOpen(true)
  }

  if (loading) {
    return (
      <Box p={4} display='flex' justifyContent='center'>
        <Loading />
      </Box>
    )
  }

  return (
    <>
      <Container maxWidth='xl' sx={{ position: 'relative', pb: 10 }}>
        {gamesToUse.length === 0 ? (
          <Box textAlign='center' py={6}>
            <Typography variant='body1' color='text.secondary'>
              No games found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {gamesToUse.map(game => (
              <Grid item key={game._id} xs={12} sm={6} md={4} lg={3}>
                <CreatorGameCard
                  game={game}
                  isSuperUser={isSuperUser}
                  onViewGame={handleViewGame}
                  onEditGame={handleEditGame}
                  onApproveGame={handleApproveGame}
                  onDeleteGame={handleDeleteConfirmation}
                  onLeaderboard={handleLeaderboard}
                  onAdminForward={handleAdminForward}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-game' // Customize based on your context
        onConfirm={() => {
          handleFinalDeleteGame(gameToDelete?._id)
          setGameToDelete(null) // Reset after confirmation
        }}
      />
    </>
  )
}
export default CreatorGameList
