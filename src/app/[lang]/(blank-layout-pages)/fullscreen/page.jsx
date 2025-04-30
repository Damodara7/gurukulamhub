'use client'
import React, { useEffect } from 'react';

const MyComponent = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const content = document.querySelector('.main-content');
      content.style.marginTop = `${scrollY}px`;
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove event listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="main-content">
      {/* Your content here */}

    </div>
  );
};

export default MyComponent;
