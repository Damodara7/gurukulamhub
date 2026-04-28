'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { toast } from 'react-toastify'
import { useSession } from 'next-auth/react'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const initialForm = {
  directReferrerPoints: 500,
  maxDistributionLevels: 4,
  promotionPointsThreshold: 1000
}

const historyFields = [
  { key: 'directReferrerPoints', label: 'Direct Referrer Points (Level 1)' },
  { key: 'maxDistributionLevels', label: 'Max Distribution Levels' },
  { key: 'promotionPointsThreshold', label: 'Threshold Points (+1 Distribution Level)' }
]

const getHistoryEntryId = (entry, index) => {
  if (entry?._id) return String(entry._id)
  return `${entry?.editedAt || 'unknown-time'}-${entry?.editedByEmail || 'unknown-user'}-${index}`
}

const ReferralSettingsPage = () => {
  const theme = useTheme()
  const { data: session } = useSession()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settingsHistory, setSettingsHistory] = useState([])
  const [expandedHistoryEntryId, setExpandedHistoryEntryId] = useState(null)

  const levelPreview = useMemo(() => {
    const levels = Math.max(1, Number(form.maxDistributionLevels) || 1)
    const direct = Math.max(0, Number(form.directReferrerPoints) || 0)
    return Array.from({ length: levels }, (_, index) => ({
      level: index + 1,
      points: direct / Math.pow(2, index)
    }))
  }, [form.maxDistributionLevels, form.directReferrerPoints])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await RestApi.get(API_URLS.v0.REFERRAL_SETTINGS)
      if (response?.status === 'success' && response?.result) {
        const history = Array.isArray(response.result.history) ? response.result.history : []
        setForm({
          directReferrerPoints: Number(response.result.directReferrerPoints ?? initialForm.directReferrerPoints),
          maxDistributionLevels: Number(response.result.maxDistributionLevels ?? initialForm.maxDistributionLevels),
          promotionPointsThreshold: Number(
            response.result.promotionPointsThreshold ?? initialForm.promotionPointsThreshold
          )
        })
        setSettingsHistory(history)
      } else {
        toast.error(response?.message || 'Failed to fetch referral settings')
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch referral settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await RestApi.put(API_URLS.v0.REFERRAL_SETTINGS, {
        directReferrerPoints: Number(form.directReferrerPoints),
        maxDistributionLevels: Number(form.maxDistributionLevels),
        promotionPointsThreshold: Number(form.promotionPointsThreshold)
      })
      if (response?.status === 'success') {
        toast.success(response?.message || 'Referral settings updated')
        await loadSettings()
      } else {
        toast.error(response?.message || 'Failed to update referral settings')
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update referral settings')
    } finally {
      setSaving(false)
    }
  }

  const getActorLabel = entry => {
    const currentUserEmail = String(session?.user?.email || '').trim().toLowerCase()
    const actorEmail = String(entry?.editedByEmail || '').trim().toLowerCase()
    if (currentUserEmail && actorEmail && currentUserEmail === actorEmail) return 'You'
    const actorName = entry?.editedByName || 'Unknown'
    return actorEmail ? `${actorName} (${actorEmail})` : actorName
  }

  const formatDateTime = value => {
    if (!value) return '-'
    return new Date(value).toLocaleString()
  }

  const historyStages = useMemo(() => {
    if (!Array.isArray(settingsHistory) || settingsHistory.length === 0) return {}

    const runningState = {
      directReferrerPoints: Number(form.directReferrerPoints ?? initialForm.directReferrerPoints),
      maxDistributionLevels: Number(form.maxDistributionLevels ?? initialForm.maxDistributionLevels),
      promotionPointsThreshold: Number(form.promotionPointsThreshold ?? initialForm.promotionPointsThreshold)
    }

    const snapshotsByEntryId = {}

    settingsHistory.forEach((entry, index) => {
      const entryId = getHistoryEntryId(entry, index)
      const changes = Array.isArray(entry?.changes) ? entry.changes : []
      const changedFieldMap = {}

      snapshotsByEntryId[entryId] = {
        snapshot: { ...runningState },
        changedFieldMap
      }

      changes.forEach(change => {
        const field = change?.field
        if (!field || !(field in runningState)) return

        const previousValue = Number(change?.previousValue)
        const newValue = Number(change?.newValue)
        changedFieldMap[field] = {
          previousValue: Number.isFinite(previousValue) ? previousValue : change?.previousValue,
          newValue: Number.isFinite(newValue) ? newValue : change?.newValue
        }

        if (Number.isFinite(previousValue)) {
          runningState[field] = previousValue
        } else if (change?.previousValue !== undefined) {
          runningState[field] = change.previousValue
        }
      })
    })

    return snapshotsByEntryId
  }, [settingsHistory, form.directReferrerPoints, form.maxDistributionLevels, form.promotionPointsThreshold])

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: `radial-gradient(circle at 15% 15%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 48%),
                     ${theme.palette.background.default}`,
        py: { xs: 3, md: 5 },
        overflow: "auto",
      }}
    >
      <Container maxWidth='md'>
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant='h4' sx={{ fontWeight: 700 }}>
                  Manage Referral Points
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Configure direct referral reward, distribution levels, and promotion threshold.
                </Typography>
              </Box>

              <Alert severity='info'>
                Level distribution uses a halving pattern from Level 1 onwards. Threshold points increase maximum
                distribution depth by +1 level for each threshold crossed.
              </Alert>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type='number'
                  label='Direct Referrer Points (Level 1)'
                  value={form.directReferrerPoints}
                  onChange={e => setForm(prev => ({ ...prev, directReferrerPoints: e.target.value }))}
                  inputProps={{ min: 0 }}
                  disabled={loading || saving}
                />
                <TextField
                  fullWidth
                  type='number'
                  label='Max Distribution Levels'
                  value={form.maxDistributionLevels}
                  onChange={e => setForm(prev => ({ ...prev, maxDistributionLevels: e.target.value }))}
                  inputProps={{ min: 1, max: 25 }}
                  disabled={loading || saving}
                />
                <TextField
                  fullWidth
                  type='number'
                  label='Threshold Points (+1 Distribution Level)'
                  value={form.promotionPointsThreshold}
                  onChange={e => setForm(prev => ({ ...prev, promotionPointsThreshold: e.target.value }))}
                  inputProps={{ min: 1 }}
                  disabled={loading || saving}
                />
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.35)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }}
              >
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 700 }}>
                  Distribution Preview
                </Typography>
                {levelPreview.map(item => (
                  <Typography key={item.level} variant='body2' color='text.secondary'>
                    Level {item.level}: {Number(item.points.toFixed(2))} points
                  </Typography>
                ))}
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent='flex-end'>
                <Button variant='outlined' onClick={loadSettings} disabled={loading || saving}>
                  Refresh
                </Button>
                <Button variant='contained' sx={{ color: 'white' }} component='label' onClick={handleSave} disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Referral Settings History
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Latest updates appear first, including who changed what and when.
                </Typography>
              </Box>

              {settingsHistory.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No settings update history yet.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {settingsHistory.map((entry, index) => {
                    const entryId = getHistoryEntryId(entry, index)
                    const isExpanded = expandedHistoryEntryId === entryId
                    return (
                      <Box
                        key={entryId}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                          bgcolor: alpha(theme.palette.background.paper, 0.88)
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent='space-between'
                        >
                          <Box>
                            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                              {getActorLabel(entry)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {formatDateTime(entry?.editedAt)}
                            </Typography>
                          </Box>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => setExpandedHistoryEntryId(isExpanded ? null : entryId)}
                          >
                            {isExpanded ? 'Hide Details' : 'See Details'}
                          </Button>
                        </Stack>

                        {isExpanded && (
                          <Stack spacing={1} sx={{ mt: 1.25 }}>
                            {historyFields.map(field => {
                              const stageData = historyStages[entryId]
                              const changedField = stageData?.changedFieldMap?.[field.key]
                              const stageValue = stageData?.snapshot?.[field.key]
                              const hasChanged = Boolean(changedField)

                              return (
                                <Box
                                  key={field.key}
                                  sx={{
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    border: `1px solid ${
                                      hasChanged
                                        ? alpha(theme.palette.success.main, 0.5)
                                        : alpha(theme.palette.divider, 0.35)
                                    }`,
                                    bgcolor: hasChanged
                                      ? alpha(theme.palette.success.main, 0.08)
                                      : alpha(theme.palette.background.default, 0.5)
                                  }}
                                >
                                  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {field.label}
                                  </Typography>
                                  {hasChanged ? (
                                    <>
                                      <Typography variant='caption' color='text.secondary' display='block'>
                                        Changed: {String(changedField.previousValue)}
                                        {' \u2192 '}
                                        {String(changedField.newValue)}
                                      </Typography>
                                      <Typography variant='caption' color='success.main' display='block' sx={{ fontWeight: 600 }}>
                                        Value at this stage: {String(stageValue)}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant='caption' color='text.secondary' display='block'>
                                      Value at this stage: {String(stageValue)}
                                    </Typography>
                                  )}
                                </Box>
                              )
                            })}
                          </Stack>
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* TODO : Logs */}
    </Box>
  )
}

export default ReferralSettingsPage
