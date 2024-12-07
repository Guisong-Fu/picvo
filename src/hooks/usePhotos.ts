import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { PhotoItem } from '../types';
import { requestMediaLibraryPermission } from '../utils/permissions';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPhotoUri = async (asset: MediaLibrary.Asset): Promise<string> => {
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      return assetInfo.localUri || asset.uri;
    } catch (err) {
      console.warn('Failed to get local URI for asset:', err);
      return asset.uri;
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const assets = await MediaLibrary.getAssetsAsync({
        first: 50,
        mediaType: 'photo',
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const photoItems: PhotoItem[] = await Promise.all(
        assets.assets.map(async (asset) => ({
          id: asset.id,
          uri: await getPhotoUri(asset),
          creationTime: asset.creationTime,
        }))
      );

      setPhotos(photoItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (loading || !hasPermission) return;

    try {
      const lastPhoto = photos[photos.length - 1];
      if (!lastPhoto) return;

      const assets = await MediaLibrary.getAssetsAsync({
        first: 20,
        after: lastPhoto.id,
        mediaType: 'photo',
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      const newPhotoItems: PhotoItem[] = await Promise.all(
        assets.assets.map(async (asset) => ({
          id: asset.id,
          uri: await getPhotoUri(asset),
          creationTime: asset.creationTime,
        }))
      );

      setPhotos(prev => [...prev, ...newPhotoItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more photos');
    }
  };

  const checkPermissionAndLoadPhotos = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    setHasPermission(hasPermission);
    if (hasPermission) {
      await loadPhotos();
    }
  };

  useEffect(() => {
    checkPermissionAndLoadPhotos();
  }, []);

  return {
    photos,
    loading,
    hasPermission,
    error,
    loadMorePhotos,
    refreshPhotos: loadPhotos,
  };
}; 