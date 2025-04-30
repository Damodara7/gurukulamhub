// MUI Imports
import Fab from '@mui/material/Fab'


const RoundButton = ({ lCode, lName, lIcon }) => {
  return <div className='flexColBox'>
    <Fab aria-label='edit' color='primary'>
      {lCode}
      <i className={lIcon} width="2.2rem" height="2.2rem" style={{ color: "black" }} />
    </Fab>
    <p>{lName}</p>
  </div>
}

const RoundButtonSet = () => {
  return (
    <div className='flex gap-4 flex-col '>
      <div className='flex gap-4 mbe-6 '>
        <div className='flexColBox '>
          <RoundButton lCode={"eng"} lName={"English"} lIcon="uil:letter-english-a" />
          <RoundButton lCode={"tel"} lName={"Telugu"} lIcon="uil:letter-english-a" />
        </div>
      </div>
    </div>
  )
}

export default RoundButtonSet
