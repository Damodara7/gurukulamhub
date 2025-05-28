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
import EditUserRoleDialog from './EditUserRoleDialog'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
// import { useAppDispatch } from '@/store/hooks'
import { roleSliceActions } from '@/store/features/roleSlice'
import * as clientApi from '@/app/api/client/client.api'

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
  ADMIN: { icon: 'ri-vip-crown-line', color: 'error' },
  USER: { icon: 'ri-user-3-line', color: 'primary' },
  "SUPER_USER": { icon: 'ri-shield-star-line', color: 'warning' },
}

const userStatusObj = {
  active: 'success',
  inactive: 'secondary',
  pending: 'warning'
}

// Column Definitions
const columnHelper = createColumnHelper()

const RolesTable = ({ tableData, refreshUsers }) => {
  // const dispatch = useAppDispatch()
  // States
  const [role, setRole] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [geoRolesData, setGeoRolesData] = useState([])
  const [rolesData, setRolesData] = useState([])

  const [data, setData] = useState(...[tableData])
  const [globalFilter, setGlobalFilter] = useState('')

  const [editData, setEditData] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)

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
      columnHelper.accessor('fullName', {
        header: 'User',
        cell: ({ row }) => {
          // console.log('row : ', row.original)
          const fullname = `${row.original.firstname || ''} ${row.original.lastname || ''}`
          return (
            <div className='flex items-center gap-4'>
              {getAvatar({ avatar: row.original.image, fullName: fullname })}
              <div className='flex flex-col'>
                <Typography variant='body1' className='font-medium' color='text.primary'>
                  {fullname || ''}
                </Typography>
                <Typography variant='body2'>{row.original.nickname}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('roles', {
        header: 'Roles',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-2'>
            {row.original.roles.map((role, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Icon
                  className={userRoleObj[role]?.icon}
                  sx={{ color: `var(--mui-palette-${userRoleObj[role]?.color}-main)`, fontSize: '1.375rem' }}
                />
                <Typography className='capitalize' color='text.primary'>
                  {role}
                </Typography>
                {index < row.original.roles.length - 1 && (
                  <Typography color='text.secondary' sx={{ mx: 0.5 }}>
                    |
                  </Typography>
                )}
              </div>
            ))}
          </div>
        )
      }),
      columnHelper.accessor('geoRoles', {
        header: 'Geo-Roles',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-2'>
            {row.original.geoRoles.map((role, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Icon
                  className={userRoleObj[role]?.icon}
                  sx={{ color: `var(--mui-palette-${userRoleObj[role]?.color}-main)`, fontSize: '1.375rem' }}
                />
                <Typography className='capitalize' color='text.primary'>
                  {role}
                </Typography>
                {index < row.original.geoRoles.length - 1 && (
                  <Typography color='text.secondary' sx={{ mx: 0.5 }}>
                    |
                  </Typography>
                )}
              </div>
            ))}
          </div>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography className='capitalize text-start' color='text.primary'>
            {row.original?.phone || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              className='capitalize'
              label={row.original.isActive ? 'active' : 'inactive'}
              color={userStatusObj[row.original.isActive ? 'active' : 'inactive']}
              size='small'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {/* <IconButtonTooltip title=''>
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </IconButtonTooltip> */}
            {/* <IconButtonTooltip title=''>
              <Link href={getLocalizedUrl('apps/user/view', locale)} className='flex'>
                <i className='ri-eye-line text-[22px] text-textSecondary' />
              </Link>
            </IconButtonTooltip> */}
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                // {
                //   text: 'Download',
                //   icon: 'ri-download-line text-[22px]',
                //   menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
                // },
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line text-[22px]',
                  menuItemProps: {
                    className: 'flex items-center gap-2 text-textSecondary',
                    onClick: () => handleEdit(row.original)
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

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.role !== role) return false

      return true
    })

    setData(filteredData)
  }, [role, tableData, setData])

  // Fetch the roles from the API
  const getRolesData = async () => {
    console.log('Fetching Roles Data now...')
    // const result = await clientApi.getAllRoles() // Adjust this to your correct endpoint
    const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
    if (result?.status === 'success') {
      console.log('Roles Fetched result', result)
      setRolesData(result?.result || [])
      // dispatch(roleSliceActions.refreshRoles(result?.result || []))
    } else {
      console.log('Error:', result?.message)
    }
  }

  // Fetch the geo-roles from the API
  const getGeoRolesData = async () => {
    console.log('Fetching Geo-Roles Data now...')
    // const result = await clientApi.getAllRoles() // Adjust this to your correct endpoint
    const result = await RestApi.get(`${API_URLS.v0.GEO_ROLE}`)
    if (result?.status === 'success') {
      console.log('Geo-Roles Fetched result', result)
      setGeoRolesData(result?.result || [])
      // dispatch(roleSliceActions.refreshRoles(result?.result || []))
    } else {
      console.log('Error:', result?.message)
    }
  }

  useEffect(() => {
    getRolesData() // Fetch roles on component mount
    getGeoRolesData()
  }, [])

  // Filter the data based on the selected role
  useEffect(() => {
    const filteredData = tableData.filter(user => {
      if (role && !user.roles.includes(role) && !user.geoRoles.includes(role)) return false // Filter users based on selected role
      return true // Include all users if no role is selected
    })
    setData(filteredData) // Set the filtered data
  }, [role, tableData])

  return (
    <Card>
      <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
        <Button
          variant='outlined'
          color='secondary'
          startIcon={<i className='ri-upload-2-line' />}
          className='is-full sm:is-auto'
        >
          Export
        </Button>
        <div className='flex gap-4 flex-col !items-start is-full sm:flex-row sm:is-auto sm:items-center'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='is-full sm:is-auto min-is-[220px]'
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
          />
          <FormControl size='small' className='is-full sm:is-auto'>
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
              {geoRolesData?.map(role => {
                return (
                  <MenuItem key={role._id} value={role.name}>
                    {role.name}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
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

      <EditUserRoleDialog
        open={openDialog}
        setOpen={setOpenDialog}
        userData={editData}
        refreshUsers={refreshUsers}
        roles={rolesData}
      />
    </Card>
  )
}

export default RolesTable
