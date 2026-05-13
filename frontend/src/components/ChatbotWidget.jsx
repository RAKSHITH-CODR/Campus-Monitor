import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: '👋 Hi! I\'m Campus Monitor Bot. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample responses for common queries
  const getBotResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('temperature') || lowerQuery.includes('temp')) {
      return 'The average campus temperature is currently 26.5°C. All rooms are within optimal range.';
    }
    if (lowerQuery.includes('energy') || lowerQuery.includes('power')) {
      return 'Current average energy usage is 287W per room. This is within normal parameters for peak hours.';
    }
    if (lowerQuery.includes('alert') || lowerQuery.includes('problem')) {
      return 'We currently have 6 active alerts requiring attention. Most are air quality related. Check the Alerts page for details.';
    }
    if (lowerQuery.includes('room') || lowerQuery.includes('rooms')) {
      return 'All 8 campus rooms are currently operational and being monitored. Lab 1, Lab 2, Class A, Class B, Office 101, 102, Library, and Cafeteria.';
    }
    if (lowerQuery.includes('hi') || lowerQuery.includes('hello') || lowerQuery.includes('hey')) {
      return 'Hello! 👋 I can help you with campus monitoring info. Ask me about temperature, energy, alerts, or room status!';
    }
    if (lowerQuery.includes('how') || lowerQuery.includes('help')) {
      return 'I can help you with: 📊 Temperature info • ⚡ Energy usage • 🚨 Active alerts • 🏫 Room status • 📈 Analytics overview';
    }
    return 'I\'m here to help! Try asking about temperature, energy usage, alerts, or room status.';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get bot response
    const botResponse = getBotResponse(inputValue);
    setMessages(prev => [...prev, { 
      id: Date.now() + 1, 
      type: 'bot', 
      text: botResponse 
    }]);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg hover:shadow-xl flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 text-white">
              <h3 className="font-bold text-lg">Campus Monitor Bot</h3>
              <p className="text-xs text-blue-100">Always here to help 🤖</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-slate-800 border-t border-slate-700 p-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg p-2 transition-colors"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
