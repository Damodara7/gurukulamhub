'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'

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
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import EditEventUserDialog from './EditEventUserDialog'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import IconButtonTooltip from '../IconButtonTooltip'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// Column Definitions
const columnHelper = createColumnHelper()

const EventUserTable = ({ data, refreshData }) => {
  // States
  //   const [role, setRole] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [globalFilter, setGlobalFilter] = useState('')

  const [editData, setEditData] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('name', {
        header: 'User',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-4'>
              {getAvatar({ avatar: row.original.image, fullName: row.original.name })}
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {row.original.name}
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('mobileNumber', {
        header: 'Mobile',
        cell: ({ row }) => <Typography>{row.original.mobileNumber}</Typography>
      }),
      columnHelper.accessor('fatherOrHusbandName', {
        header: 'Father/Husband',
        cell: ({ row }) => <Typography>{row.original.fatherOrHusbandName}</Typography>
      }),
      columnHelper.accessor('village', {
        header: 'Village',
        cell: ({ row }) => <Typography>{row.original.village}</Typography>
      }),
      columnHelper.accessor('taluka', {
        header: 'Taluka',
        cell: ({ row }) => <Typography>{row.original.taluka}</Typography>
      }),
      columnHelper.accessor('district', {
        header: 'District',
        cell: ({ row }) => <Typography>{row.original.district}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip  title='Delete' onClick={() => handleDeleteConfirmation(row.original)}>
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            {/* <IconButtonTooltip title='' onClick={() => handleView(row.original)}>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButtonTooltip> */}
            <IconButtonTooltip title='Edit' onClick={() => handleEdit(row.original)}>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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

  const handleEdit = rowData => {
    setEditData(rowData)
    setOpenDialog(true)
  }

  // Function to handle Delete confirmation
  const handleDeleteConfirmation = rowData => {
    setConfirmationDialogOpen(true) // Open confirmation dialog
    setCurrentRow(rowData)
  }

  // Function to handle the actual delete operation
  const handleDelete = async () => {
    if (currentRow) {
      try {
        // console.log('Deleting', cur)
        const result = await RestApi.del(`${API_URLS.v0.EVENT_USER}?id=${currentRow._id}`) // Adjust the URL as needed
        if (result?.status === 'success') {
          console.log(`Event user deleted: ${currentRow.name}`)
          await refreshData() // Refresh data after deletion
        } else {
          console.log('Error deleting Event user:', result?.message)
          // You might want to show a user-friendly error message here
        }
      } catch (error) {
        console.error('An error occurred while deleting the Event user:', error)
        throw new Error(error) // handling in Confirmation dialog
        // Handle error (e.g., show a notification)
      }
    }
    setConfirmationDialogOpen(false) // Close confirmation dialog
  }

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName)}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
        <div className='flex gap-4 flex-col !items-start is-full sm:flex-row sm:is-auto sm:items-center'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='is-full sm:is-auto min-is-[220px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
          />
          {/* <FormControl size='small' className='is-full sm:is-auto'>
            <InputLabel id='roles-app-role-select-label'>Select Role</InputLabel>
            <Select
              value={role}
              onChange={e => setRole(e.target.value)}
              label='Select Role'
              id='roles-app-role-select'
              labelId='roles-app-role-select-label'
              className='min-is-[150px]'
            >
              <MenuItem value=''>Select Role</MenuItem>
              {rolesData?.map(role => {
                return (
                  <MenuItem key={role._id} value={role.name}>
                    {role.name}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl> */}
        </div>
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
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
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

      <EditEventUserDialog open={openDialog} setOpen={setOpenDialog} userData={editData} refreshData={refreshData} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='delete-user' // Set the type based on your context
        onConfirm={handleDelete}
      />
    </Card>
  )
}

export default EventUserTable
