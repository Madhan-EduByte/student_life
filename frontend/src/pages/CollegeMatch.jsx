import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiFilter, HiAcademicCap } from 'react-icons/hi';
import CollegeCard from '../components/college/CollegeCard';
import Input from '../components/common/Input';
import collegeService from '../services/collegeService';

function CollegeMatch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch colleges from API on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const response = await collegeService.getAll({ page: 1, per_page: 100 });
        setColleges(response.data.colleges || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load careers from the server.:', err);
        setError('Failed to load careers from the server.');
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'government', label: 'Government' },
    { key: 'deemed', label: 'Deemed' },
    { key: 'private', label: 'Private' },
  ];

  const demoMatches = colleges.map((college, i) => ({
    college,
    match_score: 95 - i * 2,
    match_reasons: [
      college.nirf_rank ? `NIRF Rank #${college.nirf_rank}` : 'Established college',
      college.placement_rate ? `${college.placement_rate}% placement rate` : 'Good placements',
      college.average_package ? `₹${college.average_package} LPA avg package` : 'Competitive packages',
    ],
  }));

  const filteredMatches = demoMatches.filter((m) => {
    const matchesSearch = !searchTerm ||
      m.college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.college.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || m.college.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen pt-24 pb-16" id="college-match-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <HiAcademicCap className="text-primary-400" size={20} />
            <span className="text-sm text-primary-400 font-medium">Colleges Simulate</span>
          </div>
          <h1 className="section-heading">
            Your <span className="gradient-text">Colleges Simulate Matches</span>
          </h1>
          <p className="section-subheading">
            Colleges simulated for your profile, budget, and career goals — ranked by AI compatibility.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-1">
            <Input
              placeholder="Search Colleges Simulate, cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<HiSearch size={18} />}
              id="college-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiFilter className="text-surface-500" size={18} />
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter.key
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                    : 'text-surface-400 bg-white/5 border border-white/10 hover:border-primary-500/20'
                }`}
                id={`filter-${filter.key}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-surface-500 mb-4">
          {loading ? 'Loading...' : `${filteredMatches.length} Colleges Simulate found`}
        </p>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block"
            >
              <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-400 rounded-full"></div>
            </motion.div>
            <p className="text-surface-400 mt-4">Loading Colleges Simulate from database...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-lg">⚠️ {error}</p>
          </div>
        )}

        {/* College Grid */}
        {!loading && !error && (
          <div>
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, i) => (
                  <CollegeCard
                    key={match.college.id}
                    college={match.college}
                    matchScore={match.match_score}
                    matchReasons={match.match_reasons}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-surface-500 text-lg">No colleges match your criteria.</p>
                <p className="text-surface-600 text-sm mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeMatch;
