'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// import { GenerateVerticalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import { useSession } from 'next-auth/react'
import * as clientApi from '@/app/api/client/client.api'
import * as permissionUtils from '@/utils/permissionUtils'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import { FEATURES_LOOKUP } from '@/configs/features-lookup'
import { PERMISSIONS_LOOKUP } from '@/configs/permissions-lookup'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import useRoles from '@/hooks/useRoles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
  const { data: session } = useSession()
  // const [roles, setRoles] = useState([])
  const { roles, loading } = useRoles()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale, id } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const userRoles = session?.user?.roles || ['USER']

  // const getRolesData = async () => {
  //   console.log('Fetching Roles Data now.....')
  //   const result = await RestApi.get(`${API_URLS.v0.ROLE}`)
  //   // const result = await clientApi.getAllRoles() // Change this to the correct endpoint for roles
  //   if (result?.status === 'success') {
  //     console.log('Roles Fetched result', result)
  //     // setRoles(result?.result || []) // Store the fetched roles data
  //     // dispatch(roleSliceActions.refreshRoles(result?.result || []))
  //   } else {
  //     console.log('Error:' + result?.message)
  //     console.log('Error Fetching roles:', result)
  //   }
  // }

  // useEffect(() => {
  //   getRolesData() // Call the updated function to fetch roles data
  // }, [])

  const featurePermissions = [
    { key: 'hasHomeViewPermission', feature: FEATURES_LOOKUP.HOME },
    { key: 'hasPublicQuizzesViewPermission', feature: FEATURES_LOOKUP.PUBLIC_QUIZZES },
    // { key: 'hasPublicGamesViewPermission', feature: FEATURES_LOOKUP.PUBLIC_GAMES },
    { key: 'hasPublicGamesViewPermission', feature: FEATURES_LOOKUP.PUBLIC_GAMES },
    { key: 'hasMyQuizzesViewPermission', feature: FEATURES_LOOKUP.MY_QUIZZES },
    { key: 'hasMyGamesViewPermission', feature: FEATURES_LOOKUP.MY_GAMES },
    { key: 'hasMyUtilitiesViewPermission', feature: FEATURES_LOOKUP.MY_UTILITIES },
    { key: 'hasMyProgressViewPermission', feature: FEATURES_LOOKUP.MY_PROGRESS },
    { key: 'hasMyProfileViewPermission', feature: FEATURES_LOOKUP.MY_PROFILE },
    { key: 'hasReferEarnViewPermission', feature: FEATURES_LOOKUP.REFER_EARN },
    { key: 'hasReviewQuizzesViewPermission', feature: FEATURES_LOOKUP.REVIEW_QUIZZES },
    { key: 'hasReviewGamesViewPermission', feature: FEATURES_LOOKUP.REVIEW_GAMES },
    { key: 'hasManageAdvtViewPermission', feature: FEATURES_LOOKUP.MANAGE_ADVT },
    { key: 'hasManageQuizzesViewPermission', feature: FEATURES_LOOKUP.MANAGE_QUIZZES },
    { key: 'hasManageGamesViewPermission', feature: FEATURES_LOOKUP.MANAGE_GAMES },
    { key: 'hasManageEventsViewPermission', feature: FEATURES_LOOKUP.MANAGE_EVENTS },
    { key: 'hasManageUsersViewPermission', feature: FEATURES_LOOKUP.MANAGE_USERS },
    { key: 'hasRolesPermissionsViewPermission', feature: FEATURES_LOOKUP.ROLES_PERMISSIONS },
    { key: 'hasFaqViewPermission', feature: FEATURES_LOOKUP.FAQ },
    { key: 'hasRaiseSupportViewPermission', feature: FEATURES_LOOKUP.RAISE_SUPPORT },
    { key: 'hasDonationViewPermission', feature: FEATURES_LOOKUP.DONATION },
    { key: 'hasContextViewPermission', feature: FEATURES_LOOKUP.CONTEXT },
    { key: 'hasManageVideosViewPermission', feature: FEATURES_LOOKUP.VIDEOS },
    { key: 'hasManageAlertsViewPermission', feature: FEATURES_LOOKUP.ALERTS },
    { key: 'hasManageUserAlertsViewPermission', feature: FEATURES_LOOKUP.USER_ALERTS },
    { key: 'hasSponsorshipViewPermission', feature: FEATURES_LOOKUP.SPONSORSHIPS },
    { key: 'hasManageSponsorshipViewPermission', feature: FEATURES_LOOKUP.MANAGE_SPONSORSHIPS },
    // {key:'hasManageGroupsViewPermission' , feature: FEATURES_LOOKUP.USERS_GROUP},
    {key:'hasManageAudiencesViewPermission' , feature: FEATURES_LOOKUP.USERS_AUDIENCE}
  ]

  // Generate permission variables dynamically
  const permissions = Object.fromEntries(
    featurePermissions.map(({ key, feature }) => [
      key,
      permissionUtils.hasPermission(roles, userRoles, feature, PERMISSIONS_LOOKUP.VIEW)
    ])
  )

  // Destructure generated permission variables for easy access
  const {
    hasHomeViewPermission,
    hasPublicQuizzesViewPermission,
    hasPublicGamesViewPermission,
    hasMyQuizzesViewPermission,
    hasMyGamesViewPermission,
    hasMyUtilitiesViewPermission,
    hasMyProgressViewPermission,
    hasMyProfileViewPermission,
    hasReferEarnViewPermission,
    hasReviewQuizzesViewPermission,
    hasReviewGamesViewPermission,
    hasManageAdvtViewPermission,
    hasManageGroupsViewPermission,
    hasManageAudiencesViewPermission,
    hasManageQuizzesViewPermission,
    // hasManageGamesViewPermission,
    hasManageGamesViewPermission,
    hasManageEventsViewPermission,
    hasManageUsersViewPermission,
    hasRolesPermissionsViewPermission,
    hasManageVideosViewPermission,
    hasManageAlertsViewPermission,
    hasManageUserAlertsViewPermission,
    hasFaqViewPermission,
    hasRaiseSupportViewPermission,
    hasDonationViewPermission,
    hasContextViewPermission,
    hasManageSponsorshipViewPermission
  } = permissions

  // Create composite permissions based on individual feature permissions
  // const hasReviewerPagesViewPermission = hasReviewGamesViewPermission || hasReviewQuizzesViewPermission
  const hasAdminPagesViewPermission =
    hasManageAdvtViewPermission ||
    hasManageQuizzesViewPermission ||
    // hasManageGamesViewPermission ||
    hasManageGamesViewPermission ||
    hasManageEventsViewPermission ||
    hasManageGroupsViewPermission ||
    hasManageAudiencesViewPermission ||
    hasManageUsersViewPermission

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {/* <SubMenu
          label={dictionary['navigation'].dashboards}
          icon={<i className='ri-home-smile-line' />}
          suffix={<Chip label='1' size='small' color='error' />}
        >

        </SubMenu> */}

        <MenuSection label={dictionary['navigation'].publicPages}>
          <MenuItem href={`/${locale}/home`} icon={<i className='ri-home-4-line' />}>
            {dictionary['navigation'].quizworld}
          </MenuItem>
        </MenuSection>

        <SubMenu label={dictionary['navigation'].publicQuizzes} icon={<i className='ri-dashboard-line' />}>
          <MenuItem href={`/${locale}/publicquiz/view`}>{dictionary['navigation'].view}</MenuItem>

          <MenuItem href={`/${locale}/publicquiz/play`}>{dictionary['navigation'].play}</MenuItem>
        </SubMenu>

        {/* <SubMenu label={dictionary['navigation'].publicGames} icon={<i className='ri-gamepad-line' />}>
          <MenuItem href={`/${locale}/game`}>{dictionary['navigation'].view}</MenuItem>

          <MenuItem href={`/${locale}/game/join`}>{dictionary['navigation'].join}</MenuItem>

          <MenuItem href={`/${locale}/game/register`}>{dictionary['navigation'].register}</MenuItem>
        </SubMenu> */}

        <SubMenu label={dictionary['navigation'].publicGames} icon={<i className='ri-gamepad-line' />}>
          <MenuItem href={`/${locale}/public-games`}>{dictionary['navigation'].all}</MenuItem>

          {/* <MenuItem href={`/${locale}/public-games/registered`}>{dictionary['navigation'].registered}</MenuItem> */}

          <MenuItem href={`/${locale}/public-games/join`}>{dictionary['navigation'].join}</MenuItem>
        </SubMenu>

        <MenuSection label={dictionary['navigation'].mypages}>
          {!userRoles?.includes(ROLES_LOOKUP.ADMIN) && (
            <SubMenu label={dictionary['navigation'].myquizzes} icon={<i className='ri-dashboard-line' />}>
              <MenuItem href={`/${locale}/myquizzes/view`}>{dictionary['navigation'].view}</MenuItem>

              <MenuItem href={`/${locale}/myquizzes/create`}>{dictionary['navigation'].create}</MenuItem>

              {/* <MenuItem href={`/${locale}/myquizzes/builder`} icon={<i className='ri-artboard-2-line' />}>
              {dictionary['navigation'].build}
            </MenuItem>

            <MenuItem href={`/${locale}/myquizzes/favorite`} icon={<i className='ri-artboard-2-line' />}>
              {dictionary['navigation'].favorite}
            </MenuItem> */}
            </SubMenu>
          )}

          {/* <SubMenu label={dictionary['navigation'].game} icon={<i className='ri-gamepad-line' />}>
            <MenuItem href={`/${locale}/mygames/view`}>{dictionary['navigation'].view}</MenuItem>
            <MenuItem href={`/${locale}/mygames/create`}>{dictionary['navigation'].create}</MenuItem>
            <MenuItem href={`/${locale}/mygames/run`}>{dictionary['navigation'].run}</MenuItem>
            <MenuItem href={`/${locale}/mygames/join`}>{dictionary['navigation'].join}</MenuItem>
          </SubMenu> */}

          <SubMenu label={dictionary['navigation'].sponsorship} icon={<i className='ri-wallet-3-line' />}>
            <MenuItem href={`/${locale}/sponsor/list`}>{dictionary['navigation'].list}</MenuItem>
            <MenuItem href={`/${locale}/sponsor/games`}>{dictionary['navigation'].sponsorGames}</MenuItem>
            <MenuItem href={`/${locale}/sponsor/quizzes`}>{dictionary['navigation'].sponsorQuizzes}</MenuItem>
            {/* <MenuItem href={`/${locale}/sponsor/area`}>{dictionary['navigation'].sponsorByArea}</MenuItem> */}
          </SubMenu>

          {/* <MenuItem href={`/${locale}/dashboards/myprogress`} icon={<i className='ri-bar-chart-2-line' />}>
            {dictionary['navigation'].myprogress}
          </MenuItem> */}

          <MenuItem href={`/${locale}/pages/user-profile`} icon={<i className='ri-user-line' />}>
            {dictionary['navigation'].userProfile}
          </MenuItem>
          <MenuItem href={`/${locale}/my-learning`} icon={<i className='ri-macbook-line' />}>
            {dictionary['navigation'].myLearning}
          </MenuItem>
          <MenuItem href={`/${locale}/pages/dialog-examples`} icon={<i className='ri-user-received-line' />}>
            {dictionary['navigation'].refer}
          </MenuItem>
          {/* <SubMenu label={dictionary['navigation'].mysettings} icon={<i className='ri-earth-fill' />}>
            <MenuItem href={`/${locale}/pages/account-settings`}>{dictionary['navigation'].accountSettings}</MenuItem>
          </SubMenu> */}
        </MenuSection>

        {/* <RBACMenuWrapper roles={['REVIEWER']} session={session}> */}
        {/* {hasReviewerPagesViewPermission && (
          <MenuSection label={dictionary['navigation'].reviewerPages}>
            {hasReviewQuizzesViewPermission && (
              <MenuItem href={`/${locale}/review/quiz`} icon=<ReviewsIcon />>
                {dictionary['navigation'].reviewQuizzes}
              </MenuItem>
            )}
            {hasReviewGamesViewPermission && (
              <MenuItem href={`/${locale}/review/game`} icon=<ReviewsIcon />>
                {dictionary['navigation'].reviewGames}
              </MenuItem>
            )}
          </MenuSection>
        )} */}
        {/* </RBACMenuWrapper> */}

        {!userRoles?.includes(ROLES_LOOKUP.ADMIN) && userRoles?.includes(ROLES_LOOKUP.SUPER_USER) && (
          <MenuSection label={dictionary['navigation'].superUserPages}>
            <SubMenu label={dictionary['navigation'].manageGames} icon={<i className='ri-gamepad-line' />}>
              <MenuItem href={`/${locale}/manage-games`}>{dictionary['navigation'].all}</MenuItem>
              <MenuItem href={`/${locale}/manage-games/create`}>{dictionary['navigation'].create}</MenuItem>
            </SubMenu>
          </MenuSection>
        )}

        {userRoles?.includes(ROLES_LOOKUP.ADMIN) && (
          <MenuSection label={dictionary['navigation'].adminPages}>
            <MenuItem
              href={`/${locale}/management/advertisements/list`}
              icon={<i className='ri-advertisement-line'></i>}
            >
              {dictionary['navigation'].manageAdvt}
            </MenuItem>

            <SubMenu label={dictionary['navigation'].manageQuizzes} icon={<i className='ri-dashboard-line' />}>
              <MenuItem href={`/${locale}/management/quizzes/view`}>{dictionary['navigation'].my}</MenuItem>
              <MenuItem href={`/${locale}/management/user-quizzes/list`}>
                {dictionary['navigation'].userQuizzes}
              </MenuItem>
              <MenuItem href={`/${locale}/management/quizzes/create`}>{dictionary['navigation'].create}</MenuItem>
            </SubMenu>

            <SubMenu label={dictionary['navigation'].manageGames} icon={<i className='ri-gamepad-line' />}>
              <MenuItem href={`/${locale}/management/games`}>{dictionary['navigation'].all}</MenuItem>
              <MenuItem href={`/${locale}/management/games/create`}>{dictionary['navigation'].create}</MenuItem>
            </SubMenu>

            {/* <SubMenu label={dictionary['navigation'].manageGroups} icon={<i className='ri-group-line' />}>
              <MenuItem href={`/${locale}/management/groups`}>{dictionary['navigation'].all}</MenuItem>
              <MenuItem href={`/${locale}/management/groups/create`}>{dictionary['navigation'].create}</MenuItem>
            </SubMenu> */}

            <SubMenu label={dictionary['navigation'].manageAudiences} icon={<i className='ri-group-line' />}>
              <MenuItem href={`/${locale}/management/audience`}>{dictionary['navigation'].all}</MenuItem>
              <MenuItem href={`/${locale}/management/audience/create`}>{dictionary['navigation'].create}</MenuItem>
            </SubMenu>

            <SubMenu label={dictionary['navigation'].manageUsers} icon={<i className='ri-group-line' />}>
              <MenuItem href={`/${locale}/management/user/list`}>{dictionary['navigation'].list}</MenuItem>
            </SubMenu>

            <SubMenu label={dictionary['navigation'].manageSponsorships} icon={<i className='ri-wallet-3-line' />}>
              <MenuItem href={`/${locale}/management/sponsorships`}>{dictionary['navigation'].list}</MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale}/management/videos`} icon={<i className='ri-video-line' />}>
              {dictionary['navigation'].videos}
            </MenuItem>
            {/* 
              <MenuItem href={`/${locale}/management/alerts`} icon={<i className='ri-notification-3-line' />}>
                {dictionary['navigation'].alerts}
              </MenuItem>
             */}
            <SubMenu label={dictionary['navigation'].roles} icon={<i className='ri-shield-user-line' />}>
              <MenuItem href={`/${locale}/management/roles`}>{dictionary['navigation'].roles}</MenuItem>
              <MenuItem href={`/${locale}/management/geo-roles`}>{dictionary['navigation'].geoRoles}</MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].features} icon={<i className='ri-stack-line' />}>
              <MenuItem href={`/${locale}/management/features`}>{dictionary['navigation'].features}</MenuItem>
              <MenuItem href={`/${locale}/management/geo-features`}>{dictionary['navigation'].geoFeatures}</MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale}/management/contexts/generic`} icon={<i className='ri-question-line' />}>
              {dictionary['navigation'].generic}
            </MenuItem>
          </MenuSection>
        )}

        <MenuSection label={dictionary['navigation'].support}>
          {/* <MenuItem href={`/${locale}/pages/faq`} icon={<i className='ri-question-answer-line' />}>
            {dictionary['navigation'].faq}
          </MenuItem> */}

          {/* <MenuItem
            href='https://triesoltech.com/support'
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-customer-service-line' />}
          >
            {dictionary['navigation'].raiseSupport}
          </MenuItem> */}

          <MenuItem href={`/${locale}/pages/donation`} icon={<i className='ri-hand-heart-line' />}>
            {dictionary['navigation'].donation}
          </MenuItem>
        </MenuSection>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 10 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
