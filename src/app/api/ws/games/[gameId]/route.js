let clientsByGameId = globalThis.__clientsByGameId || {}
globalThis.__clientsByGameId = clientsByGameId

export function SOCKET(client, request, server, context){
    const {gameId} = context.params
    if(!clientsByGameId[gameId]) clientsByGameId[gameId] = new Set()
    clientsByGameId[gameId].add(client)
    console.log(`[WS] Game client connected for game ${gameId}. Total: ${clientsByGameId[gameId].size}`)

    client.on("close", ()=>{
        clientsByGameId[gameId].delete(client)
        console.log(`[WS] Game client disconnected for game ${gameId}. Total: ${clientsByGameId[gameId].size}`)
    })
}