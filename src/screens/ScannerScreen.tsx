import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ScanResult } from '../types';
import { ContentParser } from '../services/parser';
import { StorageService } from '../services/storage';

interface ScannerScreenProps {
  onScanResult: (result: ScanResult) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onScanResult }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualScan = () => {
    if (!manualInput.trim()) return;
    const res = ContentParser.parse(manualInput.trim());
    StorageService.saveScan(res);
    onScanResult(res);
    setManualInput('');
  };

  return (
    <View style={styles.container}>
      {/* Viewfinder Mock / Camera Target */}
      <View style={styles.viewfinder}>
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.laser} />
        </View>
        <Text style={styles.statusText}>Align code inside reticle</Text>
      </View>

      {/* Manual Input Fallback */}
      <View style={styles.manualCard}>
        <Text style={styles.cardTitle}>Manual Input & Simulator</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="Enter URL, Wi-Fi or text..."
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.scanBtn} onPress={handleManualScan}>
            <Text style={styles.scanBtnText}>Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reticle: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10b981',
  },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 6 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 6 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 6 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 6 },
  laser: {
    width: '100%',
    height: 2,
    backgroundColor: '#06b6d4',
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 20,
  },
  manualCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 10,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 12,
  },
  scanBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#020617',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
