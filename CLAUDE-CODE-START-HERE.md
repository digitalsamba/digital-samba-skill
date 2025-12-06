# CLAUDE-CODE-START-HERE.md

## Project Context

This is the Digital Samba Claude Code skill - documentation to help developers integrate video conferencing using Digital Samba's API and SDK.

**Repo**: https://github.com/digitalsamba/digital-samba-skill (private)
**Planning docs location**: `~/Documents/Obsidian Vault/01-Projects/Digital-Samba-Skill/`

Read these for full context:
- `00-Command/ROADMAP.md` - Task list and phases
- `00-Command/MAINTENANCE-STRATEGY.md` - How updates will work
- `00-Command/GIT-STRATEGY.md` - Repo structure
- `claude.md` - Project overview

## Current State

Draft skill files exist in Obsidian at:
```
01-Projects/Digital-Samba-Skill/20-Implementation/03-Implementation/skill/
```

These need to be:
1. Copied into this repo's `.claude/skills/digital-samba/`
2. Completed with full API/SDK documentation

## Immediate Tasks (Phase 3: Implementation)

### 1. Complete Reference Documentation

Fetch and incorporate:
- **OpenAPI spec**: https://developer.digitalsamba.com/rest-api/openapi.yaml
- **SDK Methods**: https://docs.digitalsamba.com/reference/sdk/methods
- **SDK Events**: https://docs.digitalsamba.com/reference/sdk/events
- **SDK Properties**: https://docs.digitalsamba.com/reference/sdk/properties

### 2. Files to Complete

| File | Status | Action |
|------|--------|--------|
| `SKILL.md` | Draft exists | Review, refine triggers |
| `api-reference.md` | Stub | Populate from OpenAPI |
| `sdk-reference.md` | Stub | Populate from SDK docs |
| `patterns.md` | 6 patterns done | Review, add more if needed |
| `jwt-tokens.md` | Complete | Review for accuracy |

### 3. Validation

After completing docs:
```
Test these prompts work well:
- "Create a Digital Samba meeting room"
- "Embed a video call in my React app"
- "Set up recording for my meetings"
- "Generate a participant token"
```

## API Documentation Sources

| Resource | URL |
|----------|-----|
| REST API (interactive) | https://developer.digitalsamba.com/rest-api/ |
| OpenAPI YAML | https://developer.digitalsamba.com/rest-api/openapi.yaml |
| Postman Collection | https://developer.digitalsamba.com/rest-api/collection.json |
| SDK NPM | https://www.npmjs.com/package/@digitalsamba/embedded-sdk |
| SDK GitHub | https://github.com/digitalsamba/embedded-sdk |
| SDK Docs | https://docs.digitalsamba.com/reference/sdk |

## Repo Structure Target

```
digital-samba-skill/
├── .claude/
│   └── skills/
│       └── digital-samba/
│           ├── SKILL.md
│           ├── api-reference.md
│           ├── sdk-reference.md
│           ├── patterns.md
│           └── jwt-tokens.md
├── examples/
│   ├── node/
│   ├── python/
│   └── react/
├── scripts/
│   ├── check-api-diff.py      # For maintenance automation
│   └── update-skill.sh
├── .github/
│   └── workflows/
│       └── check-api-updates.yml
├── README.md
├── LICENSE
├── CHANGELOG.md
├── .api-version
├── .sdk-version
└── CLAUDE-CODE-START-HERE.md  # This file
```

## Session End Checklist

After each Claude Code session:
- [ ] Commit work with descriptive message
- [ ] Push to origin
- [ ] Update Obsidian project (see below)

## Obsidian Project Tracking

**Project location**: `/Users/conalmullan/Documents/Obsidian Vault/01-Projects/Digital-Samba-Skill/`

### After Each Session, Update:

1. **ROADMAP.md** (`00-Command/ROADMAP.md`)
   - Mark completed tasks with `[x]`
   - Add session to Session Log table
   - Note any new blockers/decisions

2. **Session Summary** (optional but recommended)
   - Template: `00-Command/01-Sessions/SESSION-TEMPLATE.md`
   - Save as: `00-Command/01-Sessions/Planning-Sessions/Session-YYYY-MM-DD-NN.md`
   - Or for implementation: `00-Command/01-Sessions/Implementation-Sessions/`

3. **PROJECT-COMMAND.md** (`00-Command/PROJECT-COMMAND.md`)
   - Update progress bars
   - Update "Current Focus" if changed

### Example Session Log Entry
```markdown
| 2 | 2025-12-06 | Implementation | Complete API reference | api-reference.md populated |
```

### Quick Update Commands
```bash
# View current roadmap
cat ~/Documents/Obsidian\ Vault/01-Projects/Digital-Samba-Skill/00-Command/ROADMAP.md

# Edit roadmap (or use any editor)
code ~/Documents/Obsidian\ Vault/01-Projects/Digital-Samba-Skill/00-Command/ROADMAP.md
```

## Questions to Resolve

- [ ] License choice: MIT or Apache 2.0?
- [ ] Repo visibility: When to go public?
- [ ] `allowed-tools` in SKILL.md: Restrict to read-only?
