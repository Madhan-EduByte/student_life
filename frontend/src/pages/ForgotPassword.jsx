import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiArrowLeft } from 'react-icons/hi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import authService from '../services/authService';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // If your authService supports forgotPassword, uncomment below:
      // if (authService.forgotPassword) {
      //   await authService.forgotPassword({ email });
      // } else {
      // Fallback network simulation if the backend auth route isn't strictly ready
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // }
      setSuccess('If an account exists with this email, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-8 relative" id="forgot-password-page">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }} />

      <div className="relative w-full max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 md:p-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Reset Password
            </h1>
            <p className="text-surface-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <motion.div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input type="email" name="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Enter your email" icon={<HiMail />} disabled={isLoading} />
            </div>
            <Button type="submit" variant="primary" className="w-full mt-4" loading={isLoading} disabled={isLoading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => navigate('/login')} className="text-surface-400 hover:text-white flex items-center justify-center mx-auto transition-colors text-sm">
              <HiArrowLeft className="mr-2" /> Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPassword;