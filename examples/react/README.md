# React Examples

## Prerequisites

```bash
npm install @digitalsamba/embedded-sdk
```

## Files

### useDigitalSamba.ts

A custom React hook that wraps the Digital Samba SDK with:
- Automatic lifecycle management
- Event callbacks
- State tracking (isLoaded, isJoined, participants)
- Control methods (toggleAudio, toggleVideo, etc.)

```tsx
import { useDigitalSamba } from './useDigitalSamba';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isJoined, controls, participants } = useDigitalSamba({
    roomUrl: 'https://team.digitalsamba.com/room?token=xxx',
    containerRef,
    onUserJoined: (user) => console.log(`${user.name} joined`)
  });

  return (
    <div>
      <div ref={containerRef} style={{ height: 500 }} />
      {isJoined && (
        <button onClick={() => controls.toggleAudio()}>
          Toggle Mic
        </button>
      )}
    </div>
  );
}
```

### VideoCall.tsx

A ready-to-use component with built-in controls and status display.

```tsx
import { VideoCall } from './VideoCall';

function App() {
  return (
    <VideoCall
      roomUrl="https://team.digitalsamba.com/room?token=xxx"
      height={600}
      showControls={true}
      onUserJoined={(user) => console.log(`${user.name} joined`)}
      onSessionEnded={() => console.log('Meeting ended')}
    />
  );
}
```

## Getting a Room URL with Token

Your server should generate the token and provide the full URL:

```typescript
// Server-side (Node.js)
const jwt = require('jsonwebtoken');

app.get('/api/room-url', (req, res) => {
  const token = jwt.sign({
    td: process.env.DS_TEAM_ID,
    rd: 'room-uuid',
    u: req.user.name,
    ud: req.user.id,
    role: 'attendee'
  }, process.env.DS_DEVELOPER_KEY, { algorithm: 'HS256' });

  res.json({
    url: `https://${process.env.DS_TEAM_DOMAIN}.digitalsamba.com/room-slug?token=${token}`
  });
});
```

```typescript
// Client-side (React)
const [roomUrl, setRoomUrl] = useState('');

useEffect(() => {
  fetch('/api/room-url')
    .then(r => r.json())
    .then(data => setRoomUrl(data.url));
}, []);

if (!roomUrl) return <div>Loading...</div>;

return <VideoCall roomUrl={roomUrl} />;
```
