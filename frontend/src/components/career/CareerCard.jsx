import { motion } from 'framer-motion';
import { HiTrendingUp, HiBriefcase, HiCurrencyRupee } from 'react-icons/hi';
import { formatSalary } from '../../utils/helpers';

function CareerCard({ career, onClick, index = 0, matchScore, aiPredictOrder, onViewDetails }) {
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
      onClick={() => {
        if (onViewDetails) {
          onViewDetails(career);
        } else {
          onClick?.(career);
        }
      }}
      className="glass-card-hover cursor-pointer p-6 group"
      id={`career-card-${career.id || index}`}
    >
      {/* Match Score Badge */}
      {(matchScore || aiPredictOrder) && (
        <div className="flex justify-between items-center mb-3">
          {aiPredictOrder ? (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              AI Predict #{aiPredictOrder}
            </div>
          ) : (
            <div />
          )}
          {matchScore && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: matchScore >= 80 ? 'rgba(34,197,94,0.15)' : matchScore >= 60 ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                color: matchScore >= 80 ? '#4ade80' : matchScore >= 60 ? '#818cf8' : '#fbbf24',
                border: `1px solid ${matchScore >= 80 ? 'rgba(34,197,94,0.3)' : matchScore >= 60 ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`,
              }}>
              {matchScore.toFixed(0)}% Fit
            </div>
          )}
        </div>
      )}
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
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(career);
          }}
          className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer transition-colors"
        >
          View Details →
        </span>
      </div>
    </motion.div>
  );
}

export default CareerCard;
