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
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TablePagination from '@mui/material/TablePagination'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import CloseIcon from '@mui/icons-material/Close'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme, alpha } from '@mui/material/styles'

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
import AddUserDrawer from './AddUserDrawer'
import EditUserRoleDialog from '../../roles/EditUserRoleDialog'
import IconButtonTooltip from '@/components/IconButtonTooltip'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Api utils
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
// import { useAppDispatch } from '@/store/hooks'
import { roleSliceActions } from '@/store/features/roleSlice'
import * as clientApi from '@/app/api/client/client.api'
import { Divider, Grid } from '@mui/material'

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
  SUPER_USER: { icon: 'ri-shield-star-line', color: 'error' }
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
  const [status, setStatus] = useState('')
  const [emailStatus, setEmailStatus] = useState('')

  const [rowSelection, setRowSelection] = useState({})
  const [rolesData, setRolesData] = useState([])

  const [data, setData] = useState(...[tableData])
  const [globalFilter, setGlobalFilter] = useState('')

  const [editData, setEditData] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)

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
        header: 'Users',
        cell: ({ row }) => {
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
              <div className='flex flex-col' style={{ minWidth: '150px' }}>
                <Link
                  href={getLocalizedUrl(`/management/user/${encodeURIComponent(row.original.email)}`, locale)}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Typography
                    variant='body1'
                    className='font-medium'
                    color='text.primary'
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: 'primary.main',
                        '& .external-link-icon': {
                          color: 'primary.main',
                          transform: 'translate(2px, -2px)'
                        }
                      }
                    }}
                  >
                    {fullname || ''}
                    <i
                      className='ri-external-link-line text-[16px] ml-1 external-link-icon'
                      style={{
                        marginLeft: 4,
                        color: 'var(--mui-palette-primary-main)',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      sx={{ fontWeight: 600, color: '#fff' }}
                    />
                  </Typography>
                </Link>
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem' }}>
                  {row.original.nickname}
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => (
          <Link
            href={getLocalizedUrl(`/management/user/${encodeURIComponent(row.original.email)}`, locale)}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Typography
              color='text.primary'
              sx={{
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s ease-in-out',
                fontSize: '0.875rem',
                minWidth: '180px',
                '&:hover': {
                  color: 'primary.main',
                  '& .external-link-icon': {
                    color: 'primary.main',
                    transform: 'translate(2px, -2px)'
                  }
                }
              }}
            >
              {row.original.email}
              <i
                className='ri-external-link-line text-[16px] ml-1 external-link-icon'
                style={{
                  marginLeft: 4,
                  color: 'var(--mui-palette-primary-main)',
                  transition: 'transform 0.2s ease-in-out'
                }}
              />
            </Typography>
          </Link>
        )
      }),
      columnHelper.accessor('roles', {
        header: 'Role',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-2' style={{ minWidth: '120px' }}>
            {row.original.roles.map((role, index) => (
              <Chip
                key={index}
                label={role}
                size='small'
                icon={<Icon className={userRoleObj[role]?.icon} sx={{ fontSize: '1.125rem !important' }} />}
                color={userRoleObj[role]?.color || 'default'}
                variant='tonal'
                sx={{
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  '& .MuiChip-icon': {
                    marginLeft: '8px'
                  }
                }}
              />
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
              label={row.original.isActive ? 'Active' : 'Inactive'}
              color={userStatusObj[row.original.isActive ? 'active' : 'inactive']}
              size='small'
              sx={{
                fontWeight: 600,
                minWidth: '75px',
                '& .MuiChip-label': {
                  px: 2
                }
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('isVerified', {
        header: 'Verified',
        cell: ({ row }) => (
          <div className='flex items-center text-center justify-center gap-3'>
            <Chip
              size='small'
              variant='tonal'
              label={row.original.isVerified ? 'Verified' : 'Unverified'}
              color={row.original.isVerified ? 'success' : 'error'}
              icon={
                row.original.isVerified ? (
                  <DoneAllIcon sx={{ fontSize: '1rem !important' }} />
                ) : (
                  <CloseIcon sx={{ fontSize: '1rem !important' }} />
                )
              }
              sx={{
                fontWeight: 500,
                minWidth: '95px',
                '& .MuiChip-icon': {
                  marginLeft: '8px'
                }
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButtonTooltip
              title='View Details'
              href={getLocalizedUrl(`/management/user/${encodeURIComponent(row.original.email)}`, locale)}
              component={Link}
              size='small'
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                  '& i': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <i className='ri-eye-line text-[22px] text-textSecondary' />
            </IconButtonTooltip>
            <OptionMenu
              iconClassName='text-[22px] text-textSecondary'
              options={[
                {
                  text: 'Edit Role',
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

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const filteredRows = table.getPrePaginationRowModel().rows
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

  useEffect(() => {
    getRolesData() // Fetch roles on component mount
  }, [])

  // Filter the data based on the selected role
  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      // Role filter
      if (role && !user.roles.includes(role)) return false

      // Status filter
      if (status === 'active' && !user.isActive) return false
      if (status === 'inactive' && user.isActive) return false

      // Email verification filter
      if (emailStatus === 'verified' && !user.isVerified) return false
      if (emailStatus === 'notVerified' && user.isVerified) return false

      return true
    })

    setData(filteredData)
  }, [role, status, emailStatus, tableData, setData])

  return (
    <Card
      id='user-table'
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
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              justifyContent='space-between'
              sx={{ flexWrap: 'wrap', rowGap: 1 }}
            >
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Directory Overview
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {filteredRows.length}/{tableData?.length || 0} users
                </Typography>
              </Box>
              <Button
                variant='contained'
                component='label'
                onClick={() => setAddUserOpen(!addUserOpen)}
                startIcon={<i className='ri-add-line' />}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  ml: 'auto'
                }}
              >
                Add User
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size='small' fullWidth>
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
                  {rolesData?.map(role => (
                    <MenuItem key={role._id} value={role.name}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl size='small' fullWidth>
                <InputLabel id='status-select-label'>Select Status</InputLabel>
                <Select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  label='Select Status'
                  id='status-select'
                  labelId='status-select-label'
                >
                  <MenuItem value=''>
                    <em>All Status</em>
                  </MenuItem>
                  {['inactive', 'active']?.map(currentStatus => (
                    <MenuItem className='capitalize' key={currentStatus} value={currentStatus}>
                      {currentStatus}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl size='small' fullWidth>
                <InputLabel id='email-verification-status-label'>Email Status</InputLabel>
                <Select
                  value={emailStatus}
                  onChange={e => setEmailStatus(e.target.value)}
                  label='Email Status'
                  id='email-verification-status-select'
                  labelId='email-verification-status-label'
                >
                  <MenuItem value=''>
                    <em>All Email Status</em>
                  </MenuItem>
                  <MenuItem value='verified'>Verified</MenuItem>
                  <MenuItem value='notVerified'>Not Verified</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search User'
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
            </Grid>
          </Grid>

          {(role || status || emailStatus || globalFilter) && (
            <Stack direction='row' spacing={1} flexWrap='wrap' alignItems='center' sx={{ rowGap: 1, columnGap: 1 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Active Filters:
              </Typography>
              {role && (
                <Chip
                  label={`Role: ${role}`}
                  size='small'
                  onDelete={() => setRole('')}
                  color='primary'
                  variant='outlined'
                />
              )}
              {status && (
                <Chip
                  label={`Status: ${status}`}
                  size='small'
                  onDelete={() => setStatus('')}
                  color='success'
                  variant='outlined'
                  sx={{ textTransform: 'capitalize' }}
                />
              )}
              {emailStatus && (
                <Chip
                  label={`Email: ${emailStatus === 'verified' ? 'Verified' : 'Not Verified'}`}
                  size='small'
                  onDelete={() => setEmailStatus('')}
                  color='warning'
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
                  setStatus('')
                  setEmailStatus('')
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
              No users found
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
              '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.primary.main, 0.3), borderRadius: 8 }
            }}
          >
            <Stack spacing={2}>
              {filteredRows.map(row => (
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
                    gap: 1.2,
                    background: theme.palette.background.paper
                  }}
                >
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        {row.original.firstname} {row.original.lastname}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {row.original.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={row.original.isActive ? 'Active' : 'Inactive'}
                      color={row.original.isActive ? 'success' : 'default'}
                      size='small'
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Stack spacing={0.5}>
                      <Typography variant='caption' color='text.secondary'>
                        Roles
                      </Typography>
                      <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                        {row.original.roles.map((role, idx) => (
                          <Chip key={idx} label={role} size='small' variant='outlined' />
                        ))}
                      </Stack>
                    </Stack>
                    <Chip
                      label={row.original.isVerified ? 'Verified' : 'Not Verified'}
                      color={row.original.isVerified ? 'success' : 'warning'}
                      size='small'
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Stack direction='row' spacing={1}>
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
              ))}
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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      <div
                        style={{
                          padding: '48px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <i className='ri-user-search-line' style={{ fontSize: '48px', opacity: 0.5 }} />
                        <Typography variant='h6' color='text.secondary'>
                          No users found
                        </Typography>
                        <Typography variant='body2' color='text.disabled'>
                          Try adjusting your search or filter criteria
                        </Typography>
                      </div>
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
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
        )}
      </Box>
      {!isMobile && (
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

      {addUserOpen && (
        <AddUserDrawer
          refreshUsers={refreshUsers}
          open={addUserOpen}
          handleClose={() => setAddUserOpen(!addUserOpen)}
        />
      )}
    </Card>
  )
}

export default RolesTable
