import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { HiSearch, HiFilter, HiAcademicCap, HiSortAscending, HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight, HiSparkles } from 'react-icons/hi';
import CollegeCard from '../components/college/CollegeCard';
import Input from '../components/common/Input';
import collegeService from '../services/collegeService';
import useAuthStore from '../store/authStore';

function CollegeMatch() {
  const user = useAuthStore((state) => state.user);
  
  // Admin Guard Redirect
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [matches, setMatches] = useState([]);
  const [aiActive, setAiActive] = useState(false);
  const [aiModel, setAiModel] = useState(null);
  const [sortBy, setSortBy] = useState('match_score'); // 'match_score', 'nirf_rank', 'placement_rate', 'fee_max'
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const token = useAuthStore((state) => state.accessToken || state.access_token);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  // Fetch matched colleges from API on component mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // First, fetch student profile if authenticated
        let criteria = {};
        if (token) {
          try {
            const profRes = await fetch(`${baseUrl}/students/profile`, { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            if (profRes.ok) {
              const profData = await profRes.json();
              setProfile(profData);
              // Extract criteria from profile
              if (profData.location_preference || profData.budget_range || profData.preferred_stream) {
                criteria = {
                  location: profData.location_preference || '',
                  budget_range: profData.budget_range || '',
                  preferred_stream: profData.preferred_stream || ''
                };
              }
            }
          } catch (err) {
            console.error('Failed to fetch profile:', err);
          }
        }
        
        // Then fetch college matches with criteria
        const response = await collegeService.getMatches(criteria);
        // Backend now returns { matches: [...], ai_active: bool, ai_model: str }
        if (response.data && response.data.matches) {
          setMatches(response.data.matches);
          setAiActive(response.data.ai_active);
          setAiModel(response.data.ai_model);
        } else if (Array.isArray(response.data)) {
          // Fallback if previous schema is returned
          setMatches(response.data);
          setAiActive(false);
          setAiModel(null);
        } else {
          setMatches([]);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load colleges from the server:', err);
        setError('Failed to load college matches from the server.');
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token]);

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortBy]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters = [
    { key: 'all', label: 'All Types' },
    { key: 'government', label: 'Government' },
    { key: 'deemed', label: 'Deemed' },
    { key: 'private', label: 'Private' },
  ];

  // Search & Type Filtering
  const filteredMatches = matches.filter((m) => {
    const nameMatch = m.college.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = m.college.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm || nameMatch || cityMatch;

    const matchesFilter = activeFilter === 'all' || m.college.type?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Sorting
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'match_score') {
      return b.match_score - a.match_score;
    }
    if (sortBy === 'nirf_rank') {
      const rankA = a.college.nirf_rank ?? 9999;
      const rankB = b.college.nirf_rank ?? 9999;
      return rankA - rankB;
    }
    if (sortBy === 'placement_rate') {
      return (b.college.placement_rate ?? 0) - (a.college.placement_rate ?? 0);
    }
    if (sortBy === 'fee_max') {
      const feeA = a.college.fee_range_max ?? 9999999;
      const feeB = b.college.fee_range_max ?? 9999999;
      return feeA - feeB;
    }
    return 0;
  });

  // Pagination Parameters (9 per page)
  const cardsPerPage = 9;
  const totalPages = Math.ceil(sortedMatches.length / cardsPerPage) || 1;
  const paginatedMatches = sortedMatches.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  // Determine block-based page numbers (9 pages per block)
  const maxVisiblePages = 9;
  const currentBlock = Math.floor((currentPage - 1) / maxVisiblePages);
  const startPage = currentBlock * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen pt-24 pb-16" id="college-match-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div className="flex items-center gap-2">
              <HiAcademicCap className="text-primary-400" size={20} />
              <span className="text-sm text-primary-400 font-medium">Colleges Simulate Matches</span>
            </div>
            
            {/* AI Active Indicator */}
            {aiActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <HiSparkles className="animate-pulse" /> Active AI Engine: <span className="uppercase font-bold">{aiModel}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-800 text-surface-400 border border-white/5">
                Rule-Based Recommendation Active
              </span>
            )}
          </div>
          <h1 className="section-heading">
            Your <span className="gradient-text">Colleges Simulate Matches</span>
          </h1>
          <p className="section-subheading">
            Colleges simulated for your profile, budget, and career goals — ranked by compatibility.
          </p>
        </motion.div>

        {/* Search & Filters & Sort Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 mb-8"
        >
          {/* Search bar */}
          <div className="flex-1">
            <Input
              placeholder="Search Colleges Simulate, cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<HiSearch size={18} />}
              id="college-search"
            />
          </div>

          {/* Filters & Sort options */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Filters */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
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
                id="college-sort"
              >
                <option value="match_score" className="bg-surface-950 text-white">Sort by Match Score</option>
                <option value="nirf_rank" className="bg-surface-950 text-white">Sort by NIRF Rank</option>
                <option value="placement_rate" className="bg-surface-950 text-white">Sort by Placement Rate</option>
                <option value="fee_max" className="bg-surface-950 text-white">Sort by Fees (Low to High)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-surface-500 mb-6">
          {loading ? 'Loading...' : `${sortedMatches.length} Colleges Simulate found`}
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
            <p className="text-surface-400 mt-4 animate-pulse">Loading Colleges Simulate from matching engine...</p>
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
            {paginatedMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedMatches.map((match, i) => (
                  <CollegeCard
                    key={match.college.id}
                    college={match.college}
                    matchScore={match.match_score}
                    matchReasons={match.match_reasons}
                    aiPredictOrder={match.ai_predict_order}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-surface-500 text-lg">No colleges match your criteria.</p>
                <p className="text-surface-600 text-sm mt-2">Try adjusting your search, filters or sort parameters.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col justify-center items-center gap-4 mt-12 border-t border-white/5 pt-8 w-full">
                {/* Page details on their own separate line */}
                <div className="text-xs text-surface-400 font-semibold font-mono text-center">
                  Showing Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-surface-300 font-bold">{totalPages}</span> ({sortedMatches.length} total colleges)
                </div>
                
                {/* Button strip */}
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {/* Double Left Arrow (Skip 10 Pages) */}
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 10, 1))}
                    disabled={currentPage === 1}
                    className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      currentPage === 1
                        ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white hover:bg-white/10 active:scale-95'
                    }`}
                    title="Skip 10 Pages Back"
                  >
                    <HiChevronDoubleLeft size={16} />
                  </button>

                  {/* Previous Page Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      currentPage === 1
                        ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white hover:bg-white/10 active:scale-95'
                    }`}
                    title="Previous Page"
                  >
                    <HiChevronLeft size={16} />
                  </button>
                  
                  {/* Block Pagination Jump Prev (if startPage > 1) */}
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-xs font-bold font-mono text-surface-400 hover:text-white hover:border-white/20 active:scale-95 transition-all"
                      >
                        1
                      </button>
                      <span className="text-surface-600 text-xs px-1 select-none font-mono">...</span>
                    </>
                  )}

                  {/* Page Numbers Block */}
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg border text-xs font-bold font-mono transition-all active:scale-95 ${
                        currentPage === page
                          ? 'bg-primary-600/20 text-primary-300 border-primary-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-extrabold'
                          : 'border-white/10 bg-white/5 text-surface-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Block Pagination Jump Next (if endPage < totalPages) */}
                  {endPage < totalPages && (
                    <>
                      <span className="text-surface-600 text-xs px-1 select-none font-mono">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 text-xs font-bold font-mono text-surface-400 hover:text-white hover:border-white/20 active:scale-95 transition-all"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next Page Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      currentPage === totalPages
                        ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white hover:bg-white/10 active:scale-95'
                    }`}
                    title="Next Page"
                  >
                    <HiChevronRight size={16} />
                  </button>

                  {/* Double Right Arrow (Skip 10 Pages) */}
                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 10, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                      currentPage === totalPages
                        ? 'border-white/5 bg-white/2 text-surface-600 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 hover:border-primary-500/20 text-white hover:bg-white/10 active:scale-95'
                    }`}
                    title="Skip 10 Pages Forward"
                  >
                    <HiChevronDoubleRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeMatch;
