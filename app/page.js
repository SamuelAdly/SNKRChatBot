"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Moon, Sun } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState(null);
  const [isAIOnline, setIsAIOnline] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };


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
            role: msg.role === "bot" ? "model" : "user",
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
      setIsAIOnline(true);
      setError(null);
    } catch (error) {
      setError("Failed to send message. Please try again.");
      setIsAIOnline(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const themeColors = darkMode
    ? {
        primary: "bg-gray-900",
        secondary: "bg-gray-800",
        accent: "bg-red-700",
        text: "text-gray-100",
      }
    : {
        primary: "bg-gray-100",
        secondary: "bg-white",
        accent: "bg-red-600",
        text: "text-gray-900",
      };

  const { primary, secondary, accent, text } = themeColors;

  return (
    <div className={`flex flex-col h-screen p-8 ${primary} transition-colors duration-300`}>
      <div className="flex flex-col justify-center items-center mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <img
              src="/icon1.png"
              alt="SNKRS Logo"
              className="h-12 w-12 rounded-lg outline-none outline-white"
            />
            <div className="ml-3">
              <h1 className={`text-2xl font-extrabold ${text}`}>
                Customer Support Bot
              </h1>
              <p
                className={`${
                  isAIOnline ? "text-green-500" : "text-red-500"
                }`}
              >
                {isAIOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${secondary} ${text} hover:${accent} transition-colors duration-300`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto ${secondary} rounded-md p-4 scrollbar-thin transition-colors duration-300`}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-6 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-3 rounded-lg ${
                msg.role === "user"
                  ? `${accent} text-white`
                  : `${primary} ${text}`
              } transition-colors duration-300`}
            >
               <ReactMarkdown>{msg.text}</ReactMarkdown>
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
          className={`${text} ${secondary} flex-1 p-4 rounded-l-md border-t border-b border-l border-r focus:outline-none focus:border-${accent} transition-colors duration-300`}
        />
        <button
          onClick={handleSendMessage}
          className={`p-4 ${accent} text-white border-t border-b border-l border-r rounded-r-md hover:bg-opacity-80 focus:outline-none transition-colors duration-300`}
        >
          Send
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p className={`${text} text-sm mt-2`}>Inspired By <a href="https://www.nike.com/launch" className="underline">Nike</a> Created By Members</p>
      </div>
    </div>
  );
}
