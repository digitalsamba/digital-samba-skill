# Integration Patterns

## Iframe Sizing (Important)

The Digital Samba SDK injects an iframe into the container element. **The iframe does not auto-size** - you must explicitly set dimensions on the container or the iframe will render very small.

### CSS Solution (Recommended)

```css
/* Container must have explicit dimensions */
.video-container {
  width: 100%;
  height: 100vh; /* or calc(100vh - headerHeight) */
  position: relative;
}

/* Target the injected iframe */
.video-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}
```

### React/Tailwind Example

```jsx
{/* Parent needs explicit height */}
<div className="relative" style={{ height: 'calc(100vh - 60px)' }}>
  {/* Container targets child iframe with Tailwind arbitrary selectors */}
  <div
    ref={containerRef}
    className="absolute inset-0 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
  />
</div>
```

### Common Mistakes

| Issue | Cause | Fix |
|-------|-------|-----|
| Tiny iframe | Container has no height | Set explicit `height` on container |
| Iframe overflows | No `overflow: hidden` | Add overflow control to parent |
| Scrollbars appear | iframe border | Add `border: none` to iframe |

---

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
// Server: Create room + generate token with error handling
const jwt = require('jsonwebtoken');

app.post('/api/room-token', async (req, res) => {
  try {
    // Create or fetch room
    const roomRes = await fetch('https://api.digitalsamba.com/api/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEVELOPER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        friendly_url: req.body.roomSlug,
        privacy: 'private',
        default_role: 'attendee',
        roles: ['moderator', 'speaker', 'attendee']
      })
    });

    if (!roomRes.ok) {
      const err = await roomRes.json();
      // 422 = validation error (e.g., friendly_url taken, roles missing)
      return res.status(roomRes.status).json({ error: err.message, details: err.errors });
    }

    const room = await roomRes.json();

    // Generate JWT
    const token = jwt.sign({
      td: TEAM_ID,
      rd: room.id,
      ud: req.user.id,
      u: req.user.displayName,
      role: req.user.isAdmin ? 'moderator' : 'attendee',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }, DEVELOPER_KEY, { algorithm: 'HS256' });

    res.json({ token, roomUrl: `https://${TEAM_DOMAIN}.digitalsamba.com/${room.friendly_url}` });
  } catch (err) {
    console.error('Room setup failed:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Client: Fetch token and embed with error handling
async function joinRoom(roomSlug) {
  const res = await fetch('/api/room-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomSlug })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Token fetch failed: ${err.error}`);
  }

  const { token, roomUrl } = await res.json();
  iframe.src = `${roomUrl}?token=${token}`;
}
```

> **Token refresh**: Tokens have a fixed expiry (the `exp` claim). Generate a new token per session — don't cache tokens long-term. If a user's session outlasts the token, generate a fresh one and reload the iframe.

### Role Assignment at Join Time

The JWT `role` claim sets the user's initial role when they enter the room (see [jwt-tokens.md](jwt-tokens.md) for all claims). You can also change roles dynamically after join using the SDK:

```javascript
// Initial role is set in the JWT (e.g., role: 'attendee')
// Promote to speaker dynamically when they raise their hand:
sambaFrame.on('handRaised', (e) => {
  const userId = e.data.id;
  console.log(`${e.data.name} raised hand — promoting to speaker`);
  sambaFrame.changeRole(userId, 'speaker');
});

// Demote back to attendee when hand is lowered
sambaFrame.on('handLowered', (e) => {
  sambaFrame.changeRole(e.data.id, 'attendee');
});
```

> **Note**: `changeRole()` requires the caller to have moderator permissions. The room must have the target role defined in its `roles` list.

## Pattern 3: SDK-Controlled Room

Best for: Custom UIs, programmatic control

> **Production tip**: Bundle the SDK into your app rather than fetching from npm/CDN at runtime. npm outages can break your app's availability.

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

## Pattern 7: Playwright E2E Testing

Best for: Automated testing, demo recordings, CI/CD validation

Digital Samba apps involve async SDK loading and iframe interactions. Here's how to test reliably:

### Playwright Config for Video Recording

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000, // Video rooms need time to connect
  use: {
    actionTimeout: 30000,
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true
  }
});
```

### Testing Room Creation Flow

```typescript
import { test, expect } from '@playwright/test';

test('create and join video room', async ({ page }) => {
  // Create room via UI
  await page.goto('/create');
  await page.fill('input[placeholder*="title"]', 'Test Interview');
  await page.fill('input[placeholder*="name"]', 'Test User');
  await page.click('button[type="submit"]');

  // Wait for room creation API response
  await expect(page.locator('text=Room Created')).toBeVisible();

  // Extract room code for joining
  const roomCode = await page.locator('.room-code').textContent();

  // Join room and wait for SDK connection
  await page.goto(`/room/${roomCode}`);

  // Wait for Digital Samba iframe to load
  await expect(page.frameLocator('iframe').locator('body')).toBeVisible({
    timeout: 15000
  });
});
```

### Testing SDK Events

```typescript
test('SDK emits connection events', async ({ page }) => {
  // Expose handler to capture SDK events
  const events: string[] = [];
  await page.exposeFunction('captureEvent', (name: string) => events.push(name));

  // Inject event listener before SDK loads
  await page.addInitScript(() => {
    window.addEventListener('message', (e) => {
      if (e.data?.type?.startsWith('digitalSamba:')) {
        (window as any).captureEvent(e.data.type);
      }
    });
  });

  await page.goto('/room/test-room?token=...');

  // Wait for connection
  await page.waitForTimeout(10000);

  expect(events).toContain('digitalSamba:userJoined');
});
```

### Recording Demo Videos

```typescript
// Slow down for watchable recordings
const SLOW_MO = 800;

test('demo recording - full flow', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000); // Hold for intro

  // Character-by-character typing for effect
  const input = page.locator('input[placeholder*="title"]');
  for (const char of 'Product Demo') {
    await input.type(char, { delay: 50 });
  }
  await page.waitForTimeout(SLOW_MO);

  // Continue flow with pauses for video clarity
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // Hold on result
});
```

### Handling Iframe Permissions

```typescript
// Grant camera/mic permissions for video testing
const context = await browser.newContext({
  permissions: ['camera', 'microphone'],
  viewport: { width: 1920, height: 1080 }
});
```

---

## Troubleshooting & Diagnostics

### API Error Reference

API errors return JSON with this structure:

```json
{
  "error": "error_code",
  "message": "Human-readable description",
  "errors": {                    // Present on 422 validation errors
    "friendly_url": ["The friendly url has already been taken."],
    "roles": ["The roles field is required when default_role is set."]
  }
}
```

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 401 | Unauthorized | Missing/invalid `Authorization` header; expired developer key |
| 403 | Forbidden | Key lacks permission for this endpoint; role-restricted action |
| 404 | Not Found | Room UUID doesn't exist; room was deleted; typo in endpoint path |
| 409 | Conflict | Recording already in progress; session already ended |
| 422 | Validation Error | See common causes below |
| 429 | Rate Limited | Too many requests; back off and retry with exponential delay |

**Common 422 validation errors by endpoint:**

| Endpoint | Field | Cause |
|----------|-------|-------|
| `POST /rooms` | `friendly_url` | Already taken, or exceeds 32 characters |
| `POST /rooms` | `roles` | Required when `default_role` is set |
| `POST /rooms` | `privacy` | Must be `"public"` or `"private"` |
| `POST /rooms` | `session_length` | Must be between 1 and 1440 (minutes) |
| `POST /recordings/start` | - | No active session in the room |

### SDK Initialization Failure Diagnosis

When the SDK fails to load or connect, work through this checklist:

**1. Secure context required** — HTTPS only (except `localhost` / `127.0.0.1`)

```javascript
if (!window.isSecureContext) {
  console.error('Digital Samba requires HTTPS. Current origin:', location.origin);
}
```

**2. Container element not found** — DOM not ready or wrong selector

```javascript
const container = document.getElementById('video-container');
if (!container) {
  console.error('Container element #video-container not found. Ensure DOM is ready.');
}
```

**3. Missing iframe permissions** — Required for camera/mic access

```html
<!-- The SDK adds this automatically, but if you create the iframe manually: -->
<iframe allow="camera; microphone; display-capture; autoplay" ...>
```

**4. Token issues** — Expired, wrong team/room ID, or malformed

```javascript
// Decode and inspect a JWT client-side (no verification)
function inspectToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('Token expired', new Date(payload.exp * 1000));
    }
    console.log('Token claims:', { td: payload.td, rd: payload.rd, role: payload.role, exp: payload.exp });
    return payload;
  } catch (e) {
    console.error('Malformed token — cannot decode');
    return null;
  }
}
```

**5. Room doesn't exist** — Deleted or wrong ID returns 404 on the room URL

### SDK Diagnostic Event Listeners

Wire up error and diagnostic events before calling `load()`:

```javascript
// Connection failure — network issue, invalid URL, or room unavailable
sambaFrame.on('connectionFailure', (e) => {
  console.error('Connection failed:', e.data);
  // e.data example: { error: "room_not_found" }
  // e.data example: { error: "network_error" }
});

// Application error — runtime errors from the embedded app
sambaFrame.on('appError', (e) => {
  console.error('App error:', e.data);
  // e.data example: { code: "MEDIA_ACCESS_DENIED", message: "Camera permission denied" }
});

// Debug: log all events during development
sambaFrame.on('*', (e) => {
  console.debug('[DS Event]', e.type, e.data);
});
```

### Full Diagnostic Initialization Example

A production-ready `initializeRoom()` that validates prerequisites, sets up error listeners, and detects timeouts:

```javascript
async function initializeRoom({ url, containerId, onReady, onError }) {
  // 1. Validate secure context
  if (!window.isSecureContext) {
    onError?.('Secure context required — serve over HTTPS');
    return null;
  }

  // 2. Validate container exists
  const container = document.getElementById(containerId);
  if (!container) {
    onError?.(`Container element #${containerId} not found`);
    return null;
  }

  // 3. Create SDK instance
  const sambaFrame = DigitalSambaEmbedded.createControl({ url, root: container });

  // 4. Set up error listeners before load()
  sambaFrame.on('connectionFailure', (e) => {
    onError?.(`Connection failed: ${e.data?.error || 'unknown'}`);
  });

  sambaFrame.on('appError', (e) => {
    onError?.(`App error [${e.data?.code}]: ${e.data?.message}`);
  });

  // 5. Detect load timeout
  let loaded = false;
  sambaFrame.on('frameLoaded', () => {
    loaded = true;
    onReady?.(sambaFrame);
  });

  sambaFrame.load();

  setTimeout(() => {
    if (!loaded) {
      onError?.('Timeout: iframe did not load within 15 seconds. Check URL and network.');
    }
  }, 15000);

  return sambaFrame;
}

// Usage
const frame = await initializeRoom({
  url: `https://${TEAM_DOMAIN}.digitalsamba.com/${roomId}?token=${token}`,
  containerId: 'video-container',
  onReady: (sf) => console.log('Room ready'),
  onError: (msg) => console.error('Room init failed:', msg)
});
```

### API Error Handling Wrapper

```javascript
class DigitalSambaError extends Error {
  constructor(message, status, code, validationErrors) {
    super(message);
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors; // field-level errors from 422
  }
}

async function apiCall(endpoint, options = {}) {
  const url = `https://api.digitalsamba.com/api/v1${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${DEVELOPER_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  } catch (err) {
    throw new DigitalSambaError('Network error — check connectivity', 0, 'network_error');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    switch (response.status) {
      case 401:
        throw new DigitalSambaError('Invalid or missing API key', 401, 'unauthorized');
      case 404:
        throw new DigitalSambaError(`Resource not found: ${endpoint}`, 404, 'not_found');
      case 422:
        throw new DigitalSambaError(
          body.message || 'Validation failed',
          422,
          'validation_error',
          body.errors // { field: ["error message", ...] }
        );
      case 429:
        throw new DigitalSambaError('Rate limited — retry after delay', 429, 'rate_limited');
      default:
        throw new DigitalSambaError(body.message || 'API error', response.status, body.error);
    }
  }

  // 204 No Content (e.g., DELETE responses)
  if (response.status === 204) return null;
  return response.json();
}
```
