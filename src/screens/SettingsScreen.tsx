import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Zero Telemetry Guarantee</Text>
        <Text style={styles.cardText}>
          ScanDesk is an offline-first private scanner. Scanned barcodes and generated QR codes remain strictly on your device.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Information</Text>
        <Text style={styles.infoText}>Version: 1.0.0 (React Native Mobile)</Text>
        <Text style={styles.infoText}>Author: Shayan Shah</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
  },
  cardTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 11,
  },
});
