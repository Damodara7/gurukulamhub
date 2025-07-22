'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Checkbox
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
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
import { rankItem } from '@tanstack/match-sorter-utils'
import tableStyles from '@core/styles/table.module.css'
import TablePagination from '@mui/material/TablePagination'
import { approveQuiz, rejectQuiz, moveQuizToPending } from '@/actions/quiz'
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined'

// Third-party Imports
import classnames from 'classnames'
import {
  NewReleasesOutlined as NewReleasesOutlinedIcon,
  VerifiedOutlined as VerifiedOutlinedIcon
} from '@mui/icons-material'
import Link from 'next/link'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog/index'
import { useSession } from 'next-auth/react'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Custom fuzzy filter for global search
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Debounced input for global search
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
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

// Column helper instance for defining table columns
const columnHelper = createColumnHelper()

const ActionsMenu = ({ anchorEl, handleClose, handleAction }) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
    <MenuItem dense onClick={() => handleAction('pending')}>
      <ListItemIcon>
        {/* Replace with an icon for "Reject" */}
        <ReplyOutlinedIcon /> {/* Example icon */}
      </ListItemIcon>
      <ListItemText primary='Move to pending' />
    </MenuItem>
    <MenuItem dense onClick={() => handleAction('reject')}>
      <ListItemIcon>
        {/* Replace with an icon for "Reject" */}
        <NewReleasesOutlinedIcon /> {/* Example icon */}
      </ListItemIcon>
      <ListItemText primary='Reject' />
    </MenuItem>
  </Menu>
)

const AdminApprovedQuizzesTable = ({ data, refreshData }) => {
  const { data: session } = useSession()
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [currentRow, setCurrentRow] = useState(null) // row.original
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState({ reject: false, pending: false })

  const handleOpenActionsMenu = (event, row) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(row)
    setCurrentRow(row.original)
  }

  const handleCloseActionsMenu = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  const handleAction = action => {
    if (action === 'reject') {
      handleRejectQuizConfirmation()
      // const selectedIds = Object.keys(rowSelection).filter(_id => rowSelection[_id])
      // console.log('Selected Quiz IDs:', selectedIds)
      // Add delete logic here, e.g., call a delete function with selectedRow.id
    } else if (action === 'pending') {
      handleMoveToPendingConfirmation()
    }
    handleCloseActionsMenu()
  }

  async function handleMoveToPending() {
    const reqBody = {
      id: currentRow._id,
      approvalState: 'pending',
      approvedBy: session?.user?.email
    }
    try {
      const result = await moveQuizToPending(reqBody)
      if (result.status === 'success') {
        await refreshData()
      } else {
        console.error('Error moving quiz to pending:', result)
        throw new Error('Error moving quiz to pending.')
      }
    } catch (error) {
      console.error('Error moving quiz to pending:', error)
      throw new Error('Unknown error while moving quiz to pending.')
    }
  }

  async function handleMoveToPendingConfirmation() {
    setConfirmationDialogOpen(prev => ({ ...prev, pending: true }))
  }

  async function handleRejectQuiz() {
    const reqBody = {
      id: currentRow._id,
      approvalState: 'rejected',
      approvedBy: session?.user?.email
    }
    try {
      const result = await rejectQuiz(reqBody)
      if (result.status === 'success') {
        await refreshData()
      } else {
        console.error('Error rejecting quiz:', result)
        throw new Error('Error rejecting quiz.')
      }
    } catch (error) {
      console.error('Error rejecting quiz:', error)
      throw new Error('Unknown error while rejecting quiz.')
    }
  }

  async function handleRejectQuizConfirmation() {
    setConfirmationDialogOpen(prev => ({ ...prev, reject: true }))
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('selection', {
        header: ({ table }) => (
          <Checkbox
            onChange={e => {
              const checked = e.target.checked
              table.getRowModel().rows.forEach(row => {
                row.getToggleSelectedHandler()(checked)
              })
            }}
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
          />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
      }),
      columnHelper.accessor('title', {
        header: 'Quiz',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <Image src={row.original.thumbnail} alt='thumbnail' width={50} height={50} />
            <div className='flex flex-col'>
              <Typography variant='h6'>{row.original.title}</Typography>
              <Typography variant='body2' color='textSecondary'>
                {row.original.details}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('owner', {
        header: 'Owner',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.primary'>
            {row.original.owner}
          </Typography>
        )
      }),
      columnHelper.accessor('languages', {
        header: 'Languages',
        cell: ({ row }) => {
          const languages = [row.original.language.name, ...row.original.secondaryLanguages.map(lang => lang.name)]
          const muiColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] // Cycle of MUI colors

          return (
            <div className='flex gap-1 flex-wrap'>
              {languages.map((lang, index) => (
                <Chip
                  key={lang}
                  variant='tonal'
                  label={lang}
                  color={muiColors[index % muiColors.length]}
                  size='small'
                />
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip title={'Eye line'}>
              <Link href={`/management/quiz/view/${row.original._id}`} className='flex'>
                <i className='ri-eye-line text-[22px] text-textSecondary' />
              </Link>
            </IconButtonTooltip>
            <IconButtonTooltip title={'Open Action Menu'} onClick={e => handleOpenActionsMenu(e, row)}>
              <MoreVertIcon />
            </IconButtonTooltip>
          </div>
        )
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

  return (
    <Card>
      <CardContent className='flex justify-between gap-4 items-center'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Quiz'
        />
      </CardContent>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
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
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]} // Options for rows per page
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length} // Total number of rows
          rowsPerPage={table.getState().pagination.pageSize} // Rows per page from table state
          page={table.getState().pagination.pageIndex} // Current page from table state
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page) // Update the page index
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))} // Update the rows per page
        />
      </CardContent>

      <ActionsMenu anchorEl={anchorEl} handleClose={handleCloseActionsMenu} handleAction={handleAction} />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen.pending}
        setOpen={bool => setConfirmationDialogOpen(prev => ({ ...prev, pending: false }))}
        type='move-quiz-to-pending' // Customize based on your context
        onConfirm={handleMoveToPending}
      />
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen.reject}
        setOpen={bool => setConfirmationDialogOpen(prev => ({ ...prev, reject: false }))}
        type='reject-quiz' // Customize based on your context
        onConfirm={handleRejectQuiz}
      />
    </Card>
  )
}

export default AdminApprovedQuizzesTable
