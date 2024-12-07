import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Text,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useVoiceMemos } from '../hooks/useVoiceMemos';
import { VoiceMemoPanel } from '../components/VoiceMemoPanel';

type PhotoDetailScreenRouteProp = RouteProp<RootStackParamList, 'PhotoDetail'>;

export const PhotoDetailScreen: React.FC = () => {
  const route = useRoute<PhotoDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { height: windowHeight } = useWindowDimensions();
  const { photoId, uri } = route.params;

  const {
    memos,
    isRecording,
    isPlaying,
    currentPlayingIndex,
    startRecording,
    stopRecording,
    playMemo,
    deleteMemo,
  } = useVoiceMemos(photoId);

  // Panel animation
  const panelHeight = windowHeight * 0.5;
  const panelY = React.useRef(new Animated.Value(panelHeight)).current;
  const [isPanelVisible, setIsPanelVisible] = React.useState(false);

  const showPanel = () => {
    setIsPanelVisible(true);
    Animated.spring(panelY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const hidePanel = () => {
    Animated.spring(panelY, {
      toValue: panelHeight,
      useNativeDriver: true,
    }).start(() => setIsPanelVisible(false));
  };

  // Pan responder for panel
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 10,
      onPanResponderMove: (_, { dy }) => {
        panelY.setValue(Math.max(0, dy));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > panelHeight / 3 || vy > 0.5) {
          hidePanel();
        } else {
          showPanel();
        }
      },
    })
  ).current;

  // Long press handler for recording
  const handlePressIn = async () => {
    await startRecording();
  };

  const handlePressOut = async () => {
    if (isRecording) {
      await stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.imageContainer}
        onLongPress={handlePressIn}
        onPressOut={handlePressOut}
        delayLongPress={200}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
        />
        {isRecording && (
          <View style={styles.recordingOverlay}>
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        style={styles.panelHandle}
        onPress={() => (isPanelVisible ? hidePanel() : showPanel())}
      >
        <View style={styles.panelHandleBar} />
      </Pressable>

      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateY: panelY }],
            height: panelHeight,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <VoiceMemoPanel
          memos={memos}
          currentPlayingIndex={currentPlayingIndex}
          onPlayMemo={playMemo}
          onDeleteMemo={deleteMemo}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    flex: 1,
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  panelHandle: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 