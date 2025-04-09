import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const EventCalendar = ({ channelId }) => { // Kanal ID prop olarak alınıyor
  const [events, setEvents] = useState({});
  
  useEffect(() => {
    if (channelId) {
      fetchEvents(channelId);
    }
  }, [channelId]); // Kanal değiştikçe yeniden veri çeker

  const fetchEvents = async (channelId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${channelId}`);
      const data = await response.json();

      const formattedEvents = {};
      data.forEach(event => {
        const date = event.date.split('T')[0]; // YYYY-MM-DD formatına çevir
        formattedEvents[date] = {
          marked: true,
          dotColor: getRandomColor(),
          selectedColor: getRandomColor(),
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
    }
  };

  // Rastgele renk üreten fonksiyon
  const getRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC300'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <View>
      <Calendar
        markedDates={events}
        markingType="dot"
      />
    </View>
  );
};

export default EventCalendar;
