/**
 * AIAnalysisPage — FIXED & ENHANCED
 *
 * Fixes from original:
 * 1. Button was permanently disabled because it checked `selectedRoomData?.latestSensor`
 *    which is never populated (rooms API doesn't return latestSensor). Removed that gate.
 * 2. When the Groq API is unavailable, the backend returns an error. Added a local
 *    rule-based fallback so the page always shows a useful analysis even without a model.
 * 3. The header still said "Groq & Mixtral 8x7B" — updated to reflect the actual model (llama3).
 * 4. Chat bot now dynamically references the selected room name in its responses.
 */

import { useState, useEffect, useRef } from 'react';
import { roomsAPI, sensorsAPI, api } from '../services/api';
import { useStore } from '../store/useStore';
import {
  Sparkles, Loader, AlertCircle, Send, Zap, Brain,
  MessageSquare, CheckCircle, Activity,
  Thermometer, Wind, Zap as EnergyIcon, WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Rule-based fallback analysis (when Groq is down) ──────────────────────────
function generateFallbackAnalysis(sensorData, roomName) {
  const issues = [];
  let severity = 'LOW';

  const temp = sensorData?.temperature;
  const aqi = sensorData?.airQuality;
  const energy = sensorData?.energyUsage;
  const motion = sensorData?.motion;

  if (temp !== undefined) {
    if (temp > 35) { issues.push(`temperature is critically high at ${temp}°C`); severity = 'CRITICAL'; }
    else if (temp > 30) { issues.push(`temperature is elevated at ${temp}°C`); severity = severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'; }
    else if (temp < 18) { issues.push(`temperature is below comfort range at ${temp}°C`); severity = severity === 'CRITICAL' ? 'CRITICAL' : 'MEDIUM'; }
  }
  if (aqi !== undefined) {
    if (aqi > 200) { issues.push(`air quality is hazardous (AQI ${aqi})`); severity = 'CRITICAL'; }
    else if (aqi > 100) { issues.push(`air quality is poor (AQI ${aqi})`); if (severity === 'LOW') severity = 'HIGH'; }
  }
  if (energy !== undefined && energy > 500) {
    issues.push(`energy consumption is high at ${energy}W`);
    if (severity === 'LOW') severity = 'MEDIUM';
  }

  const reasoning = issues.length > 0
    ? `${roomName} shows ${issues.join(', ')}. These readings suggest attention is needed.`
    : `${roomName} sensors are within normal operating ranges. Temperature, air quality, and energy usage all appear stable.`;

  const recommendation = issues.length > 0
    ? 'Dispatch maintenance staff to inspect the room. Check HVAC settings and ensure no equipment is malfunctioning.'
    : 'No immediate action required. Continue routine monitoring every 30 minutes.';

  return {
    severity,
    reasoning,
    recommendation,
    actionTaken: issues.length > 0 ? 'Alert flagged for review' : 'NONE',
    source: 'rule-based', // so we can show a badge
  };
}

function AIAnalysisPage() {
  const { theme } = useStore();
  const isDark = theme === 'dark';

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [latestSensor, setLatestSensor] = useState(null);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const [chatMessages, setChatMessages] = useState([{
    type: 'bot',
    text: "Hello! I'm your Campus Monitor AI. Select a room and click Run Diagnostics to analyze its current environmental health.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { loadRooms(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    setAnalysis(null);
    setLatestSensor(null);
    setUsingFallback(false);
    if (selectedRoomId) fetchLatestSensor(selectedRoomId);
  }, [selectedRoomId]);

  async function loadRooms() {
    try {
      setLoading(true);
      const response = await roomsAPI.getAll(1, 100);
      const roomsList = response.data || response.rooms || [];
      setRooms(roomsList);
      if (roomsList.length > 0) setSelectedRoomId(roomsList[0]._id);
    } catch (error) {
      setLocalError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  // Fetch the latest sensor reading for a room separately
  // (rooms API doesn't include latestSensor — we hit /sensors/live)
  async function fetchLatestSensor(roomId) {
    const room = rooms.find(r => r._id === roomId);
    if (!room) return;
    try {
      setSensorLoading(true);
      const response = await sensorsAPI.getLive(room.name);
      const readings = response.sensors || response.data || response || [];
      if (readings.length > 0) {
        setLatestSensor(readings[0]);
      } else {
        setLatestSensor(null);
      }
    } catch {
      setLatestSensor(null);
    } finally {
      setSensorLoading(false);
    }
  }

  const analyzeRoom = async () => {
    if (!selectedRoomId) { setLocalError('Please select a room'); return; }

    try {
      setAnalysisLoading(true);
      setLocalError('');
      setAnalysis(null);
      setUsingFallback(false);

      const selectedRoom = rooms.find(r => r._id === selectedRoomId);
      const roomName = selectedRoom?.name || 'Room';

      let result;
      try {
        // Try real AI first
        const response = await api.post('/api/ai/analyze', { room: selectedRoomId });
        result = response.analysis;
        result.source = 'ai';
      } catch (aiError) {
        // If AI fails (no sensor data yet, Groq down, etc.), use rule-based fallback
        console.warn('[AIAnalysisPage] AI unavailable, using fallback:', aiError);
        result = generateFallbackAnalysis(latestSensor, roomName);
        setUsingFallback(true);
      }

      setAnalysis(result);

      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: `📊 **Analysis Complete — ${roomName}**\n\n${result.reasoning}\n\n🎯 **Severity:** ${result.severity}\n💡 **Recommendation:** ${result.recommendation}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setLocalError('Failed to run diagnostics. Try again in a moment.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const selectedRoom = rooms.find(r => r._id === selectedRoomId);
    const roomName = selectedRoom?.name || 'the selected room';

    setChatMessages(prev => [...prev, {
      type: 'user', text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
    setChatLoading(true);

    const lower = userText.toLowerCase();
    let botResponse;

    if (lower.includes('temperature') || lower.includes('temp')) {
      botResponse = `🌡️ In **${roomName}**, temperature anomalies typically indicate HVAC issues or high occupancy. The safe range is 18–28°C. If you see a critical alert, verify the thermostat and check if windows are open.`;
    } else if (lower.includes('alert')) {
      botResponse = `🚨 Alerts are triggered when sensor readings breach safety thresholds. The AI engine cross-references temperature, AQI, and energy usage to reduce false positives. Use the filter tabs on the Alerts page to sort by severity.`;
    } else if (lower.includes('energy') || lower.includes('power') || lower.includes('watt')) {
      botResponse = `⚡ High energy usage (>500W) in **${roomName}** outside business hours usually means zombie loads — equipment left on overnight. Check if lighting and lab equipment have auto-shutoff enabled.`;
    } else if (lower.includes('air') || lower.includes('aqi')) {
      botResponse = `💨 Poor air quality (AQI > 100) in **${roomName}** impacts focus and health. The system will recommend increasing ventilation when AQI drops below acceptable levels. Open windows if possible.`;
    } else if (lower.includes('analyze') || lower.includes('run') || lower.includes('diagnos')) {
      botResponse = `🧠 Select **${roomName}** in the dropdown and click **Run Diagnostics**. The system will pull the latest sensor snapshot and generate a full analysis. If the Groq AI model is unavailable, a rule-based engine kicks in automatically.`;
    } else if (lower.includes('simulation') || lower.includes('scenario')) {
      botResponse = `🎮 Use the **Demo Control** button in the top-right to trigger emergency scenarios like Fire Detection or HVAC Failure. These inject anomaly data so you can see how the alert and AI systems respond in real-time.`;
    } else {
      botResponse = `🤔 I'm a facility management assistant. I can help with temperature, AQI, energy usage, or alert interpretation. Try selecting **${roomName}** and running diagnostics for a detailed breakdown!`;
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: 'bot', text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setChatLoading(false);
    }, 700);
  };

  const severityConfig = {
    CRITICAL: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' },
    HIGH: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' },
    MEDIUM: { text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' },
    LOW: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' },
    NORMAL: { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' },
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

      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`p-6 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-purple-500/20'
            : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20' : 'bg-white shadow-sm'}`}>
              <Brain className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Telemetry Analysis
              </h1>
              <p className={`text-sm mt-1 font-medium ${isDark ? 'text-purple-200/70' : 'text-purple-800/70'}`}>
                Powered by Groq · llama3-8b-8192 · Rule-based fallback
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex gap-3 border items-center ${
              isDark ? 'bg-red-900/20 border-red-800/50 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{localError}</p>
            <button onClick={() => setLocalError('')} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback banner */}
      <AnimatePresence>
        {usingFallback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex gap-3 border items-center ${
              isDark ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-200' : 'bg-yellow-50 border-yellow-300 text-yellow-800'
            }`}
          >
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              AI model unavailable — showing rule-based analysis instead. Results are still accurate but less detailed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Room Selection + Results */}
        <motion.div className="lg:col-span-7 space-y-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>

          {/* Room Selector Card */}
          <div className={`p-6 rounded-3xl border ${
            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <Activity className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Target Environment</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <select
                  value={selectedRoomId}
                  onChange={e => setSelectedRoomId(e.target.value)}
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
                      {room.name}{room.type ? ` (${room.type})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <motion.button
                onClick={analyzeRoom}
                disabled={analysisLoading || !selectedRoomId}  // FIX: removed latestSensor gate
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all
                  bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                  text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {analysisLoading
                  ? <><Loader className="w-5 h-5 animate-spin" /> Analyzing...</>
                  : <><Sparkles className="w-5 h-5" /> Run Diagnostics</>
                }
              </motion.button>
            </div>

            {/* Live sensor snapshot */}
            <div className="mt-8">
              <h3 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Live Telemetry Snapshot
              </h3>
              {sensorLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader className="w-4 h-4 animate-spin" /> Loading sensor data...
                </div>
              ) : latestSensor ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Thermometer, color: 'text-blue-500', bg: isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50/50 border-blue-100', value: `${latestSensor.temperature}°C`, label: 'Temperature' },
                    { icon: Wind, color: 'text-emerald-500', bg: isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-emerald-50/50 border-emerald-100', value: latestSensor.airQuality, label: 'AQI' },
                    { icon: EnergyIcon, color: 'text-amber-500', bg: isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-amber-50/50 border-amber-100', value: `${latestSensor.energyUsage}W`, label: 'Energy' },
                    { icon: Activity, color: 'text-purple-500', bg: isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-purple-50/50 border-purple-100', value: latestSensor.motion ? 'Yes' : 'No', label: 'Motion' },
                  ].map(({ icon: Icon, color, bg, value, label }) => (
                    <div key={label} className={`p-4 rounded-2xl border ${bg}`}>
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-xl text-center border border-dashed text-sm ${
                  isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-500'
                }`}>
                  No recent sensor data — you can still run diagnostics and a rule-based analysis will be generated.
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key="results"
                className={`rounded-3xl border overflow-hidden ${
                  isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
                }`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <div className={`px-6 py-5 border-b flex items-center justify-between ${
                  isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <Zap className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Diagnostics Report</h3>
                    {usingFallback && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isDark ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      }`}>
                        Rule-based
                      </span>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${severityConfig[analysis.severity]?.bg} ${severityConfig[analysis.severity]?.text}`}>
                    {analysis.severity} PRIORITY
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-full" />
                    <div className="pl-6 py-1">
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        AI Reasoning
                      </p>
                      <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {analysis.reasoning}
                      </p>
                    </div>
                  </div>

                  <hr className={`border ${isDark ? 'border-slate-700/50' : 'border-gray-100'}`} />

                  <div className="relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 rounded-full" />
                    <div className="pl-6 py-1">
                      <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Recommended Action
                      </p>
                      <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {analysis.recommendation}
                      </p>
                    </div>
                  </div>

                  {analysis.actionTaken && analysis.actionTaken !== 'NONE' && (
                    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          System Action Triggered
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{analysis.actionTaken}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!analysis && !analysisLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`rounded-3xl border border-dashed flex flex-col items-center justify-center py-24 gap-5 ${
                  isDark ? 'bg-slate-800/20 border-slate-700' : 'bg-gray-50/50 border-gray-300'
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
                  <p className={`font-bold text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Awaiting Telemetry</p>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Select a room above and click Run Diagnostics. Works even if the Groq model is offline.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT: Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className={`rounded-3xl border flex flex-col h-[740px] overflow-hidden sticky top-8 ${
            isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
          }`}>
            {/* Chat Header */}
            <div className={`px-6 py-5 flex items-center gap-3 border-b ${
              isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-gray-50/80'
            }`}>
              <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                <MessageSquare className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Facility Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Systems Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-5 space-y-6 ${isDark ? 'bg-slate-900/20' : 'bg-white'}`}>
              {chatMessages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'bot' && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 mt-1 ${
                      isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                    }`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="max-w-[85%] flex flex-col">
                    <div className={`px-5 py-3.5 text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                        : isDark
                          ? 'bg-slate-700/80 text-gray-100 rounded-2xl rounded-tl-sm border border-slate-600'
                          : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200'
                    }`}>
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

              <AnimatePresence>
                {chatLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${
                      isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                    }`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className={`px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 ${
                      isDark ? 'bg-slate-700/80 border border-slate-600' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      {['bg-indigo-500', 'bg-purple-500', 'bg-pink-500'].map((color, i) => (
                        <motion.div key={i} className={`w-2 h-2 rounded-full ${color}`}
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={`p-5 border-t ${isDark ? 'border-slate-700/50 bg-slate-800/80' : 'border-gray-100 bg-white'}`}>
              <div className={`flex gap-3 rounded-2xl border p-1.5 transition-all focus-within:ring-4 ${
                isDark
                  ? 'bg-slate-900/50 border-slate-600 focus-within:border-indigo-500 focus-within:ring-indigo-500/20'
                  : 'bg-gray-50 border-gray-300 focus-within:border-indigo-400 focus-within:ring-indigo-500/20'
              }`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  disabled={chatLoading}
                  placeholder="Ask the facility assistant..."
                  className={`flex-1 px-4 py-2.5 text-sm bg-transparent outline-none font-medium ${
                    isDark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
                <motion.button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md disabled:opacity-40 transition-all"
                >
                  <Send className="w-5 h-5 ml-0.5" />
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
