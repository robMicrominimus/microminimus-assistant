"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState(["Hello! How can I assist you today?"]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleVoiceToggle = () => setVoiceInput((prev) => !prev);
  const handleSpeakToggle = () => setVoiceOutput((prev) => !prev);

  const handleMicClick = () => {
    if (!isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current.stop();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `You: ${input}`]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let aiResponse = "Assistant: ";

    setMessages((prev) => [...prev, aiResponse]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      aiResponse += chunk;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = aiResponse;
        return newMessages;
      });
      if (voiceOutput) speak(chunk);
    }
  };

  const speak = (text) => {
    if (!synthRef.current) return;
    const utter = new SpeechSynthesisUtterance(text);
    synthRef.current.speak(utter);
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🛍️ Microminimus Sales Assistant</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          🎙️ Voice Input
          <input type="checkbox" checked={voiceInput} onChange={handleVoiceToggle} />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          🔊 Voice Output
          <input type="checkbox" checked={voiceOutput} onChange={handleSpeakToggle} />
        </label>
      </div>
      {voiceInput && (
        <button onClick={handleMicClick}>
          {isListening ? "🛑 Stop Listening" : "🎤 Start Talking"}
        </button>
      )}
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "60%", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button onClick={handleSend} style={{ marginLeft: "1rem" }}>Send</button>
      </div>
      <div style={{ marginTop: "2rem" }}>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
    </main>
  );
}
