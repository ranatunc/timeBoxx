import { StyleSheet, Text, View, TouchableOpacity, FlatList ,Alert} from 'react-native';
import React, {useState, useEffect,useLayoutEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { CheckBox } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';


const NeedDetailPage = () => {
  const route = useRoute();
  const { needId } = route.params;
  const navigation = useNavigation();
  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loggedUserId, setLoggedUserId] = useState(null);
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('loggedUserId');
        if (storedUserId) {
          setLoggedUserId(storedUserId);
        }
      } catch (error) {
        console.error('Kullanıcı kimliği alınamadı:', error);
      }
    };
  
    fetchUserId();
  }, []);
  useLayoutEffect(() => {
    if (need) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteNeed}
          >
            <Icon name="trash" size={25} color="red" />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, need]);

  const handleDeleteNeed = async () => {
    console.log('Silme butonuna basıldı');
    console.log("Need:", need);
    console.log("Logged User ID:", loggedUserId);
  
    if (!need || !need.users || !loggedUserId) {
      console.error('İhtiyaç veya kullanıcı verisi eksik!');
      alert('İhtiyaç veya kullanıcı verisi eksik!');
      return;
    }
  
    if (!need.users.includes(loggedUserId)) {
      alert('Bu ihtiyacı siz oluşturmadınız veya katılımcı değilsiniz, silemezsiniz.');
      return;
    }
  
    console.log("Alert.show() öncesi");
  
    Alert.alert(
      'İhtiyacı Sil',
      'Bu ihtiyacı silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          onPress: async () => {
            console.log('Silme işlemi başlatılıyor...');
            try {
              const response = await fetch(`http://localhost:3000/api/need/${needId}`, {
                method: 'DELETE',
              });
              const text = await response.text();
              console.log("Delete Response:", text);
  
              const result = JSON.parse(text);
              if (response.ok) {
                alert('İhtiyaç başarıyla silindi');
                
                // Sending a notification after successful deletion
                const notificationData = {
                  title: 'İhtiyaç Silindi',
                  message: `${need.username} ihtiyacı ${formatDate(new Date())} tarihinde silindi.`,
                  needId: need._id,
                  userId: loggedUserId, // Need creator (logged user)
                };
  
                const notificationResponse = await fetch('http://localhost:3000/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(notificationData),
                });
  
                const notificationResponseData = await notificationResponse.json();
  
                if (!notificationResponse.ok) {
                  throw new Error(notificationResponseData.message || 'Bildirim oluşturulamadı');
                }
  
                navigation.navigate('HomePage', { refresh: true });
              } else {
                alert('İhtiyaç silinirken bir hata oluştu');
              }
            } catch (error) {
              console.error('İhtiyaç silinemedi:', error);
              alert('Bir hata oluştu: ' + error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  useEffect(() => {
    console.log("Giden needId:", needId);
  }, [needId]);

  useEffect(() => {
    const fetchNeedDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/need/${needId}`);
        setNeed(response.data);

        // Katılımcıları alalım (bunu server tarafında kullanabilirsiniz veya buradaki gibi yapabilirsiniz)
        if (response.data.users && Array.isArray(response.data.users)) {
          const userNames = await Promise.all(
            response.data.users.map(async (userId) => {
              const userResponse = await axios.get(`http://localhost:3000/api/username/${userId}`);
              return userResponse.data.username || "Bilinmeyen Kullanıcı";
            })
          );
          setParticipants(userNames);
        } else {
          setParticipants([]);
        }

      } catch (error) {
        console.error('Hata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNeedDetails();
  }, [needId]);



  if (loading) {
    return <Text>Yükleniyor...</Text>;
  }

  if (!need) {
    return <Text>İhtiyaç bulunamadı</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>


      <Text style={styles.title}>{need.title}</Text>

      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="document-text" size={20} color="#000" />
          <Text style={styles.note}>{need.note}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="person" size={20} color="#000" />
          <Text style={styles.creator}>{need.username}</Text>
        </View>

        <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Tamamlandı mı ?</Text>
        </View>
        <CheckBox
          checkedIcon="check-square"
          uncheckedIcon="square-o"
          containerStyle={{ margin: 0, padding: 0 }} // Küçük checkbox için
        />
      </TouchableOpacity>
        <Text style={styles.sectionTitle}>Katılımcılar</Text>
        <FlatList
          data={participants} // Katılımcıların isimleri burada gösterilecek
          keyExtractor={(item, index) => index.toString()} // İsimler için unique key
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <Text style={styles.participant}>{item}</Text>
              <Text>{item.checked ? '✔' : '❌'}</Text> 
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default NeedDetailPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, alignItems: 'center' },
  detailsContainer: { marginVertical: 20 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row', // Yatay hizalama
    alignItems: 'center', // Dikeyde ortalama
    justifyContent: 'space-between', // Elemanları baştan ve sondan hizalama
    padding: 15,
    marginVertical: 5,
    width: '100%', // Genişliği tam ekran yapmak için
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: '#fff', // Eğer arka plan gerekiyorsa
  },
  date: { fontSize: 16, marginBottom: 10, marginLeft: 10 },
  note: { fontSize: 16, marginBottom: 10, marginLeft: 10 },
  creator: { fontSize: 14, fontStyle: 'italic', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  checkButton: { backgroundColor: 'green', padding: 10, marginTop: 10, borderRadius: 5 },
  checkButtonText: { color: 'white', textAlign: 'center' },
  userItem: { flexDirection: 'row', justifyContent: 'flex-start', padding: 10, borderBottomWidth: 1 },
  participant: { fontSize: 16 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  deleteButtonText: { 
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

