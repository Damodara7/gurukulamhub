import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack
} from '@mui/material';
import { Place } from '@mui/icons-material';

function GameLocationInfo({game}) {
  const locationItems = [
    { label: 'Country', value: game.location?.country || 'Not specified' },
    { label: 'Region', value: game.location?.region || 'Not specified' },
    { label: 'City', value: game.location?.city || 'Not specified' }
  ];

  return (
    <Grid item xs={12} md={6}>
      <Card 
        sx={{
          height: '100%',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.98)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(102, 126, 234, 0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography 
            variant='h6' 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: '#1a1a1a',
              fontSize: '1.1rem'
            }}
          >
            <Place sx={{ color: '#667eea', fontSize: 22 }} />
            Location Details
          </Typography>
          <Stack spacing={1.5}>
            {locationItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 0.5,
                  px: 1,
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)'
                  }
                }}
              >
                <Place 
                  sx={{ 
                    color: '#667eea', 
                    fontSize: 18,
                    opacity: 0.8
                  }} 
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.8rem',
                      color: '#666',
                      mb: 0.25
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: item.value === 'Not specified' ? '#999' : '#1a1a1a',
                      fontSize: '0.9rem',
                      fontWeight: item.value !== 'Not specified' ? 500 : 400
                    }}
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