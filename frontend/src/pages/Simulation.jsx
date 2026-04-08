import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiPlay, HiClock, HiCurrencyRupee } from 'react-icons/hi';
import Button from '../components/common/Button';
import CareerCard from '../components/career/CareerCard';

const demoCareers = [
  { id: 1, title: 'Software Engineer', slug: 'software-engineer', description: 'Design, develop, and maintain software applications and systems.', stream: 'science', category: 'Technology', average_salary_entry: 600000, growth_rate: 15, demand_level: 'high', work_environment: 'hybrid', icon: '💻' },
  { id: 2, title: 'Data Scientist', slug: 'data-scientist', description: 'Analyze complex data to help organizations make better decisions.', stream: 'science', category: 'Technology', average_salary_entry: 700000, growth_rate: 20, demand_level: 'high', work_environment: 'hybrid', icon: '📊' },
  { id: 3, title: 'UX Designer', slug: 'ux-designer', description: 'Design user experiences for digital products and platforms.', stream: 'arts', category: 'Design', average_salary_entry: 500000, growth_rate: 18, demand_level: 'high', work_environment: 'hybrid', icon: '🎨' },
  { id: 4, title: 'Product Manager', slug: 'product-manager', description: 'Lead product development from ideation through launch.', stream: 'commerce', category: 'Technology', average_salary_entry: 800000, growth_rate: 16, demand_level: 'high', work_environment: 'hybrid', icon: '🚀' },
  { id: 5, title: 'Cybersecurity Analyst', slug: 'cybersecurity-analyst', description: 'Protect organizations from cyber threats and attacks.', stream: 'science', category: 'Technology', average_salary_entry: 600000, growth_rate: 22, demand_level: 'high', work_environment: 'hybrid', icon: '🛡️' },
  { id: 6, title: 'Chartered Accountant', slug: 'chartered-accountant', description: 'Manage financial records, auditing, and tax compliance.', stream: 'commerce', category: 'Finance', average_salary_entry: 700000, growth_rate: 10, demand_level: 'high', work_environment: 'office', icon: '📋' },
];

const demoSimulation = {
  career_title: 'Software Engineer',
  simulation: `You wake up at 8 AM and check your phone for any critical alerts from last night's deployment. After a quick breakfast, you open your laptop and join the morning standup at 9:15 AM — a 15-minute call where your team of 6 shares what they worked on yesterday and plans for today.

Your task for the morning is fixing a tricky bug in the payment processing module. You dive into the codebase, set breakpoints, and trace the issue through multiple service layers. By 11 AM, you've identified the root cause — a race condition in the database connection pool.

After lunch with a colleague (you discuss a new AI feature idea), you spend the afternoon in a design review meeting, reviewing architecture diagrams for a new microservice. You provide feedback on API design and suggest a more efficient data flow pattern.

The last hour of your day is "learning time" — a company policy that lets engineers explore new technologies. Today, you're experimenting with Rust for a side project. You push your bug fix through code review, get two approvals, and merge it to staging.

By 6 PM, you're done — feeling productive and challenged. This is what makes software engineering rewarding: every day brings a new puzzle to solve.`,
  daily_tasks: [
    'Morning standup meeting (15 min)',
    'Code review and bug fixing',
    'Architecture design discussions',
    'Feature development and testing',
    'Learning and experimentation',
  ],
  challenges: [
    'Debugging complex distributed systems',
    'Meeting tight sprint deadlines',
    'Keeping up with rapidly evolving technologies',
  ],
  rewards: [
    'Solving complex technical problems',
    'Building products used by millions',
    'Continuous learning and growth',
  ],
  typical_salary: 1500000,
};

function Simulation() {
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);

  const handleSimulate = (career) => {
    setSelectedCareer(career);
    setIsSimulating(true);
    setTimeout(() => {
      setSimulation(demoSimulation);
      setIsSimulating(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16" id="simulation-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <HiEye className="text-accent-400" size={20} />
            <span className="text-sm text-accent-400 font-medium">AI Career Simulation</span>
          </div>
          <h1 className="section-heading">
            Shadow Any <span className="gradient-text">Profession</span>
          </h1>
          <p className="section-subheading">
            Experience a day in the life of any career through AI-powered simulations before making your choice.
          </p>
        </motion.div>

        {/* Career Grid or Simulation */}
        <AnimatePresence mode="wait">
          {!simulation ? (
            <motion.div
              key="careers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-surface-400 mb-6">Select a career to simulate:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoCareers.map((career, i) => (
                  <CareerCard
                    key={career.id}
                    career={career}
                    onClick={handleSimulate}
                    index={i}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Back button */}
              <button
                onClick={() => { setSimulation(null); setSelectedCareer(null); }}
                className="text-sm text-surface-400 hover:text-white transition-colors"
              >
                ← Back to careers
              </button>

              {/* Simulation Header */}
              <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{selectedCareer?.icon}</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">
                      A Day as a {simulation.career_title}
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-surface-400 flex items-center gap-1">
                        <HiClock size={14} /> Full day simulation
                      </span>
                      <span className="text-sm text-surface-400 flex items-center gap-1">
                        <HiCurrencyRupee size={14} /> ₹{(simulation.typical_salary / 100000).toFixed(1)} LPA avg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Narrative */}
                <div className="prose prose-invert max-w-none">
                  {simulation.simulation.split('\n\n').map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-surface-300 leading-relaxed mb-4"
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-white mb-4">📋 Daily Tasks</h3>
                  <ul className="space-y-2">
                    {simulation.daily_tasks.map((task, i) => (
                      <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5">•</span> {task}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-white mb-4">⚡ Challenges</h3>
                  <ul className="space-y-2">
                    {simulation.challenges.map((c, i) => (
                      <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display font-bold text-white mb-4">🏆 Rewards</h3>
                  <ul className="space-y-2">
                    {simulation.rewards.map((r, i) => (
                      <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulating Overlay */}
        <AnimatePresence>
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-950/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                {selectedCareer?.icon || '🔮'}
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                Simulating: {selectedCareer?.title}
              </h3>
              <p className="text-surface-400">Building your immersive career experience...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Simulation;
