import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { Header } from './src/components/Header';
import { ScannerScreen } from './src/screens/ScannerScreen';
import { QRGeneratorScreen } from './src/screens/QRGeneratorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ResultModal } from './src/components/ResultModal';
import { ScanResult } from './src/types';

type Tab = 'scanner' | 'generator' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner');
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      <Header />

      <View style={styles.content}>
        {activeTab === 'scanner' && <ScannerScreen onScanResult={setSelectedResult} />}
        {activeTab === 'generator' && <QRGeneratorScreen />}
        {activeTab === 'history' && <HistoryScreen onSelectResult={setSelectedResult} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)} />

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        {[
          { id: 'scanner', label: 'Scanner', icon: '📷' },
          { id: 'generator', label: 'Generator', icon: '✨' },
          { id: 'history', label: 'History', icon: '📜' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.navBtn, isActive && styles.navBtnActive]}
              onPress={() => setActiveTab(t.id as Tab)}
            >
              <Text style={styles.navIcon}>{t.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#030712',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  navBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  navBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  navIcon: {
    fontSize: 16,
  },
  navLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#10b981',
    fontWeight: 'bold',
  },
});
