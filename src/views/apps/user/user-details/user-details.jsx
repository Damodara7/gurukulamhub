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
import Container from '@mui/material/Container'
import { useState } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  // Special handling for email and roles: ellipsis + tooltip
  const isEmail = label.toLowerCase() === 'email'
  const isRoles = label.toLowerCase() === 'roles'
  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        borderRadius: { xs: '12px', sm: '16px' },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5 },
        background: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 2px 8px ${alpha(theme.palette.common.black, 0.4)}`
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        minHeight: isXs ? 'auto' : { sm: 160, md: 180 },
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-4px)' },
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`
              : `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.2)
        }
      }}
    >
      <Box
        sx={{
          color: theme.palette.primary.main,
          fontSize: { xs: 32, sm: 36, md: 40 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ fontSize: { xs: 11, sm: 12, md: 13 }, fontWeight: 600 }}
      >
        {label}
      </Typography>
      {isEmail ? (
        <Tooltip title={value} arrow>
          <Typography
            variant='h6'
            fontWeight={700}
            sx={{
              fontSize: { xs: 16, sm: 18, md: 20 },
              display: 'block',
              overflowWrap: 'anywhere',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
              textAlign: 'center',
              overflowWrap: 'anywhere',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {value}
        </Typography>
      )}
    </Card>
  )
}

function CopyableText({ value }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
        backgroundColor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.primary.main, 0.04),
        px: { xs: 1, sm: 1.5 },
        py: { xs: 0.5, sm: 0.75 },
        borderRadius: '8px',
        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
        transition: 'all 0.2s ease',
        flex: 1,
        minWidth: 0,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.15)
              : alpha(theme.palette.primary.main, 0.08),
          borderColor: alpha(theme.palette.primary.main, 0.3)
        }
      }}
    >
      <Typography
        variant='body2'
        sx={{
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          color: 'text.primary',
          fontWeight: 600,
          flex: 1,
          minWidth: 0
        }}
      >
        {value}
      </Typography>
      <Tooltip title={copied ? 'Copied!' : 'Copy'}>
        <IconButton
          size={isMobile ? 'small' : 'medium'}
          onClick={handleCopy}
          sx={{
            flexShrink: 0,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main
            }
          }}
        >
          <ContentCopyIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

function StatusBadge({ active }) {
  const theme = useTheme()
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
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: 1
        }
      }}
    >
      {/* Avatar will be passed as child */}
    </Badge>
  )
}

function InfoCard({ icon, title, children, sx }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Card
      sx={{
        borderRadius: { xs: '12px', sm: '16px' },
        mb: { xs: 2, sm: 3 },
        boxShadow:
          theme.palette.mode === 'dark'
            ? `0 2px 12px ${alpha(theme.palette.common.black, 0.4)}`
            : '0 2px 12px rgba(0, 0, 0, 0.06)',
        border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 6px 24px ${alpha(theme.palette.primary.main, 0.2)}`
              : `0 6px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
          transform: { xs: 'none', sm: 'translateY(-2px)' }
        },
        ...sx
      }}
    >
      <Box
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`,
          p: { xs: 1.5, sm: 2.5 }
        }}
      >
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: 24, sm: 28 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.9375rem', sm: '1.125rem' },
              color: 'text.primary',
              wordBreak: 'break-word'
            }}
          >
            {title}
          </Typography>
        </Stack>
      </Box>
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>{children}</CardContent>
    </Card>
  )
}

function ReferralCard({ referralToken }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
          Share your referral link and earn rewards when your friends join!
        </Typography>
        <OutlinedInput
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          value={referralLink}
          readOnly
          sx={{
            '& .MuiOutlinedInput-input': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              color: 'text.primary'
            },
            backgroundColor:
              theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : 'transparent'
          }}
          endAdornment={
            <InputAdornment position='end'>
              <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                <IconButton onClick={handleCopy} size={isMobile ? 'small' : 'medium'}>
                  <ContentCopyIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
        <Stack
          direction='row'
          spacing={1}
          flexWrap='wrap'
          alignItems='center'
          justifyContent={{ xs: 'center', sm: 'flex-start' }}
        >
          <WhatsappShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
            separator='\n'
          >
            <WhatsappIcon size={isMobile ? 28 : 32} round />
          </WhatsappShareButton>
          <FacebookShareButton
            url={referralLink}
            quote={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <FacebookShareIcon size={isMobile ? 28 : 32} round />
          </FacebookShareButton>
          <TelegramShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <TelegramIcon size={isMobile ? 28 : 32} round />
          </TelegramShareButton>
          <TwitterShareButton
            url={referralLink}
            title={`Join me on GurukulamHub! Sign up and earn rewards: ${referralLink}`}
          >
            <TwitterIcon size={isMobile ? 28 : 32} round />
          </TwitterShareButton>
          <LinkedinShareButton
            url={referralLink}
            title='Join me on GurukulamHub!'
            summary={`Sign up and earn rewards: ${referralLink}`}
          >
            <LinkedinIcon size={isMobile ? 28 : 32} round />
          </LinkedinShareButton>
          <EmailShareButton
            url={referralLink}
            subject='Join me on GurukulamHub!'
            body={`Sign up and earn rewards: ${referralLink}`}
          >
            <EmailShareIcon size={isMobile ? 28 : 32} round />
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
  const theme = useTheme()
  const downSm = useMediaQuery(theme.breakpoints.down('sm'))

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

  const labelSx = {
    minWidth: downSm ? 100 : 140,
    flexShrink: 0,
    color: 'text.secondary',
    fontWeight: 500,
    pr: downSm ? 0 : 1,
    mb: downSm ? 0.5 : 0
  }
  const valueSx = {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    wordBreak: 'break-word',
    alignItems: 'center'
  }

  const renderRow = (label, value) => (
    <Stack
      direction={downSm ? 'column' : 'row'}
      alignItems={downSm ? 'stretch' : 'flex-start'}
      sx={{ mb: 1.5, gap: downSm ? 0.5 : 1 }}
    >
      <Typography variant='body2' sx={labelSx}>
        {label}
      </Typography>
      <Box sx={{ ...valueSx, width: '100%' }}>{value}</Box>
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
                <Chip
                  key={idx}
                  label={item.value}
                  color='info'
                  size='small'
                  sx={{ maxWidth: { xs: '100%', sm: 220 } }}
                />
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
                  sx={{ maxWidth: { xs: '100%', sm: 220 }, color: 'white' }}
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
                    style={{
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                      color: 'inherit'
                    }}
                  >
                    <Chip
                      label={item.label}
                      icon={<LinkIcon fontSize='small' />}
                      color='primary'
                      size='small'
                      sx={{
                        maxWidth: { xs: '100%', sm: 220 },
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  </a>
                ) : (
                  <Chip
                    key={idx}
                    label={`${item.label}: ${item.value}`}
                    color='primary'
                    size='small'
                    sx={{ maxWidth: { xs: '100%', sm: 220 } }}
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
                  sx={{ maxWidth: { xs: '100%', sm: 220 } }}
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
                  sx={{ maxWidth: { xs: '100%', sm: 220 } }}
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
                        <a
                          href={org.websiteUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginLeft: '4px'
                          }}
                        >
                          <LinkIcon fontSize='small' sx={{ color: theme.palette.primary.main }} />
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
                  sx={{ maxWidth: { xs: '100%', sm: 220 } }}
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!data)
    return (
      <Box p={4}>
        <Typography color='text.secondary'>No user data found.</Typography>
      </Box>
    )
  const { profile, ...user } = data
  const fullName =
    `${profile?.firstname || user?.firstname || ''} ${profile?.lastname || user?.lastname || ''}`.trim() || 'User'
  const primaryEmail = profile?.email || user?.email || '-'
  const getInitial = value => (typeof value === 'string' && value.trim().charAt(0)) || ''
  const avatarInitial = (
    getInitial(profile?.firstname) ||
    getInitial(profile?.lastname) ||
    getInitial(user?.firstname) ||
    getInitial(user?.lastname) ||
    getInitial(primaryEmail) ||
    'U'
  ).toUpperCase()
  const emailLength = primaryEmail.length
  const emailFontSize =
    emailLength > 28 ? { xs: '0.82rem', sm: '0.9rem', md: '0.95rem' } : { xs: '0.95rem', sm: '1rem', md: '1.05rem' }

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
            p: { xs: 1.5, sm: 2 },
            borderRadius: '12px',
            background:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.default, 0.5)
                : alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.12 : 0.08)}`
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction='row'
              spacing={{ xs: 1, sm: 1.5 }}
              alignItems='center'
              sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
            >
              <Box
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: { xs: 20, sm: 24 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <EmailIcon fontSize={isMobile ? 'small' : 'medium'} />
              </Box>
              <Box flex={1} sx={{ minWidth: 0 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 600
                  }}
                >
                  Email Address
                </Typography>
                <Tooltip title={profile?.email || user?.email} arrow>
                  <Typography
                    variant='body2'
                    sx={{
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: { xs: 'normal', sm: 'nowrap' },
                      wordBreak: { xs: 'break-all', sm: 'normal' },
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                    }}
                  >
                    {profile?.email || user?.email}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>

            {(profile?.phone || user?.phone) && <Divider />}

            {(profile?.phone || user?.phone) && (
              <Stack
                direction='row'
                spacing={{ xs: 1, sm: 1.5 }}
                alignItems='center'
                sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
              >
                <Box
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: 20, sm: 24 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <PhoneIcon fontSize={isMobile ? 'small' : 'medium'} />
                </Box>
                <Box flex={1} sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 600
                    }}
                  >
                    Phone Number
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      wordBreak: { xs: 'break-all', sm: 'normal' }
                    }}
                  >
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
      <Stack
        direction='row'
        spacing={{ xs: 1, sm: 1.5 }}
        flexWrap='wrap'
        justifyContent={{ xs: 'center', sm: 'flex-start' }}
      >
        {Array.isArray(user?.roles) &&
          user.roles.map((role, idx) => (
            <Chip
              key={idx}
              label={role}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                background:
                  role === 'ADMIN'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                px: { xs: 0.75, sm: 1 },
                py: { xs: 0.25, sm: 0.5 },
                boxShadow:
                  role === 'ADMIN'
                    ? theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                      : '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : `0 4px 12px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.3)}`,
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-2px)' },
                  boxShadow:
                    role === 'ADMIN'
                      ? theme.palette.mode === 'dark'
                        ? '0 6px 16px rgba(239, 68, 68, 0.5)'
                        : '0 6px 16px rgba(239, 68, 68, 0.4)'
                      : `0 6px 16px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.5 : 0.4)}`
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
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Member ID:
          </Typography>
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <CopyableText value={user?.memberId || 'N/A'} />
          </Box>
        </Stack>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Referral Token:
          </Typography>
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <CopyableText value={user?.referralToken || 'N/A'} />
          </Box>
        </Stack>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Referred By:
          </Typography>
          <Typography
            variant='body2'
            sx={{
              flex: 1,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              wordBreak: 'break-word'
            }}
          >
            {user?.referredBy || 'N/A'}
          </Typography>
        </Stack>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Referral Source:
          </Typography>
          <Typography
            variant='body2'
            sx={{
              flex: 1,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              wordBreak: 'break-word'
            }}
          >
            {user?.referralSource || 'N/A'}
          </Typography>
        </Stack>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Created:
          </Typography>
          <Typography
            variant='body2'
            sx={{
              flex: 1,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            {user?.createdAt ? new Date(user?.createdAt).toLocaleString() : 'N/A'}
          </Typography>
        </Stack>
        <Stack
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          spacing={1}
          sx={{ gap: isMobile ? 0.5 : 1 }}
        >
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
            Updated:
          </Typography>
          <Typography
            variant='body2'
            sx={{
              flex: 1,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }}
          >
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
              <Typography
                key={idx}
                variant='body2'
                color='text.secondary'
                fontWeight={500}
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  wordBreak: 'break-word'
                }}
              >
                {field.label}:{' '}
                <Box component='span' sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {field.value}
                </Box>
              </Typography>
            ) : null
          )}
        </Stack>
      ) : (
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
          No address info provided.
        </Typography>
      )}
    </InfoCard>
  )

  // Profile Card (other info)
  const profileCard = <EnhancedProfileCard profile={profile} />

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${alpha(
                       theme.palette.secondary.main,
                       0.05
                     )} 0%, transparent 50%),
                     ${theme.palette.background.default}`
      }}
    >
      {/* Content Area */}
      <Container maxWidth='lg' sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        {/* Modern User Profile Banner */}
        <Card
          sx={{
            background: theme.palette.background.paper,
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
            mb: { xs: 3, sm: 4 },
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 4px 20px ${alpha(theme.palette.common.black, 0.4)}`
                : '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          {/* Decorative Top Bar */}
          <Box
            sx={{
              height: { xs: 4, sm: 6 },
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
            }}
          />

          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems='center'>
              {/* User Avatar and Name */}
              <Grid item xs={12} md={6}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 2.5, md: 3 }}
                  alignItems={{ xs: 'center', sm: 'center' }}
                  sx={{ width: '100%' }}
                >
                  {/* Stunning Avatar with Gradient Ring */}
                  <Box
                    sx={{
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    {/* Animated Gradient Ring */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: { xs: 80, sm: 90, md: 100 },
                        height: { xs: 80, sm: 90, md: 100 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        padding: { xs: '3px', sm: '4px' },
                        boxShadow: `0 8px 32px ${alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.4 : 0.3
                        )}`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'pulse 3s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': {
                            boxShadow: `0 8px 32px ${alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.4 : 0.3
                            )}`
                          },
                          '50%': {
                            boxShadow: `0 12px 48px ${alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === 'dark' ? 0.6 : 0.5
                            )}`
                          }
                        },
                        '&:hover': {
                          transform: { xs: 'none', sm: 'rotate(5deg) scale(1.05)' },
                          boxShadow: `0 16px 56px ${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.5 : 0.4
                          )}`
                        }
                      }}
                    >
                      {/* Inner White Circle */}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: theme.palette.background.paper,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        {profile?.image ? (
                          <Avatar
                            src={profile.image}
                            alt={fullName}
                            sx={{ width: '100%', height: '100%', borderRadius: '50%' }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: { xs: 32, sm: 38, md: 46 },
                              fontWeight: 800,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {avatarInitial}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* User Info with Enhanced Typography */}
                  <Stack
                    spacing={{ xs: 1, sm: 1.5 }}
                    flex={1}
                    sx={{ minWidth: 0, width: '100%', alignItems: { xs: 'center', sm: 'flex-start' } }}
                  >
                    <Typography
                      variant='h3'
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        textAlign: { xs: 'center', sm: 'left' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {fullName}
                    </Typography>

                    <Stack spacing={1}>
                      <Stack
                        direction='row'
                        spacing={{ xs: 1, sm: 1.25 }}
                        alignItems='center'
                        justifyContent={{ xs: 'center', sm: 'flex-start' }}
                        sx={{ width: '100%', flexWrap: 'wrap' }}
                      >
                        <Box
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
                              theme.palette.secondary.main,
                              0.1
                            )})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.primary.main,
                            flexShrink: 0
                          }}
                        >
                          <EmailIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                        </Box>
                        <Tooltip title={primaryEmail} arrow>
                          <Typography
                            variant='body1'
                            color='text.secondary'
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: emailFontSize.xs, md: emailFontSize.sm },
                              flex: 1,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: { xs: 'normal', sm: 'nowrap' },
                              wordBreak: { xs: 'break-all', sm: 'normal' },
                              textAlign: { xs: 'center', sm: 'left' }
                            }}
                          >
                            {primaryEmail}
                          </Typography>
                        </Tooltip>
                      </Stack>

                      {(profile?.phone || user?.phone) && (
                        <Stack
                          direction='row'
                          spacing={{ xs: 1, sm: 1.25 }}
                          alignItems='center'
                          justifyContent={{ xs: 'center', sm: 'flex-start' }}
                          sx={{ width: '100%', flexWrap: 'wrap' }}
                        >
                          <Box
                            sx={{
                              width: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: theme.palette.secondary.main,
                              flexShrink: 0
                            }}
                          >
                            <PhoneIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                          </Box>
                          <Typography
                            variant='body1'
                            color='text.secondary'
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' },
                              flex: 1,
                              minWidth: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: { xs: 'normal', sm: 'nowrap' },
                              wordBreak: { xs: 'break-all', sm: 'normal' },
                              textAlign: { xs: 'center', sm: 'left' }
                            }}
                          >
                            {profile?.phone || user?.phone}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      direction='row'
                      flexWrap='wrap'
                      justifyContent={{ xs: 'center', sm: 'flex-start' }}
                      sx={{
                        mt: { xs: 1.5, sm: 2 },
                        columnGap: { xs: 0.75, sm: 1 },
                        rowGap: { xs: 0.75, sm: 1 }
                      }}
                    >
                      <Chip
                        label={user?.isActive ? 'Active' : 'Inactive'}
                        color={user?.isActive ? 'success' : 'error'}
                        size={isMobile ? 'small' : 'medium'}
                        variant='filled'
                        sx={{
                          flexShrink: 0,
                          fontWeight: 600,
                          color: 'white',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 },
                          boxShadow: user?.isActive
                            ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                            : '0 4px 12px rgba(239, 68, 68, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: { xs: 'none', sm: 'translateY(-2px)' },
                            boxShadow: user?.isActive
                              ? '0 6px 16px rgba(16, 185, 129, 0.4)'
                              : '0 6px 16px rgba(239, 68, 68, 0.4)'
                          }
                        }}
                      />
                      <Chip
                        label={user?.isVerified ? 'Verified' : 'Unverified'}
                        icon={user?.isVerified ? <VerifiedUserIcon sx={{ fontSize: { xs: 16, sm: 20 } }} /> : undefined}
                        color={user?.isVerified ? 'success' : 'warning'}
                        size={isMobile ? 'small' : 'medium'}
                        variant='filled'
                        sx={{
                          flexShrink: 0,
                          fontWeight: 600,
                          color: 'white',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 },
                          boxShadow: user?.isVerified
                            ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                            : '0 4px 12px rgba(251, 191, 36, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: { xs: 'none', sm: 'translateY(-2px)' },
                            boxShadow: user?.isVerified
                              ? '0 6px 16px rgba(16, 185, 129, 0.4)'
                              : '0 6px 16px rgba(251, 191, 36, 0.4)'
                          }
                        }}
                      />
                      {user?.roles?.includes('ADMIN') && (
                        <Chip
                          label='Admin'
                          icon={<AdminPanelSettingsIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                          color='error'
                          size={isMobile ? 'small' : 'medium'}
                          variant='filled'
                          sx={{
                            flexShrink: 0,
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)'
                            }
                          }}
                        />
                      )}
                      {!user?.roles?.includes('ADMIN') && user?.roles?.includes('SUPER_USER') && (
                        <Chip
                          label='Super User'
                          icon={<AdminPanelSettingsIcon />}
                          color='warning'
                          size='medium'
                          variant='filled'
                          sx={{
                            flexShrink: 0,
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(251, 191, 36, 0.4)'
                            }
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Member ID and Join Date - Enhanced Cards */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        position: 'relative',
                        background: theme.palette.background.paper,
                        borderRadius: { xs: 2, sm: 3 },
                        p: { xs: 2, sm: 3 },
                        border: `2px solid ${alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.3 : 0.2
                        )}`,
                        textAlign: 'center',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        },
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-8px) scale(1.02)' },
                          boxShadow: `0 12px 32px ${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.4 : 0.25
                          )}`,
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: { xs: 1.5, sm: 2 },
                          boxShadow: `0 4px 16px ${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.4 : 0.3
                          )}`
                        }}
                      >
                        <i className='ri-vip-crown-line' style={{ fontSize: isMobile ? 20 : 24, color: 'white' }} />
                      </Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          textTransform: 'uppercase',
                          letterSpacing: { xs: '1px', sm: '1.5px' },
                          fontWeight: 700,
                          display: 'block',
                          mb: 1
                        }}
                      >
                        Member ID
                      </Typography>
                      <Typography
                        variant='h6'
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 800,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          fontFamily: 'monospace',
                          letterSpacing: '0.5px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {user?.memberId || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        position: 'relative',
                        background: theme.palette.background.paper,
                        borderRadius: { xs: 2, sm: 3 },
                        p: { xs: 2, sm: 3 },
                        border: `2px solid ${alpha(
                          theme.palette.secondary.main,
                          theme.palette.mode === 'dark' ? 0.3 : 0.2
                        )}`,
                        textAlign: 'center',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
                        },
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-8px) scale(1.02)' },
                          boxShadow: `0 12px 32px ${alpha(
                            theme.palette.secondary.main,
                            theme.palette.mode === 'dark' ? 0.4 : 0.25
                          )}`,
                          borderColor: theme.palette.secondary.main
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: { xs: 1.5, sm: 2 },
                          boxShadow: `0 4px 16px ${alpha(
                            theme.palette.secondary.main,
                            theme.palette.mode === 'dark' ? 0.4 : 0.3
                          )}`
                        }}
                      >
                        <i
                          className='ri-calendar-event-line'
                          style={{ fontSize: isMobile ? 20 : 24, color: 'white' }}
                        />
                      </Box>
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          textTransform: 'uppercase',
                          letterSpacing: { xs: '1px', sm: '1.5px' },
                          fontWeight: 700,
                          display: 'block',
                          mb: 1
                        }}
                      >
                        Joined
                      </Typography>
                      <Typography
                        variant='h6'
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 800,
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          letterSpacing: '0.5px'
                        }}
                      >
                        {user?.createdAt
                          ? new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Cards with Modern Design */}
        <Box mb={{ xs: 3, sm: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(auto-fit, minmax(200px, 1fr))'
              },
              gap: { xs: 1.5, sm: 2.5 }
            }}
          >
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </Box>
        </Box>

        {/* Info Cards Layout */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
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
      </Container>
    </Box>
  )
}

export default UserDetailsPage
