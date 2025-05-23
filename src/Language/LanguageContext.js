import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../Language/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && savedLanguage !== i18n.language) {
        await i18n.changeLanguage(savedLanguage); // ✅ await eklendi
        setLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lng) => {
    await AsyncStorage.setItem('language', lng);
    await i18n.changeLanguage(lng); // ✅ await eklendi
    setLanguage(lng); // 🔄 tetikleyici
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
