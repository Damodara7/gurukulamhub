import { Alert, AlertTitle } from '@mui/material'

const AlertMessage = ({ severity = 'info', title, description, showIcon = true }) => {
  return (
    <Alert severity={severity} sx={{ my: 2 }} icon={showIcon ? undefined : false}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <span>{description}</span>}
    </Alert>
  )
}

export default AlertMessage
