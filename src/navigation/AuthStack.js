import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';
import HomePage from '../screens/Home/HomePage';

const Stack = createStackNavigator();

const AuthStack = ({ setIsLoggedIn }) => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" 
      options={{ 
        headerShown: true ,
        title: '', 
        headerStyle: {
        backgroundColor: '#1E1E1E', 
        elevation: 0,           // Android gölgesini kaldırır
        shadowOpacity: 0,       // iOS gölgesini kaldırır
        borderBottomWidth: 0,
      },
      headerLeft: () => null,
      }} >
        {() => <LoginPage setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Signup" component={SignupPage} 
            options={{ 
              headerShown: true ,
              title: '', 
              headerStyle: {
              backgroundColor: '#1E1E1E', 
              elevation: 0,           // Android gölgesini kaldırır
              shadowOpacity: 0,       // iOS gölgesini kaldırır
              borderBottomWidth: 0,
            },
            headerLeft: () => null,
            }} />
      <Stack.Screen name="Home" component={HomePage} />
    </Stack.Navigator>
  );
};

export default AuthStack;
