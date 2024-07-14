import React, { useState, useRef, useEffect } from 'react';
import './normal.css';
import './App.css';

function App() {
  const initialChatLog = [{
    user: "gpt",
    message: "ArdsGPT is online!"
  }];

  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState(initialChatLog);
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [isInputEmpty, setIsInputEmpty] = useState(true); // State to track input emptiness
  const chatLogContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false); // State to track the visibility of the scroll button

  // Function to clear chats without removing the initial message
  function clearChat() {
    setChatLog(initialChatLog);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Check if input is empty or contains only whitespace
    const newInput = input; // Store the input value before clearing it
    setInput(""); // Clear the input immediately
    setIsLoading(true); // Set loading state to true
  
    // Add the user's input to the chat log
    setChatLog(prevChatLog => [...prevChatLog, { user: "me", message: newInput }]);
  
    try {
      // Fetch the response from Gemini
      const response = await fetch("http://localhost:3010/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: newInput // Send the stored input value to Gemini
        })
      });
  
      // Parse the response as JSON
      const data = await response.json();
  
      // Check if the response contains the 'answer' property
      if (!data.answer) {
        throw new Error("Empty or undefined response from Gemini.");
      }
  
      // Update the chat log with Gemini's response while keeping the user's input intact
      setChatLog(prevChatLog => [...prevChatLog, { user: "gpt", message: data.answer }]);
    } catch (error) {
      console.error(error);
      // Add an error message to the chat log if there's an issue with the response
      setChatLog(prevChatLog => [...prevChatLog, { user: "gpt", message: 'Sorry - Something went wrong. Please try again!' }]);
    } finally {
      setIsLoading(false); // Set loading state back to false
    }
  };

  useEffect(() => {
    const chatLogContainer = chatLogContainerRef.current;

    const handleScroll = () => {
      if (chatLogContainer.scrollTop > 100) { // Change '100' to the scroll distance you want
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    // Add the scroll event listener
    if (chatLogContainer) {
      chatLogContainer.addEventListener('scroll', handleScroll);
    }

    // Clean up the event listener on component unmount
    return () => {
      if (chatLogContainer) {
        chatLogContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const chatLogContainer = chatLogContainerRef.current;
    if (chatLogContainer) {
      // Scroll to the bottom of the chat log
      chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
    }
  }, [chatLog]);

  // Update input emptiness state
  useEffect(() => {
    setIsInputEmpty(input.trim() === "");
  }, [input]);

  // Function to scroll to the top
  const scrollToTop = () => {
    if (chatLogContainerRef.current) {
      chatLogContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setShowScrollButton(false); // Hide the button immediately after clicking
    }
  };

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="side-menu-button" onClick={clearChat}>
          <span>+</span>
          New Chat
        </div>
      </aside>
      <section className="chatbox">
        {showScrollButton && (
          <button className="scroll-to-top" onClick={scrollToTop}>
            ↑
          </button>
        )}
        <div className="chat-log-container" ref={chatLogContainerRef}>
          <div className={`chat-log ${chatLog.length > 0 ? 'reverse' : ''}`}>
            {chatLog.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        </div>

        <div className="chat-input-holder">
          <form onSubmit={handleSubmit} className="input-group">
            <input
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
            />
            <button type="submit" className="chat-send-button" disabled={isLoading || isInputEmpty}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  const isGPTMessage = message.user === "gpt";

  return (
    <div className={`chat-message ${isGPTMessage ? "chatgpt" : ""}`}>
      <div className="chat-message-center">
        {isGPTMessage && (
          <div className={`avatar ${isGPTMessage ? "chatgpt" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width={41} height={41} fill="none" strokeWidth={1.5} className="h-6 w-6">
              <path fill="currentColor" d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813ZM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496ZM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744ZM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237Zm27.658 6.437-9.724-5.615 3.367-1.943a.121.121 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.65-1.132Zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763Zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225Zm1.829-3.943 4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5V18Z" />
            </svg>
          </div>
        )}
        <div className="message">
            {message.message.split('\n').map((line, index) => {
            // Check if the line starts with "**" indicating a bold section
            if (line.startsWith("**")) {
              return <strong key={index}>{line.substring(2)}</strong>; // Apply bold formatting
            }
            // Check if the line starts with "* " indicating a bullet point
            else if (line.startsWith("* ")) {
              return <li key={index}>{line.substring(2)}</li>; // Apply bullet point formatting
            }
            // Otherwise, render the line as a paragraph
            else {
              return <p key={index}>{line}</p>;
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
