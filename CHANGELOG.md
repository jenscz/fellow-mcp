# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2026-06-09

### Fixed
- `get_meeting_participants` returned `- [object Object]` instead of email addresses — Fellow's `event_attendees` are objects (`{ email }`), not bare strings as the code assumed
- `sync_meetings` silently stored **zero** participants — the `typeof email === "string"` guard dropped every attendee object, leaving the `participants` cache empty and breaking `get_meetings_by_participants` and participant counts

### Changed
- **Replaced `better-sqlite3` (native module) with Node's built-in `node:sqlite`** — removes the native-compilation / prebuilt-binary dependency, so the server no longer breaks when Node bumps its ABI (this was the Node 26 build failure: `better-sqlite3@11` could not compile against Node 26's V8)
- **Minimum Node version raised to 22.13.0** — the first release where `node:sqlite` works without the `--experimental-sqlite` flag (also backported from Node 23.4.0)
- Participant emails are normalized (trim + lowercase) on both store and lookup, so `get_meetings_by_participants` matches case-insensitively and de-duplicates correctly

### Removed
- `better-sqlite3` and `@types/better-sqlite3` dependencies (replaced by built-in `node:sqlite`)

## [2.0.1] - 2026-03-08

### Added
- DB-first caching for recordings — `get_meeting_transcript`, `get_meeting_topics`, and `get_transcript_slice` now check local SQLite cache before calling Fellow API
- `ai_notes_json` column in recordings table with automatic schema migration
- `searchRecordingByTitle()` database method
- `resolveRecording()` helper: DB lookup → API fallback → cache result

### Fixed
- `npx fellow-mcp` changed to `npx -y fellow-mcp` in docs to prevent interactive prompt blocking MCP startup
- Corrupted JSON in database no longer crashes tool calls — falls back to API
- Foreign key constraint error when caching recordings before notes are synced — cache is now best-effort

## [2.0.0] - 2026-03-05

First release of the community fork ([jenscz/fellow-mcp](https://github.com/jenscz/fellow-mcp)).

### Added
- `get_meeting_topics` tool — exposes Fellow's AI-detected topics, decisions, and action items with timestamps from `ai_notes`
- `get_transcript_slice` tool — time-filtered transcript retrieval to avoid context limit issues with long meetings
- Direct Fellow meeting links (`fellow_url`) in search results
- `ai_notes` support in `FellowClient.listRecordings()` via `include_ai_notes` parameter

### Fixed
- Transcript timestamps showing `NaN:NaN` — Fellow API returns `start`/`end` fields, not `start_time`/`end_time` as upstream assumed
- `search_meetings` now shows actual meeting times instead of "N/A"
- `get_meeting_topics` and `get_transcript_slice` now paginate through all recordings when searching by `recording_id` (previously only checked first 50)
- `get_meeting_topics` and `get_transcript_slice` now require `recording_id` or `meeting_title` instead of silently returning the first recording
- API error messages are sanitized to prevent leaking API keys in MCP responses

### Changed
- All API calls now go through `FellowClient` (removed raw `fetch` calls from tool handlers)
- Removed unused `findRecording` helper
- Repository ownership transferred to jenscz fork
- Version jump to 2.0.0 to separate from upstream versioning

---

## Prior releases (upstream: [liba2k/fellow-mcp](https://github.com/liba2k/fellow-mcp))

## [1.0.4] - 2026-01-28

### Fixed
- `search_meetings` now shows actual meeting times instead of "N/A" by enriching recordings with event_start from associated notes
- Automatically fetches note data from Fellow API if not in local database to get accurate meeting times
- Fixed `getNote` API method to properly parse response structure

### Changed
- Removed confusing `created_at` field from `search_meetings` results (was showing when meeting was logged, not when it occurred)
- `search_meetings` now displays actual meeting times in local timezone for better user experience

## [1.0.3] - 2026-01-27

### Added
- `event_guid` field to all tool responses - unique meeting identifier from Fellow
- `fellow_url` field with pre-constructed links (e.g., `https://{subdomain}.fellow.app/meetings/{event_guid}`)
- `event_start_local` field with human-readable local timestamps (e.g., "Jan 26, 2026, 2:30 PM")
- Retry logic with exponential backoff (1s, 2s, 4s delays) for transient 500 errors
- Graceful error handling in sync operations - continues even if individual pages fail
- `page_size` parameter to `sync_meetings` tool (1-50, default 50) for debugging sync failures

### Fixed
- Single-day date searches now work correctly - automatically adjusts end date since Fellow API uses exclusive ranges
- Date range queries where `created_at_start` equals `created_at_end` now return results for that full day

### Changed
- Updated tool descriptions to clarify inclusive/exclusive date range behavior
- Test scripts now use environment variables instead of hardcoded credentials
- Improved README with development setup instructions

## [1.0.2] - 2024-01-XX

### Fixed
- Include both notes and transcript in `get_meeting_summary` response

## [1.0.1] - 2024-01-XX

### Changed
- Simplified README documentation
- Fixed config examples to use `environment` instead of `env`

### Removed
- Removed run.sh script

## [1.0.0] - 2024-01-XX

### Added
- Initial release
- MCP server for Fellow.ai API
- Local SQLite database for caching meeting data
- 10 tools for accessing meetings, transcripts, summaries, action items, and participants
- Automatic incremental sync
- Full-text search across cached notes
- Find meetings by participant

[Unreleased]: https://github.com/jenscz/fellow-mcp/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/jenscz/fellow-mcp/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/jenscz/fellow-mcp/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/jenscz/fellow-mcp/releases/tag/v2.0.0
[1.0.4]: https://github.com/liba2k/fellow-mcp/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/liba2k/fellow-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/liba2k/fellow-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/liba2k/fellow-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/liba2k/fellow-mcp/releases/tag/v1.0.0
