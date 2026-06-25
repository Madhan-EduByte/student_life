import { motion } from 'framer-motion';
import { HiLocationMarker, HiAcademicCap, HiStar, HiCurrencyRupee } from 'react-icons/hi';

function CollegeCard({ college, matchScore, matchReasons, onClick, index = 0, aiPredictOrder, onViewDetails }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={() => {
        if (onViewDetails) {
          onViewDetails(college);
        } else {
          onClick?.(college);
        }
      }}
      className="glass-card-hover cursor-pointer p-6 group"
      id={`college-card-${college.id || index}`}
    >
      {/* Match Score Badge */}
      <div className="flex justify-between items-center mb-3">
        {aiPredictOrder ? (
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
            AI Predict #{aiPredictOrder}
          </div>
        ) : (
          <div />
        )}
        {matchScore && (
          <div className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: matchScore >= 80 ? 'rgba(34,197,94,0.15)' : matchScore >= 60 ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
              color: matchScore >= 80 ? '#4ade80' : matchScore >= 60 ? '#818cf8' : '#fbbf24',
              border: `1px solid ${matchScore >= 80 ? 'rgba(34,197,94,0.3)' : matchScore >= 60 ? 'rgba(99,102,241,0.3)' : 'rgba(245,158,11,0.3)'}`,
            }}>
            {matchScore.toFixed(0)}% Match
          </div>
        )}
      </div>

      {/* College Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-xl font-display font-bold text-primary-300 flex-shrink-0">
          {college.name?.[0] || 'C'}
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-bold text-white group-hover:text-primary-300 transition-colors truncate">
            {college.name}
          </h3>
          <p className="text-sm text-surface-400 truncate">{college.university}</p>
          <div className="flex items-center gap-1 mt-1">
            <HiLocationMarker className="text-surface-500 flex-shrink-0" size={14} />
            <span className="text-xs text-surface-500">
              {college.city}, {college.state}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {college.nirf_rank && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <HiStar className="text-yellow-400" size={14} />
            <div>
              <p className="text-[10px] text-surface-500">NIRF Rank</p>
              <p className="text-xs font-bold text-white">#{college.nirf_rank}</p>
            </div>
          </div>
        )}
        {college.placement_rate && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <HiAcademicCap className="text-green-400" size={14} />
            <div>
              <p className="text-[10px] text-surface-500">Placement</p>
              <p className="text-xs font-bold text-white">{college.placement_rate}%</p>
            </div>
          </div>
        )}
        {college.average_package && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <HiCurrencyRupee className="text-primary-400" size={14} />
            <div>
              <p className="text-[10px] text-surface-500">Avg Package</p>
              <p className="text-xs font-bold text-white">₹{college.average_package} LPA</p>
            </div>
          </div>
        )}
        {college.accreditation && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
            <span className="text-xs">🏅</span>
            <div>
              <p className="text-[10px] text-surface-500">Accredited</p>
              <p className="text-xs font-bold text-white truncate max-w-[80px]">{college.accreditation}</p>
            </div>
          </div>
        )}
        {(college.fee_range_min || college.fee_range_max) && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 col-span-2">
            <span className="text-xs">💰</span>
            <div>
              <p className="text-[10px] text-surface-500">Admission Fee Range</p>
              <p className="text-xs font-bold text-white">
                ₹{college.fee_range_min?.toLocaleString()} - ₹{college.fee_range_max?.toLocaleString()} / yr
              </p>
            </div>
          </div>
        )}
        {(college.phone || college.email) && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 col-span-2">
            <span className="text-xs">📞</span>
            <div className="min-w-0">
              <p className="text-[10px] text-surface-500">Contact Details</p>
              <p className="text-xs font-bold text-white truncate max-w-[240px]">
                {college.phone || college.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Course */}
      {college.recommended_courses && college.recommended_courses.length > 0 && (
        <div className="mb-4 bg-white/2 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-surface-400 font-semibold mb-2 flex items-center gap-1.5">
            <span className="text-primary-400">🎓</span> Predicted Course:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {college.recommended_courses.slice(0, 1).map((course, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg text-[10px] bg-primary-600/10 text-primary-300 border border-primary-500/20 font-semibold"
              >
                {course}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match Reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="space-y-1 mb-2">
          {matchReasons.slice(0, 2).map((reason, i) => (
            <p key={i} className="text-xs text-surface-400 flex items-center gap-1">
              <span className="text-green-400">✓</span> {reason}
            </p>
          ))}
        </div>
      )}

      {/* Type Badge */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-surface-500 capitalize">
          {college.type} institution
        </span>
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(college);
          }}
          className="text-xs text-primary-400 hover:text-primary-300 cursor-pointer transition-colors"
        >
          View Details →
        </span>
      </div>
    </motion.div>
  );
}

export default CollegeCard;
