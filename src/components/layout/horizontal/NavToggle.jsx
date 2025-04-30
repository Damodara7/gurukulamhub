'use client'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav } = useVerticalNav()
  const { isBreakpointReached } = useHorizontalNav()

  // Toggle Vertical Nav
  const handleClick = () => {
    toggleVerticalNav()
  }

  return (
    <>
      {/* <i className='ri-menu-line' onClick={handleClick} /> */}
      {/* Comment following code and uncomment this code in order to toggle menu on desktop screens as well */}
      {isBreakpointReached && <IconButtonTooltip title='Toggle' onClick={handleClick}>
        <i className='ri-menu-line cursor-pointer'  />
        </IconButtonTooltip>}
    </>
  )
}

export default NavToggle
