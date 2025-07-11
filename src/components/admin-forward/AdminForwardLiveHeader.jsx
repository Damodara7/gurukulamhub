import React, { useState } from 'react'
import { Button, Dialog, DialogTitle, DialogContent, Box, Stack, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RegisteredPlayersTable from '@/components/apps/games/game-details/RegisteredPlayersTable'
import ParticipatedPlayersTable from '@/components/apps/games/game-details/ParticipatedPlayersTable'
import AdminLeaderboard from '@/components/apps/games/game-details/AdminLeaderboard'
import HowToReg from '@mui/icons-material/HowToReg'
import CheckCircle from '@mui/icons-material/CheckCircle'
import EmojiEvents from '@mui/icons-material/EmojiEvents'
function AdminForwardLiveHeader({ registeredUsers, participatedUsers, game }) {
  const [openDialog, setOpenDialog] = useState(null)

  const handleOpenDialog = dialogType => {
    setOpenDialog(dialogType)
  }

  const handleCloseDialog = () => {
    setOpenDialog(null)
  }
  const dialogStyle = {
    '& .MuiDialog-container': {
      alignItems: 'flex-start', // Align to top
      paddingTop: '150px' // Move up by 100px
    },
    '& .MuiPaper-root': {
      margin: 0 // Remove default margin
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Button variant='outlined' color='primary' size='small'  onClick={() => handleOpenDialog('registered')} startIcon={<HowToReg />}>
          Registered Users ({registeredUsers?.length})
        </Button>
        <Button variant='outlined' color='primary' size='small' onClick={() => handleOpenDialog('participated')} startIcon={<CheckCircle />}>
          Participated Users ({participatedUsers?.length})
        </Button>
        <Button variant='outlined' color='primary' size='small' onClick={() => handleOpenDialog('leaderboard')} startIcon={<EmojiEvents />}>
          Leaderboard
        </Button>
      </Box>

      {/* Registered Users Dialog */}
      <Dialog open={openDialog === 'registered'} onClose={handleCloseDialog} maxWidth='sm' fullWidth sx={dialogStyle}>
        <RegisteredPlayersTable registeredUsers={registeredUsers} participatedUsers={participatedUsers} game={game} />
      </Dialog>

      {/* Participated Users Dialog */}
      <Dialog open={openDialog === 'participated'} onClose={handleCloseDialog} maxWidth='sm' fullWidth sx={dialogStyle}>
        <ParticipatedPlayersTable participatedUsers={participatedUsers} game={game} />
      </Dialog>

      {/* Leaderboard Dialog */}
      <Dialog open={openDialog === 'leaderboard'} onClose={handleCloseDialog} maxWidth='lg' fullWidth sx={dialogStyle}>
        <AdminLeaderboard game={game} duringPlay={true} />
      </Dialog>
    </>
  )
}

export default AdminForwardLiveHeader
