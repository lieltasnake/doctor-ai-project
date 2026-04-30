import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, Modal, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { Audio } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { AppContext } from '../_context/AppContext';
import AnimatedAvatar from '../_components/AnimatedAvatar';

const API_URL = 'http://192.168.43.252:5000/api';

type Message = { id: string; text: string; sender: 'user' | 'ai'; riskLevel?: string };

export default function ChatScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = context?.t || ((k) => k);
  const { topic } = useLocalSearchParams<{ topic: string }>();
  
  const getThemeColor = () => {
    if (topic === 'Pregnancy') return '#E91E63'; 
    if (topic === 'Diabetes') return '#2196F3'; 
    if (topic === 'Mental Health') return '#9C27B0'; 
    return '#0A74DA'; 
  };

  const themeColor = getThemeColor();

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: t('welcome_ai').replace('{topic}', topic || 'Health'), sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ message: text, context: topic })
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const data = await response.json();
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: data.reply || "I'm sorry, I couldn't process that.", sender: 'ai', riskLevel: data.riskLevel };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      Alert.alert('Network Error', error.message || 'Failed to reach the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    setRecording(null);
    setIsRecording(false);
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) await uploadAudio(uri);
  };

  const uploadAudio = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append('audio', { uri, name: 'voice.m4a', type: 'audio/m4a' });
      const response = await fetch(`${API_URL}/voice/upload`, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data', 'Bypass-Tunnel-Reminder': 'true' }});
      const data = await response.json();
      if (data.text) sendMessage(data.text);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload voice message');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOption = async (route: string) => {
    setMenuVisible(false);
    if (route === 'logout') {
      await context?.logout();
      router.replace('/');
    } else {
      router.push(`/patient/${route}`);
    }
  };

  const getTopicTranslation = (topicStr: string) => {
    if (topicStr === 'Pregnancy') return t('pregnancy_support');
    if (topicStr === 'Diabetes') return t('diabetes_support');
    if (topicStr === 'Mental Health') return t('mental_health_support');
    return t('patient_dashboard');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <FontAwesome5 name="chevron-left" size={20} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerText}>{getTopicTranslation(topic || '')}</Text>
        
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <AnimatedAvatar uri={context?.user?.profile_image} size={35} />
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('profile')}>
                <FontAwesome5 name="user" size={16} color="#334155" style={styles.menuIcon} />
                <Text style={styles.menuText}>{t('my_profile')}</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('account')}>
                <FontAwesome5 name="cog" size={16} color="#334155" style={styles.menuIcon} />
                <Text style={styles.menuText}>{t('manage_account')}</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('history')}>
                <FontAwesome5 name="history" size={16} color="#334155" style={styles.menuIcon} />
                <Text style={styles.menuText}>{t('load_history')}</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('logout')}>
                <FontAwesome5 name="sign-out-alt" size={16} color="#EF4444" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: '#EF4444' }]}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      <ScrollView ref={scrollViewRef} style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((msg) => (
          <View key={msg.id} style={msg.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer}>
            {msg.sender === 'ai' && (
              <View style={styles.aiAvatarWrapper}>
                <AnimatedAvatar size={30} />
              </View>
            )}
            <View style={[
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              msg.sender === 'user' && { backgroundColor: themeColor }
            ]}>
              <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>
                {msg.text}
              </Text>
            </View>
            {msg.sender === 'user' && (
              <View style={styles.userAvatarWrapper}>
                <AnimatedAvatar uri={context?.user?.profile_image} size={30} />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.aiBubbleContainer}>
            <View style={styles.aiAvatarWrapper}><AnimatedAvatar size={30} /></View>
            <View style={styles.aiBubble}>
               <ActivityIndicator size="small" color={themeColor} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder={t('type_message')} 
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={[styles.voiceButton, isRecording && styles.recordingActive]} onPressIn={startRecording} onPressOut={stopRecording}>
          {isRecording ? <ActivityIndicator color="#FFF" size="small" /> : <FontAwesome5 name="microphone" size={18} color="#64748B" />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? themeColor : '#CBD5E1' }]} 
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#FFF" size="small" /> : <FontAwesome5 name="paper-plane" size={16} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5, zIndex: 10 },
  backButton: { padding: 5, width: 40 },
  headerText: { color: 'white', fontSize: 20, fontWeight: '800', flex: 1, textAlign: 'center' },
  menuButton: { padding: 2, borderWidth: 2, borderColor: '#FFF', borderRadius: 20, width: 40, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  menuContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80, right: 20, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8, width: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  menuIcon: { width: 24 },
  menuText: { fontSize: 16, fontWeight: '600', color: '#334155' },
  menuDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  chatArea: { flex: 1, padding: 15 },
  userBubbleContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 },
  aiBubbleContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 15 },
  userAvatarWrapper: { marginLeft: 10, alignSelf: 'flex-end' },
  aiAvatarWrapper: { marginRight: 10, alignSelf: 'flex-end' },
  userBubble: { padding: 15, borderRadius: 20, borderBottomRightRadius: 5, maxWidth: '75%' },
  aiBubble: { backgroundColor: '#ffffff', padding: 15, borderRadius: 20, borderBottomLeftRadius: 5, maxWidth: '75%', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  userText: { fontSize: 16, color: '#fff', lineHeight: 22 },
  aiText: { fontSize: 16, color: '#334155', lineHeight: 22 },
  inputArea: { flexDirection: 'row', padding: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 15, backgroundColor: '#fff', alignItems: 'flex-end', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: '#1E293B', minHeight: 45, maxHeight: 100 },
  voiceButton: { marginLeft: 10, backgroundColor: '#F1F5F9', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  recordingActive: { backgroundColor: '#EF4444' },
  sendButton: { marginLeft: 10, height: 45, width: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 2 }
});
