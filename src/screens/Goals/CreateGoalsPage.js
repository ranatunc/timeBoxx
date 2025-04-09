import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateGoalsPage = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState(''); // Username state değişkeni
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('Finans'); // Default tür "Finans"
  const [channelId, setChannelId] = useState('');

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

  const handleDateChange = (goal, newDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (goal.type === 'set' && newDate) {
        const formattedDate = new Date(newDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit',year: 'numeric', }).replace(/\./g, '-'); // YYYY-MM-DD formatı
        setDate(formattedDate);      }
    } else {
      setDate(newDate || date);
    }
  };
  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');  // Gün, örneğin: '05'
    const month = String(d.getMonth() + 1).padStart(2, '0');  // Ay, örneğin: '03'
    const year = d.getFullYear();  // Yıl, örneğin: '2025'
  
    return `${day}/${month}/${year} `;
  };
  const handleSave = async () => {
    // 'user' verisini AsyncStorage'dan al
    const userData = await AsyncStorage.getItem('user');
    const parsedUser = JSON.parse(userData);
  
    // Kullanıcı verisi yoksa uyarı göster
    if (!parsedUser || !parsedUser._id) {
      Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı!');
      return;
    }
  
    const userId = parsedUser._id;  // userId'yi burada alıyoruz
    console.log("User ID:", userId);  // Burada userId'yi logluyoruz
  
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık girilmesi zorunludur!');
      return;
    }
    if (!channelId) {
      Alert.alert('Hata', 'Aktif kanal bilgisi alınamadı!');
      return;
    }
  
    if (!title || !amount || !username || !date || !selectedType || !description) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
  
    const newGoal = {
      title,
      selectedType: selectedType,
      amount,
      date: date,
      description,
      username,
      progress: 0,
      channelId: channelId.trim(),
      userId: userId,  // Burada userId'yi kullanıyoruz
    };
  
    console.log("New Goal Data:", newGoal);  // Burada yeni hedef verisini logluyoruz
  
    try {
      const response = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoal),
      });
  
      if (response.ok) {
        const goal = await response.json();
        Alert.alert('Başarılı', 'Hedef başarıyla kaydedildi!');
        navigation.navigate('GoalsPage');
  
        const formattedDateTime = formatDateTime(date);
        // Bildirim oluşturma
        const notificationData = {
          title: 'Hedeflere Yenisi eklendi !!📣',
          message: `📅 ${formattedDateTime} tarihinde , ${username} yeni bir hedef oluşturdu: ${title}`,
          goalId: goal._id,
          createdAt: new Date(),
          date,
          userId,
          channelId: channelId,
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
      } else {
        const errorData = await response.json();
        console.error('Sunucu hatası:', errorData);
        Alert.alert('Hata', errorData.message || 'Sunucu hatası oluştu.');
      }
    } catch (error) {
      console.error('İstek hatası:', error);
      Alert.alert('Hata', 'Hedef kaydedilemedi.');
    }
  };
  


  return (
    <View style={styles.container}>
      <View style={styles.inputContainer} marginTop='30'>
        <Icon name="person" size={30} color="#000" />
        <Text style={styles.labeluser}><Text style={styles.user}>   {username}</Text> </Text>
      </View>

      {/* Başlık */}
      <View style={styles.inputContainer}>
        <Icon name="clipboard" size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder="Başlık"
          value={title}
          placeholderTextColor="#808080"
          onChangeText={setTitle}
        />
      </View>

      {/* Tür Seçimi */}
      <View style={styles.inputContainer}>
        <Icon name="stats-chart" size={30} color="#000" />
        <TextInput
          style={[styles.input, { backgroundColor: '#dcdcdc' }]}
          value={selectedType}
          editable={false}
          placeholder="Tür Seçin"
          placeholderTextColor="#808080"
        />
      </View>

      {/* Miktar */}
      <View style={styles.inputContainer}>
        <Icon name="cash" size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder="Miktar"
          value={amount}
          placeholderTextColor="#808080"
          onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
      </View>

      {/* Tarih Seçici */}
      <View style={styles.labelContainer}>
        <Icon name="calendar" size={30} color="#000" />
        <View style={styles.dateContainer}>
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        </View>
      </View>

      {/* Açıklama */}
      <View style={styles.inputContainer}>
        <Icon name="document-text"size={30} color="#000" />
        <TextInput
          style={styles.input}
          placeholder="Açıklama"
          value={description}
          placeholderTextColor="#808080"
          onChangeText={setDescription}
        />
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity
        style={styles.kaydetButton}
        onPress={handleSave}>
        <Text style={styles.kaydetButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 340,
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#044a42',
  },
  labelContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kaydetButton: {
    backgroundColor: '#4CAF50',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  kaydetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGoalsPage;
