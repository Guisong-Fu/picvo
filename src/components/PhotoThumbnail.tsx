import React from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  Text,
  useWindowDimensions,
} from 'react-native';
import { PhotoItem } from '../types';

interface PhotoThumbnailProps {
  photo: PhotoItem;
  hasMemo: boolean;
  onPress: (photo: PhotoItem) => void;
}

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  photo,
  hasMemo,
  onPress,
}) => {
  const window = useWindowDimensions();
  const size = (window.width - 8) / 3; // 3 columns with 2px spacing

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={() => onPress(photo)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode="cover"
      />
      {hasMemo && (
        <View style={styles.memoIndicatorContainer}>
          <View style={styles.memoIndicatorBackground}>
            <Text style={styles.memoIndicator}>🎤</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 1,
  },
  image: {
    flex: 1,
    borderRadius: 3,
  },
  memoIndicatorContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  memoIndicatorBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  memoIndicator: {
    fontSize: 12,
  },
}); 