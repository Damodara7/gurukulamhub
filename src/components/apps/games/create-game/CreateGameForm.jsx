import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// Reward position options
const POSITION_OPTIONS = [1, 2, 3, 4, 5];
const REWARD_TYPES = ['cash', 'physicalGift', 'other'];
const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP'];

// Initial form data
const initialFormData = {
  title: '',
  pin: Math.floor(100000 + Math.random() * 900000).toString(),
  description: '',
  quiz: '',
  startTime: new Date(),
  duration: 600, // 10 minutes in seconds
  promotionalVideoUrl: '',
  thumbnailPoster: '',
  requireRegistration: false,
  registrationEndTime: new Date(),
  maxPlayers: 100,
  tags: [],
  location: {
    country: '',
    region: '',
    city: ''
  },
  rewards: []
};

// Reward form component
const RewardForm = ({ reward, index, onUpdate, onRemove }) => {
  const [openSponsorDialog, setOpenSponsorDialog] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState(null);
  const [sponsorIndex, setSponsorIndex] = useState(-1);

  const handleAddSponsor = () => {
    setCurrentSponsor({
      email: '',
      rewardDetails: {
        rewardType: 'cash',
        rewardValue: 0,
        currency: 'INR',
        nonCashReward: '',
        numberOfNonCashRewards: 1
      }
    });
    setSponsorIndex(-1);
    setOpenSponsorDialog(true);
  };

  const handleEditSponsor = (sponsor, idx) => {
    setCurrentSponsor(JSON.parse(JSON.stringify(sponsor)));
    setSponsorIndex(idx);
    setOpenSponsorDialog(true);
  };

  const handleSaveSponsor = () => {
    const updatedReward = { ...reward };
    if (sponsorIndex >= 0) {
      updatedReward.sponsors[sponsorIndex] = currentSponsor;
    } else {
      updatedReward.sponsors.push(currentSponsor);
    }
    onUpdate(updatedReward);
    setOpenSponsorDialog(false);
  };

  const handleRemoveSponsor = (idx) => {
    const updatedReward = { ...reward };
    updatedReward.sponsors.splice(idx, 1);
    onUpdate(updatedReward);
  };

  const handleRewardChange = (field, value) => {
    const updatedReward = { ...reward, [field]: value };
    onUpdate(updatedReward);
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Reward for Position {reward.position}</Typography>
          <IconButton onClick={() => onRemove(index)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={reward.position}
                label="Position"
                onChange={(e) => handleRewardChange('position', e.target.value)}
              >
                {POSITION_OPTIONS.map((pos) => (
                  <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Number of Winners"
              type="number"
              value={reward.numberOfCandidatesForThisPosition}
              onChange={(e) => handleRewardChange(
                'numberOfCandidatesForThisPosition',
                parseInt(e.target.value) || 1
              )}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          Sponsors
        </Typography>

        {reward.sponsors.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            {reward.sponsors.map((sponsor, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                  <div>
                    <Typography>{sponsor.email}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sponsor.rewardDetails.rewardType === 'cash' ? (
                        `${sponsor.rewardDetails.currency} ${sponsor.rewardDetails.rewardValue}`
                      ) : (
                        `${sponsor.rewardDetails.numberOfNonCashRewards} x ${sponsor.rewardDetails.nonCashReward}`
                      )}
                    </Typography>
                  </div>
                  <div>
                    <IconButton size="small" onClick={() => handleEditSponsor(sponsor, idx)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveSponsor(idx)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                </Stack>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No sponsors added yet
          </Typography>
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSponsor}
        >
          Add Sponsor
        </Button>

        {/* Sponsor Dialog */}
        <Dialog open={openSponsorDialog} onClose={() => setOpenSponsorDialog(false)}>
          <DialogTitle>
            {sponsorIndex >= 0 ? 'Edit Sponsor' : 'Add Sponsor'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentSponsor?.email || ''}
                  onChange={(e) => setCurrentSponsor({
                    ...currentSponsor,
                    email: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Reward Type</InputLabel>
                  <Select
                    value={currentSponsor?.rewardDetails?.rewardType || 'cash'}
                    label="Reward Type"
                    onChange={(e) => setCurrentSponsor({
                      ...currentSponsor,
                      rewardDetails: {
                        ...currentSponsor.rewardDetails,
                        rewardType: e.target.value
                      }
                    })}
                  >
                    {REWARD_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {currentSponsor?.rewardDetails?.rewardType === 'cash' ? (
                <>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Reward Value"
                      type="number"
                      value={currentSponsor?.rewardDetails?.rewardValue || 0}
                      onChange={(e) => setCurrentSponsor({
                        ...currentSponsor,
                        rewardDetails: {
                          ...currentSponsor.rewardDetails,
                          rewardValue: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={currentSponsor?.rewardDetails?.currency || 'INR'}
                        label="Currency"
                        onChange={(e) => setCurrentSponsor({
                          ...currentSponsor,
                          rewardDetails: {
                            ...currentSponsor.rewardDetails,
                            currency: e.target.value
                          }
                        })}
                      >
                        {CURRENCY_OPTIONS.map((curr) => (
                          <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reward Description"
                      value={currentSponsor?.rewardDetails?.nonCashReward || ''}
                      onChange={(e) => setCurrentSponsor({
                        ...currentSponsor,
                        rewardDetails: {
                          ...currentSponsor.rewardDetails,
                          nonCashReward: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Number of Rewards"
                      type="number"
                      value={currentSponsor?.rewardDetails?.numberOfNonCashRewards || 1}
                      onChange={(e) => setCurrentSponsor({
                        ...currentSponsor,
                        rewardDetails: {
                          ...currentSponsor.rewardDetails,
                          numberOfNonCashRewards: parseInt(e.target.value) || 1
                        }
                      })}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSponsorDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSponsor} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// Main Game Form component
const GameForm = ({ initialValues, onSubmit, quizzes, onCancel }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [availablePositions, setAvailablePositions] = useState(POSITION_OPTIONS);

  // Update available positions when rewards change
  useEffect(() => {
    const usedPositions = formData.rewards.map(r => r.position);
    setAvailablePositions(POSITION_OPTIONS.filter(pos => !usedPositions.includes(pos)));
  }, [formData.rewards]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (like location.country)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleAddReward = () => {
    if (availablePositions.length > 0) {
      const newReward = {
        position: availablePositions[0],
        numberOfCandidatesForThisPosition: 1,
        sponsors: []
      };
      setFormData(prev => ({
        ...prev,
        rewards: [...prev.rewards, newReward]
      }));
    }
  };

  const handleUpdateReward = (index, updatedReward) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = updatedReward;
    setFormData(prev => ({
      ...prev,
      rewards: newRewards
    }));
  };

  const handleRemoveReward = (index) => {
    const newRewards = [...formData.rewards];
    newRewards.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      rewards: newRewards
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Game Details
          </Typography>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Game Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="6-digit PIN"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 6, pattern: '\\d{6}' }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Quiz</InputLabel>
            <Select
              name="quiz"
              value={formData.quiz}
              label="Quiz"
              onChange={handleChange}
              required
            >
              {quizzes.map((quiz) => (
                <MenuItem key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.tags}
            onChange={(event, newValue) => {
              setFormData(prev => ({ ...prev, tags: newValue }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Add tags" />
            )}
          />
        </Grid>

        {/* Date & Time */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Start Time"
            type="datetime-local"
            value={formData.startTime.toISOString().slice(0, 16)}
            onChange={(e) => handleDateChange('startTime', new Date(e.target.value))}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Duration (seconds)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            required
            inputProps={{ min: 60 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <AccessTimeIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Registration */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.requireRegistration}
                onChange={handleChange}
                name="requireRegistration"
              />
            }
            label="Require Registration"
          />
        </Grid>

        {formData.requireRegistration && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Registration End Time"
              type="datetime-local"
              value={formData.registrationEndTime.toISOString().slice(0, 16)}
              onChange={(e) => handleDateChange('registrationEndTime', new Date(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Max Players"
            name="maxPlayers"
            type="number"
            value={formData.maxPlayers}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Location (Optional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Region/State"
                name="location.region"
                value={formData.location.region}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Media */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Promotional Video URL"
            name="promotionalVideoUrl"
            value={formData.promotionalVideoUrl}
            onChange={handleChange}
            type="url"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Thumbnail Poster URL"
            name="thumbnailPoster"
            value={formData.thumbnailPoster}
            onChange={handleChange}
            type="url"
          />
        </Grid>

        {/* Rewards Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Rewards</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddReward}
              disabled={availablePositions.length === 0}
            >
              Add Reward
            </Button>
          </Stack>

          {formData.rewards.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No rewards added yet
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              {formData.rewards.map((reward, index) => (
                <RewardForm
                  key={index}
                  reward={reward}
                  index={index}
                  onUpdate={(updatedReward) => handleUpdateReward(index, updatedReward)}
                  onRemove={handleRemoveReward}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Game
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

export default GameForm;