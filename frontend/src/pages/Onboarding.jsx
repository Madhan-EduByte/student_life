import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiArrowRight, HiSparkles } from 'react-icons/hi';
import useRoadmapStore from '../store/roadmapStore';
import Button from '../components/common/Button';
import { STREAMS, EDUCATION_LEVELS, BUDGET_RANGES, LOCATIONS } from '../constants';

const questions = [
  {
    key: 'interest_areas',
    title: 'What are your interests?',
    subtitle: 'Tell us what excites you. Be as specific as you like.',
    type: 'text',
    placeholder: 'e.g., technology, art, coding, medicine, gaming, cooking...',
    icon: '🎯',
  },
  {
    key: 'strengths',
    title: 'What are your strengths?',
    subtitle: 'What do people say you\'re naturally good at?',
    type: 'text',
    placeholder: 'e.g., problem-solving, creativity, leadership, communication...',
    icon: '💪',
  },
  {
    key: 'preferred_stream',
    title: 'Which stream do you prefer?',
    subtitle: 'Select the academic stream that interests you most.',
    type: 'select',
    options: STREAMS,
    icon: '📚',
  },
  {
    key: 'education_level',
    title: 'What\'s your current education level?',
    subtitle: 'Select where you are in your academic journey.',
    type: 'select',
    options: EDUCATION_LEVELS,
    icon: '🎓',
  },
  {
    key: 'budget_range',
    title: 'What\'s your budget range?',
    subtitle: 'Annual education budget you\'re comfortable with.',
    type: 'select',
    options: BUDGET_RANGES,
    icon: '💰',
  },
  {
    key: 'location_preference',
    title: 'Preferred study location?',
    subtitle: 'Where would you like to study?',
    type: 'select',
    options: LOCATIONS,
    icon: '📍',
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { careerInputs, setCareerInputs } = useRoadmapStore();

  const currentQuestion = questions[step];
  const currentValue = careerInputs[currentQuestion.key] || '';
  const isLastStep = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleGenerate();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation delay (in production, this calls the API)
    setTimeout(() => {
      setIsGenerating(false);
      navigate('/roadmap');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 relative" id="onboarding-page">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-surface-400">
              Question {step + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold gradient-text">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #d946ef)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 md:p-12"
          >
            {/* Icon & Question */}
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">{currentQuestion.icon}</span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                {currentQuestion.title}
              </h2>
              <p className="text-surface-400">{currentQuestion.subtitle}</p>
            </div>

            {/* Input */}
            {currentQuestion.type === 'text' ? (
              <textarea
                value={currentValue}
                onChange={(e) => setCareerInputs({ [currentQuestion.key]: e.target.value })}
                placeholder={currentQuestion.placeholder}
                rows={3}
                className="input-field resize-none text-lg"
                id={`input-${currentQuestion.key}`}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCareerInputs({ [currentQuestion.key]: option.value })}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      currentValue === option.value
                        ? 'border-primary-500 bg-primary-600/20 text-white shadow-glow'
                        : 'border-white/10 bg-white/5 text-surface-300 hover:border-primary-500/30 hover:bg-white/10'
                    }`}
                    id={`option-${option.value}`}
                  >
                    <span className="text-lg mr-2">{option.icon || ''}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                id="btn-back"
              >
                <HiArrowLeft className="mr-2" /> Back
              </Button>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!currentValue}
                loading={isGenerating}
                id="btn-next"
              >
                {isGenerating ? (
                  'AI is generating your roadmap...'
                ) : isLastStep ? (
                  <>
                    <HiSparkles className="mr-2" /> Generate Roadmap
                  </>
                ) : (
                  <>
                    Next <HiArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step
                  ? 'bg-primary-500 w-8'
                  : i < step
                  ? 'bg-primary-500/40'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Generating Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-950/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 mb-6"
            />
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Generating Your Roadmap
            </h3>
            <p className="text-surface-400 text-center max-w-md">
              Our AI is analyzing your inputs against 2,000+ careers and 15,000+ colleges
              to build your personalized career roadmap...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Onboarding;
