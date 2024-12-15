import { StyleSheet, View } from 'react-native'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationStack from './src/navigation/NavigationStack';


const Stack = createStackNavigator();

const App = () => {
  return (
    <>
      <NavigationStack />
    </>
  );
};

export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  }
})