import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CheckBox } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

const AddNeedPage = () => {
  const navigation = useNavigation();

  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [channelId, setChannelId] = useState(null);
  const [username, setUsername] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const getActiveChannel = async () => {
      try {
        const storedChannelId = await AsyncStorage.getItem('activeChannel');
        console.log("Stored Channel ID:", storedChannelId); // Debug için
        if (storedChannelId) {
          setChannelId(storedChannelId);
        } else {
          console.log('HATA: Aktif kanal bulunamadı!');
        }
      } catch (error) {
        console.error("AsyncStorage'dan kanal alınırken hata oluştu:", error);
      }
    };
    
    getActiveChannel();
  }, []);

  useEffect(() => {
    const getUserData = async () => {

      try {
        const user = await AsyncStorage.getItem('user');
        console.log("Stored User Data:", user); 
        if (user) {
          const parsedUser = JSON.parse(user);
          if (parsedUser && parsedUser._id && parsedUser.username) {
            setUserId(parsedUser._id); 
            setUsername(parsedUser.username); 
          } else {
            console.log("Kullanıcı ID veya adı bulunamadı.");
          }
        } else {
          console.log("Kullanıcı verisi AsyncStorage'da bulunamadı.");
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
      }
    };
    getUserData();
  }, []);
  
  

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık girilmesi zorunludur!');
      return;
    }
    if (!channelId) {
      Alert.alert('Hata', 'Aktif kanal bilgisi alınamadı!');
      return;
    }
  
    const requestData = {
      userId,
      username,
      title,
      note,
      channelId: channelId.trim(),
    };
  
    console.log("Gönderilen Request Data:", requestData); // 🔍 Debug için
  
    try {
      const response = await fetch('http://localhost:3000/api/create-need', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      // Yanıtı bir kez okuyun
      const result = await response.json();
  
      if (response.ok) {
        Alert.alert('Başarılı', 'İhtiyaç başarıyla oluşturuldu!');
        navigation.navigate('NeedPage');
      } else {
        Alert.alert('Hata', result.message || 'Bilinmeyen bir hata oluştu.');
      }
  
      // Bildirim oluşturma
      const notificationData = {
        title: 'Yapılacaklara Yenisi eklendi !!📣',
        message: `${title} yapılacak oluşturuldu.`,
        needId: result._id,  // result ile _id alındı
        userId,
        channelId: channelId,  // Aktif kanal bilgisi
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
  
      console.log('Bildirim başarıyla oluşturuldu:', notificationResponseData);
  
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Sunucuya bağlanırken bir hata oluştu.');
    }
  };
  
  

  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <Icon name="person" size={20} color="#000" />
        <Text style={styles.user}>{username}</Text>
      </View>   
      <TextInput style={styles.input} placeholder="Başlık" value={title} placeholderTextColor="#808080" onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Not" value={note} placeholderTextColor="#808080" onChangeText={setNote} multiline />
      <TouchableOpacity style={styles.itemContainer}>
        <CheckBox
          checkedIcon="check-square"
          uncheckedIcon="square-o"
          containerStyle={{ margin: 0, padding: 0 }} // Küçük checkbox için
        />
        <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Bu görev, bir kişi tarafından tamamlanabilir.</Text>
        </View>

      </TouchableOpacity>
      <TouchableOpacity style={styles.itemContainer}>
        <CheckBox
          checkedIcon="check-square"
          uncheckedIcon="square-o"
          containerStyle={{ margin: 0, padding: 0 }} // Küçük checkbox için
        />
        <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>Tüm kullanıcıların bu görevi yapması gerekmektedir.</Text>
        </View>

      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddNeedPage;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20,
  },
  user:{
    fontSize: 16,    
    marginLeft: 10, 
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center',  // İkon ve metni aynı hizada tutar
    marginBottom: 10 
  },
  input: { 
    width: 370, 
    backgroundColor: '#fff', 
    marginTop: 20, 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42', 
  },
  dateContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10, 
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42',  
  },
  itemContainer: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { 
    color: '#808080', 
    marginRight: 10, 
  },
  button: { 
    backgroundColor: '#4CAF50', 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
