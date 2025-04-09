import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage'ı eklemeyi unutmayın
import * as ImagePicker from 'expo-image-picker'; // ImagePicker'ı ekledik
import { Dropdown } from 'react-native-element-dropdown';
import { useTranslation } from 'react-i18next';



const EditProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const genderOptions = [
    { label: t("male"), value: "male" },
    { label: t("female"), value: "female" },
    { label: t("other"), value: "other" },
  ];
  
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mail, setMail] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState(null); // Profil fotoğrafı state'i

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFirstName(parsedUser?.firstName || ''); 
        setLastName(parsedUser?.lastName || '');
        setMail(parsedUser?.mail || '');
        setGender(parsedUser?.gender || '');
        setProfileImage(parsedUser?.profileImage || null); // Profil resmini asyncStorage'dan al
      }
    };
    fetchUser();
  }, []);
  
  const handleProfileImagePick = async () => {
    // Kullanıcıdan fotoğraf izni al
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    alert(t("image_permission"));
    return;
  }

  // Fotoğraf seçme işlemi
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, 
    allowsEditing: true,
    aspect: [1, 1], 
    quality: 1, 
  });

  if (!result.canceled) {
    setProfileImage(result.assets[0].uri); 
  }
  };

  const handleTelephoneChange = (text) => {
    const formattedText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setTelephone(formattedText);
  };

  const profileSave = async () => {
    setIsModalVisible(true);

    
    if (!user || !user._id) {
      alert(t("user_not_found"));
      return;
    }

    const updatedProfile = {
      firstName,
      lastName,
      mail,
      gender,
      profileImage,
    };

    try {
      const response = await fetch(`http://localhost:3000/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();
  
      if (response.ok) {
        alert(t("profile_updated"));
        await AsyncStorage.setItem('user', JSON.stringify(data.user)); // Yeni verileri AsyncStorage'a kaydet
        navigation.goBack();
      } else {
        alert(`Hata: ${data.message}`);
      }
    } catch (error) {
      console.error(t("error_while_updating_profile"), error);
      alert(t("an_error_occurred"));
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const openModal = () => {
    setIsModalVisible(true);
  };
  const closeModal=()=>{
    setIsModalVisible(false);
    navigation.goBack('Profile')
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={handleProfileImagePick}>
          <Image
            source={profileImage ? { uri: profileImage } : { uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{t("firstName")}</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>{t("lastName")}</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>{t("email")}</Text>
        <TextInput
          style={styles.input}
          value={mail}
          onChangeText={setMail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>{t("gender")}</Text>
        <Dropdown
          style={styles.dropdown}
          data={genderOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Gender"
          value={gender}
          onChange={item => setGender(item.value)}
        />

        <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#044a42' }]}
            onPress={openModal} 
        >
            <Text style={styles.addButtonText}>{t("save")}</Text>
        </TouchableOpacity>
        <Modal visible={isModalVisible} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("The_changes_will_be_saved_Do_you_approve")}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.confirmButton} onPress={profileSave}>
                  <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={(closeModal)}>
                  <Text style={styles.confirmButtonText}>{t("close")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  profileImageContainer: { 
    alignItems: 'center', 
    marginVertical: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3a9188',
    marginBottom: 10,
    width: 100,
    height: 100,
    left: 130,
  },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  form: { marginVertical: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  addButton: {
    marginTop: 50,
    borderRadius: 25,
    padding: 15,
    width: '50%',
    left:95,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, color: '#fff', marginBottom: 10 },
  buttonContainer: {
    marginTop:15,
    flexDirection: 'row',  // Yan yana hizalama
    justifyContent: 'space-between',  // Boşluk bırak
    width: '100%',  // Konteyner genişliği
    paddingHorizontal: 10,  // Kenarlardan biraz boşluk bırak
  },
  confirmButton: {
    width: '48%', // Butonlar eşit olsun diye
    height: 50,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  
  cancelButton: {
    width: '48%', // Aynı genişlik
    height: 50,
    backgroundColor: '#DC3545', // Kırmızı iptal butonu
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
