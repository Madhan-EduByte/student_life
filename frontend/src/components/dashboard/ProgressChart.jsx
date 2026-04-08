import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ProgressChart({ milestones = [] }) {
  // Build weekly progress data
  const weeklyData = [];
  let cumulativeCompleted = 0;

  const maxWeek = Math.max(...milestones.map((m) => m.week_number || 0), 12);

  for (let week = 1; week <= maxWeek; week++) {
    const weekMilestones = milestones.filter((m) => m.week_number === week);
    const weekCompleted = weekMilestones.filter((m) => m.is_completed).length;
    cumulativeCompleted += weekCompleted;

    weeklyData.push({
      week: `W${week}`,
      completed: cumulativeCompleted,
      total: milestones.filter((m) => m.week_number <= week).length,
      target: week * (milestones.length / maxWeek),
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card p-3 text-sm">
        <p className="text-white font-semibold">{label}</p>
        <p className="text-primary-400">Completed: {payload[0]?.value}</p>
        <p className="text-surface-400">Total: {payload[1]?.value}</p>
      </div>
    );
  };

  return (
    <div className="glass-card p-6" id="progress-chart">
      <h3 className="font-display font-bold text-white text-lg mb-6">Progress Overview</h3>

      {milestones.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#colorCompleted)"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#d946ef"
              strokeWidth={1}
              strokeDasharray="5 5"
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-48 text-surface-500 text-sm">
          No progress data yet. Complete milestones to see your chart!
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-xs text-surface-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-500 opacity-50" />
          <span className="text-xs text-surface-400">Target</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressChart;
