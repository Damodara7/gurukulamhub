'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import BlockIcon from '@mui/icons-material/Block'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LoginIcon from '@mui/icons-material/Login'
import GroupIcon from '@mui/icons-material/Group'
import TodayIcon from '@mui/icons-material/Today'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon as FacebookShareIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon as EmailShareIcon
} from 'next-share'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Button from '@mui/material/Button'
import { useParams } from 'next/navigation'
import ShareIcon from '@mui/icons-material/Share'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'
import FlagIcon from '@mui/icons-material/Flag'
import PublicIcon from '@mui/icons-material/Public'
import HomeIcon from '@mui/icons-material/Home'
import MapIcon from '@mui/icons-material/Map'
import { Facebook as FacebookIcon, LinkedIn as LinkedInIcon, Instagram as InstagramIcon } from '@mui/icons-material'
import LanguageIcon from '@mui/icons-material/Language'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'
import LinkIcon from '@mui/icons-material/Link'

function StatCard({ icon, label, value, tooltip }) {
  // Special handling for email and roles: ellipsis + tooltip
  const isEmail = label.toLowerCase() === 'email'
  const isRoles = label.toLowerCase() === 'roles'
  return (
    <Paper
      variant='outlined'
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        minWidth: { xs: '100%', sm: 120 },
        textAlign: 'center',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        boxShadow: 'none',
        borderColor: 'divider',
        width: '100%'
      }}
    >
      <Box
        sx={{
          mb: 1,
          color: 'text.secondary',
          fontSize: { xs: 24, sm: 28 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      {isEmail ? (
        <Tooltip title={value} arrow>
          <Typography
            variant='h6'
            fontWeight={600}
            color='text.primary'
            sx={{
              fontSize: { xs: 16, sm: 20 },
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      ) : isRoles ? (
        <Tooltip title={tooltip || value} arrow>
          <Typography
            variant='h6'
            fontWeight={600}
            color='text.primary'
            sx={{
              fontSize: { xs: 16, sm: 20 },
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      ) : (
        <Typography variant='h6' fontWeight={600} color='text.primary' sx={{ fontSize: { xs: 16, sm: 20 } }}>
          {value}
        </Typography>
      )}
      <Typography variant='caption' color='text.secondary' sx={{ fontSize: { xs: 12, sm: 14 } }}>
        {label}
      </Typography>
    </Paper>
  )
}

function CopyableText({ value }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      <Typography variant='body2' sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton size='small' onClick={handleCopy}>
          <ContentCopyIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

function StatusBadge({ active }) {
  return (
    <Badge
      overlap='circular'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant='dot'
      color={active ? 'success' : 'error'}
      sx={{
        '& .MuiBadge-dot': {
          height: 16,
          minWidth: 16,
          borderRadius: 8,
          border: '2px solid #fff',
          boxShadow: 1
        }
      }}
    >
      {/* Avatar will be passed as child */}
    </Badge>
  )
}

function InfoCard({ icon, title, children, sx }) {
  return (
    <Card variant='outlined' sx={{ borderRadius: 2, mb: 3, ...sx }}>
      <CardContent>
        <Stack direction='row' alignItems='center' spacing={1} mb={2}>
          <Box color='primary.main'>{icon}</Box>
          <Typography variant='subtitle1' fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  )
}

function ReferralCard({ referralToken }) {
  const { lang: locale } = useParams() || { lang: 'en' }
  const [copied, setCopied] = useState(false)
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/register?ref=${referralToken}`
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <InfoCard icon={<ShareIcon />} title='Referral & Rewards' sx={{ mb: 3 }}>
      <Stack spacing={2}>
        <Typography variant='body2' color='text.secondary'>
          Share your referral link and earn rewards when your friends join!
        </Typography>
        <OutlinedInput
          fullWidth
          size='small'
          value={referralLink}
          readOnly
          endAdornment={
            <InputAdornment position='end'>
              <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                <IconButton onClick={handleCopy} size='small'>
                  <ContentCopyIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
        <Stack direction='row' spacing={1} flexWrap='wrap' alignItems='center'>
          <WhatsappShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
            separator='\n'
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
          <FacebookShareButton
            url={referralLink}
            quote={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <FacebookShareIcon size={32} round />
          </FacebookShareButton>
          <TelegramShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <TelegramIcon round />
          </TelegramShareButton>
          <TwitterShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <LinkedinShareButton
            url={referralLink}
            title='Join me on GurukulamHub!'
            summary={`Sign up and earn rewards: ${referralLink}`}
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <EmailShareButton
            url={referralLink}
            subject='Join me on GurukulamHub!'
            body={`Sign up and earn rewards: ${referralLink}`}
          >
            <EmailShareIcon size={32} round />
          </EmailShareButton>
        </Stack>
      </Stack>
    </InfoCard>
  )
}

function EnhancedProfileCard({ profile }) {
  // Always show accountType
  const accountType = profile?.accountType
  const isIndividual = accountType === 'INDIVIDUAL'
  const isOrg = ['BUSINESS', 'ORGANIZATION', 'NGO'].includes(accountType)

  // Basic Info
  const basicInfo = [accountType && { label: 'Account Type', value: accountType }].filter(Boolean)

  // Individual fields
  const individualFields = [isIndividual && profile?.nickname && { label: 'Nickname', value: profile.nickname }].filter(
    Boolean
  )

  // Organization fields
  const orgFields = [
    isOrg && profile?.organization && { label: 'Organization', value: profile.organization },
    isOrg && profile?.websiteUrl && { label: 'Website', value: profile.websiteUrl, isLink: true },
    isOrg && profile?.roleInOrganization && { label: 'Role in Org', value: profile.roleInOrganization }
  ].filter(Boolean)

  // Demographics
  const demographics = [
    profile?.age && { label: 'Age', value: profile.age },
    profile?.gender && { label: 'Gender', value: profile.gender },
    profile?.category && { label: 'Category', value: profile.category },
    profile?.motherTongue && { label: 'Mother Tongue', value: profile.motherTongue },
    profile?.religion && { label: 'Religion', value: profile.religion },
    profile?.caste && { label: 'Caste', value: profile.caste }
  ].filter(Boolean)

  // Languages
  const languages = Array.isArray(profile?.languages) ? profile.languages : []

  // Education
  const schools = Array.isArray(profile?.schools) ? profile.schools : []

  // Work
  const workPositions = Array.isArray(profile?.workingPositions) ? profile.workingPositions : []

  // Organizations (associated)
  const organizations = Array.isArray(profile?.associatedOrganizations) ? profile.associatedOrganizations : []

  // Social
  const socialLinks = [
    profile?.linkedInUrl && { icon: <LinkedInIcon color='primary' />, url: profile.linkedInUrl, label: 'LinkedIn' },
    profile?.facebookUrl && { icon: <FacebookIcon color='primary' />, url: profile.facebookUrl, label: 'Facebook' },
    profile?.instagramUrl && {
      icon: <InstagramIcon color='secondary' />,
      url: profile.instagramUrl,
      label: 'Instagram'
    }
  ].filter(Boolean)

  // Other
  const other = [
    profile?.timezone && { label: 'Timezone', value: profile.timezone },
    profile?.voterId && { label: 'Voter ID', value: profile.voterId },
    profile?.currency && { label: 'Currency', value: profile.currency },
    profile?.networkLevel && { label: 'Network Level', value: profile.networkLevel },
    profile?.referralPoints && { label: 'Referral Points', value: profile.referralPoints }
  ].filter(Boolean)

  const hasProfile =
    basicInfo.length ||
    individualFields.length ||
    orgFields.length ||
    demographics.length ||
    languages.length ||
    schools.length ||
    workPositions.length ||
    organizations.length ||
    socialLinks.length ||
    other.length ||
    profile?.openToWork ||
    profile?.hiring

  const labelSx = { minWidth: 120, flexShrink: 0, color: 'text.secondary', fontWeight: 500, pr: 1 }
  const valueSx = { flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1, wordBreak: 'break-word', alignItems: 'center' }

  const renderRow = (label, value) => (
    <Stack direction='row' alignItems='flex-start' sx={{ mb: 1 }}>
      <Typography variant='body2' sx={labelSx}>
        {label}
      </Typography>
      <Box sx={valueSx}>{value}</Box>
    </Stack>
  )

  return (
    <InfoCard icon={<PersonIcon />} title='Profile'>
      {hasProfile ? (
        <Stack spacing={2}>
          {/* Account Type */}
          {basicInfo.length > 0 &&
            renderRow(
              'Account Type:',
              basicInfo.map((item, idx) => (
                <Chip key={idx} label={item.value} color='info' size='small' sx={{ maxWidth: 220 }} />
              ))
            )}
          {/* Individual fields */}
          {individualFields.length > 0 &&
            renderRow(
              'Personal Info:',
              individualFields.map((item, idx) => (
                <Chip
                  key={idx}
                  label={`${item.label}: ${item.value}`}
                  color='primary'
                  size='small'
                  sx={{ maxWidth: 220, color: 'white' }}
                />
              ))
            )}
          {/* Organization fields */}
          {orgFields.length > 0 &&
            renderRow(
              'Organization Info:',
              orgFields.map((item, idx) =>
                item.isLink ? (
                  <a
                    key={idx}
                    href={item.value}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    <Chip
                      label={item.label}
                      icon={<LinkIcon fontSize='small' />}
                      color='primary'
                      size='small'
                      sx={{ maxWidth: 220 }}
                    />
                  </a>
                ) : (
                  <Chip
                    key={idx}
                    label={`${item.label}: ${item.value}`}
                    color='primary'
                    size='small'
                    sx={{ maxWidth: 220 }}
                  />
                )
              )
            )}
          {(basicInfo.length > 0 || individualFields.length > 0 || orgFields.length > 0) && <Divider />}
          {/* Demographics */}
          {demographics.length > 0 &&
            renderRow(
              'Demographics:',
              demographics.map((item, idx) => (
                <Chip
                  key={idx}
                  label={`${item.label}: ${item.value}`}
                  color='secondary'
                  size='small'
                  sx={{ maxWidth: 220 }}
                />
              ))
            )}
          {demographics.length > 0 && <Divider />}
          {/* Languages */}
          {languages.length > 0 &&
            renderRow(
              'Languages:',
              languages.map((lang, idx) => (
                <Chip
                  key={idx}
                  label={
                    lang.language +
                    (lang.canRead ? ' R' : '') +
                    (lang.canWrite ? ' W' : '') +
                    (lang.canSpeak ? ' S' : '')
                  }
                  icon={<LanguageIcon fontSize='small' />}
                  color='primary'
                  size='small'
                  sx={{ maxWidth: 220 }}
                />
              ))
            )}
          {languages.length > 0 && <Divider />}
          {/* Education */}
          {schools.length > 0 &&
            renderRow(
              'Education:',
              <Stack spacing={1} sx={{ width: '100%' }}>
                {schools.map((school, idx) => (
                  <Stack key={idx} direction='row' alignItems='center' spacing={1} sx={{ wordBreak: 'break-word' }}>
                    <SchoolIcon fontSize='small' color='action' />
                    <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                      {school.school} {school.highestQualification && `- ${school.highestQualification}`}{' '}
                      {school.degree && `- ${school.degree}`}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {schools.length > 0 && <Divider />}
          {/* Work Experience */}
          {workPositions.length > 0 &&
            renderRow(
              'Work Experience:',
              <Stack spacing={1} sx={{ width: '100%' }}>
                {workPositions.map((work, idx) => (
                  <Stack key={idx} direction='row' alignItems='center' spacing={1} sx={{ wordBreak: 'break-word' }}>
                    <WorkIcon fontSize='small' color='action' />
                    <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                      {work.title} at {work.companyName} {work.employmentType && `(${work.employmentType})`}
                    </Typography>
                  </Stack>
                ))}
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {profile?.openToWork && <Chip label='Open to Work' color='success' size='small' />}
                  {profile?.hiring && <Chip label='Hiring' color='warning' size='small' />}
                </Stack>
              </Stack>
            )}
          {workPositions.length > 0 && <Divider />}
          {/* Organizations */}
          {organizations.length > 0 &&
            renderRow(
              'Organizations:',
              <Stack spacing={1} sx={{ width: '100%' }}>
                {organizations.map((org, idx) => (
                  <Stack key={idx} direction='row' alignItems='center' spacing={1} sx={{ wordBreak: 'break-word' }}>
                    <BusinessIcon fontSize='small' color='action' />
                    <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                      {org.organization} {org.organizationType && `(${org.organizationType})`}{' '}
                      {org.websiteUrl && (
                        <a href={org.websiteUrl} target='_blank' rel='noopener noreferrer'>
                          <LinkIcon fontSize='small' />
                        </a>
                      )}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          {organizations.length > 0 && <Divider />}
          {/* Social */}
          {socialLinks.length > 0 &&
            renderRow(
              'Social:',
              <Stack direction='row' spacing={1} flexWrap='wrap'>
                {socialLinks.map((item, idx) => (
                  <Tooltip key={idx} title={item.label}>
                    <IconButton component='a' href={item.url} target='_blank' rel='noopener noreferrer' size='small'>
                      {item.icon}
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            )}
          {socialLinks.length > 0 && <Divider />}
          {/* Other */}
          {other.length > 0 &&
            renderRow(
              'Other:',
              other.map((item, idx) => (
                <Chip
                  key={idx}
                  label={`${item.label}: ${item.value}`}
                  color='default'
                  size='small'
                  sx={{ maxWidth: 220 }}
                />
              ))
            )}
        </Stack>
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No profile info provided.
        </Typography>
      )}
    </InfoCard>
  )
}

function UserDetailsPage({ data }) {
  if (!data)
    return (
      <Box p={4}>
        <Typography color='text.secondary'>No user data found.</Typography>
      </Box>
    )
  const { profile, ...user } = data
  const avatarUrl = profile?.image || '/images/avatars/1.png'
  const fullName = `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim() || 'User'

  // Stat cards
  const stats = [
    { icon: <LoginIcon fontSize='medium' />, label: 'Logins', value: user?.loginCount || 0 },
    {
      icon: <GroupIcon fontSize='medium' />,
      label: 'Roles',
      value: user?.roles?.length || 1,
      tooltip: Array.isArray(user?.roles) ? user.roles.join(', ') : ''
    },
    {
      icon: <TodayIcon fontSize='medium' />,
      label: 'Created',
      value: user?.createdAt ? new Date(user?.createdAt).toLocaleDateString() : '-'
    },
    { icon: <EmailIcon fontSize='medium' />, label: 'Email', value: user?.email },
    { icon: <PhoneIcon fontSize='medium' />, label: 'Phone', value: user?.phone || '-' }
  ]

  // Contact Card (no status chips)
  const contactCard = (
    <InfoCard icon={<Avatar src={avatarUrl} sx={{ width: 40, height: 40 }} />} title='Contact'>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box sx={{ position: 'relative', mr: 2 }}>
          {/* <StatusBadge active={user?.isActive}>
            <Avatar src={avatarUrl} alt={fullName} sx={{ width: 72, height: 72, fontSize: 28 }} />
          </StatusBadge> */}
        </Box>
        <Box>
          <Typography variant='h6' fontWeight={700}>
            {fullName}
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center' mt={1}>
            <EmailIcon fontSize='small' color='action' />
            <Tooltip title={profile?.email || user?.email} arrow>
              <Typography
                variant='body2'
                sx={{
                  maxWidth: { sm: '100%', md: '350px' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {profile?.email || user?.email}
              </Typography>
            </Tooltip>
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center' mt={0.5}>
            <PhoneIcon fontSize='small' color='action' />
            <Typography variant='body2'>{profile?.phone || user?.phone || 'N/A'}</Typography>
          </Stack>
        </Box>
      </Stack>
    </InfoCard>
  )

  // Status Card (only roles as chips)
  const statusCard = (
    <InfoCard icon={<GroupIcon />} title='Roles'>
      <Stack direction='row' spacing={1} flexWrap='wrap' mb={1}>
        {Array.isArray(user?.roles) &&
          user.roles.map((role, idx) => (
            <Chip key={idx} label={role} color={role === 'ADMIN' ? 'error' : 'info'} size='small' sx={{ mb: 1 }} />
          ))}
      </Stack>
      {/* No status/social chips here */}
    </InfoCard>
  )

  // Meta Card
  const metaCard = (
    <InfoCard icon={<AdminPanelSettingsIcon />} title='Meta'>
      <Stack spacing={1.5}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Member ID:
          </Typography>
          <CopyableText value={user?.memberId || 'N/A'} />
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Referral Token:
          </Typography>
          <CopyableText value={user?.referralToken || 'N/A'} />
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Referred By:
          </Typography>
          <Typography variant='body2'>{user?.referredBy}</Typography>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Referral Source:
          </Typography>
          <Typography variant='body2'>{user?.referralSource || 'N/A'}</Typography>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Created:
          </Typography>
          <Typography variant='body2'>
            {user?.createdAt ? new Date(user?.createdAt).toLocaleString() : 'N/A'}
          </Typography>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary' fontWeight={500}>
            Updated:
          </Typography>
          <Typography variant='body2'>
            {user?.updatedAt ? new Date(user?.updatedAt).toLocaleString() : 'N/A'}
          </Typography>
        </Stack>
      </Stack>
    </InfoCard>
  )

  // Address Card
  const addressFields = [
    { label: 'Country', value: profile?.country },
    { label: 'Region', value: profile?.region },
    { label: 'Zipcode', value: profile?.zipcode },
    { label: 'Locality', value: profile?.locality },
    { label: 'Street', value: profile?.street },
    { label: 'Colony', value: profile?.colony },
    { label: 'Village', value: profile?.village }
  ]
  const hasAddress = addressFields.some(f => f.value)
  const addressCard = (
    <InfoCard icon={<LocationOnIcon />} title='Address'>
      {hasAddress ? (
        <Stack spacing={1.5}>
          {addressFields.map((field, idx) =>
            field.value ? (
              <Typography key={idx} variant='body2' color='text.secondary' fontWeight={500}>
                {field.label}: <span style={{ color: '#222' }}>{field.value}</span>
              </Typography>
            ) : null
          )}
        </Stack>
      ) : (
        <Typography variant='body2' color='text.secondary'>
          No address info provided.
        </Typography>
      )}
    </InfoCard>
  )

  // Profile Card (other info)
  const profileCard = <EnhancedProfileCard profile={profile} />

  return (
    <Box maxWidth={1200} mx='auto' mt={{ xs: 2, md: 6 }} px={{ xs: 0.5, sm: 2 }}>
      {/* Header Section */}
      <Paper
        variant='outlined'
        sx={{
          borderRadius: 1,
          mb: { xs: 3, md: 5 },
          p: { xs: 1.5, sm: 2, md: 4 },
          boxShadow: 'none',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={3} md={2} sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, sm: 0 } }}>
            <Avatar
              src={avatarUrl}
              alt={fullName}
              sx={{
                width: { xs: 64, sm: 80, md: 96 },
                height: { xs: 64, sm: 80, md: 96 },
                fontSize: { xs: 24, sm: 32, md: 36 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={7}>
            <Stack spacing={0.5}>
              <Typography variant='h6' fontWeight={700} sx={{ fontSize: { xs: 18, sm: 22, md: 24 } }}>
                {fullName}
              </Typography>
              <Typography color='text.secondary' sx={{ fontSize: { xs: 13, sm: 15, md: 16 } }}>
                {profile?.email || user?.email}
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' alignItems='center' mt={0.5}>
                <Chip
                  label={user?.isActive ? 'Active' : 'Inactive'}
                  color={user?.isActive ? 'success' : 'error'}
                  size='small'
                  variant='outlined'
                />
                <Chip
                  label={user?.isVerified ? 'Verified' : 'Unverified'}
                  color={user?.isVerified ? 'success' : 'warning'}
                  size='small'
                  variant='outlined'
                  icon={user?.isVerified ? <VerifiedUserIcon fontSize='small' /> : null}
                />
                {user?.roles?.includes('ADMIN') && (
                  <Chip
                    label='Admin'
                    color='error'
                    size='small'
                    variant='outlined'
                    icon={<AdminPanelSettingsIcon fontSize='small' />}
                  />
                )}
                {!user?.roles?.includes('ADMIN') && user?.roles?.includes('SUPER_USER') && (
                  <Chip
                    label='Super User'
                    color='warning'
                    size='small'
                    variant='outlined'
                    icon={<AdminPanelSettingsIcon fontSize='small' />}
                  />
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3} md={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            {/* <Stack direction='row' spacing={1} my={2} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <IconButton color='primary' aria-label='edit user' size='small'>
                <EditIcon fontSize='small' />
              </IconButton>
              <IconButton color='error' aria-label='deactivate user' size='small'>
                <BlockIcon fontSize='small' />
              </IconButton>
            </Stack> */}
            <Box>
              <Typography variant='subtitle2' color='text.secondary' sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Member ID
              </Typography>
              <Typography variant='body1' color='primary' sx={{ fontSize: { xs: 14, sm: 16 } }}>
                {user?.memberId || '-'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        {/* Stat Cards Row */}
        <Box mt={{ xs: 2, sm: 3, md: 4 }}>
          <Grid container spacing={2} justifyContent='center'>
            {stats.map((stat, idx) => (
              <Grid item xs={12} sm={6} md={2.4} key={idx} sx={{ display: 'flex' }}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      {/* Info Cards Layout */}
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid item xs={12} md={6}>
          {contactCard}
          {statusCard}
          {metaCard}
        </Grid>
        <Grid item xs={12} md={6}>
          {/* <ReferralCard referralToken={user?.referralToken} /> */}
          {addressCard}
          {profileCard}
        </Grid>
      </Grid>
      {/* More sections (Organizations, Languages, Education, Work, etc.) can be added below as needed */}
    </Box>
  )
}

export default UserDetailsPage
