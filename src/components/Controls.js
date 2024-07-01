import React from "react";

const Controls = ({ handlePlay, handleStop }) => (
  <div>
    <button id="play-button" onClick={handlePlay}>
      再生
    </button>
    <button id="stop-button" onClick={handleStop}>
      停止
    </button>
  </div>
);

export default Controls;
