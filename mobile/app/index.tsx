import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AppContext } from './_context/AppContext';

const API_URL = 'http://192.168.43.252:5000/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto Login Logic
  useEffect(() => {
    if (!context?.loading && context?.user) {
      if (context.user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/patient/dashboard');
      }
    }
  }, [context?.user, context?.loading]);

  if (context?.loading || context?.user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A74DA" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Required Field', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ email })
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
          // Navigate to OTP screen
          router.push({ pathname: '/otp', params: { email } });
      } else {
        Alert.alert('Login Failed', data?.message || `Error ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Could not connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const t = context?.t || ((key: string) => key);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>+</Text>
          </View>
          <Text style={styles.title}>Doctor AI</Text>
          <Text style={styles.subtitle}>{t('sign_in') || 'Sign In'}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email_address')}</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>{t('sign_in_btn') || 'Continue'}</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('new_to_app') || 'New to Doctor AI? '}</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.signupLink}>{t('create_account') || 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 70, height: 70, backgroundColor: '#0A74DA', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  logoText: { fontSize: 40, color: '#FFFFFF', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '800', color: '#1A2A3A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 16, color: '#1E293B' },
  loginButton: { backgroundColor: '#0A74DA', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 10, shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748B', fontSize: 15 },
  signupLink: { color: '#0A74DA', fontSize: 15, fontWeight: '700' }
});
