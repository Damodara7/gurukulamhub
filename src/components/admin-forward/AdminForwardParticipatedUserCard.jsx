import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Box,
  Avatar
} from '@mui/material'

function AdminForwardRegisteredUsersCard({ game = null }) {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }
  const cardstyle = game?.status === 'approved' || game?.status === 'lobby' || game?.status === 'cancelled'

  const tableHeight = 4 * 50

  return (
    <>
      <Grid item xs={12} sm={6} md={cardstyle ? 4 : 3}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 3,
              transform: 'scale(1.02)',
              transition: 'all 0.3s ease-in-out'
            }
          }}
          onClick={handleClickOpen}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' component='div' gutterBottom>
              Participated Users
            </Typography>
            <Typography
              variant='h2'
              component='div'
              sx={{
                fontWeight: 800,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {game?.participatedUsers?.length || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xs'
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '500px',
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontSize: '1.2rem'
          }}
        >
          Registered Users ({game?.participatedUsers?.length})
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
          <TableContainer
            component={Paper}
            sx={{
              height: tableHeight,
              overflow: 'auto',
              borderRadius: 0,
              '& .MuiTableRow-root': {
                height: '50px' // Fixed row height
              },
              '& .MuiTableCell-root': {
                py: 1.5,
                px: 3,
                height: '100%'
              }
            }}
          >
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'background.paper',
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      fontSize: '1rem'
                    }}
                  >
                    participated Users Emails
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {game?.participatedUsers.length > 0 ? (
                  game?.participatedUsers?.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }} alt={user.email}>
                            {user.email[0].toUpperCase()}
                          </Avatar>
                          <Typography variant='body1' noWrap>
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={1} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant='body1' color='text.secondary'>
                        No participated Users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminForwardRegisteredUsersCard
