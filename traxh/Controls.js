import React from 'react';

const Controls = ({ onPlay, onStop }) => {
  return (
    <div>
      <button onClick={onPlay}>再生</button>
      <button onClick={onStop}>停止</button>
    </div>
  );
};

export default Controls;
