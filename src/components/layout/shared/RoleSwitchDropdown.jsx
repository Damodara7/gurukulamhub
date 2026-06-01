'use client'

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Fade,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useSettings } from '@core/hooks/useSettings'
import { useActiveRole } from '@/contexts/ActiveRoleContext'
import { getLocalizedUrl } from '@/utils/i18n'

const formatRoleLabel = role => {
  if (!role) return 'All Roles'
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

const RoleSwitchDropdown = () => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const router = useRouter()
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const { activeRole, setActiveRole } = useActiveRole()

  const userRoles = session?.user?.roles || []
  const hasMultipleRoles = userRoles.length > 1
  const displayRole = activeRole || (userRoles.length === 1 ? userRoles[0] : null)

  if (!userRoles.length) return null

  const handleToggle = () => {
    if (!hasMultipleRoles) return
    setOpen(prev => !prev)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleRoleSwitch = roleName => {
    setActiveRole(roleName)
    setOpen(false)
    router.push(getLocalizedUrl('/home', locale))
  }

  return (
    <>
      <Box
        ref={anchorRef}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          mr: 1
        }}
      >
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.8125rem' }}
        >
          Role:
        </Typography>
        {hasMultipleRoles ? (
          <Button
            variant='outlined'
            color='primary'
            size='small'
            onClick={handleToggle}
            endIcon={<i className='ri-arrow-down-s-line' />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 1.5,
              py: 0.75,
              minWidth: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {formatRoleLabel(displayRole)}
          </Button>
        ) : (
          <Chip
            label={formatRoleLabel(displayRole)}
            color='primary'
            variant='outlined'
            size='small'
            sx={{ fontWeight: 600, height: 32 }}
          />
        )}
      </Box>
      {hasMultipleRoles && (
        <Popper
          open={open}
          transition
          disablePortal
          placement='bottom-end'
          anchorEl={anchorRef.current}
          className='min-is-[180px] !mbs-2 z-[1]'
        >
          {({ TransitionProps, placement }) => (
            <Fade
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
              }}
            >
              <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      >
                        Switch Role
                      </Typography>
                    </Box>
                    <MenuItem
                      onClick={() => handleRoleSwitch(null)}
                      selected={activeRole === null}
                      sx={{ minHeight: 'auto', py: 1, gap: 1.5 }}
                    >
                      <i className={`ri-checkbox-circle-${activeRole === null ? 'fill' : 'line'} text-[18px]`} />
                      <Typography variant='body2'>All Roles</Typography>
                    </MenuItem>
                    {userRoles.map(role => (
                      <MenuItem
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        selected={activeRole === role}
                        sx={{ minHeight: 'auto', py: 1, gap: 1.5 }}
                      >
                        <i className={`ri-checkbox-circle-${activeRole === role ? 'fill' : 'line'} text-[18px]`} />
                        <Typography variant='body2'>{formatRoleLabel(role)}</Typography>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}
    </>
  )
}

export default RoleSwitchDropdown
