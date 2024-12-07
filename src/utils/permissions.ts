import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  
  if (status === 'granted') {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(
      'Permission Required',
      'Please enable photo library access in your device settings to use this app.',
      [{ text: 'OK' }]
    );
  }
  
  return false;
};

export const requestAudioPermission = async (): Promise<boolean> => {
  const { status, canAskAgain } = await Audio.requestPermissionsAsync();
  
  if (status === 'granted') {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(
      'Permission Required',
      'Please enable microphone access in your device settings to record voice memos.',
      [{ text: 'OK' }]
    );
  }
  
  return false;
}; 