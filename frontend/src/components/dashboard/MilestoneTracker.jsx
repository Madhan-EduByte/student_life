import { motion } from 'framer-motion';
import { HiCheck, HiClock } from 'react-icons/hi';
import { MILESTONE_CATEGORIES } from '../../constants';

function MilestoneTracker({ milestones = [], onToggle }) {
  const completed = milestones.filter((m) => m.is_completed).length;
  const total = milestones.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="glass-card p-6" id="milestone-tracker">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-white text-lg">Weekly Milestones</h3>
          <p className="text-sm text-surface-400">
            {completed} of {total} completed
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold gradient-text">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #d946ef)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Milestone List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {milestones.map((milestone, index) => {
          const category = MILESTONE_CATEGORIES[milestone.category] || MILESTONE_CATEGORIES.learning;
          return (
            <motion.div
              key={milestone.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                milestone.is_completed
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-white/5 border border-white/5 hover:border-primary-500/20'
              }`}
              onClick={() => onToggle?.(milestone.id, !milestone.is_completed)}
              id={`milestone-${milestone.id || index}`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  milestone.is_completed
                    ? 'bg-green-500 text-white'
                    : 'border-2 border-surface-600 group-hover:border-primary-500'
                }`}
              >
                {milestone.is_completed && <HiCheck size={14} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{category.icon}</span>
                  <h4
                    className={`text-sm font-medium ${
                      milestone.is_completed ? 'text-surface-400 line-through' : 'text-white'
                    }`}
                  >
                    {milestone.title}
                  </h4>
                </div>
                {milestone.description && (
                  <p className="text-xs text-surface-500 line-clamp-2">{milestone.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${category.color}20`,
                      color: category.color,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    {category.label}
                  </span>
                  {milestone.estimated_hours && (
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <HiClock size={12} /> {milestone.estimated_hours}h
                    </span>
                  )}
                  <span className="text-xs text-surface-600">Week {milestone.week_number}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {total === 0 && (
        <div className="text-center py-8">
          <p className="text-surface-500 text-sm">No milestones yet. Generate a roadmap first!</p>
        </div>
      )}
    </div>
  );
}

export default MilestoneTracker;
