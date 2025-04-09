// PasswordPage.js
import React, { useState } from 'react';
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

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength('Weak');
    } else if (password.length >= 6 && password.length < 12) {
      setPasswordStrength('Medium');
    } else {
      setPasswordStrength('Strong');
    }
  };

  const hasUppercase = (password) => /[A-Z]/.test(password);
  const hasPunctuation = (password) => /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

  const simulatePasswordUpdate = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccessMessage(t("Şifreniz başarıyla güncellendi."));
      setErrorMessage('');
      setIsLoading(false);
      setTimeout(() => {
        setIsModalVisible(false);
        navigation.goBack();
      }, 2000);
    }, 1500);
  };

  const toggleVisibility = (field) => {
    if (field === 'old') setOldPasswordVisible(!oldPasswordVisible);
    if (field === 'new') setNewPasswordVisible(!newPasswordVisible);
    if (field === 'confirm') setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage(t("Şifreler eşleşmiyor!"));
      setSuccessMessage('');
      openModal();
      return;
    }

    if (!hasUppercase(newPassword) || !hasPunctuation(newPassword)) {
      setErrorMessage(t("Şifre en az bir büyük harf ve noktalama işareti içermelidir!"));
      setSuccessMessage('');
      openModal();
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    openModal();
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      <View style={styles.form}>
        <Text style={styles.label}>{t("Eski Şifre")}</Text>
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

        <Text style={styles.label}>{t("Yeni Şifre")}</Text>
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

        <Text style={styles.label}>{t("Yeni Şifre Tekrar")}</Text>
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
          <Text style={styles.addButtonText}>{t("save")}</Text>
        </TouchableOpacity>

        {/* Modal */}
        <Modal visible={isModalVisible} transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {errorMessage ? (
                <>
                  <Text style={styles.modalTitle}>{errorMessage}</Text>
                  <TouchableOpacity style={styles.confirmButton} onPress={closeModal}>
                    <Text style={styles.confirmButtonText}>{t("close")}</Text>
                  </TouchableOpacity>
                </>
              ) : successMessage ? (
                <>
                  <Text style={styles.modalTitle}>{successMessage}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>{t("Yeni şifrenizi onaylıyor musunuz?")}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={simulatePasswordUpdate}>
                      <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                      <Text style={styles.confirmButtonText}>{t("close")}</Text>
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
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  form: { marginVertical: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 5 },
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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', padding: 20, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, color: '#fff', marginBottom: 10, textAlign: 'center' },
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