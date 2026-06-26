import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiSparkles, HiChatAlt2, HiLightBulb, HiShieldCheck } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

const SUGGESTED_QUESTIONS = [
  "Which engineering colleges have the best CSE placements in India?",
  "What are the most booming careers in AI and technology for the next 5 years?",
  "What average package can I expect after completing a BBA or Commerce degree?",
  "Which colleges offer top packages for creative design and fine arts in India?",
  "What are the career growth rates and required skills for a Data Scientist?"
];

function SmartSearch() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const token = useAuthStore((state) => state.accessToken || state.access_token);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    const userMsg = { role: 'user', content: q };
    setChatHistory(prev => [...prev, userMsg]);
    setQuery('');

    try {
      const response = await fetch(`${baseUrl}/advisor/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        throw new Error('Could not get response from AI Advisor. Please try again.');
      }

      const data = await response.json();
      const assistantMsg = { role: 'assistant', content: data.response };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.message);
      // Remove the last query from display if it failed
      setChatHistory(prev => prev.slice(0, -1));
      setQuery(q); // restore query
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16" id="smart-search-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-300 border border-primary-500/20 mb-4">
            <HiSparkles className="animate-pulse" /> Introducing DestinAI — Your Smart AI Advisor
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white sm:text-5xl">
            Ask <span className="gradient-text">DestinAI</span>
          </h1>
          <p className="mt-3 text-lg text-surface-400 max-w-2xl mx-auto">
            Ask any question about booming careers, top Indian colleges, placements, packages, eligibility, or skills.
          </p>
        </motion.div>

        {/* Warning Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3 max-w-2xl mx-auto text-xs text-yellow-300/80 items-start"
        >
          <HiShieldCheck size={20} className="flex-shrink-0 text-yellow-400 mt-0.5" />
          <div>
            <span className="font-semibold text-yellow-300">Strictly Educational Scope:</span> DestinAI is optimized solely for career planning, college admissions, streams, and company queries. Unrelated off-topic requests will be politely declined.
          </div>
        </motion.div>

        {/* Chat / Results Window */}
        <div className="glass-card p-6 mb-6 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-6 overflow-y-auto max-h-[50vh] pr-2">
            {chatHistory.length === 0 ? (
              <div className="text-center py-16 text-surface-500">
                <HiChatAlt2 size={48} className="mx-auto mb-4 text-surface-600" />
                <p className="text-white font-medium mb-1">No active queries yet.</p>
                <p className="text-sm">Type a question in the search bar or select a suggested topic below to begin.</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600/20 text-primary-200 border border-primary-500/30'
                        : 'bg-white/5 text-surface-200 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 font-bold text-xs uppercase tracking-wider">
                      {msg.role === 'user' ? (
                        <>👤 You</>
                      ) : (
                        <span className="text-primary-400 flex items-center gap-1">✨ DestinAI AI</span>
                      )}
                    </div>
                    <p className="whitespace-pre-line font-sans">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-[80%] flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary-600/30 border-t-primary-400 rounded-full animate-spin"></div>
                  <span className="text-xs text-surface-400">DestinAI is analyzing placement stats and career details...</span>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>

          {chatHistory.length > 0 && (
            <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
              <button
                onClick={clearChat}
                className="text-xs text-surface-500 hover:text-white transition-colors"
              >
                Clear Conversation History
              </button>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-xs text-surface-400 font-semibold mb-3 flex items-center gap-1.5">
              <HiLightBulb className="text-yellow-400" /> SUGGESTED TOPICS:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(q)}
                  className="text-xs text-left bg-white/5 hover:bg-white/10 text-surface-300 hover:text-white border border-white/10 hover:border-white/20 p-3 rounded-xl transition-all max-w-full duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ask DestinAI (e.g. which careers are booming, what colleges offer scholarships...)"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500/50 transition-all font-sans"
              disabled={loading}
              id="advisor-search-input"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500">
              <HiSearch size={20} />
            </div>
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
              loading || !query.trim()
                ? 'bg-white/5 text-surface-600 cursor-not-allowed border border-white/5'
                : 'text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
            style={{
              background: loading || !query.trim() ? '' : 'linear-gradient(90deg, #6366f1, #d946ef)'
            }}
            id="advisor-search-submit"
          >
            Ask AI
          </button>
        </div>

      </div>
    </div>
  );
}

export default SmartSearch;
