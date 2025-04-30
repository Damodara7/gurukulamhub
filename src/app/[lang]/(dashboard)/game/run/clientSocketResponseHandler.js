// socketResponseHandler.js
export const receiveSocketResponse = (response, addMessage, handleActionType) => {
  const { actionType, data } = response.message;

  console.log(`Received response for action: ${actionType}`, data);

  // Process the server response based on the action type
  switch (actionType) {
    case 'GAME_STARTED':
      handleActionType('GAME_STARTED', data);
      addMessage(`Game started successfully: ${data.gameId}`, 'system');
      break;

    case 'GAME_PAUSED':
      handleActionType('GAME_PAUSED', data);
      addMessage('Game paused.', 'system');
      break;

    case 'NEW_PLAYER_JOINED':
      handleActionType('NEW_PLAYER_JOINED', data);
      addMessage(`New player joined: ${data.playerName}`, 'system');
      break;

      case 'RECEIVED_ANSWER':
        handleActionType('RECEIVED_ANSWER', data);
        addMessage(`New player joined: ${data.playerName}`, 'system');
        break;

    case 'CHAT_MESSAGE':
      addMessage(data.message, 'chat');
      break;

    default:
      console.warn(`Unhandled action type: ${actionType}`);
      addMessage(`Unhandled action type: ${actionType}`, 'system');
      break;
  }
};
