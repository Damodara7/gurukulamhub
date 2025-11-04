'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import Container from '@mui/material/Container'
import { useTheme, alpha } from '@mui/material/styles'

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
import { Avatar, Box, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Tab } from '@mui/material'
import { revalidatePath } from 'next/cache'
import React from 'react'
import { Tooltip } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { useSession } from 'next-auth/react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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

const AdminSponsorshipList = ({ tableData, sponsorType = 'all', sponsorshipStatus = 'all', filter }) => {
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [rowSelection, setRowSelection] = useState({})

  const [data, setData] = useState(...[tableData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedSponsorshipId, setSelectedSponsorshipId] = useState(null)

  // Hooks
  const { lang: locale } = useParams()

  function handleSponsorshipStatusChange(e) {
    const status = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (status && status !== 'all') {
      params.set('sponsorshipStatus', status)
    } else {
      params.delete('sponsorshipStatus')
    }

    router.push(`?${params.toString()}`)
  }

  async function handleCompleteSponsorship(sponsorshipId) {
    try {
      const response = await RestApi.put(`${API_URLS.v0.SPONSORSHIP}`, {
        id: sponsorshipId,
        nonCashSponsorshipStatus: 'completed'
      })

      if (response.status === 'success') {
        // Refresh the page or update the data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error completing sponsorship:', error)
    }
  }

  function handleRejectSponsorship(sponsorshipId) {
    setSelectedSponsorshipId(sponsorshipId)
    setRejectDialogOpen(true)
  }

  async function confirmRejectSponsorship() {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      const response = await RestApi.put(`${API_URLS.v0.SPONSORSHIP}`, {
        id: selectedSponsorshipId,
        nonCashSponsorshipStatus: 'rejected',
        nonCashSponsorshipRejectionReason: rejectionReason,
        rejectorEmail: session?.user?.email
      })

      if (response.status === 'success') {
        setRejectDialogOpen(false)
        setRejectionReason('')
        setSelectedSponsorshipId(null)
        // Refresh the page or update the data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error rejecting sponsorship:', error)
    }
  }

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
        columnHelper.accessor('email', {
          header: 'Sponsorer',
          cell: ({ row }) => {
            const firstname = row.original?.profile?.firstname || ''
            const lastname = row.original?.profile?.lastname || ''
            const fullname = `${firstname} ${lastname}`.trim() || row.original?.fullname || ''
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {fullname ? (
                  <Typography variant='body1' color='text.primary' sx={{ mb: 0.25, lineHeight: 1.1 }}>
                    {fullname}
                  </Typography>
                ) : null}
                <Link
                  href={getLocalizedUrl(`/management/user/${encodeURIComponent(row.original?.email)}`, locale)}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'info.main',
                        '& .external-link-icon': {
                          color: 'info.main'
                        }
                      }
                    }}
                  >
                    {row.original?.email}
                    <i
                      className='ri-external-link-line text-[16px] ml-1 external-link-icon'
                      style={{ marginLeft: 4, color: 'var(--mui-palette-info-main)' }}
                    />
                  </Typography>
                </Link>
              </div>
            )
          }
        }),
        // (sponsorType === 'all' || sponsorType === 'game') && {
        {
          id: 'games',
          ...columnHelper.accessor('games', {
            header: 'Sponsored Games',
            cell: ({ row }) => (
              <Typography variant='body1'>
                {row.original?.games?.join(', ') || (
                  <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Any game</span>
                )}
              </Typography>
            )
          })
        },
        // (sponsorType === 'all' || sponsorType === 'quiz') && {
        {
          id: 'quizzes',
          accessorFn: row => row.quizzes?.map(q => q.title).join(', ') || '',
          ...columnHelper.accessor('quizzes', {
            header: 'Sponsored Quizzes',
            cell: ({ row }) => (
              <Typography variant='body1'>
                {row.original?.quizzes?.map(q => q.title).join(', ') || (
                  <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Any quiz</span>
                )}
              </Typography>
            )
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
              return (
                <Typography variant='body1'>
                  {area || <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Any location</span>}
                </Typography>
              )
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
              const { rewardType, currency } = row.original
              if (rewardType === 'cash') {
                const formattedAmount = new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: currency || 'INR'
                }).format(row.original?.sponsorshipAmount || 0)
                return <Typography variant='body1'>{formattedAmount}</Typography>
              } else {
                // For physical gifts
                const formatCurrency = value =>
                  new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: currency || 'INR'
                  }).format(value || 0)
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
                )
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
                return (
                  <Typography variant='caption' sx={{ color: 'white' }}>
                    Not used in any game yet.
                  </Typography>
                )
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
                            sx={{
                              fontWeight: 'bold',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: s.game?._id ? 'pointer' : 'default'
                            }}
                            onClick={() => {
                              if (s.game?._id) {
                                router.push(`/public-games/${s.game._id}`)
                              }
                            }}
                          >
                            Game: {s.game?.title || 'N/A'}
                            {s.game?._id && (
                              <i className='ri-external-link-line' style={{ fontSize: '1em', marginLeft: 4 }} />
                            )}
                          </Typography>
                          <Typography variant='caption' component='div' sx={{ color: 'white', ml: 1 }}>
                            Quiz: {s.game?.quiz?.title || 'N/A'}
                          </Typography>
                          <Typography variant='caption' component='div' sx={{ color: 'white', ml: 1 }}>
                            Used:{' '}
                            {rewardType === 'cash'
                              ? formatCurrency(usedAmount, currency)
                              : `${usedAmount} ${usedAmount === 1 ? 'item' : 'items'}`}
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
          id: 'sponsorshipStatus',
          ...columnHelper.accessor('sponsorshipStatus', {
            header: 'Status',
            cell: ({ row }) => {
              const {
                rewardType,
                sponsorshipStatus,
                nonCashSponsorshipStatus,
                nonCashSponsorshipRejectionReason,
                rejectorEmail
              } = row.original
              const status = rewardType === 'cash' ? sponsorshipStatus : nonCashSponsorshipStatus
              const statusColor =
                {
                  created: 'default',
                  pending: 'warning',
                  failed: 'error',
                  completed: 'success',
                  expired: 'secondary',
                  rejected: 'error'
                }[status] || 'default'

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip size='small' color={statusColor} label={status} />
                  {status === 'rejected' && rewardType === 'physicalGift' && (
                    <>
                      {rejectorEmail && nonCashSponsorshipRejectionReason && (
                        <Tooltip
                          title={
                            <Box sx={{ p: 1 }}>
                              <Typography variant='body2' sx={{ color: 'white', mb: 0.5 }}>
                                <strong>Rejected by:</strong> {rejectorEmail}
                              </Typography>
                              <Typography variant='body2' sx={{ color: 'white' }}>
                                <strong>Reason:</strong> {nonCashSponsorshipRejectionReason}
                              </Typography>
                            </Box>
                          }
                          placement='top'
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
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => {
            const { rewardType, nonCashSponsorshipStatus } = row.original
            if (rewardType === 'physicalGift' && nonCashSponsorshipStatus === 'pending') {
              return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title='View Details'>
                    <Link href={`/management/sponsorships/${row.original._id}`} style={{ textDecoration: 'none' }}>
                      <IconButton size='small' color='info'>
                        <i className='ri-eye-line' />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title='Complete'>
                    <IconButton
                      size='small'
                      color='success'
                      onClick={() => handleCompleteSponsorship(row.original._id)}
                    >
                      <i className='ri-check-line' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Reject'>
                    <IconButton size='small' color='error' onClick={() => handleRejectSponsorship(row.original._id)}>
                      <i className='ri-close-line' />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            } else if (rewardType === 'physicalGift' && nonCashSponsorshipStatus === 'rejected') {
              // Show only view action for rejected sponsorships
              return (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title='View Details'>
                    <Link href={`/management/sponsorships/${row.original._id}`} style={{ textDecoration: 'none' }}>
                      <IconButton size='small' color='info'>
                        <i className='ri-eye-line' />
                      </IconButton>
                    </Link>
                  </Tooltip>
                </Box>
              )
            }
            return null
          }
        }
      ].filter(Boolean),
    [sponsorType, filter]
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

  // Get count for each tab
  const allCount = data.length
  const awaitingCount = data.filter(
    item => item.rewardType === 'physicalGift' && item.nonCashSponsorshipStatus === 'pending'
  ).length
  const rejectedCount = data.filter(
    item => item.rewardType === 'physicalGift' && item.nonCashSponsorshipStatus === 'rejected'
  ).length

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Elegant Header */}
      <Box
        sx={{
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#fff', 0.7),
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          pt: { xs: 4, md: 6 },
          pb: { xs: 4, md: 6 }
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center' }}>
            {/* Icon and Title */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <i className='ri-award-line' style={{ fontSize: '28px', color: 'white' }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                Sponsorships Management
              </Typography>
            </Box>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                width: '100%',
                mx: 'auto',
                fontWeight: 400,
                mb: 3
              }}
            >
              Manage and track all sponsorships across games, quizzes, and locations
            </Typography>

            {/* Enhanced Tabs with Icons and Counts */}
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <TabContext value={filter || sponsorType}>
                <CustomTabList
                  onChange={(e, val) => {
                    let url = `/management/sponsorships`
                    if (val === 'awaiting' || val === 'rejected') {
                      url += `?filter=${val}`
                    } else if (val !== 'all') {
                      url += `?sponsorType=${val}`
                    }
                    router.push(url)
                  }}
                  variant='scrollable'
                  pill='true'
                  scrollButtons='auto'
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    },
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      textTransform: 'none',
                      minHeight: { xs: 42, sm: 46 },
                      px: { xs: 2.5, sm: 3 },
                      py: 1,
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '10px',
                      transition: 'all 0.2s ease',
                      mr: { xs: 1, sm: 1.5 },
                      mb: { xs: 1, sm: 0 },
                      '&:hover': {
                        backgroundColor: '#e5e7eb',
                        color: '#374151'
                      },
                      '&.Mui-selected': {
                        color: 'white',
                        backgroundColor: theme.palette.primary.main,
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      }
                    }
                  }}
                >
                  <Tab
                    value='all'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-list-check' style={{ fontSize: '1.125rem' }} />
                        <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                          All Sponsorships
                        </Box>
                        <Box component='span' sx={{ display: { xs: 'inline', sm: 'none' } }}>
                          All
                        </Box>
                        {(filter || sponsorType) === 'all' && (
                          <Chip
                            label={allCount}
                            size='small'
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    value='awaiting'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-time-line' style={{ fontSize: '1.125rem' }} />
                        <Box component='span' sx={{ display: { xs: 'none', md: 'inline' } }}>
                          Awaiting Action
                        </Box>
                        <Box component='span' sx={{ display: { xs: 'inline', md: 'none' } }}>
                          Awaiting
                        </Box>
                        {filter === 'awaiting' && (
                          <Chip
                            label={awaitingCount}
                            size='small'
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <Tab
                    value='rejected'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-close-circle-line' style={{ fontSize: '1.125rem' }} />
                        <span>Rejected</span>
                        {filter === 'rejected' && (
                          <Chip
                            label={rejectedCount}
                            size='small'
                            sx={{
                              ml: 1,
                              height: 20,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white'
                            }}
                          />
                        )}
                      </Box>
                    }
                  />
                </CustomTabList>
              </TabContext>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 3, md: 4 } }}>
        {/* Main Content Card */}
        <Card
          sx={{
            borderRadius: { xs: '16px', sm: '20px' },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 3, sm: 4 },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between'
            }}
          >
            {/* Section Title with Count */}
            <Box>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {filter === 'awaiting'
                  ? 'Pending Approvals'
                  : filter === 'rejected'
                    ? 'Rejected Sponsorships'
                    : 'All Sponsorships'}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
                {table.getFilteredRowModel().rows.length} total records
              </Typography>
            </Box>

            {/* Filter Controls */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                alignItems: 'stretch',
                width: { xs: '100%', md: 'auto' }
              }}
            >
              <FormControl
                size='small'
                sx={{
                  minWidth: { xs: '100%', sm: 200 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.12)'
                    }
                  }
                }}
              >
                <InputLabel id='sponsorship-status-label'>Status Filter</InputLabel>
                <Select
                  labelId='sponsorship-status-label'
                  value={sponsorshipStatus}
                  label='Status Filter'
                  onChange={handleSponsorshipStatusChange}
                >
                  <MenuItem value='all'>All</MenuItem>
                  <MenuItem value='completed'>Completed</MenuItem>
                  <MenuItem value='failed'>Failed</MenuItem>
                  <MenuItem value='cancelled'>Cancelled</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='created'>Created</MenuItem>
                </Select>
              </FormControl>
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                placeholder='Search sponsors...'
                size='small'
                sx={{
                  minWidth: { xs: '100%', sm: 350, md: 450 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.12)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <i className='ri-search-line' style={{ fontSize: '1.25rem' }} />
                    </Box>
                  )
                }}
              />
            </Box>
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
                        <tr
                          key={row.id}
                          className={classnames({ selected: row.getIsSelected() })}
                          style={{
                            transition: 'all 0.3s ease-in-out',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.08)'
                            e.currentTarget.style.transform = 'scale(1.01)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.15)'
                          }}
                          onMouseLeave={e => {
                            if (!row.getIsSelected()) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td
                              key={cell.id}
                              style={{
                                padding: '16px 12px',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </table>
          </div>
          <Box
            sx={{
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: 'rgba(102, 126, 234, 0.02)'
            }}
          >
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component='div'
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
                '& .MuiTablePagination-toolbar': {
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  minHeight: { xs: 64, sm: 72 }
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  fontWeight: 500
                },
                '& .MuiIconButton-root': {
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea'
                  }
                }
              }}
            />
          </Box>
        </Card>

        {/* Modern Rejection Dialog */}
        <Dialog
          maxWidth='sm'
          fullWidth
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(211, 47, 47, 0.05))',
              borderBottom: '1px solid rgba(244, 67, 54, 0.15)',
              pb: 2.5,
              pt: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.35)',
                  transform: 'rotate(-3deg)'
                }}
              >
                <i className='ri-close-circle-fill' style={{ fontSize: '32px', color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant='h5' sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                  Reject Sponsorship
                </Typography>
                <Typography variant='caption' sx={{ color: 'error.main', fontWeight: 600, fontSize: '0.8125rem' }}>
                  ⚠️ This action cannot be undone
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3.5, pb: 3, px: 3 }}>
            <Typography
              variant='body2'
              sx={{
                mb: 3,
                color: 'text.secondary',
                lineHeight: 1.7,
                fontSize: '0.9375rem'
              }}
            >
              Please provide a detailed reason for rejecting this sponsorship. The sponsor will be notified with your
              explanation.
            </Typography>
            <TextField
              autoFocus
              label='Rejection Reason'
              type='text'
              fullWidth
              variant='outlined'
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              multiline
              rows={5}
              placeholder='Explain why this sponsorship is being rejected...'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  backgroundColor: 'rgba(244, 67, 54, 0.02)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.04)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(244, 67, 54, 0.3)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    boxShadow: '0 0 0 4px rgba(244, 67, 54, 0.1)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f44336',
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 3,
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              gap: 2,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.01), transparent)'
            }}
          >
            <Button
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason('')
              }}
              variant='outlined'
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.25,
                fontSize: '0.9375rem',
                borderColor: 'rgba(0, 0, 0, 0.15)',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.3)',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRejectSponsorship}
              variant='contained'
              disabled={!rejectionReason.trim()}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.25,
                fontSize: '0.9375rem',
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                boxShadow: '0 4px 14px rgba(244, 67, 54, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f, #c62828)',
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.5)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0px)'
                },
                '&.Mui-disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                  boxShadow: 'none'
                }
              }}
            >
              <i className='ri-close-circle-line' style={{ marginRight: '8px', fontSize: '1.125rem' }} />
              Reject Sponsorship
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AdminSponsorshipList
