'use client'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

const LayoutContent = ({ children }) => {
  // Hooks
  const { settings } = useSettings()

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  return (
    <StyledMain
      isContentCompact={contentCompact}
      className={classnames(horizontalLayoutClasses.content, 'flex-auto', {
        [`${horizontalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [horizontalLayoutClasses.contentWide]: contentWide
      })}
      style={{ 
        padding: themeConfig.layoutPadding,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </StyledMain>
  )
}

export default LayoutContent





// 'use client'

// // Third-party Imports
// import classnames from 'classnames'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// // Hook Imports
// import { useSettings } from '@core/hooks/useSettings'

// // Util Imports
// import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

// // Styled Component Imports
// import StyledMain from '@layouts/styles/shared/StyledMain'

// const LayoutContent = ({ children }) => {
//   // Hooks
//   const { settings } = useSettings()

//   // Vars
//   const contentCompact = settings.contentWidth === 'compact'
//   const contentWide = settings.contentWidth === 'wide'

//   return (
//     <StyledMain
//       isContentCompact={contentCompact}
//       className={classnames(horizontalLayoutClasses.content, 'flex-auto', {
//         [`${horizontalLayoutClasses.contentCompact} is-full`]: contentCompact,
//         [horizontalLayoutClasses.contentWide]: contentWide
//       })}
//       style={{ padding: themeConfig.layoutPadding }}
//     >
//       {children}
//     </StyledMain>
//   )
// }

// export default LayoutContent
