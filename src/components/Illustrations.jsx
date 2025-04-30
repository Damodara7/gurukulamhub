'use client'

// MUI Components
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Styled Components
const MaskImg = styled('img')({
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const Illustrations = props => {
  // Props
  const { image1, image2, maskImg, mode } = props

  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'

  // Hook
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const maskBackground = useImageVariant(mode, lightImg, darkImg)

  function isImageObj(obj) {
    return obj && typeof obj === 'object' && 'src' in obj
  }

  if (!hidden) {
    return (
      <>
        {typeof image1 === 'undefined' || isImageObj(image1) ? (
          <img
            alt={image1?.alt || 'tree-1'}
            src={image1?.src || '/images/illustrations/objects/tree-1.png'}
            className={image1?.className || 'absolute inline-start-0 block-end-0'}
            width={image1?.width}
            height={image1?.height || 200}
          />
        ) : (
          image1
        )}
        {typeof maskImg === 'undefined' || isImageObj(maskImg) ? (
          <MaskImg
            alt={maskImg?.alt || 'mask'}
            src={maskImg?.src || maskBackground}
            className={maskImg?.className}
            width={maskImg?.width}
            height={maskImg?.height}
          />
        ) : (
          maskImg
        )}
        
      </>
    )
  } else {
    return null
  }
}

export default Illustrations
