import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEye, HiPlay, HiClock, HiCurrencyRupee } from 'react-icons/hi';
import Button from '../components/common/Button';
import CareerCard from '../components/career/CareerCard';

function Simulation() {
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  // Fetch available careers from API
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/careers`);
        if (response.ok) {
          const data = await response.json();
          setCareers(data.careers || data);
          setError(null);
        } else {
          setError('Failed to load careers from the server.');
        }
      } catch (err) {
        console.error('Error fetching careers:', err);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, [baseUrl]);

  // Fetch specific career simulation from API
  const handleSimulate = async (career) => {
    setSelectedCareer(career);
    setIsSimulating(true);
    try {
      const response = await fetch(`${baseUrl}/careers/${career.id}/simulation`);
      if (response.ok) {
        const data = await response.json();
        
        // Simulate a slight delay for a dramatic "AI Generating" visual effect
        setTimeout(() => {
          setSimulation(data);
          setIsSimulating(false);
        }, 1500);
      } else {
        setIsSimulating(false);
        alert("Simulation data is not available for this career yet.");
      }
    } catch (err) {
      console.error('Error fetching simulation:', err);
      setIsSimulating(false);
      alert("An error occurred while launching the simulation.");
    }
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
              {loading && (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block"
                  >
                    <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-400 rounded-full"></div>
                  </motion.div>
                  <p className="text-surface-400 mt-4">Loading simulation catalog...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-16 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-lg">⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  <p className="text-sm text-surface-400 mb-6">Select a career to simulate:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {careers.map((career, i) => (
                      <CareerCard
                        key={career.id}
                        career={career}
                        onClick={handleSimulate}
                        index={i}
                      />
                    ))}
                  </div>
                </>
              )}
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
