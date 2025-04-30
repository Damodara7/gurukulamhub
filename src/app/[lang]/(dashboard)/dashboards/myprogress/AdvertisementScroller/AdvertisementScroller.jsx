import React, { useState, useEffect } from 'react';
import './AdvertisementScroller.css'; // Import your CSS file
const AdvertisementScroller = ({ advertisements, position="top", positionClass=" top-14" }) => {
  const advertisementsDef = [
    { id: 1, imageUrl: 'https://fakeimg.pl/250x60/', altText: 'Advertisement 1' },
    { id: 2, imageUrl: 'https://fakeimg.pl/450x60/', altText: 'Advertisement 2' },
    { id: 3, imageUrl: 'https://fakeimg.pl/250x60/', altText: 'Advertisement 3' },
    { id: 4, imageUrl: 'https://fakeimg.pl/250x60/', altText: 'Advertisement 4' },
    { id: 5, imageUrl: 'https://fakeimg.pl/250x60/', altText: 'Advertisement 5' },
  ];

  let classNames = ' scroll post-floating-bar active animation  flex flex-wrap fixed justify-center  h-14 z-50   ml-6';

  // conditionally add a class based on position parameter
  if (position === 'top') {
    classNames += positionClass;
    } else if (position === 'bottom') {
    classNames += ' bottom-14';
  }

  if (!advertisements) advertisements = advertisementsDef

  return (
    <div style={{ margin: "auto" }} >
      <div style={{ overflow: "hidden", width: "100%", left: "-24px", maxWidth: "2980px" }} id="header-top" className={classNames}  >
        <div style={{ width: "2480px" }}>
          <div className="m-scroll"  >
            {advertisements?.map(advertisement => (
              <span className='spans' key={advertisement.id} >
                <img className="advertisement-image"
                  src={advertisement.imageUrl}
                  alt={advertisement.altText}
                />
              </span>
            ))}
            {advertisements?.map(advertisement => (
              <span className='spans' key={advertisement.id} >
                <img className="advertisement-image"
                  src={advertisement.imageUrl}
                  alt={advertisement.altText}
                />
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdvertisementScroller;
