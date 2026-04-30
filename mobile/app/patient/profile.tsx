import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from '../_context/AppContext';
import AnimatedAvatar from '../_components/AnimatedAvatar';

const API_URL = 'http://192.168.43.252:5000/api';

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(context?.user?.full_name || '');
  const [saving, setSaving] = useState(false);

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
      context?.updateUser({ profile_image: imageUri }); // Update UI immediately
      
      try {
        await fetch(`${API_URL}/profile/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context?.token}`,
            'Bypass-Tunnel-Reminder': 'true'
          },
          body: JSON.stringify({ profile_image: imageUri })
        });
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save profile image to server');
      }
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${context?.token}`
        },
        body: JSON.stringify({ full_name: fullName, email: context?.user?.email })
      });
      if (response.ok) {
        context?.updateUser({ full_name: fullName });
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update name');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
         </TouchableOpacity>
        <Text style={styles.title}>{t('my_profile')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
            <AnimatedAvatar uri={context?.user?.profile_image} size={100} style={styles.avatarOverride} />
            <View style={styles.editAvatarBadge}>
              <FontAwesome5 name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          {isEditing ? (
            <TextInput 
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              autoFocus
            />
          ) : (
            <Text style={styles.userName}>{context?.user?.full_name}</Text>
          )}

          <Text style={styles.userRole}>{context?.user?.role === 'admin' ? 'Admin' : 'Patient'}</Text>

          <TouchableOpacity 
            style={styles.editProfileButton} 
            onPress={() => isEditing ? handleSaveName() : setIsEditing(true)}
            disabled={saving}
          >
            {saving ? <ActivityIndicator size="small" color="#0A74DA" /> : (
              <Text style={styles.editProfileText}>
                {isEditing ? t('save_name') : t('edit_name')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="envelope" size={18} color="#0A74DA" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('email_address')}</Text>
              <Text style={styles.infoValue}>{context?.user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="calendar-alt" size={18} color="#0A74DA" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{t('joined_date')}</Text>
              <Text style={styles.infoValue}>{formatDate(context?.user?.created_at)}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#0A74DA', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  backButton: { marginBottom: 10 }, backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  scrollContainer: { padding: 24 },
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, marginBottom: 20 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarOverride: { borderWidth: 3, borderColor: '#0A74DA', borderRadius: 50 },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0A74DA', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  nameInput: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, borderBottomWidth: 1, borderColor: '#0A74DA', textAlign: 'center', minWidth: 150 },
  userRole: { fontSize: 16, color: '#0A74DA', fontWeight: '600', backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16, overflow: 'hidden', textTransform: 'capitalize' },
  editProfileButton: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  editProfileText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, backgroundColor: '#E0F2FE', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 }
});
