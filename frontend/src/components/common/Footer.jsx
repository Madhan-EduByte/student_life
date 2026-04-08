import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants';

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>
                D
              </div>
              <span className="font-display font-bold text-lg text-white">{APP_NAME}</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              AI-powered career guidance for every student on earth. Your destiny, powered by AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2">
              {['Career Assessment', 'AI Roadmap', 'College Match', 'Career Simulation'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-surface-400 hover:text-primary-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              {['Career Guide', 'College Database', 'Blog', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-surface-400 hover:text-primary-400 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li className="text-surface-400 text-sm">support@destinai.com</li>
              <li className="text-surface-400 text-sm">APS College of Arts and Science</li>
              <li className="text-surface-400 text-sm">Bangalore, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} {APP_NAME}. BCA Final Year Project — APS College.
          </p>
          <p className="text-surface-600 text-xs italic">
            Built with purpose. Guided by AI. Forged for every student on earth.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
