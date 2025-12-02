import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  FormHelperText,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';

const QuizSelection = ({ quizzes, selectedQuizzes, setSelectedQuizzes, errors, setErrors }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <FormControl
      fullWidth
      sx={{
        mb: { xs: 2.5, sm: 3 },
        '& .MuiOutlinedInput-root': {
          backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
          '& fieldset': {
            borderColor: isDarkMode ? alpha(theme.palette.divider, 0.3) : undefined
          },
          '&:hover fieldset': {
            borderColor: isDarkMode ? alpha(theme.palette.primary.main, 0.5) : undefined
          },
          '&.Mui-focused fieldset': {
            borderColor: isDarkMode ? theme.palette.primary.main : undefined
          }
        },
        '& .MuiInputBase-input': {
          color: isDarkMode ? theme.palette.text.primary : undefined,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        },
        '& .MuiInputLabel-root': {
          color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }
      }}
      error={!!errors.selectedQuizzes}
    >
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
                    <Box
                      component="img"
                      src={quiz?.thumbnail || 'https://via.placeholder.com/150x150'}
                      alt={quiz.title}
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${alpha(theme.palette.divider, isDarkMode ? 0.3 : 0.2)}`
                      }}
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
      <FormHelperText
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined
        }}
      >
        {errors.selectedQuizzes || 'Select a quiz'}
      </FormHelperText>
    </FormControl>
  );
};

export default QuizSelection;