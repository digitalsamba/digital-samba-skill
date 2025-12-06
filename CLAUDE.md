# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**What**: Claude Code skill for Digital Samba video conferencing integration
**Purpose**: Help developers build video conferencing features using Digital Samba's REST API and Embedded SDK
**Repo**: https://github.com/digitalsamba/digital-samba-skill (private)

## Repository Structure

```
digital-samba-skill/
├── .claude/
│   ├── commands/              # Session management commands
│   │   ├── session-start.md
│   │   └── session-end.md
│   └── skills/
│       └── digital-samba/
│           ├── SKILL.md           # Main skill (quick start, overview)
│           ├── api-reference.md   # REST API endpoints
│           ├── sdk-reference.md   # SDK methods/events
│           ├── patterns.md        # Integration patterns
│           └── jwt-tokens.md      # Token authentication
├── examples/                  # Standalone code examples
│   ├── node/
│   ├── python/
│   └── react/
├── scripts/                   # Maintenance automation
│   ├── check-api-diff.py
│   └── update-skill.sh
├── .github/workflows/         # CI for API change detection
├── CLAUDE.md                  # This file
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## Current State

**Phase**: Implementation (Phase 3 of 7)
**Completed**: patterns.md, jwt-tokens.md, draft SKILL.md
**Needs work**: api-reference.md (populate from OpenAPI), sdk-reference.md (populate from SDK docs)

---

## Project Management

### Obsidian Integration

Planning docs are maintained in Obsidian. Claude Code reads/writes these for project sync.

**Location**: `/Users/conalmullan/Documents/Obsidian Vault/01-Projects/Digital-Samba-Skill/00-Command/`

| File | Purpose |
|------|---------|
| `ROADMAP.md` | Task list with checkboxes, session log, decisions |
| `PROJECT-COMMAND.md` | Progress percentages, current focus |

### Session Commands

| Command | When | What it does |
|---------|------|--------------|
| `/session-start` | Start of session | Read Obsidian docs, check git, report priorities |
| `/session-end` | End of session | Commit work, update Obsidian, report accomplishments |

### Session Workflow

**Start**:
1. Check Obsidian ROADMAP.md for current tasks and session log
2. Check PROJECT-COMMAND.md for progress and focus
3. Check git status for uncommitted work
4. Report: current phase, top 3 priorities, blockers, recommended focus

**End**:
1. Commit and push all work
2. Update Obsidian ROADMAP.md (mark tasks `[x]`, add session log entry)
3. Update Obsidian PROJECT-COMMAND.md (progress bars, current focus)
4. Report accomplishments

---

## External Documentation Sources

### API & SDK References (fetch as needed)

| Resource | URL |
|----------|-----|
| OpenAPI YAML | https://developer.digitalsamba.com/rest-api/openapi.yaml |
| REST API (interactive) | https://developer.digitalsamba.com/rest-api/ |
| Postman Collection | https://developer.digitalsamba.com/rest-api/collection.json |
| SDK Methods | https://docs.digitalsamba.com/reference/sdk/methods |
| SDK Events | https://docs.digitalsamba.com/reference/sdk/events |
| SDK Properties | https://docs.digitalsamba.com/reference/sdk/properties |
| SDK NPM | https://www.npmjs.com/package/@digitalsamba/embedded-sdk |
| SDK GitHub | https://github.com/digitalsamba/embedded-sdk |

---

## Open Questions

- [ ] License choice: MIT or Apache 2.0?
- [ ] Repo visibility: When to make public?
- [ ] `allowed-tools` in SKILL.md: Restrict to read-only tools?

---

## Validation Prompts

Test skill with these prompts after completing docs:
- "Create a Digital Samba meeting room"
- "Embed a video call in my React app"
- "Set up recording for my meetings"
- "Generate a participant token"
