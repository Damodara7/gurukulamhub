'use client'

import React from 'react'
import { Box } from '@mui/material'
import { MANAGEMENT_CARD_GRID_SX } from '@/constants/managementCardGrid'

/**
 * Auto-responsive card grid: 1 column on mobile, more columns as width allows.
 */
export default function ManagementCardGrid({ children, sx }) {
  return <Box sx={{ ...MANAGEMENT_CARD_GRID_SX, ...sx }}>{children}</Box>
}
