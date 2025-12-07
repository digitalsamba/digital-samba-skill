<div align="center">

# 🎥 Digital Samba Skill for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-blueviolet)](https://claude.ai/code)
[![Version](https://img.shields.io/github/v/release/digitalsamba/digital-samba-skill)](https://github.com/digitalsamba/digital-samba-skill/releases)

AI-assisted development for embedding white-label video conferencing into your platform.

[Quick Start](#-quick-start) • [Installation](#-installation) • [Examples](#-code-examples) • [Resources](#-resources)

</div>

---

## ✨ What This Skill Does

Building a telehealth app? Online learning platform? Virtual consultation service? This skill helps Claude assist you with integrating Digital Samba's video conferencing into your product.

- 🏠 **Room Management** - Create and configure video rooms via API
- 🔐 **User Authentication** - Generate JWT tokens to securely connect your users
- 📺 **Iframe Embedding** - Integrate video calls seamlessly into your UI
- 🎛️ **SDK Control** - Programmatically control the video experience
- 🔔 **Webhooks** - React to room events in your backend
- 🎬 **Recordings** - Capture and manage meeting recordings

---

## 🚀 Quick Start

```bash
# Clone and copy to your project
git clone https://github.com/digitalsamba/digital-samba-skill.git
cp -r digital-samba-skill/.claude/skills/digital-samba your-project/.claude/skills/
```

Then ask Claude:

> "Help me embed video conferencing into my React app using Digital Samba"

---

## 📦 Installation

### Option 1: Copy Skill Folder (Recommended)

```bash
# Clone the repo
git clone https://github.com/digitalsamba/digital-samba-skill.git

# Copy skill to your project
cp -r digital-samba-skill/.claude/skills/digital-samba your-project/.claude/skills/
```

### Option 2: Git Submodule

```bash
cd your-project
git submodule add https://github.com/digitalsamba/digital-samba-skill.git .claude/skills/digital-samba-skill
```

### Option 3: Download ZIP (Claude Desktop/Web)

1. Download `digital-samba-skill.zip` from [Releases](https://github.com/digitalsamba/digital-samba-skill/releases)
2. Extract to `.claude/skills/digital-samba/` in your project

---

## 💬 Usage

Once installed, ask Claude to help with your integration:

```
"Create an API endpoint that provisions video rooms for my users"
"How do I pass my user's identity to Digital Samba via JWT?"
"Embed a video call component in my Next.js app"
"Set up webhooks to track when meetings start and end"
```

**Trigger phrases:**
`Digital Samba` · `video conferencing API` · `embed video calls` · `meeting room integration` · `participant tokens`

---

## 📚 Skill Contents

| File | Description |
|------|-------------|
| `SKILL.md` | Quick start guide and overview |
| `api-reference.md` | Complete REST API reference (97 endpoints) |
| `sdk-reference.md` | SDK methods, events, and properties |
| `patterns.md` | Integration patterns + iframe sizing guide |
| `jwt-tokens.md` | Token authentication and user identity |

---

## 💻 Code Examples

The `examples/` directory contains ready-to-use code for common integration scenarios:

### Node.js

| File | Description |
|------|-------------|
| `basic-room.js` | Room provisioning (create, token, list, delete) |
| `webhook-handler.js` | Express server for processing room events |

### React

| File | Description |
|------|-------------|
| `useDigitalSamba.ts` | Custom hook with connection state management |
| `VideoCall.tsx` | Drop-in video call component |

### Python

| File | Description |
|------|-------------|
| `basic_room.py` | Room management with requests + PyJWT |
| `webhook_handler.py` | FastAPI webhook endpoint |

---

## 📋 Requirements

- **Digital Samba Account** - Get your Developer Key from [dashboard.digitalsamba.com](https://dashboard.digitalsamba.com)
- **Claude Code** or **Claude Desktop/Web** with custom skills enabled

---

## 🔗 Resources

| Resource | Link |
|----------|------|
| REST API Docs | [developer.digitalsamba.com/rest-api](https://developer.digitalsamba.com/rest-api/) |
| SDK on NPM | [@digitalsamba/embedded-sdk](https://www.npmjs.com/package/@digitalsamba/embedded-sdk) |
| Dashboard | [dashboard.digitalsamba.com](https://dashboard.digitalsamba.com) |
| Support | [support.digitalsamba.com](https://support.digitalsamba.com) |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

<div align="center">

Built with [Claude Code](https://claude.ai/code)

</div>
