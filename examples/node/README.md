# Node.js Examples

## Prerequisites

```bash
export DS_DEVELOPER_KEY="your-developer-key"
export DS_TEAM_ID="your-team-id"  # Optional, for JWT generation
```

## Examples

### basic-room.js

Complete room lifecycle demo - create, token, list, delete.

```bash
node basic-room.js
```

### webhook-handler.js

Simple HTTP server for receiving Digital Samba webhooks.

```bash
WEBHOOK_SECRET="your-secret" node webhook-handler.js
```

## Dependencies

These examples use only Node.js built-in modules (`https`, `http`, `crypto`). No npm install required.
