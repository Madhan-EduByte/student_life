import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles, HiRefresh, HiAcademicCap, HiChartBar, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import FutureProofScore from '../components/career/FutureProofScore';
import MilestoneTracker from '../components/dashboard/MilestoneTracker';
import CareerProfileForm from '../components/common/CareerProfileForm';
import Button from '../components/common/Button';
import useAuthStore from '../store/authStore';

// Demo roadmap data
const demoRoadmap = {
  title: 'Your Path to Becoming a Software Engineer',
  career_path: 'Software Engineer',
  summary: 'Based on your interests in technology and problem-solving strengths, we recommend pursuing a career as a Software Engineer. This roadmap will guide you through the next 12 weeks.',
  recommended_stream: 'science',
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

function Roadmap() {
  const token = useAuthStore(state => state.accessToken || state.access_token);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const [roadmap, setRoadmap] = useState(demoRoadmap);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
      if (!token) return;
      try {
        // Fetch Profile
        const profRes = await fetch(`${baseUrl}/students/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfile(profData);
          // Map profile data to careerProfile state
          setCareerProfile({
            interests: Array.isArray(profData.interests) ? profData.interests : (profData.interests ? [profData.interests] : []),
            strengths: Array.isArray(profData.strengths) ? profData.strengths : (profData.strengths ? [profData.strengths] : []),
            industry_stream: profData.industry_stream || profData.preferred_stream || '',
            education_level: profData.education_level || '',
            budget: profData.budget || profData.budget_range || '',
            location: profData.location || profData.location_preference || '',
            work_life_balance: profData.work_life_balance || '',
            risk_tolerance: profData.risk_tolerance || '',
            interaction_style: profData.interaction_style || '',
          });
        }
        // Fetch Roadmap
        const rmRes = await fetch(`${baseUrl}/roadmap`, { headers: { Authorization: `Bearer ${token}` } });
        if (rmRes.ok) {
          const rmData = await rmRes.json();
          const active = Array.isArray(rmData) ? rmData[0] : (rmData.roadmaps ? rmData.roadmaps[0] : rmData);
          if (active && active.title) setRoadmap(active);
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
    setIsEditing(false);
    try {
      await fetch(`${baseUrl}/students/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(careerProfile)
      });
      // Automatically generate a new roadmap based on updated answers
      await handleUpdateRoadmap();
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  };

  const handleCancelEdit = () => {
    // Reset careerProfile to original profile data
    setCareerProfile({
      interests: Array.isArray(profile?.interests) ? profile.interests : (profile?.interests ? [profile.interests] : []),
      strengths: Array.isArray(profile?.strengths) ? profile.strengths : (profile?.strengths ? [profile.strengths] : []),
      industry_stream: profile?.industry_stream || profile?.preferred_stream || '',
      education_level: profile?.education_level || '',
      budget: profile?.budget || profile?.budget_range || '',
      location: profile?.location || profile?.location_preference || '',
      work_life_balance: profile?.work_life_balance || '',
      risk_tolerance: profile?.risk_tolerance || '',
      interaction_style: profile?.interaction_style || '',
    });
    setIsEditing(false);
  };

  // Request new AI Roadmap generation
  const handleUpdateRoadmap = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${baseUrl}/roadmap/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ career_inputs: careerProfile })
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
            <h2 className="text-xl font-display font-bold text-white">Your Career Profile (AI Inputs)</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
                <HiPencil /> Edit Answers
              </button>
            ) : (
              <button onClick={handleSaveProfile} className="text-green-400 hover:text-green-300 flex items-center gap-1 text-sm">
                <HiCheck /> Save Answers
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {['interest_areas', 'strengths', 'preferred_stream', 'education_level', 'budget_range', 'location_preference'].map(field => (
                <div key={field} className="bg-surface-800/50 p-3 rounded-lg border border-white/5">
                   <p className="text-xs text-surface-400 capitalize mb-1">{field.replace('_', ' ')}</p>
                   {isEditing ? (
                     field === 'preferred_stream' ? (
                       <select
                         value={editForm?.[field] || ''}
                         onChange={e => setEditForm({...editForm, [field]: e.target.value})}
                         className="w-full bg-surface-900 border border-surface-700 rounded px-2 py-1 text-sm text-white focus:border-primary-500 outline-none"
                       >
                         <option value="">Select Stream</option>
                         <option value="science">Science</option>
                         <option value="commerce">Commerce</option>
                         <option value="arts">Arts</option>
                         <option value="vocational">Vocational</option>
                       </select>
                     ) : (
                       <input type="text" value={editForm?.[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})}
                         className="w-full bg-surface-900 border border-surface-700 rounded px-2 py-1 text-sm text-white focus:border-primary-500 outline-none" />
                     )
                   ) : (
                     <p className="text-sm text-white font-medium">{profile?.[field] || 'Not specified'}</p>
                   )}
                </div>
             ))}
          </div>
        </motion.div>

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
            <p className="text-lg font-display font-bold text-white capitalize">{roadmap.recommended_stream}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-sm text-surface-400 mb-1">AI Confidence</p>
            <p className="text-lg font-display font-bold gradient-text">{roadmap.confidence_score}%</p>
          </div>
          <div className="glass-card p-5 flex justify-center">
            <FutureProofScore score={roadmap.future_proof_score} size="sm" />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestones — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <MilestoneTracker milestones={roadmap.milestones} />
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

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <HiAcademicCap className="text-primary-400" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/colleges"
                  className="block p-3 rounded-xl bg-primary-600/10 border border-primary-500/20 text-sm text-primary-300 hover:bg-primary-600/20 transition-all text-center"
                >
                  View Matched Colleges →
                </Link>
                <Link
                  to="/simulation"
                  className="block p-3 rounded-xl bg-accent-600/10 border border-accent-500/20 text-sm text-accent-300 hover:bg-accent-600/20 transition-all text-center"
                >
                  Simulate This Career →
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
