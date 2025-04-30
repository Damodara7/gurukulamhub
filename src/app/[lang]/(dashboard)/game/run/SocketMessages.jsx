import { Button, TextField } from '@mui/material';
import styles from './SocketMessages.module.css';
import { useRef,useEffect } from 'react';

const SocketMessages = ({messages, isConnected, inputMessage, setInputMessage,handleSendMessage}) => {
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (

<div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <TextField
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button onClick={handleSendMessage} disabled={!isConnected}>
          Send
        </Button>
      </div>
    </div>

)
}
export default SocketMessages
