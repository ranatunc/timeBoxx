import React from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = () => {


  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECEDF0' }}>
      <Text>Welcome to Home Page!</Text>
    </View>
  );
};

export default HomePage;


