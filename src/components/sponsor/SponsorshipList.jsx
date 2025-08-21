'use client'

// React Imports
import React, { useState, useMemo, useEffect } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'

import TabContext from '@mui/lab/TabContext'
import CustomTabList from '@/@core/components/mui/TabList'

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

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { Box, Divider, Grid, Tab, Tooltip } from '@mui/material'
import { revalidatePath } from 'next/cache'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'

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

const SponsorshipList = ({ tableData, sponsorType = 'all' }) => {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState({})

  const [data, setData] = useState(...[tableData])
  const [globalFilter, setGlobalFilter] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () =>
      [
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
        // (sponsorType === 'all' || sponsorType === 'game') && {
        {
          id: 'games',
          ...columnHelper.accessor('games', {
            header: 'Sponsored Games',
            cell: ({ row }) => {
              return <Typography variant='body1'>{row.original?.games?.join(', ') || <span style={{fontSize: '0.85rem', fontStyle: 'italic'}}>Any game</span>}</Typography>
            }
          })
        },
        // (sponsorType === 'all' || sponsorType === 'quiz') && {
          {
          id: 'quizzes',
          accessorFn: row => row.quizzes?.map(q => q.title).join(', ') || '',
          ...columnHelper.accessor('quizzes', {
            header: 'Sponsored Quizzes',
            cell: ({ row }) => {
              return (
                <Typography variant='body1'>{row.original?.quizzes?.map(q => q.title).join(', ') || <span style={{fontSize: '0.85rem', fontStyle: 'italic'}}>Any quiz</span>}</Typography>
              )
            }
          })
        },
        // (sponsorType === 'all' || sponsorType === 'area' || sponsorType === 'quiz') && {
          {
          id: 'location',
          ...columnHelper.accessor('location', {
            header: 'Sponsored By Area',
            cell: ({ row }) => {
              let area = ``
              if (row.original?.location?.country) {
                area += ` ${row.original?.location?.country}`
              }
              if (row.original?.location?.region) {
                area += `, ${row.original?.location?.region}`
              }
              if (row.original?.location?.city) {
                area += `, ${row.original?.location?.city}`
              }
              return <Typography variant='body1'>{area || <span style={{fontSize: '0.85rem', fontStyle: 'italic'}}>Any location</span>}</Typography>
            }
          })
        },
        {
          id: 'rewardType',
          ...columnHelper.accessor('rewardType', {
            header: 'Reward Type',
            cell: ({ row }) => (
              <Typography variant='body1' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {row.original.rewardType === 'cash' ? (
                  <>
                    <AttachMoneyIcon fontSize='small' sx={{ color: 'success.main' }} />
                    Cash
                  </>
                ) : (
                  <>
                    <CardGiftcardIcon fontSize='small' sx={{ color: 'warning.main' }} />
                    Physical Gift
                  </>
                )}
              </Typography>
            )
          })
        },
        {
          id: 'rewardDetails',
          ...columnHelper.accessor('rewardDetails', {
            header: 'Reward Details',
            cell: ({ row }) => {
              const { rewardType, currency } = row.original;
              
              if (rewardType === 'cash') {
                const formattedAmount = new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: currency || 'INR'
                }).format(row.original?.sponsorshipAmount || 0);
                return <Typography variant='body1'>{formattedAmount}</Typography>;
              } else {
                // For physical gifts
                const formatCurrency = (value) => (
                  new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: currency || 'INR'
                  }).format(value || 0)
                );
        
                return (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant='body1' noWrap>
                      {row.original.nonCashItem || 'Physical Gift'}
                    </Typography>
                    <Typography variant='caption' fontSize={'0.75rem'} color='text.secondary' noWrap>
                      {row.original.numberOfNonCashItems || 0} × {formatCurrency(row.original.rewardValuePerItem || 0)}
                    </Typography>
                    <Typography variant='caption' fontSize={'0.75rem'} color='text.secondary' noWrap>
                      Total: {formatCurrency(row.original.rewardValue || 0)}
                    </Typography>
                  </Box>
                );
              }
            }
          })
        },
        {
          id: 'usage',
          header: 'Usage',
          cell: ({ row }) => {
            const {
              rewardType,
              currency,
              sponsorshipAmount,
              availableAmount,
              numberOfNonCashItems,
              availableItems,
              sponsored
            } = row.original

            const formatCurrency = (value, curr) =>
              new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: curr || 'INR'
              }).format(value || 0)

            const SponsoredDetailsTooltipContent = () => {
              if (!sponsored || sponsored.length === 0) {
                return <Typography variant='caption' sx={{ color: 'white' }}>Not used in any game yet.</Typography>
              }

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, color: 'white' }}>
                    Sponsorship Usage Breakdown
                  </Typography>
                  {sponsored.map((s, index) => {
                    const usedAmount = s.rewardSponsorships?.reduce((acc, rs) => acc + rs.allocated, 0) || 0

                    return (
                      <React.Fragment key={index}>
                        <div className='flex flex-col gap-0'>
                          <Typography
                            variant='body2'
                            component='div'
                            sx={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: 0.5, cursor: s.game?._id ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (s.game?._id) {
                                router.push(`/public-games/${s.game._id}`)
                              }
                            }}
                          >
                            Game: {s.game?.title || 'N/A'}
                            {s.game?._id && <i className='ri-external-link-line' style={{ fontSize: '1em', marginLeft: 4 }} />}
                          </Typography>
                          <Typography variant='caption' component='div' sx={{ color: 'white', ml: 1 }}>
                            Quiz: {s.game?.quiz?.title || 'N/A'}
                          </Typography>
                          <Typography variant='caption' component='div' sx={{ color: 'white', ml: 1 }}>
                            Used: {rewardType === 'cash' ? formatCurrency(usedAmount, currency) : `${usedAmount} ${usedAmount === 1 ? 'item' : 'items'}`}
                          </Typography>
                        </div>
                        {index < sponsored.length - 1 && (
                          <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.42)' }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </Box>
              )
            }

            if (rewardType === 'cash') {
              const usedAmount = (sponsorshipAmount || 0) - (availableAmount || 0)

              return (
                <Tooltip title={<SponsoredDetailsTooltipContent />} placement='right'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <Typography variant='body2'>
                      {formatCurrency(usedAmount, currency)} / {formatCurrency(sponsorshipAmount, currency)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Available: {formatCurrency(availableAmount, currency)}
                    </Typography>
                  </Box>
                </Tooltip>
              )
            } else {
              // For physical gifts
              const usedItems = (numberOfNonCashItems || 0) - (availableItems || 0)

              return (
                <Tooltip title={<SponsoredDetailsTooltipContent />} placement='right'>
                  <Box sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    <Typography variant='body2'>
                      {usedItems} / {numberOfNonCashItems || 0} {usedItems === 1 ? 'item' : 'items'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Available: {availableItems || 0} {availableItems === 1 ? 'item' : 'items'}
                    </Typography>
                  </Box>
                </Tooltip>
              )
            }
          }
        },
        {
          id: 'status',
          ...columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ row }) => {
              const { rewardType, sponsorshipStatus, nonCashSponsorshipStatus, nonCashSponsorshipRejectionReason, rejectorEmail } = row.original
              const status = rewardType === 'cash' ? sponsorshipStatus : nonCashSponsorshipStatus
              const statusColor = {
                created: 'default',
                pending: 'warning',
                failed: 'error',
                completed: 'success',
                expired: 'secondary',
                rejected: 'error'
              }[status] || 'default'
              
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip size='small' color={statusColor} label={status} />
                  {status === 'pending' && rewardType === 'physicalGift' && (
                    <Typography variant='caption' color='warning.main' sx={{ fontSize: '0.75rem' }}>
                      Awaiting admin response
                    </Typography>
                  )}
                  {status === 'rejected' && rewardType === 'physicalGift' && (
                    <>
                      {rejectorEmail && nonCashSponsorshipRejectionReason && (
                        <Tooltip 
                          title={
                            <Box sx={{ p: 1 }}>
                              <Typography variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                                <strong>Rejected by:</strong> {rejectorEmail}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                <strong>Reason:</strong> {nonCashSponsorshipRejectionReason}
                              </Typography>
                            </Box>
                          } 
                          placement="top"
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, cursor: 'pointer' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.6rem',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              >
                                {rejectorEmail.charAt(0).toUpperCase()}
                              </Box>
                              <Typography 
                                variant='caption' 
                                color='text.secondary' 
                                sx={{ 
                                  fontSize: '0.75rem', 
                                  maxWidth: '150px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {rejectorEmail}
                              </Typography>
                            </Box>
                            <Typography 
                              variant='caption' 
                              color='error.main' 
                              sx={{ 
                                fontSize: '0.75rem',
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {nonCashSponsorshipRejectionReason}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              )
            }
          })
        }
      ].filter(Boolean),
    [sponsorType]
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
    <>
      <Box className='mb-2 flex justify-center'>
        <TabContext value={sponsorType}>
          <CustomTabList
            onChange={(e, val) => {
              //   revalidatePath('/sponsor/list', 'page')
              let url = `/sponsor/list`
              if (val !== 'all') {
                url += `?sponsorType=${val}`
              }
              router.push(url)
            }}
            variant='scrollable'
            pill='true'
            scrollButtons='auto'
            allowScrollButtonsMobile
          >
            <Tab
              value='all'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <DraftsOutlinedIcon /> */}
                  All
                </div>
              }
            />
            {/* Commented out games, quizzes, and area tabs as requested
            <Tab
              value='game'
              label={
                <div className='flex items-center gap-1.5'>
                  <DraftsOutlinedIcon />
                  Games
                </div>
              }
            />
            <Tab
              value='quiz'
              label={
                <div className='flex items-center gap-1.5'>
                  <PendingActionsOutlinedIcon />
                  Quizzes
                </div>
              }
            />
            <Tab
              value='area'
              label={
                <div className='flex items-center gap-1.5'>
                  <PendingActionsOutlinedIcon />
                  Area
                </div>
              }
            />
            */}
            <Tab
              value='awaiting'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <PendingActionsOutlinedIcon /> */}
                  Awaiting Admin Response
                </div>
              }
            />
            <Tab
              value='rejected'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <CancelOutlinedIcon /> */}
                  Rejected
                </div>
              }
            />
          </CustomTabList>
        </TabContext>
      </Box>
      <Card>
        <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
          <Typography variant='h5'>Your Sponsorships</Typography>
          <div className='flex flex-col sm:flex-row justify-end gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search User'
              className='is-full sm:is-auto'
            />
          </div>
        </CardContent>
        <Divider />
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
      </Card>
    </>
  )
}

export default SponsorshipList
