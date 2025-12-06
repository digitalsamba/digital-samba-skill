# Integration Patterns

## Pattern 1: Simple Public Room

Best for: Quick demos, open meetings

```javascript
// Server: Create public room
const room = await fetch('https://api.digitalsamba.com/api/v1/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DEVELOPER_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    friendly_url: 'open-meeting',
    privacy: 'public',
    join_screen_enabled: true
  })
}).then(r => r.json());

// Client: Embed directly
const iframe = document.createElement('iframe');
iframe.src = `https://${TEAM_DOMAIN}.digitalsamba.com/${room.friendly_url}`;
iframe.allow = 'camera; microphone; display-capture; autoplay';
```

## Pattern 2: Authenticated Users

Best for: SaaS integrations, known users

```javascript
// Server: Generate JWT for each user
const jwt = require('jsonwebtoken');

function generateRoomToken(user, roomId) {
  return jwt.sign({
    td: TEAM_ID,
    rd: roomId,
    ud: user.id,
    u: user.displayName,
    role: user.isAdmin ? 'moderator' : 'attendee',
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  }, DEVELOPER_KEY, { algorithm: 'HS256' });
}

// Client: Embed with token
const token = await fetch('/api/room-token').then(r => r.json());
iframe.src = `https://${TEAM_DOMAIN}.digitalsamba.com/${roomId}?token=${token}`;
```

## Pattern 3: SDK-Controlled Room

Best for: Custom UIs, programmatic control

```javascript
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';

const sambaFrame = DigitalSambaEmbedded.createControl({
  url: roomUrl,
  frame: document.getElementById('video-container')
});

// React to events
sambaFrame.on('userJoined', handleJoin);
sambaFrame.on('userLeft', handleLeave);
sambaFrame.on('recordingStarted', handleRecording);

// Control room (mute a specific user)
document.getElementById('mute-user').onclick = () => {
  sambaFrame.requestMute('user-id');
};

sambaFrame.load();
```

## Pattern 4: Scheduled Meetings

Best for: Calendar integrations, booking systems

```javascript
// Create room with time constraints
const meeting = await createRoom({
  friendly_url: `meeting-${Date.now()}`,
  is_locked: true,
  session_length: 60,
  lobby_enabled: true
});

// Generate invite tokens
const invites = participants.map(p => ({
  email: p.email,
  token: generateRoomToken(p, meeting.id),
  joinUrl: `https://${TEAM_DOMAIN}.digitalsamba.com/${meeting.friendly_url}?token=${token}`
}));

// Send invitations via email
await sendMeetingInvites(invites);
```

## Pattern 5: Webinar Mode

Best for: One-to-many broadcasts

```javascript
// Room settings for webinar
const webinarRoom = await createRoom({
  friendly_url: 'product-launch',
  default_role: 'attendee',
  roles: ['moderator', 'speaker', 'attendee'],
  chat_enabled: true,
  qa_enabled: true,
  raise_hand_enabled: true,
  video_on_join_enabled: false,
  audio_on_join_enabled: false
});

// Host gets moderator token
const hostToken = generateToken({ role: 'moderator', ... });

// Attendees get attendee token (view-only by default)
const attendeeToken = generateToken({ role: 'attendee', ... });
```

## Pattern 6: Recording & Playback

```javascript
// Start recording programmatically
await fetch(`/api/v1/rooms/${roomId}/recordings/start`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${DEVELOPER_KEY}` }
});

// Or via SDK
sambaFrame.startRecording();

// Later: List and download recordings
const recordings = await fetch('/api/v1/recordings').then(r => r.json());

for (const rec of recordings.data) {
  const downloadUrl = `/api/v1/recordings/${rec.id}/download`;
  // Store or process recording
}
```

## Error Handling Pattern

```javascript
async function apiCall(endpoint, options) {
  try {
    const response = await fetch(`https://api.digitalsamba.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${DEVELOPER_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new DigitalSambaError(error.message, response.status, error.error);
    }
    
    return response.json();
  } catch (err) {
    if (err instanceof DigitalSambaError) throw err;
    throw new DigitalSambaError('Network error', 0, 'network-error');
  }
}
```
