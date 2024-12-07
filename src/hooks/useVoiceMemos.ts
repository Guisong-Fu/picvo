import { useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { VoiceMemoService } from '../services/voiceMemoService';
import { VoiceMemoRecord, PhotoMemoMapping } from '../types';
import { requestAudioPermission } from '../utils/permissions';

export const useVoiceMemos = (photoId: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [memos, setMemos] = useState<VoiceMemoRecord[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const memoService = VoiceMemoService.getInstance();

  const loadMemos = useCallback(async () => {
    const mapping = await memoService.getMemoMapping();
    setMemos(mapping[photoId] || []);
  }, [photoId]);

  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestAudioPermission();
      setHasPermission(granted);
    };

    checkPermission();
    loadMemos();
  }, [loadMemos]);

  const startRecording = async () => {
    if (!hasPermission) {
      const granted = await requestAudioPermission();
      if (!granted) return;
      setHasPermission(granted);
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await memoService.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await memoService.stopRecording();
      
      const newMemo: VoiceMemoRecord = {
        filePath: uri,
        duration: 0, // TODO: Calculate actual duration
        timestamp: Date.now(),
      };

      await memoService.saveMemoMapping(photoId, newMemo);
      await loadMemos();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  const playMemo = async (index: number) => {
    if (isPlaying && currentPlayingIndex === index) {
      await stopPlayback();
      return;
    }

    try {
      const memo = memos[index];
      if (!memo) return;

      await memoService.playMemo(memo.filePath);
      setIsPlaying(true);
      setCurrentPlayingIndex(index);
    } catch (error) {
      console.error('Failed to play memo:', error);
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    }
  };

  const stopPlayback = async () => {
    try {
      await memoService.stopPlayback();
      setIsPlaying(false);
      setCurrentPlayingIndex(null);
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  };

  const deleteMemo = async (index: number) => {
    try {
      await memoService.deleteMemo(photoId, index);
      await loadMemos();
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  };

  return {
    memos,
    isRecording,
    isPlaying,
    currentPlayingIndex,
    hasPermission,
    startRecording,
    stopRecording,
    playMemo,
    stopPlayback,
    deleteMemo,
    refreshMemos: loadMemos,
  };
}; 