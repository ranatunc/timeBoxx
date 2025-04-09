import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Icon from 'react-native-vector-icons/Ionicons';

const randomNames = ['Arzu', 'Ayşe', 'Mehmet', 'Ali', 'Zeynep']; 

const GoalsDetailPage = ({ route, navigation }) => {
  const { goal, setGoals, goals } = route.params;  // goals parametresini de alıyoruz
  const [task, setTask] = useState(''); 
  const [tasks, setTasks] = useState(goal.tasks || []); 
  const [contribution, setContribution] = useState('');
  const [savedAmount, setSavedAmount] = useState(goal.biriktirilen || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [contributions, setContributions] = useState(goal.contributions || []); // Her hedefin katkıları

  // Katkı ekleme işlemi
  const handleAddContribution = async () => {
    if (savedAmount >= goal.miktar) {
      Alert.alert('Bilgi', 'Hedeflenen tutara ulaşıldı, artık katkı yapamazsınız.');
      return;
    }

    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin.');
      return;
    }

    const newSavedAmount = savedAmount + amount;
    if (newSavedAmount > goal.miktar) {
      Alert.alert('Bilgi', `Hedeflenen tutarı aşamazsınız. Maksimum ekleyebileceğiniz miktar: ${goal.miktar - savedAmount} TL`);
      return;
    }

    setSavedAmount(newSavedAmount);
    setContribution('');

    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const newContribution = { id: Date.now(), name: randomName, amount };

    // Katkıları güncelleme
    setContributions((prevContributions) => {
      const updatedContributions = [...prevContributions, newContribution];
      // Hedefin katkılarını AsyncStorage'a kaydetme
      AsyncStorage.setItem('userContributions', JSON.stringify(updatedContributions)); 
      return updatedContributions;
    });

    // Güncellenmiş hedefi kaydetme
    const updatedGoal = { ...goal, biriktirilen: newSavedAmount, contributions: [...contributions, newContribution] };
    setGoals((prevGoals) => {
      const updatedGoals = prevGoals.map((g) => (g.id === goal.id ? updatedGoal : g));
      AsyncStorage.setItem('userGoals', JSON.stringify(updatedGoals)); 
      return updatedGoals;
    });
  };

  // Hedefi silme fonksiyonu
  const handleDeleteGoal = () => {
    Alert.alert(
      'Silme Onayı',
      'Bu hedefi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: () => {
            setGoals((prevGoals) => {
              const updatedGoals = prevGoals.filter(g => g.id !== goal.id); // Hedefi sil
              AsyncStorage.setItem('userGoals', JSON.stringify(updatedGoals)); // Silinen hedefi AsyncStorage'dan kaldır
              return updatedGoals;
            });

            // Başarılı mesajı
            Alert.alert('Başarılı', 'Hedef silindi.'); 

            // Hedefler sayfasına yönlendir
            setTimeout(() => {
              navigation.navigate('GoalsPage'); // Sayfayı yönlendir
            }, 100); // 100 ms gecikme ekleyin
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  // Hedefin ilerlemesini hesaplama
  const progress = goal.tur === 'Finans' 
    ? savedAmount / goal.miktar
    : tasks.length > 0 
      ? tasks.filter(task => task.completed).length / tasks.length 
      : 0;

  // useLayoutEffect ile headerRight için silme butonunu ayarlama
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteGoal}>
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, goal]); // goal bağımlılığını ekledik

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{goal.baslik}</Text>
        
        <View style={styles.iconContainer}>
          {goal.tur === 'Finans' && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <AntDesign name="user" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.detailText}>Tür: {goal.tur}</Text>
 
      <View style={styles.chartContainer}>
        <ProgressChart
          data={{ data: [progress] }}
          width={200}
          height={150}
          strokeWidth={15}
          radius={35}
          chartConfig={{
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
          }}
        />
      </View>
      
      {goal.tur === 'Finans' ? (
        <>
          <Text style={styles.detailText}>Hedef Tutar: {goal.miktar} TL</Text>
          <Text style={styles.detailText}>Biriktirilen Tutar: {savedAmount} TL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Katkı miktarı girin..."
              keyboardType="numeric"
              value={contribution}
              placeholderTextColor="#808080"
              onChangeText={setContribution}
            />
            <TouchableOpacity onPress={handleAddContribution} style={styles.addButton}>
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {/* Katkı yapan kişileri gösteren modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Katkı Yapan Kişiler</Text>
            <FlatList
              data={contributions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Text style={styles.modalItem}>{item.name}: {item.amount} TL</Text>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  detailText: { fontSize: 18, marginBottom: 10, marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderColor: '#ccc', borderWidth: 1, padding: 10, marginRight: 10, borderRadius: 5 },
  addButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  addButtonText: { color: 'white' },
  iconContainer: { flexDirection: 'row', alignItems: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalItem: { fontSize: 16, marginVertical: 5 },
  closeButton: { color: '#007BFF', textAlign: 'center', marginTop: 20 },
  chartContainer: {
    alignSelf: 'flex-start', 
    justifyContent: 'flex-end', marginTop: 25
  },
  deleteButton: {
    marginRight: 10, // Sağdan biraz boşluk
  },
});

export default GoalsDetailPage;
