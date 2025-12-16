// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

const StyledMain = styled.main`
  padding: ${themeConfig.layoutPadding}px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  ${({ isContentCompact }) =>
    isContentCompact &&
    `
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  `}
`

export default StyledMain




// // Third-party Imports
// import styled from '@emotion/styled'

// // Config Imports
// import themeConfig from '@configs/themeConfig'

// const StyledMain = styled.main`
//   padding: ${themeConfig.layoutPadding}px;
//   display: flex;
//   flex-direction: column;
//   min-height: 0;
//   ${({ isContentCompact }) =>
//     isContentCompact &&
//     `
//     margin-inline: auto;
//     max-inline-size: ${themeConfig.compactContentWidth}px;
//   `}
// `

// export default StyledMain
