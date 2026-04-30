import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from './_context/AppContext';

const API_URL = 'http://192.168.43.252:5000/api/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Required Fields', 'Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password })
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Alert.alert('Server Error', `Invalid response from server: ${text.substring(0, 100)}`);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        Alert.alert('Success', 'Account created successfully! Please sign in.');
        router.replace('/');
      } else {
        Alert.alert('Registration Failed', data.message || `Error ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
           </TouchableOpacity>
          <Text style={styles.title}>{t('create_account')}</Text>
          <Text style={styles.subtitle}>Join Doctor AI today</Text>
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
            <Text style={styles.label}>{t('password')}</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#999" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>{t('create_account')}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 30 },
  backButton: { marginBottom: 15 },
  backButtonText: { color: '#0A74DA', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '800', color: '#1A2A3A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B' },
  registerButton: { backgroundColor: '#0A74DA', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
