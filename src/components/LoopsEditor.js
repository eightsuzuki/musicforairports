import React, { useState, useEffect } from 'react';

const NOTES = [
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
];

const LoopsEditor = ({ loops, onLoopsChange }) => {
  const [localLoops, setLocalLoops] = useState(loops);

  useEffect(() => {
    setLocalLoops(loops);
  }, [loops]);

  const handleDurationChange = (index, newDuration) => {
    const updatedLoops = localLoops.map((loop, idx) =>
      idx === index ? { ...loop, duration: Math.floor(parseFloat(newDuration) * 100) / 100 } : loop
    );
    setLocalLoops(updatedLoops);
    onLoopsChange(updatedLoops);
  };

  const handleDelayChange = (index, newDelay) => {
    const updatedLoops = localLoops.map((loop, idx) =>
      idx === index ? { ...loop, delay: Math.floor(parseFloat(newDelay) * 100) / 100 } : loop
    );
    setLocalLoops(updatedLoops);
    onLoopsChange(updatedLoops);
  };

  const handleNoteChange = (index, newNote) => {
    const updatedLoops = localLoops.map((loop, idx) =>
      idx === index ? { ...loop, note: newNote } : loop
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
              <td>
                <select
                  value={loop.note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                >
                  {NOTES.map((note) => (
                    <option key={note} value={note}>
                      {note}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={loop.duration}
                  onChange={(e) => handleDurationChange(index, e.target.value)}
                  step="1"
                  min="1"
                  onBlur={(e) => handleDurationChange(index, e.target.value)} // キーボード入力対応
                />
              </td>
              <td>
                <input
                  type="number"
                  value={loop.delay}
                  onChange={(e) => handleDelayChange(index, e.target.value)}
                  step="1"
                  min="1"
                  onBlur={(e) => handleDelayChange(index, e.target.value)} // キーボード入力対応
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
