import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { settingsAPI } from '../services/api';
import {
  Settings as SettingsIcon,
  ToggleRight,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader,
  Moon,
  Sun,
  Bell,
  Lock,
  Database,
  Gauge,
} from 'lucide-react';
import { motion } from 'framer-motion';

function SettingsPage() {
  const { auth, setAuth } = useStore();
  const [simulationMode, setSimulationMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dataRetention, setDataRetention] = useState(30);
  const [updateFrequency, setUpdateFrequency] = useState(3);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await settingsAPI.getSettings();
      const settings = response.data;

      setSimulationMode(settings.simulationMode ?? true);
      setDarkMode(settings.darkMode ?? true);
      setNotifications(settings.notifications ?? true);
      setDataRetention(settings.dataRetention ?? 30);
      setUpdateFrequency(settings.updateFrequency ?? 3);
      setEmailAlertsEnabled(settings.emailAlerts?.enabled ?? false);
      setEmailRecipients((settings.emailAlerts?.recipients || []).join(', '));
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      // Fall back to localStorage
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSimulationMode(settings.simulationMode ?? true);
        setDarkMode(settings.darkMode ?? true);
        setNotifications(settings.notifications ?? true);
        setDataRetention(settings.dataRetention ?? 30);
        setUpdateFrequency(settings.updateFrequency ?? 3);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSimulation = async () => {
    setSaving(true);
    try {
      const newMode = !simulationMode;
      await settingsAPI.updateSettings({ simulationMode: newMode });
      
      setSimulationMode(newMode);
      setSaveStatus('success');
      
      // Also save to localStorage
      const settings = {
        simulationMode: newMode,
        darkMode,
        notifications,
        dataRetention,
        updateFrequency,
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error toggling simulation:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const recipientArray = emailRecipients
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const settingsData = {
        simulationMode,
        darkMode,
        notifications,
        dataRetention,
        updateFrequency,
        emailAlerts: {
          enabled: emailAlertsEnabled,
          recipients: recipientArray,
        },
      };
      
      await settingsAPI.updateSettings(settingsData);
      
      // Also save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settingsData));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Configure your Campus Monitor experience</p>
      </motion.div>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </motion.div>
      )}

      {saveStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Settings saved successfully!</p>
        </motion.div>
      )}

      {saveStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">Error saving settings. Please try again.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Data Mode Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card border-2 border-primary-500/20 hover:border-primary-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-500" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Data Mode</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-13">
                  {simulationMode 
                    ? '🟢 Using simulated sensor data for demonstration'
                    : '🔴 Using live hardware sensor data'}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleSimulation}
                disabled={saving}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  simulationMode
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600'
                } shadow-lg disabled:opacity-50`}
              >
                <motion.div
                  animate={{ x: simulationMode ? 4 : 24 }}
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                />
              </motion.button>
            </div>

            {/* Mode Badge */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Current Mode:</span>
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${
                    simulationMode
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${simulationMode ? 'bg-blue-400' : 'bg-orange-400'}`} />
                  {simulationMode ? '🧪 SIMULATED DATA' : '⚡ LIVE DATA'}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Data Management Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-green-500" />
              </div>
              <h2 className="text-xl font-heading font-bold">Data Management</h2>
            </div>

            <div className="space-y-6">
              {/* Data Retention */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Data Retention Period
                  </label>
                  <span className="text-lg font-bold text-primary-500">{dataRetention} days</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="90"
                  step="1"
                  value={dataRetention}
                  onChange={(e) => setDataRetention(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((dataRetention - 7) / 83) * 100}%, #e5e7eb ${((dataRetention - 7) / 83) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Sensor data older than {dataRetention} days will be automatically deleted
                </p>
              </div>

              {/* Update Frequency */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sensor Update Frequency
                  </label>
                  <span className="text-lg font-bold text-primary-500">{updateFrequency}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={updateFrequency}
                  onChange={(e) => setUpdateFrequency(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((updateFrequency - 1) / 9) * 100}%, #e5e7eb ${((updateFrequency - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Dashboard will refresh sensor data every {updateFrequency} seconds
                </p>
              </div>
            </div>
          </motion.div>

          {/* General Settings Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Gauge className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-heading font-bold">General Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get alerts for critical events</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-12 h-7 rounded-full transition-all ${
                    notifications ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications ? 22 : 2 }}
                    className="absolute top-0.5 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Email Alerts Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Alerts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send CRITICAL/HIGH alerts to email</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                  className={`relative w-12 h-7 rounded-full transition-all ${
                    emailAlertsEnabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <motion.div
                    animate={{ x: emailAlertsEnabled ? 22 : 2 }}
                    className="absolute top-0.5 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </motion.button>
              </div>

              {/* Email Recipients */}
              {emailAlertsEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Email Recipients (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="admin@campus.edu, security@campus.edu"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Enter email addresses where alerts should be sent (comma-separated)
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                {auth?.user?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="font-bold text-lg text-white mb-1">{auth?.user?.name || 'User'}</h3>
              <p className="text-sm text-gray-400">{auth?.user?.email || 'user@campus.edu'}</p>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-gray-400 mb-3">Account Status</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Active
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
          >
            <h3 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">App Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rooms Monitored</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Alerts</span>
                <span className="font-medium text-orange-500">6</span>
              </div>
            </div>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 hover:border-red-500/50 font-bold rounded-lg transition-all"
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
