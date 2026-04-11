import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiSparkles } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'

  const validateForm = () => {
    const newErrors = {};

    if (loginMode === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) newErrors.email = 'Email is required';
      else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
    } else {
      if (!email) newErrors.email = 'Phone number is required';
      else if (!/^\d{10}$/.test(email.replace(/\D/g, ''))) 
        newErrors.email = 'Phone number must be 10 digits';
    }

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSubmitting(true);
    try {
      const result = await login(demoEmail, demoPassword);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ submit: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-8 relative overflow-hidden" id="login-page">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
        animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }}
        animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="relative w-full max-w-md mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-white text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            D
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-surface-400">Your destiny awaits. Log in to continue.</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-8 md:p-10 mb-8"
          variants={itemVariants}
        >
          {/* Mode Selector */}
          <motion.div className="flex gap-3 mb-8" variants={itemVariants}>
            <button
              onClick={() => {
                setLoginMode('email');
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                loginMode === 'email'
                  ? 'bg-primary-600 text-white shadow-glow border border-primary-500'
                  : 'bg-white/5 text-surface-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <HiMail className="inline mr-2" />
              Email
            </button>
            <button
              onClick={() => {
                setLoginMode('phone');
                setErrors({});
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                loginMode === 'phone'
                  ? 'bg-primary-600 text-white shadow-glow border border-primary-500'
                  : 'bg-white/5 text-surface-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              📱 Phone
            </button>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Phone Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                {loginMode === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
                <input
                  type={loginMode === 'email' ? 'email' : 'tel'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: '' });
                  }}
                  placeholder={
                    loginMode === 'email'
                      ? 'you@example.com'
                      : '9876543210'
                  }
                  className={`w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border transition-all duration-200 text-white placeholder-surface-500 focus:outline-none ${
                    errors.email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                  }`}
                  id="login-email-phone"
                />
              </div>
              {errors.email && (
                <motion.p className="text-red-400 text-sm mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border transition-all duration-200 text-white placeholder-surface-500 focus:outline-none ${
                    errors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20'
                  }`}
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p className="text-red-400 text-sm mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Error */}
            <AnimatePresence>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {errors.submit}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 enabled:hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #d946ef)',
                }}
                id="btn-login-submit"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <HiSparkles />
                    </motion.div>
                    Logging in...
                  </>
                ) : (
                  <>
                    Sign In
                    <HiArrowRight />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Forgot Password */}
          <motion.div className="text-center mt-6" variants={itemVariants}>
            <Link
              to="#"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Forgot password?
            </Link>
          </motion.div>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div className="text-center mt-8" variants={itemVariants}>
          <p className="text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
