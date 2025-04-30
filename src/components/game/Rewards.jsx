import React, { useState } from 'react';
import RewardForm from './RewardForm';
import RewardsList from './RewardsList';
import { Button } from '@mui/material';

function Rewards({ sponsors }) {
  const [isRewardFormOpen, setIsRewardFormOpen] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [editingReward, setEditingReward] = useState(null);

  const handleCloseRewardForm = () => {
    setIsRewardFormOpen(false);
    setEditingReward(null);
  };

  const handleSubmitReward = (submissionData) => {
    if (editingReward) {
      setRewards(prev => prev.map(reward => 
        reward.position === editingReward.position ? submissionData : reward
      ));
    } else {
      setRewards(prev => [...prev, submissionData]);
    }
    handleCloseRewardForm();
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setIsRewardFormOpen(true);
  };

  const handleDeleteReward = (position) => {
    setRewards(prev => prev.filter(reward => reward.position !== position));
  };

  const occupiedPositions = rewards.map(reward => reward.position);

  return (
    <>
      <Button
        fullWidth
        color="primary"
        component='label'
        variant="contained"
        sx={{ 
          color: 'white', 
          mb: 4,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 'medium'
        }}
        onClick={() => setIsRewardFormOpen(true)}
        startIcon={<i className="ri-add-line" />}
      >
        Add New Reward
      </Button>

      <RewardsList
        rewards={rewards}
        sponsors={sponsors}
        onEdit={handleEditReward}
        onDelete={handleDeleteReward}
      />

      {isRewardFormOpen && (
        <RewardForm
          open={isRewardFormOpen}
          onClose={handleCloseRewardForm}
          sponsors={sponsors}
          onSubmit={handleSubmitReward}
          editingReward={editingReward}
          occupiedPositions={editingReward ? 
            occupiedPositions.filter(p => p !== editingReward.position) : 
            occupiedPositions}
        />
      )}
    </>
  );
}

export default Rewards;