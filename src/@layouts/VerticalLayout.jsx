// Third-party Imports
import classnames from 'classnames'

// Component Imports
import LayoutContent from './components/vertical/LayoutContent'

// Util Imports
import { verticalLayoutClasses } from './utils/layoutClasses'

const VerticalLayout = props => {
  // Props
  const { navbar, footer, navigation, children } = props

  return (
    <div className={classnames(verticalLayoutClasses.root, 'flex flex-auto')} style={{ height: '100%', minHeight: 0 }}>
      {navigation || null}
      <div 
        className={classnames(verticalLayoutClasses.contentWrapper, 'flex flex-col min-is-0 is-full')}
        style={{ height: '100%', minHeight: 0, flex: '1 1 auto' }}
      >
        {navbar || null}
        {/* Content */}
        <LayoutContent>{children}</LayoutContent>
        {footer || null}
      </div>
    </div>
  )
}

export default VerticalLayout




// // Third-party Imports
// import classnames from 'classnames'

// // Component Imports
// import LayoutContent from './components/vertical/LayoutContent'

// // Util Imports
// import { verticalLayoutClasses } from './utils/layoutClasses'

// const VerticalLayout = props => {
//   // Props
//   const { navbar, footer, navigation, children } = props

//   return (
//     <div className={classnames(verticalLayoutClasses.root, 'flex flex-auto')}>
//       {navigation || null}
//       <div className={classnames(verticalLayoutClasses.contentWrapper, 'flex flex-col min-is-0 is-full')}>
//         {navbar || null}
//         {/* Content */}
//         <LayoutContent>{children}</LayoutContent>
//         {footer || null}
//       </div>
//     </div>
//   )
// }

// export default VerticalLayout
