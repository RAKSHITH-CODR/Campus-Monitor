import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, X, Sun, Moon, Bell, LogOut, LayoutGrid, AlertCircle, BarChart3, Sparkles, Settings, Users } from 'lucide-react';
import { THEME_COLORS } from '../../config/theme';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, logout, auth } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isDark = theme === 'dark';
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: '/alerts', label: 'Alerts', icon: AlertCircle },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/ai-analysis', label: 'AI Analysis', icon: Sparkles },
  ];

  const adminItems = [
    { path: '/settings', label: 'Settings', icon: Settings },
    ...(auth?.user?.role === 'admin' ? [{ path: '/users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <nav
      className="border-b shadow-sm sticky top-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border.primary,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 font-heading font-bold text-xl hover:opacity-80 transition-opacity"
            style={{ color: colors.text.primary }}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              CM
            </div>
            <span className="hidden sm:inline">Campus Monitor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive(path) ? colors.bg.secondary : 'transparent',
                  color: isActive(path) ? '#3B82F6' : colors.text.secondary,
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Admin Items */}
            {adminItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive(path) ? colors.bg.secondary : 'transparent',
                  color: isActive(path) ? '#3B82F6' : colors.text.secondary,
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              className="p-2 rounded-lg transition-colors relative"
              style={{ backgroundColor: colors.bg.secondary }}
            >
              <Bell
                className="w-5 h-5"
                style={{ color: colors.text.secondary }}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: colors.bg.secondary }}
            >
              {theme === 'dark' ? (
                <Sun
                  className="w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
              ) : (
                <Moon
                  className="w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
              )}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 rounded-lg transition-colors flex items-center gap-2"
                style={{ backgroundColor: colors.bg.secondary }}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {auth?.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 border"
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border.primary,
                  }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ borderColor: colors.border.primary }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      {auth?.user?.email}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: colors.text.secondary }}
                    >
                      {auth?.user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: colors.text.secondary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.bg.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ backgroundColor: colors.bg.secondary }}
            >
              {mobileMenuOpen ? (
                <X
                  className="w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
              ) : (
                <Menu
                  className="w-5 h-5"
                  style={{ color: colors.text.secondary }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t py-4 space-y-2"
            style={{ borderColor: colors.border.primary }}
          >
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive(path) ? colors.bg.secondary : 'transparent',
                  color: isActive(path) ? '#3B82F6' : colors.text.secondary,
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Admin Items Mobile */}
            {adminItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive(path) ? colors.bg.secondary : 'transparent',
                  color: isActive(path) ? '#3B82F6' : colors.text.secondary,
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
