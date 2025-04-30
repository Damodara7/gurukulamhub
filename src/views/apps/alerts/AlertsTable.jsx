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
import { DeleteOutline as DeleteOutlineIcon, Edit as EditIcon, Person as PersonIcon } from '@mui/icons-material'

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
    <MenuItem dense onClick={() => handleAction('edit')}>
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <ListItemText primary='Edit' />
    </MenuItem>
    <MenuItem dense onClick={() => handleAction('users')}>
      <ListItemIcon>
        <PersonIcon />
      </ListItemIcon>
      <ListItemText primary='Users' />
    </MenuItem>
  </Menu>
)

const AlertsTable = () => {
  // States
  // const dispatch = useAppDispatch()
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
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('alertType', {
        header: 'Alert Type',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.alertType}</Typography>
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

  const handleGoToAlertUsers = () => {
    router.push(`/apps/alerts/${currentRow._id}/users`)
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
    <>
      <Card>
        <CardContent className='flex flex-col gap-4 sm:flex-row items-start sm:items-center justify-between'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Alerts'
            className='is-full sm:is-auto'
          />
          <OpenDialogOnElementClick
            element={Button}
            elementProps={buttonProps}
            dialog={AlertDialog}
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
    </>
  )
}

export default AlertsTable
