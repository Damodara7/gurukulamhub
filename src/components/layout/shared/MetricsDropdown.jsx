'use client'

// React Imports
import { useCallback, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import IconButtonTooltip from '@/components/IconButtonTooltip'


// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CardStats from '@/components/card-statistics/CardStats'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden max-bs-[488px]'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='max-bs-[488px]' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const MetricsDropdown = ({ metrics }) => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { lang: locale } = useParams()

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [])

  return (
    <>
      <IconButtonTooltip title='Toggle' ref={anchorRef} onClick={handleToggle} className='!text-textPrimary'>
        <i className='ri-star-smile-line' />
      </IconButtonTooltip>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
            className: 'is-full !mbs-4 z-[1]',
            modifiers: [
              {
                name: 'preventOverflow',
                options: {
                  padding: themeConfig.layoutPadding
                }
              }
            ]
          }
          : { className: 'is-[380px] !mbs-4 z-[1]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <div>
                  <div className='flex items-center justify-between plb-2 pli-4 is-full gap-0'>
                    <Typography variant='h5' className='flex-auto'>
                      My Reward Points
                    </Typography>
                    <Tooltip
                      title='Add Metric'
                      placement={placement === 'bottom-end' ? 'left' : 'right'}
                      slotProps={{
                        popper: {
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              transformOrigin:
                                placement === 'bottom-end' ? 'right center !important' : 'right center !important'
                            }
                          }
                        }
                      }}
                    >
                      <IconButtonTooltip title='Add' size='small' className='text-textPrimary'>
                        <i className='ri-add-line' />
                      </IconButtonTooltip>
                    </Tooltip>
                  </div>
                  <Divider />
                  <ScrollWrapper hidden={hidden}>
                    <Grid container>
                      {metrics.map((metric, index) => (
                        <Grid
                          item
                          xs={6}
                          key={index}
                          onClick={handleClose}
                          classNames='[&:not(:last-of-type):not(:nth-last-of-type(2))]:border-be odd:border-ie'
                        >
                          <Link
                            href={getLocalizedUrl(metric.url, locale)}
                            className='flex items-center flex-col p-0 gap-3 bs-full hover:bg-actionHover'
                          >

                            <div className='flex flex-col items-center text-center'>
                              <CardStats
                                icon={metric.icon}
                                iconColor={metric.iconColor}
                                stats={metric.stats}
                                title={metric.title}
                                trendNumber={metric.trendNumber}
                                chipColor={metric.chipColor}
                                chipText={metric.chipText}
                              />
                            </div>
                          </Link>
                        </Grid>
                      ))}
                    </Grid>
                  </ScrollWrapper>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default MetricsDropdown
