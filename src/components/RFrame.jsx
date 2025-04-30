import React, { useState } from 'react';
import ReactIframe from 'react-iframe';

function Rframe() {
  const [iframeUrl, setIframeUrl] = useState('https://blog.openreplay.com/');
  const [isIframeLoaded, setIsIframeLoaded] = useState(false); // Track loading state

  const handleUrlChange = (newUrl) => {
    setIframeUrl(newUrl);
    setIsIframeLoaded(false); // Reset loading state on URL change
  };

  const handleLoadIframe = () => {
    setIsIframeLoaded(true); // Mark as loading
  };

  return (
    <div className='D'>
      <h1>WORKING WITH IFRAME</h1>
      <div className='RR'>
        {isIframeLoaded && (
          <ReactIframe
            url={iframeUrl}
            width="300px"
            height="200px"
            allow="fullscreen"
          />
        )}
        {!isIframeLoaded && (
          <button onClick={handleLoadIframe}>Load Iframe</button>
        )}
        <div className='button-container'>
          <button onClick={() => handleUrlChange('https://electoralsearch.eci.gov.in/')}>
            Load Electoral Search
          </button>
          <button onClick={() => handleUrlChange('https://blog.openreplay.com')}>
            Load previous URL
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rframe;
