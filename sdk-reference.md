# Digital Samba Embedded SDK Reference

**Package**: `@digitalsamba/embedded-sdk`
**Version**: 0.0.57
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
| `cname` | string | Custom domain (alternative to `team`); combined with `room` to build `https://<cname>/<room>` |
| `room` | string | Room identifier (alternative to url) |
| `token` | string | JWT token (alternative to url) |
| `roomSettings` | object | Room settings overrides (see below) |
| `templateParams` | object | `Record<string, string>` of template parameters, sent to the room once the frame connects |

**roomSettings options:**

| Option | Type | Description |
|--------|------|-------------|
| `baseDomain` | string | Override base domain |
| `publicRoomUrl` | string | Override public room URL used for invitation links |
| `mobileScreenshare` | boolean | Enable mobile screenshare |
| `videoEnabled` | boolean | Start with camera on/off |
| `audioEnabled` | boolean | Start with mic on/off |
| `username` | string | Override display name |
| `initials` | string | Override avatar initials |
| `layoutMode` | `'auto' \| 'tiled'` | Starting layout mode |
| `showToolbar` | boolean | Show/hide toolbar |
| `showTopbar` | boolean | Show/hide topbar |
| `joinScreenEnabled` | boolean | Show/hide the join screen (name/device entry) before entering the room |
| `showCaptions` | boolean | Show captions initially |
| `virtualBackground` | object | Pre-configure virtual background (same shape as `enableVirtualBackground` — see [Virtual Background](#virtual-background)) |
| `virtualBackgrounds` | array | Custom background options |
| `replaceVirtualBackgrounds` | boolean | Replace default backgrounds |
| `appLanguage` | string | UI language |
| `muteFrame` | boolean | Start with frame muted |
| `mediaDevices` | object | Pre-select audio/video devices |
| `requireRemoveUserConfirmation` | boolean | Confirm before removing users |

### InstanceProperties (second argument)

Both the constructor and `createControl()` take an optional second argument controlling the iframe element and error handling. `load()` accepts the same object.

```javascript
const sambaFrame = DigitalSambaEmbedded.createControl(
  { url: roomUrl, root: container },
  {
    frameAttributes: { class: 'ds-frame', width: '100%', height: '600' },
    reportErrors: true
  }
);
```

| Option | Type | Description |
|--------|------|-------------|
| `frameAttributes` | object | Attributes applied to the generated iframe. Accepts `class` plus any `HTMLIFrameElement` property |
| `reportErrors` | boolean | When `true`, configuration errors are thrown instead of logged to the console. Defaults to `false` |

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
- `qa`
- `contentLibrary`
- `whiteboard`
- `captions`

### sambaFrame.roomState

Current room state.

```typescript
interface RoomState {
  appLanguage: string;
  audioOnly: boolean;
  frameMuted: boolean;
  media: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    // Partial<Record<MediaDeviceKind, string>> — starts empty, keys appear
    // as devices are selected. Values are device LABELS, not device IDs.
    activeDevices: {
      videoinput?: string;
      audioinput?: string;
      audiooutput?: string;
    }
  };
  layout: {
    mode: 'auto' | 'tiled';
    showToolbar: boolean;
    showTopbar: boolean;
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

> **Permission strings are `snake_case`.** The `PermissionTypes` enum has camelCase *keys* but snake_case *values*, and the values are what the lookup uses — `PermissionTypes.remoteMuting` is the string `'remote_muting'`. Passing `'remoteMuting'` silently returns `false`. In TypeScript, import the enum rather than writing string literals.

```javascript
// Check single permission
const canBroadcast = sambaFrame.permissionManager.hasPermissions('broadcast');

// Check multiple permissions — returns true if ANY of them is granted
const canDoSomeModeration = sambaFrame.permissionManager.hasPermissions([
  'remote_muting',
  'remove_participant'
]);

// Check for specific role
const moderatorCanRecord = sambaFrame.permissionManager.hasPermissions(
  'recording',
  { targetRole: 'moderator' }
);

// Check another participant's permissions
const theyCanShare = sambaFrame.permissionManager.hasPermissions(
  'screenshare',
  { userId: 'other-user-id' }
);
```

In TypeScript:

```typescript
import { PermissionTypes } from '@digitalsamba/embedded-sdk/dist/esm/utils/vars';

sambaFrame.permissionManager.hasPermissions(PermissionTypes.remoteMuting);
```

`PermissionTypes` is a real enum, so it must come from a path with a runtime module — `dist/esm/` (or `dist/cjs/` for CommonJS builds). The declaration-only `dist/types/` tree has no `.js` files and will fail to resolve at runtime.

**Options** (second argument, all optional):

| Option | Type | Description |
|--------|------|-------------|
| `targetRole` | string | Check the permission *against* another role (e.g. can I mute a moderator?) |
| `role` | string | Check as if the local user held this role instead |
| `userId` | string | Check another participant's permissions rather than the local user's |

**Behaviour notes**:
- Passing an array returns `true` if **any** listed permission is granted, not all of them.
- Returns `false` while the local user is not yet resolved (before joining).

**Permission Types** (enum key → string value to pass):

| Enum key | String value | Description |
|----------|--------------|-------------|
| `broadcast` | `broadcast` | Send audio/video |
| `manageBroadcast` | `manage_broadcast` | Control others' broadcast |
| `endSession` | `end_session` | End meeting for all |
| `startSession` | `start_session` | Start meeting |
| `removeParticipant` | `remove_participant` | Kick users |
| `screenshare` | `screenshare` | Share screen |
| `manageScreenshare` | `manage_screenshare` | Control others' screenshare |
| `recording` | `recording` | Start/stop recording |
| `generalChat` | `general_chat` | Send chat messages |
| `remoteMuting` | `remote_muting` | Mute other users |
| `askRemoteUnmute` | `ask_remote_unmute` | Request unmute |
| `raiseHand` | `raise_hand` | Raise hand |
| `manageRoles` | `manage_roles` | Change user roles |
| `inviteParticipant` | `invite_participant` | Invite users to room |
| `seeParticipantsPanel` | `see_participants_panel` | View participants list |
| `controlRoomEntry` | `control_room_entry` | Control room entry (lobby) |
| `editWhiteboard` | `edit_whiteboard` | Edit whiteboard content |

---

## Events

### Subscribing to Events

Every handler receives the whole message object, `{ type, data }` — the payloads listed below are the contents of `event.data`.

```javascript
// Subscribe to recurring events
sambaFrame.on('userJoined', (event) => {
  console.log(`${event.data.user.name} joined`);
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

> **Note on `'*'`**: the wildcard also fires for the SDK's synthetic emissions behind `addFrameEventListener`, `addUICallback`, and `addTileAction`. Those pass a raw payload with no `type` or `data` field, so `event.type` is `undefined` for them.

### Event Reference

#### Connection Events

| Event | Payload | Description |
|-------|---------|-------------|
| `frameLoaded` | - | iframe loaded and ready |
| `connected` | - | Handshake with the room completed. Until this fires, SDK method calls are dropped |
| `roomJoined` | - | Local user is in the room and `localUser`, `roomState`, `features`, and permissions are all populated. No `data` payload |
| `userJoined` | `{ user: User, type }` | A user joined. Fires for **local and remote** users — `type` is `'local'` or `'remote'` |
| `userLeft` | `{ user: User }` | User left room |
| `usersUpdated` | `{ users: User[] }` | Participant list changed |
| `sessionEnded` | - | Meeting ended |

> **Note**: When many users leave at once, the room sends a single internal `userLeftBatch` message; the SDK expands it into individual `userLeft` events, so no separate handling is needed.

#### Waiting Room Events

| Event | Payload | Description |
|-------|---------|-------------|
| `waitingUsersJoined` | `{ users: WaitingUser[] }` | Users joined the waiting room. Each `WaitingUser` has `id`, `name`, `role`, `avatarColor` |
| `waitingUsersLeft` | `{ userIds }` | Users left the waiting room (admitted, denied, or gave up waiting) |

#### Media Events

| Event | Payload | Description |
|-------|---------|-------------|
| `audioEnabled` | `{ type }` | Mic turned on. Fires for remote users too — check `type === 'local'` |
| `audioDisabled` | `{ type }` | Mic turned off. Fires for remote users too — check `type === 'local'` |
| `videoEnabled` | `{ type }` | Camera turned on. Fires for remote users too — check `type === 'local'` |
| `videoDisabled` | `{ type }` | Camera turned off. Fires for remote users too — check `type === 'local'` |
| `screenshareStarted` | `{ userId }` | Screen sharing began |
| `screenshareStopped` | `{ userId }` | Screen sharing ended |
| `activeSpeakerChanged` | `{ user: User }` | Active speaker changed |
| `speakerStoppedTalking` | `{ userId }` | Speaker went silent |
| `mediaDeviceChanged` | `{ previousDeviceLabel, label, kind, availableDevices }` | Device selection changed. Devices are identified by `label` + `kind` — there is no device ID in this payload |

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
| `roomStateUpdated` | `{ state: RoomState }` | Any room state changed |
| `featureSetUpdated` | `{ state: FeatureSet }` | Available features changed |

#### Layout Events

| Event | Payload | Description |
|-------|---------|-------------|
| `localTileMaximized` | - | Local tile was maximized |
| `localTileMinimized` | - | Local tile was minimized |
| `userMaximized` | `{ userId, type, mode }` | User tile maximized/pinned |

#### Caption Events

| Event | Payload | Description |
|-------|---------|-------------|
| `captionsEnabled` | - | Captions turned on |
| `captionsDisabled` | - | Captions turned off |
| `captionsFontSizeChanged` | `{ fontSize }` | Caption size changed |
| `captionsSpokenLanguageChanged` | `{ language }` | Spoken language changed |

#### Interaction Events

| Event | Payload | Description |
|-------|---------|-------------|
| `handRaised` | `{ userId }` | User raised hand |
| `handLowered` | `{ userId }` | User lowered hand |
| `chatMessageReceived` | `{ message, userId }` | Chat message received |
| `roleChanged` | `{ userId, to }` | User role changed — `to` is the new role |
| `permissionsChanged` | `Record<permission, boolean>` | Permissions updated. `event.data` **is** the map of permission name to granted flag — there is no wrapper key |

#### Virtual Background Events

| Event | Payload | Description |
|-------|---------|-------------|
| `virtualBackgroundChanged` | `{ virtualBackgroundConfig: { type, value, enforced, name } }` | Background changed |
| `virtualBackgroundDisabled` | - | Background disabled |

#### Error Events

| Event | Payload | Description |
|-------|---------|-------------|
| `appError` | `{ code, message }` | Application error |
| `mediaConnectionFailed` | - | Media connection to the SFU could not be established (e.g. network/firewall issue) |
| `mediaPermissionsFailed` | - | Browser denied media device access |

---

## Method Quick Reference

Every SDK method at a glance. Use exact names below — see detailed docs in sections that follow.

| Category | Method | Description |
|----------|--------|-------------|
| **Lifecycle** | `load()` | Load the iframe (deferred mode) |
| **Lifecycle** | `leaveSession()` | Leave the session |
| **Lifecycle** | `endSession(requireConfirmation?)` | End session for all participants. Defaults to `true` — pass `false` to skip the dialog |
| **Video** | `enableVideo()` | Turn camera on |
| **Video** | `disableVideo()` | Turn camera off |
| **Video** | `toggleVideo(force?)` | Toggle or force camera state |
| **Audio** | `enableAudio()` | Turn mic on |
| **Audio** | `disableAudio()` | Turn mic off |
| **Audio** | `toggleAudio(force?)` | Toggle or force mic state |
| **Screenshare** | `startScreenshare()` | Start screen sharing |
| **Screenshare** | `stopScreenshare()` | Stop screen sharing |
| **Screenshare** | `startMobileScreenshare(options)` | Start screen sharing from a mobile SDK feed |
| **Screenshare** | `stopMobileScreenshare(options)` | Stop a mobile screenshare feed |
| **Recording** | `startRecording()` | Start recording |
| **Recording** | `stopRecording()` | Stop recording |
| **Restreaming** | `startRestreaming()` | Start RTMP restreaming |
| **Restreaming** | `stopRestreaming()` | Stop RTMP restreaming |
| **Users** | `listUsers()` | Get all participants |
| **Users** | `getUser(userId)` | Get specific participant |
| **Users** | `removeUser(userId)` | Remove participant from room |
| **Users** | `changeRole(userId, role)` | Change participant's role |
| **Moderation** | `requestMute(userId)` | Request user mute |
| **Moderation** | `requestUnmute(userId)` | Request user unmute |
| **Moderation** | `requestToggleAudio(userId, force?)` | Toggle user's audio |
| **Broadcast** | `allowBroadcast(options)` | Grant broadcast permission. String `userId` form is deprecated |
| **Broadcast** | `disallowBroadcast(userId)` | Revoke broadcast permission |
| **Broadcast** | `allowScreenshare(userId)` | Grant screenshare permission |
| **Broadcast** | `disallowScreenshare(userId)` | Revoke screenshare permission |
| **Hand Raise** | `raiseHand()` | Raise own hand |
| **Hand Raise** | `lowerHand(userId?)` | Lower hand (own or other's) |
| **Toolbar** | `showToolbar()` | Show toolbar |
| **Toolbar** | `hideToolbar()` | Hide toolbar |
| **Toolbar** | `toggleToolbar(show?)` | Toggle or force toolbar visibility |
| **Toolbar** | `changeToolbarPosition(pos)` | Move toolbar: `'left'\|'right'\|'bottom'` |
| **Topbar** | `showTopbar()` | Show topbar |
| **Topbar** | `hideTopbar()` | Hide topbar |
| **Topbar** | `toggleTopbar(show?)` | Toggle or force topbar visibility |
| **Layout** | `changeLayoutMode(mode)` | Set layout: `'auto'\|'tiled'` |
| **Tiles** | `pinUser(userId, tile?)` | Pin user's tile: `'media'` (default) or `'screenshare'` |
| **Tiles** | `unpinUser()` | Unpin current pinned tile (alias of `minimizeContent()`) |
| **Tiles** | `maximizeUser(userId, tile?)` | Maximize user's tile: `'media'` (default) or `'screenshare'` |
| **Tiles** | `minimizeUser()` | Minimize maximized tile (alias of `minimizeContent()`) |
| **Tiles** | `minimizeLocalTile()` | Minimize own tile |
| **Tiles** | `maximizeLocalTile()` | Maximize own tile |
| **Tiles** | `minimizeContent()` | Minimize pinned/maximized content |
| **Frame Audio** | `muteFrame()` | Mute all iframe audio output |
| **Frame Audio** | `unmuteFrame()` | Unmute iframe audio output |
| **Frame Audio** | `toggleMuteFrame(mute?)` | Toggle or force iframe audio mute |
| **Captions** | `showCaptions()` | Show captions |
| **Captions** | `hideCaptions()` | Hide captions |
| **Captions** | `toggleCaptions(show?)` | Toggle or force captions |
| **Captions** | `configureCaptions(options)` | Set font size, language, apply to all |
| **Virtual BG** | `enableVirtualBackground(options)` | Enable a blur, image, or video background |
| **Virtual BG** | `disableVirtualBackground()` | Disable virtual background |
| **Virtual BG** | `configureVirtualBackground(options)` | Alias of `enableVirtualBackground()` |
| **Whiteboard** | `createWhiteboard(options)` | Create new whiteboard |
| **Whiteboard** | `openWhiteboard(id?)` | Open whiteboard |
| **Whiteboard** | `closeWhiteboard(id?)` | Close whiteboard |
| **Whiteboard** | `toggleWhiteboard(show?, id?)` | Toggle or force whiteboard |
| **Whiteboard** | `addImageToWhiteboard(options)` | Add image via URL or base64 |
| **Library** | `openLibraryFile(fileId)` | Open library file |
| **Library** | `closeLibraryFile(fileId?)` | Close library file |
| **Library** | `toggleLibraryFile(fileId?, show?)` | Toggle or force library file |
| **Features** | `featureEnabled(name)` | Check if feature is enabled |
| **Custom Tiles** | `addCustomTile(options)` | Add custom HTML tile |
| **Custom Tiles** | `removeCustomTile(name)` | Remove custom tile |
| **Custom Tiles** | `sendMessageToCustomTile(options)` | Send data to custom tile |
| **Tile Actions** | `addTileAction(id, props, callback)` | Add custom tile menu action |
| **Tile Actions** | `removeTileAction(id)` | Remove custom tile action |
| **UI Callbacks** | `addUICallback(event, callback)` | Override UI interaction |
| **UI Callbacks** | `removeUICallback(event, callback)` | Remove UI override |
| **Frame Events** | `addFrameEventListener(event, target, handler)` | Listen to iframe JS events |
| **Frame Events** | `removeFrameEventListener(event, target, handler)` | Remove iframe listener |
| **Branding** | `changeBrandingOptions(options)` | Change theme/colors at runtime |
| **Events** | `on(event, handler)` | Subscribe to event |
| **Events** | `once(event, handler)` | One-time event subscription |
| **Events** | `off(event, handler)` | Unsubscribe from event |

---

## Methods (Detailed)

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

// Mobile screenshare (for feeds published by the mobile SDKs)
sambaFrame.startMobileScreenshare({
  feedId: 'feed-id',
  streams: [{ type: 'video', mid: '0' }]
});
sambaFrame.stopMobileScreenshare({ feedId: 'feed-id', streams: [] });

// Recording
sambaFrame.startRecording();
sambaFrame.stopRecording();

// Restreaming (RTMP)
sambaFrame.startRestreaming();
sambaFrame.stopRestreaming();
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
sambaFrame.allowBroadcast({ id: 'user-id', audio: true, video: false });

// The bare string form still works but is deprecated
sambaFrame.allowBroadcast('user-id');

// Revoke broadcast permission
sambaFrame.disallowBroadcast('user-id');

// Screenshare permissions
sambaFrame.allowScreenshare('user-id');
sambaFrame.disallowScreenshare('user-id');
```

`BroadcastOptions` is typed as `{ id, audio?, video? }` — the user identifier field is `id`, not `userId`. Omitting `audio`/`video` grants both.

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
sambaFrame.toggleToolbar();      // Toggle current state
sambaFrame.toggleToolbar(true);  // Force show
sambaFrame.changeToolbarPosition('left'); // 'left' | 'right' | 'bottom'

// Topbar
sambaFrame.showTopbar();
sambaFrame.hideTopbar();
sambaFrame.toggleTopbar();
sambaFrame.toggleTopbar(false);  // Force hide

// Layout
sambaFrame.changeLayoutMode('tiled'); // 'auto' | 'tiled'
```

### Tile Management

```javascript
// Pin user's video — tile type is 'media' (default) or 'screenshare'
sambaFrame.pinUser('user-id');
sambaFrame.pinUser('user-id', 'screenshare');
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

> `unpinUser()` and `minimizeUser()` are both aliases for `minimizeContent()` — all three clear whatever tile is currently pinned or maximized. There is no way to unpin one tile while leaving another maximized.

### Frame Audio

```javascript
// Mute all audio output from iframe
sambaFrame.muteFrame();
sambaFrame.unmuteFrame();
sambaFrame.toggleMuteFrame();      // Toggle current state
sambaFrame.toggleMuteFrame(true);  // Force mute
```

### Captions

```javascript
sambaFrame.showCaptions();
sambaFrame.hideCaptions();
sambaFrame.toggleCaptions();      // Toggle current state
sambaFrame.toggleCaptions(true);  // Force show

sambaFrame.configureCaptions({
  fontSize: 'large',            // 'small' | 'medium' | 'large'
  spokenLanguage: 'en-US',
  applySpokenLanguageToAll: true // Apply spoken language to all participants (moderator only)
});
```

### Virtual Background

The background is selected by **which key you set**, not by a `type`/`value` pair. Set exactly one of `blur`, `image`, `imageUrl`, `video`, or `videoUrl`.

```javascript
// Blur — 'balanced' or 'strong'
sambaFrame.enableVirtualBackground({ blur: 'balanced' });

// Image from the room's configured backgrounds
sambaFrame.enableVirtualBackground({ image: 'background-name' });

// Custom image URL
sambaFrame.enableVirtualBackground({
  imageUrl: 'https://example.com/background.jpg'
});

// Video background
sambaFrame.enableVirtualBackground({ video: 'background-name' });
sambaFrame.enableVirtualBackground({
  videoUrl: 'https://example.com/background.mp4'
});

// Prevent the participant from turning it off
sambaFrame.enableVirtualBackground({ blur: 'strong', enforce: true });

// Disable
sambaFrame.disableVirtualBackground();
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `blur` | `'balanced' \| 'strong'` | Blur the real background |
| `image` | string | Name of one of the room's configured backgrounds |
| `imageUrl` | string | URL of a custom image |
| `video` | string | Name of one of the room's configured video backgrounds |
| `videoUrl` | string | URL of a custom video |
| `enforce` | boolean | Participant cannot disable the background |
| `thumbnailUrl` | string | Thumbnail shown in the background picker |

> `configureVirtualBackground()` is the same function as `enableVirtualBackground()` — it applies the background immediately rather than staging it. To pre-select a background before the user joins, use `roomSettings.virtualBackground` in `InitOptions` instead.

### Whiteboard

```javascript
// Create new whiteboard
sambaFrame.createWhiteboard({ personal: false, folderId: 'folder-id' });

// Open/close whiteboard (id optional — omit to act on the current one)
sambaFrame.openWhiteboard('whiteboard-id');
sambaFrame.closeWhiteboard('whiteboard-id');
sambaFrame.toggleWhiteboard();            // Toggle current state
sambaFrame.toggleWhiteboard(true, 'whiteboard-id'); // Force open a specific board

// Add image to whiteboard (URL - requires CORS on external server)
sambaFrame.addImageToWhiteboard({
  url: 'https://example.com/diagram.png',
  position: { x: 100, y: 50 }  // Optional, auto-centers if omitted
});

// Add image via base64
sambaFrame.addImageToWhiteboard({
  base64: 'data:image/png;base64,iVBORw0KGgo...'
});
```

### Library Files

```javascript
// Open file from library
sambaFrame.openLibraryFile('file-id');
sambaFrame.closeLibraryFile('file-id');   // id optional — omit to close the current file
sambaFrame.toggleLibraryFile('file-id');
sambaFrame.toggleLibraryFile('file-id', true); // Force open
```

### Session Control

```javascript
// Leave session (current user)
sambaFrame.leaveSession();

// End session for everyone (requires permission)
sambaFrame.endSession();       // Shows a confirmation dialog — this is the default
sambaFrame.endSession(false);  // End immediately, no dialog
```

> `endSession()` takes `requireConfirmation`, which **defaults to `true`**. A bare call prompts the user; pass `false` to end the session straight away.

### Feature Check

```javascript
// Check if feature is enabled
if (sambaFrame.featureEnabled('recordings')) {
  showRecordButton();
}
```

---

## Advanced Features

### Custom Tile Actions

Add custom actions to the 3-dots menu on video tiles.

```javascript
// Add a custom action to remote user tiles
sambaFrame.addTileAction(
  'sendEmail',                              // Action identifier
  { label: 'Send Email', scope: 'remote' }, // Properties
  (source) => console.log('clicked on', source) // Callback receives the source tile
);

// Remove the action
sambaFrame.removeTileAction('sendEmail');
```

**Scope values:**
- `'all'` - All tiles
- `'remote'` - Other users' tiles
- `'local'` - Current user's tile
- `'screenshare-local'` - Local screen share
- `'screenshare-remote'` - Remote screen share

### Custom Tiles

Add custom HTML panels to the video call UI.

```javascript
// Add a custom tile (must be called after the room connects)
sambaFrame.addCustomTile({
  name: 'poll-panel',           // Tile identifier and title
  html: '<div>Poll content</div>', // HTML content
  position: 'last'              // 'first' (default) or 'last' in tile list
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

Override UI interactions with custom logic. The default action is suppressed.

```javascript
// Override leave session with confirmation
const leaveCallback = () => {
  if (confirm('Are you sure you want to leave?')) {
    sambaFrame.leaveSession();
  }
};

sambaFrame.addUICallback('leaveSession', leaveCallback);

// Remove the override
sambaFrame.removeUICallback('leaveSession', leaveCallback);
```

**Supported events:** `'leaveSession'`

### Frame Event Listeners

Listen to JavaScript events inside the iframe (e.g., for custom key combinations).

```javascript
// Listen for keyup on window
const keyHandler = (payload) => console.log('keyup', payload);
sambaFrame.addFrameEventListener('keyup', 'window', keyHandler);

// Listen for clicks on document
const clickHandler = (payload) => console.log('click', payload);
sambaFrame.addFrameEventListener('click', 'document', clickHandler);

// Remove listener
sambaFrame.removeFrameEventListener('keyup', 'window', keyHandler);
```

**Targets:** `'window'` or `'document'`

### Runtime Branding

Change room appearance without reloading.

```javascript
// Switch to dark theme
sambaFrame.changeBrandingOptions({ paletteMode: 'dark' });

// Custom colors
sambaFrame.changeBrandingOptions({
  primaryColor: '#0066FF',       // Accent color
  toolbarColor: '#1a1a1a',       // Toolbar background
  roomBackgroundColor: '#000000' // Room background
});
```

**Options:**
- `paletteMode` - `'dark'` or `'light'`
- `primaryColor` - Hex color for accents
- `toolbarColor` - Hex color for toolbar
- `roomBackgroundColor` - Hex color for background

---

## TypeScript Support

The package root exports only the `DigitalSambaEmbedded` class. Supporting types are **not** re-exported — import them from their own paths. Use the `dist/esm/` tree (or `dist/cjs/` for CommonJS): it carries both the declarations and the runtime modules, so it works for enums as well as types. `dist/types/` is declaration-only and has no `.js` files.

```typescript
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';
import type {
  InitOptions,
  User,
  RoomState,
  FeatureSet
} from '@digitalsamba/embedded-sdk/dist/esm/types';
import { PermissionTypes } from '@digitalsamba/embedded-sdk/dist/esm/utils/vars';

const sambaFrame: DigitalSambaEmbedded = DigitalSambaEmbedded.createControl({
  url: roomUrl,
  root: container
});

sambaFrame.on('userJoined', (event: { data: { user: User; type: 'local' | 'remote' } }) => {
  console.log(event.data.user.name);
});
```

---

## Important: Wait Before Calling Methods

The SDK **silently drops every message** sent to the room until the handshake completes — internally, any call made before the `connected` event is discarded rather than queued. Calling `disableAudio()` too early does nothing at all, with no error.

Wait for `roomJoined`, which fires once the local user is in the room and `localUser`, `roomState`, `features`, and permissions are all populated:

```javascript
sambaFrame.once('roomJoined', () => {
  // Now safe to call methods and read state
  sambaFrame.disableAudio();
  console.log(sambaFrame.localUser.name);
});
sambaFrame.load();
```

`userJoined` also works in practice, since it arrives after the connection is established — but note it fires for remote participants too, so `once()` may resolve on someone else's arrival if you are not the first to join. `roomJoined` is the more precise signal.

Exceptions that are safe to call before connecting: `on()`/`once()`/`off()`, and the queued registrations `addFrameEventListener()`, `addUICallback()`, and `addTileAction()` — these buffer and are replayed on connect.
