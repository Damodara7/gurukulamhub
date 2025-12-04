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
  Edit as EditIcon,
  Search as SearchIcon,
  People as PeopleIcon
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
import { getAlertUsersByAlertId } from '@/actions/userAlerts'
import AlertUsersDialog from '@/components/alerts/AlertUsersDialog'
import { useRouter } from 'next/navigation'
import GoBackButton from '@/components/GoBackButton'
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

const ActionsMenu = ({ anchorEl, handleClose, handleAction, theme, isDarkMode }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    PaperProps={{
      sx: {
        borderRadius: { xs: 1.5, sm: 2 },
        minWidth: 160,
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
        primary='Edit Status'
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: { xs: '0.9375rem', sm: '1rem' }
        }}
      />
    </MenuItem>
  </Menu>
)

const AlertUsersTable = ({ alertId }) => {
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

  // Fetch the AlertUsersByAlertId from API
  const getAlertsData = async () => {
    const result = await getAlertUsersByAlertId({ alertId: alertId })
    if (result?.status === 'success') {
      console.log('AlertUsersByAlertId Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching AlertUsersByAlertId:', result)
    }
  }

  useEffect(() => {
    getAlertsData()
  }, [])

  const refreshData = async () => {
    await getAlertsData() // Fetch the latest AlertUsersByAlertId
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

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('email', {
        header: 'User',
        cell: ({ row }) => (
          <Typography
            fontWeight={600}
            sx={{
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            {row.original.email}
          </Typography>
        )
      }),
      columnHelper.accessor('completionStatus', {
        header: 'Completion Status',
        cell: ({ row }) => (
          <Chip
            size='small'
            label={row.original.completionStatus.charAt(0).toUpperCase() + row.original.completionStatus.slice(1)}
            color={row.original.completionStatus === 'completed' ? 'success' : 'warning'}
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              borderRadius: { xs: 1, sm: 1.5 }
            }}
          />
        )
      }),
      columnHelper.accessor('status', {
        header: 'Active State',
        cell: ({ row }) => (
          <Chip
            size='small'
            label={row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
            color={row.original.status === 'active' ? 'success' : 'error'}
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              borderRadius: { xs: 1, sm: 1.5 }
            }}
          />
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
    [] // Ensure roles are passed as a dependency to update dynamically
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

  const handleAddRow = () => {
    setEditValue(null)
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Back Button */}
      <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
        <GoBackButton path='/management/alerts' />
      </Box>

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
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: alpha(theme.palette.info.main, isDarkMode ? 0.15 : 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.info.main
            }}
          >
            <PeopleIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
              Alert Users
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                mt: 0.5
              }}
            >
              Manage users assigned to this alert
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Card
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          bgcolor: isDarkMode ? theme.palette.background.paper : 'white',
          border: `1px solid ${alpha(theme.palette.divider, isDarkMode ? 0.15 : 0.1)}`,
          boxShadow: isDarkMode
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : '0 2px 12px rgba(15, 23, 42, 0.04)'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <TextField
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder='Search users...'
            size='small'
            fullWidth={isMobile}
            sx={{
              maxWidth: { xs: '100%', sm: 320 },
              mb: { xs: 2, sm: 2.5 },
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
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
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
            if (action === 'delete') {
              handleDeleteConfirmation()
            }
            if (action === 'edit') {
              handleEditRow()
            }
          }}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </Card>

      {/* Dialog for editing */}
      <AlertUsersDialog
        open={open}
        setOpen={setOpen}
        data={{ ...editValue, alertId: alertId }}
        onSuccess={refreshData}
      />
    </Box>
  )
}

export default AlertUsersTable
