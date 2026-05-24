import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles, HiRefresh, HiAcademicCap, HiChartBar, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import FutureProofScore from '../components/career/FutureProofScore';
import MilestoneTracker from '../components/dashboard/MilestoneTracker';
import CareerProfileForm from '../components/common/CareerProfileForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import useAuthStore from '../store/authStore';
import {
  INTEREST_AREAS,
  STRENGTHS,
  INDUSTRY_STREAMS,
  EDUCATION_LEVELS_COMPREHENSIVE,
  BUDGET_RANGES_COMPREHENSIVE,
  LOCATION_PREFERENCES,
  WORK_LIFE_BALANCE,
  RISK_TOLERANCE,
  INTERACTION_STYLE,
} from '../constants';

// Helper to safely parse comma-separated DB strings or array inputs
const parseStringOrArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val) return val.split(',').map(s => s.trim());
  return [];
};

// Demo roadmap data for unlogged visitors
const demoRoadmap = {
  title: 'Your Path to Becoming a Software Engineer',
  career_path: 'Software Engineer',
  summary: 'Based on your interests in technology and problem-solving strengths, we recommend pursuing a career as a Software Engineer. This roadmap will guide you through the next 12 weeks.',
  recommended_stream: 'technology',
  confidence_score: 85,
  future_proof_score: 78,
  ai_model_used: 'gemini',
  version: 1,
  alternative_careers: ['Data Scientist', 'Product Manager', 'UX Researcher'],
  milestones: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    week_number: i + 1,
    title: i < 4 ? `Week ${i + 1}: Foundation — ${['Learn HTML/CSS', 'JavaScript Basics', 'Git & GitHub', 'Responsive Design'][i]}` :
           i < 8 ? `Week ${i + 1}: Building — ${['React.js Fundamentals', 'State Management', 'API Integration', 'Database Basics'][i - 4]}` :
           `Week ${i + 1}: Advanced — ${['Full Project Build', 'Testing & QA', 'Deployment', 'Portfolio & Resume'][i - 8]}`,
    description: `Focus on mastering key concepts for week ${i + 1}.`,
    category: i < 4 ? 'learning' : i < 8 ? 'project' : 'networking',
    priority: i < 4 ? 'high' : 'medium',
    estimated_hours: 10,
    is_completed: i < 3,
  })),
};

// Demo profile aligned with our constant enums
const demoProfile = {
  interests: ['technical', 'analytical'],
  strengths: ['technical_systems', 'mathematical'],
  industry_stream: 'technology',
  education_level: 'bachelor',
  budget: 'high',
  location: 'major_hub',
  work_life_balance: 'standard',
  risk_tolerance: 'moderate',
  interaction_style: 'balanced',
};

// Maps raw DB keys to gorgeous human-readable labels
const getDisplayLabel = (key, value) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return 'Not specified';
  
  const getLabelFromList = (list, val) => {
    const item = list.find(i => i.value === val);
    return item ? item.label : val;
  };

  const getArrayLabels = (list, valArray) => {
    if (!Array.isArray(valArray)) return valArray;
    return valArray.map(v => getLabelFromList(list, v)).join(', ');
  };

  switch (key) {
    case 'interests':
      return getArrayLabels(INTEREST_AREAS, value);
    case 'strengths':
      return getArrayLabels(STRENGTHS, value);
    case 'industry_stream':
      return getLabelFromList(INDUSTRY_STREAMS, value);
    case 'education_level':
      return getLabelFromList(EDUCATION_LEVELS_COMPREHENSIVE, value);
    case 'budget':
      return getLabelFromList(BUDGET_RANGES_COMPREHENSIVE, value);
    case 'location':
      return getLabelFromList(LOCATION_PREFERENCES, value);
    case 'work_life_balance':
      return getLabelFromList(WORK_LIFE_BALANCE, value);
    case 'risk_tolerance':
      return getLabelFromList(RISK_TOLERANCE, value);
    case 'interaction_style':
      return getLabelFromList(INTERACTION_STYLE, value);
    default:
      return Array.isArray(value) ? value.join(', ') : value;
  }
};

function Roadmap() {
  const token = useAuthStore(state => state.accessToken || state.access_token);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const [roadmap, setRoadmap] = useState(demoRoadmap);
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
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

  // Fetch Profile & Roadmap on load
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setProfile(demoProfile);
        setCareerProfile(demoProfile);
        setRoadmap(demoRoadmap);
        return;
      }
      try {
        // Fetch Profile
        const profRes = await fetch(`${baseUrl}/students/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (profRes.ok) {
          const profData = await profRes.json();
          const actualProfile = profData.profile || profData.data || profData;
          setProfile(actualProfile);
          
          // Map profile data to careerProfile state using safe split-parsing
          setCareerProfile({
            interests: parseStringOrArray(actualProfile.interest_areas || actualProfile.interests),
            strengths: parseStringOrArray(actualProfile.strengths),
            industry_stream: actualProfile.preferred_stream || actualProfile.industry_stream || '',
            education_level: actualProfile.education_level || '',
            budget: actualProfile.budget_range || actualProfile.budget || '',
            location: actualProfile.location_preference || actualProfile.location || '',
            work_life_balance: actualProfile.work_life_balance || '',
            risk_tolerance: actualProfile.risk_tolerance || '',
            interaction_style: actualProfile.interaction_style || '',
          });
        }
        // Fetch Roadmap
        const rmRes = await fetch(`${baseUrl}/roadmap`, { headers: { Authorization: `Bearer ${token}` } });
        if (rmRes.ok) {
          const rmData = await rmRes.json();
          const active = Array.isArray(rmData) ? rmData[0] : (rmData.roadmaps ? rmData.roadmaps[0] : rmData);
          if (active && active.title) {
            setRoadmap(active);
          } else {
            // Self-healing: If no active roadmap exists, automatically generate the first one!
            setGenerating(true);
            try {
              // We'll read the profile data we just fetched
              const profRes = await fetch(`${baseUrl}/students/profile`, { headers: { Authorization: `Bearer ${token}` } });
              if (profRes.ok) {
                const profData = await profRes.json();
                const actualProfile = profData.profile || profData.data || profData;
                
                const genRes = await fetch(`${baseUrl}/roadmap/generate`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    career_inputs: {
                      interest_areas: parseStringOrArray(actualProfile.interest_areas || actualProfile.interests),
                      strengths: parseStringOrArray(actualProfile.strengths),
                      preferred_stream: actualProfile.preferred_stream || actualProfile.industry_stream || '',
                      education_level: actualProfile.education_level || '',
                      budget_range: actualProfile.budget_range || actualProfile.budget || '',
                      location_preference: actualProfile.location_preference || actualProfile.location || '',
                      work_life_balance: actualProfile.work_life_balance || '',
                      risk_tolerance: actualProfile.risk_tolerance || '',
                      interaction_style: actualProfile.interaction_style || '',
                    }
                  })
                });
                if (genRes.ok) {
                  const newRoadmap = await genRes.json();
                  setRoadmap(newRoadmap);
                }
              }
            } catch (genErr) {
              console.error('Failed to auto-generate initial roadmap:', genErr);
            }
            setGenerating(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [baseUrl, token]);

  // Save edited profile inputs
  const handleSaveProfile = async () => {
    setProfile(careerProfile); // Optimistic UI update
    setIsEditModalOpen(false);
    
    try {
      if (token) {
        setGenerating(true);
        const res = await fetch(`${baseUrl}/students/profile`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(careerProfile)
        });
        
        if (res.ok) {
          const updatedProfileData = await res.json();
          const updatedProfile = updatedProfileData.profile || updatedProfileData.data || updatedProfileData;
          setProfile(updatedProfile);
          setCareerProfile({
            interests: parseStringOrArray(updatedProfile.interest_areas || updatedProfile.interests),
            strengths: parseStringOrArray(updatedProfile.strengths),
            industry_stream: updatedProfile.preferred_stream || updatedProfile.industry_stream || '',
            education_level: updatedProfile.education_level || '',
            budget: updatedProfile.budget_range || updatedProfile.budget || '',
            location: updatedProfile.location_preference || updatedProfile.location || '',
            work_life_balance: updatedProfile.work_life_balance || '',
            risk_tolerance: updatedProfile.risk_tolerance || '',
            interaction_style: updatedProfile.interaction_style || '',
          });
        }
        // Automatically generate a new roadmap based on updated answers
        await handleUpdateRoadmap();
      } else {
        // If not logged in, simulate AI generation delay & update local mock state dynamically
        setGenerating(true);
        setTimeout(() => {
          setGenerating(false);
          
          // Map industry_stream value to readable career profile path info
          const industryToCareer = {
            technology: { title: 'Your Path to Becoming a Software Engineer', career: 'Software Engineer', stream: 'technology' },
            healthcare: { title: 'Your Path to Becoming a Medical Practitioner', career: 'Medical Practitioner', stream: 'healthcare' },
            business: { title: 'Your Path to Becoming a Financial Analyst', career: 'Financial Analyst', stream: 'business' },
            engineering: { title: 'Your Path to Becoming a Robotics Engineer', career: 'Robotics Engineer', stream: 'engineering' },
            creative_arts: { title: 'Your Path to Becoming a UX Designer', career: 'UX Designer', stream: 'creative_arts' },
            law: { title: 'Your Path to Becoming a Corporate Attorney', career: 'Corporate Attorney', stream: 'law' },
            trades: { title: 'Your Path to Becoming a Construction Manager', career: 'Construction Manager', stream: 'trades' }
          };
          
          const selection = industryToCareer[careerProfile.industry_stream] || { title: 'Your Path to Professional Success', career: 'Professional', stream: careerProfile.industry_stream };
          
          setRoadmap(prev => ({
            ...prev,
            title: selection.title,
            career_path: selection.career,
            recommended_stream: selection.stream,
            version: (prev.version || 1) + 1,
            future_proof_score: 84,
            confidence_score: 92,
            milestones: prev.milestones.map((m, idx) => ({
              ...m,
              title: `Week ${idx + 1}: ${selection.career} ${m.title.includes('Foundation') ? 'Foundation' : m.title.includes('Building') ? 'Building' : 'Advanced'}`,
            }))
          }));
        }, 1200);
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
      setGenerating(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset careerProfile to original profile data
    if (!token) {
      setCareerProfile(demoProfile);
    } else if (profile) {
      setCareerProfile({
        interests: parseStringOrArray(profile.interest_areas || profile.interests),
        strengths: parseStringOrArray(profile.strengths),
        industry_stream: profile.preferred_stream || profile.industry_stream || '',
        education_level: profile.education_level || '',
        budget: profile.budget_range || profile.budget || '',
        location: profile.location_preference || profile.location || '',
        work_life_balance: profile.work_life_balance || '',
        risk_tolerance: profile.risk_tolerance || '',
        interaction_style: profile.interaction_style || '',
      });
    }
    setIsEditModalOpen(false);
  };

  // Request new AI Roadmap generation
  const handleUpdateRoadmap = async () => {
    setGenerating(true);
    
    const payload = {
      interest_areas: careerProfile.interests,
      strengths: careerProfile.strengths,
      preferred_stream: careerProfile.industry_stream,
      education_level: careerProfile.education_level,
      budget_range: careerProfile.budget,
      location_preference: careerProfile.location,
      work_life_balance: careerProfile.work_life_balance,
      risk_tolerance: careerProfile.risk_tolerance,
      interaction_style: careerProfile.interaction_style,
    };

    try {
      const res = await fetch(`${baseUrl}/roadmap/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ career_inputs: payload })
      });
      if (res.ok) {
        const newRoadmap = await res.json();
        setRoadmap(newRoadmap);
      } else {
        // Optimistic visual update if backend route is still syncing
        setRoadmap(prev => ({ ...prev, version: (prev.version || 1) + 1, future_proof_score: Math.min(100, prev.future_proof_score + 2) }));
      }
    } catch (e) {
      console.error('Roadmap generation failed:', e);
      setRoadmap(prev => ({ ...prev, version: (prev.version || 1) + 1 }));
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16" id="roadmap-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiSparkles className="text-primary-400" />
                <span className="text-sm text-primary-400 font-medium">AI-Generated Roadmap</span>
                <span className="badge-primary text-xs">v{roadmap.version}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {roadmap.title}
              </h1>
              <p className="text-surface-400 max-w-2xl">{roadmap.summary}</p>
            </div>
            {generating && (
              <div className="flex items-center gap-2 text-primary-400 text-sm font-medium bg-primary-900/20 px-4 py-2 rounded-full border border-primary-500/20">
                <HiRefresh size={16} className="animate-spin" />
                Generating AI Roadmap...
              </div>
            )}
          </div>
        </motion.div>

        {/* 6 AI Questions / Profile Inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              📋 Your Career Profile (AI Inputs)
            </h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-primary-400 hover:text-primary-300 flex items-center gap-1.5 text-sm font-semibold transition-colors bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg border border-primary-500/20"
              id="edit-profile-btn"
            >
              <HiPencil size={15} /> Edit Answers
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {[
               { key: 'interests', label: 'Interest Areas', isMandatory: true },
               { key: 'strengths', label: 'Strengths', isMandatory: true },
               { key: 'industry_stream', label: 'Preferred Stream', isMandatory: true },
               { key: 'education_level', label: 'Education Level', isMandatory: true },
               { key: 'budget', label: 'Budget Range', isMandatory: true },
               { key: 'location', label: 'Location Preference', isMandatory: true },
               { key: 'work_life_balance', label: 'Work-Life Balance', isMandatory: false },
               { key: 'risk_tolerance', label: 'Risk Tolerance', isMandatory: false },
               { key: 'interaction_style', label: 'Interaction Style', isMandatory: false }
             ].map(({ key, label, isMandatory }) => (
                <div key={key} className="bg-surface-800/50 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                   <p className="text-xs text-surface-400 capitalize mb-1">
                     {label} {isMandatory && <span className="text-red-500">*</span>}
                   </p>
                   <p className="text-sm text-white font-medium">
                     {getDisplayLabel(key, careerProfile[key])}
                   </p>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Premium Profile Editor Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCancelEdit}
          title="Edit Your Career Profile (AI Inputs)"
          size="lg"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <CareerProfileForm
              formData={careerProfile}
              onChange={(field, val) => setCareerProfile(prev => ({ ...prev, [field]: val }))}
              showOptional={true}
            />
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveProfile}
              loading={generating}
            >
              Save & Update Roadmap
            </Button>
          </div>
        </Modal>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">Career Path</p>
            <p className="text-lg font-display font-bold text-white">{roadmap.career_path}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">Stream</p>
            <p className="text-lg font-display font-bold text-white capitalize">{getDisplayLabel('industry_stream', roadmap.recommended_stream)}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">AI Confidence</p>
            <p className="text-lg font-display font-bold gradient-text">{roadmap.confidence_score}%</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">Est. Duration</p>
            <p className="text-lg font-display font-bold text-white">12 Weeks</p>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestones — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <MilestoneTracker milestones={roadmap.milestones} />

            {/* Next Steps Panel (Below Milestones) */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiSparkles className="text-primary-400" /> Next Steps
              </h3>
              <p className="text-surface-400 text-sm mb-6">
                Ready to take the next step? Explore colleges that match your profile or experience a day in the life of this profession.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/colleges"
                  className="block p-4 rounded-xl bg-primary-600/10 border border-primary-500/20 text-sm text-primary-300 hover:bg-primary-600/20 transition-all text-center font-medium"
                >
                  View Matched Colleges →
                </Link>
                <Link
                  to="/simulation"
                  className="block p-4 rounded-xl bg-accent-600/10 border border-accent-500/20 text-sm text-accent-300 hover:bg-accent-600/20 transition-all text-center font-medium"
                >
                  Simulate This Career →
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Future-Proof Score */}
            <div className="glass-card p-6 text-center">
              <h3 className="font-display font-bold text-white mb-4">Future-Proof Score</h3>
              <FutureProofScore score={roadmap.future_proof_score} size="lg" />
            </div>

            {/* Alternative Careers */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiChartBar className="text-primary-400" /> Alternative Careers
              </h3>
              <div className="space-y-2">
                {(roadmap.alternative_careers || ['Data Scientist', 'Product Manager', 'UX Researcher']).map((career) => (
                  <div
                    key={career}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all cursor-pointer"
                  >
                    <span className="text-sm text-surface-300">{career}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Insights */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiAcademicCap className="text-primary-400" /> Career Insights
              </h3>
              <div className="space-y-2">
                <Link
                  to="/blog"
                  className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all text-center text-sm text-surface-300 hover:text-white"
                >
                  Read Career Advice →
                </Link>
                <Link
                  to="/faq"
                  className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/20 transition-all text-center text-sm text-surface-300 hover:text-white"
                >
                  View FAQs →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Roadmap;
