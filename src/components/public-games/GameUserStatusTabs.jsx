import CustomTabList from '@/@core/components/mui/TabList'
import { TabContext } from '@mui/lab'
import { Tab, Tabs } from '@mui/material'

const GameUserStatusTabs = ({ value, onChange }) => {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'lobby', label: 'Lobby' },
    { value: 'live', label: 'Live' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'registered', label: 'Registered' },
    { value: 'missed', label: 'Missed' },
    { value: 'completed', label: 'You Finished' },
    // { value: 'inProgress', label: 'Currently Playing' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

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
        {statuses.map(status => (
          <Tab
            key={status.value}
            value={status.value}
            label={status.label}
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          />
        ))}
      </CustomTabList>
    </TabContext>
  )
}

export default GameUserStatusTabs
