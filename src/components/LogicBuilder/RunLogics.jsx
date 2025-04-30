import React from 'react';
import LogicComponent from './LogicComponent';
import {Button}   from '@mui/material';; // Import the component you want to clone

const RunLogics = () => {
  const rules = [
    { source: 'cloneButton', event: 'click', action: 'clone', target: Button },
  ];

  return (
    <div>
      <button id="cloneButton">Clone Component</button>      
      <LogicComponent rules={rules} />
    </div>
  );
};

export default RunLogics;
