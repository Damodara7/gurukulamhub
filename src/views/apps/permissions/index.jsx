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
  Container,
  Grid,
  Divider,
  InputAdornment
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

// MUI Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'

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
import FeatureDialog from '@components/dialogs/permission-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '../../../app/api/client/client.api'

import { roleSliceActions } from '@/store/features/roleSlice'
import IconButtonTooltip from '@/components/IconButtonTooltip'
// import { useAppDispatch } from '@/store/hooks'

// Vars
const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
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

const ActionsMenu = ({ anchorEl, handleClose, handleAction }) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
    <MenuItem dense onClick={() => handleAction('delete')}>
      <ListItemIcon>
        <DeleteOutlineIcon />
      </ListItemIcon>
      <ListItemText primary='Delete' />
    </MenuItem>
    {/* <MenuItem dense onClick={() => handleAction('assign')}>
      <ListItemIcon>
        <AssignmentOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary='Assign To' />
    </MenuItem> */}
  </Menu>
)

const FeaturesTable = () => {
  const theme = useTheme()

  // States
  // const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState(null)

  const [data, setData] = useState([])
  const [roles, setRoles] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentFeature, setCurrentFeature] = useState(null) // To keep track of the feature for actions
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false) // Manage confirmation dialog

  // Fetch the features from API
  const getFeatureData = async () => {
    console.log('Fetching Features Data now...')
    // const result = await clientApi.getAllFeatures()
    const result = await RestApi.get(`${API_URLS.v0.FEATURE}`)
    if (result?.status === 'success') {
      console.log('Features Fetched result', result)
      setData(result?.result || [])
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching features:', result)
    }
  }

  useEffect(() => {
    getFeatureData()
  }, [])

  const refreshData = async () => {
    await getFeatureData() // Fetch the latest features
  }

  // Fetch the roles from API
  const getRolesData = async () => {
    console.log('Fetching Roles Data now...')
    // const result = await clientApi.getAllRoles()// Change this to the correct endpoint for roles
    const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
    if (result?.status === 'success') {
      console.log('Roles Fetched result', result)
      setRoles(result?.result || []) // Store the fetched roles data
      // dispatch(roleSliceActions.refreshRoles(result?.result || []))
    } else {
      console.log('Error:' + result?.message)
      console.log('Error Fetching roles:', result)
    }
  }

  useEffect(() => {
    getRolesData() // Call the updated function to fetch roles data
  }, [])

  // Function to handle opening the menu
  const handleMoreClick = (event, feature) => {
    setAnchorEl(event.currentTarget)
    setCurrentFeature(feature) // Save the current feature to reference in actions
  }

  // Function to close the menu
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to handle Delete confirmation
  const handleDeleteConfirmation = () => {
    setConfirmationDialogOpen(true) // Open confirmation dialog
  }

  // Function to handle the actual delete operation
  const handleDelete = async () => {
    if (currentFeature) {
      try {
        // console.log('Deleting', cur)
        // const result = await clientApi.deleteFeature(currentFeature._id) // Adjust the URL as needed
        const result = await RestApi.del(`${API_URLS.v0.FEATURE}?id=${currentFeature._id}`)
        if (result?.status === 'success') {
          console.log(`Feature deleted: ${currentFeature.name}`)
          await refreshData() // Refresh data after deletion
        } else {
          console.log('Error deleting feature:', result?.message)
          // You might want to show a user-friendly error message here
        }
      } catch (error) {
        console.error('An error occurred while deleting the feature:', error)
        throw new Error(error) // handling in Confirmation dialog
        // Handle error (e.g., show a notification)
      } finally {
        handleClose() // Close the menu after the operation
      }
    }
    setConfirmationDialogOpen(false) // Close confirmation dialog
  }

  // Function to handle Assign
  // const handleAssign = () => {
  //   console.log(`Assign feature: ${currentFeature.name}`) // Replace with actual assign logic
  //   handleClose()
  // }

  // Helper function to get roles associated with a feature
  const getRolesForFeature = featureId => {
    // console.log(featureId, roles)
    return roles
      .filter(role => role.features.some(f => f._id === featureId)) // Filter roles that have the specific feature
      .map(role => role.name) // Return the role names
  }

  // Column Configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Feature',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('permissions', {
        header: 'Permissions',
        cell: ({ row }) => (
          <Stack direction='row' gap={1} flexWrap='wrap' className='chipRow'>
            {row.original.permissions.map((permission, index) => {
              // Define colors based on permission or index
              const chipColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']
              const color = chipColors[index % chipColors.length] // Cycle through predefined colors

              return (
                <Chip
                  key={index}
                  variant='tonal'
                  label={permission}
                  color={color} // Use dynamic color from MUI palette
                  size='small'
                  style={{ fontSize: '10px', padding: '0px' }}
                  className='uppercase'
                />
              )
            })}
          </Stack>
        )
      }),

      columnHelper.accessor('assignedTo', {
        header: 'Assigned To',
        cell: ({ row }) => {
          const featureId = row.original._id
          const rolesForFeature = getRolesForFeature(featureId) // Get roles for the specific feature

          return (
            <Stack direction='row' gap={1} flexWrap='wrap' className='chipRow'>
              {rolesForFeature.map((role, index) => {
                // Define MUI color options
                const chipColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']
                const color = chipColors[index % chipColors.length] // Cycle through the MUI colors

                return (
                  <Chip
                    key={index}
                    label={role}
                    size='small'
                    variant='tonal'
                    className='capitalize'
                    color={color} // Use dynamic color from MUI palette
                    style={{
                      fontSize: '10px',
                      padding: '0px'
                    }}
                  />
                )
              })}
            </Stack>
          )
        }
      }),

      columnHelper.accessor('createdDate', {
        header: 'Created Date',
        cell: ({ row }) => (
          <Typography variant='body2'>
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
        cell: ({ row }) => <Typography variant='body2'>{row.original.createdBy}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip
              title='Edit'
              onClick={() => handleEditFeature(row.original)}
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
          </div>
        ),
        enableSorting: false
      })
    ],
    [roles] // Ensure roles are passed as a dependency to update dynamically
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

  const handleEditFeature = feature => {
    setEditValue(feature) // Pass the entire feature object or just the necessary fields
    setOpen(true) // Open the dialog
  }

  const handleAddFeature = () => {
    setEditValue(null)
    setOpen(true) // Open the dialog
  }

  const buttonProps = {
    variant: 'contained',
    component: 'label',
    style: { color: 'white' },
    children: 'Add Feature',
    onClick: handleAddFeature,
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
                <i className='ri-lock-unlock-line' style={{ fontSize: '28px', color: 'white' }} />
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
                Features & Permissions
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
              Define and manage feature permissions to control access across your application
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
                placeholder='Search Features'
                fullWidth
                sx={{ maxWidth: { sm: '400px' } }}
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
                onClick={handleAddFeature}
                startIcon={<i className='ri-add-line' />}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                Add Feature
              </Button>
            </div>
          </CardContent>

          <Divider />

          <div className='px-4 sm:px-6 py-3'>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} feature{data?.length !== 1 ? 's' : ''}
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
                        <i className='ri-shield-keyhole-line' style={{ fontSize: '48px', opacity: 0.5 }} />
                        <Typography variant='h6' color='text.secondary'>
                          No features found
                        </Typography>
                        <Typography variant='body2' color='text.disabled'>
                          Add your first feature to get started
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
        </Card>

        {/* Dialog for editing and adding features */}
        <FeatureDialog open={open} setOpen={setOpen} data={editValue} onSuccess={refreshData} />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          type='delete-feature' // Set the type based on your context
          onConfirm={handleDelete}
        />
      </Container>
    </Box>
  )
}

export default FeaturesTable
