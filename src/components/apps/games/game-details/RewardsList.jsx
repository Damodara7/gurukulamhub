import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  AttachMoney,
  CardGiftcard,
  Star,
  PeopleAlt,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import RewardSponsorsList from '@/components/apps/games/game-details/RewardSponsorsList'

function RewardsList({rewards}) {
  const [expandedRewards, setExpandedRewards] = useState({});

  const toggleSponsorVisibility = (position) => {
    setExpandedRewards(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  return (
    <Grid container spacing={2}>
      {rewards
        .sort((a, b) => a.position - b.position)
        .map(reward => (
          <Grid item xs={12} md={6} lg={4} key={reward.position}>
          <Card
            variant='outlined'
            sx={{
              borderLeft: `4px solid ${positionColors[reward.position]}`,
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 1
              }
            }}
          >
            <CardContent>
              {/* Reward Position Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  gap: 2
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: positionColors[reward.position],
                    width: 40,
                    height: 40,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  #{reward.position}
                </Avatar>
                <Box>
                  <Typography variant='h6' fontWeight='bold'>
                    {reward.numberOfWinnersForThisPosition} Winner
                    {reward.numberOfWinnersForThisPosition !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {getOrdinalSuffix(reward.position)} Place Prize
                  </Typography>
                </Box>
              </Box>

              {/* Reward Type Badge */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={
                    reward.sponsors[0]?.rewardDetails?.rewardType === 'cash'
                      ? 'Cash Prize'
                      : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift'
                        ? `Physical Gift - ${reward.sponsors[0]?.rewardDetails?.nonCashReward}`
                        : 'Custom Reward'
                  }
                  color={
                    reward.sponsors[0]?.rewardDetails?.rewardType === 'cash'
                      ? 'success'
                      : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift'
                        ? 'warning'
                        : 'info'
                  }
                  size='small'
                  icon={
                    reward.sponsors[0]?.rewardDetails?.rewardType === 'cash' ? (
                      <AttachMoney fontSize='small' />
                    ) : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift' ? (
                      <CardGiftcard fontSize='small' />
                    ) : (
                      <Star fontSize='small' />
                    )
                  }
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>

              {/* Summary Section */}
              <Box
                sx={{
                  mt: 'auto',
                  pt: 1,
                  borderTop: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                {reward.sponsors[0]?.rewardDetails?.rewardType === 'cash' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body1' fontWeight='bold'>
                      Total:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney color='success' />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                        <Typography variant='body1' fontWeight={600}>
                          {reward.sponsors[0]?.rewardDetails.rewardValue} {reward.sponsors[0]?.rewardDetails?.currency || ''}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({reward.rewardValuePerWinner} {reward.sponsors[0]?.rewardDetails?.currency || ''} per winner)
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : reward.sponsors[0]?.rewardDetails?.rewardType === 'physicalGift' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body1' fontWeight='bold'>
                      Total:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CardGiftcard color='warning' />
                      <Typography variant='body1' fontWeight={600}>
                        {(() => {
                          const totalItems = reward.sponsors.reduce(
                            (sum, sponsor) => sum + (sponsor.rewardDetails.numberOfNonCashRewards || 0),
                            0
                          );
                          return `${totalItems} ${totalItems > 1 ? 'items' : 'item'}`;
                        })()}
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (1 item per winner)
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleAlt fontSize='small' color='action' />
                    <Typography variant='caption' color='text.secondary'>
                      Sponsored by {reward.sponsors.length} {reward.sponsors.length === 1 ? 'sponsor' : 'sponsors'}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => toggleSponsorVisibility(reward.position)}
                    aria-label={expandedRewards[reward.position] ? 'Hide sponsors' : 'Show sponsors'}
                  >
                    {expandedRewards[reward.position] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </Box>
              </Box>
              
              {/* Reward Details - Sponsors */}
              <Collapse in={expandedRewards[reward.position]}>
                <Box sx={{ mt: 1, ml: 3 }}>
                  <RewardSponsorsList sponsors={reward.sponsors} />
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default RewardsList;


const positionColors = {
    1: '#ffd700', // Gold
    2: '#c0c0c0', // Silver
    3: '#cd7f32', // Bronze
    4: '#a0a0a0',
    5: '#808080'
  }
  
  function getOrdinalSuffix(number) {
    const j = number % 10,
      k = number % 100
    if (j === 1 && k !== 11) return number + 'st'
    if (j === 2 && k !== 12) return number + 'nd'
    if (j === 3 && k !== 13) return number + 'rd'
    return number + 'th'
  }