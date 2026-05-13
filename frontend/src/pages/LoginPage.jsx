import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { authAPI } from '../services/api';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, User, Building2, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, '8+ characters required')
    .regex(/[A-Z]/, 'One uppercase letter required')
    .regex(/[0-9]/, 'One number required')
    .regex(/[!@#$%^&*]/, 'One special character (!@#$%^&*) required'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    setFieldErrors({});
    const schema = isLogin ? loginSchema : signupSchema;
    try {
      const dataToValidate = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      schema.parse(dataToValidate);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
          errors[e.path[0]] = e.message;
        });
        setFieldErrors(errors);
        return false;
      }
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // LOGIN
        const response = await authAPI.login(formData.email, formData.password);
        setAuth(response.token, response.user);
        navigate('/dashboard');
      } else {
        // SIGNUP
        const response = await authAPI.register(
          formData.name,
          formData.email,
          formData.password
        );
        setSuccess('✓ Account created! Redirecting...');
        
        // Auto-login after signup
        setTimeout(async () => {
          try {
            const loginResponse = await authAPI.login(formData.email, formData.password);
            setAuth(loginResponse.token, loginResponse.user);
            navigate('/dashboard');
          } catch (loginErr) {
            setError(loginErr.error || 'Login failed after signup.');
            setIsLogin(true);
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header - Always Visible */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Campus</h1>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Monitor</h2>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Smart Campus Management System</p>
        </div>

        {/* Card Container - Single Card Design */}
        <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl transition-all duration-300">
          
          {/* Title (Centered) */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white text-center mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-slate-400 text-sm text-center">
              {isLogin ? 'Sign in to your campus monitoring account' : 'Join Campus Monitor to start monitoring'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Form Container with Slide Animation */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Signup only) - Animated Entrance */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.name ? 'border-red-500/50' : 'border-slate-600/50 hover:border-slate-600'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  placeholder={isLogin ? "student@campus.edu" : "you@campus.edu"}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.email ? 'border-red-500/50' : 'border-slate-600/50 hover:border-slate-600'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={isLogin ? "••••••••" : "Min 8 chars, 1 uppercase, 1 number, 1 special"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.password ? 'border-red-500/50' : 'border-slate-600/50 hover:border-slate-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Signup only) - Animated Entrance */}
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.confirmPassword ? 'border-red-500/50' : 'border-slate-600/50 hover:border-slate-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-6"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700/50"></div>
            <span className="text-xs text-slate-500">{isLogin ? 'New here?' : 'Back to login'}</span>
            <div className="flex-1 h-px bg-slate-700/50"></div>
          </div>

          {/* Mode Toggle Link */}
          <div className="text-center">
            <button
              onClick={toggleMode}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLogin ? (
                <>
                  Don't have an account? <span className="text-xl">→</span> Create one
                </>
              ) : (
                <>
                  Already have an account? <span className="text-xl">→</span> Sign in
                </>
              )}
            </button>
          </div>
        </div>

        {/* Demo Credentials - Only show on login form */}
        {isLogin && (
          <div className="mt-8 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg animate-in fade-in duration-500">
            <p className="text-slate-400 text-xs text-center mb-3">💡 Demo Credentials:</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-slate-400 text-xs">Email:</span>
                <span className="text-blue-300 text-xs font-mono">student@campus.edu</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-slate-400 text-xs">Password:</span>
                <span className="text-blue-300 text-xs font-mono">Demo@1234</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-slate-500">
          🔒 Your data is encrypted and secure
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
