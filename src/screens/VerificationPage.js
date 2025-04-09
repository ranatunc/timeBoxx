import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import axios from 'axios';

const VerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerification = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/verifyCode', { code: verificationCode });
      Alert.alert('Success', response.data.message);
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        style={{ height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingLeft: 10 }}
      />
      <TouchableOpacity onPress={handleVerification}>
        <Text>Verify Code</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerificationPage;
