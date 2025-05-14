// components/GameInfoChip.jsx
'use client'

import { Tooltip, Chip } from '@mui/material'

const CustomChipWithIcon = ({ icon, label, title, color = 'default', size = 'medium', mt = 0 }) => {
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
          alignItems: 'center'
        }}
      />
    </Tooltip>
  )
}

export default CustomChipWithIcon
