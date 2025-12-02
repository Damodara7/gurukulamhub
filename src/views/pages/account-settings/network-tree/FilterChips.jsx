import React, { useState } from 'react'
import { Chip, Box, IconButton, Tooltip, Menu, MenuItem, useTheme, alpha, useMediaQuery } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const FilterChips = ({ filters, onEdit, onRemove, onClearAll }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    <Box
      display='flex'
      alignItems='center'
      flexWrap='wrap'
      sx={{ gap: { xs: 0.5, sm: 1 }, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}
    >
      {filters.length > 0 && (
        <Box display='flex' alignItems='center'>
          <Chip
            size='small'
            label='Clear All'
            color='secondary'
            onClick={onClearAll}
            sx={{
              marginRight: { xs: 0, sm: 1 },
              mb: { xs: 1, sm: 0 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              ...(isDarkMode && {
                bgcolor: alpha(theme.palette.secondary.main, 0.2),
                color: theme.palette.common.white,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.3)
                }
              })
            }}
          />
        </Box>
      )}
      {filters.map((filter, index) => (
        <Box key={index} sx={{ margin: { xs: 0.25, sm: 0.5 }, position: 'relative' }}>
          <Chip
            label={filter.label}
            size='small'
            deleteIcon={<MoreVertIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            onDelete={e => handleClick(e, filter)}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              ...(isDarkMode && {
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                color: theme.palette.common.white,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.8)
                }
              })
            }}
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
