# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/liba2k/fellow-mcp/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/liba2k/fellow-mcp/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/liba2k/fellow-mcp/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/liba2k/fellow-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/liba2k/fellow-mcp/releases/tag/v1.0.0
