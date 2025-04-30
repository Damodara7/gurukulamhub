'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Box, Button, Card, Typography, Alert, Stack, Chip, Grid, CardContent, useTheme } from '@mui/material'
import Loading from '@/components/Loading' // Assume you have a loading component
import QuizQuestion from './QuizQuestion'
import QuizPosterScreen from './QuizPosterScreen'
import Timer, { formatTime } from '@/components/Timer'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import './playQuiz.css'
import QuizSummary from './QuizSummary'
import languageNotations from '@components/quizbuilder/05_Components/languageNotation.en.json'
import {
  getAllMatchingFileUrlsFromS3WithUnknownExtension,
  getFileUrlFromS3WithUnknownExtension,
  quizBucketName
} from '@/utils/awsS3Utils'
import { styled, keyframes } from '@mui/material';


export const fetchQuestionsByLanguage = async (quizId, languageCode) => {
  const result = RestApi.get(`${API_URLS.v0.USERS_QUIZ_QUESTION}?quizId=${quizId}&languageCode=${languageCode}`)
  return result
}
export const fetchQuizData = async quizId => {
  return RestApi.get(`${API_URLS.v0.USERS_QUIZ}/${quizId}`)
}




export const PlayQuiz = forwardRef(({ quizId,
  gameStatus, languageCode,
  initNewGame,
  onCountdownEnd,
  selectedAnswers,
  setSelectedAnswers,
  handleAnswerQuestion,
  questions,
  setQuestions,
  totalTime,
  setTotalTime,
  startCountdown }, ref) => {
  const theme = useTheme()
  const searchParams = useSearchParams()
  const [quiz, setQuiz] = useState(null) // Store quiz data
  const [selectedLanguage, setSelectedLanguage] = useState(languageCode ? languageCode : searchParams.get('languageCode')) // Store selected language
  const [startQuiz, setStartQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // Current question index
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false) // Show quiz summary
  const [usedHints, setUsedHints] = useState({})
  const [skippedQuestions, setSkippedQuestions] = useState([])
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [questionSentTime,setQuestionSentTime] = useState(0);
  const [time, setTime] = useState(0) // time in seconds
  const [timeOffset,setTimeOffset] = useState(0);
  // const languageCode = searchParams.get('languageCode')
  //console.log("GamesStatus,langCode", gameStatus, languageCode)

  const [countdown, setCountdown] = useState(10);
  const [open, setOpen] = useState(true);


  // Define a keyframes animation for the blinking effect
  const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
  `;

  // Styled component with the blinking animation
  const BlinkingIcon = styled('div')({
    animation: `${blinkAnimation} 1s infinite`,
  });

  // Expose the function to the parent using useImperativeHandle
  useImperativeHandle(ref, () => ({
    handleNext,
    setCurrentQuestionIndex
  }));

  // Function to reset and start the timer on question change
  const resetTimer = () => {
    setTime(0)
    setIsTimerActive(true)
  }

  //console.log("PlayQuiz.init: selectedAnswers",selectedAnswers)

useEffect(() => {
  // Countdown timer effect
  let timer;
  if (countdown > 0) {
    timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
  } else if (countdown === 0) {
    onCountdownEnd();
  }

  return () => clearInterval(timer);  // Cleanup interval on component unmount or countdown end
}, [countdown]);



useEffect(() => {
  if (startCountdown) {
    setCountdown(10);  // Reset countdown
  }
}, [startCountdown]);


  // Start/reset timer when a new question is displayed
  useEffect(() => {
    if (questions.length > 0) {
      resetTimer() // Reset timer when the current question changes
    }
  }, [currentQuestionIndex, questions])

  // Increment timer by 1 every second
  useEffect(() => {
    let interval = null
    if (isTimerActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive])


  // Watch for changes in search params (especially 'languageCode')
  useEffect(() => {
    const languageCode = searchParams.get('languageCode')
    if (languageCode !== selectedLanguage) {
      setSelectedLanguage(languageCode) // Trigger re-fetch of questions when language changes
    }
  }, [searchParams, selectedLanguage])

  async function getQuizDocUrls(quizUUID) {
    try {
      const fileUrls = await getAllMatchingFileUrlsFromS3WithUnknownExtension({
        // Urls
        bucketName: quizBucketName,
        fileNamePrefix: `${quizUUID}/documents`
      })
      console.log('quiz doc urls: ', fileUrls)
      if (fileUrls) {
        return fileUrls.map(fileUrl => {
          // Use a regex to capture the id from the URL (assuming the pattern is `${quizId}/documents/${id}.fileType`)
          const match = fileUrl.match(/\/documents\/(\d+)\./) // Extracts the id (digits) between "/documents/" and the file extension (.)

          const id = match ? match[1] : null // If a match is found, extract the id (match[1])

          return {
            id: +id, // Use the extracted id or a fallback if not found
            description: `document-${id || 'unknown-id'}`, // Use id in the description
            document: fileUrl // The file URL
          }
        })
      } else {
        console.log('No quiz docs found')
      }
    } catch (error) {
      console.log('Error getting quiz docs: ', error)
    }
  }

  // Fetch quiz data when the component loads
  useEffect(() => {
    async function getQuizData() {

      console.log("Getting Quiz Data for ",quizId)
      setLoading(true)
      const result = await fetchQuizData(quizId) // Fetch quiz metadata
      console.log("Result of quizData ",result.result)
      if (result?.status === 'success') {
        // toast.success('Successfully loaded quiz')
        const quizDocs = await getQuizDocUrls(result.result.id) // uuId, not _id
        console.log('Quiz docs: ', quizDocs)

        // Assuming result.result.documents and quizDocs are both arrays of the same length
        const mergeDocuments = result.result.documents.map((doc, index) => {
          // Find corresponding document in quizDocs
          const matchingDoc = quizDocs.find(quizDoc => quizDoc.id === doc.id) // Assuming they match by index

          return {
            description: doc.description, // Get description from result.result.documents
            document: matchingDoc?.document || null // Get document from quizDocs or fallback to null if not found
          }
        })

        // Now set the combined data in the quiz object
        setQuiz(prevQuiz => ({
          ...result?.result,
          documents: mergeDocuments // Update the documents with merged data
        }))

        // setQuiz(result?.result)
      } else {
        toast.error('Error:' + result?.message)
        console.log('Error Fetching quiz:', result)
      }
      setLoading(false)
    }
    if(quizId){
    getQuizData()
    }
  }, [quizId])

  let quizLanguages = []
  if (quiz) {
    quizLanguages =
      [
        { ...quiz.language, isPrimaryLanguage: true },
        ...quiz.secondaryLanguages.map(lang => ({ ...lang, isPrimaryLanguage: false }))
      ] || []
  }

  function getLanguageByCode(code) {
    const language = quizLanguages.find(lang => lang.code === code)
    return language
  }

  useEffect(() => {
    if (selectedLanguage) {
      console.log("Changed the language... loaded data for quizId and language..",selectedLanguage)
      handleLanguageSelect(selectedLanguage)
    }
  }, [selectedLanguage, quiz]) // whenever selected language or quiz changes it should be re-executed

  // Fetch questions based on selected language
  const handleLanguageSelect = async languageCode => {
    setSelectedLanguage(languageCode)
    await getQuestionsByLanguageCode(languageCode)
  }

  async function getQuestionsByLanguageCode(languageCode) {
    setLoading(true)
    const result = await fetchQuestionsByLanguage(quiz?._id, languageCode)
    if (result?.status === 'success') {
      // toast.success(`Questions of quizId=${quiz?.id} of languageCode=${languageCode} fetched successfully.`)
      setQuestions(result?.result)
      //setCurrentQuestionIndex(0)
    } else {
      toast.error('Error:' + result?.message)
      console.log('Error Fetching questions:', result)
    }
    setLoading(false)
  }



  //Function to handle answer submission
  //When user submits an answer

  function onAnswerSubmit(questionId,optionId) {
    const clientAnswerTime = Date.now();
    console.log ("PlayQuiz.onAnswerSubmit: Time offset, questionSentTime:",timeOffset,",",questionSentTime)
    const adjustedAnswerTime = clientAnswerTime + timeOffset;

    // Calculate the duration
    const timeTaken = adjustedAnswerTime - questionSentTime;
    console.log("PlayQuiz.onAnswerSubmit:Time Taken to Answer (ms):", timeTaken);
    let val = totalTime + timeTaken;
    setTotalTime(val);
    console.log("PlayQuiz.onAnswerSubmit:Total time taken till now..",val);
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
    console.log("PlayQuiz.onAnswerSubmit:",selectedAnswers);
    handleAnswerQuestion(currentQuestionIndex,questionId,timeTaken)
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    console.log("PlayQuiz.Answering question...",questionId,optionId)
    onAnswerSubmit(questionId,optionId);

  }



  // Handle hint view
  const handleShowHint = questionId => {
    setUsedHints(prev => ({ ...prev, [questionId]: true }))
  }


  // Go to the next question or complete the quiz
  const handleNext = (questionIndex,serverQuestionSentTime,serverTimerOffset) => {
    console.log("question index, serverQuestionSentTime , serverTimeOffset",questionIndex, serverQuestionSentTime, serverTimerOffset);
    if(questions.length==0) {
      console.log("Questions not loaded yet",questions.length);
      return;
    }
    if (questionIndex>=0) {
      console.log("Setting question index passed..", questionIndex,
        ",",serverQuestionSentTime,",",serverTimerOffset)
        console.log("Questions length:",questions.length)
      if (questionIndex < questions.length ) {
        setQuestionSentTime(serverQuestionSentTime);
        setTimeOffset(serverTimerOffset)
        setCurrentQuestionIndex( questionIndex );
        console.log("set the question index, offset, sentTime",":"
          ,currentQuestionIndex,",",timeOffset,",",questionSentTime)
      }else{
        setIsTimerActive(false)
      }
    }

  }

  // This effect will trigger when `currentQuestionIndex`, `questionSentTime`, or `timerOffset` changes
useEffect(() => {
  console.log("Updated state values:", {
    currentQuestionIndex,
    questionSentTime,
    timeOffset
  });
  setTime(0)
}, [currentQuestionIndex, questionSentTime, timeOffset]);


  if (loading) {
    return <Loading />
  }

  if (!quiz) {
    return <Alert severity='error'>Quiz not found</Alert>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswerSelected = Array.isArray(selectedAnswers[currentQuestion?._id])
    ? selectedAnswers[currentQuestion?._id].length > 0
    : !!selectedAnswers[currentQuestion?._id]
  const hasHint = !!currentQuestion?.data?.hint
  const hintUsed = !!usedHints[currentQuestion?._id]
  const isSkippable = currentQuestion?.data?.skippable


  if (gameStatus === 'NOT_STARTED' && selectedLanguage == null) {
    return <Box style={{width: '100%'}}>
      {
        startCountdown ? <> <Typography variant="h5" gutterBottom>
          Game starting in...
        </Typography>
        <Typography variant="h1" color="primary" style={{ margin: '1rem 0' }}>
          {countdown}
        </Typography>
        <Typography variant="body1">
          Get ready! The game will launch soon.
        </Typography>
        <br/>
        </>: <></>
      }
            <BlinkingIcon>
              <Typography variant='h6' color='red' sx={{ textAlign: 'center', width: '100%', mb: 2 }}>
                 <p>Please Select the language to play the game.</p>
              </Typography>
            </BlinkingIcon>
            <Grid container spacing={4} sx={{ justifyContent: 'center', width: '100%' }}>
              {quizLanguages.map(lang => (
                <Grid item xs={6} sm={4} md={4} lg={3} xl={2} key={lang.code}>
                  <Card
                    onClick={() => handleLanguageSelect(lang.code)} // Make the card clickable
                    sx={{
                      height: '150px', // Set a considerable height for the card
                      cursor: 'pointer', // Indicate the card is clickable
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      borderLeft: `8px solid ${theme.palette.primary.dark}`, // Left border with color
                      backgroundColor: '#f0f4f8', // Start with transparent background
                      color: theme.palette.primary.dark, // Initial text color
                      transition:
                        'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
                      display: 'flex', // Flex display for centering content
                      flexDirection: 'column', // Align content vertically
                      justifyContent: 'center', // Center vertically
                      alignItems: 'center', // Center horizontally
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        backgroundColor: theme.palette.primary.dark, // Fill background with border color
                        transform: 'translateY(-2px)', // Slight lift effect on hover
                        color: 'white' // Change text color to white
                      }
                    }}
                  >
                    {/* <CardContent> */}
                    <h4 style={{ textAlign: 'center' }}>{lang.name}</h4>
                    <h1 style={{ textAlign: 'center' }}>
                      {languageNotations.find(item => item.name === lang.name)?.notation || ''}
                    </h1>
                    {/* </CardContent> */}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
  }
  else if( gameStatus ==='NOT_STARTED'){
    return (
      <>
      {
        startCountdown ? <> <Typography variant="h5" gutterBottom>
          Game starting in...
        </Typography>
        <Typography variant="h1" color="primary" style={{ margin: '1rem 0' }}>
          {countdown}
        </Typography>
        <Typography variant="body1">
          Get ready! The game will launch soon.
        </Typography>
        <br/>
        </>: <></>
      }
      <BlinkingIcon>
              <Typography variant='h6' color='red' sx={{ textAlign: 'center', width: '100%', mb: 2 }}>
                 <p>Waiting for game to be started. </p>
              </Typography>
            </BlinkingIcon>
      <QuizPosterScreen
      key={selectedLanguage}
      quizLanguages={quizLanguages}
      language={getLanguageByCode(selectedLanguage)?.name || null}
      quizData={quiz}
    />
    </>
    )
  }
  else if (gameStatus === 'GAME_COMPLETED') {
    return <>
    <QuizSummary
         questions={questions}
         selectedAnswers={selectedAnswers}
        usedHints={usedHints}
         time={totalTime}
         initNewGame={initNewGame}
       />
    </>
  }
  else if (gameStatus === 'STARTED') {
    return (
      <>
        {!selectedLanguage ? (
          <>
            <BlinkingIcon>
              <Typography variant='h6' color='red' sx={{ textAlign: 'center', width: '100%', mb: 2 }}>
                <p>GAME STARTED. </p> <p>Please Select the language to play.</p>
              </Typography>
            </BlinkingIcon>
            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
              {quizLanguages.map(lang => (
                <Grid item xs={6} sm={4} md={3} lg={3} xl={2} key={lang.code}>
                  <Card
                    onClick={() => handleLanguageSelect(lang.code)} // Make the card clickable
                    sx={{
                      height: '150px', // Set a considerable height for the card
                      cursor: 'pointer', // Indicate the card is clickable
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      borderLeft: `8px solid ${theme.palette.primary.dark}`, // Left border with color
                      backgroundColor: '#f0f4f8', // Start with transparent background
                      color: theme.palette.primary.dark, // Initial text color
                      transition:
                        'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
                      display: 'flex', // Flex display for centering content
                      flexDirection: 'column', // Align content vertically
                      justifyContent: 'center', // Center vertically
                      alignItems: 'center', // Center horizontally
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        backgroundColor: theme.palette.primary.dark, // Fill background with border color
                        transform: 'translateY(-2px)', // Slight lift effect on hover
                        color: 'white' // Change text color to white
                      }
                    }}
                  >
                    {/* <CardContent> */}
                    <h4 style={{ textAlign: 'center' }}>{lang.name}</h4>
                    <h1 style={{ textAlign: 'center' }}>
                      {languageNotations.find(item => item.name === lang.name)?.notation || ''}
                    </h1>
                    {/* </CardContent> */}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : <>
          <Typography variant="h5">
            Question {currentQuestionIndex + 1}/{questions.length} : {time} Seconds
          </Typography>
          {questions.length > 0 ?
            <QuizQuestion
              key={new Date()}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              selectedAnswers={selectedAnswers}
              handleAnswerSelect={handleAnswerSelect}
              handleShowHint={handleShowHint}
              hintUsed={hintUsed}
              hasHint={hasHint}
              isSkippable={isSkippable}
              isAnswerSelected={isAnswerSelected}
              handleNext={handleNext}
            />
            : <></>
          }
        </>
        }
      </>
    )
  }

  });
