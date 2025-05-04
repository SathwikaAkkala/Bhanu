// Accessible Voice Mail System for the Blind with Microphone Icon

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function VoiceMailApp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  let mediaRecorder;
  let chunks = [];

  const handleLogin = () => {
    if (email && password) {
      // Simulate login success
      setLoggedIn(true);
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Login successful"));
    }
  };

  const handleSpeechToText = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
    };
  };

  const handleTextToSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleRecord = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioURL(URL.createObjectURL(blob));
      setRecording(false);
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // Record for 5 seconds
  };

  const handleSend = () => {
    if (message || audioURL) {
      const newMessage = {
        id: Date.now(),
        text: message,
        audio: audioURL
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setAudioURL(null);
    }
  };

  if (!loggedIn) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-bold" aria-label="Login form">Login</h2>
            <Input 
              type="email" 
              placeholder="Email" 
              aria-label="Email"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              aria-label="Password"
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Button onClick={handleLogin}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold" aria-label="Voice Mail Interface">Voice Mail System</h2>

      <div className="flex items-center space-x-2">
        <Input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type message or use microphone"
          aria-label="Message input"
        />
        <button 
          onClick={handleSpeechToText} 
          aria-label="Use microphone for speech to text"
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <div className="space-x-2">
        <Button onClick={() => handleTextToSpeech(message)} aria-label="Read message aloud">Text to Speech</Button>
        <Button onClick={handleRecord} aria-label="Record voice message">{recording ? 'Recording...' : 'Record'}</Button>
        <Button onClick={handleSend} aria-label="Send message">Send</Button>
      </div>

      <h3 className="text-lg font-semibold">Messages</h3>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id} className="border p-2 rounded">
            <p>{msg.text}</p>
            {msg.audio && <audio controls src={msg.audio}></audio>}
          </li>
        ))}
      </ul>
    </div>
  );
}