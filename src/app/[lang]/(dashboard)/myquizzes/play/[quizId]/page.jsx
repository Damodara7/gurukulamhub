// frontend/pages/quiz/[quizId].js
"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Box, Button, Input, TextField } from '@mui/material';
import { v4 as uuid } from 'uuid';
import { useSession } from 'next-auth/react';
import useUUID from '@/app/hooks/useUUID';


let socket;

export default function QuizPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  //const username = "parsi";

  const [username, setUsername] = useState(null);
  const [pin, setPin] = useState(null);
  const [question, setQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [answer, setAnswer] = useState('');
  const [quizJoined, setQuizJoined] = useState(false)
  const [quizStatus, setQuizStatus] = useState("notstarted");
  const quizId = params.quizId;
  console.log("params", username, params.quizId)



  useEffect(() => {
    console.log("the socket server url is...",process.env.NEXT_PUBLIC_SOCKET_IO_SERVER)
    socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_SERVER);
    //socket = io('http://ec2-65-2-71-250.ap-south-1.compute.amazonaws.com:4001');


    socket.on('connect', (client) => {
      console.log('Connected to server', socket.id, socket);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      alert("disconnected from server...")

    });

    setUsername(session.user.email.toUpperCase())

    console.log("Socket.id, quizid, username...", socket.id, quizId, username)

    socket.on('joinedQuiz', (data) => {
      console.log("Joined quiz....", data)
      setQuizJoined(true);
      if (!data.success) {
        alert('Failed to join quiz: ' + data.message);
      }
    });

    socket.on('newQuestion', (data) => {
      console.log("Recieveed new question...")
      setQuestion(data);
      setAnswer('');
    });

    socket.on('scoreUpdate', (leaderboard) => {
      console.log("Score Update...", leaderboard)
      setLeaderboard(leaderboard);
    });

    socket.on('quizFinished', (leaderboard) => {
      console.log("Finished the quiz...", leaderboard)
      setQuestion(null);
      setAnswer(null);
      setQuizJoined(false)
      //setLeaderboard(leaderboard);
      alert('Quiz Finished!');
    });

    // Handle the result of joining a game
    socket.on('joinedGame', (data) => {
      if (data.success) {
        console.log(`Joined game with PIN: ${data.pin}`);
      } else {
        console.log('Failed to join game:', data.message);
      }
    });



    socket.on('gameCreated', (data) => {
      console.log('Game created with PIN:', data);
    });

    socket.on('gameStarted', (data) => {
      console.log('Game started with data', data)
    })

    socket.on('showAllGames', (data) => {
      console.log('Live Games in the store', data)
      setLiveGames(data.games)
    })

    // Listen for the game removal confirmation
    socket.on('gameRemoved', (data) => {
      alert(data.message);  // Inform the user that the game has been removed
    });

    // Listen for any error during game removal
    socket.on('removeGameError', (data) => {
      alert(data.message);  // Inform the user about the error
    });



    return () => {
      socket.disconnect({ username });
    };
  }, [quizId]);



  function createGame() {
    createTheGame("ramayana", username);
  }

  function createTheGame(quizId, username, startTime) {
    if (!startTime) startTime = new Date().getTime();
    console.log("Creating game..", quizId, username, startTime)
    // Create a new game and get the generated PIN
    socket.emit('createGame', { quizId, username, startTime });
  }

  function showGames() {
    console.log("Showing games...")
    socket.emit('showGames', { pin: 'ABC1947', username });
  }


  // Join a game with a PIN
  function joinGame() {
    console.log("joining with pin", pin, username)
    socket.emit('joinGame', { pin, username });
  }

  function startGame() {
    console.log("Starting game.....")
    setQuizStatus("started");
    //socket.emit('joinQuiz', { quizId, username });
    socket.emit('startGame', { pin, username });
  }

  function removeGame() {
    console.log("Removing game.....")
    if(!pin)    {
      alert("Need the Room PIN to remove the game");
      return;
    }
    socket.emit('removeGame', { pin, username });
  }


  const submitAnswer = async () => {
    socket.emit('submitAnswer', { quizId, answer });
  };

  const submitAckRequest = () => {
    //  socket.emit('submitAnswer', { quizId, answer });

    socket.timeout(5000).emit('ackRequest', { foo: 'bar' }, 'baz', (err, response) => {
      // This callback will be executed when the server responds
      console.log('Response from server:', response);

      // Handle the server's response (e.g., update UI)
      //alert(`Server Response: ${response.message}`);
    });
  }

  const startGame2 = () => {
    console.log("Starting quiz.....")
    setQuizStatus("started");
    //socket.emit('joinQuiz', { quizId, username });
    socket.emit('startQuiz', { quizId });

  };

  const joinQuiz = () => {
    console.log("Joining quiz game.....")
    // setQuizStatus("started");
    socket.emit('joinQuiz', { quizId, username });
    //socket.emit('startQuiz', { quizId });

  };
  const resetGame = () => {
    console.log(" resetQuiz game.....")
    setQuizStatus("notstarted")
    setQuestion(null)
    setLeaderboard(null)
    socket.emit('resetQuiz', { quizId });
  };

  return (
    <div>
      <h1>Game for quiz {quizId}</h1>
      <h4>{username}</h4>

      {question && (
        <div>
          <h2>{question.question}</h2>
          {question.options.map((option, index) => (
            <Button key={index} onClick={() => setAnswer(option)}>
              {option}
            </Button>
          ))}
        </div>
      )}
      <Button variant='contained'
        onClick={createGame}>Create Game</Button>

      <Button variant='contained'
        onClick={showGames}>Show Games</Button>
      <TextField
        id="outlined-controlled"
        label="Game Pin"
        value={pin}
        onChange={(event) => {
          setPin(event.target.value);
        }}
      />
      <Button variant='contained'
        onClick={joinGame}>Join Game</Button>

       <Button variant='contained'
        onClick={removeGame}>Remove Game</Button>

      <Button variant='contained'
        onClick={joinQuiz}>Join Quiz</Button>
      <Button variant='contained'
        style={{ display: quizStatus === 'notstarted' ? 'block' : 'none' }}
        onClick={startGame}>Start Game</Button>
      <Button variant='contained' style={{ display: quizStatus === 'notstarted' ? 'none' : 'block' }} onClick={resetGame}>Reset Game</Button>
      <hr /> <Box> &nbsp;</Box>
      <Button variant='contained'
        style={{ display: question == null ? 'none' : 'block' }}
        onClick={submitAnswer}>Submit Answer</Button>

      <Button variant='contained'
        onClick={submitAckRequest}>Submit AckRequest</Button>


      <h3>Leaderboard</h3>
      <ul>
        {leaderboard?.map((user, index) => (
          <li key={index}>
            {user.value}: {user.score} points
          </li>
        ))}
      </ul>
      <h3>Current Live Games</h3>
      <ul>
        {liveGames?.map((game, index) => (
          <li key={index}>
            {game.owner}: {game.status} : {game.pin} :
            <ul>
              {game.players.map((player, index) => (
                <li key={index}>{player.id}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
