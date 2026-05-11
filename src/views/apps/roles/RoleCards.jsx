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
import { useTheme } from '@mui/material/styles'

// Component Imports
import RoleDialog from '@/components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useEffect, useState } from 'react'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import Chip from '@mui/material/Chip'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import { useSession } from 'next-auth/react'
import { isSuperAdmin } from '@/utils/permissionUtils'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { toast } from 'react-toastify'

const CRITICAL_ROLES = [ROLES_LOOKUP.SUPER_ADMIN, ROLES_LOOKUP.ADMIN, ROLES_LOOKUP.USER]
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
  const theme = useTheme()
  const [roles, setRoles] = useState([])
  
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

  const [togglingRoleId, setTogglingRoleId] = useState(null)

  // Handle toggling active/inactive status
  const handleToggleActive = async (role) => {
    if (!isUserSuperAdmin) {
      toast.error('Only SUPER_ADMIN can change role status')
      return
    }

    setTogglingRoleId(role._id)
    try {
      const result = await RestApi.put(`${API_URLS.v0.ROLE}`, {
        ...role,
        isActive: !role.isActive,
        updatedBy: session?.user?.email
      })
      if (result?.status === 'success') {
        const newStatus = !role.isActive ? 'active' : 'inactive'
        toast.success(`Role "${role.name}" is now ${newStatus}`)
        await refreshRoles()
      } else {
        toast.error(result?.message || 'Failed to update role status')
      }
    } catch (error) {
      console.error('Error toggling role status:', error)
      toast.error(error?.message || 'An unexpected error occurred')
    } finally {
      setTogglingRoleId(null)
    }
  }

  return (
    <>
      <Grid container spacing={{ xs: 3, sm: 4, md: 6 }}>
        {roles.map((item, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card
              sx={{
                background: theme.palette.background.paper,
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
                        background: item.isActive
                          ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          : theme.palette.text.disabled,
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
                    <Chip
                      label={item.isActive ? 'Active' : 'Inactive'}
                      color={item.isActive ? 'success' : 'default'}
                      size='small'
                      variant='outlined'
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
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
                    <Tooltip
                      title={
                        CRITICAL_ROLES.includes(item.name)
                          ? `${item.name} is a system role and cannot be deactivated`
                          : !isUserSuperAdmin
                            ? 'Only SUPER_ADMIN can change status'
                            : item.isActive ? 'Deactivate Role' : 'Activate Role'
                      }
                    >
                      <span>
                        <Switch
                          size='small'
                          checked={item.isActive ?? true}
                          onChange={() => handleToggleActive(item)}
                          disabled={!isUserSuperAdmin || CRITICAL_ROLES.includes(item.name) || togglingRoleId === item._id}
                          color='success'
                        />
                      </span>
                    </Tooltip>
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
                background: theme.palette.background.paper,
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
    </>
  )
}

export default RoleCards
