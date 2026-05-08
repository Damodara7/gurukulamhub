import React, { useState, useEffect } from 'react'
import { Grid, Typography, Box, IconButton, Collapse, Stack, useTheme, alpha } from '@mui/material'
import { Title, Info, Translate, Key, Quiz as QuizIcon, Star } from '@mui/icons-material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

const QuizDetails = ({ quiz }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const theme = useTheme()

  // Auto-minimize after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!quiz) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
        <Typography variant='body1' color='error.main' fontWeight={600}>
          *Please select a quiz or create a new one
        </Typography>
      </Box>
    )
  }

  const detailItems = [
    {
      icon: <Title sx={{ fontSize: 18, color: 'white' }} />,
      label: 'Title',
      value: quiz.title || 'N/A',
      iconBg: theme.palette.primary.main,
      iconBgPath: 'primary.main'
    },
    {
      icon: <Info sx={{ fontSize: 18, color: 'white' }} />,
      label: 'Details',
      value: quiz.details || 'N/A',
      iconBg: theme.palette.secondary.main,
      iconBgPath: 'secondary.main'
    },
    {
      icon: <Translate sx={{ fontSize: 18, color: 'white' }} />,
      label: 'Language',
      value: quiz.language?.name || 'N/A',
      iconBg: theme.palette.info.main,
      iconBgPath: 'info.main'
    },
    {
      icon: <Key sx={{ fontSize: 18, color: 'white' }} />,
      label: 'Quiz ID',
      value: quiz.id || 'N/A',
      iconBg: theme.palette.warning.main,
      iconBgPath: 'warning.main'
    },
    {
      icon: <Star sx={{ fontSize: 18, color: 'white' }} />,
      label: 'Weightage',
      value: quiz.weightage || 1,
      iconBg: theme.palette.success.main,
      iconBgPath: 'success.main'
    }
  ]

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
        boxShadow: theme.palette.mode === 'dark' ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}
    >
      {/* Title with Toggle Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QuizIcon sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant='h6' fontWeight={700} sx={{ color: 'text.primary' }}>
            Quiz Information
          </Typography>
        </Stack>

        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          size='small'
          sx={{
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2)
            }
          }}
        >
          <Typography variant='caption' fontWeight={600} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
            {isExpanded ? 'Hide' : 'Show'}
          </Typography>
          {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded} timeout={300}>
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            {detailItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(item.iconBg, 0.4),
                      boxShadow: `0 2px 8px ${alpha(item.iconBg, 0.1)}`
                    }
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      minWidth: 36,
                      borderRadius: 1.5,
                      bgcolor: item.iconBgPath,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.25
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: theme.palette.text.primary,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  )
}

export default QuizDetails
