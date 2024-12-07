export interface PhotoItem {
  id: string;
  uri: string;
  creationTime: number;
}

export interface VoiceMemoRecord {
  filePath: string;
  duration: number;
  timestamp: number;
}

export interface PhotoMemoMapping {
  [photoId: string]: VoiceMemoRecord[];
}

export type RootStackParamList = {
  Gallery: undefined;
  PhotoDetail: {
    photoId: string;
    uri: string;
  };
}; 