import { motion } from 'framer-motion';
import { HiUserGroup, HiLink, HiChartBar } from 'react-icons/hi';

function ParentDashboard() {
  const demoData = {
    linked: true,
    student: { name: 'John Doe', email: 'john@example.com' },
    roadmap: {
      title: 'Path to Software Engineering',
      career_path: 'Software Engineer',
      confidence_score: 85,
      progress: '5/12',
      progress_percent: 41.7,
    },
  };

  return (
    <div className="min-h-screen pt-24 pb-16" id="parent-dashboard-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HiUserGroup className="text-primary-400" size={20} />
            <span className="text-sm text-primary-400 font-medium">Family Compass Mode</span>
          </div>
          <h1 className="section-heading">
            Parent <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="section-subheading">Track and support your child's career journey.</p>
        </motion.div>

        {demoData.linked ? (
          <div className="space-y-6">
            {/* Student Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiLink className="text-primary-400" /> Linked Student
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-xl font-display font-bold text-primary-300">
                  {demoData.student.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{demoData.student.name}</p>
                  <p className="text-sm text-surface-400">{demoData.student.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Career Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiChartBar className="text-primary-400" /> Career Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { label: 'Career Path', value: demoData.roadmap.career_path },
                    { label: 'Roadmap', value: demoData.roadmap.title },
                    { label: 'AI Confidence', value: `${demoData.roadmap.confidence_score}%` },
                    { label: 'Milestones', value: demoData.roadmap.progress },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-surface-400">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#6366f1" strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={`${demoData.roadmap.progress_percent * 2.51} 251`}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white">{Math.round(demoData.roadmap.progress_percent)}%</span>
                      <span className="text-xs text-surface-500">Complete</span>
                    </div>
                  </div>
                  <p className="text-sm text-surface-400 mt-3">Overall Progress</p>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4">💡 Tips for Parents</h3>
              <ul className="space-y-3">
                {[
                  'Encourage your child to complete their weekly milestones on time',
                  'Discuss the matched colleges and shortlist together',
                  'Support exploration through career simulations — let them try before they choose',
                  'The roadmap updates every 6 months — check back regularly for new insights',
                ].map((tip, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">✓</span> {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center">
            <HiLink className="mx-auto text-surface-600 mb-4" size={48} />
            <h3 className="text-xl font-display font-bold text-white mb-2">No Student Linked</h3>
            <p className="text-surface-400 mb-6">Link your account to your child's student account to start tracking their career journey.</p>
            <button className="btn-primary" id="btn-link-student">Link Student Account</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ParentDashboard;
