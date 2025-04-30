'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Tabs, Tab, Box, Grid } from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'
import { useState, useEffect } from 'react'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'

const GameTabs = ({ children }) => {
  const pathname = usePathname()
  console.log('pathname: ', pathname)

  // Extract pathname without the [lang] prefix
  const strippedPathname = pathname.replace(/^\/[a-zA-Z]{2}(\/|$)/, '/')
  console.log('strippedPathname: ', strippedPathname)
  const [value, setValue] = useState(strippedPathname || '/game')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <>
      <TabContext value={value}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className='w-full flex justify-center'>
              <CustomTabList
                onChange={handleChange}
                variant='scrollable'
                pill='true'
                scrollButtons='auto'
                allowScrollButtonsMobile
              >
                <Tab
                  value='/game'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <SportsEsportsIcon />
                      My Games
                    </div>
                  }
                  component={Link}
                  href='/game'
                />
                <Tab
                  value='/game/create'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <CreateOutlinedIcon />
                      Create
                    </div>
                  }
                  component={Link}
                  href='/game/create'
                />
              </CustomTabList>
            </div>
          </Grid>

          <Grid item xs={12}>
            <TabPanel value={value}>{children}</TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default GameTabs
