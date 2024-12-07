import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceMemoRecord, PhotoMemoMapping } from '../types';

const MEMOS_STORAGE_KEY = '@photo_memos';
const MEMO_DIRECTORY = `${FileSystem.documentDirectory}memos/`;

export class VoiceMemoService {
  private static instance: VoiceMemoService;
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  private constructor() {}

  static getInstance(): VoiceMemoService {
    if (!this.instance) {
      this.instance = new VoiceMemoService();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    // Ensure memo directory exists
    const dirInfo = await FileSystem.getInfoAsync(MEMO_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MEMO_DIRECTORY, { intermediates: true });
    }
  }

  async startRecording(): Promise<void> {
    try {
      await this.initialize();
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error('No active recording');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      if (!uri) throw new Error('Recording URI is null');
      
      const fileName = `memo_${Date.now()}.m4a`;
      const newUri = `${MEMO_DIRECTORY}${fileName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      this.recording = null;
      return newUri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async playMemo(uri: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play memo:', error);
      throw error;
    }
  }

  async stopPlayback(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  async saveMemoMapping(photoId: string, memo: VoiceMemoRecord): Promise<void> {
    try {
      const existingData = await this.getMemoMapping();
      const updatedData = {
        ...existingData,
        [photoId]: [...(existingData[photoId] || []), memo],
      };
      await AsyncStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save memo mapping:', error);
      throw error;
    }
  }

  async getMemoMapping(): Promise<PhotoMemoMapping> {
    try {
      const data = await AsyncStorage.getItem(MEMOS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get memo mapping:', error);
      return {};
    }
  }

  async deleteMemo(photoId: string, memoIndex: number): Promise<void> {
    try {
      const mapping = await this.getMemoMapping();
      const memos = mapping[photoId];
      
      if (!memos || !memos[memoIndex]) {
        throw new Error('Memo not found');
      }

      const memo = memos[memoIndex];
      await FileSystem.deleteAsync(memo.filePath, { idempotent: true });
      
      mapping[photoId] = memos.filter((_, index) => index !== memoIndex);
      if (mapping[photoId].length === 0) {
        delete mapping[photoId];
      }

      await AsyncStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(mapping));
    } catch (error) {
      console.error('Failed to delete memo:', error);
      throw error;
    }
  }
} 