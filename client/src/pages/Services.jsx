import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Code, BookOpen, GraduationCap, Lightbulb, PenTool, Layers, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const services = [
  {
    title: "Assignment Help",
    description: "High-quality, plagiarism-free assignments with ultra-fast delivery. Tailored to meet your specific university standards.",
    icon: <FileText className="w-10 h-10 text-accent-blue" />,
  },
  {
    title: "FYP Documentation",
    description: "Complete professional documentation for Final Year Projects, including SRS, Design, and Final Reports.",
    icon: <PenTool className="w-10 h-10 text-accent-cyan" />,
  },
  {
    title: "FYP Ideas",
    description: "Get unique, trending, and innovative ideas for your FYP. We provide abstract and feasibility analysis.",
    icon: <Lightbulb className="w-10 h-10 text-yellow-500" />,
  },
  {
    title: "Software Development",
    description: "Expert coding and implementation in Python, Java, C++, React, and more. Robust and bug-free development.",
    icon: <Code className="w-10 h-10 text-green-500" />,
  },
  {
    title: "Thesis Writing",
    description: "End-to-end support for Master's and PhD thesis. Research methodology, literature review, and analysis.",
    icon: <BookOpen className="w-10 h-10 text-purple-500" />,
  },
  {
    title: "Research Paper",
    description: "Professional research paper writing ready for IEEE, Elsevier, and Springer publication.",
    icon: <GraduationCap className="w-10 h-10 text-orange-500" />,
  },
  {
    title: "Custom Projects",
    description: "Whatever your academic project needs, we deliver custom solutions with 24/7 expert support.",
    icon: <Layers className="w-10 h-10 text-pink-500" />,
  },
  {
    title: "Express Delivery",
    description: "Tight deadline? No problem. Our team specializes in high-quality express delivery for urgent tasks.",
    icon: <Zap className="w-10 h-10 text-accent-cyan animate-pulse" />,
  }
];

export const Services = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLang();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleBookService = () => {
    if (user) {
      navigate('/order-submission');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={`pt-32 pb-20 px-6 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block glass px-4 py-2 rounded-full text-accent-cyan text-sm mb-4"
          >
            {t('services', 'badge')}
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('services', 'title')} <span className="text-gradient">{t('services', 'titleHighlight')}</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('services', 'subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={handleBookService}
              className="glass-card p-8 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 bg-accent-blue/5 w-24 h-24 rounded-full blur-2xl group-hover:bg-accent-blue/10 transition-colors"></div>
              
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{service.title}</h3>
              <p className="text-gray-400 mb-6 line-clamp-3 relative z-10">
                {service.description}
              </p>
              <div className="flex items-center text-accent-blue font-semibold group-hover:space-x-2 transition-all relative z-10">
                <span>{t('services', 'bookService')}</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'rotate-180' : ''}`}>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
