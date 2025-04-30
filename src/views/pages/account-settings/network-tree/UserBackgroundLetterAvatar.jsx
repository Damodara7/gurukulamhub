import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import { stringToColor } from '@/utils/stringToColor'
import { Tooltip } from '@mui/material'

function stringAvatar(name, isCurrentNode) {
  return {
    sx: {
      bgcolor: isCurrentNode ? stringToColor(name) : 'rgb(237, 237, 237)',
      color: isCurrentNode ? 'white' : 'black',
      '&:hover': {
        bgcolor: isCurrentNode ? stringToColor(name) : stringToColor(name),
        color: 'white',
        cursor: isCurrentNode ? 'arrow' : 'pointer'
      }
    },
    children: `${name?.split(' ')[0][0]}${name?.split(' ')[1][0]}`
  }
}

export default function UserBackgroundLetterAvatar({ name, isCurrentNode = false, onClick, style }) {
  return <Avatar {...stringAvatar(name, isCurrentNode)} onClick={onClick} style={style} />
}
