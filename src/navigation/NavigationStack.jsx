import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import UserStack from './UserStack';

const NavigationStack = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await AsyncStorage.getItem('user');
      setIsLoggedIn(!!user); // Oturum durumu kontrolü
    };
    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? <UserStack setIsLoggedIn={setIsLoggedIn} /> : <AuthStack setIsLoggedIn={setIsLoggedIn} />}
    </NavigationContainer>
  );
};

export default NavigationStack;
