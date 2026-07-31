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

**Response**: Object with the team's default room configuration (same settings as documented under [POST /api/v1/rooms](#rooms))

### PATCH /api/v1
Update default room settings. Accepts the same settings as room creation (see the grouped tables under [POST /api/v1/rooms](#rooms)), plus team-only settings:

| Field | Type | Description |
|-------|------|-------------|
| `domain` | string | Team subdomain (letters, numbers, dashes, underscores; reserved names not allowed) |
| `favicon` | string | Custom favicon displayed in rooms (image URL or base64) |

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

**Required fields**: None. All fields below are optional. Any setting omitted at room creation inherits the team default (managed via `PATCH /api/v1`). The same fields are accepted by `PATCH /api/v1/rooms/{room}`.

#### Core

| Field | Type | Description |
|-------|------|-------------|
| `friendly_url` | string | URL-safe room path (3–32 chars, must be unique per team; auto-generated if omitted) |
| `description` | string | Room description (3–500 chars) |
| `external_id` | string | Assign the room an ID for integration on your side |
| `tags` | array | Room tags |
| `expires_at` | datetime | Room is automatically deleted after this time. Future date, format `YYYY-MM-DD hh:mm:ss` |
| `privacy` | string | `"public"` (anyone with URL) or `"private"` (requires JWT token) |
| `is_locked` | boolean | Locked rooms require acceptance to join. Single-role rooms cannot be locked |
| `max_participants` | integer | Maximum concurrent participants (min 2, plan-limited, up to 2000) |
| `max_broadcasters` | integer | Maximum concurrent broadcasters (min 1, capped by `max_participants`) |
| `session_length` | integer | Max session duration in minutes (1–1440). Empty means unlimited |
| `default_role` | string | Role assigned to users who join without a role in their token. **Must** be included in `roles` array |
| `roles` | array | Available roles in this room (IDs or names; order = order in Participants panel). Must be provided when `default_role` is set |
| `webhooks` | array | Restrict the room to the given webhook IDs. When omitted, all team webhooks apply |

#### Join, Lobby & Consent

| Field | Type | Description |
|-------|------|-------------|
| `join_screen_enabled` | boolean | Show name/device entry screen before joining |
| `lobby_message` | string | Text shown to participants waiting in the lobby (3–1000 chars) |
| `lobby_sound_enabled` | boolean | Play a sound whenever someone enters the lobby |
| `consent_message_enabled` | boolean | Remind participants that joining implies consent to personal data processing |
| `consent_message_type` | string | `"generic"` or `"custom"` |
| `consent_message` | string | Custom consent message text |
| `checkbox_message` | string | Custom message for the "don't show this again" checkbox |
| `simple_notifications_enabled` | boolean | Non-disruptive join/leave notifications |
| `rejoin_session_enabled` | boolean | Show a "Rejoin" link after a user leaves a session |

#### Media & Quality

| Field | Type | Description |
|-------|------|-------------|
| `video_on_join_enabled` | boolean | When disabled, users join with cameras off |
| `audio_on_join_enabled` | boolean | When disabled, users join muted |
| `is_audio_only` | boolean | Disables cameras, HD video, and virtual backgrounds; broadcast permissions apply to audio only |
| `hd_video_on_join_enabled` | boolean | Participants stream in higher quality (requires more uplink bandwidth) |
| `hd_video_quality` | string | One of `720_1.5`, `720_2.5`, `1080_2.5`, `1080_5.5` |
| `audio_quality` | string | One of `32`, `64`, `128`, `256` |
| `audio_autogain_enabled` | boolean | Enable audio autogain |
| `audio_echo_cancellation_enabled` | boolean | Eliminate echo and feedback |
| `audio_noise_suppression_enabled` | boolean | Reduce background noise |
| `virtual_backgrounds_enabled` | boolean | Allow desktop participants to use virtual backgrounds |
| `virtual_backgrounds_v2_enabled` | boolean | Use the new virtual background engine |
| `screenshare_enabled` | boolean | Allow screen sharing (not available on mobile) |

#### Layout & Video Tiles

| Field | Type | Description |
|-------|------|-------------|
| `layout_mode_on_join` | string | Layout on join: `auto` (highlights active speaker/content) or `tiled` (grid) |
| `layout_mode_switch_enabled` | boolean | Show the layout mode switcher |
| `video_fit_mode_enabled` | boolean | Display video streams in full without cropping. Participants can override for their own view per session |
| `video_tile_layout_mode` | string | Where the participant name and status icons appear on each video tile. `"top"`: name centered at the top, status icons grouped in the bottom left. `"bottom"`: name at the bottom left, status icons grouped in the top right |
| `broadcaster_tile_visibility` | string | Visibility of tiles showing broadcaster initials by cam/mic state: `all`, `cam_mic`, or `cam` |
| `full_screen_enabled` | boolean | Allow expanding any tile to full screen (not in Auto mode) |
| `pin_enabled` | boolean | Allow participants to pin (enlarge and watch) a participant |
| `pin_panels_enabled` | boolean | Roles with the relevant permission can force-pin tiles for everyone |
| `minimize_own_tile_enabled` | boolean | Allow participants to minimise/maximise their own tile in tiled mode |
| `minimize_own_tile_on_join_enabled` | boolean | Participants join with their own tile minimised |
| `pip_enabled` | boolean | Allow extracting tiles into a Picture-in-Picture window |
| `auto_pip_enabled` | boolean | Picture-in-Picture opens automatically when participants switch away from the tab/app |

#### Toolbar, Top Bar & In-Room UI

| Field | Type | Description |
|-------|------|-------------|
| `toolbar_enabled` | boolean | Show the toolbar |
| `toolbar_position` | string | Toolbar position on desktop: `left`, `right`, or `bottom` |
| `toolbar_color` | string | Toolbar background colour (hex code) |
| `topbar_enabled` | boolean | Show the top bar |
| `participants_list_enabled` | boolean | Give participants access to the Participants panel |
| `end_session_enabled` | boolean | Show the "End session" button in the toolbar |
| `leave_session_enabled` | boolean | Show the "Leave session" button in the toolbar |
| `mute_sound_enabled` | boolean | Allow participants to locally mute room sound |
| `connection_quality_indicator_enabled` | boolean | Show participants their local connection quality indicator |
| `connection_message_enabled` | boolean | Show a status notification when a weak connection occurs |
| `room_reactions_enabled` | boolean | All participants can use emoji reactions |
| `raise_hand_enabled` | boolean | Allow hand raising |
| `invite_participants_enabled` | boolean | Show an "Invite people" button in the participants panel for users allowed to invite |
| `invite_participants_advanced_enabled` | boolean | Show the "Invite people" UI by default for users who can invite participants (links/in-app actions, no email client) |

#### Language

| Field | Type | Description |
|-------|------|-------------|
| `language` | string | Default room UI language. One of: `ar-SA`, `en`, `es-ES`, `de-DE`, `it-IT`, `nl-NL`, `pt-PT`, `ro-RO`, `zh-CN`, `zh-TW` |
| `language_selection_enabled` | boolean | Allow each user to change the UI language on their side |
| `languages` | array | Subset of language codes participants can choose from |

#### Branding & Appearance

| Field | Type | Description |
|-------|------|-------------|
| `logo_enabled` | boolean | Show the logo in the room |
| `custom_logo` | string | Custom logo for the room and its recordings (image URL or base64) |
| `application_logo` | string | Logo for the room's join page (image URL or base64) |
| `primary_color` | string | Colour for buttons and interactive elements (hex code) |
| `background_color` | string | Background colour (hex code) |
| `palette_mode` | string | Appearance of panels, modals and join screen: `light` or `dark` |
| `html_title` | string | Custom browser tab title when the room is not embedded (3–255 chars) |
| `watermark_enabled` | boolean | Display a repeated text watermark to discourage unauthorized recording/sharing |
| `watermark_text` | string | Custom watermark text (3–150 chars) |

#### Chat, Q&A, Polls & Notes

| Field | Type | Description |
|-------|------|-------------|
| `chat_enabled` | boolean | Allow posting and reading in the public chat |
| `private_chat_enabled` | boolean | Enable one-to-one chats |
| `private_group_chat_enabled` | boolean | Enable private group chats |
| `private_group_chat_name` | string | Display name for the private group chat (min 3 chars) |
| `private_group_chat_roles` | array | Roles (IDs or names) included in the private group chat |
| `chat_persistence_enabled` | boolean | Retain and reload public chat messages across sessions |
| `chat_reactions_enabled` | boolean | React to chat messages with emojis |
| `chat_reactions_extended_enabled` | boolean | Expanded emoji set for chat reactions |
| `qa_enabled` | boolean | Allow posting, answering, and moderating questions (answering/moderating require permission) |
| `qa_default_filter` | string | Default Q&A panel filter: `all`, `open`, or `answered` |
| `upvote_qa_enabled` | boolean | Participants with the 'Upvote Q&A' permission can vote for questions |
| `polls_enabled` | boolean | Participants with the 'manage polls' permission can create and launch polls |
| `shared_notes_enabled` | boolean | Shared notes panel for collaborative note-taking |

#### Content Library & Whiteboard

| Field | Type | Description |
|-------|------|-------------|
| `content_library_enabled` | boolean | Add the Content Library component so permitted participants can present files |
| `default_content_library` | string | Library tab selected by default: `room` or `personal` |
| `library_id` | string | Wire a content library to this room (library UUID) |
| `whiteboard_enabled` | boolean | Add a whiteboard (requires 'edit whiteboard' permission to edit). Not compatible with E2EE |

#### Recording

| Field | Type | Description |
|-------|------|-------------|
| `recordings_enabled` | boolean | Allow participants to record sessions |
| `recording_autostart_enabled` | boolean | Recording starts automatically when the first participant joins |
| `recording_breakout_autostart_enabled` | boolean | Automatically record breakout rooms when the first user joins |
| `recording_bookmarks_enabled` | boolean | Bookmarks can be added during active recordings |
| `recording_consent_message_enabled` | boolean | Remind the initiating participant that all participants' consent may be legally required |
| `recording_logo_enabled` | boolean | Show the logo in recordings |
| `recordings_layout_mode` | string | Layout mode for recordings: `auto` or `tiled` |
| `hide_tiles_in_recordings_enabled` | boolean | Recordings capture only audio and shared screens (blank screen if none) |
| `participant_names_in_recordings_enabled` | boolean | Include participant name badges on tiles in recordings |

#### Transcription & Captions

| Field | Type | Description |
|-------|------|-------------|
| `transcription_enabled` | boolean | Transcribe participants' speech into text (incompatible with E2EE) |
| `transcription_auto_start_enabled` | boolean | Transcription starts automatically when the first participant joins |
| `transcription_store_enabled` | boolean | Store transcripts & summaries |
| `captions_enabled` | boolean | Allow participants to enable or disable captions on their end |
| `captions_language` | string | Default input language to be transcribed. One of: `bg`, `ca`, `da`, `de`, `en`, `es`, `fi`, `fr`, `it`, `nl`, `pt`, `ro`, `sv`, `tr` |
| `captions_in_recordings_enabled` | boolean | Display session transcriptions as subtitles in the room's recordings |

#### Restreaming

| Field | Type | Description |
|-------|------|-------------|
| `restream_enabled` | boolean | Allow restreaming the meeting live to platforms like YouTube, Cloudflare, Vimeo, or custom |
| `restream_type` | string | `youtube`, `vimeo`, `cloudflare`, or `custom` |
| `restream_url` | string | Custom restreamer server URL |
| `restream_key` | string | Authentication token for restreaming |
| `restream_autostart_enabled` | boolean | Restreaming starts automatically when the first participant joins |
| `restream_consent_message_enabled` | boolean | Remind the initiating participant that consent may be legally required |
| `restream_layout_mode` | string | Layout mode for the restream: `auto` or `tiled` |
| `restream_logo_enabled` | boolean | Display the logo in the restream |
| `hide_tiles_in_restream_enabled` | boolean | Exclude participant video tiles from the restream (audio/screenshare still included) |
| `participant_names_in_restream_enabled` | boolean | Include participant name badges on tiles in the restream |

#### Breakout Rooms

| Field | Type | Description |
|-------|------|-------------|
| `breakout_rooms_enabled` | boolean | Allow the host to split participants into breakout rooms. Incompatible with E2EE |
| `breakouts` | array | Pre-create breakout rooms (array of breakout room IDs and names) |
| `breakout_free_movement_enabled` | boolean | Allow all users to move independently between rooms |
| `breakout_return_to_main_room_enabled` | boolean | Allow users to return to the main room from breakouts |
| `breakout_timer_enabled` | boolean | Show a countdown timer in all breakout rooms |
| `breakout_timer_duration` | integer | How long breakout rooms run (drives the countdown and auto-close) |
| `breakout_end_on_timer` | boolean | Breakout rooms close automatically when the timer runs out |

#### Security (E2EE)

| Field | Type | Description |
|-------|------|-------------|
| `e2ee_enabled` | boolean | End-to-end encrypt usernames, chat, and media streams with keys only room participants hold |
| `e2ee_badge_enabled` | boolean | Display an E2EE status badge in the meeting interface |

#### Telephony & External Ingest

| Field | Type | Description |
|-------|------|-------------|
| `telephony_enabled` | boolean | Enable telephony |
| `telephony_phone_number` | string | PSTN/SIP number used to dial into the conference bridge |
| `telephony_pin_dtmf` | string | DTMF PIN for the bridge. `W` = 1s delay, `w` = 500ms delay |
| `whip_enabled` | boolean | Enable WHIP (WebRTC-HTTP Ingestion Protocol) to inject live streams from OBS, vMix, FFmpeg, etc. |

**Validation Rules**:
- `friendly_url`: 3–32 characters, URL-safe, unique per team
- `description`: 3–500 characters
- `default_role`: When set, `roles` array must also be provided and must contain `default_role`
- `privacy`: Must be `"public"` or `"private"`
- `session_length`: Must be between 1 and 1440; empty means unlimited
- `watermark_text`: 3–150 characters
- `expires_at`: Must be a future date in format `YYYY-MM-DD hh:mm:ss`

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
  "chat_reactions_enabled": true,
  "chat_persistence_enabled": false,
  "watermark_enabled": false,
  "watermark_text": null,
  "language": "en",
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

### DELETE /api/v1/rooms/{room}/resources
Hard delete all stored resource data for a room.

**Request Body** (optional):
| Field | Type | Description |
|-------|------|-------------|
| `delete_history` | boolean | Anonymise PII for all archived participants of this room |
| `delete_library` | boolean | Delete the room's content library |

### DELETE /api/v1/rooms
Delete all rooms that have any of the specified tags. Rooms with active sessions are skipped.

**Request Body**:
```json
{
  "tags": ["tag1", "tag2"],
  "delete_resources": false,
  "delete_history": false,
  "delete_library": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tags` | array | yes | Tag names — rooms matching any tag will be deleted |
| `delete_resources` | boolean | no | Hard delete all stored resource data for matching rooms |
| `delete_history` | boolean | no | Anonymise all participants PII for matching rooms |
| `delete_library` | boolean | no | Delete content library for matching rooms |

---

## Room Tokens

### POST /api/v1/rooms/{room}/token
Generate JWT access token for a room. `{room}` accepts the room UUID or the room friendly URL.

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
  "total_count": 3,
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

### POST /api/v1/rooms/{room}/chat
Send a chat message to an active session.

**Request Body**:
```json
{
  "message": "Hello!"
}
```

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

### POST /api/v1/rooms/{room}/questions
Create a question in the room.

**Request Body**:
```json
{
  "participant": {
    "name": "John Doe",
    "external_id": "ABCDEF123"
  },
  "question": "My question?",
  "anonymous": true,
  "breakout_id": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participant` | object | yes | Either `{ "name", "external_id" }` or `{ "id" }` (UUID of existing participant) |
| `question` | string | yes | The question text |
| `anonymous` | boolean | no | Whether to show as anonymous |
| `breakout_id` | string | no | UUID of breakout room (nullable) |

### GET /api/v1/rooms/{room}/questions/export
Export Q&A as `txt` or `json`.

### DELETE /api/v1/rooms/{room}/questions
Delete all Q&A content.

### PATCH /api/v1/rooms/{room}/questions/{question}
Update an existing question's text.

**Request Body**:
```json
{
  "participant": { "id": "uuid" },
  "question": "Updated question text"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participant` | object | yes | Either `{ "name", "external_id" }` or `{ "id" }` (UUID of existing participant) |
| `question` | string | yes | Updated question text |

### DELETE /api/v1/rooms/{room}/questions/{question}
Delete a single question. Requires a `participant` object in the request body identifying the actor.

### POST /api/v1/rooms/{room}/questions/{question}/dismiss
Mark a question as dismissed. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/reopen
Reopen a previously dismissed question. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/vote
Upvote a question on behalf of a participant. Body: `{ "participant": { ... } }`.

### DELETE /api/v1/rooms/{room}/questions/{question}/vote
Remove a participant's vote from a question. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/answers
Post an answer to a question.

**Request Body**:
```json
{
  "participant": { "id": "uuid" },
  "answer": "My answer",
  "private": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participant` | object | yes | Either `{ "name", "external_id" }` or `{ "id" }` (UUID of existing participant) |
| `answer` | string | yes | The answer text |
| `private` | boolean | no | When `true`, the answer is private to the asker |

### PATCH /api/v1/rooms/{room}/questions/{question}/answers/{answer}
Update an existing answer.

**Request Body**:
```json
{
  "participant": { "id": "uuid" },
  "answer": "Updated answer text"
}
```

### DELETE /api/v1/rooms/{room}/questions/{question}/answers/{answer}
Delete a single answer. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/live-answers/start
Start a live (in-session) answer for a question. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/live-answers/stop
Stop the currently active live answer for a question. Body: `{ "participant": { ... } }`.

### POST /api/v1/rooms/{room}/questions/{question}/live-answers/cancel
Cancel an in-progress live answer for a question. Body: `{ "participant": { ... } }`.

---

## Transcripts

### POST /api/v1/rooms/{room}/transcription/start
Start transcription for the room's live session. Required before a session summary can be generated.

### POST /api/v1/rooms/{room}/transcription/stop
Stop transcription for the room's live session.

### GET /api/v1/rooms/{room}/transcripts
Retrieve closed captions/transcripts.

**Query Parameters**: `session_id`, `limit`, `offset`, `order`

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

**Query Parameters**: `format` (`txt` or `json`)

**Request Body** (optional):
| Field | Type | Description |
|-------|------|-------------|
| `locale` | string | Export locale: `en`, `it`, `de`, `es` |
| `lang` | string | Export language: `en`, `it`, `de`, `es` |

### DELETE /api/v1/rooms/{room}/transcripts
Delete transcripts.

### DELETE /api/v1/rooms/{room}/summaries
Delete AI-generated summaries.

---

## Polls

### GET /api/v1/rooms/{room}/polls
List polls for a room. Returns paginated response with `total_count` and `data` array.

**Query Parameters**: `limit`, `offset`, `order`, `after`

### POST /api/v1/rooms/{room}/polls
Create a new poll.

**Request Body**:
```json
{
  "question": "What topic should we cover next?",
  "type": "single",
  "anonymous": true,
  "options": [
    {"id": "uuid-optional", "text": "API Design"},
    {"id": "uuid-optional", "text": "Security"},
    {"id": "uuid-optional", "text": "Performance"}
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `options` | array | yes | Poll options. Each needs `text`; pass `id` only to update an existing option |
| `options[].text` | string | yes | Option label, 1–512 characters |
| `question` | string | no | Question text, minimum 5 characters |
| `type` | string | no | See poll types below |
| `anonymous` | boolean | no | Hide who voted for what |

> **Note**: The option field is `text`, not `label`.

**Poll Types**:
| Type | Description |
|------|-------------|
| `single` | Single choice (one answer) |
| `multiple` | Multiple choices (select many) |
| `free` | Short answer (free text) |

> **Note**: The `multiple` boolean field is deprecated on requests — use `type: "multiple"` instead. Responses still report `multiple` rather than `type`.

**Response**:
```json
{
  "id": "uuid",
  "question": "What topic...",
  "status": "draft",
  "multiple": false,
  "anonymous": true,
  "options": [
    {"id": "uuid", "text": "API Design"},
    {"id": "uuid", "text": "Security"},
    {"id": "uuid", "text": "Performance"}
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/v1/rooms/{room}/polls/{poll}
Get a single poll with its options.

### PATCH /api/v1/rooms/{room}/polls/{poll}
Update a poll. Include an option `id` to update an existing option, omit it to create a new one.

### DELETE /api/v1/rooms/{room}/polls/{poll}
Delete a specific poll.

### DELETE /api/v1/rooms/{room}/polls
Delete all polls.

### GET /api/v1/rooms/{room}/polls/{poll}/results
Poll results with vote counts and voters.

**Query Parameters**: `session_id` — filter by session UUID

### GET /api/v1/rooms/{room}/polls/export
Export polls.

**Query Parameters**: `session_id`, `format` (`txt` or `json`)

**Request Body** (optional): `locale` / `lang` — `en`, `it`, `de`, `es`

### POST /api/v1/rooms/{room}/polls/import
Import polls from a CSV file.

**Request** (`multipart/form-data`):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | yes | CSV or TXT file, max 2MB |

Use `GET /api/v1/rooms/{room}/polls/template` to download the CSV template.

### GET /api/v1/rooms/{room}/polls/template
Download a CSV template for poll import.

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

**Field Constraints** (`title` and `questions` are required):
| Field | Constraint |
|-------|------------|
| `title` | Min 1, max 512 characters |
| `questions[].text` | Min 1, max 512 characters |
| `questions[].choices` | Required, at least 2 per question; each choice needs `text` |
| `time_limit_minutes` | Min 1, max 1440 (24 hours) |
| `time_limit_seconds` | Min 1, max 86400 (alternative to minutes) |
| `timing_mode` | `"quiz"` (whole quiz) or `"question"` (per question), nullable |
| `passing_score` | Percentage, 0–100. Defaults to 50 |

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

### POST /api/v1/rooms/{room}/quizzes/import
Import quizzes from a CSV file.

**Request** (`multipart/form-data`):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | binary | yes | CSV or TXT file, max 2MB |

Use `GET /api/v1/rooms/{room}/quizzes/template` to download the CSV template.

### GET /api/v1/rooms/{room}/quizzes/template
Download a CSV template for quiz import.

### GET /api/v1/rooms/{room}/quizzes/export
Export quiz results.

**Query Parameters**:
- `format` - `csv`, `txt`, `json`, or `zip`
- `locale` - Export language: `en`, `es`, `de`, `it`

---

## Recordings

### DELETE /api/v1/rooms/{room}/recordings
Delete all recordings for a room.

### POST /api/v1/rooms/{room}/recordings/start
Start recording the room's live session.

### POST /api/v1/rooms/{room}/recordings/stop
Stop the room's active recording.

### GET /api/v1/recordings
List all recordings.

**Query Parameters**: `room_id`, `session_id`, `status` (`IN_PROGRESS`, `PENDING_CONVERSION`, `READY`), plus `limit`, `offset`, `order`, `after`

### GET /api/v1/recordings/archived
List archived recordings.

**Query Parameters**: `room_id`, plus `limit`, `offset`, `order`, `after`

### GET /api/v1/recordings/{recording}
Get recording details.

### GET /api/v1/recordings/{recording}/download
Download recording file.

### GET /api/v1/recordings/{recording}/bookmarks
Get bookmarks marked during the recorded session.

### DELETE /api/v1/recordings/{recording}
Delete a specific recording.

### POST /api/v1/recordings/{recording}/archive
Archive a recording.

### POST /api/v1/recordings/{recording}/unarchive
Restore an archived recording.

---

## Sessions

### GET /api/v1/sessions
List all sessions.

### GET /api/v1/rooms/{room}/sessions
List sessions for a single room.

**Query Parameters**: `date_start`, `date_end`, `live` (boolean), plus `limit`, `offset`, `order`, `after`

### GET /api/v1/sessions/{session}
Get session details.

### GET /api/v1/sessions/{session}/participants
List participants in a session.

### GET /api/v1/sessions/{session}/statistics
Get session statistics. Accepts `metrics` — see [Statistics](#statistics).

### GET /api/v1/sessions/{session}/summary
Get AI-generated summary of a session's transcribed content. Summaries are generated by self-hosted AI models — transcript data is not transmitted to any third party.

**Response** (in progress):
```json
{
  "job_id": "uuid",
  "status": "IN_PROGRESS",
  "summary": ""
}
```

**Response** (ready):
```json
{
  "job_id": "uuid",
  "status": "READY",
  "summary": "Meeting discussed quarterly targets and agreed on..."
}
```

> **Note**: Summary generation is asynchronous. Poll approximately every minute until `status` changes to `READY`. Requires transcription to have been enabled during the session.

### GET /api/v1/sessions/{session}/transcripts
Get session transcripts.

### GET /api/v1/sessions/{session}/transcripts/export
Export session transcripts as `txt` or `json`.

**Query Parameters**: `format` (`txt` or `json`)

**Request Body** (optional):
| Field | Type | Description |
|-------|------|-------------|
| `locale` | string | Export locale: `en`, `it`, `de`, `es` |
| `lang` | string | Export language: `en`, `it`, `de`, `es` |

### POST /api/v1/sessions/{session}/end
End the specified live session.

### DELETE /api/v1/sessions/{session}/chat
Delete all chat messages for a session.

### DELETE /api/v1/sessions/{session}/questions
Delete all Q&A for a session.

### DELETE /api/v1/sessions/{session}/summaries
Delete AI-generated summaries for a session.

### DELETE /api/v1/sessions/{session}/transcripts
Delete transcripts for a session.

### DELETE /api/v1/sessions/{session}/polls
Delete all polls for a session.

### DELETE /api/v1/sessions/{session}/quizzes
Delete all quizzes for a session.

### DELETE /api/v1/sessions/{session}/recordings
Delete all recordings for a session.

### DELETE /api/v1/sessions/{session}/resources
Hard delete all stored resource data for a specific session.

**Request Body** (optional):
| Field | Type | Description |
|-------|------|-------------|
| `delete_history` | boolean | Anonymise all participants PII for this session |

---

## Participants

### GET /api/v1/participants
List all participants.

**Query Parameters**: `date_start`, `date_end`, `live` (boolean), `room_id`, `session_id`, plus `limit`, `offset`, `order`, `after`

### GET /api/v1/participants/{participant}
Get participant statistics.

### GET /api/v1/participants/{participant}/statistics
Get participant statistics. See [Statistics](#statistics).

### GET /api/v1/rooms/{room}/participants
List participants for a single room.

**Query Parameters**: `date_start`, `date_end`, `live` (boolean), `session_id`, plus `limit`, `offset`, `order`, `after`

### POST /api/v1/rooms/{room}/participants/{participant}/raise-hand
Raise a participant's hand on their behalf.

### POST /api/v1/rooms/{room}/participants/{participant}/lower-hand
Lower a participant's hand.

---

## Phone Bridge (SIP)

Connect phone participants to rooms via SIP integration.

### POST /api/v1/rooms/{room}/phone/connect
Connect the room to the phone bridge (SIP). Enables phone dial-in participants to join the meeting.

### POST /api/v1/rooms/{room}/phone/disconnect
Disconnect the room from the phone bridge (SIP).

### POST /api/v1/rooms/{room}/phone-participants/joined
Register one or more phone callers as having joined the room. Body is an **array** of call objects.

**Request Body**:
```json
[{
  "call_id": "call-abc-123",
  "name": "John Doe",
  "caller_number": "+15550100",
  "external_id": "user-123",
  "muted": false
}]
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `call_id` | string | yes | Unique call ID — used to address the caller in later requests |
| `name` | string | conditional | Caller name. Required when `caller_number` is not provided |
| `caller_number` | string | conditional | Caller phone number. Required when `name` is not provided |
| `external_id` | string | no | Your own identifier for the caller |
| `muted` | boolean | no | Join muted |

### POST /api/v1/rooms/{room}/phone-participants/left
Register phone callers as disconnected. Body is an array of call ID strings: `["call-abc-123"]`.

### POST /api/v1/rooms/{room}/phone-participants/{callId}/mute
Mute a phone participant.

### POST /api/v1/rooms/{room}/phone-participants/{callId}/unmute
Unmute a phone participant.

### POST /api/v1/rooms/{room}/phone-participants/{callId}/raise-hand
Raise a phone participant's hand.

### POST /api/v1/rooms/{room}/phone-participants/{callId}/lower-hand
Lower a phone participant's hand.

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
  "description": "Can present but not moderate",
  "permissions": {
    "broadcast": true,
    "screenshare": true,
    "general_chat": true,
    "raise_hand": true,
    "recording": false,
    "room_reactions": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Letters, numbers, dashes and underscores only. Max 30 characters, unique per team |
| `display_name` | string | yes | 3–100 characters |
| `permissions` | object | yes | Map of permission key to boolean — see `GET /api/v1/permissions` |
| `description` | string | no | Free text |

> **Note**: Permission keys must match the names returned by `GET /api/v1/permissions` exactly. Common mistakes: chat is `general_chat` / `private_chat` (not `chat`), and reactions are `room_reactions` / `chat_reactions` (not `emoji_reactions`).

### GET /api/v1/roles/{role}
Get role details, including the full `permissions` map.

### PATCH /api/v1/roles/{role}
Update a role.

### DELETE /api/v1/roles/{role}
Delete a role.

### GET /api/v1/permissions
Returns the authoritative list of permission keys usable in a role's `permissions` map — 58 keys covering broadcast, chat, Q&A, content library, moderation, whiteboard, and session control.

**Response**:
```json
["answer_qa", "access_qa", "broadcast", "general_chat", "manage_roles", "recording", "..."]
```

---

## Libraries (Content)

A **library** is a container of content that can be attached to rooms. Each library holds **files** and **folders** — folders are a separate resource nested under the library, not the library itself.

### GET /api/v1/libraries
List the team's libraries.

### POST /api/v1/libraries
Create a new library.

**Request Body** (all fields optional):
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Library name, minimum 1 character |
| `external_id` | string | Your own identifier for the library |

### GET /api/v1/libraries/{library}
Get the specified library.

### PATCH /api/v1/libraries/{library}
Update a library's `name` or `external_id`.

### DELETE /api/v1/libraries/{library}
Delete the specified library.

### GET /api/v1/libraries/{library}/hierarchy
Get the library's full folder and file tree in one call.

**Files**

### GET /api/v1/libraries/{library}/files
List files in a library.

### POST /api/v1/libraries/{library}/files
Create a library file. Returns upload links for the file content.

**Request Body** (all fields optional):
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | File name |
| `folder_id` | string | UUID of the parent folder |
| `file_size` | integer | File size in bytes |

### GET /api/v1/libraries/{library}/files/{libraryFile}
Get the specified file.

### PATCH /api/v1/libraries/{library}/files/{libraryFile}
Update the specified file.

### DELETE /api/v1/libraries/{library}/files/{libraryFile}
Delete a library file.

### GET /api/v1/libraries/{library}/files/{libraryFile}/links
Get the file's download and thumbnail links.

**Folders**

### GET /api/v1/libraries/{library}/folders
List folders in a library.

### POST /api/v1/libraries/{library}/folders
Create a library folder.

**Request Body** (all fields optional):
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Folder name, minimum 1 character |
| `parent_id` | string | UUID of the parent folder — omit for a root-level folder |

### GET /api/v1/libraries/{library}/folders/{libraryFolder}
Get the specified folder.

### PATCH /api/v1/libraries/{library}/folders/{libraryFolder}
Update the specified folder.

### DELETE /api/v1/libraries/{library}/folders/{libraryFolder}
Delete the specified folder.

**Whiteboards & webapps**

### POST /api/v1/libraries/{library}/whiteboards
Create a new whiteboard file.

**Request Body** (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `folder_id` | string | UUID of the parent library folder |
| `private` | boolean | Whether the whiteboard is private |

### POST /api/v1/libraries/{library}/webapps
Create a new webapp (embedded URL) file.

**Request Body** (all fields optional):
| Field | Type | Description |
|-------|------|-------------|
| `url` | string | URL to embed. Must be a valid URL |
| `name` | string | Name of the embedded content, minimum 1 character |
| `folder_id` | string | UUID of the parent library folder |

---

## Live Status

Rooms are "live" when they have an active session. Rooms with no live session are omitted from these responses.

### GET /api/v1/rooms/live
List all rooms that currently have live participants, with counts.

**Query Parameters**: `limit`, `offset`, `order`, `after`

**Response**:
```json
{
  "total_count": 3,
  "data": [{
    "id": "uuid",
    "external_id": "EXTID824955915",
    "start_time": "2024-01-15T12:31:19.000000Z",
    "session_duration": 11408,
    "live_participants": 27
  }]
}
```

### GET /api/v1/rooms/live/participants
Same as above, but `live_participants` is an array of participant objects (`id`, `external_id`, `name`, `role`, `join_time`) instead of a count.

**Query Parameters**: `limit`, `offset`, `order`, `after`

### GET /api/v1/rooms/{room}/live
Live participant count for a single room. Returns one object in the shape shown above (no `data` wrapper).

### GET /api/v1/rooms/{room}/live/participants
Live participant data for a single room, with `live_participants` as an array.

---

## Statistics

Statistics endpoints accept a `metrics` query parameter — a comma-separated list of field names to restrict the result set (e.g. `metrics=participation_minutes,broadcasted_minutes`). Omit it to get all metrics.

### GET /api/v1/statistics
Team-wide statistics for a period.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `date_start` | string | Period start, format `Y-m-d` |
| `date_end` | string | Period end, format `Y-m-d` |
| `metrics` | string | Comma-separated field names to return |

**Response**: Object with usage counters — `participation_minutes`, `live_sessions`, `live_participants`, `active_recorders`, `recorded_minutes`, `stored_recorded_minutes`, `transcription_minutes`, `max_concurrent_participants`, `max_concurrent_sessions`, plus the resolved `date_start` / `date_end`.

### GET /api/v1/statistics/current
Team statistics for the current billing period.

### GET /api/v1/statistics/team/current
Team-wide statistics for the current period. Accepts `metrics`.

### GET /api/v1/statistics/totals
Team statistics broken down by tag.

**Response**:
```json
[
  {"tag": "common", "rooms": 10, "participants": 55, "participation_minutes": 324}
]
```

### GET /api/v1/statistics/participants/started-sessions
Session counts per participant, keyed by `browser_id`.

**Query Parameters**: `date_start`, `date_end`, `limit`, `offset`

**Response**:
```json
{
  "total_count": 5,
  "data": [{"browser_id": "uuid", "sessions_started": 12}]
}
```

### GET /api/v1/rooms/{room}/statistics
Statistics for a single room over a period. Accepts `date_start`, `date_end`, `metrics`.

**Response**: Room metadata (`room_id`, `room_external_id`, `room_friendly_url`, `room_privacy`, …) plus per-device participation minutes, `broadcasted_minutes`, `subscribed_minutes`, `sessions`, `recorded_minutes`, `transcription_minutes`, `e2ee_minutes`, and similar counters.

### GET /api/v1/rooms/{room}/statistics/current
Room statistics for the current period. Accepts `metrics`.

### GET /api/v1/sessions/{session}/statistics
Statistics for a single session. Accepts `metrics`.

### GET /api/v1/participants/{participant}/statistics
Statistics for a single participant.

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
  "name": "Attendance tracker",
  "events": ["participant_joined", "participant_left"],
  "authorization_header": "Bearer your-shared-token"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `endpoint` | string | yes | Delivery URL. Valid URL, 3–100 characters |
| `events` | array | yes | Event names to subscribe to — see [Webhook Events](#webhook-events) |
| `name` | string | no | Label for the webhook, 3–100 characters |
| `authorization_header` | string | no | Token sent as the `Authorization` header on each delivery — use it to authenticate incoming calls |

**Response**: The webhook object with `id`, `endpoint`, `name`, `authorization_header`, `events`, `created_at`, `updated_at`.

### GET /api/v1/webhooks/{webhook}
Get webhook details.

### PATCH /api/v1/webhooks/{webhook}
Update a webhook.

### DELETE /api/v1/webhooks/{webhook}
Delete a webhook.

---

## Webhook Events

Event names are snake_case.

### GET /api/v1/events
Returns the authoritative list of event names available for `POST /api/v1/webhooks`. The list below is current as of July 2026 — query this endpoint for the latest, as it grows over time.

**Response**:
```json
["session_started", "session_ended", "participant_joined", "..."]
```

**Session & room**

| Event | Triggered When |
|-------|----------------|
| `session_started` | Meeting begins |
| `session_ended` | Meeting ends |
| `session_summary_ready` | AI session summary is available |
| `session_transcript_ready` | Session transcript is available |
| `room_locked` | Room is locked |
| `room_unlocked` | Room is unlocked |
| `room_deleted` | Room is deleted |
| `role_deleted` | Role is deleted |

**Participants**

| Event | Triggered When |
|-------|----------------|
| `participant_joined` | User joins room |
| `participant_left` | User leaves room |
| `participant_waiting_joined` | User enters the waiting room/lobby |
| `participant_waiting_left` | User leaves the waiting room/lobby |
| `participant_invited` | User is invited to the room |
| `participant_hand_raised` | User raises hand |
| `participant_hand_lowered` | User lowers hand |
| `participant_avatar_uploaded` | User uploads an avatar |
| `participant_avatar_deleted` | User's avatar is deleted |

**Phone participants**

| Event | Triggered When |
|-------|----------------|
| `phone_participant_muted` | Phone participant is muted |
| `phone_participant_unmuted` | Phone participant is unmuted |
| `phone_participant_asked_to_unmute` | Phone participant is asked to unmute |

**Recordings**

| Event | Triggered When |
|-------|----------------|
| `recording_started` | Recording begins |
| `recording_stopped` | Recording ends |
| `recording_ready` | Recording processed and available |
| `recording_deleted` | Recording is deleted |

**Q&A**

| Event | Triggered When |
|-------|----------------|
| `question_asked` | Question posted |
| `question_answered` | Question answered |
| `question_updated` | Question edited |
| `question_dismissed` | Question dismissed |
| `question_reopened` | Question reopened |
| `question_deleted` | Question deleted |
| `answer_updated` | Answer edited |
| `answer_deleted` | Answer deleted |

**Content library**

| Event | Triggered When |
|-------|----------------|
| `file_added_to_library` | File uploaded to a library |
| `file_renamed` | Library file renamed |
| `file_deleted_from_library` | Library file deleted |
| `file_processing_failed` | Uploaded file failed processing |
| `folder_added_to_library` | Folder created in a library |
| `folder_renamed` | Library folder renamed |
| `folder_deleted_from_library` | Library folder deleted |

**Authenticating deliveries**: Set `authorization_header` when creating the webhook. Digital Samba sends that value as the `Authorization` header on every delivery — compare it against your stored value before trusting the payload.
