import { motion } from 'framer-motion';
import { HiClipboardList, HiTrendingUp, HiMap, HiAcademicCap } from 'react-icons/hi';
import MilestoneTracker from '../components/dashboard/MilestoneTracker';
import ProgressChart from '../components/dashboard/ProgressChart';
import FutureProofScore from '../components/career/FutureProofScore';

const demoMilestones = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, week_number: i + 1,
  title: `Week ${i + 1} Milestone`,
  description: `Complete tasks for week ${i + 1} of your career roadmap.`,
  category: i < 4 ? 'learning' : i < 8 ? 'project' : 'networking',
  priority: i < 4 ? 'high' : 'medium',
  estimated_hours: 8 + Math.floor(Math.random() * 5),
  is_completed: i < 5,
}));

function Dashboard() {
  const completed = demoMilestones.filter(m => m.is_completed).length;
  const total = demoMilestones.length;

  const stats = [
    { icon: <HiClipboardList size={20} />, label: 'Milestones Done', value: `${completed}/${total}`, color: '#6366f1' },
    { icon: <HiTrendingUp size={20} />, label: 'Progress', value: `${Math.round((completed / total) * 100)}%`, color: '#22c55e' },
    { icon: <HiMap size={20} />, label: 'Career Path', value: 'Software Eng.', color: '#d946ef' },
    { icon: <HiAcademicCap size={20} />, label: 'Matched Colleges', value: '10', color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16" id="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            Welcome back, <span className="gradient-text">Student</span> 👋
          </h1>
          <p className="text-surface-400">Here's your career journey overview.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
              <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
              <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <ProgressChart milestones={demoMilestones} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="font-display font-bold text-white mb-6">Your Career Score</h3>
            <FutureProofScore score={78} size="lg" />
            <p className="text-xs text-surface-500 mt-4 text-center">Based on automation risk, market demand, and salary growth</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
          <MilestoneTracker milestones={demoMilestones} />
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
