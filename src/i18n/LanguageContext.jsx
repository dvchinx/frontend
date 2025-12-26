import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Intentar obtener el idioma del localStorage
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ES';
  });

  useEffect(() => {
    // Guardar en localStorage cuando cambie
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || key;
    
    // Reemplazar parámetros en el texto
    Object.keys(params).forEach(param => {
      text = text.replace(`\${${param}}`, params[param]);
    });
    
    return text;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
