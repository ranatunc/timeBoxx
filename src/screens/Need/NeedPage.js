import React, { useEffect, useState } from 'react';
import { StyleSheet,View, TouchableOpacity, FlatList, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckBox } from 'react-native-elements';

const NeedPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelId, setChannelId] = useState(route.params?.channelId);
  const [checked, setChecked] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const getActiveChannel = async () => {
      const storedChannelId = await AsyncStorage.getItem('activeChannel');
      if (!channelId && storedChannelId) {
        setChannelId(storedChannelId);
      }
    };
    getActiveChannel();
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      fetchNeeds(channelId.trim());
    } else {
      console.log("HATA: channelId alınamadı!");
    }
  }, [channelId]);

  const fetchNeeds = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/needs/${id}`);
      console.log(response.data); 
      setNeeds(response.data.needs);
      
    } catch (err) {
      console.error("API Hatası:", err);
      setError('Bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['#FFD700', '#FF69B4', '#8A2BE2', '#20B2AA'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const toggleCheckBox = (id) => {
    setSelectedItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // ✅ Seçili durumu değiştir
    }));
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {needs.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={needs}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.itemContainer, { backgroundColor: '#fff' }]}
              onPress={() =>
               navigation.navigate('NeedDetailPage', { needId: item.id })}>
              <View style={[styles.colorBar, { backgroundColor: getRandomColor() }]} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.note}</Text>
              </View>
              <CheckBox
                checked={selectedItems[item.id] || false}
                onPress={() => toggleCheckBox(item.id)}
                checkedIcon="check-square"
                uncheckedIcon="square-o"
                containerStyle={{ margin: 0, padding: 0 }} // Küçük checkbox için
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noNeedsContainer}>
          <Text style={styles.noNeedsText}>Henüz ihtiyaç eklenmedi.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNeedPage')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    width: '400',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  colorBar: {
    width: 5,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
  },
  noNeedsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNeedsText: {
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    padding: 10,
  },
});

export default NeedPage;