# JWT Token Authentication

Digital Samba uses JWT tokens for client-side room access.

## Token Structure

```javascript
{
  // Required
  "td": "team-uuid",           // Your team ID
  "rd": "room-uuid",           // Target room ID
  
  // Optional - User identity
  "ud": "external-user-id",    // Your system's user identifier
  "u": "Display Name",         // User's display name
  "initials": "DN",            // Custom initials for video tile
  "avatar": "https://...",     // Avatar image URL
  
  // Optional - Access control
  "role": "moderator",         // Role ID or name
  "breakoutId": "uuid",        // Direct join to breakout room
  
  // Optional - Time constraints
  "iat": 1700000000,           // Issued at (Unix timestamp)
  "nbf": 1700000000,           // Not valid before
  "exp": 1700003600            // Expires at
}
```

## Signing

- **Algorithm**: HS256
- **Secret**: Your team's DEVELOPER_KEY

## Implementation Examples

### Node.js
```javascript
const jwt = require('jsonwebtoken');

function createRoomToken(options) {
  const payload = {
    td: process.env.DS_TEAM_ID,
    rd: options.roomId,
    u: options.userName,
    ud: options.userId,
    role: options.role || 'attendee',
    exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 3600)
  };
  
  return jwt.sign(payload, process.env.DS_DEVELOPER_KEY, { 
    algorithm: 'HS256' 
  });
}
```

### Python
```python
import jwt
import time
import os

def create_room_token(room_id, user_name, user_id=None, role='attendee', expires_in=3600):
    payload = {
        'td': os.environ['DS_TEAM_ID'],
        'rd': room_id,
        'u': user_name,
        'ud': user_id,
        'role': role,
        'exp': int(time.time()) + expires_in
    }
    
    return jwt.encode(
        payload, 
        os.environ['DS_DEVELOPER_KEY'], 
        algorithm='HS256'
    )
```

### PHP
```php
use Firebase\JWT\JWT;

function createRoomToken($roomId, $userName, $userId = null, $role = 'attendee') {
    $payload = [
        'td' => getenv('DS_TEAM_ID'),
        'rd' => $roomId,
        'u' => $userName,
        'ud' => $userId,
        'role' => $role,
        'exp' => time() + 3600
    ];
    
    return JWT::encode($payload, getenv('DS_DEVELOPER_KEY'), 'HS256');
}
```

## API Token Generation

Digital Samba also provides an API endpoint to generate tokens:

```bash
POST /api/v1/rooms/{room}/token
Authorization: Bearer {DEVELOPER_KEY}
Content-Type: application/json

{
  "ud": "user-123",
  "u": "John Doe",
  "role": "moderator",
  "exp": 1700003600
}
```

Response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "link": "https://team.digitalsamba.com/room?token=eyJ..."
}
```

## Security Best Practices

1. **Never expose DEVELOPER_KEY to browsers** - Generate tokens server-side only
2. **Set appropriate expiration** - Use short-lived tokens (1-4 hours)
3. **Use `nbf` for scheduled meetings** - Prevent early access
4. **Include `ud` for tracking** - Map to your user system for analytics
5. **Validate roles server-side** - Don't trust client role requests

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid token | Wrong secret | Verify DEVELOPER_KEY |
| Token expired | `exp` in past | Generate fresh token |
| Token not yet valid | `nbf` in future | Wait or remove `nbf` |
| Invalid room | Wrong `rd` | Verify room UUID |
| Invalid team | Wrong `td` | Verify team UUID |
