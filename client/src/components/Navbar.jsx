import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap, ChevronDown, Bell } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getUser } from '../utils/auth';
import { NotificationBell } from './NotificationBell';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const user = getUser();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = () => { setShowLangMenu(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass py-2 px-5 m-4 rounded-2xl' : 'bg-transparent py-4 px-6'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-accent-blue p-2 rounded-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BST <span className="text-accent-cyan">HUB</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">{t('nav','home')}</Link>
          <Link to="/services" className="text-gray-300 hover:text-white transition-colors text-sm">{t('nav','services')}</Link>

          {/* Language selector */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 glass px-3 py-1.5 rounded-xl text-gray-300 hover:text-white transition-colors text-sm">
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangMenu && (
              <div className="absolute top-full mt-2 right-0 glass-card p-2 rounded-xl min-w-[140px] shadow-xl z-50">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      lang === l.code ? 'bg-accent-blue/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user && <NotificationBell user={user} />}


          {/* Auth buttons */}
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-gray-300 hover:text-white transition-colors text-sm">
                {user.role === 'admin' ? 'Admin Panel' : t('nav','dashboard')}
              </Link>
              <button onClick={handleLogout}
                className="px-5 py-2 glass hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm transition-all">
                {t('nav','logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="px-5 py-2 rounded-xl text-gray-300 hover:text-white transition-colors text-sm">
                {t('nav','login')}
              </Link>
              <Link to="/register"
                className="px-6 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 text-sm">
                {t('nav','getStarted')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass mt-2 p-6 rounded-2xl mx-4 z-50">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav','home')}</Link>
            <Link to="/services" className="text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav','services')}</Link>
            
            {/* Mobile language picker */}
            <div className="flex space-x-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setIsMobileMenuOpen(false); }}
                  className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                    lang === l.code ? 'bg-accent-blue text-white' : 'glass text-gray-400'
                  }`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            <hr className="border-white/10" />
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                    {user.role === 'admin' ? 'Admin Panel' : t('nav','dashboard')}
                  </Link>
                  <NotificationBell user={user} />
                </div>
                <button onClick={handleLogout} className="text-red-400 text-left">{t('nav','logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white" onClick={() => setIsMobileMenuOpen(false)}>{t('nav','login')}</Link>
                <Link to="/register" className="w-full py-3 bg-accent-blue text-white text-center rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}>{t('nav','getStarted')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
