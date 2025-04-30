// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import CustomAvatar from '@core/components/mui/Avatar'
import FloatingBar from '@/components/FloatingBar/FloatingBar'
import classnames from 'classnames'
import CenterBox from '../CenterBox'

const CardStats = props => {
  // Props
  const { icon, iconColor,title, stats, trendNumber, trend, chipText, chipColor } = props
//console.log('icon color',iconColor)
  return (
    <Card className='relative overflow-visible  mbs-1 p-0.5' style={{ width: "fit-content" , minWidth:"8rem"}}>
      <CardContent className='p-2'>
        <CenterBox>
          <CustomAvatar skin='light' variant='rounded' size={42} color={iconColor} >
            <i className={icon} />
          </CustomAvatar>
        </CenterBox>
        <Typography color='text.primary' className='font-medium'>
          {title}
        </Typography>
        <div className='flex items-center  gap-2 pbs-1 pbe-1.5 is-6/7 flex-wrap'>
        <CenterBox>

          <Typography variant='h5'>{stats}</Typography>
          <Typography color={trend === 'negative' ? 'error.main' : 'success.main'}>
            {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
          </Typography>

          </CenterBox>
        </div>
        <Chip label={chipText} color={chipColor} variant='tonal' size='small' />
      </CardContent>
    </Card>
  )
}

export default CardStats
