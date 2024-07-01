import React, { useState, useEffect, useRef } from "react";
import Canvas from "./components/Canvas";
import Controls from "./components/Controls";
import LoopsEditor from "./components/LoopsEditor";
import "./App.css";

const SAMPLE_LIBRARY = {
  "Grand Piano": [
    { note: "A", octave: 4, file: "Samples/Grand Piano/piano-f-a4.wav" },
    { note: "A", octave: 5, file: "Samples/Grand Piano/piano-f-a5.wav" },
    { note: "A", octave: 6, file: "Samples/Grand Piano/piano-f-a6.wav" },
    { note: "C", octave: 4, file: "Samples/Grand Piano/piano-f-c4.wav" },
    { note: "C", octave: 5, file: "Samples/Grand Piano/piano-f-c5.wav" },
    { note: "C", octave: 6, file: "Samples/Grand Piano/piano-f-c6.wav" },
    { note: "D#", octave: 4, file: "Samples/Grand Piano/piano-f-d#4.wav" },
    { note: "D#", octave: 5, file: "Samples/Grand Piano/piano-f-d#5.wav" },
    { note: "D#", octave: 6, file: "Samples/Grand Piano/piano-f-d#6.wav" },
    { note: "F#", octave: 4, file: "Samples/Grand Piano/piano-f-f#4.wav" },
    { note: "F#", octave: 5, file: "Samples/Grand Piano/piano-f-f#5.wav" },
    { note: "F#", octave: 6, file: "Samples/Grand Piano/piano-f-f#6.wav" },
  ],
};

const OCTAVE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const INITIAL_LOOPS = [
  { instrument: "Grand Piano", note: "F4", duration: 19.7, delay: 4 },
  { instrument: "Grand Piano", note: "Ab4", duration: 17.8, delay: 8.1 },
  {instrument: 'Grand Piano', note: 'C5',  duration: 21.3, delay: 5.6},
  {instrument: 'Grand Piano', note: 'Db5', duration: 18.5, delay: 12.6},
  {instrument: 'Grand Piano', note: 'Eb5', duration: 20.0, delay: 9.2},
  {instrument: 'Grand Piano', note: 'F5',  duration: 20.0, delay: 14.1},
  {instrument: 'Grand Piano', note: 'Ab5', duration: 17.7, delay: 3.1}
];

const LANE_COLOR = "rgba(220, 220, 220, 0.3)";
const SOUND_COLOR = "#ED146F";

const App = () => {
  const [loops, setLoops] = useState(INITIAL_LOOPS);
  const [playingSince, setPlayingSince] = useState(null);
  const [audioContext] = useState(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const sampleCache = useRef({});
  const canvasRef = useRef(null);
  const convolverRef = useRef(null);
  const runningLoopsRef = useRef([]);

  const fetchSample = (path) => {
    if (!sampleCache.current[path]) {
      sampleCache.current[path] = fetch(encodeURIComponent(path))
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
    }
    return sampleCache.current[path];
  };

  const noteValue = (note, octave) => octave * 12 + OCTAVE.indexOf(note);

  const getNoteDistance = (note1, octave1, note2, octave2) =>
    noteValue(note1, octave1) - noteValue(note2, octave2);

  const getNearestSample = (sampleBank, note, octave) => {
    let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
      let distanceToA = Math.abs(
        getNoteDistance(note, octave, sampleA.note, sampleA.octave)
      );
      let distanceToB = Math.abs(
        getNoteDistance(note, octave, sampleB.note, sampleB.octave)
      );
      return distanceToA - distanceToB;
    });
    return sortedBank[0];
  };

  const flatToSharp = (note) => {
    switch (note) {
      case "Bb":
        return "A#";
      case "Db":
        return "C#";
      case "Eb":
        return "D#";
      case "Gb":
        return "F#";
      case "Ab":
        return "G#";
      default:
        return note;
    }
  };

  const getSample = (instrument, noteAndOctave) => {
    let [, requestedNote, requestedOctave] = /^(\w[b\#]?)(\d)$/.exec(
      noteAndOctave
    );
    requestedOctave = parseInt(requestedOctave, 10);
    requestedNote = flatToSharp(requestedNote);
    let sampleBank = SAMPLE_LIBRARY[instrument];
    let nearestSample = getNearestSample(
      sampleBank,
      requestedNote,
      requestedOctave
    );
    return fetchSample(nearestSample.file).then((audioBuffer) => ({
      audioBuffer: audioBuffer,
      distance: getNoteDistance(
        requestedNote,
        requestedOctave,
        nearestSample.note,
        nearestSample.octave
      ),
    }));
  };

  const playSample = (instrument, note, destination, delaySeconds = 0) => {
    getSample(instrument, note).then(({ audioBuffer, distance }) => {
      let playbackRate = Math.pow(2, distance / 12);
      let bufferSource = audioContext.createBufferSource();

      bufferSource.buffer = audioBuffer;
      bufferSource.playbackRate.value = playbackRate;

      bufferSource.connect(destination);
      bufferSource.start(audioContext.currentTime + delaySeconds);
    });
  };

  const renderCanvas = (canvas) => {
    const context = canvas.getContext("2d");
  
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
  
      context.clearRect(0, 0, width, height);
  
      context.strokeStyle = "#888";
      context.lineWidth = 6;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(centerX + 400, centerY);
      context.stroke();
  
      context.lineWidth = 30;
      context.lineCap = "round";
      let radius = 280;
  
      for (let i = 0; i < loops.length; i++) {
        const { duration, delay, note } = loops[i];
        const size = (Math.PI * 2) / duration;
        const offset = playingSince ? audioContext.currentTime - playingSince : 0;
        const startAt = (delay - offset) * size;
        const endAt = (delay + 0.01 - offset) * size;
  
        context.strokeStyle = LANE_COLOR;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();
  
        context.strokeStyle = SOUND_COLOR;
        context.beginPath();
        context.arc(centerX, centerY, radius, startAt, endAt);
        context.stroke();
  
        let angleDegrees = Math.floor(startAt * (180 / Math.PI));
        if (angleDegrees < 0) angleDegrees = 360 + angleDegrees;
  
        radius -= 35;
      }
      if (playingSince) {
        requestAnimationFrame(render);
      } else {
        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.strokeStyle = "rgba(0, 0, 0, 0)";
        context.beginPath();
        context.moveTo(centerX - 90, centerY - 155);
        context.lineTo(centerX + 160, centerY);
        context.lineTo(centerX - 90, centerY + 130);
        context.lineTo(centerX - 90, centerY - 155);
        context.fill();
      }
    };
  
    render();
  };
  

  const startLoop = ({ instrument, note, duration, delay }, nextNode) => {
    playSample(instrument, note, nextNode, delay);
    return setInterval(
      () => playSample(instrument, note, nextNode, delay),
      duration * 1000
    );
  };

  const handlePlay = () => {
    if (!playingSince) {
      convolverRef.current = audioContext.createConvolver();
      fetchSample("Samples/AirportTerminal.wav").then((convolverBuffer) => {
        convolverRef.current.buffer = convolverBuffer;
        convolverRef.current.connect(audioContext.destination);
        setPlayingSince(audioContext.currentTime);
        runningLoopsRef.current = loops.map((loop) =>
          startLoop(loop, convolverRef.current)
        );
        if (canvasRef.current) {
          renderCanvas(canvasRef.current);
        }
      });
    }
  };

  const handleStop = () => {
    if (playingSince) {
      convolverRef.current.disconnect();
      runningLoopsRef.current.forEach((l) => clearInterval(l));
      setPlayingSince(null);
      window.location.reload(); // ページを再読み込み
    }
  };

  return (
    <div className="app-container">
      <Canvas renderCanvas={renderCanvas} ref={canvasRef} />
      <div className="controls">
        <Controls handlePlay={handlePlay} handleStop={handleStop} />
      </div>
      <div className="loops-editor">
        <LoopsEditor loops={loops} onLoopsChange={setLoops} />
      </div>
    </div>
  );
  
};

export default App;
