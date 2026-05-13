import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-heading font-bold text-gray-900 dark:text-white mb-3">Campus Monitor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart real-time monitoring system for campus facilities and resources.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/alerts" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Alerts</Link></li>
              <li><Link to="/analytics" className="text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">System</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status: <span className="text-accent-emerald font-medium">Operational</span></p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Version: 1.0.0</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} Campus Monitor. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
