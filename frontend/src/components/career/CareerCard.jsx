import { motion } from 'framer-motion';
import { HiTrendingUp, HiBriefcase, HiCurrencyRupee } from 'react-icons/hi';
import { formatSalary } from '../../utils/helpers';

function CareerCard({ career, onClick, index = 0 }) {
  const demandColors = {
    high: 'badge-success',
    medium: 'badge-warning',
    low: 'badge-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick?.(career)}
      className="glass-card-hover cursor-pointer p-6 group"
      id={`career-card-${career.id || index}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-2xl">
            {career.icon || '💼'}
          </div>
          <div>
            <h3 className="font-display font-bold text-white group-hover:text-primary-300 transition-colors">
              {career.title}
            </h3>
            <p className="text-xs text-surface-500">{career.category}</p>
          </div>
        </div>
        <span className={demandColors[career.demand_level] || 'badge-primary'}>
          {career.demand_level || 'N/A'}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-surface-400 mb-4 line-clamp-2">
        {career.description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <HiCurrencyRupee className="mx-auto text-primary-400 mb-1" size={16} />
          <p className="text-xs text-surface-400">Entry</p>
          <p className="text-sm font-semibold text-white">{formatSalary(career.average_salary_entry)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <HiTrendingUp className="mx-auto text-green-400 mb-1" size={16} />
          <p className="text-xs text-surface-400">Growth</p>
          <p className="text-sm font-semibold text-white">{career.growth_rate || 0}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <HiBriefcase className="mx-auto text-accent-400 mb-1" size={16} />
          <p className="text-xs text-surface-400">Type</p>
          <p className="text-sm font-semibold text-white capitalize">{career.work_environment || '—'}</p>
        </div>
      </div>

      {/* Stream Badge */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-surface-500 capitalize">
          {career.stream} stream
        </span>
        <span className="text-xs text-primary-400 group-hover:text-primary-300 transition-colors">
          View Details →
        </span>
      </div>
    </motion.div>
  );
}

export default CareerCard;
