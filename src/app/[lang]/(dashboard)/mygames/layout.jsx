import React from 'react'
import GameTabs from '@/components/game/GameTabs'
// import GamePinInputForm from '@/components/game/GamePinInputForm'

function layout({ children, params }) {
  //return <GameTabs children={children} />
  //   return <GamePinInputForm />
  return <>{children}</>
}

export default layout
