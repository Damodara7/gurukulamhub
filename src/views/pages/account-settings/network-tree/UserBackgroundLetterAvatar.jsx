import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import { stringToColor } from '@/utils/stringToColor'
import { Tooltip, useTheme, alpha } from '@mui/material'

function stringAvatar(name, isCurrentNode, isDarkMode) {
  return {
    sx: {
      bgcolor: isCurrentNode ? stringToColor(name) : isDarkMode ? alpha('#ffffff', 0.1) : 'rgb(237, 237, 237)',
      color: isCurrentNode ? 'white' : isDarkMode ? '#ffffff' : 'black',
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: isCurrentNode ? stringToColor(name) : stringToColor(name),
        color: 'white',
        cursor: isCurrentNode ? 'arrow' : 'pointer',
        transform: isCurrentNode ? 'none' : 'scale(1.1)'
      }
    },
    children: `${name?.split(' ')[0]?.[0] || ''}${name?.split(' ')[1]?.[0] || ''}`
  }
}

export default function UserBackgroundLetterAvatar({ name, isCurrentNode = false, onClick, style }) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  
  return <Avatar {...stringAvatar(name, isCurrentNode, isDarkMode)} onClick={onClick} style={style} />
}
