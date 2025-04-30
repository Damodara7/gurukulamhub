import React, { useState } from 'react'
import { Chip, Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const FilterChips = ({ filters, onEdit, onRemove, onClearAll }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedChip, setSelectedChip] = useState(null)

  const handleClick = (event, chip) => {
    setAnchorEl(event.currentTarget)
    setSelectedChip(chip)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedChip(null)
  }

  const handleEdit = () => {
    onEdit(selectedChip)
    handleClose()
  }

  const handleRemove = () => {
    onRemove(selectedChip)
    handleClose()
  }

  return (
    <Box display='flex' alignItems='center' flexWrap='wrap'>
      {filters.length > 0 && (
        <Box display='flex' alignItems='center'>
          <Chip size='small' label='Clear All' color='secondary' onClick={onClearAll} sx={{ marginRight: 1 }} />
        </Box>
      )}
      {filters.map((filter, index) => (
        <Box key={index} sx={{ margin: 0.5, position: 'relative' }}>
          <Chip
            label={filter.label}
            size='small'
            deleteIcon={<MoreVertIcon />}
            onDelete={e => handleClick(e, filter)}
            // sx={{ '&:hover': { cursor: 'pointer' } }}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedChip === filter}
            onClose={handleClose}
            sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            slotProps={{
              paper: {
                sx: {
                  '& .MuiMenuItem-root': {
                    fontSize: '12px'
                  }
                }
              }
            }}
          >
            <MenuItem dense onClick={handleEdit}>
              <EditIcon sx={{ marginRight: 1 }} /> Edit
            </MenuItem>
            <MenuItem dense onClick={handleRemove}>
              <CloseIcon sx={{ marginRight: 1 }} /> Remove
            </MenuItem>
          </Menu>
        </Box>
      ))}
    </Box>
  )
}

export default FilterChips

// import React from 'react'
// import { Chip, Box, IconButton, Tooltip } from '@mui/material'
// import EditIcon from '@mui/icons-material/Edit'
// import CloseIcon from '@mui/icons-material/Close'

// const FilterChips = ({ filters, onEdit, onRemove, onClearAll }) => {
//   return (
//     <Box display='flex' alignItems='center' flexWrap='wrap'>
//       {filters.length > 0 && (
//         <Box display='flex' alignItems='center'>
//           <Chip label='Clear All' color='secondary' onClick={onClearAll} sx={{ marginRight: 1 }} />
//         </Box>
//       )}
//       {filters.map((filter, index) => (
//         <Box key={index} sx={{ margin: 0.5 }}>
//           <Chip
//             label={filter.label}
//             onDelete={() => onRemove(filter)}
//             deleteIcon={
//               <Tooltip title='Edit'>
//                 <IconButtonTooltip title='' size='small' onClick={() => onEdit(filter)}>
//                   <EditIcon />
//                 </IconButtonTooltip>
//               </Tooltip>
//             }
//           />
//         </Box>
//       ))}
//     </Box>
//   )
// }

// export default FilterChips
