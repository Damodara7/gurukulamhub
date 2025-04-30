

import RunGameView from '@/views/game/RunGameView';

function Page({ params,searchParams }) {
  console.error("Params", params,searchParams)
  const {gameId } = params;
  return (
//<RunGame  gameId={gameId}/>
<RunGameView gameId={gameId}/>
)
}

export default Page

