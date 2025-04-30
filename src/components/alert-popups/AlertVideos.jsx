import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import VideoPlayer from './VideoPlayer'
import { Typography } from '@mui/material'

const AlertVideos = forwardRef(({ videos, onVideoEnd }, ref) => {
  const [completedVideos, setCompletedVideos] = useState(new Set()) // Set to track completed videos
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null) // State to track the currently playing video
  const [videoSummaries, setVideoSummaries] = useState([])

  useEffect(() => {
    if (videos && videos.length > 0) {
      setCompletedVideos(new Set()) // Reset when the video list changes
    }
  }, [videos])

  const handleVideoEnd = (videoId, userAnswers) => {
    setCompletedVideos(prevSet => new Set(prevSet.add(videoId)))
    setVideoSummaries(prev => {
      if (prev.some(summary => summary.videoId === videoId)) {
        return prev // If videoId already exists, return previous state without adding a duplicate
      }
      return [...prev, { videoId, userAnswers }] // Add only if it doesn't exist
    })
    onVideoEnd(completedVideos.size)
  }

  const handlePlay = videoId => {
    console.log({ videoId })
    setCurrentlyPlaying(videoId) // Start the new video
  }

  useImperativeHandle(ref, () => {
    return {
      getLearningPointsRecords: () => {
        const mappedSummaries = videoSummaries.map(summary => ({
          videoId: summary.videoId,
          learningPoints: summary?.userAnswers?.reduce((acc, eachAnswer) => {
            return eachAnswer.isCorrect ? acc + eachAnswer.marks : acc
          }, 0),
          totalPoints: summary?.userAnswers?.reduce((acc, eachAnswer) => {
            return acc + eachAnswer.marks
          }, 0),
          answers: summary?.userAnswers,
          completionPercent: 100,
        }))

        return mappedSummaries
      }
    }
  })

  return (
    <div className='flex flex-col gap-3'>
      {videos &&
        videos.length > 0 &&
        videos.map((video, index) => {
          const isVideoCompleted = completedVideos.has(video._id) // Check if this video is completed
          const isCurrentlyPlaying = currentlyPlaying === video._id // Check if this video is currently playing

          const videoSummary = videoSummaries?.find(v => v.videoId === video._id)

          const videoMarks = videoSummary?.userAnswers?.reduce((acc, eachAnswer) => {
            return eachAnswer.isCorrect ? acc + eachAnswer.marks : acc
          }, 0)

          console.log({ videoId: video._id, isCurrentlyPlaying })

          return (
            <div
              key={video._id}
              style={{
                border: isVideoCompleted ? '2px solid green' : 'none', // Green border for completed videos
                padding: '8px',
                marginBottom: '10px'
              }}
            >
              <VideoPlayer
                key={`${video._id}-${completedVideos.has(video._id)}`} // Unique key to remount on completion
                url={video.url}
                questions={video?.questions || []}
                showPause={true}
                showMute={true}
                autoPlay={isCurrentlyPlaying} // Only autoplay the video that is currently playing
                row={false}
                controls={false}
                loop={false}
                width='100%'
                height='300px'
                onPlay={() => handlePlay(video._id)} // Trigger when the video starts playing
                onEnded={userAnswers => handleVideoEnd(video._id, userAnswers)} // Track completion per video
                remainingVideos={videos.length - completedVideos.size} // Remaining videos
                isVideoCompleted={isVideoCompleted}
              />
              {isVideoCompleted && (
                <div style={{ marginTop: '2px', textAlign: 'right' }}>
                  <Typography variant='body2' fontWeight='bold' color='green'>
                    Completed
                  </Typography>
                  {videoMarks > 0 && (
                    <Typography variant='body2' fontWeight='bold' color='green'>
                      You gained +{videoMarks} marks
                    </Typography>
                  )}
                </div>
              )}

              {/* Show the "Please complete all videos" message below the currently completed video */}
              {!isVideoCompleted && (
                <div style={{ marginTop: '1px', color: 'red' }}>
                  <Typography variant='body2'>Please complete all videos.</Typography>
                </div>
              )}
            </div>
          )
        })}
      {/* 
      <div>
        <Typography variant='h6'>Question Summary</Typography>
        {videoSummaries.map(summary => (
          <div key={summary.videoId}>
            <Typography variant='body1'>Video ID: {summary.videoId}</Typography>
            {summary.userAnswers.map((answer, idx) => (
              <div key={idx}>
                <Typography variant='body2' color={answer.isCorrect ? 'green' : 'red'}>
                  {answer.isCorrect ? 'Correct' : 'Wrong'} - {answer.question.text}
                </Typography>
              </div>
            ))}
          </div>
        ))}
      </div> */}
    </div>
  )
})

export default AlertVideos
