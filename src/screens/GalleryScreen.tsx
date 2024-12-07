import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PhotoThumbnail } from '../components/PhotoThumbnail';
import { usePhotos } from '../hooks/usePhotos';
import { RootStackParamList, PhotoItem } from '../types';
import { VoiceMemoService } from '../services/voiceMemoService';

type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gallery'>;

export const GalleryScreen: React.FC = () => {
  const navigation = useNavigation<GalleryScreenNavigationProp>();
  const {
    photos,
    loading,
    error,
    hasPermission,
    loadMorePhotos,
    refreshPhotos,
  } = usePhotos();

  const [memoMapping, setMemoMapping] = React.useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = React.useState(false);

  const loadMemoMapping = useCallback(async () => {
    const mapping = await VoiceMemoService.getInstance().getMemoMapping();
    const hasMemosMapping: Record<string, boolean> = {};
    Object.keys(mapping).forEach(photoId => {
      hasMemosMapping[photoId] = mapping[photoId].length > 0;
    });
    setMemoMapping(hasMemosMapping);
  }, []);

  React.useEffect(() => {
    loadMemoMapping();
  }, [loadMemoMapping]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshPhotos(), loadMemoMapping()]);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: PhotoItem }) => (
    <PhotoThumbnail
      photo={item}
      hasMemo={memoMapping[item.id] || false}
      onPress={(photo) => {
        navigation.navigate('PhotoDetail', {
          photoId: photo.id,
          uri: photo.uri,
        });
      }}
    />
  );

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          Please grant photo library access to use this app.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          Error loading photos: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        onEndReached={loadMorePhotos}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  loader: {
    padding: 20,
  },
}); 