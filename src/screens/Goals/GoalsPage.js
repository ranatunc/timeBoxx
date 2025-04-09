import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';


const GoalsPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [goals, setGoals] = useState([]);
  const [channelId, setChannelId] = useState(route.params?.channelId);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const getActiveChannel = async () => {
      const storedChannelId = await AsyncStorage.getItem('activeChannel');
      console.log("Stored Channel ID:", storedChannelId);
      console.log("Route Channel ID:", route.params?.channelId);
      if (!channelId && storedChannelId) {
        setChannelId(storedChannelId);
      }
    };
    getActiveChannel();
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      fetchGoals(channelId.trim());
    } else {
      console.log("HATA: channelId alınamadı!");
    }
  }, [channelId]);

  const fetchGoals = async (id) => {
    try {
      if (!id) {
        console.error('fetchGoals HATASI: Gönderilen channelId boş!');
        return;
      }
  
      console.log(`fetchGoals çağrıldı. channelId: ${id}`);
  
      const url = `http://localhost:3000/api/goals/channel/${id}`;
      console.log(`API isteği URL: ${url}`);
  
      const response = await axios.get(url);
  
      console.log('API Yanıtı:', response.data);
      setGoals(response.data.goals);
  
    } catch (err) {
      if (err.response) {
        // API cevap döndürdü ama hata kodu ile
        console.error(`API Hatası (response): ${err.response.status} - ${err.response.statusText}`);
        console.error('Detay:', err.response.data);
      } else if (err.request) {
        // İstek gönderildi ama cevap gelmedi
        console.error('API Hatası (request): Sunucudan cevap alınamadı');
        console.error(err.request);
      } else {
        // Axios dışında bir hata
        console.error('Bilinmeyen Hata:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleDeleteGoal = (index) => {
    Alert.alert(
      'Silme Onayı',
      'Bu hedefi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: () => {
            const updatedGoals = goals.filter((_, i) => i !== index);
            setGoals(updatedGoals);
            AsyncStorage.setItem('userGoals', JSON.stringify(updatedGoals));
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleGoalPress = (goal) => {
    navigation.navigate('GoalsDetailPage', { goal, setGoals });
  };




  return (
    <View style={styles.container}>
      {goals.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={goals.reverse()} // Hedefleri ters sırada göster
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              onPress={() => handleGoalPress(item)} 
              style={styles.goalItem}
            >
              <Text style={styles.goalText}>Başlık: {item.title}</Text>
              <Text style={styles.goalText}>Tür: {item.selectedType}</Text>
              <Text style={styles.goalText}>Açıklama: {item.description}</Text>
              <View style={styles.chartContainer}>
                <ProgressChart
                  data={{
                    data: [
                      (item.miktar > 0 && item.biriktirilen >= 0) 
                        ? (item.biriktirilen / item.miktar) 
                        : 0 // Sıfır kontrolü yap
                    ]
                  }} 
                  width={160}
                  height={150}
                  strokeWidth={15}
                  radius={35}
                  chartConfig={{
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                  }}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noGoalsContainer}>
          <Text style={styles.noGoalsText}>Hedeflerinizi eklemeye başlayın..</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateGoalsPage')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5', marginTop: 5 },
  header: { fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  listContainer: { paddingBottom: 20 },
  goalItem: { padding: 10 , backgroundColor: '#fff', marginVertical: 5, borderRadius: 5, position: 'relative' },
  goalText: { fontSize: 18, marginBottom: 10 ,},
  noGoalsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noGoalsText: { fontSize: 20, color: '#666', marginBottom: 10 },
  addButton: { 
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
  },
  chartContainer: { marginTop: -90, alignItems: 'flex-end', justifyContent: 'flex-end' }
});

export default GoalsPage;
