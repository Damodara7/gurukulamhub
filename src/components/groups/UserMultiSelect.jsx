// 'use client'
// import React, { useEffect, useState, useRef } from 'react'
// import {
//   Autocomplete,
//   Avatar,
//   Box,
//   Checkbox,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Divider,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemButton,
//   ListItemText,
//   Paper,
//   TextField,
//   Typography,
//   Button
// } from '@mui/material'
// import {
//   Person as PersonIcon,
//   CheckBox as CheckBoxIcon,
//   CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
//   IndeterminateCheckBox as IndeterminateCheckBoxIcon
// } from '@mui/icons-material'

// // Helper functions
// const getInitials = user => {
//   const firstInitial = user?.firstname?.[0]?.toUpperCase() || ''
//   const lastInitial = user?.lastname?.[0]?.toUpperCase() || ''
//   return firstInitial + lastInitial || ''
// }

// const getDisplayName = user => {
//   if (user?.firstname && user?.lastname) {
//     return `${user.firstname} ${user.lastname}`
//   }
//   return user?.firstname || user?.lastname || 'No name'
// }

// const UserMultiSelect = ({ users, selectedUsers, onSelectChange }) => {
//   const [open, setOpen] = useState(false)
//   const [selectAll, setSelectAll] = useState(true)
//   const [intermediate, setIntermediate] = useState(false)

//   useEffect(() => {
//     if (selectedUsers.length === users.length) {
//       setSelectAll(true)
//       setIntermediate(false)
//     } else if (selectedUsers.length > 0) {
//       setSelectAll(false)
//       setIntermediate(true)
//     } else {
//       setSelectAll(false)
//       setIntermediate(false)
//     }
//   }, [selectedUsers, users.length])

//   const handleToggleAll = () => {
//     if (selectAll || intermediate) {
//       onSelectChange([])
//     } else {
//       onSelectChange(users.map(user => user._id))
//     }
//   }

//   const handleToggle = userId => {
//     const currentIndex = selectedUsers.indexOf(userId)
//     const newSelected = [...selectedUsers]

//     if (currentIndex === -1) {
//       newSelected.push(userId)
//     } else {
//       newSelected.splice(currentIndex, 1)
//     }

//     onSelectChange(newSelected)
//   }
// const getSelectedUsers = () => {
//   return users.filter(user => selectedUsers.includes(user._id))
// }
//   return (
//     <Box>
//       <Autocomplete
//         multiple
//         open={false}
//         onOpen={() => setOpen(true)}
//         options={users}
//         value={getSelectedUsers()}
//         renderInput={params => (
//           <TextField
//             {...params}
//             label='Group Members'
//             placeholder={`${selectedUsers.length}/${users.length} selected`}
//           />
//         )}
//         renderTags={(value, getTagProps) =>
//           value.map((user, index) => (
//             <Chip
//               {...getTagProps({ index })}
//               key={user._id}
//               avatar={<Avatar src={user?.image || user?.profile?.image}>{getInitials(user)}</Avatar>}
//               label={getDisplayName(user)}
//             />
//           ))
//         }
//       />
//       {/* <Button variant='outlined' onClick={() => setOpen(true)} sx={{ mb: 2 }}>
//         Select Members ({selectedUsers.length}/{users.length}) selected
//       </Button> */}

//       <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xl' fullWidth>
//         <DialogTitle>Select Group Members</DialogTitle>
//         <DialogContent>
//           <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
//             <List dense>
//               {/* Select All option */}
//               <ListItem>
//                 <ListItemButton role={undefined} onClick={handleToggleAll} dense>
//                   <ListItemAvatar>
//                     <Avatar>
//                       {selectAll ? (
//                         <CheckBoxIcon />
//                       ) : intermediate ? (
//                         <IndeterminateCheckBoxIcon />
//                       ) : (
//                         <CheckBoxOutlineBlankIcon />
//                       )}
//                     </Avatar>
//                   </ListItemAvatar>
//                   <ListItemText primary='All Members' />
//                 </ListItemButton>
//                 <Chip label={`${selectedUsers.length}/${users.length} selected`} size='small' />
//               </ListItem>
//               <Divider />

//               {/* User list */}
//               {users.map(user => {
//                 const labelId = `checkbox-list-label-${user._id}`
//                 const isSelected = selectedUsers.indexOf(user._id) !== -1

//                 return (
//                   <ListItem key={user._id} disablePadding>
//                     <ListItemButton role={undefined} onClick={() => handleToggle(user._id)} dense>
//                       <ListItemAvatar>
//                         <Avatar src={user?.image || user?.profile?.image} alt={getDisplayName(user)}>
//                           {getInitials(user)}
//                         </Avatar>
//                       </ListItemAvatar>
//                       <ListItemText id={labelId} primary={getDisplayName(user)} secondary={user.email} />
//                       <Checkbox
//                         edge='end'
//                         checked={isSelected}
//                         tabIndex={-1}
//                         disableRipple
//                         inputProps={{ 'aria-labelledby': labelId }}
//                       />
//                     </ListItemButton>
//                   </ListItem>
//                 )
//               })}
//             </List>
//           </Paper>
//         </DialogContent>
//       </Dialog>
//     </Box>
//   )
// }


// export default UserMultiSelect

'use client'
import React, { useEffect, useState } from 'react'
import {
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Stack
} from '@mui/material'
import {
  Person as PersonIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
  Close as CloseIcon
} from '@mui/icons-material'

// Helper functions
const getInitials = user => {
  const firstInitial = user?.firstname?.[0]?.toUpperCase() || ''
  const lastInitial = user?.lastname?.[0]?.toUpperCase() || ''
  return firstInitial + lastInitial || ''
}

const getDisplayName = user => {
  if (user?.firstname && user?.lastname) {
    return `${user.firstname} ${user.lastname}`
  }
  return user?.firstname || user?.lastname || 'No name'
}

const UserMultiSelect = ({ users, selectedUsers, onSelectChange }) => {
  const [open, setOpen] = useState(false)
  const [selectAll, setSelectAll] = useState(true)
  const [intermediate, setIntermediate] = useState(false)

  useEffect(() => {
    if (selectedUsers.length === users.length) {
      setSelectAll(true)
      setIntermediate(false)
    } else if (selectedUsers.length > 0) {
      setSelectAll(false)
      setIntermediate(true)
    } else {
      setSelectAll(false)
      setIntermediate(false)
    }
  }, [selectedUsers, users.length])

  const handleToggleAll = () => {
    if (selectAll || intermediate) {
      onSelectChange([])
    } else {
      onSelectChange(users.map(user => user._id))
    }
  }

  const handleToggle = userId => {
    const currentIndex = selectedUsers.indexOf(userId)
    const newSelected = [...selectedUsers]

    if (currentIndex === -1) {
      newSelected.push(userId)
    } else {
      newSelected.splice(currentIndex, 1)
    }

    onSelectChange(newSelected)
  }

  const handleRemoveUser = (userId, e) => {
    e.stopPropagation()
    handleToggle(userId)
  }

  const getSelectedUsers = () => {
    return users.filter(user => selectedUsers.includes(user._id))
  }

  const renderSelectedUsers = () => {
    const selected = getSelectedUsers()
    const maxDisplay = 12
    const displayUsers = selected.slice(0, maxDisplay)
    const remainingCount = selected.length - maxDisplay

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
          width: '100%'
        }}
      >
      
        <Stack direction='row' spacing={4} alignItems='center'>
          {displayUsers.map(user => (
            <Box
              key={user._id}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 50 // Fixed width for consistent spacing
              }}
            >
              <Avatar
                src={user?.image || user?.profile?.image}
                sx={{
                  width: 40,
                  height: 40,
                  mb: 0.5 // Small margin between avatar and name
                }}
              >
                {getInitials(user)}
              </Avatar>
              <Typography
                variant='caption'
                sx={{
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center'
                }}
              >
                {getDisplayName(user).split(' ')[0]}
              </Typography>
              <IconButton
                size='small'
                sx={{
                  position: 'absolute',
                  top: 43,
                  right: -12,
                  backgroundColor: 'grey.300',
                  '&:hover': { backgroundColor: 'grey.400' },
                  width: 5,
                  height: 10
                }}
                onClick={e => handleRemoveUser(user._id, e)}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Typography
          variant='body2'
          sx={{
            ml: 2,
            minWidth: 60, // Ensure consistent width for the count
            textAlign: 'right'
          }}
        >
          {selectedUsers.length}/{users.length}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        onClick={() => setOpen(true)}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'text.primary'
          },
          minHeight: 60, // Minimum height
          minWidth: 300, // Minimum width
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {selectedUsers.length > 0 ? (
          renderSelectedUsers()
        ) : (
          <Typography color='textSecondary'>Select members ({users.length} available)</Typography>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xl' fullWidth>
        <DialogTitle>Select Group Members</DialogTitle>
        <DialogContent>
          <Paper sx={{ maxHeight: 600, overflow: 'auto' }}>
            <List dense>
              <ListItem>
                <ListItemButton role={undefined} onClick={handleToggleAll} dense>
                  <ListItemAvatar>
                    <Avatar>
                      {selectAll ? (
                        <CheckBoxIcon />
                      ) : intermediate ? (
                        <IndeterminateCheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary='All Members' />
                </ListItemButton>
                <Chip label={`${selectedUsers.length}/${users.length} selected`} size='small' />
              </ListItem>
              <Divider />

              {users.map(user => {
                const labelId = `checkbox-list-label-${user._id}`
                const isSelected = selectedUsers.indexOf(user._id) !== -1

                return (
                  <ListItem key={user._id} disablePadding>
                    <ListItemButton role={undefined} onClick={() => handleToggle(user._id)} dense>
                      <ListItemAvatar>
                        <Avatar src={user?.image || user?.profile?.image}>{getInitials(user)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText id={labelId} primary={getDisplayName(user)} secondary={user.email} />
                      <Checkbox
                        edge='end'
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Paper>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UserMultiSelect