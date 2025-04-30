const {
  joinGame,
  startGame,
  sendQuestion,
  receiveAnswer,
  sendLeaderboard,
  receiveChatMessage,
  sendNotification,
  listPlayersInGameRoom,
  sendMessageToRoom
} = require('./gameHandlerImplementation');

module.exports = (socket, redisClient, io) => {
  // socket.on('START_GAME', (data) => startGame(socket, redisClient,data));
  // socket.on('SEND_QUESTION', (data) => sendQuestion(socket, data));
  // socket.on('RECEIVE_ANSWER', (data) => receiveAnswer(socket, data));
  // socket.on('SEND_LEADERBOARD', () => sendLeaderboard(socket));
  // socket.on('RECEIVE_CHAT', (data) => receiveChatMessage(socket, data));
  //  socket.on('SEND_NOTIFICATION', (data) => sendNotification(socket, data));


    // Listen for 'sync' event from the client
    socket.on('sync', () => {
      const serverTime = Date.now();

      // Emit the server time immediately back to the client
      socket.emit('syncResponse', { serverTime });
    });

  socket.on('action', (message) => {
    console.log('GameSocketService: Received message:', message);
    const { actionType, data } = message;

    // Handle different action types
    switch (actionType) {
      case 'JOIN_GAME':
        // Handle sending a message
        joinGame(socket, redisClient, io, data);
        break;
      case 'START_GAME':
        // Handle sending a message
        console.log('GameSocketService: Invoking startGame handler:');
        startGame(socket, redisClient, io, data);
        break;

        case 'RECEIVE_ANSWER':
          // Handle sending a message
          console.log('GameSocketService: Invoking receiveAnswer handler:');
          receiveAnswer(socket, redisClient, io, data);
          break;

      case 'REQUEST_PLAYERS_LIST':
        // Handle another action
        listPlayersInGameRoom(io, data);
        break;

      case 'SEND_MESSAGE_TO_ROOM':
        // Handle another action
        const { from, message, gamePin } = data;
        sendMessageToRoom(io, gamePin,from, message);
        break;

      default:
        console.warn(`Unknown action type: ${actionType}`);
    }

  })
};
