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
import ActionCard from '@views/dashboards/myprogress/ActionCard'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CardStats from '@/components/card-statistics/CardStats'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import CenterBox from '@/components/CenterBox'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden max-bs-[488px]'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='max-bs-[550px]'  options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}


const actionsDef = [
  {
    url: '/apps/calendar',
    image: '/images/pages/trophy.png',
    title: 'My Rewards',
    stats: '123456',
    trendNumber: '1000',
    trend: "positive",
    chipText: "500 Referrals",
    chipColor: "primary"
  },
  {
    url: '/apps/calendar',
    icon: 'ri-book-marked-line',
    iconColor: 'blue',
    title: 'Learning',
    stats: '92304',
    trendNumber: '10',
    trend: "positive",
    chipText: "50 Courses",
    chipColor: "primary"
  },
  {
    url: '/apps/calendar',
    icon: 'ri-mail-send-line',
    iconColor: 'red',
    title: 'Invitations',
    stats: '92304',
    trendNumber: '10',
    trend: "positive",
    chipText: "50 Quizzes",
    chipColor: "primary"
  },
  {
    url: '/apps/calendar',
    image: '/images/schedule-calender.svg',
    iconColor: 'green',
    title: 'Event Calendar',
    stats: '3',
    trendNumber: '1',
    trend: "positive",
    chipText: "Ramayana Quiz1",
    chipColor: "success"
  },
  {
    url: '/apps/calendar',
    image: '/images/connections-people-2.svg',
    iconColor: 'pink',
    title: 'Connections',
    stats: '92304',
    trendNumber: '10',
    trend: "positive",
    chipText: "50 Quizzes",
    chipColor: "primary"
  },
  {
    url: '/apps/calendar',
    icon: 'ri-file-marked-fill',
    title: 'My Interests',
    iconColor: 'orange',
    stats: '3',
    trendNumber: '1',
    trend: "positive",
    chipText: "Ramayana Quiz1",
    chipColor: "success"
  },
  {
    url: '/apps/calendar',
    image: '/images/connections-people-2.svg',
    iconColor: 'pink',
    title: 'Connections',
    stats: '92304',
    trendNumber: '10',
    trend: "positive",
    chipText: "50 Quizzes",
    chipColor: "primary"
  },
  {
    url: '/apps/calendar',
    icon: 'ri-file-marked-fill',
    title: 'My Interests',
    iconColor: 'orange',
    stats: '3',
    trendNumber: '1',
    trend: "positive",
    chipText: "Ramayana Quiz1",
    chipColor: "success"
  }
]


const ActionCardGrid = ({ actions = actionsDef }) => {
  // States
  const [open, setOpen] = useState(true)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const { lang: locale } = useParams()
  var placement = 'bottom-end'

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [])


  return (
    <>
      {/* <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}> */}
      <div>
        {/* <div className='flex items-center justify-between plb-2 pli-4 is-full gap-0'>
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
                      <IconButtonTooltip title='' size='small' className='text-textPrimary'>
                        <i className='ri-add-line' />
                      </IconButtonTooltip>
                    </Tooltip>
                  </div>
                  <Divider /> */}


        <ScrollWrapper >
          <Grid  container gap={4}>
            {actions.map((action, index) => (
              <CenterBox key={index}>
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                key={index}
                onClick={handleClose}
                className='[&:not(:last-of-type):not(:nth-last-of-type(2))]:border-be odd:border-ie'
              >
                <Link
                  href={getLocalizedUrl(action.url, locale)}
                  className='flex items-center flex-col p-0 gap-3 bs-full hover:bg-actionHover'
                >

                  <div className='flex flex-col items-center text-center '>
                    {/* <CardStats
                      icon={action.icon}
                      iconColor={action.iconColor}
                      stats={action.stats}
                      title={action.title}
                      trendNumber={action.trendNumber}
                      chipColor={action.chipColor}
                      chipText={action.chipText}
                    /> */}
                    <ActionCard
                      title={action.title}
                      icon={action?.icon}
                      iconColor={action?.iconColor}
                      image={action?.image}
                    >
                    </ActionCard>
                  </div>
                </Link>
              </Grid>
              </CenterBox>
            ))}
          </Grid>

          <br/>
          <br/>
        </ScrollWrapper>

      </div>

      {/* </Paper> */}
    </>
  )
}

export default ActionCardGrid
