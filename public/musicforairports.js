'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var SAMPLE_LIBRARY = {
  'Grand Piano': [{ note: 'A', octave: 4, file: 'Samples/Grand Piano/piano-f-a4.wav' }, { note: 'A', octave: 5, file: 'Samples/Grand Piano/piano-f-a5.wav' }, { note: 'A', octave: 6, file: 'Samples/Grand Piano/piano-f-a6.wav' }, { note: 'C', octave: 4, file: 'Samples/Grand Piano/piano-f-c4.wav' }, { note: 'C', octave: 5, file: 'Samples/Grand Piano/piano-f-c5.wav' }, { note: 'C', octave: 6, file: 'Samples/Grand Piano/piano-f-c6.wav' }, { note: 'D#', octave: 4, file: 'Samples/Grand Piano/piano-f-d#4.wav' }, { note: 'D#', octave: 5, file: 'Samples/Grand Piano/piano-f-d#5.wav' }, { note: 'D#', octave: 6, file: 'Samples/Grand Piano/piano-f-d#6.wav' }, { note: 'F#', octave: 4, file: 'Samples/Grand Piano/piano-f-f#4.wav' }, { note: 'F#', octave: 5, file: 'Samples/Grand Piano/piano-f-f#5.wav' }, { note: 'F#', octave: 6, file: 'Samples/Grand Piano/piano-f-f#6.wav' }]
};

var OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var LOOPS = [{ instrument: 'Grand Piano', note: 'F4', duration: 19.7, delay: 4 }, { instrument: 'Grand Piano', note: 'Ab4', duration: 17.8, delay: 8.1 }, { instrument: 'Grand Piano', note: 'C5', duration: 21.3, delay: 5.6 }, { instrument: 'Grand Piano', note: 'Db5', duration: 18.5, delay: 12.6 }, { instrument: 'Grand Piano', note: 'Eb5', duration: 20.0, delay: 9.2 }, { instrument: 'Grand Piano', note: 'F5', duration: 20.0, delay: 14.1 }, { instrument: 'Grand Piano', note: 'Ab5', duration: 17.7, delay: 3.1 }];

var LANE_COLOR = 'rgba(220, 220, 220, 0.3)';
var SOUND_COLOR = '#ED146F';

var audioContext = new AudioContext();
var sampleCache = {};

var canvas = document.getElementById('music-for-airports');
var context = canvas.getContext('2d');
var anglesTableBody = document.getElementById('angles-table').getElementsByTagName('tbody')[0];

// コントロール変数、再生が始まると開始時間に設定されます
var playingSince = null;

function fetchSample(path) {
  sampleCache[path] = sampleCache[path] || fetch(encodeURIComponent(path)).then(function (response) {
    return response.arrayBuffer();
  }).then(function (arrayBuffer) {
    return audioContext.decodeAudioData(arrayBuffer);
  });
  return sampleCache[path];
}

function noteValue(note, octave) {
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  var sortedBank = sampleBank.slice().sort(function (sampleA, sampleB) {
    var distanceToA = Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    var distanceToB = Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  switch (note) {
    case 'Bb':
      return 'A#';
    case 'Db':
      return 'C#';
    case 'Eb':
      return 'D#';
    case 'Gb':
      return 'F#';
    case 'Ab':
      return 'G#';
    default:
      return note;
  }
}

function getSample(instrument, noteAndOctave) {
  var _$exec = /^(\w[b\#]?)(\d)$/.exec(noteAndOctave),
      _$exec2 = _slicedToArray(_$exec, 3),
      requestedNote = _$exec2[1],
      requestedOctave = _$exec2[2];

  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);
  var sampleBank = SAMPLE_LIBRARY[instrument];
  var nearestSample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  return fetchSample(nearestSample.file).then(function (audioBuffer) {
    return {
      audioBuffer: audioBuffer,
      distance: getNoteDistance(requestedNote, requestedOctave, nearestSample.note, nearestSample.octave)
    };
  });
}

function playSample(instrument, note, destination) {
  var delaySeconds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  getSample(instrument, note).then(function (_ref) {
    var audioBuffer = _ref.audioBuffer,
        distance = _ref.distance;

    var playbackRate = Math.pow(2, distance / 12);
    var bufferSource = audioContext.createBufferSource();

    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;

    bufferSource.connect(destination);
    bufferSource.start(audioContext.currentTime + delaySeconds);
  });
}

function render() {
  context.clearRect(0, 0, 1000, 1000);

  context.strokeStyle = '#888';
  context.lineWidth = 1;
  context.moveTo(325, 325);
  context.lineTo(650, 325);
  context.stroke();

  context.lineWidth = 30;
  context.lineCap = 'round';
  var radius = 280;
  anglesTableBody.innerHTML = ''; // テーブルの内容をクリア
  for (var i = 0; i < LOOPS.length; i++) {
    var _LOOPS$i = LOOPS[i],
        duration = _LOOPS$i.duration,
        delay = _LOOPS$i.delay,
        note = _LOOPS$i.note;

    var size = Math.PI * 2 / duration;
    var offset = playingSince ? audioContext.currentTime - playingSince : 0;
    var startAt = (delay - offset) * size;
    var endAt = (delay + 0.01 - offset) * size;

    context.strokeStyle = LANE_COLOR;
    context.beginPath();
    context.arc(325, 325, radius, 0, 2 * Math.PI);
    context.stroke();

    context.strokeStyle = SOUND_COLOR;
    context.beginPath();
    context.arc(325, 325, radius, startAt, endAt);
    context.stroke();

    // 角度を0から360度の範囲で整数の度数法に変換してテーブルに追加
    var angleDegrees = Math.floor(startAt * (180 / Math.PI));
    if (angleDegrees < 0) angleDegrees = 360 + angleDegrees;

    // 最初のループの角度は入力フィールドから取得
    if (i === 0) {
      var angleInput = document.getElementById('angle-f4');
      if (angleInput) {
        angleDegrees = parseInt(angleInput.value, 10);
      }
    }

    var row = anglesTableBody.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.textContent = i + 1;
    cell2.textContent = note; // なる音の音階を表示
    cell3.textContent = angleDegrees;
    cell3.style.textAlign = "right"; // 右揃えに設定
    radius -= 35;
  }
  if (playingSince) {
    requestAnimationFrame(render);
  } else {
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.strokeStyle = 'rgba(0, 0, 0, 0)';
    context.beginPath();
    context.moveTo(235, 170);
    context.lineTo(485, 325);
    context.lineTo(235, 455);
    context.lineTo(235, 170);
    context.fill();
  }
}

function startLoop(_ref2, nextNode) {
  var instrument = _ref2.instrument,
      note = _ref2.note,
      duration = _ref2.duration,
      delay = _ref2.delay;

  playSample(instrument, note, nextNode, delay);
  return setInterval(function () {
    return playSample(instrument, note, nextNode, delay);
  }, duration * 1000);
}

fetchSample('Samples/AirportTerminal.wav').then(function (convolverBuffer) {

  var convolver = void 0,
      runningLoops = void 0;

  document.getElementById('play-button').addEventListener('click', function () {
    if (!playingSince) {
      convolver = audioContext.createConvolver();
      convolver.buffer = convolverBuffer;
      convolver.connect(audioContext.destination);
      playingSince = audioContext.currentTime;
      runningLoops = LOOPS.map(function (loop) {
        return startLoop(loop, convolver);
      });
      render();
    }
  });

  document.getElementById('stop-button').addEventListener('click', function () {
    if (playingSince) {
      convolver.disconnect();
      runningLoops.forEach(function (l) {
        return clearInterval(l);
      });
      playingSince = null;
      render();
    }
  });

  render();
});