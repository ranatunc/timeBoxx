import { StyleSheet } from 'react-native'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationStack from './src/navigation/NavigationStack';
import i18n from './src/Language/i18n';
import { I18nextProvider } from 'react-i18next';
import { LanguageProvider } from './src/Language/LanguageContext';
import { ChannelProvider } from './src/context/ChannelContext';
import { GoalsProvider } from './src/context/GoalContext';

const Stack = createStackNavigator();

const changeLanguage = async (lng) => {
  await AsyncStorage.setItem('language', lng);
  i18n.changeLanguage(lng);
};

const App = () => {
  return (
    <GoalsProvider> 
      <ChannelProvider>
        <LanguageProvider>
          <I18nextProvider i18n={i18n}>
            <NavigationStack changeLanguage={changeLanguage} />
          </I18nextProvider>
        </LanguageProvider>
      </ChannelProvider>
    </GoalsProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  }
});
