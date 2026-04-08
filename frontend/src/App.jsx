import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Roadmap from './pages/Roadmap';
import CollegeMatch from './pages/CollegeMatch';
import Simulation from './pages/Simulation';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/colleges" element={<CollegeMatch />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
