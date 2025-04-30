'use client'

import './Marquee.css'
/********** Standard imports.*********************/
import React, { useEffect, useState, useRef } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
/********************************************
 * ///https://www.freecodecamp.org/news/how-to-build-a-marquee-component-with-react/*/
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'

const Marquee = ({ position = 'top', positionClass = ' top-16', ads = [] }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])

  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    let isFetching = false // Flag to prevent multiple requests

    async function getData() {
      if (isFetching) return // Prevent multiple requests
      setLoading(true)
      isFetching = true

      const result = await RestApi.get(`${ApiUrls.v0.ADMIN_GET_ADVERTISEMENT}`)

      if (isMounted) {
        if (result?.status === 'success') {
          setLoading(false)
          if (result.result.length > 0) setData(result.result)
          else {
            setData([])
          }
        } else {
          // toast.error(result?.message || 'Failed to fetch advertisements.')
          setLoading(false)
        }
      }

      isFetching = false // Reset the flag when request is completed
    }

    getData()

    return () => {
      isMounted = false // Cleanup to prevent state update after unmounting
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentAdIndex(prevIndex => (prevIndex + 1) % data.length)
    }, 26000) // Update index every 3 seconds (adjust as needed)
    return () => clearInterval(intervalId) // Clear interval on unmount
  }, [data])

  if (loading) return <>Fetching Advertisements Please Wait...</>

  let classNames = ' marquee-section enable-animation fixed  ml-6 -left-4 '

  // conditionally add a class based on position parameter
  if (position === 'top') {
    classNames += positionClass
  } else if (position === 'bottom') {
    classNames += ' bottom-14'
  }

  return (
    <>
      <section className={classNames} style={{ zIndex: 1001 }}>
        <div className='marquee -left-4'>
          <ul className='marquee__content'>
            {data?.map((ad, index) => (
              <div key={index} className='marquee__item'>
                {ad.mediaType == 'video' ? (
                  <div style={{ maxHeight: '180px' }}>
                    <VideoAd url={ad?.imageUrl} muted></VideoAd>
                  </div>
                ) : (
                  <div className={ad.runType}>
                    <img src={ad.imageUrl} alt={ad.text} />
                  </div>
                )}
              </div>
            ))}
          </ul>

          <ul aria-hidden='true' className='marquee__content'>
            {data?.map((ad, index) => (
              <div key={index} className='marquee__item'>
                {ad.mediaType === 'video' ? (
                  <div style={{ maxHeight: '180px' }}>
                    <VideoAd url={ad?.imageUrl} muted></VideoAd>
                  </div>
                ) : (
                  <div className={ad?.runType}>
                    <img src={ad.imageUrl} alt={ad.text} />
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      </section>
      {data.length > 0 ? (
        <section style={{ zIndex: 1001 }} className=' marquee-section  fixed ml-2  -left-2 bottom-0 '>
          <div className='marquee'>
            <ul className='marquee__content'>
              <div key={currentAdIndex} className='marquee__item'>
                {data[currentAdIndex]?.status === 'active' && data[currentAdIndex]?.mediaType === 'video' ? (
                  <div className='ml-6' style={{ margin: '0px' }}>
                    <VideoAd showPause showMute url={data[currentAdIndex]?.imageUrl}></VideoAd>
                  </div>
                ) : (
                  <div className={data[currentAdIndex].runType}>
                    <img src={data[currentAdIndex]?.imageUrl} alt={data[currentAdIndex]?.description} />
                  </div>
                )}
                {/* */}
              </div>
            </ul>
          </div>
        </section>
      ) : (
        <></>
      )}
    </>
  )
}

export default Marquee
