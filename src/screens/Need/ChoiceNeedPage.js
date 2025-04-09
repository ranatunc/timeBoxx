import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';


const ChoiceNeedPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Lütfen bir seçenek belirleyin</Text>
      </View>
      
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}
        onPress={() => navigation.navigate('AddNeedPage', { type: 'reminder' })}
        >
          <Text style={styles.menuButton}>📌 Anımsatıcı</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}
        onPress={() => navigation.navigate('AddNeedPage', { type: 'planner' })}
        >
          <Text style={styles.menuButton}>📅 Planlayıcı</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChoiceNeedPage

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  header: { alignItems: 'center', padding: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 20 },
  menu: { marginVertical: 20, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuButton: { fontSize: 16, fontWeight: 'bold' },
});
