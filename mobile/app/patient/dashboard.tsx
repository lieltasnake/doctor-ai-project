import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../_context/AppContext';
import AnimatedAvatar from '../_components/AnimatedAvatar';

export default function PatientDashboard() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const handleSupportChat = (topic: string) => {
    router.push({ pathname: '/patient/chat', params: { topic } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{t('patient_dashboard')}</Text>
            <Text style={styles.subtitle}>{t('how_can_we_help')}</Text>
          </View>
          <AnimatedAvatar 
            uri={context?.user?.profile_image} 
            size={50} 
            onPress={() => router.push('/patient/profile')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>{t('support_services')}</Text>

        <TouchableOpacity style={styles.card} onPress={() => handleSupportChat('Pregnancy')}>
          <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
            <FontAwesome5 name="baby" size={24} color="#E91E63" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('pregnancy_support')}</Text>
            <Text style={styles.cardDescription}>{t('pregnancy_desc')}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handleSupportChat('Diabetes')}>
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <FontAwesome5 name="burn" size={24} color="#2196F3" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('diabetes_support')}</Text>
            <Text style={styles.cardDescription}>{t('diabetes_desc')}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => handleSupportChat('Mental Health')}>
          <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
            <FontAwesome5 name="brain" size={24} color="#9C27B0" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t('mental_health_support')}</Text>
            <Text style={styles.cardDescription}>{t('mental_health_desc')}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24, paddingBottom: 20,
    backgroundColor: '#0A74DA',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#E0F2FE', fontWeight: '500' },
  scrollContainer: { padding: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2A3A', marginBottom: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  iconContainer: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#64748B' },
  arrow: { fontSize: 20, color: '#CBD5E1', fontWeight: 'bold' }
});
