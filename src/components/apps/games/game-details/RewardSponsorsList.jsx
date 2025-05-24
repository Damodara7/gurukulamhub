import React from 'react'
import { Box, Typography } from '@mui/material'
import { AccountCircle, AttachMoney, CardGiftcard, Star, Info } from '@mui/icons-material'

function RewardSponsorCard({ sponsors }) {
  return (
    <>
      {sponsors.map(sponsor => (
        <Box
          key={sponsor._id}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
            //   display: showSponsors ? 'block' : 'none'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountCircle color='action' sx={{ mr: 1 }} />
            <Typography variant='subtitle2' fontWeight='medium'>
              {sponsor.email}
            </Typography>
          </Box>

          {sponsor.rewardDetails.rewardType === 'cash' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney color='success' />
              <Typography variant='body1' fontWeight='bold'>
                {sponsor.rewardDetails.rewardValue} {sponsor.rewardDetails.currency}
              </Typography>
            </Box>
          ) : sponsor.rewardDetails.rewardType === 'physicalGift' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CardGiftcard color='warning' />
              <Box>
                <Typography variant='body1' fontWeight='bold'>
                  {sponsor.rewardDetails.nonCashReward}
                  {sponsor.rewardDetails.numberOfNonCashRewards > 1 &&
                    ` ×${sponsor.rewardDetails.numberOfNonCashRewards}`}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color='info' />
              <Typography variant='body1' fontWeight='bold'>
                {sponsor.rewardDetails.customRewardDescription}
              </Typography>
            </Box>
          )}

          {sponsor.rewardDetails.rewardNote && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Info color='action' fontSize='small' />
              <Typography variant='caption' color='text.secondary'>
                {sponsor.rewardDetails.rewardNote}
              </Typography>
            </Box>
          )}
        </Box>
      ))}
    </>
  )
}

export default RewardSponsorCard
