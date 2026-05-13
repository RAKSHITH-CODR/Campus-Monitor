import { useState, useEffect } from 'react';
import { roomsAPI, api } from '../services/api';
import { useStore } from '../store/useStore';
import { Sparkles, Loader, AlertCircle, Send } from 'lucide-react';

function AIAnalysisPage() {
  const { setError } = useStore();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setLocalError] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your Campus Monitor AI Assistant. Ask me anything about your campus conditions.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomsAPI.getAll();
      const roomsList = data.rooms || [];
      setRooms(roomsList);
      if (roomsList.length > 0) {
        setSelectedRoom(roomsList[0]._id);
      }
    } catch (error) {
      setLocalError('Failed to load rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoom = async () => {
    if (!selectedRoom) {
      setLocalError('Please select a room');
      return;
    }

    try {
      setAnalysisLoading(true);
      setLocalError('');
      setAnalysis(null);

      const response = await api.post('/api/ai/analyze', { room: selectedRoom });
      setAnalysis(response.analysis);

      // Add to chat
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: `Analysis for ${rooms.find(r => r._id === selectedRoom)?.name}:\n\n${response.analysis.reasoning}\n\nSeverity: ${response.analysis.severity}\nRecommendation: ${response.analysis.recommendation}`
      }]);
    } catch (error) {
      setLocalError(error.error || 'Failed to analyze room');
      console.error(error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      setChatLoading(true);
      
      // Add user message
      setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
      setChatInput('');

      // Simulate AI response (In production, you'd call a chatbot API)
      const userMessage = chatInput.toLowerCase();
      let botResponse = '';

      if (userMessage.includes('temperature')) {
        botResponse = 'Temperature monitoring helps maintain optimal campus comfort. Current readings show variations across different rooms. Would you like me to analyze a specific room?';
      } else if (userMessage.includes('alert')) {
        botResponse = 'Alerts are triggered when sensor readings exceed safe thresholds. Red alerts indicate critical conditions requiring immediate attention.';
      } else if (userMessage.includes('energy')) {
        botResponse = 'Energy usage tracking helps optimize campus operations and reduce costs. Peak usage typically occurs during business hours.';
      } else if (userMessage.includes('help')) {
        botResponse = 'I can help you with:\n- Analyzing room conditions\n- Understanding sensor data\n- Explaining alerts and warnings\n- Energy optimization tips\n\nWhat would you like to know?';
      } else {
        botResponse = 'I understand your question. For detailed analysis, please select a room and let me analyze its current conditions. Is there anything specific about campus monitoring you\'d like to know?';
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
        setChatLoading(false);
      }, 500);
    } catch (error) {
      setLocalError('Failed to process chat message');
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p>Loading AI analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold">AI Analysis & Chatbot</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Get AI-powered insights about your campus conditions</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Selector */}
          <div className="card">
            <label className="block text-sm font-medium mb-3">Select Room for Analysis</label>
            <div className="flex gap-3">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={analysisLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a room...</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <button
                onClick={analyzeRoom}
                disabled={analysisLoading || !selectedRoom}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analysisLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="card space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Analysis Results
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reasoning</p>
                  <p className="mt-1 text-sm leading-relaxed">{analysis.reasoning}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Severity Level</p>
                    <p className={`text-lg font-semibold ${
                      analysis.severity === 'CRITICAL' ? 'text-red-600' :
                      analysis.severity === 'HIGH' ? 'text-orange-600' :
                      analysis.severity === 'MEDIUM' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {analysis.severity}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <p className="text-lg font-semibold text-blue-600">Active</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recommendation</p>
                  <p className="text-sm leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                    {analysis.recommendation}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Action Taken</p>
                  <p className="text-sm leading-relaxed bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                    {analysis.actionTaken}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chatbot Panel */}
        <div className="card h-[600px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Assistant
          </h3>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50 dark:bg-gray-900/30 p-4 rounded">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              disabled={chatLoading}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysisPage;
