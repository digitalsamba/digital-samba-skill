# Digital Samba REST API Reference

**Base URL**: `https://api.digitalsamba.com`
**Version**: 1.0.0

## Authentication

Your **Developer Key** is found in the Digital Samba Dashboard under **Team Settings → Developer**. It serves two purposes:
1. **API authentication** — pass it in the `Authorization` header for all REST API calls
2. **JWT signing** — use it as the HMAC-SHA256 secret when generating client-side access tokens

> **Security**: Never expose the developer key in client-side code or browser requests. Use it only on your server.

```
Authorization: Bearer {DEVELOPER_KEY}
```

Or HTTP Basic Auth:
- Username: `{TEAM_ID}`
- Password: `{DEVELOPER_KEY}`

## Pagination

All list endpoints support:
- `limit` - Max 100 (default: 100)
- `offset` - Starting position (default: 0)
- `order` - `asc` or `desc` (default: desc)
- `after` - UUID for cursor-based pagination

Response format:
```json
{
  "total_count": 150,
  "data": [...]
}
```

---

## Default Room Settings

### GET /api/v1
Retrieve default settings applied to new rooms.

**Response**: Object with 50+ configuration properties (colors, features, limits)

### PATCH /api/v1
Update default room settings.

**Request Body**:
```json
{
  "domain": "custom.domain.com",
  "default_role": "attendee",
  "session_length": 60,
  "max_participants": 100
}
```

---

## Rooms

### POST /api/v1/rooms
Create a new room. All fields are **optional** — a room can be created with an empty body `{}` and will use your team's default settings.

**Required fields**: None. All fields below are optional.

**Key Optional Fields**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `friendly_url` | string | auto-generated | URL-safe room path (max 32 chars, must be unique per team) |
| `description` | string | `null` | Room description |
| `privacy` | string | `"public"` | `"public"` (anyone with URL) or `"private"` (requires JWT token) |
| `is_locked` | boolean | `false` | When true, room requires approval to join |
| `max_participants` | integer | team default | Maximum concurrent participants |
| `session_length` | integer | team default | Max session duration in minutes (1–1440) |
| `default_role` | string | team default | Role assigned to users who join without a role in their token. **Must** be included in `roles` array |
| `roles` | array | team default | Available roles in this room. Must be provided when `default_role` is set |
| `join_screen_enabled` | boolean | `true` | Show name/device entry screen before joining |
| `chat_enabled` | boolean | `true` | Enable in-room chat |
| `qa_enabled` | boolean | `false` | Enable Q&A panel |
| `recordings_enabled` | boolean | `false` | Allow recording |
| `screenshare_enabled` | boolean | `true` | Allow screen sharing |
| `raise_hand_enabled` | boolean | `true` | Allow hand raising |
| `video_on_join_enabled` | boolean | `true` | Auto-enable camera on join |
| `audio_on_join_enabled` | boolean | `false` | Auto-enable microphone on join |
| `auto_pip_enabled` | boolean | team default | When enabled, Picture-in-Picture opens automatically when participants switch away from the main tab or app |
| `room_reactions_enabled` | boolean | team default | When enabled, all participants can use emoji reactions in the room |
| `invite_participants_advanced_enabled` | boolean | team default | Controls whether the "Invite people" UI is shown by default for users who can invite participants. Invitations are shared via copyable links or in-app actions, without opening an email client |
| `toolbar` | object | `{"position":"bottom","visible":true}` | Toolbar placement and visibility |
| `topbar_enabled` | boolean | `true` | Show top bar |
| `logo_url` | string | `null` | Custom logo URL |
| `primary_color` | string | `null` | Hex color for UI accent |
| `background_color` | string | `null` | Hex color for background |

**Validation Rules**:
- `friendly_url`: Max 32 characters, URL-safe, unique per team
- `default_role`: When set, `roles` array must also be provided and must contain `default_role`
- `privacy`: Must be `"public"` or `"private"`
- `session_length`: Must be between 1 and 1440

**Minimal Request** (curl):
```bash
curl -X POST https://api.digitalsamba.com/api/v1/rooms \
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"friendly_url": "my-meeting", "privacy": "public"}'
```

**Full Request** (curl):
```bash
curl -X POST https://api.digitalsamba.com/api/v1/rooms \
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "friendly_url": "team-standup",
    "description": "Daily standup meeting",
    "privacy": "private",
    "max_participants": 50,
    "session_length": 60,
    "default_role": "attendee",
    "roles": ["moderator", "speaker", "attendee"],
    "chat_enabled": true,
    "recordings_enabled": true,
    "screenshare_enabled": true,
    "raise_hand_enabled": true
  }'
```

**Node.js Example**:
```javascript
const response = await fetch('https://api.digitalsamba.com/api/v1/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.DS_DEVELOPER_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    friendly_url: 'team-standup',
    privacy: 'private',
    max_participants: 50,
    default_role: 'attendee',
    roles: ['moderator', 'speaker', 'attendee'],
    chat_enabled: true,
    recordings_enabled: true
  })
});

if (!response.ok) {
  const err = await response.json();
  throw new Error(`${response.status}: ${err.message}`);
}

const room = await response.json();
console.log(`Room created: ${room.id}`);
console.log(`Room URL: ${room.room_url}`);
```

**Python Example**:
```python
import requests

response = requests.post(
    'https://api.digitalsamba.com/api/v1/rooms',
    headers={
        'Authorization': f'Bearer {DEVELOPER_KEY}',
        'Content-Type': 'application/json'
    },
    json={
        'friendly_url': 'team-standup',
        'privacy': 'private',
        'max_participants': 50,
        'default_role': 'attendee',
        'roles': ['moderator', 'speaker', 'attendee'],
        'chat_enabled': True,
        'recordings_enabled': True
    }
)
response.raise_for_status()
room = response.json()
print(f'Room created: {room["id"]}')
print(f'Room URL: {room["room_url"]}')
```

**Response** (`200 OK`):
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "friendly_url": "team-standup",
  "description": "Daily standup meeting",
  "privacy": "private",
  "is_locked": false,
  "room_url": "https://yourteam.digitalsamba.com/team-standup",
  "max_participants": 50,
  "session_length": 60,
  "default_role": "attendee",
  "roles": ["moderator", "speaker", "attendee"],
  "join_screen_enabled": true,
  "chat_enabled": true,
  "qa_enabled": false,
  "recordings_enabled": true,
  "screenshare_enabled": true,
  "raise_hand_enabled": true,
  "video_on_join_enabled": true,
  "audio_on_join_enabled": false,
  "topbar_enabled": true,
  "auto_pip_enabled": false,
  "room_reactions_enabled": true,
  "invite_participants_advanced_enabled": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/v1/rooms
List all team rooms. Returns a paginated response.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Max records to return (max 100) |
| `offset` | integer | 0 | Starting position for pagination |
| `order` | string | `"desc"` | Sort order: `"asc"` or `"desc"` |
| `after` | string | - | Room UUID or friendly_url for cursor-based pagination |
| `tag` | string/array | - | Filter by tag(s) |

**curl Example**:
```bash
curl https://api.digitalsamba.com/api/v1/rooms?limit=10&order=desc \
  -H "Authorization: Bearer YOUR_DEVELOPER_KEY"
```

**Node.js Example** (with pagination):
```javascript
async function listAllRooms() {
  const allRooms = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `https://api.digitalsamba.com/api/v1/rooms?limit=${limit}&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${process.env.DS_DEVELOPER_KEY}` } }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`${response.status}: ${err.message}`);
    }

    const { data, total_count } = await response.json();
    allRooms.push(...data);

    if (allRooms.length >= total_count) break;
    offset += limit;
  }

  return allRooms;
}

// Usage
const rooms = await listAllRooms();
rooms.forEach(r => console.log(`${r.friendly_url} (${r.privacy}) — ${r.id}`));
```

**Python Example** (with pagination):
```python
def list_all_rooms():
    all_rooms = []
    offset = 0
    limit = 100

    while True:
        response = requests.get(
            f'https://api.digitalsamba.com/api/v1/rooms?limit={limit}&offset={offset}',
            headers={'Authorization': f'Bearer {DEVELOPER_KEY}'}
        )
        response.raise_for_status()
        data = response.json()
        all_rooms.extend(data['data'])

        if len(all_rooms) >= data['total_count']:
            break
        offset += limit

    return all_rooms

# Usage
rooms = list_all_rooms()
for r in rooms:
    print(f'{r["friendly_url"]} ({r["privacy"]}) — {r["id"]}')
```

**Response** (`200 OK`):
```json
{
  "total_count": 42,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "friendly_url": "team-standup",
      "description": "Daily standup meeting",
      "privacy": "private",
      "max_participants": 50,
      "is_locked": false,
      "room_url": "https://yourteam.digitalsamba.com/team-standup",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/v1/rooms/{room}
Get room details. `{room}` can be UUID or friendly_url.

### PATCH /api/v1/rooms/{room}
Update room settings.

### DELETE /api/v1/rooms/{room}
Delete a room.

---

## Room Tokens

### POST /api/v1/rooms/{room}/token
Generate JWT access token for a room.

**Request Body**:
```json
{
  "ud": "user-123",
  "u": "John Doe",
  "initials": "JD",
  "role": "moderator",
  "avatar": "https://example.com/avatar.jpg",
  "breakoutId": "breakout-uuid",
  "nbf": 1700000000,
  "exp": 1700003600
}
```

**Response**:
```json
{
  "token": "eyJ0eXAiOiJKV1Q...",
  "link": "https://team.digitalsamba.com/room?token=eyJ..."
}
```

---

## Chat

### GET /api/v1/rooms/{room}/chat
Retrieve chat messages.

**Query Parameters**:
- `session_id` - Filter by session
- `limit`, `offset`, `order`, `after`

**Response**:
```json
{
  "data": [{
    "id": "uuid",
    "message": "Hello everyone",
    "participant_id": "uuid",
    "participant_name": "John",
    "external_participant_id": "user-123",
    "breakout_id": null,
    "created_at": "2024-01-15T10:30:00Z"
  }]
}
```

### GET /api/v1/rooms/{room}/chat/export
Export chat as file.

**Query Parameters**:
- `session_id`
- `format` - `txt` or `json`

### DELETE /api/v1/rooms/{room}/chat
Delete all chat messages for a room.

---

## Q&A (Questions & Answers)

### GET /api/v1/rooms/{room}/questions
Retrieve Q&A content.

**Response**:
```json
{
  "data": [{
    "id": "uuid",
    "question": "How do I...?",
    "participant_id": "uuid",
    "participant_name": "Jane",
    "answers": [{
      "id": "uuid",
      "answer": "You can...",
      "participant_name": "Moderator"
    }],
    "created_at": "2024-01-15T10:30:00Z"
  }]
}
```

### GET /api/v1/rooms/{room}/questions/export
Export Q&A as `txt` or `json`.

### DELETE /api/v1/rooms/{room}/questions
Delete all Q&A content.

---

## Transcripts

### GET /api/v1/rooms/{room}/transcripts
Retrieve closed captions/transcripts.

**Response**:
```json
{
  "data": [{
    "participant_id": "uuid",
    "participant_name": "John",
    "transcript": "I think we should...",
    "start_time": "2024-01-15T10:30:00Z",
    "end_time": "2024-01-15T10:30:05Z"
  }]
}
```

### GET /api/v1/rooms/{room}/transcripts/export
Export transcripts as `txt` or `json`.

### DELETE /api/v1/rooms/{room}/transcripts
Delete transcripts.

### DELETE /api/v1/rooms/{room}/summaries
Delete AI-generated summaries.

---

## Polls

### GET /api/v1/rooms/{room}/polls
List polls for a room. Returns paginated response with `total_count` and `data` array.

### POST /api/v1/rooms/{room}/polls
Create a new poll.

**Request Body**:
```json
{
  "question": "What topic should we cover next?",
  "type": "single",
  "anonymous": true,
  "options": [
    {"id": "uuid-optional", "label": "API Design"},
    {"id": "uuid-optional", "label": "Security"},
    {"id": "uuid-optional", "label": "Performance"}
  ]
}
```

**Poll Types**:
| Type | Description |
|------|-------------|
| `single` | Single choice (one answer) |
| `multiple` | Multiple choices (select many) |
| `free` | Short answer (free text) |

> **Note**: The `multiple` boolean field is deprecated. Use `type: "multiple"` instead.

**Response**:
```json
{
  "id": "uuid",
  "question": "What topic...",
  "status": "draft",
  "type": "single",
  "anonymous": true,
  "options": [
    {"id": "uuid", "label": "API Design"},
    {"id": "uuid", "label": "Security"},
    {"id": "uuid", "label": "Performance"}
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### DELETE /api/v1/rooms/{room}/polls
Delete all polls.

---

## Quizzes

Create and manage in-meeting quizzes with multiple choice questions.

### GET /api/v1/rooms/{room}/quizzes
List quizzes for a room.

**Query Parameters**: `limit`, `offset`, `order`, `after`

**Response**:
```json
{
  "total_count": 1,
  "data": [{
    "id": "uuid",
    "title": "My quiz",
    "time_limit_minutes": 45,
    "status": "created",
    "created_at": "2025-12-19T05:33:54Z"
  }]
}
```

### POST /api/v1/rooms/{room}/quizzes
Create a new quiz.

**Request Body**:
```json
{
  "title": "My quiz",
  "time_limit_minutes": 60,
  "questions": [
    {
      "text": "Question #1",
      "multiple": false,
      "choices": [
        {"text": "Correct answer", "correct": true},
        {"text": "Wrong answer", "correct": false}
      ]
    },
    {
      "text": "Question #2 (multiple choice)",
      "multiple": true,
      "choices": [
        {"text": "Correct answer #1", "correct": true},
        {"text": "Wrong answer", "correct": false},
        {"text": "Correct answer #2", "correct": true}
      ]
    }
  ]
}
```

**Field Constraints**:
| Field | Constraint |
|-------|------------|
| `title` | Min 1, max 255 characters |
| `time_limit_minutes` | Min 1, max 1440 (24 hours) |

**Response**: Full quiz object with generated UUIDs for quiz, questions, and choices.

### GET /api/v1/rooms/{room}/quizzes/{quiz}
Get quiz details including all questions and choices.

### PATCH /api/v1/rooms/{room}/quizzes/{quiz}
Update a quiz. Include question/choice `id` to update existing items, omit to create new ones.

### DELETE /api/v1/rooms/{room}/quizzes/{quiz}
Delete a specific quiz.

### DELETE /api/v1/rooms/{room}/quizzes
Delete all quizzes for a room.

### GET /api/v1/rooms/{room}/quizzes/{quiz}/results
Get quiz results with participant responses.

**Query Parameters**:
- `session_id` - Filter by session UUID

**Response**:
```json
[{
  "id": "uuid",
  "session_id": "uuid",
  "title": "My quiz",
  "status": "launched",
  "started": "2025-12-19T07:29:52Z",
  "ended": "2025-12-19T07:30:52Z",
  "questions": [{
    "id": "uuid",
    "question": "Question #1",
    "voted": 4,
    "votes": [{
      "id": "uuid",
      "text": "Answer #1",
      "voted": 3,
      "voters": [{"id": "uuid", "name": "John"}]
    }]
  }]
}]
```

### GET /api/v1/rooms/{room}/quizzes/export
Export quiz results.

**Query Parameters**:
- `format` - `csv`, `txt`, or `json`

---

## Recordings

### DELETE /api/v1/rooms/{room}/recordings
Delete all recordings for a room.

### GET /api/v1/recordings
List all recordings.

### GET /api/v1/recordings/{recording}
Get recording details.

### GET /api/v1/recordings/{recording}/download
Download recording file.

### DELETE /api/v1/recordings/{recording}
Delete a specific recording.

### POST /api/v1/recordings/{recording}/archive
Archive a recording.

---

## Sessions

### GET /api/v1/sessions
List all sessions.

### GET /api/v1/sessions/{session}
Get session details.

### GET /api/v1/sessions/{session}/participants
List participants in a session.

### GET /api/v1/sessions/{session}/statistics
Get session statistics.

### GET /api/v1/sessions/{session}/transcripts
Get session transcripts.

### DELETE /api/v1/sessions/{session}/quizzes
Delete all quizzes for a session.

---

## Participants

### GET /api/v1/participants
List all participants.

### GET /api/v1/participants/{participant}
Get participant details.

### GET /api/v1/participants/{participant}/sessions
List sessions for a participant.

---

## Phone Bridge (SIP)

Connect phone participants to rooms via SIP integration.

### POST /api/v1/rooms/{room}/phone/connect
Connect the room to the phone bridge (SIP). Enables phone dial-in participants to join the meeting.

### POST /api/v1/rooms/{room}/phone/disconnect
Disconnect the room from the phone bridge (SIP).

---

## Restreamers (RTMP)

Stream room video to external platforms like YouTube, Vimeo, or custom RTMP servers.

### POST /api/v1/rooms/{room}/restreamers/start
Start RTMP restreaming from the room.

**Request Body**:
```json
{
  "type": "youtube",
  "stream_key": "your-stream-key"
}
```

**Or with custom RTMP server**:
```json
{
  "server_url": "rtmps://rtmp-global.cloud.vimeo.com/live",
  "stream_key": "your-stream-key"
}
```

**Parameters**:
| Field | Description |
|-------|-------------|
| `type` | Restreaming provider: `youtube`, `vimeo`, or `cloudflare`. Don't use with `server_url`. |
| `server_url` | Custom RTMP server URL. Don't use with `type`. |
| `stream_key` | **(Required)** Unique authentication token for your restreaming destination. |

### POST /api/v1/rooms/{room}/restreamers/stop
Stop RTMP restreaming from the room.

---

## Roles & Permissions

### GET /api/v1/roles
List custom roles.

### POST /api/v1/roles
Create a custom role.

**Request Body**:
```json
{
  "name": "presenter",
  "display_name": "Presenter",
  "permissions": {
    "broadcast": true,
    "screenshare": true,
    "chat": true,
    "raise_hand": true,
    "recording": false,
    "emoji_reactions": true
  }
}
```

### GET /api/v1/roles/{role}
Get role details.

### PATCH /api/v1/roles/{role}
Update a role.

### DELETE /api/v1/roles/{role}
Delete a role.

---

## Libraries (Content)

### GET /api/v1/libraries
List library folders.

### POST /api/v1/libraries
Create a library folder.

### GET /api/v1/libraries/{library}/files
List files in a library.

### POST /api/v1/libraries/{library}/files
Upload a file to library.

### DELETE /api/v1/libraries/{library}/files/{file}
Delete a library file.

---

## Live Status

### GET /api/v1/rooms/{room}/live/count
Get live participant count for a room.

### GET /api/v1/live/count
Get total live participants across all rooms.

---

## Statistics

### GET /api/v1/statistics/rooms
Room usage statistics.

### GET /api/v1/statistics/participants
Participant statistics.

### GET /api/v1/statistics/sessions
Session statistics.

### GET /api/v1/statistics/recordings
Recording statistics.

---

## Webhooks

### GET /api/v1/webhooks
List configured webhooks.

### POST /api/v1/webhooks
Create a webhook.

**Request Body**:
```json
{
  "endpoint": "https://your-server.com/webhook",
  "events": [
    "session.started",
    "session.ended",
    "participant.joined",
    "participant.left",
    "recording.started",
    "recording.stopped"
  ],
  "secret": "your-webhook-secret"
}
```

### GET /api/v1/webhooks/{webhook}
Get webhook details.

### PATCH /api/v1/webhooks/{webhook}
Update a webhook.

### DELETE /api/v1/webhooks/{webhook}
Delete a webhook.

---

## Webhook Events

| Event | Triggered When |
|-------|----------------|
| `session.started` | Meeting begins |
| `session.ended` | Meeting ends |
| `participant.joined` | User joins room |
| `participant.left` | User leaves room |
| `recording.started` | Recording begins |
| `recording.stopped` | Recording ends |
| `recording.ready` | Recording processed and available |
| `transcript.ready` | Transcript available |

**Webhook Payload**:
```json
{
  "event": "participant.joined",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "room_id": "uuid",
    "session_id": "uuid",
    "participant_id": "uuid",
    "external_id": "user-123",
    "name": "John Doe"
  }
}
```

**Signature Verification**: Webhooks are signed with HMAC-SHA256 using your webhook secret. Verify the `X-Signature` header matches the computed hash of the payload.
