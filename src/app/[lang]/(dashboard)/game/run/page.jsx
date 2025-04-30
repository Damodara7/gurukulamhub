'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef, useImperativeHandle } from 'react'
import { useGameContext } from '@/contexts/GameContext'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Grid,
  Paper,
  IconButton,
  Drawer,
  TextField
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import InfoIcon from '@mui/icons-material/Info'
import TimerIcon from '@mui/icons-material/Timer'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import PersonIcon from '@mui/icons-material/Person'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import CloseIcon from '@mui/icons-material/Close'
import moment from 'moment'
import { ChevronRight, ChevronLeft, StopRounded } from '@mui/icons-material' // Caret icons
import io from 'socket.io-client'
import './run.module.css' // Add this file for CSS transitions
import styles from './run.module.css' // CSS module for styling
import SocketMessages from './SocketMessages'
//import GameChatBox from "./GameChatBox"
import StatusIndicator from './StatusIndicator'
import { receiveSocketResponse } from './clientSocketResponseHandler'
import SwitchAccessShortcutAddIcon from '@mui/icons-material/SwitchAccessShortcutAdd'
import * as ClientApi from '@/app/api/client/client.api'
import { PlayQuiz } from './playquiz/PlayQuiz'
import { styled, keyframes } from '@mui/material'
import FullScreenComponent from './FullScreenComponent'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { calculateScoreForQuestion } from './playquiz/calculateScores.js'
let socket
let timeOffset = 0
let questionSentTime // Server-provided timestamp for when question was sent
import Leaderboard from './Leaderboard'
import IconButtonTooltip from '@/components/IconButtonTooltip'

export default function Run() {
  const { data: session } = useSession()
  const { gameData, updateGameData } = useGameContext()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [drawerContent, setDrawerContent] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currSocketId, setCurrSocketId] = useState(false)
  const [toolbarOpen, setToolbarOpen] = useState(true) // State for toolbar visibility
  const [isConnected, setIsConnected] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const router = useRouter()

  // const [playerId,setPlayerId] = useState();

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messageEndRef = useRef(null)
  const fullscreenRef = useRef()

  const [gameStatus, setGameStatus] = useState('NOT_STARTED')
  const [currentQuestionIndex, setCurrQuestionIndex] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [startCountdown, setStartCountdown] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // Store selected answers
  const [questions, setQuestions] = useState([]) // Store all questions for the selected language
  const [totalTime, setTotalTime] = useState(0)

  ///console.log("Page.jsx: selectedAnswers:",selectedAnswers)
  const childRef = useRef(null)
  // Access the query parameters
  const searchParams = useSearchParams()
  const playerId = searchParams.get('playerId')
  const [connectionId] = useState(playerId ? playerId : session.user.email) // Unique connection ID
  const [leaderboard, setLeaderboard] = useState([])

  const callPlayNextQuestion = (currentQuestionIndex, serverQuestionSentTime, timeOffset) => {
    // callSetQuestionIndex(currentQuestionIndex);
    console.log('Calling next question..', serverQuestionSentTime, ',', timeOffset)
    if (childRef.current) {
      console.log('ChildRef handleNext is getting called.', childRef.current)
      childRef.current.handleNext(currentQuestionIndex, serverQuestionSentTime, timeOffset) // Call the child's sayHello function
    } else {
      console.log('ChildRef of playQuiz is null')
    }
  }

  const initNewGame = () => {
    setGameStatus('NOT_STARTED')
    setTotalTime(0)
    setSelectedAnswers({})
    resetGame()
  }

  const resetGame = () => {
    setCurrQuestionIndex(0)
    setStartCountdown(false)
    setResetKey(prevKey => prevKey + 1) // Change the key to force a remount of PlayQuiz
  }

  // Define a keyframes animation for the blinking effect
  const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
  `

  // Styled component with the blinking animation
  const BlinkingIcon = styled('div')({
    animation: `${blinkAnimation} 1s infinite`
  })

  const getGameDetails = async gamePin => {
    try {
      const game = await ClientApi.getGameWithPin(gamePin)
      if (game) {
        await updateGameData({ ...game.result })
        console.log('Got game data..', game)
        if (game.result.gameStatus === 'running') {
          setGameStatus('STARTED')
        }
      }
    } catch (e) {
      toast.error('Error :', e)
    }
  }

  useEffect(() => {
    if (gameData?.startedTime) {
      const startTime = moment(gameData.startedTime)
      const intervalId = setInterval(() => {
        const duration = moment.duration(moment().diff(startTime))

        const hours = String(Math.floor(duration.asHours())).padStart(2, '0')
        const minutes = String(duration.minutes()).padStart(2, '0')
        const seconds = String(duration.seconds()).padStart(2, '0')
        setElapsedTime(`${hours}:${minutes}:${seconds}`)
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [gameData, updateGameData])

  useEffect(() => {
    if (session?.currentGameId && !gameData) {
      // Fetch the game details based on the currentGameId and store it in the context
      console.log('GamePin exists in session, but not in local, fetching now...')
      getGameDetails(session?.currentGameId)
    }
  }, [session, gameData, updateGameData])

  // Function to synchronize time with the server
  const syncTimeWithServer = () => {
    const clientSendTime = Date.now()

    // Emit 'sync' event to the server
    socket.emit('sync')

    // Listen for 'syncResponse' from the server
    socket.on('syncResponse', data => {
      const clientReceiveTime = Date.now()
      const serverTime = data.serverTime

      // Calculate RTT and offset
      const rtt = clientReceiveTime - clientSendTime
      timeOffset = serverTime + rtt / 2 - clientReceiveTime

      console.log('Calculated Time Offset (ms):', timeOffset)
    })
  }

  useEffect(() => {
    console.log('The socket Server url is...', process.env.NEXT_PUBLIC_SOCKET_IO_SERVER)
    //socket = io('http://ec2-65-2-71-250.ap-south-1.compute.amazonaws.com:4001');

    connectToSocketServer()
    // Call the sync function before the quiz session or periodically
    syncTimeWithServer()

    // Cleanup when the component unmounts
    return () => {
      if (socket) {
        socket.disconnect()
        console.log('Socket disconnected on component unmount')
      }
    }
  }, [])

  useEffect(() => {
    if (isConnected) {
      console.log('Socket Connection Established, now joining game...')
      handleJoinGame()
    }
  }, [gameData])

  const onCountdownEnd = () => {
    console.log('Game has ended!')
    setStartCountdown(false)
  }

  const connectToSocketServer = () => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_SERVER, {
      query: { connectionId }
    })
    console.log('Connection id is', connectionId)

    socket.on('connect', () => {
      console.log('Connected to server', socket.id)
      addMessage('Connected to the server.', 'system')
      setCurrSocketId(socket.id)
      setIsConnected(true) // Update the connection status
    })
    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setCurrSocketId(null)
      setIsConnected(false) // Update the connection status
      addMessage('Disconnected from the server.', 'system')
    })
    socket.on('connect_error', error => {
      console.error('Connection error:', error)
      setIsConnected(false) // Update the connection status
      addMessage(`Connection error: ${error.message}`, 'error')
    })

    socket.on('chat', message => {
      var { from, message } = message
      console.log('you got a message from ', from, ' message is :', message)
      addMessage(from + ':' + message, from)
    })

    socket.on('error', error => {
      console.error('server error:', error)
      // setIsConnected(false); // Update the connection status
      addMessage(`error: ${error.message}`, 'error')
    })

    socket.on('JOIN_SUCCESS', message => {
      console.log('JOIN_SUCCESS: Joined status:', message)
      // setIsConnected(false); // Update the connection status
      addMessage(`joined game: ${message.playerId}`, 'system')
      setIsJoined(true)
      setTotalTime(0)
    })

    socket.on('question', (message, currentQuestionIndex, serverQuestionSentTime) => {
      questionSentTime = serverQuestionSentTime
      setCurrQuestionIndex(currentQuestionIndex)
      setStartCountdown(false)
      setGameStatus('STARTED')
      console.log('Selected answers:', selectedAnswers)
      console.log('Received question :', message, currentQuestionIndex, serverQuestionSentTime)
      addMessage(`received question: ${message.label}`, 'system')
      callPlayNextQuestion(currentQuestionIndex, serverQuestionSentTime, timeOffset)
    })

    socket.on('GAME_COMPLETED', message => {
      console.log('Page.jsx:on_GAME_COMPLETED.Game Status :', message)
      addMessage(`Game Status: ${message}`, 'system')
      console.log('Selected answers:', selectedAnswers)
      setGameStatus('GAME_COMPLETED')
      resetGame()
    })

    socket.on('GAME_STARTING', message => {
      console.log('Page.jsx:on_GAME_STARTING.Selected answers:', selectedAnswers)
      console.log('Page.jsx:on_GAME_STARTING.Game Status :', message)
      addMessage(`Game Status: ${message}`, 'system')
      setCurrQuestionIndex(0)
      setStartCountdown(true)
      setTotalTime(0)
      setSelectedAnswers({})
      console.log('Loading game details......', session?.currentGameId)
      getGameDetails(session?.currentGameId)
    })

    socket.on('LEADERBOARD_UPDATE', message => {
      console.log('on_LEADERBOARD_UPDATE :', message)
      setLeaderboard([...message])
      addMessage(`Game Status: ${message}`, 'system')
      console.log('Leaderboard updated')
    })

    // Listen for structured server responses
    socket.on('action-response', response => {
      console.log('Received an action response:', response)
      receiveSocketResponse(response, addMessage, handleActionType)
    })
  }

  const addMessage = (message, type) => {
    setMessages(prevMessages => [...prevMessages, { text: message, type }])
    scrollToBottom()
  }

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (inputMessage.trim() && socket) {
      socket.emit('message', inputMessage)
      sendToSocketServer('SEND_MESSAGE_TO_ROOM', {
        from: playerId ? playerId : session.user.email,
        message: inputMessage,
        gamePin: gameData.gamePin
      })
      addMessage(inputMessage, 'client')
      setInputMessage('')
    }
  }

  const handleDrawerOpen = content => {
    setDrawerContent(content)
    setDrawerOpen(true)
  }

  const handleStartGame = () => {
    if (gameData.owner == session.user.email || gameData.moderator == session.user.email) {
      sendToSocketServer('START_GAME', {
        gamePin: gameData.gamePin,
        authorization: playerId ? playerId : session.user.email
      })
      addMessage('Starting game', 'client')
      setGameStatus('NOT_STARTED')
      setTotalTime(0)
      setSelectedAnswers({})
      getGameDetails(session?.currentGameId)
    }
  }

  const handleJoinGame = () => {
    console.log('Joining game ..gameData is ', gameData)
    if (gameData) {
      //socket.emit('JOIN_GAME', { gamePin: gameData.gamePin, playerId: session.user.email });
      sendToSocketServer('JOIN_GAME', {
        gamePin: gameData.gamePin,
        playerId: playerId,
        authorization: playerId ? playerId : session.user.email
      })
      addMessage('Joining game', 'client')
      setIsJoined(false)
    }
  }

  const handleAnswerQuestion = (currentQuestionIndex, questionId, timeTaken) => {
    console.log('###### handleAnswerQuestion: Questions..', questions, questionId, timeTaken)
    var score = calculateScoreForQuestion(questions[currentQuestionIndex], questionId, selectedAnswers)
    var reqObject = {
      gamePin: gameData.gamePin,
      playerId: playerId ? playerId : session.user.email,
      questionId: questionId,
      score: score,
      timeTaken: timeTaken
    }
    console.log('sendingAnswer:', reqObject)
    if (gameData) {
      sendToSocketServer('RECEIVE_ANSWER', reqObject)
      addMessage('Answering Question', 'client')
    }
  }

  const handleActionType = (actionType, data) => {
    switch (actionType) {
      case 'GAME_STARTED':
        console.log('Game has started with data:', data)
        // Handle the game start logic here
        break

      case 'GAME_PAUSED':
        console.log('Game is paused.')
        // Handle the game pause logic here
        break

      case 'ANSWER_RECEIVED':
        console.log('answer recieved from server for player:', data)
        // Update the player list or other relevant state
        break

      default:
        console.warn(`Unhandled action type: ${actionType}`)
        break
    }
  }

  /**
   * Sends data to the socket server.
   * @param {string} actionType - The type of action to send.
   * @param {object} data - The data to send to the server.
   */
  const sendToSocketServer = (actionType, data) => {
    if (!socket) {
      console.error('Socket connection is not established.')
      return
    }

    // Create a message object
    const message = {
      actionType,
      data
    }

    // Send the message
    socket.emit('action', message)
    console.log('Message sent to socket server:', message)
  }

  const handleEnterFullscreen = () => {
    if (fullscreenRef.current) {
      fullscreenRef.current.enterFullscreen()
    }
  }

  return (
    <FullScreenComponent ref={fullscreenRef}>
      <div style={{ width: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            minHeight: '100vh',
            /* width: '95vw', */
            width: '100%',
            backgroundImage: `url(${gameData?.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            opacity: 0.9,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: 1,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'space-around'
              }}
            >
              <IconButtonTooltip
              title={"Tool Bar"}
                className={` blinkingLight caret-toggle ${toolbarOpen ? 'blink2' : ''}`} // Apply blinking effect when open
                color='inherit'
                onClick={() => setToolbarOpen(!toolbarOpen)}
                sx={{ positions: 'absolute', top: 15, left: 15, zIndex: 1 }} // Adjusted positioning
              >
                {toolbarOpen ? (
                  <>
                    <p style={{ backgroundColor: 'black' }}>&lt;&lt;</p>
                  </>
                ) : (
                  <>
                    <p style={{ backgroundColor: 'black' }}>
                      <ChevronRight />
                    </p>
                  </>
                )}
              </IconButtonTooltip>

              <StatusIndicator gameData={gameData} isJoined={isJoined}></StatusIndicator>
              <div>
                <IconButtonTooltip
                title={"Timer"} color='inherit'>
                  <TimerIcon />
                </IconButtonTooltip>
                {elapsedTime}
              </div>
              <IconButtonTooltip
              title={"FullScreen"} 
              color='inherit' onClick={() => handleEnterFullscreen()}>
                <FullscreenIcon></FullscreenIcon>{' '}
              </IconButtonTooltip>
            </Box>
          </Box>

          <Box
            sx={{
              backdropFilter: 'blur(4px)',
              flexGrow: 1,
              color: '#fff',
              display: 'flex',
              flexDirection: 'row'
            }}
          >
            {/* Vertical Toolbar */}
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                display: toolbarOpen ? 'flex' : 'none',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                paddingY: 1,
                position: 'absolute',
                left: 0,
                height: '100%',
                top: 0, // Added to ensure it stretches from top to bottom
                zIndex: 100, // Set lower z-index than the hamburger
                transition: 'transform 0.3s ease',
                transform: toolbarOpen ? 'translateX(0)' : 'translateX(-100%)' // Slide effect
              }}
            >
              <IconButtonTooltip
               title={"Join Game"}
               sx={{ marginTop: '5px' }} color='inherit' onClick={handleJoinGame}>
                {isJoined ? <SwitchAccessShortcutAddIcon /> : <SwitchAccessShortcutAddIcon />}
              </IconButtonTooltip>
              <IconButtonTooltip
              title={"Game Info"}
              color='inherit' onClick={() => handleDrawerOpen('Game Info')}>
                <InfoIcon />
              </IconButtonTooltip>
              <IconButtonTooltip
              title={"Leader Board"}
              color='inherit' onClick={() => handleDrawerOpen('Leader Board')}>
                <LeaderboardIcon />
              </IconButtonTooltip>
              <IconButtonTooltip
              title={"players"}
              color='inherit' onClick={() => handleDrawerOpen('Players')}>
                <PersonIcon />
              </IconButtonTooltip>
              <IconButtonTooltip
              title={"Chat"} color='inherit' onClick={() => handleDrawerOpen('Chat')}>
                <ChatIcon />
              </IconButtonTooltip>
              <IconButtonTooltip title={"Start Game"} color='inherit' onClick={handleStartGame}>
                <PlayArrowIcon />
              </IconButtonTooltip>
              <IconButtonTooltip title={"Pause Game"} color='inherit' onClick={() => console.log('Pause Game')}>
                <PauseIcon />
              </IconButtonTooltip>
              <IconButtonTooltip
              title={"Close Game"} color='inherit' onClick={() => console.log('Close Game')}>
                <StopRounded />
              </IconButtonTooltip>
            </Box>
            {/* Current Question Display */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                /* width: '90%', */
                justifyContent: 'center'
              }}
            >
              <Card
                sx={{
                  backgroundColors: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  padding: 0,
                  textAlign: 'center',
                  width: { xs: '90%', md: '90%', lg: '90%' }
                }}
              >
                <CardContent style={{ width: '100%' }}>
                  <Leaderboard pLeaderboard={leaderboard}></Leaderboard>
                  <PlayQuiz
                    key={resetKey}
                    initNewGame={initNewGame}
                    handleAnswerQuestion={handleAnswerQuestion}
                    timeOffset={timeOffset}
                    quizId={gameData?.quizId}
                    startCountdown={startCountdown}
                    onCountdownEnd={onCountdownEnd}
                    questions={questions}
                    setQuestions={setQuestions}
                    selectedAnswers={selectedAnswers}
                    setSelectedAnswers={setSelectedAnswers}
                    totalTime={totalTime}
                    setTotalTime={setTotalTime}
                    gameStatus={gameStatus}
                    ref={childRef}
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Players List Marquee */}
          <Box
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: 1,
              textAlign: 'center'
            }}
          ></Box>

          {/* Drawer for Game Actions */}
          <Drawer anchor='right' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 300, padding: 2 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant='h6'>{drawerContent}</Typography>
                <IconButtonTooltip title={"CloseIcon"} onClick={() => setDrawerOpen(false)}>
                  <CloseIcon />
                </IconButtonTooltip>
              </Box>
              {drawerContent === 'Chat' && (
                <SocketMessages
                  isConnected={isConnected}
                  handleSendMessage={handleSendMessage}
                  messages={messages}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                />
              )}
              {drawerContent === 'Game Info' && <Typography>Game information details go here...</Typography>}
              {drawerContent === 'Leader Board' && <Typography>Leader board details go here...</Typography>}
              {drawerContent === 'Players' && <Typography>Player list goes here...</Typography>}
              {drawerContent === 'Time Elapsed' && <Typography>Elapsed Time: {elapsedTime}</Typography>}
            </Box>
          </Drawer>
        </Box>
      </div>
    </FullScreenComponent>
  )
}
