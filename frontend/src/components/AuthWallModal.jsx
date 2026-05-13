import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

function AuthWallModal({ isOpen = false }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/login');
          return 2;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500/20 rounded-full">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Login Required
        </h2>

        {/* Description */}
        <p className="text-slate-300 text-center text-sm mb-6">
          You need to be authenticated to access this section. Redirecting to login...
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {countdown}
          </span>
          <span className="text-slate-400">seconds</span>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg mb-6">
          <p className="text-xs text-slate-300">
            If you're not redirected, click the button below to proceed.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          Go to Login
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default AuthWallModal;
