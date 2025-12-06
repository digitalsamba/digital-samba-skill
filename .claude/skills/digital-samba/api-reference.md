# Digital Samba REST API Reference

> This file will contain the complete API endpoint documentation.
> Source: https://developer.digitalsamba.com/rest-api/

## TODO: Populate from OpenAPI spec

### Endpoint Categories

1. **Default Room Settings** (2 endpoints)
   - GET /api/v1 - Get default room settings
   - PATCH /api/v1 - Update default room settings

2. **Rooms** (~22 endpoints)
   - CRUD operations
   - Chat, Q&A, transcripts
   - Token generation

3. **Sessions** (~14 endpoints)
   - Session management
   - Statistics, transcripts

4. **Participants** (~7 endpoints)
   - Participant data
   - Raise/lower hand

5. **Recordings** (~10 endpoints)
   - Start/stop recording
   - Download, archive

6. **Roles & Permissions** (6 endpoints)
   - Custom role management

7. **Libraries** (~18 endpoints)
   - Content library management

8. **Polls** (6 endpoints)
   - Poll creation and results

9. **Live** (4 endpoints)
   - Live participant counts

10. **Statistics** (~9 endpoints)
    - Usage analytics

11. **Transcripts** (2 endpoints)
    - Start/stop transcription

12. **Webhooks** (6 endpoints)
    - Webhook configuration

## Authentication

```
Authorization: Bearer {DEVELOPER_KEY}
```

Or HTTP Basic:
- Username: team_id
- Password: developer_key

## Base URL

```
https://api.digitalsamba.com
```

## Pagination

- `limit` - max 100, default 100
- `offset` - default 0
- `order` - asc/desc, default desc
- `after` - UUID for cursor pagination
