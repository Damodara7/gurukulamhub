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
import TablePagination from '@mui/material/TablePagination'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, styled, useTheme } from '@mui/material/styles'

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
  SUPER_USER: { icon: 'ri-shield-star-line', color: 'warning' }
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
              {getAvatar({
                avatar: row.original.image,
                fullName: fullname,
                firstname: row.original.firstname,
                lastname: row.original.lastname,
                email: row.original.email
              })}
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
              <Link href={getLocalizedUrl('management/user/view', locale)} className='flex'>
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

  const filteredRows = table.getFilteredRowModel().rows
  const paginatedRows = table.getRowModel().rows

  const handleEdit = rowData => {
    setEditData(rowData)
    setOpenDialog(true)
  }

  const getAvatar = params => {
    const { avatar, fullName, firstname, lastname, email } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    }

    const fallbackLetter =
      firstname?.trim()?.[0] || lastname?.trim()?.[0] || fullName?.trim()?.[0] || email?.trim()?.[0] || '?'

    return (
      <CustomAvatar skin='light' size={34}>
        {fallbackLetter.toUpperCase()}
      </CustomAvatar>
    )
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
        }
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'row', md: 'row' }}
            spacing={2}
            alignItems='center'
            justifyContent='space-between'
            flexWrap='wrap'
            rowGap={1.5}
          >
            <Box sx={{ flexGrow: 1, minWidth: { xs: 200, md: 'auto' } }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                Directory Overview
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {filteredRows.length}/{tableData?.length || 0} administrators
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent='space-between'
          >
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search administrators'
              fullWidth
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
            <FormControl size='small' sx={{ minWidth: { xs: '100%', md: '220px' } }}>
              <InputLabel id='roles-app-role-select-label'>Select Role</InputLabel>
              <Select
                value={role}
                onChange={e => setRole(e.target.value)}
                label='Select Role'
                id='roles-app-role-select'
                labelId='roles-app-role-select-label'
              >
                <MenuItem value=''>
                  <em>All Roles</em>
                </MenuItem>
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
          </Stack>

          {(role || globalFilter) && (
            <Stack direction='row' spacing={1} flexWrap='wrap' alignItems='center'>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Active Filters:
              </Typography>
              {role && (
                <Chip
                  label={`Role: ${role} (${filteredRows.length})`}
                  size='small'
                  onDelete={() => setRole('')}
                  color='primary'
                  variant='outlined'
                />
              )}
              {globalFilter && (
                <Chip
                  label={`Search: "${globalFilter}"`}
                  size='small'
                  onDelete={() => setGlobalFilter('')}
                  color='info'
                  variant='outlined'
                />
              )}
              <Button
                size='small'
                onClick={() => {
                  setRole('')
                  setGlobalFilter('')
                }}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>

      <Divider />

      <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {filteredRows.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <i className='ri-user-search-line' style={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant='h6' color='text.secondary'>
              No administrators found
            </Typography>
            <Typography variant='body2' color='text.disabled'>
              Try adjusting your search or filter criteria.
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
              {filteredRows.map(row => {
                const fullname =
                  `${row.original.firstname || ''} ${row.original.lastname || ''}`.trim() || row.original.email

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
                      background: theme.palette.background.paper
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent='space-between'
                      alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                      spacing={{ xs: 1.5, sm: 0 }}
                    >
                      <Stack direction='row' spacing={1.5} alignItems='center' width='100%'>
                        {getAvatar({
                          avatar: row.original.image,
                          fullName: fullname,
                          firstname: row.original.firstname,
                          lastname: row.original.lastname,
                          email: row.original.email
                        })}
                        <div>
                          <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                            {fullname}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-word' }}>
                            {row.original.email}
                          </Typography>
                        </div>
                      </Stack>
                      <Stack
                        direction='row'
                        spacing={1}
                        alignItems='center'
                        flexWrap='wrap'
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, mt: { xs: 1, sm: 0 } }}
                      >
                        <Chip
                          label={row.original.isActive ? 'Active' : 'Inactive'}
                          color={row.original.isActive ? 'success' : 'default'}
                          size='small'
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          label={row.original.isVerified ? 'Verified' : 'Not Verified'}
                          color={row.original.isVerified ? 'success' : 'warning'}
                          size='small'
                          sx={{ fontWeight: 600 }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          {row.original.phone || 'No phone number added'}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        Roles
                      </Typography>
                      <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                        {row.original.roles.map((roleValue, idx) => (
                          <Chip key={idx} label={roleValue} size='small' variant='outlined' />
                        ))}
                      </Stack>
                    </Stack>

                    {row.original.geoRoles?.length ? (
                      <Stack spacing={0.5}>
                        <Typography variant='caption' color='text.secondary'>
                          Geo-Roles
                        </Typography>
                        <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                          {row.original.geoRoles.map((roleValue, idx) => (
                            <Chip key={idx} label={roleValue} size='small' variant='tonal' color='info' />
                          ))}
                        </Stack>
                      </Stack>
                    ) : null}

                    <Stack direction='row' spacing={1} flexWrap='nowrap'>
                      <Button
                        variant='outlined'
                        size='small'
                        component={Link}
                        href={getLocalizedUrl(`/management/user/${encodeURIComponent(row.original.email)}`, locale)}
                        sx={{ textTransform: 'none', flex: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        variant='contained'
                        component='label'
                        size='small'
                        sx={{ textTransform: 'none', flex: 1, color: 'white' }}
                        onClick={() => handleEdit(row.original)}
                      >
                        Edit Role
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
                {paginatedRows.map(row => (
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
          </div>
        )}
      </Box>
      {!isMobile && filteredRows.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
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
