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
      <div className="flex-1 overflow-y-auto bg-gray-50 p-2 rounded border border-gray-200 mb-2" style={{ minHeight: 0 }}>
        {messages.map((msg, idx) => {
          const isOurs = msg.sender === ourSender;
          return (
            <div
              key={idx}
              className={`flex mb-2 ${isOurs ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line break-words
                  ${isOurs
                    ? "bg-green-200 text-right text-gray-900 rounded-br-none"
                    : "bg-white text-left text-gray-800 border border-gray-200 rounded-bl-none"}
                `}
                style={{
                  borderTopRightRadius: isOurs ? 0 : undefined,
                  borderTopLeftRadius: !isOurs ? 0 : undefined,
                }}
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
          className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring bg-white shadow"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-600 text-sm font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}; 