import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { VoiceMemoRecord } from '../types';

interface VoiceMemoItemProps {
  memo: VoiceMemoRecord;
  isPlaying: boolean;
  onPlay: () => void;
  onDelete: () => void;
}

const VoiceMemoItem: React.FC<VoiceMemoItemProps> = ({
  memo,
  isPlaying,
  onPlay,
  onDelete,
}) => {
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <View style={styles.memoItem}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={onPlay}
      >
        <Text style={styles.playButtonText}>
          {isPlaying ? '⏸️' : '▶️'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.memoInfo}>
        <Text style={styles.memoDuration}>
          {formatDuration(memo.duration)}
        </Text>
        <Text style={styles.memoDate}>
          {formatDate(memo.timestamp)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Voice Memo',
            'Are you sure you want to delete this voice memo?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: onDelete, style: 'destructive' },
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
};

interface VoiceMemoPanelProps {
  memos: VoiceMemoRecord[];
  currentPlayingIndex: number | null;
  onPlayMemo: (index: number) => void;
  onDeleteMemo: (index: number) => void;
}

export const VoiceMemoPanel: React.FC<VoiceMemoPanelProps> = ({
  memos,
  currentPlayingIndex,
  onPlayMemo,
  onDeleteMemo,
}) => {
  if (memos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No voice memos yet. Press and hold the photo to record.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {memos.map((memo, index) => (
        <VoiceMemoItem
          key={`${memo.timestamp}-${index}`}
          memo={memo}
          isPlaying={currentPlayingIndex === index}
          onPlay={() => onPlayMemo(index)}
          onDelete={() => onDeleteMemo(index)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  memoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  playButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  playButtonText: {
    fontSize: 18,
  },
  memoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memoDuration: {
    fontSize: 16,
    fontWeight: '500',
  },
  memoDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
}); 