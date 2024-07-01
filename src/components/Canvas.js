import React, { useRef, useEffect } from "react";

const Canvas = ({ renderCanvas }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas(canvasRef.current);
    }
  }, [renderCanvas]);

  return (
    <div className="canvas-container">
      <canvas
        id="music-for-airports"
        ref={canvasRef}
        width="1000"
        height="1000"
        className="canvas-element"
      ></canvas>
    </div>
  );
};

export default Canvas;
