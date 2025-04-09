import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../Language/i18n';

// Dil Context'ini oluştur
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
        setLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lng) => {
    await AsyncStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
    setLanguage(lng); // Bileşenleri yeniden render etmek için state'i güncelle
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
