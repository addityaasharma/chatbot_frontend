import React, { useState, useEffect, useRef } from "react";

const PromptPage = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 🔧 Added for mobile menu
  const bottomRef = useRef(null);

  const getPrompts = async () => {
    const response = await fetch("https://wzl6mwg3-5000.inc1.devtunnels.ms/prompts");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  };

  const postPrompt = async (question) => {
    const response = await fetch("https://wzl6mwg3-5000.inc1.devtunnels.ms/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  };

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        const data = await getPrompts();
        if (Array.isArray(data)) {
          const messagesWithIds = data.map((msg, index) => ({
            id: msg.id || index + 1,
            question: msg.question,
            answer: msg.answer
          }));
          setMessages(messagesWithIds);
        }
      } catch (error) {
        console.error("Failed to load initial messages:", error);
      }
    };
    loadInitialMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const newQuestion = { id: Date.now(), question: trimmed, answer: null };
    setMessages(prev => [...prev, newQuestion]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await postPrompt(trimmed);
      const answer = response.answer;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newQuestion.id ? { ...msg, answer } : msg
        )
      );
    } catch (error) {
      console.error("Error getting answer:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newQuestion.id
            ? { ...msg, answer: "❌ Error: Could not get answer. Please check your connection and try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setQuestion(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">

      {/* Mobile toggle */}
      <div className="lg:hidden bg-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">💬 Prompt Bot</h2>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-blue-900 text-white w-full lg:w-64 p-6 flex-shrink-0 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <h2 className="text-2xl font-bold mb-6 hidden lg:block">💬 Prompt Bot</h2>
        <p className="text-sm text-blue-200">Ask anything, get instant answers!</p>
        <div className="mt-8">
          <p className="text-xs text-blue-300">
            {messages.length} conversation{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Start a conversation by asking a question!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.question && (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[85%] md:max-w-md shadow-sm">
                      <p className="whitespace-pre-wrap">{msg.question}</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%] md:max-w-md shadow-sm border">
                    {msg.answer === null ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-gray-500 text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.answer}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-end space-x-3 max-w-full sm:max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 max-h-32 text-sm sm:text-base"
                rows={1}
                placeholder="Type your question here..."
                value={question}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                style={{ minHeight: '50px' }}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !question.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {isLoading && (
            <p className="text-xs text-gray-500 text-center mt-2">Getting your answer...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptPage;
