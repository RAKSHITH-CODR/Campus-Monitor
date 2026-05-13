import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomsAPI, sensorsAPI, analyticsAPI } from '../services/api';
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatters } from '../utils/formatters';

function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [roomData, sensorsData, analyticsData] = await Promise.all([
        roomsAPI.getAll().then(res => res.rooms?.find(r => r._id === id)),
        sensorsAPI.getLive(id),
        analyticsAPI.getTemperature(id),
      ]);

      if (!roomData) {
        setError('Room not found');
        return;
      }

      setRoom(roomData);
      setSensors(Array.isArray(sensorsData) ? sensorsData : []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading room data:', error);
      setError(error.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-heading font-bold">Room Details</h1>
        </div>

        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Room</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="section">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Room not found</p>
        </div>
      </div>
    );
  }

  const latestSensor = sensors && sensors.length > 0 ? sensors[0] : null;

  return (
    <div className="section">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold">{room.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{room.type} • Floor {room.floor}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {latestSensor && (
          <>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Temperature</p>
                  <p className="text-3xl font-bold">{latestSensor.temperature?.toFixed(1) || 'N/A'}°C</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Humidity</p>
                  <p className="text-3xl font-bold">{latestSensor.humidity?.toFixed(0) || 'N/A'}%</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Energy Usage</p>
                  <p className="text-3xl font-bold">{latestSensor.energyUsage?.toFixed(1) || 'N/A'}W</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Air Quality</p>
                  <p className="text-3xl font-bold">{latestSensor.airQuality || 'N/A'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Temperature Chart */}
      {analytics && Array.isArray(analytics) && analytics.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-heading font-bold mb-6">Temperature History (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value) => value?.toFixed(1)}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                dot={false}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default RoomDetailPage;
