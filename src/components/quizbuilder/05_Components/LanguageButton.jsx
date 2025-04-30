import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
const LanguageButton = ({ lCode, lName, lIcon, onClick}) => {
  return <div className='flexColBox'>
    <Fab aria-label='edit' color='primary' onClick={()=> onClick ? onClick(lCode) : ''}>
      {lCode}
      <i icon={lIcon} width="2.2rem" height="2.2rem" style={{ color: "black" }} />
    </Fab>
    <p>{lName}</p>
  </div>
}

export default LanguageButton
