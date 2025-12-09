# Digital Samba Embedded SDK Reference

**Package**: `@digitalsamba/embedded-sdk`
**Version**: 0.0.52
**License**: BSD-2-Clause

## Installation

```bash
npm install @digitalsamba/embedded-sdk
```

Or via CDN:
```html
<script src="https://unpkg.com/@digitalsamba/embedded-sdk"></script>
```

**Production recommendation**: Bundle the SDK into your application rather than fetching from npm/CDN at runtime. npm and CDN outages can break your app's availability. Use your bundler (webpack, vite, esbuild) to include it in your production build.

## Security Requirement

The SDK requires a **secure context** (HTTPS). Local development accepts:
- `http://localhost`
- `http://127.0.0.1`

---

## Initialization

### Method 1: Direct Constructor

```javascript
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';

const sambaFrame = new DigitalSambaEmbedded({
  url: 'https://team.digitalsamba.com/room?token=xxx',
  root: document.getElementById('video-container')
});
```

### Method 2: Deferred Loading (Recommended)

```javascript
const sambaFrame = DigitalSambaEmbedded.createControl({
  url: 'https://team.digitalsamba.com/room?token=xxx',
  root: document.getElementById('video-container')
});

// Configure before loading
sambaFrame.on('userJoined', handleJoin);

// Load when ready
sambaFrame.load();
```

### Method 3: Wrap Existing iframe

```javascript
const sambaFrame = DigitalSambaEmbedded.createControl({
  frame: document.getElementById('existing-iframe')
});
```

### InitOptions

| Option | Type | Description |
|--------|------|-------------|
| `url` | string | Full iframe URL with token |
| `root` | HTMLElement | Container element for iframe |
| `frame` | HTMLIFrameElement | Existing iframe to control |
| `team` | string | Team identifier (alternative to url) |
| `room` | string | Room identifier (alternative to url) |
| `token` | string | JWT token (alternative to url) |

---

## Properties

### sambaFrame.localUser

Current user information.

```javascript
const user = sambaFrame.localUser;
// {
//   id: "08c82f56-c670-4d36-bfe3-87a8cd0f7f29",
//   name: "John",
//   avatarColor: "#90c695",
//   role: "moderator",
//   kind: "local"
// }
```

### sambaFrame.features

Available room features (boolean flags).

```javascript
console.log(sambaFrame.features.chat);        // true
console.log(sambaFrame.features.recordings);  // true
console.log(sambaFrame.features.screenshare); // true
```

**Available features**:
- `chat`
- `endSession`
- `fullScreen`
- `languageSelection`
- `minimizeOwnTile`
- `participantsList`
- `pin`
- `screenshare`
- `recordings`
- `virtualBackgrounds`
- `raiseHand`
- `invite`

### sambaFrame.roomState

Current room state.

```typescript
interface RoomState {
  appLanguage: string;
  frameMuted: boolean;
  media: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    activeDevices: {
      videoinput: string;
      audioinput: string;
      audiooutput: string;
    }
  };
  layout: {
    mode: 'auto' | 'tiled';
    showToolbar: boolean;
    toolbarPosition: 'left' | 'right' | 'bottom';
    localTileMinimized: boolean;
    contentMode?: 'maximize' | 'pin';
    content?: { userId: string; type: string };
  };
  captionsState: {
    showCaptions: boolean;
    spokenLanguage: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  virtualBackground: {
    enabled: boolean;
    enforced?: boolean;
    type?: 'blur' | 'image' | 'imageUrl';
    name?: string;
    value?: string;
  };
}
```

### sambaFrame.permissionManager

Check user permissions.

```javascript
// Check single permission
const canBroadcast = sambaFrame.permissionManager.hasPermissions('broadcast');

// Check multiple permissions
const canModerate = sambaFrame.permissionManager.hasPermissions([
  'remoteMuting',
  'removeParticipant'
]);

// Check for specific role
const moderatorCanRecord = sambaFrame.permissionManager.hasPermissions(
  'recording',
  { targetRole: 'moderator' }
);
```

**Permission Types**:
- `broadcast` - Send audio/video
- `manageBroadcast` - Control others' broadcast
- `endSession` - End meeting for all
- `startSession` - Start meeting
- `removeParticipant` - Kick users
- `screenshare` - Share screen
- `manageScreenshare` - Control others' screenshare
- `recording` - Start/stop recording
- `generalChat` - Send chat messages
- `remoteMuting` - Mute other users
- `askRemoteUnmute` - Request unmute
- `raiseHand` - Raise hand
- `manageRoles` - Change user roles

---

## Events

### Subscribing to Events

```javascript
// Subscribe to recurring events
sambaFrame.on('userJoined', (event) => {
  console.log(`${event.data.name} joined`);
});

// One-time subscription
sambaFrame.once('frameLoaded', () => {
  console.log('Frame ready');
});

// Unsubscribe
sambaFrame.off('userJoined', handlerFunction);

// Debug: log all events
sambaFrame.on('*', (event) => {
  console.log(event.type, event.data);
});
```

### Event Reference

#### Connection Events

| Event | Payload | Description |
|-------|---------|-------------|
| `frameLoaded` | - | iframe loaded and ready |
| `userJoined` | `{ id, name, role }` | Local user joined room |
| `userLeft` | `{ id, name }` | User left room |
| `usersUpdated` | `User[]` | Participant list changed |
| `connectionFailure` | `{ error }` | Connection failed |
| `sessionEnded` | - | Meeting ended |

#### Media Events

| Event | Payload | Description |
|-------|---------|-------------|
| `audioEnabled` | - | Local mic turned on |
| `audioDisabled` | - | Local mic turned off |
| `videoEnabled` | - | Local camera turned on |
| `videoDisabled` | - | Local camera turned off |
| `screenshareStarted` | `{ userId }` | Screen sharing began |
| `screenshareStopped` | `{ userId }` | Screen sharing ended |
| `activeSpeakerChanged` | `{ userId }` | Active speaker changed |
| `speakerStoppedTalking` | `{ userId }` | Speaker went silent |
| `mediaDeviceChanged` | `{ type, deviceId }` | Device selection changed |

#### Recording Events

| Event | Payload | Description |
|-------|---------|-------------|
| `recordingStarted` | - | Recording began |
| `recordingStopped` | - | Recording ended |
| `recordingFailed` | `{ error }` | Recording error |

#### UI Events

| Event | Payload | Description |
|-------|---------|-------------|
| `layoutModeChanged` | `{ mode }` | Layout changed |
| `appLanguageChanged` | `{ language }` | UI language changed |
| `roomStateUpdated` | `RoomState` | Any room state changed |
| `featureSetUpdated` | `FeatureSet` | Available features changed |

#### Caption Events

| Event | Payload | Description |
|-------|---------|-------------|
| `captionsEnabled` | - | Captions turned on |
| `captionsDisabled` | - | Captions turned off |
| `captionsFontSizeChanged` | `{ size }` | Caption size changed |
| `captionsSpokenLanguageChanged` | `{ language }` | Spoken language changed |

#### Interaction Events

| Event | Payload | Description |
|-------|---------|-------------|
| `handRaised` | `{ userId }` | User raised hand |
| `handLowered` | `{ userId }` | User lowered hand |
| `chatMessageReceived` | `{ message, userId }` | Chat message received |
| `roleChanged` | `{ userId, role }` | User role changed |
| `permissionsChanged` | `{ permissions }` | Permissions updated |

#### Virtual Background Events

| Event | Payload | Description |
|-------|---------|-------------|
| `virtualBackgroundChanged` | `{ type, value }` | Background changed |
| `virtualBackgroundDisabled` | - | Background disabled |

#### Error Events

| Event | Payload | Description |
|-------|---------|-------------|
| `appError` | `{ code, message }` | Application error |

---

## Methods

### Media Control

```javascript
// Video
sambaFrame.enableVideo();
sambaFrame.disableVideo();
sambaFrame.toggleVideo();        // Toggle current state
sambaFrame.toggleVideo(true);    // Force enable

// Audio
sambaFrame.enableAudio();
sambaFrame.disableAudio();
sambaFrame.toggleAudio();
sambaFrame.toggleAudio(false);   // Force disable

// Screen sharing
sambaFrame.startScreenshare();
sambaFrame.stopScreenshare();

// Recording
sambaFrame.startRecording();
sambaFrame.stopRecording();
```

### User Management

```javascript
// List all users
const users = sambaFrame.listUsers();

// Get specific user
const user = sambaFrame.getUser('user-id');

// Remove user from room
sambaFrame.removeUser('user-id');

// Change user's role
sambaFrame.changeRole('user-id', 'speaker');

// Mute requests
sambaFrame.requestMute('user-id');
sambaFrame.requestUnmute('user-id');
sambaFrame.requestToggleAudio('user-id');
sambaFrame.requestToggleAudio('user-id', true); // Request mute
```

### Broadcasting Control

```javascript
// Allow user to broadcast (moderator action)
sambaFrame.allowBroadcast('user-id');
sambaFrame.allowBroadcast({ userId: 'user-id', audio: true, video: false });

// Revoke broadcast permission
sambaFrame.disallowBroadcast('user-id');

// Screenshare permissions
sambaFrame.allowScreenshare('user-id');
sambaFrame.disallowScreenshare('user-id');
```

### Hand Raising

```javascript
// Raise own hand
sambaFrame.raiseHand();

// Lower hand (own or others if moderator)
sambaFrame.lowerHand();
sambaFrame.lowerHand('user-id');
```

### UI Control

```javascript
// Toolbar
sambaFrame.showToolbar();
sambaFrame.hideToolbar();
sambaFrame.toggleToolbar();
sambaFrame.changeToolbarPosition('left'); // 'left' | 'right' | 'bottom'

// Topbar
sambaFrame.showTopbar();
sambaFrame.hideTopbar();
sambaFrame.toggleTopbar();

// Layout
sambaFrame.changeLayoutMode('tiled'); // 'auto' | 'tiled'
```

### Tile Management

```javascript
// Pin user's video
sambaFrame.pinUser('user-id');
sambaFrame.pinUser('user-id', 'screenshare'); // Pin specific tile type
sambaFrame.unpinUser();

// Maximize user's video
sambaFrame.maximizeUser('user-id');
sambaFrame.maximizeUser('user-id', 'screenshare');
sambaFrame.minimizeUser();

// Local tile
sambaFrame.minimizeLocalTile();
sambaFrame.maximizeLocalTile();

// Minimize pinned/maximized content
sambaFrame.minimizeContent();
```

### Frame Audio

```javascript
// Mute all audio output from iframe
sambaFrame.muteFrame();
sambaFrame.unmuteFrame();
sambaFrame.toggleMuteFrame();
```

### Captions

```javascript
sambaFrame.showCaptions();
sambaFrame.hideCaptions();
sambaFrame.toggleCaptions();

sambaFrame.configureCaptions({
  fontSize: 'large',        // 'small' | 'medium' | 'large'
  spokenLanguage: 'en-US'
});
```

### Virtual Background

```javascript
// Enable blur
sambaFrame.enableVirtualBackground({ type: 'blur' });

// Enable image
sambaFrame.enableVirtualBackground({
  type: 'image',
  value: 'background-name'  // From configured backgrounds
});

// Enable custom image URL
sambaFrame.enableVirtualBackground({
  type: 'imageUrl',
  value: 'https://example.com/background.jpg'
});

// Disable
sambaFrame.disableVirtualBackground();

// Configure (set options without enabling)
sambaFrame.configureVirtualBackground({ type: 'blur' });
```

### Whiteboard

```javascript
// Create new whiteboard
sambaFrame.createWhiteboard({ name: 'Brainstorm' });

// Open/close whiteboard
sambaFrame.openWhiteboard('whiteboard-id');
sambaFrame.closeWhiteboard('whiteboard-id');
sambaFrame.toggleWhiteboard();

// Add image to whiteboard
sambaFrame.addImageToWhiteboard({
  url: 'https://example.com/diagram.png'
});
```

### Library Files

```javascript
// Open file from library
sambaFrame.openLibraryFile('file-id');
sambaFrame.closeLibraryFile('file-id');
sambaFrame.toggleLibraryFile('file-id');
```

### Session Control

```javascript
// Leave session (current user)
sambaFrame.leaveSession();

// End session for everyone (requires permission)
sambaFrame.endSession();
sambaFrame.endSession(true); // Show confirmation dialog
```

### Feature Check

```javascript
// Check if feature is enabled
if (sambaFrame.featureEnabled('recordings')) {
  showRecordButton();
}
```

---

## Advanced Features

> Note: These methods exist in the TypeScript types but may not be fully documented.
> See SDK-UNDOCUMENTED-FEATURES.md for details.

### Custom Tile Actions

Add custom buttons to user video tiles.

```javascript
sambaFrame.addTileAction('send-gift', properties, (userId) => {
  sendGift(userId);
});

sambaFrame.removeTileAction('send-gift');
```

### Custom Tiles

Add custom HTML panels to the video call UI.

```javascript
// Add a custom tile (must be called after userJoined)
sambaFrame.addCustomTile({
  name: 'poll-panel',           // Tile identifier and title
  html: '<div>Poll content</div>', // HTML content
  position: 'last'              // 'first' or 'last' in tile list
});

// Remove a custom tile
sambaFrame.removeCustomTile('poll-panel');

// Send data to the custom tile's iframe
sambaFrame.sendMessageToCustomTile({
  name: 'poll-panel',           // Must match addCustomTile name
  event: 'updateResults',       // Custom event name (optional)
  origin: '*',                  // postMessage origin (optional)
  data: { results: [1, 2, 3] }  // Payload (optional)
});
```

**Receiving messages in the custom tile:**
```javascript
window.addEventListener('message', (event) => {
  console.log(event.data); // { event: 'updateResults', data: { results: [1, 2, 3] } }
});
```

### UI Callbacks

Hook into UI interactions.

```javascript
sambaFrame.addUICallback('callbackName', (data) => {
  // Handle UI event
});

sambaFrame.removeUICallback('callbackName', handler);
```

### Frame Event Listeners

Listen to iframe document/window events.

```javascript
sambaFrame.addFrameEventListener('visibilitychange', 'document', () => {
  console.log('Tab visibility changed');
});

sambaFrame.removeFrameEventListener('visibilitychange', 'document', handler);
```

### Runtime Branding

Change branding without reloading.

```javascript
sambaFrame.changeBrandingOptions({
  // Branding configuration
});
```

---

## TypeScript Support

```typescript
import DigitalSambaEmbedded, {
  InitOptions,
  User,
  RoomState,
  FeatureSet,
  PermissionTypes
} from '@digitalsamba/embedded-sdk';

const sambaFrame: DigitalSambaEmbedded = DigitalSambaEmbedded.createControl({
  url: roomUrl,
  root: container
});

sambaFrame.on('userJoined', (event: { data: User }) => {
  console.log(event.data.name);
});
```

---

## Important: Wait for userJoined

Most methods have no effect before the user joins. Always wait:

```javascript
sambaFrame.once('userJoined', () => {
  // Now safe to call methods
  sambaFrame.disableAudio();
});
sambaFrame.load();
```
