/**
 * Simulation Control Center
 * Demo superpower - trigger scenarios to show system responsiveness
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Wifi, Lock, Users, Wind, RotateCcw } from 'lucide-react';
import { THEME_COLORS } from '../config/theme';

export default function SimulationControlCenter({ onScenarioTrigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioActive, setScenarioActive] = useState(false);
  const [countdownTime, setCountdownTime] = useState(0);

  const scenarios = [
    {
      id: 'fire',
      name: 'Fire Detection',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-600',
      description: 'Triggers smoke detection in random room',
      effects: {
        smoke: true,
        temp: 35,
        aqi: 450,
        occupancy: 'evacuating',
      },
    },
    {
      id: 'power-surge',
      name: 'Power Surge',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Sudden electrical surge event',
      effects: {
        voltage: 250, // High voltage
        power: 5000,
        tempSpike: true,
      },
    },
    {
      id: 'network-failure',
      name: 'Network Failure',
      icon: Wifi,
      color: 'from-blue-500 to-blue-600',
      description: 'Complete network connectivity loss',
      effects: {
        networkDown: true,
        dataLoss: true,
      },
    },
    {
      id: 'unauthorized-entry',
      name: 'Unauthorized Entry',
      icon: Lock,
      color: 'from-purple-500 to-purple-600',
      description: 'Motion detected in secure area',
      effects: {
        motionAlarm: true,
        unauthorizedAccess: true,
      },
    },
    {
      id: 'overcrowding',
      name: 'Overcrowding',
      icon: Users,
      color: 'from-pink-500 to-rose-600',
      description: 'Sudden crowd surge in room',
      effects: {
        occupancy: 250,
        co2: 2500,
        aqi: 300,
        temp: 28,
      },
    },
    {
      id: 'hvac-failure',
      name: 'HVAC Failure',
      icon: Wind,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Climate control system shutdown',
      effects: {
        hvacDown: true,
        tempUncontrolled: true,
        humidity: 95,
      },
    },
  ];

  const triggerScenario = async (scenario) => {
    setActiveScenario(scenario);
    setScenarioActive(true);

    // Countdown from 10 seconds
    let countdown = 10;
    const interval = setInterval(() => {
      setCountdownTime(countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(interval);
        // Call parent function to trigger scenario
        if (onScenarioTrigger) {
          onScenarioTrigger(scenario);
        }
      }
    }, 1000);

    // Auto reset after scenario duration
    setTimeout(() => {
      setScenarioActive(false);
      setActiveScenario(null);
    }, 15000);
  };

  const resetScenario = () => {
    setActiveScenario(null);
    setScenarioActive(false);
    setCountdownTime(0);
    if (onScenarioTrigger) {
      onScenarioTrigger({ id: 'reset' });
    }
  };

  return (
    <>
      {/* Control Center Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-24 z-40 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Demo Simulation Center"
      >
        <AlertTriangle className="w-4 h-4" />
        Demo Control
      </motion.button>

      {/* Control Center Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-20 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-6"
          >
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Simulation Control Center
              </h3>
              <p className="text-xs text-slate-400">Trigger demo scenarios to test system responsiveness</p>
            </div>

            {/* Active Scenario Display */}
            {scenarioActive && activeScenario && (
              <div className={`mb-6 p-4 rounded-lg bg-gradient-to-r ${activeScenario.color} text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <activeScenario.icon className="w-5 h-5" />
                    <span className="font-semibold">{activeScenario.name} Active</span>
                  </div>
                  <span className="text-2xl font-bold">{countdownTime}s</span>
                </div>
                <p className="text-xs opacity-90">{activeScenario.description}</p>

                {/* Progress Bar */}
                <div className="mt-3 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 10, linear: true }}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            )}

            {/* Scenario Buttons Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {scenarios.map((scenario) => (
                <motion.button
                  key={scenario.id}
                  onClick={() => triggerScenario(scenario)}
                  disabled={scenarioActive}
                  whileHover={{ scale: 0.95 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-lg text-left group cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    activeScenario?.id === scenario.id
                      ? `bg-gradient-to-br ${scenario.color} text-white`
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <scenario.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-sm">{scenario.name}</span>
                  </div>
                  <p className="text-xs opacity-75 line-clamp-1">{scenario.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Reset Button */}
            {scenarioActive && (
              <motion.button
                onClick={resetScenario}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Scenario
              </motion.button>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-300 leading-relaxed">
                💡 <strong>Tip:</strong> Trigger any scenario to see how the system detects anomalies, alerts users, and provides AI reasoning in real-time.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
