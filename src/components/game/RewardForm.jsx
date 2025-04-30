import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  IconButton
} from '@mui/material';
import MultiSelect from '../MultiSelect';
import IconButtonTooltip from '@/components/IconButtonTooltip'

const RewardForm = ({ sponsors, onClose, open, onSubmit, editingReward, occupiedPositions }) => {
  const [formData, setFormData] = useState({
    position: '',
    rewardType: 'cash',
    numberOfPrizes: 1,
    rewardValuePerPrize: '',
    sponsors: []
  });

  const [selectedSponsors, setSelectedSponsors] = useState([]);

  useEffect(() => {
    if (editingReward) {
      setFormData(editingReward);
      setSelectedSponsors(editingReward.sponsors);
    } else {
      setFormData({
        position: '',
        rewardType: 'cash',
        numberOfPrizes: 1,
        rewardValuePerPrize: '',
        sponsors: []
      });
      setSelectedSponsors([]);
    }
  }, [editingReward, open]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const submissionData = {
      ...formData,
      sponsors: selectedSponsors,
      totalRewardValueForPosition: (+formData.numberOfPrizes) * (+formData.rewardValuePerPrize)
    };
    onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle className='flex flex-col gap-2 text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {editingReward ? 'Edit Reward' : 'Add Reward'}
      </DialogTitle>
      <DialogContent>
        <IconButtonTooltip title='Close' onClick={onClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButtonTooltip>

        <Box sx={{ mx: 'auto', p: 3 }}>
          <Grid container spacing={3}>
            {/* Position Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  name='position'
                  value={formData.position}
                  onChange={handleChange}
                  label='Position'
                  required
                  disabled={!!editingReward}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <MenuItem 
                      key={num} 
                      value={num}
                      disabled={occupiedPositions.includes(num)}
                    >
                      {num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : `${num}th`}
                      {occupiedPositions.includes(num) && ' (occupied)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Rest of your form fields (same as before) */}
            {/* Reward Type Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Reward Type</InputLabel>
                <Select
                  name='rewardType'
                  value={formData.rewardType}
                  onChange={handleChange}
                  label='Reward Type'
                  required
                >
                  <MenuItem value='cash'>Cash</MenuItem>
                  <MenuItem value='physicalGift'>Physical Gift</MenuItem>
                  <MenuItem value='other'>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Number of Prizes Select */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Number of Prizes</InputLabel>
                <Select
                  name='numberOfPrizes'
                  value={formData.numberOfPrizes}
                  onChange={handleChange}
                  label='Number of Prizes'
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reward Value Input */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Reward Value Per Prize'
                name='rewardValuePerPrize'
                type='number'
                value={formData.rewardValuePerPrize}
                onChange={handleChange}
                required
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            {/* Sponsors MultiSelect */}
            <Grid item xs={12}>
              <MultiSelect
                label='Select Sponsors'
                placeholder='Select Sponsors'
                selectedValues={selectedSponsors}
                onChange={values => setSelectedSponsors(values)}
                defaultAll={false}
                options={sponsors.map(sp => {
                  const formattedAmt = new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: 'INR'
                  }).format(sp.sponsorshipAmount);
                  return {
                    value: sp._id,
                    optionLabel: (
                      <>
                        <Grid container alignItems='center' spacing={2}>
                          <Grid item>
                            <Typography variant='body1' fontWeight='bold'>
                              {sp.email}
                            </Typography>
                            <Typography variant='body2' fontWeight='bold' color='textSecondary'>
                              {formattedAmt}
                            </Typography>
                          </Grid>
                        </Grid>
                      </>
                    ),
                    selectedLabel: (
                      <Typography>
                        {`${sp.email} - `}
                        <b>{formattedAmt}</b>
                      </Typography>
                    )
                  };
                })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSubmit}
          component='label'
          sx={{ color: 'white' }}
          variant='contained'
          color='primary'
          fullWidth
        >
          {editingReward ? 'Update Reward' : 'Save Reward'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RewardForm;