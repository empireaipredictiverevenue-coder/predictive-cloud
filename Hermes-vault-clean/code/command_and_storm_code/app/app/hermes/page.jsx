'use client';

import { useState, useRef } from 'react';

export default function HermesDashboard() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [response, setResponse] = useState('Hermes is standing by. Give the command.');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support the Web Speech API. Please use Chrome.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
      setResponse('Listening to your voice...');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setListening(false);
      setResponse('Error catching voice. Try typing instead.');
    };

    recognition.onend = () => {
      setListening(false);
      if (transcript) {
        sendCommandToBrain(transcript);
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim() === '') return;
    sendCommandToBrain(textInput);
    setTextInput('');
  };

  const sendCommandToBrain = async (command) => {
    setResponse('Transmitting command to the server...');
    setTimeout(() => {
      setResponse(`Command received: "${command}". Executing build sequence.`);
      setTranscript('');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-2xl border-4 border-[#39ff14] bg-gray-900 p-10 text-center">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Hermes Command</h1>
        <p className="text-[#00ffff] font-bold uppercase tracking-widest text-sm mb-8">Predictive Cloud Terminal</p>
        <div className="min-h-[120px] p-6 bg-black border-2 border-gray-800 rounded-xl mb-10 flex items-center justify-center">
          <p className="text-xl font-bold text-[#39ff14] font-mono leading-relaxed">{transcript || response}</p>
        </div>
        <div className="mb-10 flex justify-center">
          <button onMouseDown={startListening} onMouseUp={stopListening} onTouchStart={startListening} onTouchEnd={stopListening} aria-label={listening ? 'Recording — release to send' : 'Hold to speak'} className={`w-40 h-40 rounded-full font-black text-xl uppercase tracking-tighter transition-all duration-300 border-4 ${listening ? 'bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.8)] scale-95 border-white' : 'bg-[#39ff14] text-black shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:bg-[#00ffff] hover:shadow-[0_0_60px_rgba(0,255,255,0.6)] border-transparent'}`}>
            {listening ? 'RECORDING' : 'HOLD TO SPEAK'}
          </button>
        </div>
        <form onSubmit={handleTextSubmit} className="relative w-full">
          <input type="text" value={textInput} onChange={(e)=>setTextInput(e.target.value)} placeholder="Or type your command here..." className="w-full bg-black text-[#00ffff] text-lg p-5 pr-32 border-2 border-gray-800 focus:border-[#00ffff] outline-none rounded-xl font-bold tracking-wide placeholder-gray-700 transition-colors" />
          <button type="submit" className="absolute right-2 top-2 bottom-2 bg-[#00ffff] hover:bg-[#39ff14] text-black font-black px-6 rounded-lg uppercase tracking-tight transition-colors">Send</button>
        </form>
        <p className="mt-6 text-xs text-gray-700 uppercase tracking-widest">Powered by Empire AI Predictive Cloud</p>
      </div>
    </main>
  );
}
