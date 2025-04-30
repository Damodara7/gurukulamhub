import React from 'react';
import { Fab, Typography, Box } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

export default function SearchNavigator({ searchFoundCount, searchFocusIndex, selectPrevMatch, selectNextMatch }) {
  return (
    <Box
      className="flex gap-2 items-center justify-end"
      sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
    >
      {/* Previous Match Button */}
      <Fab
        aria-label="Previous match"
        onClick={selectPrevMatch}
        color='secondary'
        component='label'
        style={{color: 'white'}}
        disabled={!searchFoundCount}
        size="small"
      >
        <ChevronLeftIcon fontSize='large' />
      </Fab>

      {/* Search Info */}
      <Typography
        variant="h5"
        sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}
      >
        {searchFoundCount > 0 ? searchFocusIndex + 1 : 0} / {searchFoundCount || 0}
      </Typography>

      {/* Next Match Button */}
      <Fab
        aria-label="Next match"
        onClick={selectNextMatch}
        disabled={!searchFoundCount}
        size="small"
        color='secondary'
        component='label'
        style={{color: 'white'}}
      >
        <ChevronRightIcon fontSize='large' />
      </Fab>
    </Box>
  );
}
