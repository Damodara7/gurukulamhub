// components/GameInfoChip.jsx
'use client'

import { Tooltip, Chip } from '@mui/material'
const CustomChipWithIcon = ({ icon, label, title, color = 'default', size = 'medium', mt = 0 , iconSx = {} , chipSx = {} }) => {
  return (
    <Tooltip title={title}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size={size}
        sx={{
          mt,
          maxWidth: 240,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          // alignItems: 'center',

          '& .MuiChip-icon': iconSx , // Apply icon styles
          ...chipSx, // Apply chip styles
        }}
      />
    </Tooltip>
  )
}

export default CustomChipWithIcon
