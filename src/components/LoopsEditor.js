import React, { useState, useEffect } from 'react';

const LoopsEditor = ({ loops, onLoopsChange }) => {
  const [localLoops, setLocalLoops] = useState(loops);

  useEffect(() => {
    setLocalLoops(loops);
  }, [loops]);

  const handleDurationChange = (index, newDuration) => {
    const updatedLoops = localLoops.map((loop, idx) =>
      idx === index ? { ...loop, duration: parseFloat(newDuration) } : loop
    );
    setLocalLoops(updatedLoops);
    onLoopsChange(updatedLoops);
  };

  const handleDelayChange = (index, newDelay) => {
    const updatedLoops = localLoops.map((loop, idx) =>
      idx === index ? { ...loop, delay: parseFloat(newDelay) } : loop
    );
    setLocalLoops(updatedLoops);
    onLoopsChange(updatedLoops);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Note</th>
            <th>Duration (s)</th>
            <th>Delay (s)</th>
          </tr>
        </thead>
        <tbody>
          {localLoops.map((loop, index) => (
            <tr key={index}>
              <td>{loop.instrument}</td>
              <td>{loop.note}</td>
              <td>
                <input
                  type="number"
                  value={loop.duration}
                  onChange={(e) => handleDurationChange(index, e.target.value)}
                  step="0.1"
                  min="0.1"  // ここで0以上を強制
                />
              </td>
              <td>
                <input
                  type="number"
                  value={loop.delay}
                  onChange={(e) => handleDelayChange(index, e.target.value)}
                  step="0.1"
                  min="0.1"  // ここで0以上を強制
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoopsEditor;
