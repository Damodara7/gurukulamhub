'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

// Component Imports
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import RoleDialog from '@/components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

// MUI Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useEffect, useState } from 'react'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { useSession } from 'next-auth/react'
import { isSuperAdmin } from '@/utils/permissionUtils'
import { toast } from 'react-toastify'
// import { useAppDispatch } from '@/store/hooks'

// Vars
// const cardData = [
//   { totalUsers: 4, title: 'Administrator', avatars: ['1.png', '2.png', '3.png', '4.png'] },
//   { totalUsers: 7, title: 'Editor', avatars: ['5.png', '6.png', '7.png'] },
//   { totalUsers: 5, title: 'Users', avatars: ['4.png', '5.png', '6.png'] },
//   { totalUsers: 6, title: 'Support', avatars: ['1.png', '2.png', '3.png'] },
//   { totalUsers: 10, title: 'Restricted User', avatars: ['4.png', '5.png', '6.png'] }
// ]

const RoleCards = () => {
  // const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const [roles, setRoles] = useState([])
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [currentRole, setCurrentRole] = useState(null) // Track the role to delete
  
  const userRoles = session?.user?.roles || []
  const isUserSuperAdmin = isSuperAdmin(userRoles)
  const CardProps = {
    className: 'cursor-pointer bs-full',
    children: (
      <Grid container className='bs-full'>
        <Grid item xs={4}>
          <div className='flex items-end justify-center bs-full'>
            <img alt='add-role' src='/images/illustrations/characters/1.png' height={90} />
          </div>
        </Grid>
        <Grid item xs={8}>
          <CardContent>
            <div className='flex flex-col items-end gap-1 text-right my-0'>
              <Button
                variant='contained'
                size='small'
                component='label'
                style={{ color: 'white', padding: '4px 10px' }}
              >
                Add Role
              </Button>
              <Typography variant='body2' mb={0}>
                Add new role, if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    )
  }

  // Fetch the roles from API
  const getRolesData = async () => {
    console.log('Fetching Roles Data now...')
    // const result = await clientApi.getAllRoles() // Change this to the correct endpoint for roles
    const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
    if (result?.status === 'success') {
      console.log('Roles Fetched result', result)
      setRoles(result?.result || []) // Store the fetched roles data
      // dispatch(roleSliceActions.refreshRoles(result?.result || []))
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching roles:', result)
    }
  }

  useEffect(() => {
    getRolesData() // Call the updated function to fetch roles data
  }, [])

  const refreshRoles = async () => {
    await getRolesData() // Call fetchRoles to refresh roles
  }

  const [affectedUserCount, setAffectedUserCount] = useState(0)

  // Handle delete confirmation dialog
  const handleDeleteConfirmation = async role => {
    setCurrentRole(role)
    
    // Fetch user count for this role
    try {
      const countResult = await RestApi.get(`${API_URLS.v0.ROLE}?id=${role._id}&action=userCount`)
      if (countResult?.status === 'success') {
        setAffectedUserCount(countResult.result?.count || 0)
      } else {
        setAffectedUserCount(0)
      }
    } catch (error) {
      console.error('Error fetching user count:', error)
      setAffectedUserCount(0)
    }
    
    setConfirmationDialogOpen(true)
  }

  // Handle the actual delete operation
  const handleDelete = async () => {
    if (currentRole) {
      // console.log('Deleting role ' + curr)
      try {
        // const result = await clientApi.deleteRole(currentRole._id)
        const result = await RestApi.del(`${API_URLS.v0.ROLE}?id=${currentRole._id}`)
        if (result?.status === 'success') {
          console.log(`Role deleted: ${currentRole.name}`)
          const affectedUsers = result?.result?.affectedUsers
          const userCount = affectedUsers?.count || 0
          
          // Show success message with affected user count
          if (userCount > 0) {
            toast.success(`Role deleted successfully. Removed from ${userCount} user(s).`)
          } else {
            toast.success('Role deleted successfully.')
          }
          
          await refreshRoles() // Refresh data after deletion
          setCurrentRole(null)
          setAffectedUserCount(0)
        } else {
          console.log('Error deleting role:', result?.message)
          toast.error(result?.message || 'Failed to delete role')
        }
      } catch (error) {
        console.error('An error occurred while deleting the role:', error)
        toast.error(error?.message || 'An unexpected error occurred')
        throw new Error(error) // To handle it in Confirmation 2nd dialog
      } finally {
        setConfirmationDialogOpen(false) // Close the confirmation dialog
      }
    }
  }

  return (
    <>
      <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
        {roles.map((item, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              sx={{
                background: '#ffffff',
                borderRadius: 3,
                boxShadow: theme => theme.shadows[3],
                border: theme => `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme => theme.shadows[8]
                }
              }}
            >
              <CardContent className='flex flex-col gap-4'>
                <div className='flex justify-between items-start gap-3'>
                  <div className='flex flex-col items-start gap-1 flex-grow min-w-0'>
                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                        lineHeight: 1.3,
                        wordBreak: 'break-word',
                        width: '100%'
                      }}
                    >
                      {item.name}
                    </Typography>
                  </div>
                  <Stack direction='row' spacing={1} alignItems='center' sx={{ flexShrink: 0 }}>
                    <OpenDialogOnElementClick
                      element={IconButtonTooltip}
                      elementProps={{
                        title: 'Edit Role',
                        sx: {
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.main',
                            transform: 'scale(1.1)'
                          }
                        },
                        children: <i className='ri-pencil-line' />
                      }}
                      dialog={RoleDialog}
                      dialogProps={{ roleData: item, refreshRoles }}
                    />
                    {isUserSuperAdmin && (
                      <IconButtonTooltip
                        title='Delete (Super Admin Only)'
                        onClick={() => handleDeleteConfirmation(item)}
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.main',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        <DeleteOutlineIcon fontSize='small' />
                      </IconButtonTooltip>
                    )}
                  </Stack>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} lg={4}>
          <OpenDialogOnElementClick
            element={Card}
            elementProps={{
              ...CardProps,
              sx: {
                background: '#ffffff',
                borderRadius: 3,
                boxShadow: theme => theme.shadows[3],
                border: theme => `2px dashed ${theme.palette.primary.main}`,
                transition: 'all 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme => theme.shadows[8],
                  borderColor: 'primary.dark'
                }
              }
            }}
            dialog={RoleDialog}
            dialogProps={{ refreshRoles }}
          />
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type={affectedUserCount > 0 ? 'delete-role-with-users' : 'delete-role'}
        onConfirm={handleDelete}
        affectedUserCount={affectedUserCount}
        roleName={currentRole?.name}
      />
    </>
  )
}

export default RoleCards
