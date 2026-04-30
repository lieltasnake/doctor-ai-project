import { Stack, ErrorBoundaryProps } from 'expo-router';
import { AppProvider } from './_context/AppContext';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Application Error</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F4F7FB' },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#EF4444', marginBottom: 10 },
  errorMessage: { fontSize: 16, color: '#334155', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#0A74DA', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: 'white', fontWeight: 'bold' }
});

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="otp" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
