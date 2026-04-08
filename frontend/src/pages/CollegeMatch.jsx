import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiFilter, HiAcademicCap } from 'react-icons/hi';
import CollegeCard from '../components/college/CollegeCard';
import Input from '../components/common/Input';

const demoColleges = [
  { id: 1, name: 'Indian Institute of Technology Bombay', university: 'IIT Bombay', type: 'government', city: 'Mumbai', state: 'Maharashtra', nirf_rank: 3, placement_rate: 95, average_package: 18.0, accreditation: 'NAAC A++', established_year: 1958 },
  { id: 2, name: 'Indian Institute of Technology Delhi', university: 'IIT Delhi', type: 'government', city: 'New Delhi', state: 'Delhi', nirf_rank: 2, placement_rate: 96, average_package: 20.0, accreditation: 'NAAC A++', established_year: 1961 },
  { id: 3, name: 'Indian Institute of Science', university: 'IISc', type: 'government', city: 'Bangalore', state: 'Karnataka', nirf_rank: 1, placement_rate: 90, average_package: 15.0, accreditation: 'NAAC A++', established_year: 1909 },
  { id: 4, name: 'BITS Pilani', university: 'BITS', type: 'deemed', city: 'Pilani', state: 'Rajasthan', nirf_rank: 25, placement_rate: 92, average_package: 14.0, accreditation: 'NAAC A', established_year: 1964 },
  { id: 5, name: 'VIT Vellore', university: 'VIT University', type: 'deemed', city: 'Vellore', state: 'Tamil Nadu', nirf_rank: 15, placement_rate: 85, average_package: 10.0, accreditation: 'NAAC A++', established_year: 1984 },
  { id: 6, name: 'Manipal Institute of Technology', university: 'MAHE', type: 'deemed', city: 'Manipal', state: 'Karnataka', nirf_rank: 20, placement_rate: 88, average_package: 11.0, accreditation: 'NAAC A++', established_year: 1957 },
];

const demoMatches = demoColleges.map((college, i) => ({
  college,
  match_score: 95 - i * 5,
  match_reasons: [
    `NIRF Rank #${college.nirf_rank}`,
    `${college.placement_rate}% placement rate`,
    `₹${college.average_package} LPA avg package`,
  ],
}));

function CollegeMatch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'government', label: 'Government' },
    { key: 'deemed', label: 'Deemed' },
    { key: 'private', label: 'Private' },
  ];

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
            <span className="text-sm text-primary-400 font-medium">AI-Matched Colleges</span>
          </div>
          <h1 className="section-heading">
            Your <span className="gradient-text">College Matches</span>
          </h1>
          <p className="section-subheading">
            Colleges matched to your profile, budget, and career goals — ranked by AI compatibility.
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
              placeholder="Search colleges, cities..."
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
          {filteredMatches.length} colleges found
        </p>

        {/* College Grid */}
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

        {filteredMatches.length === 0 && (
          <div className="text-center py-16">
            <p className="text-surface-500 text-lg">No colleges match your criteria.</p>
            <p className="text-surface-600 text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollegeMatch;
