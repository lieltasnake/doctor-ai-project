import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from '../_context/AppContext';

export default function HistoryScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const historyData = [
    { id: 1, type: 'Pregnancy', date: '2023-10-25', time: '14:30' },
    { id: 2, type: 'Diabetes', date: '2023-10-20', time: '09:15' },
    { id: 3, type: 'Mental Health', date: '2023-10-15', time: '18:45' },
  ];

  const getTopicTranslation = (topicStr: string) => {
    if (topicStr === 'Pregnancy') return t('pregnancy_support');
    if (topicStr === 'Diabetes') return t('diabetes_support');
    if (topicStr === 'Mental Health') return t('mental_health_support');
    return t('patient_dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
         </TouchableOpacity>
        <Text style={styles.title}>{t('chat_history')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {historyData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            onPress={() => router.push({ pathname: '/patient/chat', params: { topic: item.type } })}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{getTopicTranslation(item.type)}</Text>
              <Text style={styles.cardDate}>{item.date} at {item.time}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  cardDate: { fontSize: 14, color: '#64748B' },
  arrow: { fontSize: 20, color: '#0A74DA', fontWeight: 'bold' }
});
