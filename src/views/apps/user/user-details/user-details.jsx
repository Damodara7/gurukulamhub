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
    <Card
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: '12px', sm: '16px' },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        height: '100%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
          borderColor: 'rgba(102, 126, 234, 0.3)'
        }
      }}
    >
      <Box
        sx={{
          width: { xs: 48, sm: 56 },
          height: { xs: 48, sm: 56 },
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: { xs: 24, sm: 28 },
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
      >
        {icon}
      </Box>
      {isEmail ? (
        <Tooltip title={value} arrow>
          <Typography
            variant='h6'
            fontWeight={700}
            sx={{
              fontSize: { xs: 16, sm: 18, md: 20 },
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      ) : isRoles ? (
        <Tooltip title={tooltip || value} arrow>
          <Typography
            variant='h6'
            fontWeight={700}
            sx={{
              fontSize: { xs: 16, sm: 18, md: 20 },
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      ) : (
        <Typography
          variant='h6'
          fontWeight={700}
          sx={{
            fontSize: { xs: 16, sm: 18, md: 20 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {value}
        </Typography>
      )}
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ fontSize: { xs: 11, sm: 12, md: 13 }, fontWeight: 600 }}
      >
        {label}
      </Typography>
    </Card>
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
    <Stack
      direction='row'
      alignItems='center'
      spacing={1}
      sx={{
        backgroundColor: 'rgba(102, 126, 234, 0.04)',
        px: 1.5,
        py: 0.75,
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(102, 126, 234, 0.08)',
          borderColor: 'rgba(102, 126, 234, 0.2)'
        }
      }}
    >
      <Typography
        variant='body2'
        sx={{
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        {value}
      </Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton
          size='small'
          onClick={handleCopy}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea'
            }
          }}
        >
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
    <Card
      sx={{
        borderRadius: { xs: '12px', sm: '16px' },
        mb: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 24px rgba(102, 126, 234, 0.12)',
          transform: 'translateY(-2px)'
        },
        ...sx
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
          borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
          p: { xs: 2, sm: 2.5 }
        }}
      >
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
            }}
          >
            {icon}
          </Box>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {title}
          </Typography>
        </Stack>
      </Box>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>{children}</CardContent>
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

  // Contact Card (enhanced)
  const contactCard = (
    <InfoCard icon={<EmailIcon />} title='Contact Information'>
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.04), rgba(118, 75, 162, 0.04))',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <EmailIcon fontSize='small' />
              </Box>
              <Box flex={1}>
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Email Address
                </Typography>
                <Tooltip title={profile?.email || user?.email} arrow>
                  <Typography
                    variant='body2'
                    sx={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {profile?.email || user?.email}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>

            {(profile?.phone || user?.phone) && <Divider />}

            {(profile?.phone || user?.phone) && (
              <Stack direction='row' spacing={1.5} alignItems='center'>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <PhoneIcon fontSize='small' />
                </Box>
                <Box flex={1}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Phone Number
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {profile?.phone || user?.phone}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </InfoCard>
  )

  // Status Card (enhanced roles)
  const statusCard = (
    <InfoCard icon={<GroupIcon />} title='User Roles'>
      <Stack direction='row' spacing={1.5} flexWrap='wrap'>
        {Array.isArray(user?.roles) &&
          user.roles.map((role, idx) => (
            <Chip
              key={idx}
              label={role}
              sx={{
                background:
                  role === 'ADMIN'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8125rem',
                px: 1,
                boxShadow:
                  role === 'ADMIN' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                border: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow:
                    role === 'ADMIN' ? '0 6px 16px rgba(239, 68, 68, 0.4)' : '0 6px 16px rgba(102, 126, 234, 0.4)'
                }
              }}
            />
          ))}
      </Stack>
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
    <Box maxWidth={1400} mx='auto' mt={{ xs: 2, md: 4 }} px={{ xs: 1, sm: 2, md: 3 }}>
      {/* Stunning Header Section with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: { xs: '12px', sm: '16px', md: '24px' },
          p: { xs: 2, sm: 3, md: 5 },
          mb: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.25)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} alignItems='center'>
            {/* Empty space on left */}
            <Grid item xs={0} md={1.5} sx={{ display: { xs: 'none', md: 'block' } }}></Grid>

            {/* User Info Section with Letter */}
            <Grid item xs={7.5} sm={8} md={6}>
              <Stack direction='row' spacing={{ xs: 1.25, sm: 2, md: 4 }} alignItems='center'>
                {/* Letter Avatar */}
                <Typography
                  sx={{
                    fontSize: { xs: 38, sm: 48, md: 70 },
                    fontWeight: 800,
                    color: 'white',
                    letterSpacing: { xs: '4px', sm: '12px', md: '36px' },
                    textShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    lineHeight: 1,
                    flexShrink: 0,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      textShadow: '0 6px 20px rgba(0, 0, 0, 0.4), 0 3px 12px rgba(0, 0, 0, 0.3)'
                    }
                  }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </Typography>

                {/* User Details */}
                <Stack spacing={{ xs: 0.35, sm: 0.75, md: 1 }} flex={1} sx={{ minWidth: 0 }}>
                  <Typography
                    variant='h4'
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      fontSize: { xs: '1rem', sm: '1.5rem', md: '2.25rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      letterSpacing: '-0.5px',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {fullName}
                  </Typography>
                  <Stack direction='row' spacing={{ xs: 0.5, sm: 1, md: 1 }} alignItems='center' sx={{ minWidth: 0 }}>
                    <EmailIcon
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                        flexShrink: 0
                      }}
                    />
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {profile?.email || user?.email}
                    </Typography>
                  </Stack>
                  {(profile?.phone || user?.phone) && (
                    <Stack direction='row' spacing={{ xs: 0.5, sm: 1, md: 1 }} alignItems='center' sx={{ minWidth: 0 }}>
                      <PhoneIcon
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                          flexShrink: 0
                        }}
                      />
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontSize: { xs: '0.625rem', sm: '0.75rem', md: '1rem' }
                        }}
                      >
                        {profile?.phone || user?.phone}
                      </Typography>
                    </Stack>
                  )}
                  <Stack
                    direction='row'
                    spacing={{ xs: 0.5, sm: 1, md: 1.5 }}
                    flexWrap='wrap'
                    mt={{ xs: 0.5, sm: 1, md: 1.5 }}
                  >
                    <Chip
                      label={user?.isActive ? 'Active' : 'Inactive'}
                      sx={{
                        backgroundColor: user?.isActive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                        height: { xs: 22, sm: 26, md: 32 },
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiChip-label': {
                          px: { xs: 0.75, sm: 1, md: 1.5 },
                          py: 0
                        }
                      }}
                    />
                    <Chip
                      label={user?.isVerified ? 'Verified' : 'Unverified'}
                      icon={
                        user?.isVerified ? (
                          <VerifiedUserIcon
                            sx={{
                              color: 'white !important',
                              fontSize: { xs: '0.875rem !important', sm: '1rem !important', md: '1.25rem !important' }
                            }}
                          />
                        ) : undefined
                      }
                      sx={{
                        backgroundColor: user?.isVerified ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                        height: { xs: 22, sm: 26, md: 32 },
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                        '& .MuiChip-icon': {
                          marginLeft: { xs: '4px', sm: '6px', md: '8px' },
                          marginRight: { xs: '3px', sm: '3px', md: '4px' },
                          color: 'white'
                        },
                        '& .MuiChip-label': {
                          px: { xs: 0.75, sm: 1, md: 1.5 },
                          py: 0
                        }
                      }}
                    />
                    {user?.roles?.includes('ADMIN') && (
                      <Chip
                        label='Admin'
                        icon={
                          <AdminPanelSettingsIcon
                            sx={{
                              color: 'white !important',
                              fontSize: { xs: '0.875rem !important', sm: '1rem !important', md: '1.25rem !important' }
                            }}
                          />
                        }
                        sx={{
                          backgroundColor: 'rgba(239, 68, 68, 0.25)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                          height: { xs: 22, sm: 26, md: 32 },
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(10px)',
                          '& .MuiChip-icon': {
                            marginLeft: { xs: '4px', sm: '6px', md: '8px' },
                            marginRight: { xs: '3px', sm: '3px', md: '4px' },
                            color: 'white'
                          },
                          '& .MuiChip-label': {
                            px: { xs: 0.75, sm: 1, md: 1.5 },
                            py: 0
                          }
                        }}
                      />
                    )}
                    {!user?.roles?.includes('ADMIN') && user?.roles?.includes('SUPER_USER') && (
                      <Chip
                        label='Super User'
                        icon={
                          <AdminPanelSettingsIcon
                            sx={{
                              color: 'white !important',
                              fontSize: { xs: '0.875rem !important', sm: '1rem !important', md: '1.25rem !important' }
                            }}
                          />
                        }
                        sx={{
                          backgroundColor: 'rgba(251, 191, 36, 0.25)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                          height: { xs: 22, sm: 26, md: 32 },
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          backdropFilter: 'blur(10px)',
                          '& .MuiChip-icon': {
                            marginLeft: { xs: '4px', sm: '6px', md: '8px' },
                            marginRight: { xs: '3px', sm: '3px', md: '4px' },
                            color: 'white'
                          },
                          '& .MuiChip-label': {
                            px: { xs: 0.75, sm: 1, md: 1.5 },
                            py: 0
                          }
                        }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            {/* Member ID Badge - Right Side */}
            <Grid
              item
              xs={4.5}
              sm={4}
              md={3}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-end' } }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: { xs: '10px', sm: '12px', md: '16px' },
                  p: { xs: 1, sm: 1.5, md: 2.5 },
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center',
                  minWidth: { xs: 'auto', sm: 120, md: 180 },
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: { xs: '0.5rem', sm: '0.625rem', md: '0.75rem' },
                    textTransform: 'uppercase',
                    letterSpacing: { xs: '0.5px', sm: '0.5px', md: '1px' },
                    fontWeight: 600,
                    display: 'block',
                    lineHeight: 1.2
                  }}
                >
                  Member ID
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: { xs: '0.625rem', sm: '0.875rem', md: '1.25rem' },
                    mt: { xs: 0.35, sm: 0.35, md: 0.5 },
                    fontFamily: 'monospace',
                    lineHeight: 1.2,
                    wordBreak: 'break-all'
                  }}
                >
                  {user?.memberId || '-'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Stats Cards with Modern Design */}
      <Box mb={4}>
        <Grid container spacing={2}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>
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
