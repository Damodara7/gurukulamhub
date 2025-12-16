// Third-party Imports
import classnames from 'classnames'

// Context Imports
import { HorizontalNavProvider } from '@menu/contexts/horizontalNavContext'

// Component Imports
import LayoutContent from './components/horizontal/LayoutContent'

// Util Imports
import { horizontalLayoutClasses } from './utils/layoutClasses'

const HorizontalLayout = props => {
  // Props
  const { header, footer, children } = props

  return (
    <div className={classnames(horizontalLayoutClasses.root, 'flex flex-auto')} style={{ height: '100%', minHeight: 0 }}>
      <HorizontalNavProvider>
        <div 
          className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col is-full')}
          style={{ height: '100%', minHeight: 0, flex: '1 1 auto' }}
        >
          {header || null}
          <LayoutContent>{children}</LayoutContent>
          {footer || null}
        </div>
      </HorizontalNavProvider>
    </div>
  )
}

export default HorizontalLayout





// // Third-party Imports
// import classnames from 'classnames'

// // Context Imports
// import { HorizontalNavProvider } from '@menu/contexts/horizontalNavContext'

// // Component Imports
// import LayoutContent from './components/horizontal/LayoutContent'

// // Util Imports
// import { horizontalLayoutClasses } from './utils/layoutClasses'

// const HorizontalLayout = props => {
//   // Props
//   const { header, footer, children } = props

//   return (
//     <div className={classnames(horizontalLayoutClasses.root, 'flex flex-auto')}>
//       <HorizontalNavProvider>
//         <div className={classnames(horizontalLayoutClasses.contentWrapper, 'flex flex-col is-full')}>
//           {header || null}
//           <LayoutContent>{children}</LayoutContent>
//           {footer || null}
//         </div>
//       </HorizontalNavProvider>
//     </div>
//   )
// }

// export default HorizontalLayout
