# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.9] - 2026-05-21

### Added

- 12 new Q&A endpoints for fine-grained question and answer management (fixes #17):
  - `PATCH /rooms/{room}/questions/{question}` — update question text
  - `DELETE /rooms/{room}/questions/{question}` — delete a single question
  - `POST /rooms/{room}/questions/{question}/dismiss` — dismiss a question
  - `POST /rooms/{room}/questions/{question}/reopen` — reopen a dismissed question
  - `POST` / `DELETE /rooms/{room}/questions/{question}/vote` — add/remove a participant's upvote
  - `POST /rooms/{room}/questions/{question}/answers` — post an answer (with optional `private` flag)
  - `PATCH` / `DELETE /rooms/{room}/questions/{question}/answers/{answer}` — update/delete an answer
  - `POST /rooms/{room}/questions/{question}/live-answers/{start,stop,cancel}` — manage live in-session answers
- `connection_quality_indicator_enabled` room setting — show participants their local connection quality indicator
- `pin_panels_enabled` room setting — allow roles with permission to force-pin tiles for everyone
- `mediaConnectionFailed` SDK event — fired when media connection to the SFU fails (fixes #18)
- `joinScreenEnabled` roomSettings option — show/hide the pre-join name/device screen
- SDK reference version bumped to 0.0.55

## [1.1.8] - 2026-03-21

### Added

- `GET /sessions/{session}/summary` endpoint — retrieve AI-generated session summary (async, poll until READY) (fixes #16)
- `POST /sessions/{session}/end` endpoint — end a live session
- `GET /sessions/{session}/transcripts/export` endpoint — export session transcripts with locale support
- `DELETE /sessions/{session}/chat` endpoint — delete session chat messages
- `DELETE /sessions/{session}/questions` endpoint — delete session Q&A
- `DELETE /sessions/{session}/summaries` endpoint — delete session summaries
- `DELETE /sessions/{session}/transcripts` endpoint — delete session transcripts
- `DELETE /sessions/{session}/polls` endpoint — delete session polls
- `DELETE /sessions/{session}/recordings` endpoint — delete session recordings
- `DELETE /sessions/{session}/resources` endpoint — delete all session resources with optional PII anonymisation
- `DELETE /rooms/tags` endpoint — bulk delete rooms by tag
- `POST /rooms/{room}/phone-participants/{callId}/mute` endpoint — mute phone participant
- `POST /rooms/{room}/phone-participants/{callId}/unmute` endpoint — unmute phone participant
- `chat_reactions_extended_enabled` room setting — expanded emoji set for chat reactions
- `virtual_backgrounds_v2_enabled` room setting — new virtual background engine
- `locale`/`lang` parameters on transcript export endpoints — export in en, it, de, es

## [1.1.7] - 2026-03-07

### Added

- `POST /rooms/{room}/chat` endpoint — send chat messages to active sessions (fixes #13)
- `POST /rooms/{room}/questions` endpoint — create Q&A questions via API
- `POST /rooms/{room}/quizzes/import` endpoint — import quizzes from CSV
- `GET /rooms/{room}/quizzes/template` endpoint — download quiz CSV template
- `chat_reactions_enabled` room setting — emoji reactions on chat messages
- `chat_persistence_enabled` room setting — retain chat across sessions
- `watermark_enabled` and `watermark_text` room settings — screen watermark to discourage unauthorized recording
- `default_language` room setting with 2 new languages: `ca-ES` (Catalan), `nb-NO` (Norwegian Bokmål)
- `timing_mode` and `time_limit_seconds` quiz fields — per-question or whole-quiz timing

## [1.1.6] - 2026-03-07

### Added

- **Method Quick Reference** table in sdk-reference.md — flat, scannable index of all 60+ SDK methods with exact names and descriptions
  - Fixes issue where AI agents could find background context but not specific method names, causing incorrect method calls

## [1.1.5] - 2026-02-25

### Fixed

- `createWhiteboard` signature — correct parameters are `{ personal, folderId }` not `{ name }` (fixes #12)
- `TileActionScope` — replaced non-existent `'custom'` with correct `'all'` value
- Removed `connectionFailure` event (not present in SDK source)

### Added

- 4 missing events: `localTileMaximized`, `localTileMinimized`, `userMaximized`, `mediaPermissionsFailed`
- 4 missing permission types: `inviteParticipant`, `seeParticipantsPanel`, `controlRoomEntry`, `editWhiteboard`
- 4 missing feature flags: `qa`, `contentLibrary`, `whiteboard`, `captions`
- 15 `roomSettings` options documenting full `InitialRoomSettings` interface

## [1.1.4] - 2026-02-18

### Added

- `invite_participants_advanced_enabled` room setting — controls advanced invite UI with copyable links (fixes #9)
- `applySpokenLanguageToAll` option for `configureCaptions()` — moderators can apply spoken language to all participants
- `publicRoomUrl` room setting in SDK InitOptions — override public room URL for invitation links
- `roomSettings` table in SDK InitOptions documentation
- `audioOnly` and `showTopbar` fields to `RoomState` interface (backfill from SDK 0.0.50/0.0.52)

### Changed

- SDK version updated to 0.0.54 (fixes #10)

## [1.1.3] - 2026-02-10

### Added

- `auto_pip_enabled` room setting — automatic Picture-in-Picture when participants switch tabs/apps (fixes #8)
- `room_reactions_enabled` room setting — emoji reactions in rooms
- `emoji_reactions` role permission

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

- Version check instructions in SKILL.md - ask your AI agent "Is my Digital Samba skill up to date?"

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

- Initial release of Digital Samba AI coding agent skill
- SKILL.md with quick start guide and overview
- api-reference.md with complete REST API documentation (97 endpoints)
- sdk-reference.md with SDK methods, events, and properties
- patterns.md with 6 integration patterns
- jwt-tokens.md with token authentication guide
- Standalone code examples for Node.js, React, and Python
- GitHub Action for automated release zip generation
