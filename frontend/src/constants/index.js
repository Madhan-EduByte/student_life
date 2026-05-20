/**
 * DestinAI — App-Wide Constants
 */

export const APP_NAME = 'DestinAI';
export const APP_TAGLINE = 'Your destiny, powered by AI.';

export const STREAMS = [
  { value: 'science', label: 'Science', icon: '🔬', color: '#6366f1' },
  { value: 'commerce', label: 'Commerce', icon: '📊', color: '#f59e0b' },
  { value: 'arts', label: 'Arts', icon: '🎨', color: '#ec4899' },
  { value: 'vocational', label: 'Vocational', icon: '🛠️', color: '#22c55e' },
];

export const EDUCATION_LEVELS = [
  { value: '8th', label: '8th Standard' },
  { value: '9th', label: '9th Standard' },
  { value: '10th', label: '10th Standard' },
  { value: '11th', label: '11th Standard' },
  { value: '12th', label: '12th Standard' },
  { value: 'ug', label: 'Undergraduate (UG)' },
  { value: 'pg', label: 'Postgraduate (PG)' },
  { value: 'diploma', label: 'Diploma' },
];

export const BUDGET_RANGES = [
  { value: 'below 1L', label: 'Below ₹1 Lakh' },
  { value: '1-5L', label: '₹1 – 5 Lakhs' },
  { value: '5-10L', label: '₹5 – 10 Lakhs' },
  { value: 'above 10L', label: 'Above ₹10 Lakhs' },
];

export const LOCATIONS = [
  { value: 'Any India', label: 'Anywhere in India' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Abroad', label: 'Abroad' },
];

export const MILESTONE_CATEGORIES = {
  learning: { label: 'Learning', color: '#6366f1', icon: '📚' },
  project: { label: 'Project', color: '#22c55e', icon: '🚀' },
  networking: { label: 'Networking', color: '#f59e0b', icon: '🤝' },
  skill: { label: 'Skill', color: '#ec4899', icon: '💡' },
  exam_prep: { label: 'Exam Prep', color: '#ef4444', icon: '📝' },
};

export const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/colleges', label: 'Colleges' },
  { path: '/simulation', label: 'Simulate' },
  { path: '/dashboard', label: 'Dashboard' },
];
