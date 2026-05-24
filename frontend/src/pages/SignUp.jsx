import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import CareerProfileForm from '../components/common/CareerProfileForm';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';

function getSignUpErrorMessage(err) {
  if (err instanceof Error && err.message && !err.response) {
    return err.message;
  }

  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg)
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  if (detail && typeof detail === 'object' && typeof detail.msg === 'string') {
    return detail.msg;
  }

  return 'Sign up failed. Please try again.';
}

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Account Creation, Step 2: Career Profile
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
  });
  const [careerProfile, setCareerProfile] = useState({
    interests: [],
    strengths: [],
    industry_stream: '',
    education_level: '',
    budget: '',
    location: '',
    work_life_balance: '',
    risk_tolerance: '',
    interaction_style: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleCareerProfileChange = (field, value) => {
    setCareerProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAccountForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateCareerProfile = () => {
    if (!careerProfile.interests || careerProfile.interests.length === 0) {
      setError('Please select at least one interest area');
      return false;
    }
    if (!careerProfile.strengths || careerProfile.strengths.length === 0) {
      setError('Please select at least one strength');
      return false;
    }
    if (!careerProfile.industry_stream) {
      setError('Please select an industry/stream');
      return false;
    }
    if (!careerProfile.education_level) {
      setError('Please select an education level');
      return false;
    }
    if (!careerProfile.budget) {
      setError('Please select a budget range');
      return false;
    }
    if (!careerProfile.location) {
      setError('Please select a location preference');
      return false;
    }
    return true;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!validateAccountForm()) return;

    setError('');
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleCompleteSignUp = async (e) => {
    e.preventDefault();
    if (!validateCareerProfile()) return;

    setIsLoading(true);
    try {
      const response = await authService.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        role: 'student',
        interest_areas: Array.isArray(careerProfile.interests) ? careerProfile.interests.join(', ') : (careerProfile.interests || ''),
        strengths: Array.isArray(careerProfile.strengths) ? careerProfile.strengths.join(', ') : (careerProfile.strengths || ''),
        preferred_stream: careerProfile.industry_stream || '',
        education_level: careerProfile.education_level || '',
        budget_range: careerProfile.budget || '',
        location_preference: careerProfile.location || '',
        work_life_balance: careerProfile.work_life_balance || '',
        risk_tolerance: careerProfile.risk_tolerance || '',
        interaction_style: careerProfile.interaction_style || '',
      });

      // Login to authenticate and get the token (which will auto-navigate to /roadmap)
      const loginResult = await login(formData.email, formData.password);
      if (!loginResult.success) {
        throw new Error(loginResult.error || 'Failed to auto-login after registration');
      }

      setSuccess('✅ Account created and career roadmap generated!');
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
      });
      setCareerProfile({
        interests: [],
        strengths: [],
        industry_stream: '',
        education_level: '',
        budget: '',
        location: '',
        work_life_balance: '',
        risk_tolerance: '',
        interaction_style: '',
      });
    } catch (err) {
      const errorMsg = getSignUpErrorMessage(err);
      setError(errorMsg);
      console.error('SignUp error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-8 relative" id="signup-page">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }} />

      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        {currentStep === 1 ? (
          // STEP 1: ACCOUNT CREATION
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 md:p-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-surface-400">
                Step 1 of 2: Join DestinAI and discover your perfect career path
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
              >
                {success}
              </motion.div>
            )}

            <p className="text-sm text-surface-400 mb-4">
              <span className="text-red-500">*</span> indicates a mandatory field
            </p>

            {/* Form */}
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={<HiUser />}
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<HiMail />}
                  disabled={isLoading}
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone <span className="text-surface-500">(Optional)</span>
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  icon={<HiPhone />}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 8 characters)"
                  icon={<HiLockClosed />}
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  icon={<HiLockClosed />}
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Next: Tell Us About Your Career <HiArrowRight className="ml-2" />
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-3 text-sm text-surface-500">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Login Link */}
            <p className="text-center text-surface-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        ) : (
          // STEP 2: CAREER PROFILE
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 md:p-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Tell Us About Your Career
              </h1>
              <p className="text-surface-400">
                Step 2 of 2: Complete your career profile for AI-powered recommendations
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Career Profile Form */}
            <form onSubmit={handleCompleteSignUp} className="space-y-6">
              <CareerProfileForm formData={careerProfile} onChange={handleCareerProfileChange} showOptional={true} />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                >
                  <HiArrowLeft className="mr-2" /> Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Complete SignUp <HiArrowRight className="ml-2" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SignUp;
