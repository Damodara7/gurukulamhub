import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { useState } from 'react'

const QuestionTemplatesToolBar = ({
  data,
  direction = 'column',
  selectedTemplate,
  setSelectedTemplate,
  onClick,
  disabled = false
}) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const handleTemplateClick = template => {
    setSelectedTemplate(template)
    console.log(template)

    if (onClick) {
      onClick(template)
    }
  }

  // Set direction class dynamically
  const directionClass = direction === 'row' ? 'flex w4rem' : 'flex-column w4rem'

  // Define a shared style for disabled items
  const disabledStyle = disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '25px', margin: '10px 0px' }} className={directionClass}>
        <div
          className={`qb-toolbox__item ${selectedTemplate === 'single-choice' ? 'selected' : ''}`}
          style={disabledStyle} // Apply disabled styles
          onClick={() => handleTemplateClick('single-choice')}
        >
          <span className='qb-toolbox__item-container'>
            <span className='qb-toolbox__item-icon ri-radio-button-line' />
          </span>
          <span className='qb-toolbox__item-banner qb-item__banner'>
            <span className='qb-toolbox__item-icon ri-radio-button-line' />
            <span className='qb-toolbox__item-title'>Single Choice</span>
          </span>
        </div>
        <div
          className={`qb-toolbox__item ${selectedTemplate === 'multiple-choice' ? 'selected' : ''}`}
          style={disabledStyle}
          onClick={() => handleTemplateClick('multiple-choice')}
        >
          <span className='qb-toolbox__item-container'>
            <span className='qb-toolbox__item-icon ri-checkbox-line' />
          </span>
          <span className='qb-toolbox__item-banner qb-item__banner'>
            <span className='qb-toolbox__item-icon ri-checkbox-line' />
            <span className='qb-toolbox__item-title'>Multiple Choice</span>
          </span>
        </div>
        <div
          className={`qb-toolbox__item ${selectedTemplate === 'fill-in-blank' ? 'selected' : ''}`}
          style={disabledStyle}
          onClick={() => handleTemplateClick('fill-in-blank')}
        >
          <span className='qb-toolbox__item-container'>
            <span className='qb-toolbox__item-icon ri-input-field' />
          </span>
          <span className='qb-toolbox__item-banner qb-item__banner'>
            <i className='qb-toolbox__item-icon ri-input-field ' />
            <span className='qb-toolbox__item-title'>Fill in Blanks</span>
          </span>
        </div>
        <div
          className={`qb-toolbox__item ${selectedTemplate === 'true-false' ? 'selected' : ''}`}
          style={disabledStyle}
          onClick={() => handleTemplateClick('true-or-false')}
        >
          <span className='qb-toolbox__item-container'>
            <span className='qb-toolbox__item-icon ri-toggle-line' />
          </span>
          <span className='qb-toolbox__item-banner qb-item__banner'>
            <span className='qb-toolbox__item-icon ri-toggle-line' />
            <span className='qb-toolbox__item-title'>True or False</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default QuestionTemplatesToolBar
