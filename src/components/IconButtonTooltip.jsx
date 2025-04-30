import React from 'react'
import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'

function IconButtonTooltip( { title , onClick , children, tooltipProps, ...props}) {
  return (
   <>
   <Tooltip title={title} {...tooltipProps}>
    <IconButton {...props} onClick={onClick}>
      {children}
    </IconButton>
   </Tooltip>
   </>
  )
}

export default IconButtonTooltip