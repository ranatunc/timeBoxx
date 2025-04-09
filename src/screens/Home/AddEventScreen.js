import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

const AddEventScreen = () => {
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [date, setDate] = useState(new Date());  
  const [time, setTime] = useState(new Date());    
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [markedDates, setMarkedDates] = useState({});


  const navigation = useNavigation(); 

  // Picker için state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  const handleDateChange = (event, newDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && newDate) {
        const formattedDate = new Date(newDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit',year: 'numeric', }).replace(/\./g, '-'); // YYYY-MM-DD formatı
        setDate(formattedDate);      }
    } else {
      setDate(newDate || date);
    }
  };

  const handleTimeChange = (event, newTime) => {
    if (newTime) {
      setTime(newTime);
      const formattedTime = newTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); // HH:MM
    }
  };
  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');  // Gün, örneğin: '05'
    const month = String(d.getMonth() + 1).padStart(2, '0');  // Ay, örneğin: '03'
    const year = d.getFullYear();  // Yıl, örneğin: '2025'
  
    const hours = String(d.getHours()).padStart(2, '0');  // Saat, örneğin: '00'
    const minutes = String(d.getMinutes()).padStart(2, '0');  // Dakika, örneğin: '00'
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  

  const handleAddEvent = async () => {
    const userId = await AsyncStorage.getItem('userId');
  
    // Girdi kontrolleri
    if (!username || !date || !time || !location || !description) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }
  
    // Kanal ID'sini AsyncStorage'den al
    const activeChannel = await AsyncStorage.getItem('activeChannel');
    if (!activeChannel) {
      alert('Aktif kanal bulunamadı!');
      return;
    }
  
    // Etkinlik verisini oluştur
    const eventData = {
      name: description,
      description,
      date: date, 
      time,
      location,
      color: generateRandomColor(), 
      channelId: activeChannel,  
      userId: userId,  
      username
    };
  
    try {
      // Etkinliği oluştur
      const response = await fetch('http://localhost:3000/api/create-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
  
      const eventResponseData = await response.json();
  
      if (!response.ok) {
        throw new Error(eventResponseData.message || 'Etkinlik oluşturulamadı');
      }

      const formattedDateTime = formatDateTime(date);
      
      // ✅ **Etkinlik başarıyla oluşturuldu, şimdi bildirim ekleyelim**
      const notificationData = {
        title: 'Yeni Etkinlik!📣',
        message: `📅 ${formattedDateTime} tarihinde ${description} etkinliği oluşturuldu.`,
        eventId: eventResponseData._id, // Etkinlik ID'sini bildirime ekliyoruz
        userId, // Bildirimi etkinliği oluşturan kişiye bağlıyoruz
        channelId: activeChannel, // Kanal bazlı bildirim
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
  
      // 📌 **Tarih işaretleme (HomePage için)**
      const updatedMarkedDates = {
        ...markedDates,
        [date]: {
          ...eventData,
          selected: true,
          marked: true,
        },
      };
      setMarkedDates(updatedMarkedDates);
  
      // 📌 **Sayfayı güncelle**
      navigation.navigate('HomePage', {
        markedDates: updatedMarkedDates,
      });
  
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  

  useEffect(() => {
    const getUsername = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUsername(parsedUser.username);
        }
      } catch (error) {
        console.error('Kullanıcı adı alınamadı:', error);
      }
    };

    getUsername();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer } marginTop='30'>
        <Icon name="person" size={30} color="#000" />
        <Text style={styles.labeluser}><Text style={styles.user}>   {username}</Text> </Text>
      </View>

      <View style={styles.labelContainer}>
        <Icon name="calendar" size={30} color="#000" />
        <View style={styles.dateContainer}>
          <DateTimePicker value={date || new Date()} mode="date" display="default" onChange={handleDateChange} />
          <Text style={[styles.date, { marginRight: 10, fontSize: 24, fontWeight: 'bold' }]}>      :   </Text>
          <DateTimePicker value={time || new Date()} mode="time" display="default" onChange={handleTimeChange} />
        </View>
      </View>

      <View style={styles.inputContainer}>
      <Icon name="location" size={30} color="#000" />
        <TextInput style={styles.input} placeholder="Yer" value={location} placeholderTextColor="#808080" onChangeText={setLocation} />
      </View>

      <View style={styles.inputContainer}>
      <Icon name="document-text" size={30} color="#000" />
      <TextInput style={styles.input} placeholder="Açıklama" value={description} placeholderTextColor="#808080" multiline onChangeText={setDescription} />
      </View>
    
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          handleAddEvent();
        }}>
        <Text style={styles.addButtonText}>EKLE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddEventScreen;



const styles = StyleSheet.create({
  container:{
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20,

  },
  labelContainer:{
    marginBottom: 15,
    flexDirection: 'row', 
    alignItems: 'center',  // İkon ve metni aynı hizada tutar
    marginBottom: 10, 
  },
  inputContainer: {
    marginBottom: 15,
    flexDirection: 'row', 
    alignItems: 'center',  // İkon ve metni aynı hizada tutar
    marginBottom: 10 
  },
  user:{
    fontSize: 20,
    fontWeight: "lighter",
    color: '#062925',
    marginBottom: 5,
  },
  dateContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 8, 
    marginBottom: 10, 
    marginLeft:3,
    width:340,
    height:45,
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#044a42',  
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

  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  addButton: {
    backgroundColor: '#4CAF50', 
    marginTop: 20, 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  addButtonText: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  
});
