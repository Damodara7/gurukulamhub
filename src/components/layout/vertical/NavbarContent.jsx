// Third-party Imports
'use client'
import classnames from 'classnames'
import { usePathname } from 'next/navigation'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import MetricsDropdown from '@components/layout/shared/MetricsDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import JoinGameButton from '@components/game/JoinGameButton'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Vars
const shortcuts = [
  {
    url: '/apps/calendar',
    icon: 'ri-calendar-line',
    title: 'Calendar',
    subtitle: 'Appointments'
  },
  {
    url: '/apps/invoice/list',
    icon: 'ri-file-list-3-line',
    title: 'Invoice App',
    subtitle: 'Manage Accounts'
  },
  {
    url: '/apps/user/list',
    icon: 'ri-user-3-line',
    title: 'Users',
    subtitle: 'Manage Users'
  },
  {
    url: '/apps/roles',
    icon: 'ri-computer-line',
    title: 'Role Management',
    subtitle: 'Permissions'
  },
  {
    url: '/dashboards/crm',
    icon: 'ri-pie-chart-2-line',
    title: 'Dashboard',
    subtitle: 'User Dashboard'
  }
  // {
  //   url: '/pages/account-settings',
  //   icon: 'ri-settings-4-line',
  //   title: 'Settings',
  //   subtitle: 'Account Settings'
  // }
]

//title, stats, trendNumber, trend, chipText, chipColor
const metrics = [
  {
    url: '/apps/calendar',
    icon: 'ri-group-line',
    iconColor: 'primary',
    title: 'Network Points',
    stats: '123456',
    trendNumber: '1000',
    trend: 'positive',
    chipText: '500 Referrals',
    chipColor: 'primary'
  },
  {
    url: '/apps/calendar',
    icon: 'ri-book-marked-line',
    iconColor: 'error',
    title: 'Learning Points',
    stats: '92304',
    trendNumber: '10',
    trend: 'positive',
    chipText: '50 Courses',
    chipColor: 'primary'
  },
  {
    url: '/apps/calendar',
    icon: 'ri-questionnaire-fill',
    iconColor: 'warning',
    title: 'Quiz Points',
    stats: '92304',
    trendNumber: '10',
    trend: 'positive',
    chipText: '50 Quizzes',
    chipColor: 'primary'
  },
  {
    url: '/apps/calendar',
    icon: 'ri-user-star-fill',
    iconColor: 'success',
    title: 'Competitions',
    stats: '3',
    trendNumber: '1',
    trend: 'positive',
    chipText: 'Ramayana Quiz1',
    chipColor: 'success'
  },
  {
    url: '/apps/calendar',
    icon: 'ri-questionnaire-fill',
    iconColor: 'warning',
    title: 'Quiz Points',
    stats: '92304',
    trendNumber: '10',
    trend: 'positive',
    chipText: '50 Quizzes',
    chipColor: 'primary'
  },
  {
    url: '/apps/calendar',
    icon: 'ri-user-star-fill',
    iconColor: 'success',
    title: 'Competitions',
    stats: '3',
    trendNumber: '1',
    trend: 'positive',
    chipText: 'Ramayana Quiz1',
    chipColor: 'success'
  }
]

const notifications = [
  {
    avatarImage: '/images/avatars/2.png',
    title: 'Congratulations Flora 🎉',
    subtitle: 'Won the monthly bestseller gold badge',
    time: '1h ago',
    read: false
  },
  {
    title: 'Cecilia Becker',
    subtitle: 'Accepted your connection',
    time: '12h ago',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Bernard Woods',
    subtitle: 'You have new message from Bernard Woods',
    time: 'May 18, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'ri-bar-chart-line',
    avatarColor: 'info',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    time: 'Apr 24, 10:30 AM',
    read: true
  },
  {
    avatarText: 'MG',
    avatarColor: 'success',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    time: 'Feb 17, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'ri-mail-line',
    avatarColor: 'error',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    time: 'Jan 6, 1:48 PM',
    read: true
  }
]

const NavbarContent = () => {
  // Get the current location
  const pathname = usePathname();

  const isJoinGamePage = pathname?.includes('/public-games/join');

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[5px]'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        <JoinGameButton
          sx={{ fontSize: 'small', padding: '5px' }}
          style={{ color: 'white' }}
          href='/public-games/join'
          disabled={isJoinGamePage}
        />
        {/* <LanguageDropdown /> */}
        <ModeDropdown />
        <MetricsDropdown metrics={metrics} />

        {/* <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
