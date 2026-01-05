# Digital Samba REST API Reference

**Base URL**: `https://api.digitalsamba.com`
**Version**: 1.0.0

## Authentication

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
Create a new room.

**Field Constraints**:
| Field | Constraint |
|-------|------------|
| `friendly_url` | Max 32 characters. URL-safe string for room URL path. Must be unique per team. |
| `default_role` | Must be included in the `roles` array. If specifying `default_role`, you must also provide `roles` containing that role. |

**Request Body**:
```json
{
  "friendly_url": "my-meeting",
  "description": "Team standup",
  "privacy": "public",
  "is_locked": false,
  "join_screen_enabled": true,
  "max_participants": 50,
  "session_length": 60,
  "default_role": "attendee",
  "roles": ["moderator", "speaker", "attendee"],
  "chat_enabled": true,
  "qa_enabled": false,
  "recordings_enabled": true,
  "recording_bookmarks_enabled": true,
  "screenshare_enabled": true,
  "raise_hand_enabled": true,
  "video_on_join_enabled": true,
  "audio_on_join_enabled": false,
  "toolbar": {
    "position": "bottom",
    "visible": true
  },
  "topbar_enabled": true,
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#007bff",
  "background_color": "#ffffff"
}
```

**Response**: Room object with UUID, URLs, and all settings.

### GET /api/v1/rooms
List all team rooms.

**Query Parameters**:
- `limit`, `offset`, `order`, `after`
- `tag` - Filter by tag (string or array)

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
    "recording": false
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
