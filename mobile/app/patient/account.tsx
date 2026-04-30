import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../_context/AppContext';
import AnimatedAvatar from '../_components/AnimatedAvatar';

const API_URL = 'http://192.168.43.252:5000/api';

export default function ManageAccount() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const [fullName, setFullName] = useState(context?.user?.full_name || '');
  const [email, setEmail] = useState(context?.user?.email || '');
  const [password, setPassword] = useState('');
  const [language, setLanguageLocal] = useState(context?.user?.language || 'English');
  const [saving, setSaving] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      context?.updateUser({ profile_image: imageUri });
      
      await fetch(`${API_URL}/profile/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${context?.token}` },
        body: JSON.stringify({ profile_image: imageUri })
      });
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${context?.token}` },
        body: JSON.stringify({ full_name: fullName, email, password })
      });

      if (language !== context?.language) {
        await context?.setLanguage(language);
      }

      if (res.ok) {
        context?.updateUser({ full_name: fullName, email });
        Alert.alert('Success', 'Account updated successfully!');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update account');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not connect to server');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await context?.logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
         </TouchableOpacity>
        <Text style={styles.title}>{t('manage_account')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.photoContainer}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
            <AnimatedAvatar uri={context?.user?.profile_image} size={90} style={styles.avatarOverride} />
            <View style={styles.editBadge}><FontAwesome5 name="camera" size={12} color="#FFF" /></View>
          </TouchableOpacity>
          <Text style={styles.photoText}>{t('tap_change_photo')}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('full_name')}</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email_address')}</Text>
            <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('change_password')}</Text>
            <TextInput style={styles.input} placeholder={t('leave_blank')} placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('app_language')}</Text>
            <TouchableOpacity style={styles.languageSelector} onPress={() => setShowLangMenu(!showLangMenu)}>
              <Text style={styles.languageText}>{language}</Text>
              <FontAwesome5 name="chevron-down" size={14} color="#64748B" />
            </TouchableOpacity>
            
            {showLangMenu && (
              <View style={styles.dropdownMenu}>
                {['English', 'Amharic', 'Afaan Oromo'].map((lang) => (
                  <TouchableOpacity key={lang} style={styles.dropdownItem} onPress={() => { setLanguageLocal(lang); setShowLangMenu(false); }}>
                    <Text style={styles.dropdownText}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>{t('save_changes')}</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#0A74DA', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, zIndex: 10 },
  backButton: { marginBottom: 10 }, backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  scrollContainer: { padding: 24 },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  avatarOverride: { borderWidth: 3, borderColor: '#FFF', borderRadius: 45 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0A74DA', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  photoText: { marginTop: 8, color: '#64748B', fontSize: 13 },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, marginBottom: 20, zIndex: 1 },
  inputGroup: { marginBottom: 20, zIndex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B' },
  languageSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16 },
  languageText: { fontSize: 16, color: '#1E293B' },
  dropdownMenu: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownText: { fontSize: 16, color: '#1E293B' },
  updateButton: { backgroundColor: '#0A74DA', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10 },
  updateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 16, padding: 16, alignItems: 'center' },
  logoutButtonText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' }
});
