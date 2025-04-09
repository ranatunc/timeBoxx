import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyAndSecurityPage = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('privacy_security')}</Text>

        <Text style={styles.subTitle}>{t('introduction')}</Text>
        <Text style={styles.paragraph}>{t('introduction_text')}</Text>

        <Text style={styles.subTitle}>{t('collected_data')}</Text>
        <Text style={styles.paragraph}>{t('collected_data_text')}</Text>
        <Text style={styles.listItem}>- {t('account_info')}</Text>
        <Text style={styles.listItem}>- {t('usage_data')}</Text>
        <Text style={styles.listItem}>- {t('device_info')}</Text>

        <Text style={styles.subTitle}>{t('data_usage')}</Text>
        <Text style={styles.paragraph}>{t('data_usage_text')}</Text>
        <Text style={styles.listItem}>- {t('functionality')}</Text>
        <Text style={styles.listItem}>- {t('user_experience')}</Text>
        <Text style={styles.listItem}>- {t('updates')}</Text>
        <Text style={styles.listItem}>- {t('legal_requirements')}</Text>

        <Text style={styles.subTitle}>{t('data_security')}</Text>
        <Text style={styles.paragraph}>{t('data_security_text')}</Text>

        <Text style={styles.subTitle}>{t('data_sharing')}</Text>
        <Text style={styles.paragraph}>{t('data_sharing_text')}</Text>
        <Text style={styles.listItem}>- {t('legal_obligations')}</Text>
        <Text style={styles.listItem}>- {t('user_consent')}</Text>
        <Text style={styles.listItem}>- {t('service_providers')}</Text>

        <Text style={styles.subTitle}>{t('cookies')}</Text>
        <Text style={styles.paragraph}>{t('cookies_text')}</Text>

        <Text style={styles.subTitle}>{t('data_storage')}</Text>
        <Text style={styles.paragraph}>{t('data_storage_text')}</Text>

        <Text style={styles.subTitle}>{t('user_rights')}</Text>
        <Text style={styles.paragraph}>{t('user_rights_text')}</Text>

        <Text style={styles.subTitle}>{t('privacy_updates')}</Text>
        <Text style={styles.paragraph}>{t('privacy_updates_text')}</Text>

        <Text style={styles.subTitle}>{t('contact')}</Text>
        <Text style={styles.paragraph}>{t('contact_text')}</Text>
        <Text style={styles.paragraph}>timeboxxr.a@gmail.com</Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyAndSecurityPage;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    marginBottom: 5,
  },
});
