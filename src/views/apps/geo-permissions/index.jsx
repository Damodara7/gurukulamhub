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
import useMediaQuery from '@mui/material/useMediaQuery'

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
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import GeoFeatureDialog from '@/components/dialogs/geo-permission-dialog/Geo-Permission-Dailog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import * as clientApi from '../../../app/api/client/client.api'
import { useSession } from 'next-auth/react'
import { roleSliceActions } from '@/store/features/roleSlice'
import IconButtonTooltip from '@/components/IconButtonTooltip'
import { toast } from 'react-toastify'
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

// Custom global filter that only searches by feature name
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
    {/* <MenuItem dense onClick={() => handleAction('assign')}>
      <ListItemIcon>
        <AssignmentOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary='Assign To' />
    </MenuItem> */}
  </Menu>
)

const GeoFeaturesTable = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
    const result = await RestApi.get(`${API_URLS.v0.GEO_FEATURE}`)
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
    const result = await RestApi.get(`${API_URLS.v0.GEO_ROLE}`)
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
        const result = await RestApi.del(`${API_URLS.v0.GEO_FEATURE}?id=${currentFeature._id}`, {
          email: session?.user?.email || null
        })
        if (result?.status === 'success') {
          console.log(`Geo-Feature deleted: ${currentFeature.name}`)
          toast.success(`Geo-Feature deleted: ${currentFeature.name}`)
          await refreshData() // Refresh data after deletion
        } else {
          console.log('Error deleting Geo-Feature:', result?.message)
          toast.error(result?.message || 'Error deleting Geo-Feature')
          // You might want to show a user-friendly error message here
        }
      } catch (error) {
        console.error('An error occurred while deleting the Geo-Feature:', error)
        toast.error('Error deleting Geo-Feature')
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
          <div className='flex items-center gap-2'>
            <IconButtonTooltip
              title='Edit'
              onClick={() => handleEditFeature(row.original)}
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
                setCurrentFeature(row.original)
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
    [roles] // Ensure roles are passed as a dependency to update dynamically
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
    children: 'Add Geo-Feature',
    onClick: handleAddFeature,
    className: 'is-full sm:is-auto'
  }

  return (
    <Box
      sx={{
        height: '100%',
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
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.8 : 0.7),
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
                <i className='ri-global-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Geo-Features & Permissions
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
              Define and manage geographical feature permissions for location-based access control
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            background: theme.palette.background.paper,
            boxShadow: theme => theme.shadows[3],
            borderRadius: 3,
            overflow: 'hidden',
            border: theme => `1px solid ${theme.palette.divider}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme => theme.shadows[6]
            },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <div className='flex justify-between items-center flex-col sm:flex-row gap-4'>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search Geo-Features'
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
                Add Geo-Feature
              </Button>
            </div>
          </CardContent>

          <Divider />

          <div className='px-4 sm:px-6 py-3'>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total {data?.length || 0} geo-feature{data?.length !== 1 ? 's' : ''}
            </Typography>
          </div>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <i className='ri-global-line' style={{ fontSize: 48, opacity: 0.5 }} />
                <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
                  No geo-features found
                </Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 1 }}>
                  Add your first geo-feature to get started
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
                    const feature = row.original
                    const rolesForFeature = getRolesForFeature(feature._id)

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
                          {feature.name}
                        </Typography>
                        <Stack spacing={0.5}>
                          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                            Permissions
                          </Typography>
                          <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                            {feature.permissions?.map((permission, index) => {
                              const chipColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']
                              const color = chipColors[index % chipColors.length]

                              return (
                                <Chip
                                  key={index}
                                  label={permission}
                                  variant='tonal'
                                  color={color}
                                  size='small'
                                  sx={{ fontSize: '0.7rem', height: '24px' }}
                                  className='uppercase'
                                />
                              )
                            })}
                          </Stack>
                        </Stack>

                        {rolesForFeature.length > 0 && (
                          <Stack spacing={0.5}>
                            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                              Assigned To
                            </Typography>
                            <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                              {rolesForFeature.map((role, index) => {
                                const chipColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']
                                const color = chipColors[index % chipColors.length]

                                return (
                                  <Chip
                                    key={index}
                                    label={role}
                                    size='small'
                                    variant='tonal'
                                    className='capitalize'
                                    color={color}
                                    sx={{ fontSize: '0.7rem', height: '24px' }}
                                  />
                                )
                              })}
                            </Stack>
                          </Stack>
                        )}

                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant='caption' color='text.secondary'>
                            Created:{' '}
                            {new Date(feature.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                            ,{' '}
                            {new Date(feature.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            CreatedBy: {feature.createdBy || 'N/A'}
                          </Typography>
                        </Stack>
                        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                          <Button
                            variant='outlined'
                            color='primary'
                            size='small'
                            onClick={() => handleEditFeature(feature)}
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
                              setCurrentFeature(feature)
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
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
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
              </Box>
              </Box>
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

        {/* Dialog for editing and adding features */}
        <GeoFeatureDialog open={open} setOpen={setOpen} data={editValue} onSuccess={refreshData} />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationDialogOpen}
          setOpen={setConfirmationDialogOpen}
          type='delete-feature' // Set the type based on your context
          onConfirm={handleDelete}
        />
      </Box>
    </Box>
  )
}

export default GeoFeaturesTable
