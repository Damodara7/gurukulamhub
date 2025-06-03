import CustomTabList from '@/@core/components/mui/TabList'
import { TabContext } from '@mui/lab'
import { Box, Grid, Tab, Tabs } from '@mui/material'

const ReusableTabsList = ({ tabsList = [], value, onChange }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box className='flex justify-center'>
          <TabContext value={value}>
            <CustomTabList
              value={value}
              onChange={(_, newValue) => onChange(newValue)}
              variant='scrollable'
              pill='true'
              scrollButtons='auto'
              allowScrollButtonsMobile
            >
              {tabsList.map(status => (
                <Tab
                  key={status.value}
                  value={status.value}
                  label={status.label}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem'
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
