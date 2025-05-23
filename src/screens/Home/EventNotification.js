import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState, useLayoutEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const NotificationPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          return;
        }

        setUserId(storedUserId);

        const response = await fetch(`${API_URL}/api/notifications/${storedUserId}`);


        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP Error! Status: ${response.status}, Response: ${text}`);
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
      }
    };
    

    fetchNotifications();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={markAllAsRead}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: '#007bff', fontWeight: 'bold' }}>
            {t('mark_all_as_read')}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [notifications]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/mark-as-read/${id}`, {
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
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      const response = await fetch(`${API_URL}/api/notifications/mark-as-read-by-user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
    }
  };

  const deleteNotification = async (id) => {
    Alert.alert(
      t('delete'),
      t('confirm_delete_notification'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('yes'),
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/notifications/${id}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
              }

              setNotifications((prev) => prev.filter((notif) => notif._id !== id));
            } catch (error) {
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        extraData={notifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (!item.isRead) {
                    markAsRead(item._id);
                  }
                }}
              >
              <View
                style={{
                  padding: 15,
                  marginHorizontal: 10,
                  marginVertical: 5,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: item.isRead ? "#ffffff" : "#ddeeff",
                }}
              >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: "bold", flex: 1 }}>{t(item.titleKey)}</Text>
                  <TouchableOpacity onPress={() => deleteNotification(item._id)}>
                    <Icon name="trash" size={22} color="red" />
                  </TouchableOpacity>
                </View>
                <Text>{t(item.messageKey, item.messageParams)}</Text>
              </View>
            </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#888" }}>{t('no_notifications')}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default NotificationPage;