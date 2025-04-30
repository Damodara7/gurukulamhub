import JoinGameRoom from "@/views/game/JoinGameRoom"
const Page = ({params,searchParams}) => {
  console.error("Params", params,searchParams)
  const {gameId,gamePin } = params;
  return (
    <JoinGameRoom gameId={gameId} gamePin={gamePin}/>
  )
}

export default Page
