import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Globe, FileText, Shield, Zap } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export const Footer = () => {
  const { t, isRTL } = useLang();

  return (
    <footer className={`glass-card mt-20 mx-6 mb-6 pt-16 pb-8 px-8 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-start">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-accent-blue p-2 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">BST <span className="text-accent-cyan">HUB</span></span>
            </Link>
            <p className="text-gray-400">
              {t('footer', 'tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"><FileText className="w-5 h-5" /></a>
              <a href="#" className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"><Shield className="w-5 h-5" /></a>
              <a href="#" className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"><Zap className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer', 'services')}</h4>
            <ul className="space-y-4">
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Assignment Help</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">FYP Development</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Thesis Writing</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Research Papers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer', 'quickLinks')}</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">{t('footer', 'aboutUs')}</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">{t('footer', 'howItWorks')}</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">{t('footer', 'pricing')}</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">{t('footer', 'contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">{t('footer', 'contactUs')}</h4>
            <ul className="space-y-4 text-start">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-accent-cyan" />
                <span>info@broadsolutiontech.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-accent-cyan" />
                <span>+92 314 4219130</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-accent-cyan" />
                <span>Lake City, Lahore</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            © 2024 BST HUB. {t('footer', 'rights')} {t('footer', 'builtBy')} <a href="https://broadsolutiontech.com/" className="text-accent-blue">Broad Solution Tech</a>
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('footer', 'privacy')}</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">{t('footer', 'terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
