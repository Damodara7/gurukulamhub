import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  Select,
  Paper,
  Fade,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import IconButtonTooltip from '@/components/IconButtonTooltip';

let socket;

export default function GameChatBox() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isActionMenuExpanded, setIsActionMenuExpanded] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true); // Track chat visibility
  const [score, setScore] = useState(50); // Replace with actual score
  const [rank, setRank] = useState(5);   // Replace with actual rank

  useEffect(() => {
    connectToSocketServer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const connectToSocketServer = () => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_SERVER);
    socket.on('message', (msg) => {
      addMessage(msg);
    });
  };

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && socket) {
      socket.emit('message', inputMessage);
      addMessage(`You: ${inputMessage}`);
      setInputMessage('');
      setIsInputExpanded(false);
    }
  };

  return (

    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Close Button */}
      <IconButtonTooltip
      title={"Chat Visible"}
        sx={{ position: 'absolute', top: 4, right: 4, color: 'white' }}
        onClick={() => setIsChatVisible(false)}
      >
        <CloseIcon />
      </IconButtonTooltip>
      {isChatVisible && (
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            bgcolor: 'transparent',
            p: 1,
            maxHeight: '100px',
            overflowY: 'auto',
          }}
        >
          {messages.map((msg, index) => (
            <Typography key={index} variant="body2" sx={{ color: 'white' }}>
              {msg}
            </Typography>
          ))}
          <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', mt: 1 }}>
            Your Score: {score} | Rank: {rank}
          </Typography>
        </Paper>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          mt: 1,
        }}
      >
        {/* Chat Expand Button */}
        <IconButtonTooltip
        title={"InputExpand"}
          color="primary"
          onClick={() => {
            setIsInputExpanded(!isInputExpanded);
            setIsChatVisible(true);
          }
          }
          sx={{ animation: 'blink 1s infinite alternate' }}
        >
          <ChatIcon />
        </IconButtonTooltip>

        {/* Expanded Chat Input */}
        <Fade in={isInputExpanded}>
          <Box
            component="form"
            sx={{
              position: 'fixed',
              bottom: '50px',
              left: 0,
              right: 0,
              bgcolor: 'white',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mx: 1,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <IconButtonTooltip title={'sendicon'} color="primary" onClick={handleSendMessage}>
              <SendIcon />
            </IconButtonTooltip>
          </Box>
        </Fade>

        {/* Action Menu Button */}
        <IconButtonTooltip
        title={'Menu Button'}
          color="primary"
          onClick={() => setIsActionMenuExpanded(!isActionMenuExpanded)}
          sx={{ animation: 'blink 1s infinite alternate' }}
        >
          <SettingsIcon />
        </IconButtonTooltip>

        {/* Expanded Action Select */}
        <Fade in={isActionMenuExpanded}>
          <Select
            variant="outlined"
            size="small"
            value=""
            displayEmpty
            sx={{ bgcolor: 'white', borderRadius: 1 }}
            onChange={(e) => console.log(`Action selected: ${e.target.value}`)}
          >
            <MenuItem value="" disabled>
              Select Action
            </MenuItem>
            <MenuItem value="start-game">Start Game</MenuItem>
            <MenuItem value="send-question">Send Question</MenuItem>
          </Select>
        </Fade>
      </Box>
    </Box>

  );
}
