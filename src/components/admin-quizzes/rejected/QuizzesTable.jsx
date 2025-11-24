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
  Checkbox,
  Box,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
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

const ActionsMenu = ({ anchorEl, handleClose, handleAction, isMobile = false }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: isMobile ? 'right' : 'left'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: isMobile ? 'right' : 'left'
    }}
    PaperProps={{
      sx: {
        mt: 1,
        minWidth: 180,
        maxWidth: 220,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderRadius: 2,
        zIndex: 9999,
        marginRight: isMobile ? 1 : 0
      }
    }}
    MenuListProps={{
      sx: {
        py: 0.5
      }
    }}
  >
    <MenuItem
      dense
      onClick={() => handleAction('approve')}
      sx={{
        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
        py: { xs: 1, sm: 0.75 }
      }}
    >
      <ListItemIcon>
        <VerifiedOutlinedIcon sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
      </ListItemIcon>
      <ListItemText primary='Approve' />
    </MenuItem>
    <MenuItem
      dense
      onClick={() => handleAction('pending')}
      sx={{
        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
        py: { xs: 1, sm: 0.75 }
      }}
    >
      <ListItemIcon>
        <ReplyOutlinedIcon sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
      </ListItemIcon>
      <ListItemText primary='Move to pending' />
    </MenuItem>
  </Menu>
)

const AdminRejectedQuizzesTable = ({ data, refreshData }) => {
  const { data: session } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})

  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState(null)
  const [currentRow, setCurrentRow] = useState(null) // row.original
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)

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
    if (action === 'approve') {
      handleApproveQuiz()
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
    setConfirmationDialogOpen(true)
  }

  async function handleApproveQuiz() {
    const reqBody = {
      id: currentRow._id,
      approvalState: 'approved',
      approvedBy: session?.user?.email
    }
    try {
      const result = await approveQuiz(reqBody)
      if (result.status === 'success') {
        await refreshData()
      } else {
        console.error('Error approving quiz:', result)
      }
    } catch (error) {
      console.error('Error approving quiz:', error)
    }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3, md: 4 } }}>
            <Box
              sx={{
                width: { xs: 40, sm: 45, md: 50 },
                height: { xs: 40, sm: 45, md: 50 },
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'grey.100',
                flexShrink: 0
              }}
            >
              <Image
                src={row.original.thumbnail || '/images/misc/image-placeholder.png'}
                alt='thumbnail'
                width={50}
                height={50}
                unoptimized
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                onError={e => {
                  e.target.src = '/images/misc/image-placeholder.png'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography
                variant='h6'
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {row.original.title}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  mt: 0.25
                }}
              >
                {row.original.details}
              </Typography>
            </Box>
          </Box>
        )
      }),
      columnHelper.accessor('owner', {
        header: 'Owner',
        cell: ({ row }) => (
          <Typography
            variant='body2'
            color='text.primary'
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: '120px', sm: '150px', md: '200px' }
            }}
          >
            {row.original.owner}
          </Typography>
        )
      }),
      columnHelper.accessor('languages', {
        header: 'Languages',
        cell: ({ row }) => {
          const languages = [
            row.original.language?.name,
            ...(row.original.secondaryLanguages || []).map(lang => lang.name)
          ].filter(Boolean)
          const muiColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']

          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {languages.map((lang, index) => (
                <Chip
                  key={lang}
                  variant='tonal'
                  label={lang}
                  color={muiColors[index % muiColors.length]}
                  size='small'
                  sx={{
                    fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                    height: { xs: 20, sm: 24 },
                    '& .MuiChip-label': {
                      px: { xs: 0.75, sm: 1 }
                    }
                  }}
                />
              ))}
            </Box>
          )
        }
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip title={'View'}>
              <Link href={`/management/user-quizzes/view/${row.original._id}`} className='flex'>
                <i className='ri-eye-line text-[22px] text-textSecondary' />
              </Link>
            </IconButtonTooltip>
            <IconButtonTooltip title={'Actions'} onClick={e => handleOpenActionsMenu(e, row)}>
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

  const filteredRows = table.getFilteredRowModel().rows

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, sm: '16px' },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '2px solid #f5f5f5'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 3 }
        }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search quizzes...'
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#666', fontSize: { xs: '1.1rem', sm: '1.3rem' } }} />
          }}
          sx={{
            width: { xs: '100%', sm: '70%', md: '60%' },
            minWidth: { xs: '100%', sm: '400px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: { xs: '12px', sm: '15px' },
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderColor: '#d0d0d0',
                borderWidth: '2px',
                transition: 'all 0.3s ease'
              },
              '&:hover': {
                '& fieldset': {
                  borderColor: '#667eea',
                  borderWidth: '2px'
                }
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                '& fieldset': {
                  borderColor: '#667eea !important',
                  borderWidth: '2px'
                }
              }
            },
            '& .MuiInputBase-input': {
              padding: { xs: '10px 16px 10px 6px', sm: '12px 20px 12px 8px' },
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
              '&:focus': {
                outline: 'none'
              }
            }
          }}
        />
      </CardContent>
      <CardContent sx={{ px: { xs: 1.5, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        {filteredRows.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 4, sm: 6 },
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <i className='ri-quiz-line' style={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant='h6' color='text.secondary' sx={{ mt: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              No quizzes found
            </Typography>
            <Typography variant='body2' color='text.disabled' sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        ) : isMobile ? (
          <Box
            sx={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: 6
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: alpha(theme.palette.divider, 0.1),
                borderRadius: 8
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 8,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.5)
                }
              }
            }}
          >
            <Stack spacing={2}>
              {filteredRows.map(row => {
                const languages = [
                  row.original.language?.name,
                  ...(row.original.secondaryLanguages || []).map(lang => lang.name)
                ].filter(Boolean)
                const muiColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success']

                return (
                  <Box
                    key={row.id}
                    sx={{
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.2,
                      background: '#fff',
                      position: 'relative'
                    }}
                  >
                    {/* Thumbnail and Title */}
                    <Stack direction='row' spacing={2} alignItems='flex-start'>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          bgcolor: 'grey.100',
                          flexShrink: 0
                        }}
                      >
                        <Image
                          src={row.original.thumbnail || '/images/misc/image-placeholder.png'}
                          alt='quiz thumbnail'
                          width={60}
                          height={60}
                          unoptimized
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          onError={e => {
                            e.target.src = '/images/misc/image-placeholder.png'
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {row.original.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {row.original.details}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Owner */}
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                        Owner
                      </Typography>
                      <Typography variant='body2' color='text.primary' sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                        {row.original.owner}
                      </Typography>
                    </Stack>

                    {/* Languages */}
                    {languages.length > 0 && (
                      <Stack spacing={0.5}>
                        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                          Languages
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          {languages.map((lang, index) => (
                            <Chip
                              key={lang}
                              variant='tonal'
                              label={lang}
                              color={muiColors[index % muiColors.length]}
                              size='small'
                              sx={{
                                fontSize: '0.6875rem',
                                height: 24,
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Stack>
                    )}

                    {/* Actions */}
                    <Stack direction='row' spacing={1} sx={{ mt: 0.5 }}>
                      <Button
                        variant='outlined'
                        size='small'
                        component={Link}
                        href={`/management/user-quizzes/view/${row.original._id}`}
                        sx={{
                          textTransform: 'none',
                          flex: 1,
                          fontSize: '0.8125rem',
                          py: 0.75
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant='contained'
                        component='label'
                        size='small'
                        sx={{
                          textTransform: 'none',
                          flex: 1,
                          color: 'white',
                          fontSize: '0.8125rem',
                          py: 0.75
                        }}
                        onClick={e => handleOpenActionsMenu(e, row)}
                      >
                        Actions
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
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      <Box
                        sx={{
                          padding: '48px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <i className='ri-quiz-line' style={{ fontSize: 48, opacity: 0.5 }} />
                        <Typography variant='h6' color='text.secondary'>
                          No quizzes found
                        </Typography>
                        <Typography variant='body2' color='text.disabled'>
                          Try adjusting your search or filter criteria
                        </Typography>
                      </Box>
                    </td>
                  </tr>
                ) : (
                  filteredRows
                    .slice(
                      table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
                    )
                    .map((row, index) => (
                      <tr
                        key={row.id}
                        className={classnames({ selected: row.getIsSelected() })}
                        style={{
                          background: row.getIsSelected()
                            ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(211, 47, 47, 0.15) 100%)'
                            : index % 2 === 0
                              ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(211, 47, 47, 0.03) 100%)'
                              : 'white',

                          borderLeft: '3px solid transparent'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, rgba(244, 67, 54, 0.12) 0%, rgba(211, 47, 47, 0.12) 100%)'
                          e.currentTarget.style.borderLeft = '3px solid #f44336'
                        }}
                        onMouseLeave={e => {
                          if (!row.getIsSelected()) {
                            e.currentTarget.style.background =
                              index % 2 === 0
                                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(211, 47, 47, 0.03) 100%)'
                                : 'white'
                            e.currentTarget.style.borderLeft = '3px solid transparent'
                          }
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination component - Only show on desktop/tablet */}
        {!isMobile && (
          <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component='div'
              count={filteredRows.length}
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
                '& .MuiTablePagination-toolbar': {
                  px: { xs: 1, sm: 2 },
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: { xs: 1, sm: 0 }
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Box>
        )}
      </CardContent>

      <ActionsMenu
        anchorEl={anchorEl}
        handleClose={handleCloseActionsMenu}
        handleAction={handleAction}
        isMobile={isMobile}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        type='move-quiz-to-pending' // Customize based on your context
        onConfirm={handleMoveToPending}
      />
    </Card>
  )
}

export default AdminRejectedQuizzesTable
