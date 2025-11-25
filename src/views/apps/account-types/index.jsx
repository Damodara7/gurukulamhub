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
import useMediaQuery from '@mui/material/useMediaQuery'

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
import AccountTypeDialog from '@/components/dialogs/account-type-dialog/Account-Type-Dailog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

import IconButtonTooltip from '@/components/IconButtonTooltip'
import { toast } from 'react-toastify'

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

// Custom global filter that only searches by account type name
const globalNameFilter = (row, columnId, value, addMeta) => {
  const name = (row.original.name || '').toString().toLowerCase()
  const searchValue = (value || '').toString().toLowerCase().trim()

  // If no search value, show all rows
  if (!searchValue) return true

  // Use fuzzy matching on the name field only
  const itemRank = rankItem(name, searchValue)

  if (addMeta) {
    addMeta({
      itemRank
    })
  }

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
          toast.success(`Account Type deleted: ${currentAccountType.name}`)
          await refreshData()
        } else {
          console.log('Error deleting account type:', result?.message)
          toast.error(`Error deleting account type: ${result?.message}`)
        }
      } catch (error) {
        console.error('An error occurred while deleting the account type:', error)
        toast.error(`Error deleting account type: ${error?.message}`)
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
          <div className='flex items-center gap-2'>
            <IconButtonTooltip
              title='Edit'
              onClick={() => handleEditAccountType(row.original)}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
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
              title='Delete'
              onClick={() => {
                setCurrentAccountType(row.original)
                setConfirmationDialogOpen(true)
              }}
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
                  '& i': {
                    color: 'error.main'
                  },
                  transform: 'scale(1.1)'
                }
              }}
            >
              <i className='ri-delete-bin-line text-[22px] text-textSecondary' />
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
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(circle at 18% 18%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 55%),
                     radial-gradient(circle at 82% 82%, ${alpha(
                       theme.palette.secondary.main,
                       0.06
                     )} 0%, transparent 55%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(16px)',
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.78),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
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
                <i className='ri-account-box-line' style={{ fontSize: 'clamp(22px, 6vw, 28px)', color: '#fff' }} />
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
                  Account Types
                </Typography>
              </Stack>
            </Stack>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.8,
                maxWidth: { xs: '100%', sm: '640px' },
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
      <Container
        maxWidth='lg'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          py: { xs: 3, md: 4 }
        }}
      >
        <Card
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 12px 32px ${alpha(theme.palette.common.black, 0.4)}`
                : '0 12px 32px rgba(15, 15, 45, 0.06)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 2.75, sm: 3.5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2.5, sm: 3 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent='space-between'
            >
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search account types'
                fullWidth
                sx={{
                  maxWidth: { sm: 420 },
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper
                  }
                }}
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
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  alignSelf: { xs: 'stretch', sm: 'center' },
                  px: { xs: 2.75, sm: 3.5 },
                  py: { xs: 1.15, sm: 1.25 }
                }}
              >
                Add New Account Type
              </Button>
            </Stack>
          </CardContent>

          <Divider />

          <Box sx={{ px: { xs: 3, sm: 4 }, py: { xs: 2, sm: 2.5 } }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} account type{data?.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <i className='ri-account-box-line' style={{ fontSize: 48, opacity: 0.5 }} />
                <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
                  No account types found
                </Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                  Add your first account type to get started
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
                    const accountType = row.original
                    const isActive = accountType.isActive ?? false

                    return (
                      <Box
                        key={row.id}
                        sx={{
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? `0 12px 30px ${alpha(theme.palette.common.black, 0.3)}`
                              : '0 12px 30px rgba(15, 23, 42, 0.08)',
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          background: theme.palette.background.paper,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow:
                              theme.palette.mode === 'dark'
                                ? `0 16px 40px ${alpha(theme.palette.common.black, 0.5)}`
                                : '0 16px 40px rgba(15, 23, 42, 0.12)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={1.5}>
                          <Typography
                            variant='subtitle1'
                            sx={{
                              fontWeight: 700,
                              fontSize: '1rem',
                              flex: 1,
                              minWidth: 0,
                              wordBreak: 'break-word',
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            {accountType.name}
                          </Typography>
                          <Chip
                            label={isActive ? 'Active' : 'Inactive'}
                            color={isActive ? 'success' : 'default'}
                            variant='tonal'
                            size='small'
                            sx={{ fontWeight: 600, flexShrink: 0 }}
                          />
                        </Stack>

                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant='caption' color='text.secondary'>
                            Created:{' '}
                            {new Date(accountType.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                            ,{' '}
                            {new Date(accountType.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            CreatedBy: {accountType.createdBy || 'N/A'}
                          </Typography>
                          {accountType.creatorEmail && (
                            <Typography variant='caption' color='text.secondary'>
                              Email: {accountType.creatorEmail}
                            </Typography>
                          )}
                        </Stack>
                        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant='outlined'
                            color='primary'
                            size='small'
                            onClick={() => handleEditAccountType(accountType)}
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
                            sx={{
                              color: 'white',
                              flex: 1,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                            size='small'
                            onClick={() => {
                              setCurrentAccountType(accountType)
                              setConfirmationDialogOpen(true)
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
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr
                        key={row.id}
                        className={classnames({ selected: row.getIsSelected() })}
                        style={{
                          cursor: 'pointer'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.15 : 0.08
                          )
                          e.currentTarget.style.boxShadow = `0 2px 8px ${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.25 : 0.15
                          )}`
                        }}
                        onMouseLeave={e => {
                          if (!row.getIsSelected()) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Box>
          {!isMobile && table.getFilteredRowModel().rows.length > 0 && (
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
          )}
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
