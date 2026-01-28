# JWT Token Authentication

Digital Samba uses JWT tokens to authenticate users joining video rooms. Tokens are generated **server-side** and passed to the client to join a room.

## Two Ways to Generate Tokens

| Approach | When to Use | How It Works |
|----------|-------------|--------------|
| **Local JWT signing** | You need full control over claims, offline signing, or minimal latency | Your server signs a JWT directly using the developer key as the HMAC secret |
| **API token endpoint** | You prefer not to handle JWT libraries, or want Digital Samba to construct the token | Your server calls `POST /api/v1/rooms/{room}/token` and receives a ready-made token + join link |

Both produce a valid JWT. Choose **local signing** for most production use cases (no network round-trip, works offline). Choose the **API endpoint** for simplicity if you don't want to add a JWT library.

## Prerequisites

Before generating tokens, you need two values from your Digital Samba Dashboard:

| Value | Where to Find | Environment Variable |
|-------|---------------|---------------------|
| **Developer Key** | Dashboard → Team Settings → Developer | `DS_DEVELOPER_KEY` |
| **Team ID** | Dashboard → Team Settings → Developer (shown as "Team UUID") | `DS_TEAM_ID` |

Set these as environment variables on your server:

```bash
# .env (never commit this file)
DS_DEVELOPER_KEY=your-developer-key-here
DS_TEAM_ID=your-team-uuid-here
```

> **Security**: The developer key is a secret. Never expose it in client-side code, public repositories, or browser requests. Generate tokens only on your server.

## Token Structure

```javascript
{
  // Required
  "td": "team-uuid",           // Your team ID (from Dashboard → Team Settings → Developer)
  "rd": "room-uuid",           // Target room ID (from POST /api/v1/rooms response)

  // Optional - User identity
  "ud": "external-user-id",    // Your system's user identifier (for attendance tracking)
  "u": "Display Name",         // User's display name in the room
  "initials": "DN",            // Custom initials for video tile
  "avatar": "https://...",     // Avatar image URL

  // Optional - Access control
  "role": "moderator",         // Role name — must match a role configured on the room
  "breakoutId": "uuid",        // Direct join to breakout room

  // Optional - Time constraints
  "iat": 1700000000,           // Issued at (Unix timestamp)
  "nbf": 1700000000,           // Not valid before (for scheduled meetings)
  "exp": 1700003600            // Expires at (recommended: 1-4 hours from now)
}
```

## Signing

- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: Your team's `DEVELOPER_KEY`

## Local JWT Signing (Recommended)

Sign tokens directly on your server — no API call needed.

### Node.js

```bash
npm install jsonwebtoken
```

```javascript
const jwt = require('jsonwebtoken');

const DEVELOPER_KEY = process.env.DS_DEVELOPER_KEY;
const TEAM_ID = process.env.DS_TEAM_ID;

/**
 * Generate a JWT token for Digital Samba room access.
 * @param {Object} options
 * @param {string} options.roomId    - Room UUID (from POST /api/v1/rooms response)
 * @param {string} options.userName  - Display name shown in the room
 * @param {string} [options.userId]  - Your system's user ID (for attendance tracking)
 * @param {string} [options.role]    - Role name: 'moderator', 'speaker', or 'attendee'
 * @param {number} [options.expiresIn] - Token lifetime in seconds (default: 3600)
 * @returns {string} Signed JWT token
 */
function createRoomToken(options) {
  if (!DEVELOPER_KEY || !TEAM_ID) {
    throw new Error('Missing DS_DEVELOPER_KEY or DS_TEAM_ID environment variables');
  }
  if (!options.roomId) {
    throw new Error('roomId is required');
  }
  if (!options.userName) {
    throw new Error('userName is required');
  }

  const payload = {
    td: TEAM_ID,
    rd: options.roomId,
    u: options.userName,
    ud: options.userId || undefined,
    role: options.role || 'attendee',
    exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 3600)
  };

  return jwt.sign(payload, DEVELOPER_KEY, { algorithm: 'HS256' });
}

// Usage in an Express route:
app.get('/api/join/:roomId', (req, res) => {
  try {
    const token = createRoomToken({
      roomId: req.params.roomId,
      userName: req.user.displayName,
      userId: req.user.id,
      role: req.user.isAdmin ? 'moderator' : 'attendee'
    });

    const joinUrl = `https://${process.env.DS_TEAM_DOMAIN}.digitalsamba.com/${req.params.roomId}?token=${token}`;
    res.json({ token, joinUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Python

```bash
pip install pyjwt
```

```python
import jwt
import time
import os

DEVELOPER_KEY = os.environ.get('DS_DEVELOPER_KEY')
TEAM_ID = os.environ.get('DS_TEAM_ID')

def create_room_token(room_id: str, user_name: str, user_id: str = None,
                      role: str = 'attendee', expires_in: int = 3600) -> str:
    """Generate a JWT token for Digital Samba room access.

    Args:
        room_id: Room UUID (from POST /api/v1/rooms response)
        user_name: Display name shown in the room
        user_id: Your system's user ID (for attendance tracking)
        role: Role name — 'moderator', 'speaker', or 'attendee'
        expires_in: Token lifetime in seconds (default: 3600)

    Returns:
        Signed JWT token string

    Raises:
        ValueError: If required parameters are missing
    """
    if not DEVELOPER_KEY or not TEAM_ID:
        raise ValueError('Missing DS_DEVELOPER_KEY or DS_TEAM_ID environment variables')
    if not room_id:
        raise ValueError('room_id is required')
    if not user_name:
        raise ValueError('user_name is required')

    payload = {
        'td': TEAM_ID,
        'rd': room_id,
        'u': user_name,
        'role': role,
        'exp': int(time.time()) + expires_in
    }

    if user_id:
        payload['ud'] = user_id

    return jwt.encode(payload, DEVELOPER_KEY, algorithm='HS256')


# Usage in a Flask route:
@app.route('/api/join/<room_id>')
def join_room(room_id):
    try:
        token = create_room_token(
            room_id=room_id,
            user_name=current_user.display_name,
            user_id=str(current_user.id),
            role='moderator' if current_user.is_admin else 'attendee'
        )
        team_domain = os.environ['DS_TEAM_DOMAIN']
        join_url = f'https://{team_domain}.digitalsamba.com/{room_id}?token={token}'
        return jsonify({'token': token, 'joinUrl': join_url})
    except ValueError as e:
        return jsonify({'error': str(e)}), 500
```

### PHP

```bash
composer require firebase/php-jwt
```

```php
use Firebase\JWT\JWT;

function createRoomToken(
    string $roomId,
    string $userName,
    ?string $userId = null,
    string $role = 'attendee',
    int $expiresIn = 3600
): string {
    $developerKey = getenv('DS_DEVELOPER_KEY');
    $teamId = getenv('DS_TEAM_ID');

    if (!$developerKey || !$teamId) {
        throw new RuntimeException('Missing DS_DEVELOPER_KEY or DS_TEAM_ID environment variables');
    }
    if (empty($roomId)) {
        throw new InvalidArgumentException('roomId is required');
    }
    if (empty($userName)) {
        throw new InvalidArgumentException('userName is required');
    }

    $payload = [
        'td' => $teamId,
        'rd' => $roomId,
        'u' => $userName,
        'role' => $role,
        'exp' => time() + $expiresIn
    ];

    if ($userId !== null) {
        $payload['ud'] = $userId;
    }

    return JWT::encode($payload, $developerKey, 'HS256');
}

// Usage in a Laravel route:
Route::get('/api/join/{roomId}', function (string $roomId) {
    try {
        $token = createRoomToken(
            roomId: $roomId,
            userName: auth()->user()->name,
            userId: (string) auth()->user()->id,
            role: auth()->user()->is_admin ? 'moderator' : 'attendee'
        );

        $teamDomain = env('DS_TEAM_DOMAIN');
        $joinUrl = "https://{$teamDomain}.digitalsamba.com/{$roomId}?token={$token}";
        return response()->json(['token' => $token, 'joinUrl' => $joinUrl]);
    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
```

## API Token Endpoint (Alternative)

If you prefer not to use a JWT library, Digital Samba can generate the token for you via API. This requires a network call to Digital Samba's servers and uses your developer key for authentication (not signing).

```bash
curl -X POST https://api.digitalsamba.com/api/v1/rooms/{room_id}/token \
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ud": "user-123",
    "u": "John Doe",
    "role": "moderator"
  }'
```

**Response** (`200 OK`):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "link": "https://team.digitalsamba.com/room?token=eyJ..."
}
```

The `link` field is a ready-to-use join URL — pass it directly to the client for iframe embedding or redirect.

> **When to use this instead of local signing**: Use the API endpoint when you want simplicity (no JWT library needed), or when your server language lacks a mature JWT library. For production systems with high traffic, prefer local signing to avoid the extra network round-trip.

## Role Permissions

The `role` claim maps to roles configured in your Digital Samba dashboard. Key permission:

| Permission | Effect |
|------------|--------|
| `start_session` | User can start/join meeting without waiting in lobby |

If users are stuck on the join screen, ensure their role has `start_session` permission. Default `moderator` role typically has this; `speaker` and `attendee` may not.

List available permissions: `GET /api/v1/permissions`

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
