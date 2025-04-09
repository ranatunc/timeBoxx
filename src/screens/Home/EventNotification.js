import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // Kullanıcı ID'yi al
        if (!userId) {
          console.error("Kullanıcı ID bulunamadı!");
          return;
        }
  
        const response = await fetch(`http://localhost:3000/api/notifications/${userId}`);
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP Error! Status: ${response.status}, Response: ${text}`);
        }
  
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Bildirimler alınamadı:", error);
      }
    };
  
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/mark-as-read/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
  
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenemedi:", error);
    }
  };
  

  return (
    <View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              markAsRead(item._id);
              //navigateyi kaldırdım gerek var mı bilemedim!!
              
            }}
          >
            <View
              style={{
                padding: 15,
                borderBottomWidth: 1,
                borderColor: "#ccc",
                backgroundColor: item.isRead ? "#fff" : "#eef",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
              <Text>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default NotificationPage;
