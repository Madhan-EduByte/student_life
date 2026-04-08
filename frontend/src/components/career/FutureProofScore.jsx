import { motion } from 'framer-motion';

function FutureProofScore({ score, size = 'md', showLabel = true }) {
  const radius = size === 'lg' ? 60 : size === 'md' ? 45 : 30;
  const strokeWidth = size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = ((score || 0) / 100) * circumference;

  const getColor = (value) => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#6366f1';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Moderate';
    return 'At Risk';
  };

  const color = getColor(score);
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display font-bold text-white"
            style={{ fontSize: size === 'lg' ? '1.5rem' : size === 'md' ? '1.125rem' : '0.875rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score || 0}
          </motion.span>
          {size !== 'sm' && (
            <span className="text-xs text-surface-500">/100</span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-medium" style={{ color }}>
            {getLabel(score)}
          </p>
          <p className="text-xs text-surface-500">Future-Proof Score</p>
        </div>
      )}
    </div>
  );
}

export default FutureProofScore;
