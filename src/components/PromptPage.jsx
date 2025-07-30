import React, { useState } from "react";
import axios from "axios";

const PromptPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const res = await axios.post('https://chatbot-o458.onrender.com/openrouter', {
        question: question
      });
      setAnswer(res.data.answer);
    } catch (err) {
      console.error(err);
      setAnswer('❌ ' + (err.response?.data?.error || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-3xl font-semibold text-center text-gray-800">
          🤖 Aditya's Prompt Tool
        </h1>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none transition"
          placeholder="Type your question here..."
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
          onClick={askQuestion}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>

        {answer && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-mono text-gray-800 whitespace-pre-wrap">
            <strong className="block text-gray-500 mb-1">Answer:</strong>
            {answer}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPage;
