import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiMap, HiEye } from 'react-icons/hi';
import useAuthStore from '../store/authStore';

const features = [
  { icon: <HiMap size={24} />, title: 'Living Career CareerGuide', desc: 'Your careerGuide evolves every 6 months, adapting to industry trends and your progress.', color: '#d946ef' },
  { icon: <HiAcademicCap size={24} />, title: 'College DNA Matching', desc: 'Match with 15,000+ colleges worldwide based on your profile, budget, and goals.', color: '#22c55e' },
  { icon: <HiEye size={24} />, title: 'Career Simulation', desc: 'Shadow any profession through AI-powered career simulations before choosing.', color: '#ec4899' },
];

const stats = [
  { value: '15,000+', label: 'Colleges' },
  { value: '2,000+', label: 'Careers' },
  { value: '5', label: 'Languages' },
  { value: '12', label: 'Weekly Goals' },
];

function Home() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="relative" id="home-page">
      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #d946ef, transparent)', animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-primary-500/30 bg-primary-600/10 mb-6 sm:mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse animate-duration-1000" />
            <span className="text-xs sm:text-sm text-primary-300 font-semibold tracking-wide uppercase">AI-Powered Career Guidance</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black leading-[1.1] sm:leading-tight mb-6 tracking-tight"
          >
            Your <span className="gradient-text">Destiny</span>,{' '}
            <br className="hidden sm:block" />
            Powered by <span className="gradient-text">AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-surface-400 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0"
          >
            Answer a few questions. Get a precise, living career careerGuide — matched colleges,
            courses, career paths, and weekly milestones — updated for life.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0"
          >
            {!isAuthenticated ? (
              <Link to="/signup" className="btn-primary text-sm sm:text-base md:text-lg px-6 py-3.5 sm:px-8 sm:py-4 w-full sm:w-auto text-center font-bold tracking-wide shadow-lg hover:shadow-primary-500/10 active:scale-95 transition-all" id="hero-cta">
                Start Your Journey →
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-primary text-sm sm:text-base md:text-lg px-6 py-3.5 sm:px-8 sm:py-4 w-full sm:w-auto text-center font-bold tracking-wide shadow-lg hover:shadow-primary-500/10 active:scale-95 transition-all" id="hero-cta">
                Go to Dashboard →
              </Link>
            )}
            <Link to="/careerSimulate" className="btn-secondary text-sm sm:text-base md:text-lg px-6 py-3.5 sm:px-8 sm:py-4 w-full sm:w-auto text-center font-bold tracking-wide active:scale-95 transition-all" id="hero-simulate">
              Try Career Simulate
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-16 sm:mt-24 max-w-4xl mx-auto border-t border-white/5 pt-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-md">
                <p className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold gradient-text tracking-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider text-surface-500 mt-1 uppercase">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-surface-600 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-primary-500" />
          </div>
        </motion.div>
      </section>

      {/* ─── Features Section ────────────────────────── */}
      <section className="py-24 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              Everything You Need to{' '}
              <span className="gradient-text">Find Your Path</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="section-subheading mx-auto"
            >
              DestinAI combines cutting-edge AI with comprehensive career and education data
              to give you the most personalized guidance possible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}20`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────── */}
      <section className="py-24 relative bg-surface-900/50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              How <span className="gradient-text">DestinAI</span> Works
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Answer Few Questions', desc: 'Tell us about your interests, strengths, stream preference, education, budget, and location.', icon: '🎯' },
              { step: '02', title: 'AI Generates Your CareerGuide', desc: 'Our AI engine analyzes your inputs against 2,000+ careers and 15,000+ colleges.', icon: '🤖' },
              { step: '03', title: 'Follow Your Living Path', desc: 'Get weekly milestones, matched colleges, and career insights that update every 6 months.', icon: '🚀' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold mb-3">
                  STEP {item.step}
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-surface-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>


        </div>
      </section>
    </div>
  );
}

export default Home;
