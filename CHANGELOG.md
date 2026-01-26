# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-01-26

### Added

- **Quizzes API** (8 endpoints): Full CRUD for in-meeting quizzes with questions, choices, results, and export (fixes #6)
- **Restreamers API** (2 endpoints): Start/stop RTMP streaming to YouTube, Vimeo, Cloudflare, or custom servers (fixes #6)
- `DELETE /sessions/{session}/quizzes` endpoint in Sessions section
- `startRestreaming()` and `stopRestreaming()` SDK methods (fixes #7)

### Changed

- SDK version updated to 0.0.53

## [1.1.1] - 2026-01-05

### Added

- Phone Bridge (SIP) endpoints in api-reference.md: `POST /rooms/{room}/phone/connect` and `POST /rooms/{room}/phone/disconnect` (fixes #5)

### Changed

- GET polls endpoint now returns paginated response with `total_count` and `data` array

### Removed

- `GET /rooms/{room}/quizzes/export` endpoint (removed from API)

## [1.1.0] - 2025-12-18

### Changed

- **BREAKING**: Moved skill files to repo root for proper submodule support
  - Submodule install now preferred: `git submodule add <url> .claude/skills/digital-samba`
  - Manual copy path changed (see README)
- Updated README with new installation instructions
- Updated release workflow for new structure

### Added

- Version check instructions in SKILL.md - ask Claude "Is my Digital Samba skill up to date?"

## [1.0.8] - 2025-12-17

### Added

- `default_role` constraint documentation - must be included in `roles` array (fixes #3)

## [1.0.7] - 2025-12-17

### Added

- `recording_bookmarks_enabled` room setting in api-reference.md
- `friendly_url` 32-character limit constraint documentation (fixes #1)
- Poll `type` field with `single`, `multiple`, `free` options in api-reference.md
- Poll option `id` field in api-reference.md

### Changed

- Poll `multiple` boolean field marked as deprecated (use `type: "multiple"` instead)

## [1.0.6] - 2025-12-09

### Changed

- Updated SDK reference with official documentation for: Custom Tiles, Tile Actions, UI Callbacks, Frame Event Listeners, Runtime Branding, Whiteboard Image Injection

## [1.0.5] - 2025-12-08

### Added

- `start_session` role permission documentation in jwt-tokens.md

## [1.0.4] - 2025-12-08

### Added

- Playwright E2E testing pattern in patterns.md

## [1.0.3] - 2025-12-07

### Added

- Production bundling recommendation for SDK in sdk-reference.md and patterns.md

## [1.0.2] - 2025-12-07

### Added

- VERSION file to skill

## [1.0.1] - 2025-12-07

### Added

- Iframe sizing guidance in patterns.md - documents that the SDK iframe does not auto-size and provides CSS/Tailwind solutions for common layout issues

## [1.0.0] - 2025-12-06

### Added

- Initial release of Digital Samba Claude Code skill
- SKILL.md with quick start guide and overview
- api-reference.md with complete REST API documentation (97 endpoints)
- sdk-reference.md with SDK methods, events, and properties
- patterns.md with 6 integration patterns
- jwt-tokens.md with token authentication guide
- Standalone code examples for Node.js, React, and Python
- GitHub Action for automated release zip generation
