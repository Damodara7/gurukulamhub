'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

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
import { Box, Divider, Grid, Tab } from '@mui/material'
import { revalidatePath } from 'next/cache'

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
        (sponsorType === 'all' || sponsorType === 'game') && {
          id: 'games',
          ...columnHelper.accessor('games', {
            header: 'Sponsored Games',
            cell: ({ row }) => {
              // console.log('row : ', row.original)
              return <Typography variant='body1'>{row.original?.games?.join(', ') || '-'}</Typography>
            }
          })
        },
        (sponsorType === 'all' || sponsorType === 'quiz') && {
          id: 'quizzes',
          accessorFn: row => row.quizzes?.map(q => q.title).join(', ') || '', // Flatten for searching
          ...columnHelper.accessor('quizzes', {
            header: 'Sponsored Quizzes',
            cell: ({ row }) => {
              return (
                <Typography variant='body1'>{row.original?.quizzes?.map(q => q.title).join(', ') || '-'}</Typography>
              )
            }
          })
        },
        (sponsorType === 'all' || sponsorType === 'area' || sponsorType === 'quiz') && {
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
              return <Typography variant='body1'>{area || '-'}</Typography>
            }
          })
        },
        columnHelper.accessor('sponsorshipAmount', {
          header: 'Amount',
          cell: ({ row }) => {
            const formattedAmount = new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: 'INR'
            }).format(row.original?.sponsorshipAmount)
            return <Typography variant='body1'>{formattedAmount}</Typography>
          }
        }),
        columnHelper.accessor('numberOfGames', {
          header: 'No. of Games',
          cell: ({ row }) => {
            return <Typography variant='body1'>{row.original.numberOfGames || 1}</Typography>
          }
        }),
        columnHelper.accessor('sponsorshipStatus', {
          header: 'Status',
          cell: ({ row }) => <Chip size='small' color='success' label={row.original.sponsorshipStatus} />
        })
      ].filter(Boolean), // This will filter out any falsy values (like the conditional column when false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sponsorType] // Add sponsorType to dependencies
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
            <Tab
              value='game'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <DraftsOutlinedIcon /> */}
                  Games
                </div>
              }
            />
            <Tab
              value='quiz'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <PendingActionsOutlinedIcon /> */}
                  Quizzes
                </div>
              }
            />
            <Tab
              value='area'
              label={
                <div className='flex items-center gap-1.5'>
                  {/* <PendingActionsOutlinedIcon /> */}
                  Area
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
