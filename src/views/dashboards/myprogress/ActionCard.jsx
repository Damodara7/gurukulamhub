// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CenterBox from '@/components/CenterBox'

const ActionCard = ({title,icon,image,iconColor}) => {
  return (
    <Card style={{minWidth:"9.5rem"}}>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h6'>{title}</Typography>
        </div>
        <CenterBox>
        {icon?
        <span style={{color:iconColor}}>
        <i style={{ fontSize: '50px' }} className={icon}></i>
        </span>
        : ''}
        {image?
          <img
            src={image}
            height={50}
            className=' inline-end-7 bottom-6'
          />:""}
        </CenterBox>
      </CardContent>
    </Card>
  )
}

export default ActionCard
