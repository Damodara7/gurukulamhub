'use client'

import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { toast } from 'react-toastify'

import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'

const initialForm = {
  directReferrerPoints: 500,
  maxDistributionLevels: 4,
  promotionPointsThreshold: 1000
}

const ReferralSettingsPage = () => {
  const theme = useTheme()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
        setForm({
          directReferrerPoints: Number(response.result.directReferrerPoints ?? initialForm.directReferrerPoints),
          maxDistributionLevels: Number(response.result.maxDistributionLevels ?? initialForm.maxDistributionLevels),
          promotionPointsThreshold: Number(
            response.result.promotionPointsThreshold ?? initialForm.promotionPointsThreshold
          )
        })
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

  return (
    <Box
      sx={{
        minHeight: '100%',
        background: `radial-gradient(circle at 15% 15%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 48%),
                     ${theme.palette.background.default}`,
        py: { xs: 3, md: 5 }
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
                Level distribution uses a halving pattern from Level 1 onwards. Promotion threshold increases
                referrer level by +1 for each threshold crossed.
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
                  label='Promotion Threshold Points (+1 level)'
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
      </Container>
    </Box>
  )
}

export default ReferralSettingsPage
