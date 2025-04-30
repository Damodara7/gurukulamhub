'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'

// Component Imports
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import RoleDialog from '@/components/dialogs/role-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import Link from '@/components/Link'

// MUI Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { useEffect, useState } from 'react'
import { roleSliceActions } from '@/store/features/roleSlice'
import * as clientApi from '@/app/api/client/client.api'
import IconButtonTooltip from '@/components/IconButtonTooltip'
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
  const [roles, setRoles] = useState([])
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [currentRole, setCurrentRole] = useState(null) // Track the role to delete
  // Vars
  const typographyProps = {
    children: 'Edit Role',
    component: Link,
    color: 'primary',
    onClick: e => e.preventDefault()
  }

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

  // Handle delete confirmation dialog
  const handleDeleteConfirmation = role => {
    setCurrentRole(role)
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
          await refreshRoles() // Refresh data after deletion
          setCurrentRole(null)
        } else {
          console.log('Error deleting role:', result?.message)
        }
      } catch (error) {
        console.error('An error occurred while deleting the role:', error)
        throw new Error(error) // To handle it in Confirmation 2nd dialog
      } finally {
        setConfirmationDialogOpen(false) // Close the confirmation dialog
      }
    }
  }

  return (
    <>
      <Grid container spacing={6}>
        {roles.map((item, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                {/* <div className='flex items-center justify-between'>
                  <Typography className='flex-grow'>{`Total ${item?.totalUsers || 10} users`}</Typography>
                  <AvatarGroup total={item.totalUsers}>
                    {item?.avatars?.map((img, index) => (
                      <Avatar key={index} alt={item.name} src={`/images/avatars/${img}`} />
                    ))}
                  </AvatarGroup>
                </div> */}
                <div className='flex justify-between items-center'>
                  <div className='flex flex-col items-start gap-1'>
                    <Typography variant='h5'>{item.name}</Typography>
                    <OpenDialogOnElementClick
                      element={Typography}
                      elementProps={typographyProps}
                      dialog={RoleDialog}
                      dialogProps={{ roleData: item, refreshRoles }}
                    />
                  </div>
                  <div className='flex gap-1'>
                    {/* <IconButtonTooltip title='' className='p-[7px]'>
                      <i className='ri-file-copy-line text-secondary' />
                    </IconButtonTooltip> */}
                    <IconButtonTooltip title='Delete' disabled className='p-[7px]' onClick={() => handleDeleteConfirmation(item)}>
                      <DeleteOutlineIcon />
                    </IconButtonTooltip>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} lg={4}>
          <OpenDialogOnElementClick
            element={Card}
            elementProps={CardProps}
            dialog={RoleDialog}
            dialogProps={{ refreshRoles }}
          />
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-role' // Customize based on your context
        onConfirm={handleDelete}
      />
    </>
  )
}

export default RoleCards
