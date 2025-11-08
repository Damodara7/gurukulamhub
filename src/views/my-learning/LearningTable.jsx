'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import {
  Box,
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
  FormControl,
  InputLabel,
  Select,
  Container,
  useTheme,
  alpha,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { alpha } from '@mui/material/styles'

// MUI Icons
import { 
  DeleteOutline as DeleteOutlineIcon, 
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  Search as SearchIcon
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

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import MediaPreviewPopup from '@/components/videos/MediaPreviewPopup'
import LearningVideoInfo from '@/components/my-learning/LearningVideoInfo'
import { getUserLearningsByEmail } from '@/actions/userLearning'
import { useSession } from 'next-auth/react'
import IconButtonTooltip from '@/components/IconButtonTooltip'
// import { useAppDispatch } from '@/store/hooks'

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

const ActionsMenu = ({ anchorEl, handleClose, handleAction }) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
    <MenuItem dense onClick={() => handleAction('view')}>
      <ListItemIcon>
        <VisibilityIcon />
      </ListItemIcon>
      <ListItemText primary='View' />
    </MenuItem>
  </Menu>
)

const LearningTable = () => {
  // States
  const theme = useTheme()
  const { data: session } = useSession()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [viewRowData, setViewRowData] = useState(null)

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null) // To keep track of the feature for actions
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog

  const [dateRange, setDateRange] = useState('all') // Default to 'all'

  // Fetch the videos from API
  const getUserLearningData = async () => {
    setLoading(true)
    console.log('Fetching user learing Data now...')
    const result = await getUserLearningsByEmail({ email: session?.user?.email })
    if (result?.status === 'success') {
      console.log('User learing data Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching user learing data:', result)
    }
    setLoading(false)
  }

  useEffect(() => {
    getUserLearningData()
  }, [])

  const refreshData = async () => {
    await getUserLearningData() // Fetch the latest Videos
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

  const filteredData = useMemo(() => {
    const now = new Date()
    return data.filter(record => {
      const earnedDate = new Date(record.earnedAt)

      switch (dateRange) {
        case 'today':
          return earnedDate.toDateString() === now.toDateString()
        case 'last7days':
          return earnedDate >= new Date(now.setDate(now.getDate() - 7))
        case 'last30days':
          return earnedDate >= new Date(now.setDate(now.getDate() - 30))
        default:
          return true // 'all' - show all records
      }
    })
  }, [data, dateRange])

  // Calculate total points
  const totalPoints = data?.reduce((sum, eachLearning) => sum + eachLearning?.learningPoints, 0) || 0

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('video.name', {
        header: 'Video',
        cell: ({ row }) => (
          <Stack spacing={0.5} alignItems="flex-start">
            <Typography variant='body1' fontWeight={600} sx={{ color: '#202124' }}>
              {row.original?.video?.name}
            </Typography>
            <MediaPreviewPopup url={row.original?.video?.url} mediaType='video' showPopup={true} />
          </Stack>
        )
      }),
      columnHelper.accessor('learningPoints', {
        header: 'Points Earned',
        cell: ({ row }) => (
          <Chip
            label={`${row.original?.learningPoints}/${row.original?.totalPoints}`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.main',
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 28
            }}
          />
        )
      }),
      columnHelper.accessor('earnedAt', {
        header: 'Date Earned',
        cell: ({ row }) => (
          <Stack spacing={0}>
            <Typography variant='body2' fontWeight={600} sx={{ color: '#202124' }}>
              {new Date(row.original.earnedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant='caption' sx={{ color: '#5f6368' }}>
              {new Date(row.original.earnedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </Typography>
          </Stack>
        )
      }),
      columnHelper.accessor('completionPercent', {
        header: '% Completed',
        cell: ({ row }) => (
          <Stack spacing={0.5} alignItems="center">
            <Typography variant='body2' fontWeight={700} sx={{ color: '#202124' }}>
              {row.original?.completionPercent}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={row.original?.completionPercent}
              sx={{
                width: 60,
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: row.original?.completionPercent === 100 ? 'success.main' : 'primary.main',
                  borderRadius: 1
                }
              }}
            />
          </Stack>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center justify-center'>
            <IconButtonTooltip 
              title='View Details' 
              onClick={e => handleMoreClick(e, row.original)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <VisibilityIcon fontSize='small' />
            </IconButtonTooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, theme] // Ensure roles are passed as a dependency to update dynamically
  )

  const table = useReactTable({
    data: filteredData,
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

  const handleViewRow = () => {
    setViewRowData(currentRow) // Pass the entire row object or just the necessary fields
    setOpen(true) // Open the dialog
    handleClose() // Close the Anchor Menu
  }

  const handleCloseRow = () => {
    setViewRowData(null) // Reset the viewRowData
    setOpen(false) // Close the dialog
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 6 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
          borderBottom: '1px solid #e8eaed',
          mb: 4
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            {/* Title */}
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <SchoolIcon sx={{ fontSize: { xs: 32, md: 40 }, color: 'primary.main' }} />
              My Learning Journey
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#5f6368', maxWidth: '800px' }}>
              Track your learning progress, earned points, and completed videos
            </Typography>

            {/* Stats Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.2)
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem', fontWeight: 600 }}>
                      TOTAL POINTS EARNED
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: 'success.main' }}>
                      {totalPoints}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem', fontWeight: 600 }}>
                      VIDEOS COMPLETED
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: 'primary.main' }}>
                      {data.length}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl">
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: 'white',
            border: '1px solid #e8eaed',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}
        >
          {/* Filters Section */}
          <CardContent sx={{ borderBottom: '1px solid #e8eaed' }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <TextField
                size="small"
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(String(e.target.value))}
                placeholder='Search videos...'
                sx={{
                  minWidth: { xs: '100%', sm: 300 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  )
                }}
              />
              
              <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel>Date Range</InputLabel>
                <Select 
                  label='Date Range' 
                  value={dateRange} 
                  onChange={e => setDateRange(e.target.value)}
                  sx={{
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }}
                >
                  <MenuItem value='all'>All Time</MenuItem>
                  <MenuItem value='today'>Today</MenuItem>
                  <MenuItem value='last7days'>Last 7 Days</MenuItem>
                  <MenuItem value='last30days'>Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Loading your learning data...
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Table */}
          {!loading && (
            <>
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className='text-center'>
                            {header.isPlaceholder ? null : (
                              <>
                                <div
                                  className={classnames({
                                    'flex items-center justify-center': header.column.getIsSorted(),
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
                          <Box sx={{ py: 8 }}>
                            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                            <Typography variant='h6' color='text.secondary' fontWeight={600} gutterBottom>
                              No Learning Data Found
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {globalFilter || dateRange !== 'all'
                                ? 'Try adjusting your filters to see more results'
                                : 'Start watching videos to track your learning progress'}
                            </Typography>
                          </Box>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {table
                        .getRowModel()
                        .rows.slice(0, table.getState().pagination.pageSize)
                        .map(row => (
                          <tr 
                            key={row.id} 
                            className={classnames({ selected: row.getIsSelected() })}
                            style={{
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            {row.getVisibleCells().map(cell => (
                              <td key={cell.id} className='text-center'>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  )}
                </table>
              </div>

              {/* Pagination */}
              {table.getFilteredRowModel().rows.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 7, 10, 25]}
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
                    borderTop: '1px solid #e8eaed',
                    '.MuiTablePagination-toolbar': {
                      py: 2
                    }
                  }}
                />
              )}
            </>
          )}

          {/* Menu for more options */}
          <ActionsMenu
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleAction={action => {
              if (action === 'view') {
                handleViewRow()
              }
            }}
          />
        </Card>
      </Container>

      {open && <LearningVideoInfo data={viewRowData} open={open} onClose={handleCloseRow} />}
    </Box>
  )
}

export default LearningTable
