import React from 'react'
import { TextField, Grid, Typography, InputLabel, FormControl, Select, MenuItem, alpha, useTheme } from '@mui/material'

const RewardFields = ({ rewardType, formData, handleChange, errors }) => {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  if (rewardType === 'cash') {
    return (
      <TextField
        fullWidth
        sx={{
          mb: { xs: 2.5, sm: 3 },
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            ...(isDarkMode && {
              '& fieldset': {
                borderColor: alpha(theme.palette.divider, 0.3)
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            })
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? theme.palette.text.primary : undefined
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          },
          '& .MuiFormHelperText-root': {
            color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}
        label='Sponsorship Amount (INR)'
        type='text'
        name='sponsorshipAmount'
        value={formData.sponsorshipAmount}
        onChange={e => {
          const value = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(\d)/, '$1')
          handleChange({ target: { name: e.target.name, value } })
        }}
        error={!!errors.sponsorshipAmount}
        helperText={errors.sponsorshipAmount}
      />
    )
  }

  if (rewardType === 'physicalGift') {
    return (
      <>
        <TextField
          fullWidth
          sx={{
            mb: { xs: 2.5, sm: 3 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              ...(isDarkMode && {
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.3)
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.5)
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              })
            },
            '& .MuiInputBase-input': {
              color: isDarkMode ? theme.palette.text.primary : undefined
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            },
            '& .MuiFormHelperText-root': {
              color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
          label='Item Name'
          name='nonCashItem'
          value={formData.nonCashItem}
          onChange={handleChange}
          error={!!errors.nonCashItem}
          helperText={errors.nonCashItem}
        />
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Quantity'
              type='number'
              name='numberOfNonCashItems'
              value={formData.numberOfNonCashItems}
              onChange={handleChange}
              error={!!errors.numberOfNonCashItems}
              helperText={errors.numberOfNonCashItems}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  ...(isDarkMode && {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.5)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  })
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? theme.palette.text.primary : undefined
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                },
                '& .MuiFormHelperText-root': {
                  color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label='Estimated value per item (INR)'
              type='number'
              name='rewardValuePerItem'
              value={formData.rewardValuePerItem}
              onChange={handleChange}
              error={!!errors.rewardValue}
              helperText={errors.rewardValue}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  ...(isDarkMode && {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.3)
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.5)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  })
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? theme.palette.text.primary : undefined
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                },
                '& .MuiFormHelperText-root': {
                  color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          sx={{
            mt: { xs: 2.5, sm: 3 },
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              ...(isDarkMode && {
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.3)
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.5)
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              })
            },
            '& .MuiInputBase-input': {
              color: isDarkMode ? theme.palette.text.primary : undefined
            },
            '& .MuiInputLabel-root': {
              color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }
          }}
          label='Additional details about the gift'
          name='rewardDescription'
          value={formData.rewardDescription}
          onChange={handleChange}
          multiline
          rows={2}
        />
      </>
    )
  }

  return null
}

export default function RewardSection({ rewardTypeOptions, rewardType, formData, handleChange, errors, setErrors, setRewardType }) {
  const theme = useTheme()
  const isDarkMode = theme.palette.mode === 'dark'

  return (
    <>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          mt: { xs: 1.5, sm: 2 },
          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
        }}
      >
        Reward Type
      </Typography>
      <FormControl
        fullWidth
        sx={{
          mb: { xs: 2.5, sm: 3 },
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? alpha(theme.palette.background.default, 0.6) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            ...(isDarkMode && {
              '& fieldset': {
                borderColor: alpha(theme.palette.divider, 0.3)
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            })
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? theme.palette.text.primary : undefined
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? alpha(theme.palette.text.secondary, 0.8) : undefined,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }
        }}
        error={!!errors.rewardType}
      >
        <InputLabel id='reward-type-label'>Select Reward Type</InputLabel>
        <Select
          labelId='reward-type-label'
          value={rewardType}
          label='Select Reward Type'
          onChange={e => {
            setRewardType(e.target.value)
            if (errors.rewardType) setErrors({ ...errors, rewardType: '' })
          }}
        >
          {rewardTypeOptions.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <RewardFields rewardType={rewardType} formData={formData} handleChange={handleChange} errors={errors} />
    </>
  )
}
