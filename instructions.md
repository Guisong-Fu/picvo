# Photo Voice Notes App Specification

## 1. Overview

### App Name (Working Title): PicVo

**Goal:**  
An iOS and Android mobile application that allows users to associate voice memos with their existing photos, making it easier to remember the context behind their images without typing notes.

### Core MVP Features:
- Display device photos in a gallery grid
- View a selected photo in detail
- Press-and-hold on the photo to record a short voice memo
- Store and play voice memos associated with specific photos
- Indicate which photos have voice memos in the gallery
- Simple, no-login experience. Data stored locally on the device only


## 2. Target Platforms
- iOS (latest stable version)
- Android (latest stable version)

The app will be built using React Native and Expo for cross-platform consistency.

## 3. Tech Stack & Dependencies

### Core:
- React Native: Primary framework for building the UI
- Expo: For easy access to native APIs and simplified development/deployment
- TypeScript: For typed, maintainable code

### Packages & APIs:
**expo-media-library:**
- To access and display the user's photo library

**expo-av:**
- To handle audio recording and playback
- Provides APIs for recording voice memos and playing them back

**expo-file-system:**
- To store recorded audio files on the device's file system

**@react-native-async-storage/async-storage:**
- To store mappings between photos and their associated voice memo file paths locally
- AsyncStorage is simpler and sufficient for MVP

**expo-haptics:**
- For providing haptic feedback on record start/stop events (iOS and compatible Android devices)

**expo-permissions:**
- To request permissions for accessing photos and microphone usage

### UI Libraries:
- react-navigation (v6): For screen navigation (Stack navigator for gallery and detail)
- react-native-gesture-handler, react-native-reanimated: For smooth gestures and animations

### Recommended Project Structure:
```
src/
  components/
  screens/ (GalleryScreen, PhotoDetailScreen)
  hooks/ (custom hooks for handling media, recording)
  store/ (any global state management—optional)
  utils/ (helper functions, permissions handling)
  types/ (TypeScript type definitions)
  services/ (any abstracted logic for reading media, recording)
  assets/ (icons, images if needed)
```

## 4. Permissions Needed
- Camera Roll Access: To read photos (via MediaLibrary)
- Microphone Access: To record voice memos

On first app launch, prompt the user for these permissions. If denied, show a simple message explaining that the app cannot function properly without these permissions.

## 5. Data Model & Storage

### Data Model:

**Photo Item:**
- id (string or number from MediaLibrary)
- uri (local file URI of the image)
- creationTime (timestamp)
- location if available

**Voice Memo Record:**
- filePath (string): Local URI in the device's file system
- duration (number, seconds)
- timestamp (number): When the memo was recorded

### Storage Approach:
- Store voice memos as audio files on the device's file system (FileSystem.documentDirectory)
- Maintain a JSON mapping of [photoId]: VoiceMemoRecord[] in AsyncStorage

Example structure:
```json
{
  "photoId123": [
    {
      "filePath": "file:///data/user/0/.../memo123.m4a",
      "duration": 12,
      "timestamp": 1690001234
    }
  ],
  "photoId456": [...]
}
```

### On App Start:
- Load this mapping from AsyncStorage into a state variable for quick access
- When the user records a new memo, append it to the list for that photo and persist it immediately

## 6. Detailed Feature Specifications

### A. Gallery Screen

**UI & Layout:**
- Display photos in a grid (3 or 4 columns depending on screen width)
- Each image is a square thumbnail
- Spacing: ~2-4pt between thumbnails
- Any photo with at least one memo: overlay a small 🎤 emoji in the top-right corner of its thumbnail
- The emoji can have a semi-transparent white circle behind it to ensure visibility

**Data Fetching:**
- On initial load, request permission for media library access
- Once granted, use MediaLibrary.getAssetsAsync() to load a set of photos (latest first)
- Store them in state and display them

**Interaction:**
- Tap a photo to navigate to the Photo Detail Screen

**Navigation:**
- Use React Navigation's stack navigator
- The gallery is the root screen
- Tapping a photo navigate('PhotoDetail', {photoId: ...})

### B. Photo Detail Screen

**Layout:**
- Full-screen image display
- Swipe left/right to navigate adjacent photos
- Swipe down to navigate back to the Gallery Screen
- A handle at the bottom of the screen indicating a hidden panel with voice memos

**Voice Memo Panel:**
- Hidden by default, appears when user swipes up
- At half-screen height when revealed
- Displays a list of voice memos (if any) for this photo
- Each memo has:
  - Play/Pause button on left
  - Duration or timestamp (simple "0:12" format) next to it
  - Delete icon on the right

**Recording Interaction:**
- Press-and-hold anywhere on the photo to start recording
- On press start:
  - Show a semi-transparent overlay with "Recording…"
  - Trigger haptic feedback
  - Start recording with Audio.Recording
- On release:
  - Stop recording
  - Another haptic feedback to confirm end
  - Save the resulting audio file
  - Update AsyncStorage mapping
  - Show confirmation of memo saved

**Playing Memos:**
- Use Audio.Sound for playback
- Toggle between play/pause icons
- Support pause functionality

**Deleting Memos:**
- Show confirmation dialog
- Remove from storage and update UI on confirm

## 7. State Management
- MVP uses component-level state
- Use a lightweight global state solution
- useState + useEffect for data loading
- Consider context for photoMemosMap

## 8. Navigation Architecture
- Stack Navigator:
  - GalleryScreen (default)
  - PhotoDetailScreen
- No login or onboarding screens for MVP

## 9. Development Steps

### Implementation Steps:
1. Implement permissions handling
2. Build Gallery Screen with photo grid
3. Create Photo Detail Screen
4. Implement recording functionality
5. Add voice memo panel and playback
6. Integrate AsyncStorage
7. Add haptic feedback
8. Polish UI and styling
9. Test thoroughly on both platforms

## 10. Deliverables
- Fully functioning Expo-managed React Native app
- Well-structured source code with TypeScript
- Ready for deployment on iOS and Android


## 12. Acceptance Criteria
- User can launch the app and see their photos in a grid
- User can select a photo and view it full-screen
- User can press-and-hold to record a memo, release to save it
- User can play, pause, and delete recorded memos
- Photos with memos have the 🎤 icon in the gallery
- No crashes under normal use
- No login required
- Works offline and no backend dependency
