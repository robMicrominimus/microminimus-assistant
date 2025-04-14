import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState(["Hello! How can I assist you today?"]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
  }, []);

  const handleVoiceToggle = () => {
    setVoiceInput((prev) => !prev);
  };

  const handleSpeakToggle = () => {
    setVoiceOutput((prev) => !prev);
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `You: ${input}`]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullResponse = "Assistant: ";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullResponse += chunk;
      setMessages((prev) => [...prev.slice(0, -1), fullResponse]);
    }

    if (voiceOutput) {
      const utter = new SpeechSynthesisUtterance(fullResponse.replace('Assistant: ', ''));
      synthRef.current?.speak(utter);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🛍️ Microminimus Sales Assistant</h1>
      <p>Welcome! Your AI assistant is online and ready to help.</p>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Voice Input: 
          <input type="checkbox" checked={voiceInput} onChange={handleVoiceToggle} />
        </label>
        <br />
        <label>
          Voice Output:
          <input type="checkbox" checked={voiceOutput} onChange={handleSpeakToggle} />
        </label>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '5px', minHeight: '150px', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {voiceInput && (
          <button onClick={handleMicClick}>{isListening ? '🎤 Stop' : '🎙️ Talk'}</button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Text"
          style={{ flexGrow: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </main>
  );
}
