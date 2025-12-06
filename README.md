# Digital Samba Skill for Claude Code

A Claude Code skill for building video conferencing integrations using Digital Samba's REST API and Embedded SDK.

## What This Skill Does

When installed, this skill helps Claude assist you with:

- Creating and managing video meeting rooms
- Generating JWT tokens for participant authentication
- Embedding video calls in web applications
- Handling SDK events and controls
- Setting up webhooks for real-time notifications
- Managing recordings, chat, Q&A, and more

## Installation

### Option 1: Claude Code (CLI)

Copy the skill folder to your project:

```bash
# Clone the repo
git clone https://github.com/digitalsamba/digital-samba-skill.git

# Copy skill to your project
cp -r digital-samba-skill/.claude/skills/digital-samba your-project/.claude/skills/
```

Or add as a git submodule:

```bash
cd your-project
git submodule add https://github.com/digitalsamba/digital-samba-skill.git .claude/skills/digital-samba-skill
```

### Option 2: Claude Desktop/Web (Upload ZIP)

1. Download the latest `digital-samba.zip` from [Releases](https://github.com/digitalsamba/digital-samba-skill/releases)
2. Go to Claude Settings > Skills
3. Click "Add custom skill" and upload the ZIP file

### Option 3: Manual Copy

Copy these files to `.claude/skills/digital-samba/` in your project:

- `SKILL.md` - Main skill file (required)
- `api-reference.md` - REST API endpoints
- `sdk-reference.md` - SDK methods and events
- `patterns.md` - Integration patterns
- `jwt-tokens.md` - Authentication guide

## Usage

Once installed, just ask Claude about Digital Samba:

```
"Create a Digital Samba meeting room"
"How do I embed a video call in React?"
"Generate a participant token for my user"
"Set up a webhook for recording notifications"
```

The skill triggers on phrases like:
- "Digital Samba"
- "video conferencing API"
- "embed video calls"
- "meeting room integration"
- "participant tokens"

## Skill Contents

| File | Lines | Description |
|------|-------|-------------|
| SKILL.md | 111 | Quick start guide, overview |
| api-reference.md | 476 | Complete REST API reference |
| sdk-reference.md | 608 | SDK methods, events, properties |
| patterns.md | 172 | 6 integration patterns |
| jwt-tokens.md | 140 | Token authentication guide |

## Code Examples

The `examples/` directory contains standalone code samples:

### Node.js (`examples/node/`)
- `basic-room.js` - Room lifecycle (create, token, list, delete)
- `webhook-handler.js` - HTTP server for webhook events

### React (`examples/react/`)
- `useDigitalSamba.ts` - Custom hook with state management
- `VideoCall.tsx` - Ready-to-use component

### Python (`examples/python/`)
- `basic_room.py` - Room management with requests/pyjwt
- `webhook_handler.py` - FastAPI webhook server

## Requirements

- **Digital Samba Account** - Get your Developer Key from [dashboard.digitalsamba.com](https://dashboard.digitalsamba.com)
- **Claude Code** or **Claude Desktop/Web** with custom skills enabled

## Resources

- [Digital Samba REST API Docs](https://developer.digitalsamba.com/rest-api/)
- [Digital Samba SDK on NPM](https://www.npmjs.com/package/@digitalsamba/embedded-sdk)
- [Digital Samba Dashboard](https://dashboard.digitalsamba.com)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome! Please open an issue or submit a PR.

---

Built with Claude Code
