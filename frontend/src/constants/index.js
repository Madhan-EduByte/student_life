/**
 * DestinAI — App-Wide Constants
 */

export const APP_NAME = 'DestinAI';
export const APP_TAGLINE = 'Your destiny, powered by AI.';

// ─── COMPREHENSIVE CAREER PROFILE OPTIONS ──────────────────────

export const INTEREST_AREAS = [
  { value: 'analytical', label: 'Analytical', description: 'Solving complex logic puzzles, working with data, researching.' },
  { value: 'creative', label: 'Creative', description: 'Designing visuals, writing, inventing, producing media.' },
  { value: 'technical', label: 'Technical/Hands-on', description: 'Coding, building, repairing, working with machines or tools.' },
  { value: 'social', label: 'Social/Helping', description: 'Teaching, counseling, nursing, guiding others.' },
  { value: 'enterprising', label: 'Enterprising', description: 'Leading teams, selling, managing projects, starting businesses.' },
  { value: 'organizational', label: 'Organizational', description: 'Managing spreadsheets, optimizing processes, administration.' },
];

export const STRENGTHS = [
  { value: 'mathematical', label: 'Mathematical/Quantitative', description: 'Advanced calculation, statistics, financial modeling.' },
  { value: 'technical_systems', label: 'Technical/Systems', description: 'Programming, engineering, troubleshooting complex systems.' },
  { value: 'communication', label: 'Communication', description: 'Public speaking, persuasive writing, negotiation.' },
  { value: 'interpersonal', label: 'Interpersonal', description: 'High emotional intelligence, conflict resolution, team building.' },
  { value: 'creative_spatial', label: 'Creative/Spatial', description: 'Visual design, out-of-the-box thinking, artistic talent.' },
  { value: 'focus_execution', label: 'Focus/Execution', description: 'High attention to detail, project management, hitting deadlines.' },
];

export const INDUSTRY_STREAMS = [
  { value: 'technology', label: 'Technology & IT', description: 'Software, AI, Cybersecurity, Data Science.' },
  { value: 'healthcare', label: 'Healthcare & Medicine', description: 'Nursing, Therapy, Pharmacology, Medical Practice.' },
  { value: 'business', label: 'Business & Finance', description: 'Accounting, Marketing, Management, Economics.' },
  { value: 'engineering', label: 'Engineering & Manufacturing', description: 'Mechanical, Civil, Electrical, Robotics.' },
  { value: 'creative_arts', label: 'Creative Arts & Media', description: 'Design, Journalism, Entertainment, Architecture.' },
  { value: 'law', label: 'Law & Public Policy', description: 'Government, Legal Practice, Non-profits.' },
  { value: 'trades', label: 'Skilled Trades', description: 'Electrician, Plumbing, Aviation, Construction Management.' },
];

export const EDUCATION_LEVELS_COMPREHENSIVE = [
  { value: 'high_school', label: 'High School Diploma / GED', description: 'Standard 12th or equivalent.' },
  { value: 'bootcamp', label: 'Bootcamp / Short-term Certification', description: '3-6 months intensive training.' },
  { value: 'vocational', label: 'Trade / Vocational School Degree', description: '1-2 years focused training.' },
  { value: 'associate', label: 'Associate Degree', description: '2 years of college education.' },
  { value: 'bachelor', label: 'Bachelor\'s Degree', description: '3-4 years of university education.' },
  { value: 'master', label: 'Master\'s Degree', description: '1-2 years post-bachelor\'s education.' },
  { value: 'doctorate', label: 'Doctorate / Professional Degree', description: 'Ph.D., MD, JD or equivalent.' },
];

export const BUDGET_RANGES_COMPREHENSIVE = [
  { value: 'free', label: 'Zero/Self-Taught', description: 'Free resources, financial aid, or company-sponsored training.' },
  { value: 'low', label: 'Low (₹100 - ₹3,000)', description: 'Professional certifications, online courses, short bootcamps.' },
  { value: 'medium', label: 'Medium (₹3,000 - ₹20,000)', description: 'Community colleges, trade schools, specialized tech bootcamps.' },
  { value: 'high', label: 'High (₹20,000 - ₹75,000)', description: 'Standard in-state university Bachelor\'s or Master\'s.' },
  { value: 'premium', label: 'Premium (₹75,000+)', description: 'Elite private universities, out-of-state, medical/law schools.' },
];

export const LOCATION_PREFERENCES = [
  { value: 'remote', label: '100% Remote', description: 'Working from anywhere, regardless of company location.' },
  { value: 'major_hub', label: 'Major Tech/Business Hub', description: 'High cost of living, highest peak salaries (Silicon Valley, NYC, Bengaluru).' },
  { value: 'mid_city', label: 'Mid-sized City', description: 'Good balance of job availability and moderate cost of living.' },
  { value: 'rural', label: 'Rural / Small Town', description: 'Low cost of living, preferring local industries.' },
  { value: 'nomad', label: 'Global/Nomad', description: 'Willing to relocate internationally for the best opportunities.' },
];

// Optional Categories
export const WORK_LIFE_BALANCE = [
  { value: 'hustle', label: 'Hustle/High Growth', description: 'Willing to work 50-60+ hours for maximum salary and fast promotion.' },
  { value: 'standard', label: 'Standard Professional', description: '40 hours/week, occasional overtime, steady progression.' },
  { value: 'flexible', label: 'High Flexibility', description: 'Prioritizes 9-to-5, generous time off, low stress over income.' },
];

export const RISK_TOLERANCE = [
  { value: 'high', label: 'High Risk / High Reward', description: 'Startups, entrepreneurship, commission-based, freelance.' },
  { value: 'moderate', label: 'Moderate Risk', description: 'Corporate sector, private enterprise, performance-based bonuses.' },
  { value: 'low', label: 'Low Risk / High Stability', description: 'Government jobs, tenured academia, unionized roles.' },
];

export const INTERACTION_STYLE = [
  { value: 'collaborative', label: 'Highly Collaborative', description: 'Constant meetings, team projects, customer-facing roles.' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of independent focus time and team check-ins.' },
  { value: 'independent', label: 'Highly Independent', description: 'Mostly solo work, deep focus (coding, writing, transport).' },
];

// ─── LEGACY CONSTANTS (for backward compatibility) ──────────────

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
  { path: '/careerGuide', label: 'Career Guide' },
  { path: '/collegesSimulate', label: 'Colleges Simulate' },
  { path: '/careerSimulate', label: 'Career Simulate' },
];
