'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const AccountSettings = ({ tabContentList }) => {
  // States
  const [activeTab, setActiveTab] = useState('account')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList
            onChange={handleChange}
            variant='scrollable'
            pill='true'
            scrollButtons='auto'
            allowScrollButtonsMobile
          >
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='ri-group-line text-lg' />
                  Account
                </div>
              }
              value='account'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='ri-lock-unlock-line text-lg' />
                  Security
                </div>
              }
              value='security'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <HubOutlinedIcon />
                  Network Tree
                </div>
              }
              value='network-tree'
            />
            {/* <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='ri-bookmark-line text-lg' />
                  Billing & Plans
                </div>
              }
              value='billing-plans'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='ri-notification-3-line text-lg' />
                  Notifications
                </div>
              }
              value='notifications'
            />
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='ri-link text-lg' />
                  Connections
                </div>
              }
              value='connections'
            /> */}
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings

// 'use client'

// // React Imports
// import { useState } from 'react'

// // MUI Imports
// import Grid from '@mui/material/Grid'
// import Tab from '@mui/material/Tab'
// import TabContext from '@mui/lab/TabContext'
// import TabPanel from '@mui/lab/TabPanel'
// import HubOutlinedIcon from '@mui/icons-material/HubOutlined'

// // Component Imports
// import CustomTabList from '@core/components/mui/TabList'

// const AccountSettings = ({ tabContentList, children }) => {
//   // States
//   // const [activeTab, setActiveTab] = useState('account')

//   // const handleChange = (event, value) => {
//   //   setActiveTab(value)
//   // }

//   return (
//     <TabContext>
//       <Grid container spacing={6}>
//         <Grid item xs={12}>
//           <CustomTabList variant='scrollable' pill='true' scrollButtons='auto' allowScrollButtonsMobile>
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <i className='ri-group-line text-lg' />
//                   Account
//                 </div>
//               }
//               value='account'
//               // onClick={}
//               href='/pages/user-profile/account'
//             />
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <i className='ri-lock-unlock-line text-lg' />
//                   Security
//                 </div>
//               }
//               value='security'
//               href='/pages/user-profile/security'
//             />
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <HubOutlinedIcon />
//                   Network Tree
//                 </div>
//               }
//               value='network-tree'
//               href='/pages/user-profile/network-tree'
//             />
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <i className='ri-bookmark-line text-lg' />
//                   Billing & Plans
//                 </div>
//               }
//               value='billing-plans'
//               href='/pages/user-profile/billing-plans'
//             />
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <i className='ri-notification-3-line text-lg' />
//                   Notifications
//                 </div>
//               }
//               value='notifications'
//               href='/pages/user-profile/notifications'
//             />
//             <Tab
//               label={
//                 <div className='flex items-center gap-1.5'>
//                   <i className='ri-link text-lg' />
//                   Connections
//                 </div>
//               }
//               value='connections'
//               href='/pages/user-profile/connections'
//             />
//           </CustomTabList>
//         </Grid>
//         <Grid item xs={12}>
//           <TabPanel className='p-0'>{children}</TabPanel>
//         </Grid>
//       </Grid>
//     </TabContext>
//   )
// }

// export default AccountSettings
