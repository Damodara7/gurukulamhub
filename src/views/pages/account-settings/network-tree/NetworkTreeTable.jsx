import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardHeader,
  Divider,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Box,
  Chip,
  Button,
  Grid,
  ListItemIcon,
  ListItemText,
  Typography,
  Checkbox,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import FilterListIcon from '@mui/icons-material/FilterList'
import InputAdornment from '@mui/material/InputAdornment'
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
import classnames from 'classnames'
import UserBackgroundLetterAvatar from './UserBackgroundLetterAvatar'
import debounce from 'lodash/debounce'
import tableStyles from '@core/styles/table.module.css'
import FilterChips from './FilterChips'
import FilterPopup from './FilterPopup'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const columnHelper = createColumnHelper()

const getTotalQuizPoints = user => Number(user?.totalQuizPoints || 0)
const getComputedCumulativePoints = user =>
  Number(
    user?.cumulativePoints ??
      (Number(user?.referralPoints || 0) +
        Number(user?.totalGamePoints || 0) +
        Number(user?.totalLearningPoints || 0) +
        getTotalQuizPoints(user))
  )

const ActionsMenu = ({ anchorEl, handleClose, handleAction }) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
    <MenuItem dense onClick={() => handleAction('chat')}>
      <ListItemIcon>
        <ChatOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary='Chat' />
    </MenuItem>
    <MenuItem dense onClick={() => handleAction('schedule')}>
      <ListItemIcon>
        <ScheduleIcon />
      </ListItemIcon>
      <ListItemText primary='Schedule Meeting' />
    </MenuItem>
    <MenuItem dense onClick={() => handleAction('email')}>
      <ListItemIcon>
        <EmailOutlinedIcon />
      </ListItemIcon>
      <ListItemText primary='Send Email' />
    </MenuItem>
  </Menu>
)

const NetworkTreeTable = ({ currentUserNode, handleChangeNode }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'
  const router = useRouter()
  const { data: session } = useSession()
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [actionRow, setActionRow] = useState(null)
  const [ageFilters, setAgeFilters] = useState([])
  const [genderFilters, setGenderFilters] = useState([])
  const [filtersModalOpen, setFiltersModalOpen] = useState(false)
  const [filterType, setFilterType] = useState('age')
  const [filterEditingData, setFilterEditingData] = useState(null)
  const [showFilters, setShowFilters] = useState(true) // State to manage visibility of filter chips

  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  const handleAction = action => {
    if (action === 'chat' && actionRow?.email && session?.user?.email) {
      // Create chatId by sorting emails (same format as in ChatList)
      const emails = [session.user.email, actionRow.email].sort()
      const chatId = `${emails[0]}_${emails[1]}`
      // Navigate to individual chat page
      router.push(`/messanger/${encodeURIComponent(chatId)}`)
    } else if (action === 'schedule') {
      // TODO: Implement schedule meeting functionality
      console.log(`Schedule meeting with ${actionRow.name}`)
    } else if (action === 'email') {
      // TODO: Implement send email functionality
      console.log(`Send email to ${actionRow.name}`)
    }
    setAnchorEl(null)
  }

  const handleOpenMenu = (event, row) => {
    setAnchorEl(event.currentTarget)
    setActionRow(row)
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
      {
        id: 'sno',
        header: 'S.NO.',
        cell: info => info.row.index + 1
      },
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='flex items-center space-x-2'>
            <UserBackgroundLetterAvatar
              name={row.original.name}
              isCurrentNode={false}
              onClick={() => handleChangeNode(row.original.email)}
            />
            <span onClick={() => handleChangeNode(row.original.email)} style={{ cursor: 'pointer' }}>
              {row.original.name}
            </span>
          </div>
        )
      }),
      columnHelper.accessor('age', {
        id: 'age',
        header: 'Age',
        cell: ({ row }) => row.original.age
      }),
      columnHelper.accessor('gender', {
        id: 'gender',
        header: 'Gender',
        cell: ({ row }) => row.original.gender
      }),
      columnHelper.accessor('phoneNumber', {
        id: 'phoneNumber',
        header: 'Phone Number'
      }),
      columnHelper.accessor('referralPoints', {
        id: 'referralPoints',
        header: 'Referral Points'
      }),
      columnHelper.accessor('totalGamePoints', {
        id: 'totalGamePoints',
        header: 'Game Points ',
        cell: ({ row }) => Number(row.original.totalGamePoints || 0)
      }),
      columnHelper.accessor('totalLearningPoints', {
        id: 'totalLearningPoints',
        header: 'Learning Points',
        cell: ({ row }) => Number(row.original.totalLearningPoints || 0)
      }),
      columnHelper.accessor('totalQuizPoints', {
        id: 'totalQuizPoints',
        header: 'Quiz Points',
        cell: ({ row }) => getTotalQuizPoints(row.original)
      }),
      columnHelper.accessor('cumulativePoints', {
        id: 'cumulativePoints',
        header: 'Cumulative Points',
        cell: ({ row }) => getComputedCumulativePoints(row.original)
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <IconButtonTooltip title='Actions' onClick={e => handleOpenMenu(e, row.original)}>
            <i className='ri-more-2-fill'></i>
          </IconButtonTooltip>
        )
      })
    ],
    [handleChangeNode]
  )

  const data = useMemo(() => {
    return currentUserNode?.network.filter(friend => {
      // Check global filter
      const globalMatch = globalFilter
        ? friend.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          friend.phoneNumber.toString().toLowerCase().includes(globalFilter.toLowerCase()) ||
          friend.referralPoints.toString().includes(globalFilter) ||
          Number(friend.totalGamePoints || 0)
            .toString()
            .includes(globalFilter) ||
          Number(friend.totalLearningPoints || 0)
            .toString()
            .includes(globalFilter) ||
          Number(getTotalQuizPoints(friend))
            .toString()
            .includes(globalFilter) ||
          Number(getComputedCumulativePoints(friend))
            .toString()
            .includes(globalFilter) ||
          friend.gender.toLowerCase().includes(globalFilter.toLowerCase())
        : true

      // Check age filters
      const ageMatch = ageFilters.length
        ? ageFilters.some(({ min, max }) => friend.age >= min && friend.age <= max)
        : true

      // Check gender filters
      const genderMatch = genderFilters.length ? genderFilters.includes(friend.gender) : true

      // Combine all filter results
      return globalMatch && ageMatch && genderMatch
    })
  }, [currentUserNode?.network, globalFilter, ageFilters, genderFilters])

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

  console.log('row selection: ', rowSelection)

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
    // globalFilterFn: fuzzyFilter,
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

  const handleGlobalFilterChange = debounce(value => {
    setGlobalFilter(value || undefined)
  }, 500)

  function handleSetFilter({ filterType: filterBy, ageInput, gender }) {
    if (filterBy === 'age') {
      // Check if the age input already exists in the ageFilters
      setAgeFilters(prevFilters => {
        // Create a new age filter object from the input
        const newAgeFilter = { min: ageInput.min, max: ageInput.max }

        // If editing, replace the existing filter
        if (filterEditingData) {
          return prevFilters.map(filter =>
            filter.min === filterEditingData.min && filter.max === filterEditingData.max ? newAgeFilter : filter
          )
        }

        // Check if this filter already exists in the current ageFilters
        const filterExists = prevFilters.some(
          filter => filter.min === newAgeFilter.min && filter.max === newAgeFilter.max
        )

        // If it doesn't exist, add it to the filters
        if (!filterExists) {
          return [...prevFilters, newAgeFilter]
        }

        // Return the existing filters if the new filter is a duplicate
        return prevFilters
      })
    } else if (filterBy === 'gender') {
      setGenderFilters(prevFilters => {
        // Create a new set of gender filters
        const newGenderSet = new Set([...prevFilters, ...gender])

        // If editing, replace the existing filter
        if (filterEditingData) {
          return [...newGenderSet].filter(g => g !== filterEditingData)
        }

        // Check each gender in the new set and only add those that are not already in the filters
        const uniqueGenders = [...newGenderSet]

        return uniqueGenders
      })
    }
    setFilterEditingData(null)
  }
  function handleCloseFilter() {
    setFiltersModalOpen(false)
    setFilterEditingData(null)
  }
  function handleStartEditFilter(identifier, filter) {
    setFiltersModalOpen(true)
    setFilterType(identifier)
    setFilterEditingData(filter)
  }

  const selectedRowIndexes = Object.keys(rowSelection).filter(key => rowSelection[key])
  const selectedRowsData = data?.filter((_, index) => selectedRowIndexes.includes(index.toString()))
  console.log('Selected rows:', selectedRowsData)

  const SelectedRowsActions = ({ selectedRowsData }) => {
    return (
      <>
        {selectedRowsData.length > 0 && (
          <Box
            mt={2}
            mb={2}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant='outlined'
              size='small'
              color='primary'
              startIcon={<i className='ri-group-fill'></i>}
              fullWidth={isSmallScreen}
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                ...(isDarkMode && {
                  borderColor: alpha(theme.palette.divider, 0.3),
                  color: theme.palette.common.white,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                })
              }}
            >
              Create Group
            </Button>
            <Tooltip title='Schedule Meeting' arrow placement='top'>
              <IconButtonTooltip title='Schedule' color='primary'>
                <ScheduleIcon />
              </IconButtonTooltip>
            </Tooltip>
            <Tooltip title='Send Message' arrow placement='top'>
              <IconButtonTooltip title='Message' color='primary'>
                <ChatOutlinedIcon />
              </IconButtonTooltip>
            </Tooltip>
            <Tooltip title='Send Email' arrow placement='top'>
              <IconButtonTooltip title='Email' color='primary'>
                <EmailOutlinedIcon />
              </IconButtonTooltip>
            </Tooltip>
          </Box>
        )}
      </>
    )
  }

  return (
    <Card
      sx={{
        boxShadow: 'unset',
        bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : 'transparent',
        border: isDarkMode ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
        borderRadius: { xs: 1.5, sm: 2 }
      }}
    >
      <CardHeader
        sx={{
          padding: { xs: '12px 0px 4px', sm: '15px 0px 4px' }
        }}
        title={
          <Typography
            variant='h6'
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              color: isDarkMode ? theme.palette.common.white : 'text.primary',
              fontWeight: 700
            }}
          >
            {`${currentUserNode?.name}'s Network`}
          </Typography>
        }
        action={
          <Box sx={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Button
              onClick={() => setFiltersModalOpen(true)}
              variant='outlined'
              size='small'
              startIcon={<FilterListIcon />}
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 },
                ...(isDarkMode && {
                  borderColor: alpha(theme.palette.divider, 0.3),
                  color: theme.palette.common.white,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }
                })
              }}
            >
              Filter By
            </Button>
            {(ageFilters.length > 0 || genderFilters.length > 0) && (
              <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'} arrow placement='top'>
                <IconButtonTooltip
                  title={showFilters ? 'Hide' : 'Show'}
                  size='small'
                  color='primary'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <VisibilityOffIcon color='primary' /> : <VisibilityIcon color='primary' />}
                </IconButtonTooltip>
              </Tooltip>
            )}
            {filtersModalOpen && (
              <FilterPopup
                open={filtersModalOpen}
                onClose={handleCloseFilter}
                onFilterSet={handleSetFilter}
                defaultFilterType={filterType}
                filterEditingData={filterEditingData}
              />
            )}
          </Box>
        }
      />
      <Divider />
      {(ageFilters.length > 0 || genderFilters.length > 0) && (
        <Box mt={2}>
          {showFilters && (
            <>
              {ageFilters.length > 0 && (
                <Box mt={2}>
                  <Typography variant='body2'>Age:</Typography>
                  <FilterChips
                    filters={ageFilters.map(age => ({
                      label: `${age.min}-${age.max}`,
                      ageFilter: age
                    }))}
                    onEdit={filter => handleStartEditFilter('age', filter.ageFilter)}
                    onRemove={filter => setAgeFilters(prevFilters => prevFilters.filter(f => f !== filter.ageFilter))}
                    onClearAll={() => setAgeFilters([])}
                  />
                </Box>
              )}
              {genderFilters.length > 0 && (
                <Box mt={2}>
                  <Typography variant='body2'>Gender:</Typography>
                  <FilterChips
                    filters={genderFilters.map(gender => ({
                      label: gender,
                      genderFilter: gender
                    }))}
                    onEdit={filter => handleStartEditFilter('gender', filter.genderFilter)}
                    onRemove={filter =>
                      setGenderFilters(prevFilters => prevFilters.filter(g => g !== filter.genderFilter))
                    }
                    onClearAll={() => setGenderFilters([])}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Search'
            variant='outlined'
            size='small'
            fullWidth
            onChange={e => handleGlobalFilterChange(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? alpha(theme.palette.background.paper, 0.4) : 'white'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon sx={{ color: isDarkMode ? alpha(theme.palette.common.white, 0.7) : 'text.secondary' }} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>

      {selectedRowsData?.length > 0 && <SelectedRowsActions selectedRowsData={selectedRowsData} />}

      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='px-6 py-3 border-b'>
                    <div className='flex items-center'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {data?.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='px-6 py-3 border-b'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className='px-6 py-3 border-b text-center'>
                  No data found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        count={table?.getFilteredRowModel()?.rows?.length}
        rowsPerPage={table?.getState().pagination.pageSize}
        page={table?.getState().pagination.pageIndex}
        onPageChange={(_, page) => table?.setPageIndex(page)}
        onRowsPerPageChange={e => table?.setPageSize(Number(e.target.value))}
      />
      <ActionsMenu anchorEl={anchorEl} handleClose={() => setAnchorEl(null)} handleAction={handleAction} />
    </Card>
  )
}

export default NetworkTreeTable
