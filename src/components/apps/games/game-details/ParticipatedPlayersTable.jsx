import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Avatar,
  Chip,
  Paper,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { People, CheckCircle, Cancel } from '@mui/icons-material'

function ParticipatedPlayersTable({ participatedUsers, game }) {
  const theme = useTheme()
  return (
    <Grid item xs={12} lg={6}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '16px',
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: theme.palette.background.paper
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant='h6'
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: theme.palette.text.primary,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            <CheckCircle sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.success.main }} />
            Participated Players ({participatedUsers.length})
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: { xs: 250, sm: 300 }, overflow: 'auto' }}>
            <Table stickyHeader size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>
                    Player
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      py: { xs: 1, sm: 1.5 },
                      display: { xs: 'none', md: 'table-cell' }
                    }}
                  >
                    Joined At
                  </TableCell>
                  <TableCell align='right' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1, sm: 1.5 } }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participatedUsers.length > 0 ? (
                  participatedUsers.map(user => (
                    <TableRow key={user._id} hover>
                      <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                          <Avatar
                            sx={{
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}
                            alt={user.email}
                          >
                            {user.email[0].toUpperCase()}
                          </Avatar>
                          <Typography
                            variant='body1'
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: { xs: '150px', sm: 'none' }
                            }}
                            title={user.email}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{ py: { xs: 1, sm: 1.5 }, display: { xs: 'none', md: 'table-cell' } }}
                      >
                        <Typography variant='body2' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {new Date(user.joinedAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align='right' sx={{ py: { xs: 1, sm: 1.5 } }}>
                        {user.completed ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Chip
                              icon={<CheckCircle fontSize='small' />}
                              label='Completed'
                              color='success'
                              size='small'
                              variant='outlined'
                            />
                            <Typography variant='caption' color='text.secondary'>
                              {new Date(user.finishedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip
                            icon={<Cancel fontSize='small' />}
                            label='In Progress'
                            color='warning'
                            size='small'
                            variant='outlined'
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align='center' sx={{ py: { xs: 3, sm: 4 } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <People sx={{ fontSize: { xs: 32, sm: 40 } }} color='disabled' />
                        <Typography
                          variant='body1'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          No participants yet
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.disabled'
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, textAlign: 'center', px: 2 }}
                        >
                          Player activity will appear here once they join the game
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default ParticipatedPlayersTable
