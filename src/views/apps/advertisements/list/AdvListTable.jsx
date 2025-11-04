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
  Container
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { styled, alpha, useTheme } from '@mui/material/styles'
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

const ImageComponent = ({ imageUrl, onClick }) => {
  return (
    <div>
      <img
        src={imageUrl}
        style={{ objectFit: 'cover', cursor: 'pointer', maxWidth: '250px', maxHeight: '40px' }}
        alt='Image'
        onClick={onClick}
      />
    </div>
  )
}

const ImagePopup = ({ imageUrl, mediaType }) => {
  const theme = useTheme()
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
        maxWidth='lg'
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
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
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={mediaType === 'video' ? 'ri-video-line' : 'ri-image-line'} style={{ fontSize: '24px' }} />
            {mediaType === 'video' ? 'Video Preview' : 'Image Preview'}
          </div>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <i className='ri-close-line' style={{ fontSize: '24px' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '24px', background: '#f9fafb' }}>
          <DialogContentText>
            {mediaType === 'video' ? (
              <VideoAd url={imageUrl} width={'50vw'} height={'50vh'} showPause autoPlay={false}></VideoAd>
            ) : (
              <img
                src={imageUrl}
                alt='Enlarged Image'
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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

  // States
  const [addAdvtOpen, setAddAdvtOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState({ fetchAds: false, deleteAds: false })
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [advtEditOrAddInitialData, setAdvtEditOrAddInitialData] = useState(null)
  const [id, setId] = useState()
  const [mode, setMode] = useState('add')

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

  const handleDelete = async (e, id) => {
    e.preventDefault()

    console.log('Deleting the advt.')
    const result = await RestApi.del(ApiUrls.v0.ADMIN_DEL_ADVERTISEMENT + '?id=' + id)
    setLoading(prev => ({ ...prev, deleteAds: true }))
    if (result.status === 'success') {
      console.log('Delete  result', result.result.result)
      // toast.success('Advt deleted .')
      setData(result.result.result)
      setLoading(prev => ({ ...prev, deleteAds: false }))
      // handleClose();
    } else {
      // toast.error('Error:' + result.message)
      setLoading(prev => ({ ...prev, deleteAds: false }))
    }
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
              <Typography className='font-semibold' style={{ fontSize: '15px', color: '#1a1a2e' }}>
                {row.original.userName}
              </Typography>
              <Typography
                variant='body2'
                style={{ fontSize: '13px', color: theme.palette.primary.main, fontWeight: 500 }}
              >
                {row.original.company}
              </Typography>
              <Typography
                variant='body2'
                style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}
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
            <Typography style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>
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
            <Typography style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>
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
              <div
                className='media-preview-container'
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
              </div>
            ) : (
              <div
                className='media-preview-container'
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              ></div>
            )}
            <ImagePopup imageUrl={row.original.imageUrl} mediaType={row.original.mediaType} />
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusConfig = {
            active: {
              color: '#10b981',
              bg: '#d1fae5',
              icon: 'ri-checkbox-circle-line',
              label: 'Active'
            },
            pending: {
              color: '#f59e0b',
              bg: '#fef3c7',
              icon: 'ri-time-line',
              label: 'Pending'
            },
            inactive: {
              color: '#6b7280',
              bg: '#f3f4f6',
              icon: 'ri-pause-circle-line',
              label: 'Inactive'
            }
          }
          const config = statusConfig[row.original.status] || statusConfig.inactive

          return (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: config.bg,
                borderRadius: '20px',
                border: `2px solid ${config.color}20`
              }}
            >
              <i className={config.icon} style={{ fontSize: '16px', color: config.color }} />
              <Typography
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: config.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {config.label}
              </Typography>
            </div>
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
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '& i': {
                    color: 'white'
                  }
                },
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
                console.log('advt to be deleted id ...', row.original._id)
                setId(row.original._id)
                handleDelete(e, row.original._id)
              }}
              sx={{
                background: '#fee2e2',
                '&:hover': {
                  background: '#ef4444',
                  '& i': {
                    color: 'white'
                  }
                },
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className='ri-delete-bin-7-line text-[20px]' style={{ color: '#ef4444' }} />
            </IconButtonTooltip>
            <OptionMenu
              iconClassName='text-[22px]'
              iconButtonProps={{
                sx: {
                  background: '#f3f4f6',
                  '&:hover': {
                    background: '#e5e7eb'
                  },
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
      fuzzy: fuzzyFilter
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

    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
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
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-megaphone-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Advertisement Management
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Manage and monitor all advertisements across your platform
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme => theme.shadows[6]
            }
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <div className='flex justify-between items-center flex-col sm:flex-row gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search advertisements...'
                fullWidth
                sx={{ maxWidth: { sm: '400px' } }}
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
                  whiteSpace: 'nowrap'
                }}
              >
                Add New Advertisement
              </Button>
            </div>
          </CardContent>

          <Divider />

          <div className='px-4 sm:px-6 py-3'>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} advertisement{data?.length !== 1 ? 's' : ''}
            </Typography>
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className='enhanced-table-header'>
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
              {table?.getFilteredRowModel()?.rows?.length === 0 ? (
                <tbody>
                  <tr>
                    <td
                      colSpan={table?.getVisibleFlatColumns().length}
                      className='text-center'
                      style={{ padding: '40px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px',
                          color: '#6b7280'
                        }}
                      >
                        <i className='ri-inbox-line' style={{ fontSize: '48px', color: theme.palette.primary.main }} />
                        <Typography variant='h6' style={{ color: '#1a1a2e', fontWeight: 600 }}>
                          No Advertisements Found
                        </Typography>
                        <Typography variant='body2' style={{ color: '#6b7280' }}>
                          Create your first advertisement to get started
                        </Typography>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr
                          key={row.id}
                          className={classnames('enhanced-table-row', { selected: row.getIsSelected() })}
                          style={{
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.08)'
                            e.currentTarget.style.transform = 'scale(1.01)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.15)'
                          }}
                          onMouseLeave={e => {
                            if (!row.getIsSelected()) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className='enhanced-table-cell'>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
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
              borderTop: '2px solid #f3f4f6',
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
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
      </Container>
    </Box>
  )
}

export default AdvListTable
