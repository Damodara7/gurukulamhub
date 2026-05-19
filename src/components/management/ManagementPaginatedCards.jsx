'use client'

import React, { useRef, useEffect } from 'react'
import { Box, CircularProgress, Pagination, Stack, useMediaQuery, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useManagementCardPagination } from '@/hooks/useManagementCardPagination'
import {
  MANAGEMENT_CARD_GRID_PAGE_SIZE,
  MANAGEMENT_NOTIFICATION_LIST_PAGE_SIZE
} from '@/constants/managementCardPagination'

/**
 * Paginates management card/list data in document flow (quiz-style: grid, then pagination below).
 * @param {'grid' | 'list'} variant - grid for audience/group cards; list for full-width admin notifications
 */
export default function ManagementPaginatedCards({
  items,
  pageSize,
  variant = 'grid',
  renderContent
}) {
  const theme = useTheme()
  const isList = variant === 'list'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const paginationRef = useRef(null)
  const paginationSize = isMobile ? 'small' : isList ? 'medium' : 'large'
  const resolvedPageSize =
    pageSize ?? (variant === 'list' ? MANAGEMENT_NOTIFICATION_LIST_PAGE_SIZE : MANAGEMENT_CARD_GRID_PAGE_SIZE)

  const { paginatedItems, page, totalPages, pageChanging, handlePageChange, showPagination } =
    useManagementCardPagination(items, resolvedPageSize)

  useEffect(() => {
    if (pageChanging && paginationRef.current) {
      paginationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [page, pageChanging])

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          ...(isList && {
            width: '100%',
            maxWidth: { xs: '100%', sm: 720, md: 960 },
            mx: 'auto',
            px: { xs: 0, sm: 0 }
          }),
          ...(pageChanging && {
            minHeight: isList ? { xs: 160, sm: 200 } : { xs: 280, sm: 360 }
          })
        }}
      >
        {pageChanging && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(
                theme.palette.background.default,
                theme.palette.mode === 'dark' ? 0.75 : 0.65
              ),
              borderRadius: 2
            }}
          >
            <CircularProgress size={48} thickness={4} color='primary' />
          </Box>
        )}
        {renderContent(paginatedItems)}
      </Box>

      {showPagination ? (
        <Stack
          ref={paginationRef}
          alignItems='center'
          sx={{
            width: '100%',
            pt: isList ? 4 : 4,
            pb: isList ? 3 : 2,
            mt: 0,
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Pagination
            color='primary'
            count={totalPages}
            page={page}
            disabled={pageChanging}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            size={paginationSize}
            siblingCount={0}
            boundaryCount={1}
            sx={{
              '& .MuiPagination-ul': {
                flexWrap: 'wrap',
                justifyContent: 'center',
                rowGap: 0.5
              }
            }}
          />
        </Stack>
      ) : null}
    </Box>
  )
}
