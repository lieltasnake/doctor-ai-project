import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../_context/AppContext';

export default function AdminDashboard() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const handleLogout = async () => {
    await context?.logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('admin_dashboard')}</Text>
          <Text style={styles.subtitle}>{t('manage_platform')}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <Text style={styles.sectionTitle}>{t('system_status')}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,245</Text>
            <Text style={styles.statLabel}>Active Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>98.5%</Text>
            <Text style={styles.statLabel}>AI Accuracy</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
        
        <View style={styles.activityCard}>
          <FontAwesome5 name="check-circle" size={20} color="#10B981" />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>System Update Complete</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#1E293B', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  logoutButton: { padding: 10, backgroundColor: '#334155', borderRadius: 12 },
  scrollContainer: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, marginTop: 10 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 0.48, backgroundColor: '#1E293B', borderRadius: 20, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#38BDF8', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#94A3B8' },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 12 },
  activityContent: { marginLeft: 16, flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  activityTime: { fontSize: 13, color: '#94A3B8' }
});
