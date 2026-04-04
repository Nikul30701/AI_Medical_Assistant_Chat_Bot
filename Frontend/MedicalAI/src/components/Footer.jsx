// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Upload Document', href: '/upload' },
    { label: 'Help Center', href: '#' },
    { label: 'Privacy', href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-zinc-100 mt-auto">
      <div className="max-w-[1180px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Left: Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center text-white text-xl shadow">
                ⚕
              </div>
              <span className="text-xl font-semibold tracking-tight text-zinc-900">MedAnalyzer</span>
            </div>
            
            <p className="text-sm text-zinc-600 max-w-md">
              AI-powered medical document analysis platform that helps healthcare professionals 
              extract insights faster and more accurately.
            </p>
          </div>

          {/* Center: Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-zinc-900 mb-4 text-sm tracking-wider">PLATFORM</h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Status & Legal */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
              <span className="text-sm font-medium text-black">All systems operational</span>
            </div>

            <div className="text-xs text-zinc-500 leading-relaxed">
              © {currentYear} MedAnalyzer. All rights reserved.<br />
              This platform uses AI to assist with document analysis and does not replace 
              professional medical judgment or diagnosis.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            Made with ❤️ for better healthcare
          </div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-zinc-600 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-zinc-600 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-zinc-600 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;