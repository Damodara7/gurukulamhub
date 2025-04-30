'use client'

import './AdvListTable.css'

/********** Standard imports.*********************/
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  TextField,
  Button,
  Typography,
  Card,
  CardHeader,
  TablePagination,
  Divider,
  IconButton,
  Chip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { styled } from '@mui/material/styles'
/********************************************/
import { toast } from 'react-toastify'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

// Third-party Imports
import { format, addDays } from 'date-fns'
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
import TableFilters from './TableFilters'
import AddAdvDrawer from './AddAdvDrawer'
import OptionMenu from '@core/components/option-menu'
// import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import VideoAd from '../VideoAd/VideoAd'
import Loading from '@/components/Loading'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Styled Components
const Icon = styled('i')({})

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

// Vars
const userRoleObj = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

const ImageComponent = ({ imageUrl, onClick }) => {
  return (
    <div>
      <img
        src={imageUrl}
        style={{ objectFit: 'cover', cursor: 'pointer', maxWidth: '250px', maxHeight: '40px' }}
        alt='Image'
        onClick={onClick}
      />
    </div>
  )
}

const ImagePopup = ({ imageUrl, mediaType }) => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      {mediaType === 'image' ? (
        <ImageComponent imageUrl={imageUrl} onClick={handleClickOpen} />
      ) : (
        <div onClick={handleClickOpen}>
          <a style={{ display: 'flex', alignItems: 'center' }} href='#'>
            {' '}
            <i className='ri-artboard-fill'></i>Open Video popup{' '}
          </a>
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Media Preview</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {mediaType === 'video' ? (
              <VideoAd url={imageUrl} width={'50vw'} height={'50vh'} showPause autoPlay={false}></VideoAd>
            ) : (
              <img src={imageUrl} alt='Enlarged Image' style={{ width: '100%' }} />
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const AdvListTable = () => {
  // States
  const [addAdvtOpen, setAddAdvtOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState({ fetchAds: false, deleteAds: false })
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [advtEditOrAddInitialData, setAdvtEditOrAddInitialData] = useState(null)
  const [id, setId] = useState()
  const [mode, setMode] = useState('add')

  const getData = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetchAds: true }));
    const result = await RestApi.get(ApiUrls.v0.ADMIN_GET_ADVERTISEMENT);

    if (result?.status === 'success') {
      console.log('Advts Fetched result', result);
      setLoading(prev => ({ ...prev, fetchAds: false }));
      console.log('Advts Fetched result', result.result);
      setData(result.result);
    } else {
      toast.error('Error Loading Advertisements:' + result.message);
      setLoading(prev => ({ ...prev, fetchAds: false }));
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleDelete = async (e, id) => {
    e.preventDefault()

    console.log('Deleting the advt.')
    const result = await RestApi.del(ApiUrls.v0.ADMIN_DEL_ADVERTISEMENT + '?id=' + id)
    setLoading(prev => ({ ...prev, deleteAds: true }))
    if (result.status === 'success') {
      console.log('Delete  result', result.result.result)
      // toast.success('Advt deleted .')
      setData(result.result.result)
      setLoading(prev => ({ ...prev, deleteAds: false }))
      // handleClose();
    } else {
      // toast.error('Error:' + result.message)
      setLoading(prev => ({ ...prev, deleteAds: false }))
    }
  }

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
      columnHelper.accessor('userName', {
        header: 'User / Company',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {/* {getAvatar({ avatar: row.original.avatar, userName: row.original.userName })} */}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.userName}
              </Typography>
              <Typography variant='body2'>{row.original.company}</Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      // columnHelper.accessor('_id', {
      //   header: 'Id',
      //   cell: ({ row }) => <Typography>{row.original._id}</Typography>
      // }),
      columnHelper.accessor('startDate', {
        header: 'Start Date',
        cell: ({ row }) => <Typography>{format(row.original.startDate, 'MM/dd/yyyy')}</Typography>
      }),
      columnHelper.accessor('endDate', {
        header: 'end Date',
        cell: ({ row }) => <Typography>{format(row.original.endDate, 'MM/dd/yyyy')}</Typography>
      }),
      columnHelper.accessor('imageUrl', {
        header: 'Image Url',
        cell: ({ row }) => (
          <div className='flex flex-col items-center gap-2'>
            {/* <Icon
              className={userRoleObj[row.original.role].icon}
              sx={{ color: `var(--mui-palette-${userRoleObj[row.original.imageUrl].color}-main)`, fontSize: '1.375rem' }}
            /> */}
            <Typography className='capitalize' color='text.primary'>
              {row.original.imageUrl}
            </Typography>

            {row.original?.mediaType === 'video' ? (
              <>
                <VideoAd url={row.original?.imageUrl} showPause autoPlay={false}></VideoAd>
                <ImagePopup imageUrl={row.original.imageUrl} mediaType={row.original.mediaType} />
              </>
            ) : (
              <ImagePopup imageUrl={row.original.imageUrl} mediaType={row.original.mediaType} />
            )}
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              className='capitalize'
              label={row.original.status}
              color={userStatusObj[row.original.status]}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButtonTooltip title='Delete'
              onClick={e => {
                console.log('advt to be deleted id ...', row.original._id)
                setId(row.original._id)
                handleDelete(e, row.original._id)
              }}
            >
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            <IconButtonTooltip title='Edit'
              onClick={e => {
                setAdvtEditOrAddInitialData(row.original)
                setMode('edit')
                setAddAdvtOpen(!addAdvtOpen)
              }}
            >
              <i className='ri-edit-box-line  text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: 'Duplicate',
                  icon: 'ri-edit-box-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {
                      setAdvtEditOrAddInitialData(row.original)
                      setMode('add')
                      setAddAdvtOpen(!addAdvtOpen)
                    }
                  }
                },
                {
                  text: 'Hard Delete',
                  icon: 'ri-delete-bin-2-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => {}
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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

  if (loading.fetchAds){
    return <Loading/>;
  }

  return (
    <>
      <Card>
        {/* <CardHeader title='Filters' /> */}
        {/* <TableFilters setData={setData} tableData={data} /> */}
        <Divider />
        <div className='flex justify-between p-5 gap-4 flex-col items-start sm:flex-row sm:items-center'>
          <div className='flex items-center gap-x-4 is-full gap-4 flex-col sm:is-auto sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Advt'
              className='is-full sm:is-auto'
            />
            <Button
              variant='contained'
              style={{ color: 'white' }}
              component='label'
              onClick={() => {
                setAddAdvtOpen(!addAdvtOpen)
                setMode('add')
              }}
              className='is-full sm:is-auto'
            >
              Add New Advertisement
            </Button>
          </div>
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
            {table?.getFilteredRowModel()?.rows?.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table?.getVisibleFlatColumns().length} className='text-center'>
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
      {addAdvtOpen && (
        <AddAdvDrawer
          open={addAdvtOpen}
          mode={mode}
          handleClose={() => {
            setAddAdvtOpen(!addAdvtOpen)
            setAdvtEditOrAddInitialData(null)
          }}
          data={advtEditOrAddInitialData}
          onRefresh={()=>getData()}
        />
      )}
    </>
  )
}

export default AdvListTable
