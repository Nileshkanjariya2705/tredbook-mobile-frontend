import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationDictionary, translations } from '../i18n/translations';
import { tokenStorage } from '../services/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await tokenStorage.get('app_language');
        if (savedLang === 'hi' || savedLang === 'en') {
          setLanguageState(savedLang);
        }
      } catch (err) {
        console.warn('Could not load saved language:', err);
      }
    })();
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await tokenStorage.set('app_language', newLang);
    } catch (err) {
      console.warn('Could not save language to storage:', err);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
