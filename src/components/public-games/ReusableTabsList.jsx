import CustomTabList from '@/@core/components/mui/TabList'
import { TabContext } from '@mui/lab'
import { Box, Grid, Tab, Tabs } from '@mui/material'

const ReusableTabsList = ({ tabsList = [], value, onChange }) => {
  return (
    <Grid container spacing={{ xs: 2, sm: 4, md: 6 }}>
      <Grid item xs={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none'
          }}
        >
          <TabContext value={value}>
            <CustomTabList
              value={value}
              onChange={(_, newValue) => onChange(newValue)}
              variant='scrollable'
              pill='true'
              scrollButtons='auto'
              allowScrollButtonsMobile
              sx={{
                width: '100%',
                maxWidth: '100%',
                '& .MuiTabs-scrollButtons': {
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                }
              }}
            >
              {tabsList.map(status => (
                <Tab
                  key={status.value}
                  value={status.value}
                  label={status.label}
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
                    px: { xs: 1.5, sm: 2, md: 3 },
                    py: { xs: 1, sm: 1.25 },
                    minHeight: { xs: 40, sm: 48 },
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                />
              ))}
            </CustomTabList>
          </TabContext>
        </Box>
      </Grid>
    </Grid>
  )
}

export default ReusableTabsList
