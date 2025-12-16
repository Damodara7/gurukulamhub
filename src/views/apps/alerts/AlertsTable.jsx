'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
  ListItemText,
  Box,
  Paper,
  InputAdornment,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Search as SearchIcon,
  NotificationsActive as NotificationsActiveIcon,
  Groups as GroupsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
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
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import MediaPreviewPopup from '@/components/videos/MediaPreviewPopup'
import { deleteAlert, getAllAlerts } from '@/actions/alerts'
import AlertDialog from '@/components/alerts/AlertDialog'
import { useRouter } from 'next/navigation'
import IconButtonTooltip from '@/components/IconButtonTooltip'
// import { useAppDispatch } from '@/store/hooks'

// Helper function to format filter criteria for display
const formatFilterCriteria = (filter) => {
  if (!filter || !filter.criteria) return ''
  
  switch (filter.type) {
    case 'age':
      const { min, max } = filter.criteria
      if (min !== undefined && max !== undefined) {
        return `${min}-${max} years`
      } else if (min !== undefined) {
        return `${min}+ years`
      } else if (max !== undefined) {
        return `up to ${max} years`
      }
      return 'Age'
    
    case 'location':
      const parts = []
      if (filter.criteria.city) parts.push(filter.criteria.city)
      if (filter.criteria.region) parts.push(filter.criteria.region)
      if (filter.criteria.country) parts.push(filter.criteria.country)
      return parts.join(', ') || 'Location'
    
    case 'gender':
      if (filter.criteria.values && Array.isArray(filter.criteria.values)) {
        return filter.criteria.values.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
      }
      return 'Gender'
    
    default:
      return filter.type
  }
}

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
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const ActionsMenu = ({ anchorEl, handleClose, handleAction, theme, isDarkMode }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    PaperProps={{
      sx: {
        borderRadius: { xs: 1.5, sm: 2 },
        minWidth: 180,
        bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
        border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`,
        boxShadow: isDarkMode
          ? `0 8px 24px ${alpha(theme.palette.common.black, 0.4)}`
          : '0 8px 24px rgba(15, 23, 42, 0.1)'
      }
    }}
  >
    <MenuItem
      onClick={() => handleAction('edit')}
      sx={{
        py: 1.25,
        px: 2,
        fontSize: { xs: '0.9375rem', sm: '1rem' },
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08)
        }
      }}
    >
      <ListItemIcon>
        <EditIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
      </ListItemIcon>
      <ListItemText
        primary='Edit'
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: { xs: '0.9375rem', sm: '1rem' }
        }}
      />
    </MenuItem>
    <MenuItem
      onClick={() => handleAction('users')}
      sx={{
        py: 1.25,
        px: 2,
        fontSize: { xs: '0.9375rem', sm: '1rem' },
        '&:hover': {
          bgcolor: alpha(theme.palette.info.main, 0.08)
        }
      }}
    >
      <ListItemIcon>
        <PersonIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
      </ListItemIcon>
      <ListItemText
        primary='View Users'
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: { xs: '0.9375rem', sm: '1rem' }
        }}
      />
    </MenuItem>
    <MenuItem
      onClick={() => handleAction('delete')}
      sx={{
        py: 1.25,
        px: 2,
        fontSize: { xs: '0.9375rem', sm: '1rem' },
        '&:hover': {
          bgcolor: alpha(theme.palette.error.main, 0.08)
        }
      }}
    >
      <ListItemIcon>
        <DeleteOutlineIcon sx={{ fontSize: 20, color: theme.palette.error.main }} />
      </ListItemIcon>
      <ListItemText
        primary='Delete'
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: { xs: '0.9375rem', sm: '1rem' }
        }}
      />
    </MenuItem>
  </Menu>
)

const AlertsTable = () => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState(null)

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null) // To keep track of the feature for actions
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog
  const [expandedAudiences, setExpandedAudiences] = useState([]) // Track which audience filters are expanded (array of alert IDs)
  
  // Helper to convert ID to string (handles ObjectId, string, or number)
  const getIdAsString = (id) => {
    if (!id) return null
    if (typeof id === 'string') return id
    if (typeof id === 'object' && id.toString) return id.toString()
    return String(id)
  }

  // Fetch the Alerts from API
  const getAlertsData = async () => {
    console.log('Fetching Alerts Data now...')
    const result = await getAllAlerts()
    if (result?.status === 'success') {
      console.log('Alerts Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching Alerts:', result)
    }
  }

  useEffect(() => {
    getAlertsData()
  }, [])

  const refreshData = async () => {
    await getAlertsData() // Fetch the latest Videos
  }

  // Function to handle opening the menu
  const handleMoreClick = (event, rowOriginal) => {
    setAnchorEl(event.currentTarget)
    setCurrentRow(rowOriginal) // Save the current rowOriginal to reference in actions
  }

  // Function to close the menu
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to handle Delete confirmation
  const handleDeleteConfirmation = () => {
    setConfirmationDialogOpen(true) // Open confirmation dialog
    handleClose() // Close the Anchor Menu
  }

  // Function to handle the actual delete operation
  const handleDelete = async () => {
    if (currentRow) {
      try {
        const result = await deleteAlert({ id: currentRow._id })
        if (result?.status === 'success') {
          console.log(`Feature deleted: ${currentRow.name}`)
          await refreshData() // Refresh data after deletion
        } else {
          console.log('Error deleting feature:', result?.message)
        }
      } catch (error) {
        console.error('An error occurred while deleting the feature:', error)
        throw new Error(error) // handling in Confirmation dialog
      } finally {
        handleClose() // Close the menu after the operation
      }
    }
    setConfirmationDialogOpen(false) // Close confirmation dialog
  }

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Title',
        cell: ({ row }) => (
          <Typography
            fontWeight={600}
            sx={{
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('alertType', {
        header: 'Alert Type',
        cell: ({ row }) => (
          <Chip
            label={row.original.alertType.replace('_', ' ')}
            size='small'
            sx={{
              bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              borderRadius: { xs: 1, sm: 1.5 }
            }}
          />
        )
      }),
      columnHelper.accessor('audience', {
        header: 'Target Audience',
        cell: ({ row }) => {
          const audience = row.original?.audience
          // Use alert's _id as the unique key (stable across renders)
          const alertId = row.original?._id
          const alertIdString = getIdAsString(alertId)
          
          if (!alertIdString) {
            // Fallback if _id doesn't exist
            return (
              <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                All Users
              </Typography>
            )
          }
          
          const isExpanded = expandedAudiences.includes(alertIdString)
          const hasFilters = audience?.filters && Array.isArray(audience.filters) && audience.filters.length > 0
          
          if (!audience) {
            return (
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                }}
              >
                All Users
              </Typography>
            )
          }

          const toggleFilters = (e) => {
            e.stopPropagation()
            e.preventDefault()
            setExpandedAudiences(prev => {
              const isCurrentlyExpanded = prev.includes(alertIdString)
              if (isCurrentlyExpanded) {
                // Remove from array
                return prev.filter(id => id !== alertIdString)
              } else {
                // Add to array
                return [...prev, alertIdString]
              }
            })
          }

          return (
            <Box sx={{ py: 0.5, minWidth: 200 }}>
              <Stack 
                direction='row' 
                spacing={0.75} 
                alignItems='center' 
                sx={{ mb: hasFilters && isExpanded ? 0.5 : 0 }}
              >
                <GroupsIcon fontSize='small' sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                <Typography 
                  fontWeight={600} 
                  sx={{ 
                    fontSize: '0.875rem',
                    color: 'text.primary',
                    flex: 1
                  }}
                >
                  {audience.audienceName}
                </Typography>
                {hasFilters && (
                  <IconButton
                    size='small'
                    onClick={toggleFilters}
                    sx={{
                      p: 0.5,
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main
                      }
                    }}
                  >
                    {isExpanded ? (
                      <KeyboardArrowUpIcon fontSize='small' />
                    ) : (
                      <KeyboardArrowDownIcon fontSize='small' />
                    )}
                  </IconButton>
                )}
              </Stack>
              {hasFilters ? (
                <>
                  {isExpanded ? (
                    <Box sx={{ ml: 3, mt: 0.5 }}>
                      <Stack direction='row' spacing={0.5} flexWrap='wrap' alignItems='center'>
                        {audience.filters.map((filter, index) => {
                          if (!filter || !filter.type) return null
                          return (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                              {index > 0 && filter?.operator && (
                                <Chip
                                  label={filter.operator}
                                  size='small'
                                  sx={{
                                    height: '18px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    mr: 0.5,
                                    mb: 0.5,
                                    bgcolor: alpha(theme.palette.warning.main, isDarkMode ? 0.2 : 0.15),
                                    color: theme.palette.warning.main,
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                    '& .MuiChip-label': {
                                      px: 0.75
                                    }
                                  }}
                                />
                              )}
                              <Chip
                                label={`${filter.type.toUpperCase()}: ${formatFilterCriteria(filter)}`}
                                size='small'
                                sx={{
                                  height: '18px',
                                  fontSize: '0.65rem',
                                  mr: 0.5,
                                  mb: 0.5,
                                  bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.15 : 0.1),
                                  color: theme.palette.info.main,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  '& .MuiChip-label': {
                                    px: 0.75
                                  }
                                }}
                              />
                            </Box>
                          )
                        })}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography
                      variant='caption'
                      sx={{
                        ml: 3,
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        fontSize: '0.7rem',
                        mt: 0.5,
                        display: 'block'
                      }}
                    >
                      {audience.filters.length} filter{audience.filters.length !== 1 ? 's' : ''} - Click to expand
                    </Typography>
                  )}
                </>
              ) : (
                <Typography
                  variant='caption'
                  sx={{
                    ml: 3,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  No filters
                </Typography>
              )}
            </Box>
          )
        }
      }),
      // columnHelper.accessor('videos', {
      //   header: 'Videos',
      //   cell: ({ row }) => (
      //     <div className='flex flex-col gap-2'>
      //       {row.original.videos.map(videoObj => (
      //         <div>
      //           <Typography variant='h6'>{videoObj.name}</Typography>
      //           <MediaPreviewPopup url={videoObj.url} mediaType='video' showMute={false} showPause={false} showPopup={true} />
      //         </div>
      //       ))}
      //     </div>
      //   )
      // }),
      columnHelper.accessor('createdAt', {
        header: 'Created Date',
        cell: ({ row }) => (
          <Stack spacing={0.25}>
            <Typography
              variant='body2'
              fontWeight={600}
              sx={{
                color: 'text.primary',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }
              }}
            >
              {new Date(row.original.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', sm: '0.8125rem' }
              }}
            >
              {new Date(row.original.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </Typography>
          </Stack>
        )
      }),
      columnHelper.accessor('createdBy', {
        header: 'Created By',
        cell: ({ row }) => (
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }
            }}
          >
            {row.original.createdBy}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip title='Actions' onClick={e => handleMoreClick(e, row.original)}>
              <i className='ri-more-2-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    [expandedAudiences, theme, isDarkMode] // Include expandedAudiences state to trigger re-render when toggled
  )

  const table = useReactTable({
    data: data,
    columns,
    getRowId: (row) => row._id || row.id, // Use _id as the stable row identifier
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

  const handleEditRow = () => {
    setEditValue(currentRow) // Pass the entire row object or just the necessary fields
    setOpen(true) // Open the dialog
    handleClose() // Close the Anchor Menu
  }

  const handleGoToAlertUsers = () => {
    router.push(`/management/alerts/${currentRow._id}/users`)
  }

  const handleAddRow = () => {
    setEditValue(null)
  }

  const buttonProps = {
    variant: 'contained',
    component: 'label',
    style: { color: 'white' },
    children: 'Add New',
    onClick: handleAddRow,
    className: 'is-full sm:is-auto'
  }

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2.5, sm: 3, md: 4 },
          p: { xs: 2.5, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 2px 12px rgba(15, 23, 42, 0.04)'
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box
              sx={{
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.15 : 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main
              }}
            >
              <NotificationsActiveIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='h4'
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  color: 'text.primary',
                  lineHeight: 1.3
                }}
              >
                Alerts Management
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  mt: 0.5
                }}
              >
                Create and manage alerts for your users
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 2px 12px rgba(15, 23, 42, 0.04)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
          >
            <TextField
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder='Search alerts...'
              size='small'
              fullWidth={isMobile}
              sx={{
                maxWidth: { xs: '100%', sm: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: isDarkMode
                    ? alpha(theme.palette.background.default, 0.4)
                    : alpha(theme.palette.grey[50], 0.5)
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
            {/* <Button
              variant='contained'
              component='label'
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              fullWidth={isMobile}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1, sm: 1.1 },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                color: 'white',
                boxShadow: isDarkMode
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Add New Alert
            </Button> */}
            <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={AlertDialog}
            dialogProps={{ editValue, onSuccess: refreshData }}
          />
          </Stack>
        </CardContent>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <table className={tableStyles.table}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.palette.background.paper }}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              )}
            </table>
          </Box>
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 7, 10]}
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
        />

        {/* Menu for more options */}
        <ActionsMenu
          anchorEl={anchorEl}
          handleClose={handleClose}
          handleAction={action => {
            if (action === 'delete') {
              handleDeleteConfirmation()
            }
            if (action === 'edit') {
              handleEditRow()
            }
            if (action === 'users') {
              handleGoToAlertUsers()
            }
          }}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </Card>

      {/* Dialog for editing and adding Videos */}
      <AlertDialog open={open} setOpen={setOpen} data={editValue} onSuccess={refreshData} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-video' // Set the type based on your context
        onConfirm={handleDelete}
      />
    </Box>
  )
}

export default AlertsTable
