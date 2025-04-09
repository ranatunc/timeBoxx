import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';
import HomePage from '../screens/Home/HomePage';

const Stack = createStackNavigator();

const AuthStack = ({ setIsLoggedIn }) => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {() => <LoginPage setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Signup" component={SignupPage} />
      <Stack.Screen name="Home" component={HomePage} />
    </Stack.Navigator>
  );
};

export default AuthStack;
