import React, { useEffect, useRef } from 'react';

const Canvas = ({ draw }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    draw(context);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width="1000"
      height="1000"
      style={{ width: '800px', height: '800px' }}
    ></canvas>
  );
};

export default Canvas;
