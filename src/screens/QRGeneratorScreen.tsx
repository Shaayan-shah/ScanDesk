import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Share } from 'react-native';

export const QRGeneratorScreen: React.FC = () => {
  const [text, setText] = useState('https://github.com/Shaayan-shah');

  const handleShare = async () => {
    try {
      await Share.share({ message: text });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Mobile QR Studio</Text>
        <Text style={styles.subtitle}>Enter any text or URL to generate:</Text>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="https://example.com"
          placeholderTextColor="#64748b"
        />

        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrNotice}>[QR Code: {text.length > 24 ? text.substring(0, 24) + '...' : text}]</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share / Save Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 12,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  qrNotice: {
    color: '#020617',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  shareBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
