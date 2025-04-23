import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Coffee } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/cookies" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/support" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Chi siamo
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:hello@gifta.ai"
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          {/* Support Us */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Support Us</h3>
            <div className="space-y-3">
              <a
                href="https://ko-fi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              >
                <Coffee className="w-4 h-4" />
                <span>Support us on Ko-fi</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Gifta — Made with <Heart className="inline-block w-4 h-4 text-rose-500" /> by Luca & Serena
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;