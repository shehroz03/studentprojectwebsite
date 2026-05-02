import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, currencies } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('bst_lang') || 'en');
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('bst_currency');
    return saved ? JSON.parse(saved) : currencies['en'];
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('bst_lang', lang);
    // Auto-set currency when language changes
    if (currencies[lang]) {
      const c = currencies[lang];
      setCurrency(c);
      localStorage.setItem('bst_currency', JSON.stringify(c));
    }
    // RTL support for Arabic
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('bst_currency', JSON.stringify(currency));
  }, [currency]);

  const t = (section, key) => {
    try {
      return translations[lang]?.[section]?.[key] || translations['en']?.[section]?.[key] || key;
    } catch {
      return key;
    }
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${currency.symbol}${num.toLocaleString()}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, currency, setCurrency, t, formatAmount, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
