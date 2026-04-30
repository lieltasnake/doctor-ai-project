import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppContext } from './_context/AppContext';

const API_URL = 'http://192.168.43.252:5000/api/auth';
const PROFILE_URL = 'http://192.168.43.252:5000/api/profile';

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const context = useContext(AppContext);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace('/');
    }
  }, [email]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
        // Handle paste
        const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        pasted.forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Fetch profile
        const profileRes = await fetch(PROFILE_URL, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        
        if (profileRes.ok) {
          const userData = await profileRes.json();
          await context?.login(data.token, userData);
          
          if (userData.role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/patient/dashboard');
          }
        } else {
          Alert.alert('Error', 'Could not load profile');
        }
      } else {
        Alert.alert('Verification Failed', data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setResending(true);
    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
        setTimeLeft(60);
      } else {
        const data = await response.json();
        Alert.alert('Failed', data.message || 'Could not resend OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not connect to the server.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉️</Text>
          </View>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                keyboardType="numeric"
                maxLength={6}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={timeLeft > 0 || resending}>
            <Text style={[styles.resendLink, timeLeft > 0 && styles.resendLinkDisabled]}>
              {resending ? 'Sending...' : (timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP')}
            </Text>
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
  iconCircle: { width: 70, height: 70, backgroundColor: '#E0F2FE', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  iconText: { fontSize: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A2A3A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  emailText: { fontSize: 15, color: '#0A74DA', fontWeight: '600', marginTop: 4 },
  formContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  otpInput: { width: 45, height: 55, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  verifyButton: { backgroundColor: '#0A74DA', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#0A74DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: '#64748B', fontSize: 15 },
  resendLink: { color: '#0A74DA', fontSize: 15, fontWeight: '700' },
  resendLinkDisabled: { color: '#94A3B8' }
});
