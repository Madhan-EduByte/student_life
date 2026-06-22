import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiUsers,
  HiAcademicCap,
  HiShieldCheck,
  HiSparkles,
  HiTrash,
  HiPencil,
  HiPlus,
  HiDatabase,
  HiClipboardList,
  HiTrendingUp,
  HiSearch,
  HiRefresh,
  HiOfficeBuilding,
  HiTerminal,
  HiBookOpen
} from 'react-icons/hi';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

const DashboardOverview = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    total_students: 0,
    active_careerGuides: 0,
    total_careers: 0,
    total_colleges: 0,
    system_health: 'checking...'
  });

  // Table lists
  const [users, setUsers] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [careers, setCareers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [careerGuides, setCareerGuides] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [careerGuideHistories, setCareerGuideHistories] = useState([]);
  const [studentOutcomes, setStudentOutcomes] = useState([]);

  // Modals and Forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'student',
    is_active: true
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Stats
      try {
        const statsRes = await api.get('/admin/dashboard/stats');
        setStats({
          total_students: statsRes.data.total_students ?? 0,
          active_careerGuides: statsRes.data.active_career_guides ?? 0,
          total_careers: statsRes.data.total_careers ?? 0,
          total_colleges: statsRes.data.total_colleges ?? 0,
          system_health: statsRes.data.system_health ?? 'operational'
        });
      } catch (e) {
        console.error('Failed to fetch admin stats:', e);
        setStats(prev => ({ ...prev, system_health: 'error' }));
      }

      // 2. Users
      try {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data || []);
      } catch (e) {
        console.error('Failed to fetch admin users:', e);
      }

      // 3. Profiles
      try {
        const profsRes = await api.get('/admin/student-profiles');
        setStudentProfiles(profsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch student profiles:', e);
      }

      // 4. Careers
      try {
        const careersRes = await api.get('/admin/careers');
        setCareers(careersRes.data || []);
      } catch (e) {
        console.error('Failed to fetch careers:', e);
      }

      // 5. Colleges
      try {
        const collegesRes = await api.get('/admin/colleges');
        setColleges(collegesRes.data || []);
      } catch (e) {
        console.error('Failed to fetch colleges:', e);
      }

      // 6. CareerGuides
      try {
        const careerGuidesRes = await api.get('/admin/career-guides');
        setCareerGuides(careerGuidesRes.data || []);
      } catch (e) {
        console.error('Failed to fetch career guides:', e);
      }

      // 7. Milestones
      try {
        const milestonesRes = await api.get('/admin/milestones');
        setMilestones(milestonesRes.data || []);
      } catch (e) {
        console.error('Failed to fetch milestones:', e);
      }

      // 8. Session Logs
      try {
        const logsRes = await api.get('/admin/session-logs');
        setSessionLogs(logsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch session logs:', e);
      }

      // 9. Histories
      try {
        const histRes = await api.get('/admin/career-guide-histories');
        setCareerGuideHistories(histRes.data || []);
      } catch (e) {
        console.error('Failed to fetch career guide histories:', e);
      }

      // 10. Outcomes
      try {
        const outRes = await api.get('/admin/student-outcomes');
        setStudentOutcomes(outRes.data || []);
      } catch (e) {
        console.error('Failed to fetch student outcomes:', e);
      }

    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CRUD Actions
  const handleOpenCreate = () => {
    setUserForm({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'student',
      is_active: true
    });
    setErrorMsg('');
    setIsCreateOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/admin/users', userForm);
      setSuccessMsg('User successfully created!');
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      password: '', // blank by default
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active
    });
    setErrorMsg('');
    setIsEditOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete updateData.password;
      }
      await api.put(`/admin/users/${selectedUser.id}`, updateData);
      setSuccessMsg('User updated successfully!');
      setIsEditOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and their profile permanently?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccessMsg('User deleted successfully!');
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  // Filters
  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = studentProfiles.filter(p =>
    String(p.user_id).includes(searchQuery) ||
    p.interest_areas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.strengths?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.preferred_stream?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCareers = careers.filter(c =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills_required?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredColleges = colleges.filter(col =>
    col.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    col.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCareerGuides = careerGuides.filter(rm =>
    rm.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rm.career_path?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMilestones = milestones.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-12 text-white bg-surface-950" id="admin-dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary-400">
              <HiShieldCheck size={20} />
              <span className="text-sm font-medium tracking-wide uppercase">Admin Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Global Command Center</h1>
            <p className="text-surface-400 text-sm mt-1">High-level intelligence dashboard, user access management, and system inspectors.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all px-4 py-2 rounded-lg border border-white/10"
            >
              <HiRefresh className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
            <Button variant="primary" onClick={handleOpenCreate}>
              <HiPlus className="inline mr-1" /> Create User
            </Button>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Dynamic Sidebar + Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Navigation */}
          <div className="lg:col-span-1 flex flex-col gap-2">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: <HiTrendingUp /> },
              { id: 'users', label: 'User IAM (Access)', icon: <HiUsers /> },
              { id: 'students', label: 'Student Profiles', icon: <HiAcademicCap /> },
              { id: 'careers', label: 'Careers Catalog', icon: <HiBookOpen /> },
              { id: 'colleges', label: 'Colleges Simulate', icon: <HiOfficeBuilding /> },
              { id: 'careerGuides', label: 'AI Career Guides', icon: <HiSparkles /> },
              { id: 'milestones', label: 'Milestones List', icon: <HiClipboardList /> },
              { id: 'logs', label: 'Activity Logs & History', icon: <HiTerminal /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold border ${
                  activeTab === tab.id
                    ? 'bg-primary-600/20 text-white border-primary-500/30 shadow-lg shadow-primary-500/5'
                    : 'bg-white/5 text-surface-400 hover:text-white border-white/5 hover:bg-white/10'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Main Stage */}
          <div className="lg:col-span-3">
            
            {/* Search filter bar (Not shown for Overview tab) */}
            {activeTab !== 'overview' && (
              <div className="glass-card p-4 mb-6 flex items-center gap-3 border border-white/10">
                <HiSearch className="text-surface-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-white text-sm placeholder-surface-500"
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-card p-5 text-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20 border border-blue-500/30 text-blue-400 mx-auto mb-3">
                          <HiUsers size={20} />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">Total Students</p>
                        <p className="text-3xl font-display font-bold text-white">{stats.total_students}</p>
                      </div>

                      <div className="glass-card p-5 text-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto mb-3">
                          <HiSparkles size={20} />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">Active Career Guides</p>
                        <p className="text-3xl font-display font-bold text-white">{stats.active_careerGuides}</p>
                      </div>

                      <div className="glass-card p-5 text-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/20 border border-pink-500/30 text-pink-400 mx-auto mb-3">
                          <HiBookOpen size={20} />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">Careers Cataloged</p>
                        <p className="text-3xl font-display font-bold text-white">{stats.total_careers}</p>
                      </div>

                      <div className="glass-card p-5 text-center">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto mb-3">
                          <HiOfficeBuilding size={20} />
                        </div>
                        <p className="text-xs text-surface-400 mb-1">Colleges Loaded</p>
                        <p className="text-3xl font-display font-bold text-white">{stats.total_colleges}</p>
                      </div>
                    </div>

                    {/* System Health Card */}
                    <div className="glass-card p-6 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                          <HiDatabase className="text-emerald-400" /> Database & Connection Integrity
                        </h3>
                        <p className="text-surface-400 text-sm mt-1">All core system models, relationships, and seed parameters are checked and verified.</p>
                      </div>
                      <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        {stats.system_health}
                      </span>
                    </div>

                    {/* Visual Funnel Representation */}
                    <div className="glass-card p-6">
                      <h3 className="font-display font-bold text-lg text-white mb-4">Student Growth & Analytics</h3>
                      <div className="h-64 flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 p-6 relative">
                        <div className="w-full flex items-center justify-between gap-4 max-w-md mb-2">
                          <span className="text-xs text-surface-400">Visitor Sessions</span>
                          <span className="text-xs font-semibold text-white">100%</span>
                        </div>
                        <div className="w-full h-8 bg-primary-600/30 border border-primary-500/30 rounded-lg max-w-md mb-4 flex items-center justify-center text-xs font-bold">
                          Core Landing & Career Guide Preview
                        </div>

                        <div className="w-full flex items-center justify-between gap-4 max-w-md mb-2">
                          <span className="text-xs text-surface-400">Created Accounts (Students)</span>
                          <span className="text-xs font-semibold text-white">{stats.total_students > 0 ? 'Converted' : '0%'}</span>
                        </div>
                        <div className="w-full h-8 bg-indigo-600/30 border border-indigo-500/30 rounded-lg max-w-md mb-4 flex items-center justify-center text-xs font-bold" style={{ width: '80%' }}>
                          Saved AI Profiles
                        </div>

                        <div className="w-full flex items-center justify-between gap-4 max-w-md mb-2">
                          <span className="text-xs text-surface-400">Active Career Guides Generated</span>
                          <span className="text-xs font-semibold text-white">{stats.active_careerGuides > 0 ? 'Active' : '0%'}</span>
                        </div>
                        <div className="w-full h-8 bg-pink-600/30 border border-pink-500/30 rounded-lg max-w-md flex items-center justify-center text-xs font-bold" style={{ width: '60%' }}>
                          AI Path Generation Complete
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. USER IAM TAB */}
                {activeTab === 'users' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-white text-xs">{u.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{u.full_name}</div>
                                <div className="text-xs font-mono text-surface-500">{u.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  u.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-surface-500/20 text-surface-500'
                                }`}>
                                  {u.is_active ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono">
                                {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  className="text-primary-400 hover:text-primary-300 font-semibold p-1 bg-primary-500/10 rounded border border-primary-500/20"
                                >
                                  <HiPencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-400 hover:text-red-300 font-semibold p-1 bg-red-500/10 rounded border border-red-500/20"
                                >
                                  <HiTrash size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. STUDENT PROFILES TAB */}
                {activeTab === 'students' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">Student ID</th>
                            <th className="px-6 py-4">Stream</th>
                            <th className="px-6 py-4">Interests / Strengths</th>
                            <th className="px-6 py-4">Budget / Location</th>
                            <th className="px-6 py-4">Preferences</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredProfiles.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">Student #{p.user_id}</div>
                                <div className="text-xs text-surface-500 font-mono">Profile #{p.id}</div>
                              </td>
                              <td className="px-6 py-4 capitalize text-white font-medium">{p.preferred_stream || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-white">Interests: <span className="text-primary-400 font-semibold">{p.interest_areas || 'None'}</span></div>
                                <div className="text-xs text-surface-400 mt-1">Strengths: <span className="text-pink-400 font-semibold">{p.strengths || 'None'}</span></div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs capitalize text-white">Budget: {p.budget_range || 'N/A'}</div>
                                <div className="text-xs capitalize text-surface-400 mt-1">Location: {p.location_preference || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-surface-500">WLB: {p.work_life_balance || 'N/A'}</div>
                                <div className="text-xs text-surface-500 mt-0.5">Risk: {p.risk_tolerance || 'N/A'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. CAREERS TAB */}
                {activeTab === 'careers' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Salary Range</th>
                            <th className="px-6 py-4">Growth Rate</th>
                            <th className="px-6 py-4">Skills Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredCareers.map((c) => (
                            <tr key={c.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{c.title}</div>
                                <div className="text-xs text-surface-500 line-clamp-1">{c.description}</div>
                              </td>
                              <td className="px-6 py-4 font-mono text-white text-xs">{c.salary_range}</td>
                              <td className="px-6 py-4 font-semibold text-primary-400 text-xs">{c.growth_rate}</td>
                              <td className="px-6 py-4 text-xs text-surface-400">{c.skills_required}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. COLLEGES TAB */}
                {activeTab === 'colleges' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">College Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Ranking</th>
                            <th className="px-6 py-4">Fees Range</th>
                            <th className="px-6 py-4">Website</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredColleges.map((col) => (
                            <tr key={col.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{col.id}</td>
                              <td className="px-6 py-4 font-semibold text-white">{col.name}</td>
                              <td className="px-6 py-4 text-xs">{col.location}</td>
                              <td className="px-6 py-4 font-mono text-white text-xs">#{col.ranking}</td>
                              <td className="px-6 py-4 text-xs">{col.fees_range}</td>
                              <td className="px-6 py-4 text-xs">
                                <a href={col.website} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                                  Visit Website
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. CAREER_GUIDES TAB */}
                {activeTab === 'careerGuides' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Career Path</th>
                            <th className="px-6 py-4">Scores</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Generated At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredCareerGuides.map((rm) => (
                            <tr key={rm.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{rm.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{rm.title}</div>
                                <div className="text-xs text-surface-500 font-mono">Student #{rm.user_id}</div>
                              </td>
                              <td className="px-6 py-4 capitalize text-white font-medium">{rm.career_path}</td>
                              <td className="px-6 py-4">
                                <div className="text-xs text-white">Confidence: <span className="text-emerald-400 font-semibold">{rm.confidence_score}%</span></div>
                                <div className="text-xs text-surface-400 mt-1">Future Proof: <span className="text-primary-400 font-semibold">{rm.future_proof_score}%</span></div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  rm.is_active ? 'bg-primary-500/20 text-primary-400' : 'bg-surface-500/20 text-surface-500'
                                }`}>
                                  {rm.is_active ? 'Active' : 'Archived'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono">
                                {rm.created_at ? new Date(rm.created_at).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 7. MILESTONES TAB */}
                {activeTab === 'milestones' && (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-surface-400">
                        <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                          <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">CareerGuide ID</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Priority / Category</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredMilestones.map((m) => (
                            <tr key={m.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{m.id}</td>
                              <td className="px-6 py-4 text-xs font-mono">CareerGuide #{m.careerGuide_id}</td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-white">{m.title}</div>
                                <div className="text-xs text-surface-500">Week {m.week_number}</div>
                              </td>
                              <td className="px-6 py-4 capitalize">
                                <div className="text-xs text-white">Priority: {m.priority}</div>
                                <div className="text-xs text-surface-400 mt-1">Category: {m.category}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  m.is_completed ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {m.is_completed ? 'Completed' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 8. LOGS & ACTIVITY TAB */}
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    
                    {/* Session Navigation Activity */}
                    <div className="glass-card p-6">
                      <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                        <HiTerminal className="text-primary-400" /> User Session Activity Log
                      </h3>
                      <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm text-surface-400">
                          <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                            <tr>
                              <th className="px-6 py-3">ID</th>
                              <th className="px-6 py-3">User ID</th>
                              <th className="px-6 py-3">Action</th>
                              <th className="px-6 py-3">Duration (sec)</th>
                              <th className="px-6 py-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-mono">
                            {sessionLogs.map((l) => (
                              <tr key={l.id} className="hover:bg-white/5">
                                <td className="px-6 py-3">{l.id}</td>
                                <td className="px-6 py-3">Student #{l.user_id}</td>
                                <td className="px-6 py-3 text-white font-semibold">{l.action}</td>
                                <td className="px-6 py-3">{l.duration || '0'}</td>
                                <td className="px-6 py-3">{l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* CareerGuide Generation History */}
                    <div className="glass-card p-6">
                      <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                        <HiSparkles className="text-pink-400" /> CareerGuide Version Revision History
                      </h3>
                      <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm text-surface-400">
                          <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                            <tr>
                              <th className="px-6 py-3">ID</th>
                              <th className="px-6 py-3">CareerGuide ID</th>
                              <th className="px-6 py-3">Version</th>
                              <th className="px-6 py-3">Summary of Changes</th>
                              <th className="px-6 py-3">Reason</th>
                              <th className="px-6 py-3">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs">
                            {careerGuideHistories.map((h) => (
                              <tr key={h.id} className="hover:bg-white/5">
                                <td className="px-6 py-3 font-mono">{h.id}</td>
                                <td className="px-6 py-3 font-mono">CareerGuide #{h.careerGuide_id}</td>
                                <td className="px-6 py-3 text-white font-semibold">v{h.version}</td>
                                <td className="px-6 py-3 text-surface-300">{h.changes_summary}</td>
                                <td className="px-6 py-3 text-surface-400 italic">"{h.reason}"</td>
                                <td className="px-6 py-3 font-mono">{h.created_at ? new Date(h.created_at).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Student Outcomes */}
                    <div className="glass-card p-6">
                      <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
                        <HiAcademicCap className="text-emerald-400" /> Student Placement & Success Outcomes
                      </h3>
                      <div className="overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm text-surface-400">
                          <thead className="bg-white/5 text-white font-semibold border-b border-white/10 uppercase tracking-wider text-xs">
                            <tr>
                              <th className="px-6 py-3">ID</th>
                              <th className="px-6 py-3">Student ID</th>
                              <th className="px-6 py-3">Outcome Type</th>
                              <th className="px-6 py-3">Placement Details</th>
                              <th className="px-6 py-3">Recorded At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs">
                            {studentOutcomes.map((o) => (
                              <tr key={o.id} className="hover:bg-white/5">
                                <td className="px-6 py-3 font-mono">{o.id}</td>
                                <td className="px-6 py-3 font-mono">Student #{o.user_id}</td>
                                <td className="px-6 py-3 capitalize text-white font-semibold">{o.outcome_type}</td>
                                <td className="px-6 py-3 text-surface-300">{o.details}</td>
                                <td className="px-6 py-3 font-mono">{o.created_at ? new Date(o.created_at).toLocaleString() : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* CREATE USER MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Secure New User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Madhan Chetan"
              value={userForm.full_name}
              onChange={(e) => setUserForm(p => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. student@example.com"
              value={userForm.email}
              onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Secure Password</label>
            <input
              type="password"
              required
              placeholder="Min 8 characters"
              value={userForm.password}
              onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={userForm.phone}
              onChange={(e) => setUserForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">System IAM Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
              className="w-full bg-surface-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={userForm.is_active}
              onChange={(e) => setUserForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-white cursor-pointer select-none">
              Account Active / Enabled
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update User Profile & Role">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={userForm.full_name}
              onChange={(e) => setUserForm(p => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={userForm.email}
              onChange={(e) => setUserForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password <span className="text-surface-500 text-xs">(Leave blank to keep unchanged)</span></label>
            <input
              type="password"
              placeholder="New secure password"
              value={userForm.password}
              onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={userForm.phone}
              onChange={(e) => setUserForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">System IAM Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
              className="w-full bg-surface-900 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={userForm.is_active}
              onChange={(e) => setUserForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-primary-500"
            />
            <label htmlFor="edit_is_active" className="text-sm font-medium text-white cursor-pointer select-none">
              Account Active / Enabled
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default DashboardOverview;