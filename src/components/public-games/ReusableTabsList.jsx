import CustomTabList from '@/@core/components/mui/TabList'
import { TabContext } from '@mui/lab'
import { Tab, Tabs } from '@mui/material'

const ReusableTabsList = ({ tabsList = [], value, onChange }) => {
  return (
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
  )
}

export default ReusableTabsList
