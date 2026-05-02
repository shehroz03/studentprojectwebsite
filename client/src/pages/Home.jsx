import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Zap, ExternalLink, Code2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export const Home = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLang();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleOrderClick = () => {
    if (user) {
      navigate('/order-submission');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={`pt-24 pb-16 px-6 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full text-accent-cyan text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
              </span>
              <span>{t('home', 'badge')}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
              {t('home', 'title1')} <br />
              <span className="text-gradient">{t('home', 'title2')}</span> {t('home', 'title3')}
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg">
              {t('home', 'subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={handleOrderClick} className="px-8 py-4 bg-accent-blue hover:bg-blue-600 text-white rounded-2xl font-semibold transition-all flex items-center justify-center space-x-2 group">
                <span>{t('home', 'orderNow')}</span>
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => navigate('/services')} className="px-8 py-4 glass hover:bg-white/10 text-white rounded-2xl font-semibold transition-all">
                {t('home', 'viewServices')}
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-white">12K+</div>
                <div className="text-gray-500 text-sm">{t('home', 'ordersCompleted')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">8K+</div>
                <div className="text-gray-500 text-sm">{t('home', 'happyStudents')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9/5</div>
                <div className="text-gray-500 text-sm">{t('home', 'userRatings')}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card p-4 relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                alt="Student studying" 
                className="rounded-2xl w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -right-6 glass p-6 rounded-3xl animate-bounce shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <Shield className="text-green-500 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Safe & Secure</div>
                    <div className="text-gray-400 text-xs">100% Plagiarism Free</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -left-6 glass p-6 rounded-3xl animate-pulse delay-700 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500/20 p-2 rounded-xl">
                    <Zap className="text-yellow-500 w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Fast Delivery</div>
                    <div className="text-gray-400 text-xs">Meets All Deadlines</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[100px] -z-10 rounded-full"></div>
          </motion.div>
        </div>

        {/* Featured Projects Section */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="inline-block glass px-4 py-2 rounded-full text-accent-cyan text-sm mb-4">
                {t('portfolio', 'badge')}
              </div>
              <h2 className="text-3xl font-bold text-white">{t('portfolio', 'title')} <span className="text-gradient">{t('portfolio', 'titleHighlight')}</span></h2>
              <p className="text-gray-400 mt-4 max-w-xl">
                {t('portfolio', 'subtitle')}
              </p>
            </div>
            <button onClick={() => navigate('/services')} className="text-accent-blue font-bold flex items-center space-x-2 hover:underline">
              <span>{t('portfolio', 'viewMore')}</span>
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Social Vibing Showcase */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card group overflow-hidden"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src="/social_vibing_showcase_1777724178613.png" 
                  alt="Social Vibing Project" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-white bg-pink-500/20 border-pink-500/30">
                  17+ Community
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-4 text-accent-cyan">
                  <Code2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('portfolio', 'fullStack')}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Social Vibing</h3>
                <p className="text-gray-400 mb-6 line-clamp-3">
                  {t('portfolio', 'socialVibingDesc')}
                </p>
                <div className="flex items-center space-x-6">
                  <a 
                    href="https://www.socialvibing.online/landing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-2 text-white text-sm font-bold bg-white/5 px-3 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                  >
                    <span>{t('portfolio', 'liveDemo')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-gray-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="dev" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-accent-blue flex items-center justify-center text-[10px] font-bold text-white">
                      +12
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Broad Solution Tech Showcase */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="glass-card group overflow-hidden border-accent-cyan/10 bg-accent-cyan/5"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src="/bst_studio_showcase_1777724719402.png" 
                  alt="Broad Solution Tech" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-white bg-accent-cyan/20 border-accent-cyan/30">
                  Premium Studio
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center space-x-2 mb-4 text-accent-cyan">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{t('portfolio', 'softwareSolutions')}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Broad Solution Tech</h3>
                <p className="text-gray-400 mb-6 line-clamp-3">
                  {t('portfolio', 'bstDesc')}
                </p>
                <div className="flex items-center space-x-6">
                  <a 
                    href="https://broadsolutiontech.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-2 text-white text-sm font-bold bg-white/5 px-3 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/10"
                  >
                    <span>{t('portfolio', 'visitWebsite')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="flex items-center space-x-1 text-accent-cyan">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-bold">Enterprise Grade</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
