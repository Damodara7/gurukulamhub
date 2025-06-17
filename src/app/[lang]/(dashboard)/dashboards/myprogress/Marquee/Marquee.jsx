'use client'
import './Marquee.css'
import React, { useEffect, useState } from 'react'
import * as RestApi from '@/utils/restApiUtil'
import { API_URLS as ApiUrls } from '@/configs/apiConfig'
import { toast } from 'react-toastify'
import VideoAd from '@views/apps/advertisements/VideoAd/VideoAd'

const Marquee = ({ position = 'top', positionClass = ' top-16', ads = [] }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)

  // Define fixed heights matching your content
  const CONTENT_HEIGHT = 60 // Match your maxHeight for video ads
  const BOTTOM_CONTENT_HEIGHT = 60 // Match your bottom ad height

  useEffect(() => {
    let isMounted = true
    let isFetching = false

    async function getData() {
      if (isFetching) return
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
          setLoading(false)
        }
      }

      isFetching = false
    }

    getData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentAdIndex(prevIndex => (prevIndex + 1) % data.length)
    }, 26000)
    return () => clearInterval(intervalId)
  }, [data])

  if (loading)
    return (
      <>
        {/* Top marquee skeleton - fixed height */}
        <section
          className='marquee-skeleton-section enable-animation fixed ml-6 -left-4'
          style={{
            zIndex: 1001,
            height: CONTENT_HEIGHT // Fixed height
          }}
        >
          <div className='marquee-skeleton -left-4' style={{ height: CONTENT_HEIGHT }}>
            <ul className='marquee-skeleton__content' style={{ height: CONTENT_HEIGHT }}>
              {[...Array(4)].map((_, index) => (
                <div key={index} className='marquee-skeleton__item' style={{ height: CONTENT_HEIGHT }}></div>
              ))}
            </ul>
            <ul aria-hidden='true' className='marquee-skeleton__content' style={{ height: CONTENT_HEIGHT }}>
              {[...Array(4)].map((_, index) => (
                <div
                  key={`hidden-${index}`}
                  className='marquee-skeleton__item'
                  style={{ height: CONTENT_HEIGHT }}
                ></div>
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom marquee skeleton - fixed height */}
        <section
          className='marquee-skeleton-section fixed ml-2 -left-2 bottom-0'
          style={{
            zIndex: 1001,
            height: BOTTOM_CONTENT_HEIGHT // Fixed height
          }}
        >
          <div className='marquee-skeleton' style={{ height: BOTTOM_CONTENT_HEIGHT }}>
            <ul className='marquee-skeleton__content' style={{ height: BOTTOM_CONTENT_HEIGHT }}>
              <div className='marquee-skeleton__item' style={{ height: BOTTOM_CONTENT_HEIGHT }}></div>
            </ul>
          </div>
        </section>
      </>
    )

  let classNames = ' marquee-section enable-animation fixed ml-6 -left-4 '

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
                  <div style={{ maxHeight: CONTENT_HEIGHT }}>
                    <VideoAd url={ad?.imageUrl} muted></VideoAd>
                  </div>
                ) : (
                  <div className={ad.runType}>
                    <img src={ad.imageUrl} alt={ad.text} style={{ maxHeight: CONTENT_HEIGHT }} />
                  </div>
                )}
              </div>
            ))}
          </ul>

          <ul aria-hidden='true' className='marquee__content'>
            {data?.map((ad, index) => (
              <div key={index} className='marquee__item'>
                {ad.mediaType === 'video' ? (
                  <div style={{ maxHeight: CONTENT_HEIGHT }}>
                    <VideoAd url={ad?.imageUrl} muted></VideoAd>
                  </div>
                ) : (
                  <div className={ad?.runType}>
                    <img src={ad.imageUrl} alt={ad.text} style={{ maxHeight: CONTENT_HEIGHT }} />
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      </section>
      {data.length > 0 ? (
        <section style={{ zIndex: 1001 }} className=' marquee-section fixed ml-2 -left-2 bottom-0'>
          <div className='marquee'>
            <ul className='marquee__content'>
              <div key={currentAdIndex} className='marquee__item'>
                {data[currentAdIndex]?.status === 'active' && data[currentAdIndex]?.mediaType === 'video' ? (
                  <div className='ml-6' style={{ margin: '0px', height: BOTTOM_CONTENT_HEIGHT }}>
                    <VideoAd showPause showMute url={data[currentAdIndex]?.imageUrl}></VideoAd>
                  </div>
                ) : (
                  <div className={data[currentAdIndex].runType}>
                    <img
                      src={data[currentAdIndex]?.imageUrl}
                      alt={data[currentAdIndex]?.description}
                      style={{ height: BOTTOM_CONTENT_HEIGHT }}
                    />
                  </div>
                )}
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