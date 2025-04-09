import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Çeviri dosyaları
const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      save: "Save",
      cancel: "Cancel",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone",
      password: "Password",
      email: "Email",
      gender: "Gender",
      save:"Save",
      image_permission:"Permission to access the photo library is required!",
      user_not_found:"User ID not found!",
      profile_updated:"Profile updated successfully!",
      error_while_updating_profile:"Error updating profile:",
      an_error_occurred:"An error has occurred!",
      The_changes_will_be_saved_Do_you_approve:"The changes will be saved. Do you approve?",
      confirm:"Confirm",
      close:"Close",
      language:"Language",
      location:"Region",
      channel:"My Channels",
      edit_profile:"Edit Profile",
      log_out:"Log Out",
      notification:"Notifications",
      privacy:"Privacy and Security",
      privacy_security: "Privacy Policy and Security",
      introduction: "Introduction",
      introduction_text: "This Privacy Policy explains how timeBox collects, uses, protects, and shares user personal data. We take user privacy and security seriously. Please read this policy carefully.",
      
      collected_data: "Collected Information",
      collected_data_text: "We may collect the following personal information while using the app:",
      account_info: "Account Information: Includes name, email address, phone number, etc.",
      usage_data: "Usage Data: Information about how the app is used.",
      device_info: "Device Information: Technical data such as device type, OS, IP address.",
      
      data_usage: "Data Usage",
      data_usage_text: "We may use the collected data for the following purposes:",
      functionality: "Ensuring and improving app functionality.",
      user_experience: "Enhancing user experience.",
      updates: "Sending app updates.",
      legal_requirements: "Complying with legal requirements.",
      
      data_security: "Data Security",
      data_security_text: "Personal data is stored and processed securely. However, we cannot guarantee 100% security of data transmission over the internet.",
      
      data_sharing: "Data Sharing",
      data_sharing_text: "Your personal data may only be shared with third parties under the following conditions:",
      legal_obligations: "Due to legal obligations.",
      user_consent: "Transactions with user consent.",
      service_providers: "With service providers or business partners.",
      
      cookies: "Cookies",
      cookies_text: "The app may use cookies to improve user experience. You can manage cookies in your browser settings.",
      
      data_storage: "Data Storage",
      data_storage_text: "Personal data is stored until the account is closed unless legally required.",
      
      user_rights: "User Rights",
      user_rights_text: "Users have the right to access, correct, delete, or transfer their personal data. You can contact us to exercise these rights.",
      
      privacy_updates: "Privacy Policy Updates",
      privacy_updates_text: "This Privacy Policy may be updated from time to time. Changes will be announced in the app.",
      
      contact: "Contact",
      contact_text: "For questions about our privacy policy, you can contact us at:",
    },
  },
  tr: {
    translation: {
      welcome: "Hoş Geldiniz",
      save: "Kaydet",
      cancel: "İptal",
      firstName: "Ad",
      password: "Şifre",
      lastName: "Soyad",
      phone: "Telefon",
      email: "E-posta",
      gender: "Cinsiyet",
      male: "Erkek",
      female: "Kadın",
      other: "Diğer",
      save:"Kaydet",
      image_permission:"Fotoğraf kütüphanesine erişim izni gereklidir!",
      user_not_found:"User ID bulunamadı!",
      profile_updated:"Profil başarıyla güncellendi!",
      error_while_updating_profile:"Profil güncellenirken hata oluştu:",
      an_error_occurred:"Bir hata oluştu!",
      The_changes_will_be_saved_Do_you_approve:"Değişiklikler kaydedilecektir. Onaylıyor musunuz?",
      confirm:"Onayla",
      close:"Kapat",
      language:"Diller",
      location:"Bölge",
      channel:"Kanallarım",
      edit_profile:"Profili Düzenle",
      log_out:"Oturumu Kapat",
      notification:"Bildirimler",
      privacy:"Gizlilik ve Güvenlik",
      privacy_security: "Gizlilik Politikası ve Güvenlik",
      introduction: "Giriş",
      introduction_text: "Bu Gizlilik Politikası, timeBox uygulamasının kullanıcılarının kişisel verilerinin nasıl toplandığını, kullanıldığını, korunduğunu ve paylaşıldığını açıklamak amacıyla hazırlanmıştır. Kullanıcıların gizliliğine ve güvenliğine büyük önem veriyoruz. Lütfen bu politikayı dikkatlice okuyun.",
      
      collected_data: "Toplanan Bilgiler",
      collected_data_text: "Uygulamayı kullanırken aşağıdaki kişisel bilgileri toplayabiliriz:",
      account_info: "Hesap Bilgileri: Ad, e-posta adresi, telefon numarası gibi bilgileri içerir.",
      usage_data: "Kullanım Verileri: Uygulamanın nasıl kullanıldığına dair bilgiler.",
      device_info: "Cihaz Bilgileri: Cihaz türü, işletim sistemi, IP adresi gibi teknik veriler.",
      
      data_usage: "Veri Kullanımı",
      data_usage_text: "Topladığımız verileri aşağıdaki amaçlarla kullanabiliriz:",
      functionality: "Uygulama işlevselliğini sağlamak ve geliştirmek.",
      user_experience: "Kullanıcı deneyimini iyileştirmek.",
      updates: "Uygulama güncellemelerini iletmek.",
      legal_requirements: "Yasal gereklilikleri yerine getirmek.",
      
      data_security: "Veri Güvenliği",
      data_security_text: "Kişisel veriler güvenli bir şekilde saklanır ve işlenir. Ancak internet üzerindeki veri iletiminin %100 güvenli olacağını garanti edemeyiz.",
      
      data_sharing: "Veri Paylaşımı",
      data_sharing_text: "Kişisel verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:",
      legal_obligations: "Yasal yükümlülükler gereği.",
      user_consent: "Kullanıcı onayı ile yapılan işlemler.",
      service_providers: "Hizmet sağlayıcıları veya iş ortakları.",
      
      cookies: "Çerezler",
      cookies_text: "Uygulama, kullanıcı deneyimini geliştirmek için çerezleri kullanabilir. Çerezleri tarayıcınızın ayarlarından yönetebilirsiniz.",
      
      data_storage: "Veri Saklama",
      data_storage_text: "Kişisel veriler, kanunen zorunlu olmadıkça hesap kapatılana kadar saklanır.",
      
      user_rights: "Kullanıcı Hakları",
      user_rights_text: "Kullanıcıların kişisel verilerine erişme, bunları düzeltme, silme veya aktarma hakları vardır. Bu hakları kullanmak için bizimle iletişime geçebilirsiniz.",
      
      privacy_updates: "Gizlilik Politikası Güncellemeleri",
      privacy_updates_text: "Bu Gizlilik Politikası zaman zaman güncellenebilir.Değişiklikler uygulama içinde duyurulacaktır.",
      
      contact: "İletişim",
      contact_text: "Gizlilik politikamızla ilgili sorularınız için bizimle şu adresten iletişime geçebilirsiniz:",
    },
  },
};

// i18next yapılandırması
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // Varsayılan dil Türkçe
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React Native için gerekli
    },
  });

// 📌 AsyncStorage ile dili kaydetme ve yükleme
export const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('language');
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
};

export default i18n;