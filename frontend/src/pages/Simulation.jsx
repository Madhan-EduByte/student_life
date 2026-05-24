import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { HiEye, HiPlay, HiClock, HiCurrencyRupee, HiFilter, HiSortAscending, HiChevronLeft, HiChevronRight, HiSparkles, HiSearch } from 'react-icons/hi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import CareerProfileForm from '../components/common/CareerProfileForm';
import CareerCard from '../components/career/CareerCard';
import Input from '../components/common/Input';
import useAuthStore from '../store/authStore';

function Simulation() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken || state.access_token);

  // Admin Guard Redirect
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [selectedCareer, setSelectedCareer] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [matches, setMatches] = useState([]);
  const [aiActive, setAiActive] = useState(false);
  const [aiModel, setAiModel] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match_score'); // 'match_score', 'salary', 'growth_rate', 'title'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(!token);
  const [profileAnswered, setProfileAnswered] = useState(!!token);
  const [careerProfile, setCareerProfile] = useState({
    interests: [],
    strengths: [],
    industry_stream: '',
    education_level: '',
    budget: '',
    location: '',
    work_life_balance: '',
    risk_tolerance: '',
    interaction_style: '',
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  // Fetch matched careers from API
  const fetchCareers = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Build query string based on profile answers
      const params = new URLSearchParams();
      if (careerProfile.interests && careerProfile.interests.length > 0) {
        params.append('interests', careerProfile.interests.join(','));
      }
      if (careerProfile.strengths && careerProfile.strengths.length > 0) {
        params.append('strengths', careerProfile.strengths.join(','));
      }
      if (careerProfile.industry_stream) {
        params.append('stream', careerProfile.industry_stream);
      }

      const response = await fetch(`${baseUrl}/careers/match?${params.toString()}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setAiActive(data.ai_active || false);
        setAiModel(data.ai_model || null);
        setError(null);
      } else {
        setError('Failed to load careers from the server.');
      }
    } catch (err) {
      console.error('Error fetching matched careers:', err);
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileAnswered) {
      fetchCareers();
    }
  }, [profileAnswered, token]);

  // Reset page when sorting/filtering changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortBy]);

  const handleCareerProfileChange = (field, value) => {
    setCareerProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateProfile = () => {
    if (!careerProfile.interests || careerProfile.interests.length === 0) {
      alert('Please select at least one interest area');
      return false;
    }
    if (!careerProfile.strengths || careerProfile.strengths.length === 0) {
      alert('Please select at least one strength');
      return false;
    }
    if (!careerProfile.industry_stream) {
      alert('Please select an industry/stream');
      return false;
    }
    if (!careerProfile.education_level) {
      alert('Please select an education level');
      return false;
    }
    if (!careerProfile.budget) {
      alert('Please select a budget range');
      return false;
    }
    if (!careerProfile.location) {
      alert('Please select a location preference');
      return false;
    }
    return true;
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) return;
    setProfileAnswered(true);
    setShowProfileModal(false);
  };

  const handleSkipProfile = () => {
    setProfileAnswered(true);
    setShowProfileModal(false);
  };

  // Fetch specific career simulation from API
  const handleSimulate = async (career) => {
    setSelectedCareer(career);
    setIsSimulating(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${baseUrl}/careers/simulate/${career.id}`, { headers });
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

  const filters = [
    { key: 'all', label: 'All Streams' },
    { key: 'science', label: 'Science' },
    { key: 'commerce', label: 'Commerce' },
    { key: 'arts', label: 'Arts' },
    { key: 'vocational', label: 'Vocational' },
  ];

  // Filtering by Stream & Search Term
  const filteredMatches = matches.filter((m) => {
    const titleMatch = m.career.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = m.career.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = m.career.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm || titleMatch || descMatch || catMatch;

    const matchesFilter = activeFilter === 'all' || m.career.stream?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Sorting
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'match_score') {
      return b.match_score - a.match_score;
    }
    if (sortBy === 'salary') {
      return (b.career.average_salary_entry ?? 0) - (a.career.average_salary_entry ?? 0);
    }
    if (sortBy === 'growth_rate') {
      return (b.career.growth_rate ?? 0) - (a.career.growth_rate ?? 0);
    }
    if (sortBy === 'title') {
      return a.career.title.localeCompare(b.career.title);
    }
    return 0;
  });

  // Pagination (9 per page)
  const cardsPerPage = 9;
  const totalPages = Math.ceil(sortedMatches.length / cardsPerPage) || 1;
  const paginatedMatches = sortedMatches.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-2">
              <HiEye className="text-accent-400" size={20} />
              <span className="text-sm text-accent-400 font-medium">AI Career Simulation</span>
            </div>
            
            {/* AI Active Indicator */}
            {profileAnswered && !loading && (
              aiActive ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <HiSparkles className="animate-pulse" /> Active AI Predictor: <span className="uppercase font-bold">{aiModel}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-800 text-surface-400 border border-white/5">
                  Rule-Based Recommendation Active
                </span>
              )
            )}
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
              {/* Filters & Sort options */}
              {profileAnswered && !loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col lg:flex-row gap-4 mb-8"
                >
                  {/* Search Bar */}
                  <div className="flex-1 w-full lg:w-auto">
                    <Input
                      placeholder="Search Career Simulation, titles, category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<HiSearch size={18} />}
                      id="career-search"
                    />
                  </div>

                  {/* Filters & Sort options */}
                  <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Stream Filter Buttons */}
                    <div className="flex flex-wrap gap-2 items-center bg-white/5 border border-white/10 p-1 rounded-xl">
                      <HiFilter className="text-surface-500 ml-2 mr-1" size={16} />
                      {filters.map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => setActiveFilter(filter.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeFilter === filter.key
                              ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                              : 'text-surface-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                          id={`filter-${filter.key}`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                      <HiSortAscending className="text-surface-400" size={16} />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent text-xs text-white outline-none border-none cursor-pointer pr-4 font-semibold"
                        id="career-sort"
                      >
                        <option value="match_score" className="bg-surface-950 text-white">Sort by Match Score</option>
                        <option value="salary" className="bg-surface-950 text-white">Sort by Entry Salary</option>
                        <option value="growth_rate" className="bg-surface-950 text-white">Sort by Growth Rate</option>
                        <option value="title" className="bg-surface-950 text-white">Sort by Job Title</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {loading && (
                <div className="text-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block"
                  >
                    <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-400 rounded-full"></div>
                  </motion.div>
                  <p className="text-surface-400 mt-4 animate-pulse">Loading simulation catalog...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-16 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-lg">⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && profileAnswered && (
                <>
                  <p className="text-sm text-surface-400 mb-6">
                    Select a career to simulate ({sortedMatches.length} recommended options found):
                  </p>
                  
                  {paginatedMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {paginatedMatches.map((match, i) => (
                        <CareerCard
                          key={match.career.id}
                          career={match.career}
                          matchScore={match.match_score}
                          aiPredictOrder={match.ai_predict_order}
                          onClick={handleSimulate}
                          index={i}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <p className="text-surface-500 text-lg">No careers match your criteria.</p>
                      <p className="text-surface-600 text-sm mt-2">Try adjusting your stream filters or answers.</p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          currentPage === 1
                            ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                            : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white'
                        }`}
                      >
                        <HiChevronLeft size={16} />
                      </button>
                      
                      <span className="text-xs text-surface-400 font-semibold font-mono">
                        Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                      </span>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          currentPage === totalPages
                            ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                            : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white'
                        }`}
                      >
                        <HiChevronRight size={16} />
                      </button>
                    </div>
                  )}
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
                className="text-sm text-surface-400 hover:text-white transition-colors flex items-center gap-1"
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
              <p className="text-surface-400 animate-pulse">Building your immersive career experience...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Career Profile Modal for Non-Authenticated Users */}
      <Modal
        isOpen={showProfileModal}
        onClose={handleSkipProfile}
        title="Your Career Profile (AI Inputs)"
        size="xl"
      >
        <CareerProfileForm formData={careerProfile} onChange={handleCareerProfileChange} showOptional={true} />

        {/* Modal Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleSkipProfile}
          >
            Skip for Now
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSaveProfile}
          >
            Get Started
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Simulation;
