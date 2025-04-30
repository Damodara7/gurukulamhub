// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import { useKBar } from 'kbar'
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const defaultSuggestions = [
  {
    sectionLabel: 'Popular Searches',
    items: [
      {
        label: 'My Games',
        href: '/mygames/view',
        icon: 'ri-bar-chart-line'
      },
      {
        label: 'My Quizzes',
        href: '/myquizzes/view/',
        icon: 'ri-pie-chart-2-line'
      }
    ]
  },
  {
    sectionLabel: 'Utilities',
    items: [
      {
        label: 'iStore',
        href: '/myutilities/istore',
        icon: 'ri-calendar-line'
      },
      {
        label: 'tTrack',
        href: '/myutilities/ttrack',
        icon: 'ri-file-list-3-line'
      }
    ]
  },
  {
    sectionLabel: 'Pages',
    items: [
      {
        label: 'My Profile',
        href: '/pages/user-profile',
        icon: 'ri-user-3-line'
      },
      // {
      //   label: 'Account Settings',
      //   href: '/pages/account-settings',
      //   icon: 'ri-settings-4-line'
      // },
      {
        label: 'Pricing',
        href: '/pages/pricing',
        icon: 'ri-money-dollar-circle-line'
      },
      {
        label: 'FAQ',
        href: '/pages/faq',
        icon: 'ri-question-line'
      }
    ]
  },

]

const DefaultSuggestions = () => {
  // Hooks
  const { query } = useKBar()
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase tracking-[0.8px] text-textDisabled'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale)}
                  onClick={query.toggle}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
