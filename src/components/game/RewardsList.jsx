import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Stack,
  Divider,
  Box
} from '@mui/material';
import IconButtonTooltip from '@/components/IconButtonTooltip'

const RewardsList = ({ rewards, sponsors, onEdit, onDelete }) => {
  const getPositionSuffix = (position) => {
    switch (position) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${position}th`;
    }
  };

  const getRewardTypeChip = (type) => {
    const typeStyles = {
      cash: {
        bgcolor: 'rgba(76, 175, 80, 0.1)',
        color: '#2e7d32',
        icon: 'ri-money-dollar-circle-fill',
        borderColor: '#2e7d32'
      },
      physicalGift: {
        bgcolor: 'rgba(255, 152, 0, 0.1)',
        color: '#e65100',
        icon: 'ri-gift-fill',
        borderColor: '#e65100'
      },
      other: {
        bgcolor: 'rgba(156, 39, 176, 0.1)',
        color: '#7b1fa2',
        icon: 'ri-star-fill',
        borderColor: '#7b1fa2'
      }
    };
  
    const style = typeStyles[type] || typeStyles.other;
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <i 
                className={style.icon} 
                style={{ 
                  fontSize: '16px',
                  color: style.color
                }} 
              />
              <span style={{ textTransform: 'capitalize' }}>
                {type}
              </span>
            </Box>
          }
          size="small"
          variant="outlined"
          sx={{
            borderColor: style.borderColor,
            backgroundColor: style.bgcolor,
            color: style.color,
            fontWeight: '500',
            height: '24px',
            '& .MuiChip-label': {
              px: 1,
              py: 0.5
            }
          }}
        />
      </Box>
    );
  };

  // Calculate total reward value for position
  const calculateTotalReward = (reward) => {
    return reward.numberOfPrizes * reward.rewardValuePerPrize;
  };

  const sortedRewards = rewards.sort((a, b)=> +a.position - +b.position)

  return (
    <Grid container spacing={3}>
      {sortedRewards.map((reward) => (
        <Grid item xs={12} sm={6} lg={4} key={reward.position}>
          <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: `4px solid ${
              reward.position === 1 ? '#c300ff' : 
              reward.position === 2 ? '#FFD700' : 
              reward.position === 3 ? '#d1022f' : 
              reward.position === 4 ? '#CD7F32' : '#1976d2'
            }`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
            }
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <div className='flex gap-3 items-center'>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {getPositionSuffix(reward.position)} Prize
                </Typography>
                {getRewardTypeChip(reward.rewardType)}
                </div>
                
                <Box>
                  <IconButtonTooltip title='Edit' 
                    onClick={() => onEdit(reward)}
                    color="primary"
                    size="small"
                  >
                    <i className='ri-edit-line' />
                  </IconButtonTooltip>
                  <IconButtonTooltip title='Delete' 
                    onClick={() => onDelete(reward.position)}
                    color="error"
                    size="small"
                  >
                    <i className='ri-delete-bin-line' />
                  </IconButtonTooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Stack spacing={1.5} mt={2}>

              <Box className='flex gap-5 items-center'>
                  <Typography variant="caption" color="text.secondary">
                    Number of Prizes
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {reward.numberOfPrizes}
                  </Typography>
                </Box>

                <Box className='flex gap-5 items-center'>
                  <Typography variant="caption" color="text.secondary">
                    Value per Prize
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{reward.rewardValuePerPrize}
                  </Typography>
                </Box>

              <Box sx={{
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  borderRadius: 1,
                  p: 1.5,
                  border: '1px solid rgba(25, 118, 210, 0.1)'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                      Total Reward Value
                    </Typography>
                    <Typography variant="h6" fontWeight="700" color="primary">
                      ₹{calculateTotalReward(reward)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sponsors
                  </Typography>
                  {reward.sponsors.length > 0 ? (
                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                      {reward.sponsors.map(id => {
                        const sponsor = sponsors.find(sp => sp._id === id);
                        const formattedAmt = new Intl.NumberFormat(undefined, {
                            style: "currency", currency: "INR"
                        }).format(sponsor.sponsorshipAmount)
                        return sponsor ? (
                          <Chip
                            key={id}
                            label={`${sponsor.email} - ${formattedAmt}`}
                            size="small"
                            variant="outlined"
                          />
                        ) : null;
                      })}
                    </Stack>
                  ) : (
                    <Typography variant="body2" fontStyle="italic">
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
  );
};

export default RewardsList;