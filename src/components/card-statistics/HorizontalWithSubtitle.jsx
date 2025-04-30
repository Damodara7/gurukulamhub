// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const HorizontalWithSubtitle = props => {
  const { title, value, avatarIcon, avatarColor, change, changeNumber, subTitle } = props

  return (
    <Card className='w-full h-full flex flex-col'>
      <CardContent className='flex flex-col justify-between flex-grow'>
        <div className='flex justify-between items-start gap-1 mb-2'>
          <div className='flex flex-col gap-1'>
            <Typography color='text.primary'>{title}</Typography>
            <div className='flex items-center gap-2 flex-wrap'>
              <Typography variant='h4'>{value}</Typography>
              <Typography
                color={change === 'negative' ? 'error.main' : change === 'positive' ? 'success.main' : 'text.primary'}
              >
                {change === 'zero' ? `(${changeNumber})` : `(${change === 'negative' ? '-' : '+'}${changeNumber})`}
              </Typography>
            </div>
          </div>
          <CustomAvatar color={avatarColor} skin='light' variant='rounded' size={42}>
            <i className={classnames(avatarIcon, 'text-[26px]')} />
          </CustomAvatar>
        </div>

        {/* Subtitle at the bottom, full width */}
        <Typography variant='body2' className='mt-auto'>
          {subTitle}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default HorizontalWithSubtitle
