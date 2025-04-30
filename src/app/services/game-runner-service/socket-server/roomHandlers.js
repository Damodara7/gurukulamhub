const registerGameHandlersWithSocket = require('./registerGameHandlersWithSocket')

// Connection handler to manage individual socket connections
module.exports = (io, redisClient) => {
  if (io == null || redisClient == null) {
    console.error(' ERROR :::::: Require io-server and redisClient ::::::')
    return
  }

  pio = io

  io.on('connection', socket => {
    const connectionId = socket.handshake.query.connectionId
    console.log(`GameSocketService: New client with (socket.id) connectionId: (${socket.id})`, connectionId)
    // Attach event handlers from socketEvents
    registerGameHandlersWithSocket(socket, redisClient, io)

    // Handle socket disconnect
    socket.on('disconnect', () => {
      console.log(`GameSocketService: Client disconnected: ${socket.id}`)
    })

    // Example of sending a question to a room, room handlers...
    socket.on('ROOM:SEND_QUESTION', (roomName, question, currentQuestionIndex, serverQuestionSentTime) => {
      io.to(roomName).emit('question', question, currentQuestionIndex, serverQuestionSentTime) // Emit to room
      var request = {
        from: 'GameSocketService',
        message: 'Sent question:' + currentQuestionIndex + ':' + serverQuestionSentTime
      }
      io.to(roomName).emit('chat', request)
    })

    // Example of sending a question to a room, room handlers...
    socket.on('ROOM:CHAT', (roomName, request) => {
      console.log('GameSocketService: Room handler: ROOM:CHAT')
      io.to(roomName).emit('chat', request)
    })

    // Game completed
    //GAME_COMPLETED

    socket.on('ROOM:GAME_COMPLETED', (roomName, message) => {
      console.log('GameSocketService: Room handler:ROOM:GAME_COMPLETED', socket.id, roomName, message)
      io.to(roomName).emit('GAME_COMPLETED', message) // Emit to room
      var request = { from: 'GameService', message: 'GAME_COMPLETED' }
      io.to(roomName).emit('chat', request)
    })

    socket.on('ROOM:GAME_STARTING', (roomName, message) => {
      console.log('GameSocketService: Room handler:ROOM:GAME_STARTING', socket.id, roomName, message)
      io.to(roomName).emit('GAME_STARTING', message) // Emit to room
      var request = { from: 'GameService', message: 'GAME_STARTING' }
      io.to(roomName).emit('chat', request)
    })
  })
}
