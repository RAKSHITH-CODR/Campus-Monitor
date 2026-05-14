import { useState, useEffect, useRef } from 'react';
import { roomsAPI, api } from '../services/api';
import { useStore } from '../store/useStore';
import {
  Sparkles, Loader, AlertCircle, Send, Zap, Brain,
  MessageSquare, CheckCircle, TrendingUp, Shield,
  Thermometer, Wind, Zap as EnergyIcon, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME_COLORS } from '../config/theme';

function AIAnalysisPage() {
  const { theme } = useStore();
  const isDark = theme === 'dark';

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm your Campus Monitor AI. I can analyze real-time sensor data from any room and provide actionable insights. Select a room above to begin.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Reset analysis when room changes
  useEffect(() => {
    setAnalysis(null);
  }, [selectedRoomId]);

  async function loadRooms() {
    try {
      setLoading(true);
      const response = await roomsAPI.getAll(1, 100); // Fetch up to 100 rooms
      // Handle both paginated and unpaginated responses
      const roomsList = response.data || response.rooms || [];
      setRooms(roomsList);
      if (roomsList.length > 0) {
        setSelectedRoomId(roomsList[0]._id);
      }
    } catch (error) {
      setLocalError('Failed to load rooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoom = async () => {
    if (!selectedRoomId) {
      setLocalError('Please select a room');
      return;
    }
    try {
      setAnalysisLoading(true);
      setLocalError('');
      setAnalysis(null);

      const response = await api.post('/api/ai/analyze', { room: selectedRoomId });
      setAnalysis(response.analysis);

      const selectedRoom = rooms.find(r => r._id === selectedRoomId);
      const roomName = selectedRoom?.name || 'Room';
      
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: `📊 **Analysis Complete for ${roomName}**\n\n${response.analysis.reasoning}\n\n🎯 **Severity:** ${response.analysis.severity}\n💡 **Recommendation:** ${response.analysis.recommendation}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setLocalError(error.error || 'Failed to analyze room. Is there enough sensor data?');
      console.error(error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, {
      type: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');

    try {
      setChatLoading(true);
      const lower = userText.toLowerCase();
      let botResponse = '';

      if (lower.includes('temperature') || lower.includes('temp')) {
        botResponse = '🌡️ Temperature anomalies are often caused by HVAC failures or high occupancy. If you see a critical alert, verify the room thermostat settings immediately.';
      } else if (lower.includes('alert')) {
        botResponse = '🚨 Alerts are triggered when metrics breach safety thresholds. The AI engine cross-references multiple sensors to reduce false positives.';
      } else if (lower.includes('energy') || lower.includes('power')) {
        botResponse = '⚡ High energy usage outside business hours indicates zombie loads. Check if lighting and lab equipment in the affected room have auto-shutoff enabled.';
      } else if (lower.includes('air') || lower.includes('aqi')) {
        botResponse = '💨 Poor air quality (high AQI) directly impacts focus and health. The system will automatically recommend increasing ventilation rates when AQI drops below acceptable levels.';
      } else {
        botResponse = '🤔 I process live campus telemetry. Try selecting a room and clicking "Analyze Room" to get a deep dive into its current environmental health. I can also answer general questions about building management!';
      }

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setChatLoading(false);
      }, 800);
    } catch {
      setLocalError('Failed to process chat message');
      setChatLoading(false);
    }
  };

  const severityConfig = {
    CRITICAL: { text: 'text-red-600 dark:text-red-500', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700', icon: '🔴' },
    HIGH:     { text: 'text-orange-600 dark:text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700', icon: '🟠' },
    MEDIUM:   { text: 'text-yellow-600 dark:text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700', icon: '🟡' },
    LOW:      { text: 'text-green-600 dark:text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700', icon: '🟢' },
    NORMAL:   { text: 'text-green-600 dark:text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700', icon: '✅' },
  };

  const selectedRoomData = rooms.find(r => r._id === selectedRoomId);

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Initializing AI Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section max-w-7xl mx-auto">
      {/* ── Header ── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`p-6 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20 shadow-inner' : 'bg-white shadow-sm'}`}>
              <Brain className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold font-heading tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Telemetry Analysis
              </h1>
              <p className={`text-sm mt-1 font-medium ${isDark ? 'text-purple-200/70' : 'text-purple-800/70'}`}>
                Deep insights powered by Groq &amp; Mixtral 8x7B
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`p-4 rounded-2xl flex gap-3 border items-center ${
              isDark ? 'bg-red-900/20 border-red-800/50 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{localError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT COLUMN: Room Selection & Metrics ── */}
        <motion.div
          className="lg:col-span-7 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Room Selector Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'
              : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Target Environment
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  disabled={analysisLoading}
                  className={`w-full px-5 py-4 appearance-none border rounded-2xl font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                    isDark
                      ? 'border-slate-600 bg-slate-900/50 text-white hover:border-purple-500/50'
                      : 'border-gray-300 bg-gray-50 text-gray-900 hover:border-purple-400'
                  }`}
                >
                  {rooms.length === 0 && <option value="">No rooms available</option>}
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.name} {room.type ? `(${room.type})` : ''}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              
              <motion.button
                onClick={analyzeRoom}
                disabled={analysisLoading || !selectedRoomId || !selectedRoomData?.latestSensor}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all
                           bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                           text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {analysisLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Analyzing</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Run Diagnostics</>
                )}
              </motion.button>
            </div>

            {/* Live Metrics Preview (if available) */}
            {selectedRoomData && (
              <div className="mt-8">
                <h3 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Live Telemetry Snapshot
                </h3>
                {selectedRoomData.latestSensor ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50/50 border-blue-100'}`}>
                      <Thermometer className="w-5 h-5 text-blue-500 mb-2" />
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoomData.latestSensor.temperature}°C</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Temperature</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-emerald-50/50 border-emerald-100'}`}>
                      <Wind className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoomData.latestSensor.airQuality}</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AQI Level</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-amber-50/50 border-amber-100'}`}>
                      <EnergyIcon className="w-5 h-5 text-amber-500 mb-2" />
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoomData.latestSensor.energyUsage}W</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Energy Load</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-purple-50/50 border-purple-100'}`}>
                      <Activity className="w-5 h-5 text-purple-500 mb-2" />
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedRoomData.latestSensor.motion ? 'Yes' : 'No'}</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Motion</p>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl text-center border border-dashed ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'}`}>
                    No recent sensor data available for this room.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis Results Display */}
          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key="results"
                className={`rounded-3xl border overflow-hidden ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'
                    : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={`px-6 py-5 border-b flex items-center justify-between ${
                  isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Diagnostics Report
                    </h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${severityConfig[analysis.severity]?.bg} ${severityConfig[analysis.severity]?.text}`}>
                    {analysis.severity} PRIORITY
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Reasoning block */}
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-full" />
                    <div className={`pl-6 py-1`}>
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        AI Reasoning
                      </p>
                      <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {analysis.reasoning}
                      </p>
                    </div>
                  </div>

                  <hr className={`border ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`} />

                  {/* Recommendation block */}
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-full" />
                    <div className={`pl-6 py-1`}>
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Recommended Action
                      </p>
                      <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {analysis.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Automated Action taken */}
                  {analysis.actionTaken && (
                    <div className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                      isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          System Action Triggered
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {analysis.actionTaken}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!analysis && !analysisLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-3xl border border-dashed flex flex-col items-center justify-center py-24 gap-5 ${
                  isDark
                    ? 'bg-slate-800/20 border-slate-700'
                    : 'bg-gray-50/50 border-gray-300'
                }`}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className={`p-5 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-white shadow-md'}`}
                >
                  <Brain className={`w-12 h-12 ${isDark ? 'text-purple-500' : 'text-purple-400'}`} />
                </motion.div>
                <div className="text-center max-w-sm px-4">
                  <p className={`font-bold text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Awaiting Telemetry
                  </p>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Select an environment above and trigger diagnostics to generate a real-time AI condition report.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── RIGHT COLUMN: Conversational AI ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className={`rounded-3xl border flex flex-col h-[740px] overflow-hidden sticky top-8 transition-all duration-300 ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'
              : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
          }`}>
            {/* Chat Header */}
            <div className={`px-6 py-5 flex items-center justify-between border-b ${
              isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                  <MessageSquare className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Facility Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Systems Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className={`flex-1 overflow-y-auto p-5 space-y-6 ${isDark ? 'bg-slate-900/20' : 'bg-white'}`}>
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'bot' && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm ${
                      isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                    }`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="max-w-[85%] flex flex-col">
                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                        : isDark
                          ? 'bg-slate-700/80 text-gray-100 rounded-2xl rounded-tl-sm border border-slate-600'
                          : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200'
                    }`}>
                      {/* Very basic markdown rendering for bold text in chat */}
                      {msg.text.split('\n').map((line, i) => (
                        <span key={i} className="block min-h-[1.2rem]">
                          {line.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                        </span>
                      ))}
                    </div>
                    <span className={`text-[11px] mt-1.5 font-medium ${
                      msg.type === 'user' ? 'text-right pr-1' : 'pl-1'
                    } ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transformOrigin: 'left bottom' }}
                    className="flex items-start"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 shadow-sm ${
                      isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                    }`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className={`px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 ${
                      isDark ? 'bg-slate-700/80 border border-slate-600' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <motion.div className="w-2 h-2 rounded-full bg-indigo-500" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-purple-500" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-pink-500" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} className="h-1" />
            </div>

            {/* Chat Input Area */}
            <div className={`p-5 border-t ${isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-white'}`}>
              <div className={`flex gap-3 rounded-2xl border p-1.5 transition-all focus-within:ring-4 ${
                isDark 
                  ? 'bg-slate-900/50 border-slate-600 focus-within:border-indigo-500 focus-within:ring-indigo-500/20' 
                  : 'bg-gray-50 border-gray-300 focus-within:border-indigo-400 focus-within:ring-indigo-500/20'
              }`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  disabled={chatLoading}
                  placeholder="Ask the facility assistant..."
                  className={`flex-1 px-4 py-2.5 text-[15px] bg-transparent outline-none font-medium ${
                    isDark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
                <motion.button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5 ml-1" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AIAnalysisPage;
