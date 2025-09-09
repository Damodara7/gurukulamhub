// Context Imports
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { GameProvider } from '@/contexts/GameContext'
import { GroupProvider } from '@/contexts/GroupContext'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Styled Component Imports
import AppReactToastify from '@/libs/styles/AppReactToastify'

// Util Imports
import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import { auth } from '@/libs/auth'

const Providers = async props => {
  const session = await auth()
  // Props
  const { children, direction } = props

  // Vars
  const mode = getMode()
  //console.log("Mode is:",mode)
  const settingsCookie = getSettingsFromCookie()
  const demoName = getDemoName()
  // console.log("demoName is:",demoName)

  const systemMode = getSystemMode()

  return (
    <NextAuthProvider session={session} basePath={process.env.NEXTAUTH_BASEPATH}>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode} demoName={demoName}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            <GameProvider>
              <GroupProvider>{children}</GroupProvider>
            </GameProvider>
            <AppReactToastify position={themeConfig.toastPosition} hideProgressBar rtl={direction === 'rtl'} />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </NextAuthProvider>
  )
}

export default Providers
