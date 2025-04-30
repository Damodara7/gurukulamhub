// MUI Imports
import React from 'react'
import { Box } from '@mui/material'
import Button from '@mui/material/Button'

// Component Imports
// import HomePageHeader from '@views/home/HomePageHeader'
import Providers from '@components/Providers'
import ScrollToTop from '@core/components/scroll-to-top'
import Customizer from '@core/components/customizer'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSkin, getSystemMode } from '@core/utils/serverHelpers'
import { i18n } from '@/configs/i18n'

const Layout = async ({ children, params }) => {
  // Fetch necessary data
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = getMode()
  const systemMode = getSystemMode()
  const skin = getSkin()

  return (
    <Providers direction={direction}>
      <Box>
        {/* Header Component */}
        {/* <HomePageHeader dictionary={dictionary} /> */}

        {/* Main content */}
        <Box sx={{ p: 2 }}>{children}</Box>

        {/* Scroll to Top Button */}
        <ScrollToTop className='mui-fixed'>
          <Button
            variant='contained'
            className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
          >
            <i className='ri-arrow-up-line' />
          </Button>
        </ScrollToTop>

        {/* Customizer */}
        <Customizer dir={direction} />
      </Box>
    </Providers>
  )
}

export default Layout
