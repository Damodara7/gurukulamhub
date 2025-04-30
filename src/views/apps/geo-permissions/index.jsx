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
  ListItemText
} from '@mui/material'

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
import GeoFeatureDialog from '@/components/dialogs/geo-permission-dialog'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'

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

const GeoFeaturesTable = () => {
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
        const result = await RestApi.del(`${API_URLS.v0.GEO_FEATURE}?id=${currentFeature._id}`)
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
            <IconButtonTooltip title='Edit' onClick={() => handleEditFeature(row.original)}>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            {/* <IconButtonTooltip title='' onClick={e => handleMoreClick(e, row.original)}>
              <i className='ri-more-2-line text-[22px] text-textSecondary' />
            </IconButtonTooltip> */}
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
    <>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Features'
            className='is-full sm:is-auto'
          />
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={GeoFeatureDialog}
            dialogProps={{ editValue, onSuccess: refreshData }}
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
        {/* <ActionsMenu
          anchorEl={anchorEl}
          handleClose={handleClose}
          handleAction={action => {
            if (action === 'delete') {
              handleDeleteConfirmation()
            }
          }}
        /> */}
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
    </>
  )
}

export default GeoFeaturesTable
