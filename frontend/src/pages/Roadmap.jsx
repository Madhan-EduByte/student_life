import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles, HiRefresh, HiAcademicCap, HiChartBar } from 'react-icons/hi';
import FutureProofScore from '../components/career/FutureProofScore';
import MilestoneTracker from '../components/dashboard/MilestoneTracker';

// Demo roadmap data
const demoRoadmap = {
  title: 'Your Path to Becoming a Software Engineer',
  career_path: 'Software Engineer',
  summary: 'Based on your interests in technology and problem-solving strengths, we recommend pursuing a career as a Software Engineer. This roadmap will guide you through the next 12 weeks.',
  recommended_stream: 'science',
  confidence_score: 85,
  future_proof_score: 78,
  ai_model_used: 'gemini',
  version: 1,
  alternative_careers: ['Data Scientist', 'Product Manager', 'UX Researcher'],
  milestones: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    week_number: i + 1,
    title: i < 4 ? `Week ${i + 1}: Foundation — ${['Learn HTML/CSS', 'JavaScript Basics', 'Git & GitHub', 'Responsive Design'][i]}` :
           i < 8 ? `Week ${i + 1}: Building — ${['React.js Fundamentals', 'State Management', 'API Integration', 'Database Basics'][i - 4]}` :
           `Week ${i + 1}: Advanced — ${['Full Project Build', 'Testing & QA', 'Deployment', 'Portfolio & Resume'][i - 8]}`,
    description: `Focus on mastering key concepts for week ${i + 1}.`,
    category: i < 4 ? 'learning' : i < 8 ? 'project' : 'networking',
    priority: i < 4 ? 'high' : 'medium',
    estimated_hours: 10,
    is_completed: i < 3,
  })),
};

function Roadmap() {
  const [roadmap] = useState(demoRoadmap);

  return (
    <div className="min-h-screen pt-24 pb-16" id="roadmap-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiSparkles className="text-primary-400" />
                <span className="text-sm text-primary-400 font-medium">AI-Generated Roadmap</span>
                <span className="badge-primary text-xs">v{roadmap.version}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {roadmap.title}
              </h1>
              <p className="text-surface-400 max-w-2xl">{roadmap.summary}</p>
            </div>
            <button className="btn-secondary flex items-center gap-2" id="btn-update-roadmap">
              <HiRefresh size={16} /> Update Roadmap
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">Career Path</p>
            <p className="text-lg font-display font-bold text-white">{roadmap.career_path}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">Stream</p>
            <p className="text-lg font-display font-bold text-white capitalize">{roadmap.recommended_stream}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">AI Confidence</p>
            <p className="text-lg font-display font-bold gradient-text">{roadmap.confidence_score}%</p>
          </div>
          <div className="glass-card p-5 flex justify-center">
            <FutureProofScore score={roadmap.future_proof_score} size="sm" />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestones — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <MilestoneTracker milestones={roadmap.milestones} />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Future-Proof Score */}
            <div className="glass-card p-6 text-center">
              <h3 className="font-display font-bold text-white mb-4">Future-Proof Score</h3>
              <FutureProofScore score={roadmap.future_proof_score} size="lg" />
            </div>

            {/* Alternative Careers */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiChartBar className="text-primary-400" /> Alternative Careers
              </h3>
              <div className="space-y-2">
                {roadmap.alternative_careers.map((career) => (
                  <div
                    key={career}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all cursor-pointer"
                  >
                    <span className="text-sm text-surface-300">{career}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiAcademicCap className="text-primary-400" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/colleges"
                  className="block p-3 rounded-xl bg-primary-600/10 border border-primary-500/20 text-sm text-primary-300 hover:bg-primary-600/20 transition-all text-center"
                >
                  View Matched Colleges →
                </Link>
                <Link
                  to="/simulation"
                  className="block p-3 rounded-xl bg-accent-600/10 border border-accent-500/20 text-sm text-accent-300 hover:bg-accent-600/20 transition-all text-center"
                >
                  Simulate This Career →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Roadmap;
