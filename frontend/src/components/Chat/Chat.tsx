import React, { useState, useRef, useEffect } from "react";

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
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-2 rounded mb-2" style={{ minHeight: 0 }}>
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
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          className="input flex-1"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="btn text-sm font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}; 