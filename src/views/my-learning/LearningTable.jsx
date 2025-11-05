'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
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
  FormControl,
  InputLabel,
  Select,
  Box,
  Container,
  useTheme
} from '@mui/material'
import { alpha } from '@mui/material/styles'

// MUI Icons
import { DeleteOutline as DeleteOutlineIcon, Visibility as VisibilityIcon } from '@mui/icons-material'

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
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [viewRowData, setViewRowData] = useState(null)

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentRow, setCurrentRow] = useState(null) // To keep track of the feature for actions
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog

  const [dateRange, setDateRange] = useState('all') // Default to 'all'

  // Fetch the videos from API
  const getUserLearningData = async () => {
    console.log('Fetching user learing Data now...')
    const result = await getUserLearningsByEmail({ email: session?.user?.email })
    if (result?.status === 'success') {
      console.log('User learing data Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching user learing data:', result)
    }
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

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('video.name', {
        header: 'Video',
        cell: ({ row }) => (
          <>
            <Typography variant='h5'>{row.original?.video?.name}</Typography>
            <MediaPreviewPopup url={row.original?.video?.url} mediaType='video' showPopup={true} />
          </>
        )
      }),
      columnHelper.accessor('learningPoints', {
        header: 'Points Earned',
        cell: ({ row }) => (
          <Typography variant='h5'>
            {row.original?.learningPoints}/{row.original?.totalPoints}
          </Typography>
        )
      }),
      columnHelper.accessor('earnedAt', {
        header: 'Date Earned',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {new Date(row.original.earnedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: '2-digit'
            })}
            ,{' '}
            {new Date(row.original.earnedAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </Typography>
        )
      }),
      columnHelper.accessor('completionPercent', {
        header: '% Completed',
        cell: ({ row }) => <Typography variant='h6'>{row.original?.completionPercent}%</Typography>
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
    [] // Ensure roles are passed as a dependency to update dynamically
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
                <i className='ri-book-read-line' style={{ fontSize: '28px', color: 'white' }} />
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
                My Learning Journey
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                width: '100%',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Track your progress and review your learning achievements
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            overflow: 'hidden',
            '&:hover': {
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`
            }
          }}
        >
          <CardContent className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Typography variant='h5' color='primary'>
                Total Learning Points:
              </Typography>
              <Typography variant='h5' color='primary'>
                {data?.reduce((sum, eachLearning) => {
                  return sum + eachLearning?.learningPoints
                }, 0)}
              </Typography>
            </div>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search videos...'
              sx={{ minWidth: { xs: '100%', sm: 250 } }}
            />
            <FormControl size='small' sx={{ width: { xs: '100%', sm: 200 } }}>
              <InputLabel>Date Range</InputLabel>
              <Select label='Date Range' value={dateRange} onChange={e => setDateRange(e.target.value)} displayEmpty>
                <MenuItem value='all'>All</MenuItem>
                <MenuItem value='today'>Today</MenuItem>
                <MenuItem value='last7days'>Last 7 Days</MenuItem>
                <MenuItem value='last30days'>Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
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
                          <td key={cell.id} className='text-center'>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              )}
            </table>
          </div>
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
              if (action === 'view') {
                handleViewRow()
              }
            }}
          />
        </Card>

        {open && <LearningVideoInfo data={viewRowData} open={open} onClose={handleCloseRow} />}
      </Container>
    </Box>
  )
}

export default LearningTable
