import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  FormHelperText
} from '@mui/material';

const QuizSelection = ({ quizzes, selectedQuizzes, setSelectedQuizzes, errors, setErrors }) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.selectedQuizzes}>
      <InputLabel>Select Quizzes</InputLabel>
      <Select
        name='quiz'
        value={selectedQuizzes}
        label='Select Quizzes'
        onChange={e => {
          const value = e.target.value;
          if (value[value.length - 1] === 'any-quiz') {
            setSelectedQuizzes(['any-quiz']);
          } else {
            const newSelection = value.filter(v => v !== 'any-quiz');
            setSelectedQuizzes(newSelection.length === 0 ? ['any-quiz'] : newSelection);
          }
        }}
        onFocus={() => setErrors(prev => ({ ...prev, selectedQuizzes: '' }))}
        required
        multiple
        renderValue={selected => {
          if (selected.includes('any-quiz')) return 'Sponsor Any Quiz';
          return selected.map(id => quizzes.find(q => q._id === id)?.title || id).join(', ');
        }}
      >
        <MenuItem key='any-quiz' value='any-quiz'>
          <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
            <Grid item xs={12}>
              <Typography variant='body2' noWrap={false}>
                <Box component='span' fontWeight='bold'>Sponsor Any Quiz</Box>
              </Typography>
              <Typography variant='body2' noWrap={false}>
                <Box component='span' sx={{ color: 'text.secondary', mx: 0.5 }}>
                  Will be applied to all available quizzes
                </Box>
              </Typography>
            </Grid>
          </Grid>
        </MenuItem>

        {quizzes.map(quiz => (
          <MenuItem key={quiz._id} value={quiz._id}>
            <Grid container alignItems='center' spacing={2} justifyContent='space-between'>
              <Grid item xs={8}>
                <Grid container alignItems='center' spacing={2}>
                  <Grid item>
                    <img
                      src={quiz?.thumbnail || 'https://via.placeholder.com/150x150'}
                      alt={quiz.title}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant='body2' noWrap={false}>
                      <Box component='span' fontWeight='bold'>{quiz.title}</Box>
                      <Box component='span' sx={{ color: 'text.secondary', mx: 0.5 }}>- by</Box>
                      <Box component='span'>{quiz.createdBy}</Box>
                    </Typography>
                    <Typography variant='body2' color='textSecondary' noWrap>
                      {quiz.details}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errors.selectedQuizzes || 'Select a quiz'}</FormHelperText>
    </FormControl>
  );
};

export default QuizSelection;