import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '../../Language/i18n';
import { LanguageContext } from '../../Language/LanguageContext';

const LanguageScreen = () => {
  const { changeLanguage } = useContext(LanguageContext); // Context'ten fonksiyonu al

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('welcome')}</Text>

      <TouchableOpacity style={styles.button} onPress={() => changeLanguage('tr')}>
        <Text style={styles.buttonText}>🇹🇷 Türkçe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => changeLanguage('en')}>
        <Text style={styles.buttonText}>🇬🇧 English</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: 150,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18 },
});
export default LanguageScreen;
