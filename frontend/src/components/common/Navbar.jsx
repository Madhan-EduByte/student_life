import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiLogout, HiUser } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';
import { APP_NAME, NAV_LINKS } from '../../constants';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>
              D
            </div>
            <span className="font-display font-bold text-xl text-white group-hover:text-primary-400 transition-colors">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-primary-600/20 border border-primary-500/30'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons / User */}
          <div className="hidden md:flex items-center gap-2 relative">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 group px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                  id="nav-user"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 border border-primary-500/50 flex items-center justify-center text-sm font-semibold text-white">
                    {user?.full_name?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-surface-300 group-hover:text-white transition-colors">
                    {user?.full_name || 'User'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 shadow-lg overflow-hidden"
                      style={{ background: 'rgba(15, 23, 42, 0.95)' }}
                    >
                      {/* User Info */}
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/10"
                      >
                        <HiUser size={18} className="text-primary-400" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-white">{user?.email}</div>
                          <div className="text-xs text-surface-400 capitalize">{user?.role || 'User'}</div>
                        </div>
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                        id="nav-logout"
                      >
                        <HiLogout size={18} />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-surface-300 px-4 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-all" id="nav-signin">
                  Sign In
                </Link>
                <Link to="/signup" className="text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 text-white" 
                  style={{ background: 'linear-gradient(90deg, #6366f1, #d946ef)' }}
                  id="nav-signup">
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-surface-400 hover:text-white transition-colors"
            id="nav-mobile-toggle"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
            style={{ background: 'rgba(15, 23, 42, 0.95)' }}
          >
            <div className="px-4 py-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-white bg-primary-600/20'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  <div className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-sm font-medium text-white">{user?.email}</div>
                    <div className="text-xs text-surface-400 capitalize">{user?.role || 'User'}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <HiLogout size={18} />
                    Logout
                  </button>
                </div>
              )}
              {!isAuthenticated && (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #d946ef)' }}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
