
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 
  | 'en' | 'zh' | 'hi' | 'es' | 'fr' | 'ar' | 'bn' | 'ru' | 'pt' | 'ur' 
  | 'id' | 'de' | 'ja' | 'pcm' | 'mr' | 'te' | 'tr' | 'ta' | 'vi' | 'ko' 
  | 'jv' | 'it' | 'gu' | 'pl' | 'uk' | 'pa' | 'nl' | 'yo' | 'ms' | 'th' 
  | 'kn' | 'ml' | 'ig' | 'ha' | 'or' | 'my' | 'su' | 'ro' | 'uz' | 'am' 
  | 'fa' | 'bho' | 'so' | 'fil' | 'ps' | 'el' | 'sv' | 'hu' | 'cs' | 'az' 
  | 'he' | 'ceb' | 'mg' | 'bg' | 'be' | 'si' | 'tt' | 'no' | 'sk' | 'da' 
  | 'fi' | 'hr' | 'lt' | 'sl' | 'et' | 'lv' | 'ga' | 'mt' | 'is' | 'cy' 
  | 'eu' | 'ca' | 'gl' | 'af' | 'sw' | 'zu' | 'xh' | 'st' | 'sn' | 'ny' 
  | 'rw' | 'kg' | 'lg' | 'rn' | 'sg' | 'ak' | 'bm' | 'ewo' | 'ff' | 'ig'
  | 'ln' | 'lu' | 'kam' | 'kea' | 'khq' | 'ki' | 'kln' | 'kok' | 'ksb' | 'luy'
  | 'mas' | 'mer' | 'mfe' | 'naq' | 'nyn' | 'om' | 'saq' | 'seh' | 'ses' | 'teo'
  | 'vai' | 'wo' | 'zgh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('sentry-language') as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    setIsHydrated(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sentry-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
};
