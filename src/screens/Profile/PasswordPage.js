import React, { useState, useEffect, } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '/Users/ranatunc/Desktop/timeBoxx/src/config/config.js'; 

const PasswordPage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength(t('password_page.weak'));
    } else if (password.length >= 6 && password.length < 12) {
      setPasswordStrength(t('password_page.medium'));
    } else {
      setPasswordStrength(t('password_page.strong'));
    }
  };

useEffect(() => {
  const fetchUserId = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserId(storedUserId);
  };

  fetchUserId();
}, []);


  const hasUppercase = (password) => /[A-Z]/.test(password);
  const hasPunctuation = (password) => /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

  const toggleVisibility = (field) => {
    if (field === 'old') setOldPasswordVisible(!oldPasswordVisible);
    if (field === 'new') setNewPasswordVisible(!newPasswordVisible);
    if (field === 'confirm') setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("password_page.passwords_do_not_match"));
      setSuccessMessage('');
      openModal();
      return;
    }

    if (!hasUppercase(newPassword) || !hasPunctuation(newPassword)) {
      setErrorMessage(t("password_page.password_requirements"));
      setSuccessMessage('');
      openModal();
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    openModal();
  };
  const simulatePasswordUpdate = async () => {
    setIsLoading(true);
  
    if (!userId) {
      setErrorMessage(t("password_page.user_id_not_found"));
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldPassword,
          newPassword,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setErrorMessage(data.message || t("password_page.password_update_failed"));
        setSuccessMessage('');
      } else {
        setSuccessMessage(t("password_page.password_update_success"));
        setErrorMessage('');
        setTimeout(() => {
          setIsModalVisible(false);
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      setErrorMessage(t("password_page.unable_to_connect_server"));
      setSuccessMessage('');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      <View style={styles.form}>
        <Text style={styles.label}>{t("password_page.old_password")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!oldPasswordVisible}
          />
          <TouchableOpacity onPress={() => toggleVisibility('old')} style={styles.iconButton}>
            <Icon name={oldPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t("password_page.new_password")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              checkPasswordStrength(text);
            }}
            secureTextEntry={!newPasswordVisible}
          />
          <TouchableOpacity onPress={() => toggleVisibility('new')} style={styles.iconButton}>
            <Icon name={newPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t("password_page.confirm_new_password")}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => toggleVisibility('confirm')} style={styles.iconButton}>
            <Icon name={confirmPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={styles.strengthText}>{passwordStrength}</Text>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#044a42' }]}
          onPress={handleSubmit}
        >
          <Text style={styles.addButtonText}>{t("password_page.save")}</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {errorMessage ? (
                <>
                  <Text style={styles.modalTitle}>{errorMessage}</Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={closeModal}>
                    <Text style={styles.confirmButtonText}>{t("password_page.close")}</Text>
                  </TouchableOpacity>
                </>
              ) : successMessage ? (
                <>
                  <Text style={styles.modalTitle}>{successMessage}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>{t("password_page.confirm_password_change")}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={simulatePasswordUpdate}>
                      <Text style={styles.confirmButtonText}>{t("password_page.confirm")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                      <Text style={styles.confirmButtonText}>{t("password_page.close")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  form: { 
    marginVertical: 20 
  },
  label: {
    fontSize: 14, 
    color: '#555', 
    marginBottom: 5 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  iconButton: {
    padding: 5,
  },
  addButton: {
    marginTop: 50,
    borderRadius: 25,
    padding: 15,
    width: '50%',
    left: 95,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
    },
  modalContent: { 
    width: '80%', 
    padding: 20, 
    backgroundColor: '#333', 
    borderRadius: 10, 
    alignItems: 'center'
   },
  modalTitle: { 
    fontSize: 18, 
    color: '#fff', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  buttonContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  confirmButton: {
    width: '48%',
    height: 50,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cancelButton: {
    width: '48%',
    height: 50,
    backgroundColor: '#DC3545',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  strengthText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});

export default PasswordPage;