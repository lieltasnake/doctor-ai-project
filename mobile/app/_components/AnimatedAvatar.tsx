import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedAvatarProps {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
  style?: any;
}

export default function AnimatedAvatar({ uri, size = 50, onPress, style }: AnimatedAvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!uri) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [uri]);

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component onPress={onPress} style={[styles.container, { width: size, height: size }, style]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', height: '100%' }}>
          <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={[styles.gradient, { borderRadius: size / 2 }]}
          >
            <FontAwesome5 name="user" size={size * 0.5} color="#FFF" solid />
          </LinearGradient>
        </Animated.View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }
});
