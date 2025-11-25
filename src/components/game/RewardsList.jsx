import React from 'react'
import { Card, CardContent, Typography, IconButton, Grid, Chip, Stack, Divider, Box, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import IconButtonTooltip from '@/components/IconButtonTooltip'

const RewardsList = ({ rewards, sponsors, onEdit, onDelete }) => {
  const theme = useTheme()
  const getPositionSuffix = position => {
    switch (position) {
      case 1:
        return '1st'
      case 2:
        return '2nd'
      case 3:
        return '3rd'
      default:
        return `${position}th`
    }
  }

  const getRewardTypeChip = type => {
    const typeStyles = {
      cash: {
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.15) : 'rgba(76, 175, 80, 0.1)',
        color: theme.palette.success.main,
        icon: 'ri-money-dollar-circle-fill',
        borderColor: theme.palette.success.main
      },
      physicalGift: {
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.15) : 'rgba(255, 152, 0, 0.1)',
        color: theme.palette.warning.main,
        icon: 'ri-gift-fill',
        borderColor: theme.palette.warning.main
      },
      other: {
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.main, 0.15) : 'rgba(156, 39, 176, 0.1)',
        color: theme.palette.secondary.main,
        icon: 'ri-star-fill',
        borderColor: theme.palette.secondary.main
      }
    }

    const style = typeStyles[type] || typeStyles.other

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}>
              <i
                className={style.icon}
                style={{
                  fontSize: '16px',
                  color: style.color
                }}
              />
              <span style={{ textTransform: 'capitalize', fontSize: 'inherit' }}>{type}</span>
            </Box>
          }
          size='small'
          variant='outlined'
          sx={{
            borderColor: style.borderColor,
            backgroundColor: style.bgcolor,
            color: style.color,
            fontWeight: '500',
            height: { xs: 22, sm: 24 },
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            '& .MuiChip-label': {
              px: { xs: 0.75, sm: 1 },
              py: 0.5
            }
          }}
        />
      </Box>
    )
  }

  // Calculate total reward value for position
  const calculateTotalReward = reward => {
    return reward.numberOfPrizes * reward.rewardValuePerPrize
  }

  const sortedRewards = rewards.sort((a, b) => +a.position - +b.position)

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {sortedRewards.map(reward => (
        <Grid item xs={12} sm={6} lg={4} key={reward.position}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: theme.palette.background.paper,
              borderLeft: `4px solid ${
                reward.position === 1
                  ? theme.palette.mode === 'dark'
                    ? theme.palette.secondary.main
                    : '#c300ff'
                  : reward.position === 2
                    ? theme.palette.mode === 'dark'
                      ? theme.palette.warning.main
                      : '#FFD700'
                    : reward.position === 3
                      ? theme.palette.mode === 'dark'
                        ? theme.palette.error.main
                        : '#d1022f'
                      : reward.position === 4
                        ? theme.palette.mode === 'dark'
                          ? theme.palette.warning.dark
                          : '#CD7F32'
                        : theme.palette.primary.main
              }`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-4px)' },
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? `0 6px 12px ${alpha(theme.palette.common.black, 0.4)}`
                    : '0 6px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 1, sm: 0 }}
              >
                <Box display='flex' gap={{ xs: 1.5, sm: 2, md: 3 }} alignItems='center' flexWrap='wrap'>
                  <Typography
                    variant='h6'
                    fontWeight='bold'
                    color='primary'
                    sx={{ fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                  >
                    {getPositionSuffix(reward.position)} Prize
                  </Typography>
                  {getRewardTypeChip(reward.rewardType)}
                </Box>

                <Box display='flex' gap={{ xs: 0.5, sm: 1 }}>
                  <IconButtonTooltip title='Edit' onClick={() => onEdit(reward)} color='primary' size='small'>
                    <i className='ri-edit-line' />
                  </IconButtonTooltip>
                  <IconButtonTooltip
                    title='Delete'
                    onClick={() => onDelete(reward.position)}
                    color='error'
                    size='small'
                  >
                    <i className='ri-delete-bin-line' />
                  </IconButtonTooltip>
                </Box>
              </Box>

              <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

              <Stack spacing={{ xs: 1, sm: 1.5 }} mt={{ xs: 1.5, sm: 2 }}>
                <Box
                  className='flex gap-5 items-center'
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 0.5, sm: 5 }
                  }}
                >
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Number of Prizes
                  </Typography>
                  <Typography variant='body1' fontWeight='medium' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {reward.numberOfPrizes}
                  </Typography>
                </Box>

                <Box
                  className='flex gap-5 items-center'
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 0.5, sm: 5 }
                  }}
                >
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Value per Prize
                  </Typography>
                  <Typography variant='body1' fontWeight='bold' sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    ₹{reward.rewardValuePerPrize}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.15)
                        : 'rgba(25, 118, 210, 0.05)',
                    borderRadius: 1,
                    p: { xs: 1, sm: 1.5 },
                    border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`
                  }}
                >
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    gap={{ xs: 0.5, sm: 0 }}
                  >
                    <Typography
                      variant='subtitle2'
                      fontWeight='600'
                      color='text.secondary'
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Total Reward Value
                    </Typography>
                    <Typography
                      variant='h6'
                      fontWeight='700'
                      color='primary'
                      sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      ₹{calculateTotalReward(reward)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Sponsors
                  </Typography>
                  {reward.sponsors.length > 0 ? (
                    <Stack
                      direction='row'
                      spacing={{ xs: 0.5, sm: 1 }}
                      mt={{ xs: 0.75, sm: 1 }}
                      flexWrap='wrap'
                      useFlexGap
                      sx={{ gap: { xs: 0.5, sm: 1 } }}
                    >
                      {reward.sponsors.map(id => {
                        const sponsor = sponsors.find(sp => sp._id === id)
                        const formattedAmt = new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'INR'
                        }).format(sponsor.sponsorshipAmount)
                        return sponsor ? (
                          <Chip
                            key={id}
                            label={`${sponsor.email} - ${formattedAmt}`}
                            size='small'
                            variant='outlined'
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 22, sm: 24 },
                              '& .MuiChip-label': {
                                px: { xs: 0.75, sm: 1 },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: { xs: '150px', sm: 'none' }
                              }
                            }}
                            title={`${sponsor.email} - ${formattedAmt}`}
                          />
                        ) : null
                      })}
                    </Stack>
                  ) : (
                    <Typography
                      variant='body2'
                      fontStyle='italic'
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: { xs: 0.5, sm: 0.75 } }}
                    >
                      No sponsors assigned
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default RewardsList
