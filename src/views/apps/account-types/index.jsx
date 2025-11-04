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
  Box,
  Divider,
  InputAdornment,
  Container
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

// MUI Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

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
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import AccountTypeDialog from '@components/dialogs/account-type-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import IconButtonTooltip from '@/components/IconButtonTooltip'

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
    <MenuItem dense onClick={() => handleAction('delete')}>
      <ListItemIcon>
        <DeleteOutlineIcon />
      </ListItemIcon>
      <ListItemText primary='Delete' />
    </MenuItem>
  </Menu>
)

const AccountTypesTable = () => {
  const theme = useTheme()

  // States
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState(null)

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentAccountType, setCurrentAccountType] = useState(null)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

  // Fetch the account types from API
  const getAccountTypeData = async () => {
    console.log('Fetching Account Types Data now...')
    const result = await RestApi.get(`${API_URLS.v0.ACCOUNT_TYPE}`)
    if (result?.status === 'success') {
      console.log('Account Types Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching account types:', result)
    }
  }

  useEffect(() => {
    getAccountTypeData()
  }, [])

  const refreshData = async () => {
    await getAccountTypeData()
  }

  // Function to handle opening the menu
  const handleMoreClick = (event, accountType) => {
    setAnchorEl(event.currentTarget)
    setCurrentAccountType(accountType)
  }

  // Function to close the menu
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to handle Delete confirmation
  const handleDeleteConfirmation = () => {
    setConfirmationDialogOpen(true)
  }

  // Function to handle the actual delete operation
  const handleDelete = async () => {
    if (currentAccountType) {
      try {
        const result = await RestApi.del(`${API_URLS.v0.ACCOUNT_TYPE}?id=${currentAccountType._id}`)
        if (result?.status === 'success') {
          console.log(`Account Type deleted: ${currentAccountType.name}`)
          await refreshData()
        } else {
          console.log('Error deleting account type:', result?.message)
        }
      } catch (error) {
        console.error('An error occurred while deleting the account type:', error)
        throw new Error(error)
      } finally {
        handleClose()
      }
    }
    setConfirmationDialogOpen(false)
  }

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Account Type',
        cell: ({ row }) => (
          <Typography
            color='text.primary'
            sx={{
              fontWeight: 500,
              minWidth: '150px'
            }}
          >
            {row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Active' : 'Inactive'}
            color={row.original.isActive ? 'success' : 'error'}
            size='small'
            variant='tonal'
            sx={{
              fontWeight: 600,
              minWidth: '75px',
              '& .MuiChip-label': {
                px: 2
              }
            }}
          />
        )
      }),
      columnHelper.accessor('createdDate', {
        header: 'Created Date',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary' sx={{ minWidth: '140px' }}>
            {new Date(row.original.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
            ,{' '}
            {new Date(row.original.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </Typography>
        )
      }),
      columnHelper.accessor('createdBy', {
        header: 'Created By',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary' sx={{ minWidth: '120px' }}>
            {row.original.createdBy}
          </Typography>
        )
      }),
      columnHelper.accessor('creatorEmail', {
        header: 'Creator Email',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary' sx={{ minWidth: '180px' }}>
            {row.original.creatorEmail}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButtonTooltip
              title='Edit Account Type'
              onClick={() => handleEditAccountType(row.original)}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.main + '10',
                  '& i': {
                    color: 'primary.main'
                  },
                  transform: 'scale(1.1)'
                }
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            <IconButtonTooltip
              title='More Options'
              onClick={e => handleMoreClick(e, row.original)}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme => theme.palette.primary.main + '10',
                  '& i': {
                    color: 'primary.main'
                  },
                  transform: 'scale(1.1)'
                }
              }}
            >
              <i className='ri-more-2-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    []
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

  const handleEditAccountType = accountType => {
    setEditValue(accountType)
    setOpen(true)
  }

  const handleAddAccountType = () => {
    setEditValue(null)
    setOpen(true)
  }

  const buttonProps = {
    variant: 'contained',
    component: 'label',
    style: { color: 'white' },
    children: 'Add Account Type',
    onClick: handleAddAccountType,
    className: 'is-full sm:is-auto'
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
                <i className='ri-account-box-line' style={{ fontSize: '28px', color: 'white' }} />
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
                Account Types
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
              Manage and configure different account types for your users
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            background: '#ffffff',
            boxShadow: theme => theme.shadows[3],
            borderRadius: 3,
            overflow: 'hidden',
            border: theme => `1px solid ${theme.palette.divider}`,
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
                placeholder='Search Account Types'
                fullWidth
                sx={{ maxWidth: { sm: '500px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i
                        className='ri-search-line'
                        style={{ fontSize: '20px', color: 'var(--mui-palette-text-secondary)' }}
                      />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant='contained'
                component='label'
                onClick={handleAddAccountType}
                startIcon={<i className='ri-add-line' />}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Add New Account Type
              </Button>
            </div>
          </CardContent>

          <Divider />

          <div className='px-4 sm:px-6 py-3'>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} account type{data?.length !== 1 ? 's' : ''}
            </Typography>
          </div>
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
                      <div
                        style={{
                          padding: '48px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <i className='ri-account-box-line' style={{ fontSize: '48px', opacity: 0.5 }} />
                        <Typography variant='h6' color='text.secondary'>
                          No account types found
                        </Typography>
                        <Typography variant='body2' color='text.disabled'>
                          Add your first account type to get started
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
                    .map(row => (
                      <tr
                        key={row.id}
                        className={classnames({ selected: row.getIsSelected() })}
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
            sx={{
              '.MuiTablePagination-toolbar': {
                px: { xs: 2, sm: 3 },
                py: 2
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          />

          {/* Menu for more options */}
          <ActionsMenu
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleAction={action => {
              if (action === 'delete') {
                handleDeleteConfirmation()
              }
            }}
          />
        </Card>

        {/* Dialog for editing and adding account types */}
        <AccountTypeDialog open={open} setOpen={setOpen} data={editValue} onSuccess={refreshData} />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          type='delete-account-type'
          onConfirm={handleDelete}
        />
      </Container>
    </Box>
  )
}

export default AccountTypesTable
