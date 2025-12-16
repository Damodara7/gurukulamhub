'use client'

import './AdvListTable.css'

/********** Standard imports.*********************/
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  TablePagination,
  Divider,
  IconButton,
  Chip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  InputAdornment,
  Box,
  Container,
  Stack
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { styled, alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
/********************************************/
import { toast } from 'react-toastify'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

// Third-party Imports
import { format, addDays } from 'date-fns'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import TableFilters from './TableFilters'
import AddAdvDrawer from './AddAdvDrawer'
import OptionMenu from '@core/components/option-menu'
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
// import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import VideoAd from '../VideoAd/VideoAd'
import Loading from '@/components/Loading'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Custom global filter that searches by userName and company
const globalNameFilter = (row, columnId, value, addMeta) => {
  const userName = (row.original.userName || '').toString().toLowerCase()
  const company = (row.original.company || '').toString().toLowerCase()
  const searchValue = (value || '').toString().toLowerCase().trim()

  // If no search value, show all rows
  if (!searchValue) return true

  // Use fuzzy matching on userName and company fields
  const userNameRank = rankItem(userName, searchValue)
  const companyRank = rankItem(company, searchValue)

  // Pass if either userName or company matches
  const passed = userNameRank.passed || companyRank.passed

  if (addMeta) {
    addMeta({
      itemRank: passed ? userNameRank : companyRank
    })
  }

  return passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <TextField
      {...props}
      value={value}
      onChange={e => setValue(e.target.value)}
      size='small'
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <i className='ri-search-line' style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }} />
          </InputAdornment>
        )
      }}
    />
  )
}

// Vars
const userRoleObj = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

const ImageComponent = ({ imageUrl, onClick }) => (
  <Box
    onClick={onClick}
    role='button'
    tabIndex={0}
    sx={{
      width: '100%',
      maxWidth: { xs: 180, sm: 220 },
      borderRadius: 1.5,
      overflow: 'hidden',
      cursor: 'pointer',
      border: theme => `1px solid ${alpha(theme.palette.divider, 0.4)}`,
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme => `0 6px 16px ${alpha(theme.palette.primary.main, 0.25)}`
      },
      '&:focus-visible': {
        outline: theme => `2px solid ${alpha(theme.palette.primary.main, 0.55)}`,
        outlineOffset: 2
      }
    }}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick?.(event)
      }
    }}
  >
    <Box
      component='img'
      src={imageUrl}
      alt='Advertisement'
      sx={{
        display: 'block',
        width: '100%',
        height: 'auto',
        maxHeight: { xs: 80, sm: 100 },
        objectFit: 'cover'
      }}
    />
  </Box>
)

const ImagePopup = ({ imageUrl, mediaType }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      {mediaType === 'image' ? (
        <ImageComponent imageUrl={imageUrl} onClick={handleClickOpen} />
      ) : (
        <Button
          onClick={handleClickOpen}
          variant='outlined'
          size='small'
          startIcon={<i className='ri-play-circle-line' />}
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            textTransform: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: 'center',
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.secondary.main,
                0.1
              )} 100%)`
            }
          }}
        >
          View Video
        </Button>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={isMobile ? 'sm' : isTablet ? 'md' : mediaType === 'video' ? false : 'xl'}
        fullWidth={mediaType === 'video' && !isMobile && !isTablet}
        PaperProps={{
          sx: {
            borderRadius: { xs: '12px', sm: '16px' },
            boxShadow: theme =>
              `0 20px 60px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.5 : 0.3)}`,
            bgcolor: 'background.paper',
            maxWidth:
              mediaType === 'video'
                ? { xs: '95vw', sm: '90vw', md: '95vw', lg: '95vw', xl: '95vw' }
                : { xs: '95vw', sm: '90vw', md: '85vw', lg: '1200px' },
            width: mediaType === 'video' && !isMobile && !isTablet ? '95vw' : 'auto',
            maxHeight: { xs: '90vh', sm: '85vh', md: '90vh', lg: '95vh' },
            height: mediaType === 'video' && !isMobile && !isTablet ? '95vh' : 'auto',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, sm: 2 }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i
              className={mediaType === 'video' ? 'ri-video-line' : 'ri-image-line'}
              style={{ fontSize: isMobile ? '20px' : '24px' }}
            />
            <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }, color: 'white' }}>
              {mediaType === 'video' ? 'Video Preview' : 'Image Preview'}
            </Typography>
          </div>
          <IconButton
            onClick={handleClose}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <i className='ri-close-line' style={{ fontSize: isMobile ? '20px' : '24px' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            padding: mediaType === 'video' ? { xs: 2, sm: 2, md: 1, lg: 1 } : { xs: 2, sm: 3, md: 4, lg: 5 },
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight:
              mediaType === 'video'
                ? { xs: 'auto', sm: '300px', md: '300px', lg: '70vh' }
                : { xs: 'auto', sm: '400px', md: '500px', lg: '600px' },
            maxHeight: mediaType === 'video' ? { xs: '90vh', sm: '85vh', md: '90vh' } : 'none',
            p: mediaType === 'video' ? { xs: 2, sm: 2, md: 0.5, lg: 0.5 } : undefined
          }}
        >
          <DialogContentText
            sx={{
              m: 0,
              width: '100%',
              height: mediaType === 'video' ? { xs: 'auto', md: '100%', lg: '100%' } : 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {mediaType === 'video' ? (
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 'auto', md: '100%', lg: '100%' },
                  maxHeight: { xs: '70vh', sm: '75vh', md: '85vh', lg: '85vh' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: 'inherit',
                    '& iframe, & video': {
                      width: '100% !important',
                      height: { xs: 'auto', md: '100% !important', lg: '100% !important' },
                      minHeight: { xs: '300px', sm: '400px', md: '500px', lg: '600px' },
                      maxHeight: { xs: '70vh', sm: '75vh', md: '85vh', lg: '85vh' }
                    }
                  }}
                >
                  <VideoAd url={imageUrl} width='100%' height='100%' showPause autoPlay={false} />
                </Box>
              </Box>
            ) : (
              <Box
                component='img'
                src={imageUrl}
                alt='Enlarged Image'
                sx={{
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '100%', md: '900px', lg: '1100px' },
                  height: 'auto',
                  maxHeight: { xs: '70vh', sm: '75vh', md: '80vh' },
                  objectFit: 'contain',
                  borderRadius: { xs: 1, sm: 1.5, md: 2 },
                  boxShadow: theme =>
                    `0 4px 12px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`
                }}
              />
            )}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  )
}

const AdvListTable = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // States
  const [addAdvtOpen, setAddAdvtOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState({ fetchAds: false, deleteAds: false })
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [advtEditOrAddInitialData, setAdvtEditOrAddInitialData] = useState(null)
  const [id, setId] = useState()
  const [mode, setMode] = useState('add')
  const [currentAdvertisement, setCurrentAdvertisement] = useState(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  const getData = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetchAds: true }))
    const result = await RestApi.get(ApiUrls.v0.ADMIN_GET_ADVERTISEMENT)

    if (result?.status === 'success') {
      console.log('Advts Fetched result', result)
      setLoading(prev => ({ ...prev, fetchAds: false }))
      console.log('Advts Fetched result', result.result)
      setData(result.result)
    } else {
      toast.error('Error Loading Advertisements:' + result.message)
      setLoading(prev => ({ ...prev, fetchAds: false }))
    }
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  const handleDelete = async () => {
    if (currentAdvertisement) {
      try {
        console.log('Deleting the advt.')
        const result = await RestApi.del(ApiUrls.v0.ADMIN_DEL_ADVERTISEMENT + '?id=' + currentAdvertisement._id)
        setLoading(prev => ({ ...prev, deleteAds: true }))
        if (result.status === 'success') {
          console.log('Delete  result', result.result.result)
          toast.success(`Advertisement deleted: ${currentAdvertisement.userName || currentAdvertisement.company}`)
          setData(result.result.result)
          setLoading(prev => ({ ...prev, deleteAds: false }))
        } else {
          toast.error('Error deleting advertisement: ' + result.message)
          setLoading(prev => ({ ...prev, deleteAds: false }))
        }
      } catch (error) {
        console.error('An error occurred while deleting the advertisement:', error)
        toast.error(`Error deleting advertisement: ${error?.message}`)
        setLoading(prev => ({ ...prev, deleteAds: false }))
        throw new Error(error)
      }
    }
    setConfirmationDialogOpen(false)
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
            sx={{
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.secondary.main
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
            sx={{
              color: theme.palette.primary.main,
              '&.Mui-checked': {
                color: theme.palette.secondary.main
              }
            }}
          />
        )
      },
      columnHelper.accessor('userName', {
        header: 'User / Company',
        cell: ({ row }) => (
          <div className='flex items-center gap-3' style={{ padding: '8px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              {row.original.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className='flex flex-col gap-1'>
              <Typography className='font-semibold' sx={{ fontSize: '15px', color: 'text.primary' }}>
                {row.original.userName}
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '13px', color: 'primary.main', fontWeight: 500 }}>
                {row.original.company}
              </Typography>
              <Typography
                variant='body2'
                sx={{ fontSize: '12px', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <i className='ri-mail-line' style={{ fontSize: '14px' }} />
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),
      // columnHelper.accessor('_id', {
      //   header: 'Id',
      //   cell: ({ row }) => <Typography>{row.original._id}</Typography>
      // }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        cell: ({ row }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                theme.palette.secondary.main,
                0.1
              )} 100%)`,
              borderRadius: '8px',
              width: 'fit-content'
            }}
          >
            <i className='ri-calendar-event-line' style={{ fontSize: '18px', color: theme.palette.primary.main }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary' }}>
              {format(row.original.startDate, 'MMM dd, yyyy')}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('endDate', {
        header: 'End Date',
        cell: ({ row }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 100%)`,
              borderRadius: '8px',
              width: 'fit-content'
            }}
          >
            <i className='ri-calendar-check-line' style={{ fontSize: '18px', color: theme.palette.secondary.main }} />
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.primary' }}>
              {format(row.original.endDate, 'MMM dd, yyyy')}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('imageUrl', {
        header: () => <div style={{ textAlign: 'center' }}>Media Preview</div>,
        cell: ({ row }) => (
          <div className='flex flex-col items-center gap-3' style={{ padding: '8px 0' }}>
            {row.original?.mediaType === 'video' ? (
              <Box
                className='media-preview-container'
                sx={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: theme => `2px solid ${theme.palette.divider}`,
                  boxShadow: theme =>
                    `0 4px 6px -1px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
                  width: '200px'
                }}
              >
                <VideoAd
                  url={row.original?.imageUrl}
                  width='200px'
                  height='80px'
                  showPause={false}
                  autoPlay={false}
                ></VideoAd>
              </Box>
            ) : (
              <Box
                className='media-preview-container'
                sx={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: theme => `2px solid ${theme.palette.divider}`,
                  boxShadow: theme =>
                    `0 4px 6px -1px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`
                }}
              />
            )}
            <ImagePopup imageUrl={row.original.imageUrl} mediaType={row.original.mediaType} />
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const isDark = theme.palette.mode === 'dark'
          const statusConfig = {
            active: {
              color: isDark ? '#4ade80' : '#10b981',
              bg: isDark ? alpha('#10b981', 0.2) : '#d1fae5',
              icon: 'ri-checkbox-circle-line',
              label: 'Active'
            },
            pending: {
              color: isDark ? '#fbbf24' : '#f59e0b',
              bg: isDark ? alpha('#f59e0b', 0.2) : '#fef3c7',
              icon: 'ri-time-line',
              label: 'Pending'
            },
            inactive: {
              color: isDark ? '#9ca3af' : '#6b7280',
              bg: isDark ? alpha('#6b7280', 0.2) : '#f3f4f6',
              icon: 'ri-pause-circle-line',
              label: 'Inactive'
            }
          }
          const config = statusConfig[row.original.status] || statusConfig.inactive

          return (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                bgcolor: config.bg,
                borderRadius: '20px',
                border: `2px solid ${alpha(config.color, 0.3)}`
              }}
            >
              <i className={config.icon} style={{ fontSize: '16px', color: config.color }} />
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: config.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {config.label}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButtonTooltip
              title='Edit'
              onClick={e => {
                setAdvtEditOrAddInitialData(row.original)
                setMode('edit')
                setAddAdvtOpen(!addAdvtOpen)
              }}
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                  theme.palette.secondary.main,
                  0.1
                )} 100%)`,
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className='ri-edit-box-line text-[20px]' style={{ color: theme.palette.primary.main }} />
            </IconButtonTooltip>
            <IconButtonTooltip
              title='Delete'
              onClick={e => {
                e.preventDefault()
                setCurrentAdvertisement(row.original)
                setConfirmationDialogOpen(true)
              }}
              sx={{
                bgcolor: theme => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: theme => alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.3 : 0.15)
                }
              }}
            >
              <i className='ri-delete-bin-7-line text-[20px]' style={{ color: theme.palette.error.main }} />
            </IconButtonTooltip>
            <OptionMenu
              iconClassName='text-[22px]'
              iconButtonProps={{
                sx: {
                  bgcolor: theme => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.1 : 0.05),
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }
              }}
              options={[
                {
                  text: 'Duplicate',
                  icon: 'ri-file-copy-line text-[20px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {
                      setAdvtEditOrAddInitialData(row.original)
                      setMode('add')
                      setAddAdvtOpen(!addAdvtOpen)
                    }
                  }
                },
                {
                  text: 'Hard Delete',
                  icon: 'ri-delete-bin-2-line text-[20px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {}
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
      globalNameFilter: globalNameFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: globalNameFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  if (loading.fetchAds) {
    return <Loading />
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backdropFilter: 'blur(16px)',
          bgcolor: theme => alpha(theme.palette.background.paper, 0.78),
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center' }}>
            <Stack
              direction='row'
              spacing={{ xs: 1.5, sm: 2 }}
              justifyContent='center'
              alignItems='center'
              sx={{ mb: { xs: 1.75, sm: 2 } }}
            >
              <Box
                sx={{
                  width: { xs: 46, sm: 54 },
                  height: { xs: 46, sm: 54 },
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.28)}`
                }}
              >
                <i
                  className='ri-megaphone-line'
                  style={{ fontSize: 'clamp(22px, 6vw, 28px)', color: '#fff', lineHeight: 1 }}
                />
              </Box>
              <Stack spacing={0.5} alignItems='flex-start' sx={{ textAlign: 'left' }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.018em'
                  }}
                >
                  Advertisement Management
                </Typography>
              </Stack>
            </Stack>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.8,
                maxWidth: { xs: '100%', sm: '620px' },
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Manage and monitor all advertisements across your platform
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Card
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            borderRadius: '16px',
            boxShadow: theme =>
              `0 8px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.08)}`,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme => theme.shadows[6]
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 2.5, sm: 3 },
                justifyContent: 'space-between'
              }}
            >
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search advertisements...'
                fullWidth
                sx={{
                  maxWidth: { sm: 400 },
                  '& .MuiInputBase-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button
                variant='contained'
                component='label'
                onClick={() => {
                  setAddAdvtOpen(!addAdvtOpen)
                  setMode('add')
                }}
                startIcon={<i className='ri-add-circle-line' />}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  px: { xs: 2.5, sm: 3.5 },
                  py: { xs: 1.2, sm: 1.25 }
                }}
              >
                Add New Advertisement
              </Button>
            </Box>
          </CardContent>

          <Divider />

          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} advertisement{data?.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <i className='ri-inbox-line' style={{ fontSize: 48, opacity: 0.5 }} />
                <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
                  No advertisements found
                </Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                  Create your first advertisement to get started
                </Typography>
              </Box>
            ) : isMobile ? (
              <Box
                sx={{
                  maxHeight: '65vh',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: 8
                  }
                }}
              >
                <Stack spacing={2}>
                  {table.getFilteredRowModel().rows.map(row => {
                    const advertisement = row.original
                    const isDark = theme.palette.mode === 'dark'
                    const statusConfig = {
                      active: {
                        color: isDark ? '#4ade80' : '#10b981',
                        bg: isDark ? alpha('#10b981', 0.2) : '#d1fae5',
                        icon: 'ri-checkbox-circle-line',
                        label: 'Active'
                      },
                      pending: {
                        color: isDark ? '#fbbf24' : '#f59e0b',
                        bg: isDark ? alpha('#f59e0b', 0.2) : '#fef3c7',
                        icon: 'ri-time-line',
                        label: 'Pending'
                      },
                      inactive: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        bg: isDark ? alpha('#6b7280', 0.2) : '#f3f4f6',
                        icon: 'ri-pause-circle-line',
                        label: 'Inactive'
                      }
                    }
                    const config = statusConfig[advertisement.status] || statusConfig.inactive

                    return (
                      <Box
                        key={row.id}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                          boxShadow: theme =>
                            `0 12px 30px ${alpha(
                              theme.palette.common.black,
                              theme.palette.mode === 'dark' ? 0.3 : 0.08
                            )}`,
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          bgcolor: 'background.paper',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: theme =>
                              `0 16px 40px ${alpha(
                                theme.palette.common.black,
                                theme.palette.mode === 'dark' ? 0.4 : 0.12
                              )}`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Stack direction='row' spacing={2} alignItems='flex-start'>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '12px',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 'bold',
                              flexShrink: 0
                            }}
                          >
                            {advertisement.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant='subtitle1'
                              sx={{
                                fontWeight: 700,
                                fontSize: '1rem',
                                wordBreak: 'break-word',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}
                            >
                              {advertisement.userName}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{ color: theme.palette.primary.main, fontWeight: 500, mt: 0.5 }}
                            >
                              {advertisement.company}
                            </Typography>
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                            >
                              <i className='ri-mail-line' style={{ fontSize: '14px' }} />
                              {advertisement.email}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<i className={config.icon} style={{ fontSize: '14px' }} />}
                            label={config.label}
                            sx={{
                              bgcolor: config.bg,
                              color: config.color,
                              border: `1px solid ${alpha(config.color, 0.3)}`,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '24px',
                              flexShrink: 0
                            }}
                            size='small'
                          />
                        </Stack>

                        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              borderRadius: 1.5,
                              background: `linear-gradient(135deg, ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <i
                              className='ri-calendar-event-line'
                              style={{ fontSize: '16px', color: theme.palette.primary.main }}
                            />
                            <Typography variant='caption' sx={{ fontWeight: 500 }}>
                              {format(advertisement.startDate, 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              borderRadius: 1.5,
                              background: `linear-gradient(135deg, ${alpha(
                                theme.palette.secondary.main,
                                0.1
                              )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <i
                              className='ri-calendar-check-line'
                              style={{ fontSize: '16px', color: theme.palette.secondary.main }}
                            />
                            <Typography variant='caption' sx={{ fontWeight: 500 }}>
                              {format(advertisement.endDate, 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ mt: 1 }}>
                          <ImagePopup imageUrl={advertisement.imageUrl} mediaType={advertisement.mediaType} />
                        </Box>

                        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant='outlined'
                            color='primary'
                            size='small'
                            onClick={e => {
                              setAdvtEditOrAddInitialData(advertisement)
                              setMode('edit')
                              setAddAdvtOpen(!addAdvtOpen)
                            }}
                            sx={{
                              flex: 1,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant='contained'
                            component='label'
                            size='small'
                            onClick={e => {
                              e.preventDefault()
                              setCurrentAdvertisement(advertisement)
                              setConfirmationDialogOpen(true)
                            }}
                            sx={{
                              flex: 1,
                              textTransform: 'none',
                              fontWeight: 600,
                              color: 'white'
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  <table className={tableStyles.table}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.palette.background.paper }}>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className='enhanced-table-header'
                              style={{
                                background:
                                  theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.8)
                                    : alpha(theme.palette.background.paper, 0.5),
                                color: theme.palette.text.primary,
                                borderBottom: `2px solid ${theme.palette.divider}`
                              }}
                            >
                              {header.isPlaceholder ? null : (
                                <>
                                  <div
                                    className={classnames({
                                      'flex items-center': header.column.getIsSorted(),
                                      'cursor-pointer select-none': header.column.getCanSort()
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                      asc: <i className='ri-arrow-up-s-line text-xl' />,
                                      desc: <i className='ri-arrow-down-s-line text-xl' />
                                    }[header.column.getIsSorted()] ?? null}
                                  </div>
                                </>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map(row => (
                        <tr
                          key={row.id}
                          className={classnames('enhanced-table-row', { selected: row.getIsSelected() })}
                          style={{
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            ...(row.getIsSelected() && {
                              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                                theme.palette.secondary.main,
                                0.1
                              )} 100%)`,
                              borderLeft: `4px solid ${theme.palette.primary.main}`
                            })
                          }}
                          onMouseEnter={e => {
                            if (!row.getIsSelected()) {
                              e.currentTarget.style.background = `linear-gradient(90deg, ${alpha(
                                theme.palette.primary.main,
                                theme.palette.mode === 'dark' ? 0.15 : 0.08
                              )} 0%, ${alpha(
                                theme.palette.secondary.main,
                                theme.palette.mode === 'dark' ? 0.15 : 0.08
                              )} 100%)`
                              e.currentTarget.style.boxShadow = `0 4px 12px ${alpha(
                                theme.palette.primary.main,
                                theme.palette.mode === 'dark' ? 0.2 : 0.08
                              )}`
                            }
                          }}
                          onMouseLeave={e => {
                            if (!row.getIsSelected()) {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.boxShadow = 'none'
                            }
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className='enhanced-table-cell'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            )}
          </Box>
          {!isMobile && table.getFilteredRowModel().rows.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component='div'
              className='border-bs'
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' }
              }}
              onPageChange={(_, page) => {
                table.setPageIndex(page)
              }}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
              sx={{
                borderTop: `2px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                '.MuiTablePagination-toolbar': {
                  px: { xs: 2, sm: 3 },
                  py: 2
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                },
                '& .MuiTablePagination-select': {
                  borderRadius: '6px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1)
                  }
                },
                '& .MuiTablePagination-actions button': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1)
                  }
                }
              }}
            />
          )}
        </Card>
        {addAdvtOpen && (
          <AddAdvDrawer
            open={addAdvtOpen}
            mode={mode}
            handleClose={() => {
              setAddAdvtOpen(!addAdvtOpen)
              setAdvtEditOrAddInitialData(null)
            }}
            data={advtEditOrAddInitialData}
            onRefresh={() => getData()}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          type='delete-advertisement'
          onConfirm={handleDelete}
        />
      </Box>
    </Box>
  )
}

export default AdvListTable
