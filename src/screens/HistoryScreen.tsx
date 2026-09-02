import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScanResult } from '../types';
import { StorageService } from '../services/storage';

interface HistoryScreenProps {
  onSelectResult: (result: ScanResult) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onSelectResult }) => {
  const [items, setItems] = useState<ScanResult[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await StorageService.getHistory();
    setItems(list);
  };

  const handleClear = async () => {
    await StorageService.clearAll();
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.heading}>Recent Mobile Scans</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No scans recorded yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemCard} onPress={() => onSelectResult(item)}>
              <Text style={styles.itemTag}>{item.contentType.toUpperCase()}</Text>
              <Text style={styles.itemValue} numberOfLines={1}>{item.rawValue}</Text>
              <Text style={styles.itemTime}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clearText: {
    fontSize: 11,
    color: '#f43f5e',
    fontWeight: '600',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  itemCard: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  itemTag: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemValue: {
    color: '#f1f5f9',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  itemTime: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
});
