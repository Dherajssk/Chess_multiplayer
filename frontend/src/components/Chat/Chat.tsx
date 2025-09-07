import React, { useState, useRef, useEffect } from "react";

// SVG for send icon
const SendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  color: "w" | "b";
}

export const Chat: React.FC<ChatProps> = ({ messages, onSend, color }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "") {
      onSend(input);
      setInput("");
    }
  };

  // Determine our sender string
  const ourSender = color === "w" ? "white" : "black";

  return (
    <div className="flex flex-col h-full w-full max-w-full">
      <div className="flex-1 overflow-y-auto p-2 rounded mb-2 max-h-[40vh] sm:max-h-[60vh]" style={{ minHeight: 0 }}>
        {messages.map((msg, idx) => {
          const isOurs = msg.sender === ourSender;
          return (
            <div
              key={idx}
              className={`flex mb-2 ${isOurs ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`chat-bubble ${isOurs ? "ours" : ""}`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="w-full mt-2">
        <div className="relative flex w-full items-center">
          <input
            className="input flex-1 min-w-0 text-base px-4 py-3 pr-12 rounded-full shadow focus:ring-2 focus:ring-green-400"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ background: '#232526', color: '#fff', border: '1px solid #38f9d7', fontSize: '1.1em' }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-400 to-cyan-400 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:from-cyan-400 hover:to-green-400 transition-all"
            style={{ padding: 0, minWidth: 40, minHeight: 40 }}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}; 