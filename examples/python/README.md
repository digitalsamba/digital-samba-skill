# Python Examples

## Prerequisites

```bash
pip install requests pyjwt

# For webhook handler
pip install fastapi uvicorn
```

## Environment Variables

```bash
export DS_DEVELOPER_KEY="your-developer-key"
export DS_TEAM_ID="your-team-id"  # Required for local JWT generation
```

## Examples

### basic_room.py

Complete room lifecycle demo - create, token generation (API + local), list, delete.

```bash
python basic_room.py
```

### webhook_handler.py

FastAPI server for receiving Digital Samba webhooks.

Set `DS_WEBHOOK_TOKEN` to the same value you pass as `authorization_header` when
registering the webhook — the handler rejects deliveries that don't match.

```bash
DS_WEBHOOK_TOKEN="your-token" uvicorn webhook_handler:app --reload --port 3000
```

Or run directly:
```bash
DS_WEBHOOK_TOKEN="your-token" python webhook_handler.py
```

Endpoints:
- `POST /webhook` - Webhook receiver
- `GET /health` - Health check
- `GET /` - Setup instructions

## JWT Token Generation

Two methods for generating room access tokens. See `jwt-tokens.md` for the full guide.

### Method 1: Local Signing (recommended for production)

No network round-trip, works offline, and gives you full control over the claims.

```python
import jwt
import time

token = jwt.encode({
    'td': TEAM_ID,
    'rd': room_id,
    'u': 'Display Name',
    'ud': 'user-123',
    'role': 'attendee',
    'exp': int(time.time()) + 3600
}, DEVELOPER_KEY, algorithm='HS256')
```

### Method 2: API Endpoint

Simpler if you would rather not add a JWT library, at the cost of a network call
per token. Returns a ready-made join link alongside the token.

```python
response = requests.post(
    f'https://api.digitalsamba.com/api/v1/rooms/{room_id}/token',
    headers={'Authorization': f'Bearer {DEVELOPER_KEY}'},
    json={
        'ud': 'user-123',
        'u': 'Display Name',
        'role': 'moderator'
    }
)
token = response.json()['token']
join_link = response.json()['link']
```
