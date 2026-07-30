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

Set `DS_WEBHOOK_TOKEN` to the same value you pass as `authorization_header` when
registering the webhook — the handler rejects deliveries that don't match.

```bash
DS_WEBHOOK_TOKEN="your-token" node webhook-handler.js
```

## Dependencies

These examples use only Node.js built-in modules (`https`, `http`, `crypto`). No npm install required.
