import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Stack, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Place } from '@mui/icons-material'

function GameLocationInfo({ game }) {
  const theme = useTheme()
  const locationItems = [
    { label: 'Country', value: game.location?.country || 'Not specified' },
    { label: 'Region', value: game.location?.region || 'Not specified' },
    { label: 'City', value: game.location?.city || 'Not specified' }
  ]

  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '16px',
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: theme.palette.background.paper,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 6px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                : '0 6px 24px rgba(102, 126, 234, 0.15)'
          }
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography
            variant='h6'
            sx={{
              mb: { xs: 1.5, sm: 2 },
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: theme.palette.text.primary,
              fontSize: { xs: '0.95rem', sm: '1.1rem' }
            }}
          >
            <Place sx={{ color: theme.palette.primary.main, fontSize: { xs: 18, sm: 22 } }} />
            Location Details
          </Typography>
          <Stack spacing={{ xs: 1, sm: 1.5 }}>
            {locationItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: { xs: 0.5, sm: 0.5 },
                  px: { xs: 0.75, sm: 1 },
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                <Place
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: 16, sm: 18 },
                    opacity: 0.8
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      color: theme.palette.text.secondary,
                      mb: 0.25
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: item.value === 'Not specified' ? theme.palette.text.disabled : theme.palette.text.primary,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      fontWeight: item.value !== 'Not specified' ? 500 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={item.value}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default GameLocationInfo
