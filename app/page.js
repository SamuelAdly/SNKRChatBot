"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");
  
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          history: messages.map((msg) => ({
            text: msg.text,
            role: msg.role === "bot" ? "model" : "user", // Map "bot" to "model"
          })),
        }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
  
      const result = await response.json();
      const botMessage = {
        text: result.text,
        role: "bot",
        timestamp: new Date(),
      };
  
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      setError("Failed to send message. Please try again.");
    }
  };
  

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const themeColors = {
    primary: "bg-gray-900",
    secondary: "bg-gray-800",
    accent: "bg-red-500",
    text: "text-gray-100",
  };

  const { primary, secondary, accent, text } = themeColors;

  return (
    <div className={`flex flex-col h-screen p-8 ${primary}`}>
      <div className="flex justify-center items-center mb-8">
        <h1 className={`text-2xl font-bold ${text}`}>SKNR ChatBot</h1>
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-4`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-6 ${msg.role === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block p-3 rounded-lg ${
                msg.role === "user" ? `${accent} text-white` : `${primary} ${text}`
              }`}
            >
              {msg.text}
            </span>
            <p className={`text-xs ${text} mt-2`}>
              {msg.role === "bot" ? "Bot" : "You"} -{" "}
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="flex items-center mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 p-4 rounded-l-md border-t border-b border-l focus:outline-none focus:border-${accent}`}
        />
        <button
          onClick={handleSendMessage}
          className={`p-4 ${accent} text-white rounded-r-md hover:bg-opacity-80 focus:outline-none`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
