# Fellow MCP Server

> [!IMPORTANT]
> **Unofficial — a community project.** This MCP server wraps the Fellow.ai API so you can reach *your own* meeting data from *your own* tools. It is not built by, affiliated with, or endorsed by Fellow, Inc. "Fellow" is a registered trademark of Fellow, Inc., used here only to name the API this server connects to.

A local MCP (Model Context Protocol) server that wraps the Fellow.ai API, providing tools to access meeting data, transcripts, summaries, action items, and participants.

Fork of [liba2k/unofficial-fellow-mcp](https://github.com/liba2k/unofficial-fellow-mcp) with additional tools and fixes.

**Features:**
- Local SQLite database for caching meeting data
- Automatic incremental sync to keep action items fresh
- Full-text search across cached notes
- Find meetings by participant
- AI-detected meeting topics with timestamps
- Time-filtered transcript slicing

## Installation

This fork is **not published to npm** — install it from source. The final `npm install -g .` puts the `fellow-mcp` command on your `PATH`:

```bash
git clone https://github.com/jenscz/fellow-mcp.git
cd fellow-mcp
npm install
npm run build
npm install -g .
```

## Setup

### 1. Get your Fellow API credentials

1. Log into your Fellow account
2. Navigate to Developer API settings in your User settings
3. Generate a new API key
4. Note your workspace subdomain (the part before `.fellow.app` in your URL)

### 2. Configure your MCP client

**Claude Code:**
```bash
claude mcp add fellow \
  -e FELLOW_API_KEY=your-api-key \
  -e FELLOW_SUBDOMAIN=your-subdomain \
  -- fellow-mcp
```

Or in `~/.claude.json` (the `fellow-mcp` command comes from `npm install -g .` above):
```json
{
  "mcpServers": {
    "fellow": {
      "command": "fellow-mcp",
      "env": {
        "FELLOW_API_KEY": "your-api-key",
        "FELLOW_SUBDOMAIN": "your-subdomain"
      }
    }
  }
}
```

> If your MCP client doesn't pick up the global `PATH`, point it straight at the build instead:
> `"command": "node", "args": ["/absolute/path/to/fellow-mcp/dist/index.js"]`

## Available Tools

### API Tools (Direct Fellow API calls)

#### `search_meetings`
Search for meetings/recordings in Fellow.

**Parameters:**
- `title` (optional): Filter by meeting title (case-insensitive partial match)
- `created_at_start` (optional): Filter meetings created after this date (ISO format)
- `created_at_end` (optional): Filter meetings created before this date (ISO format)
- `limit` (optional): Maximum number of results (1-50, default 20)

#### `get_meeting_transcript`
Get the full transcript of a meeting recording with speaker labels and timestamps.

**Parameters:**
- `recording_id` (optional): The ID of the recording
- `meeting_title` (optional): Search by meeting title

#### `get_meeting_summary`
Get the meeting summary/notes content including agenda items, discussion topics, and decisions.

**Parameters:**
- `note_id` (optional): The ID of the note
- `recording_id` (optional): Get the summary for a recording's associated note
- `meeting_title` (optional): Search by meeting title

#### `get_action_items`
Extract action items from a single meeting's notes.

**Parameters:**
- `note_id` (optional): The ID of the note
- `meeting_title` (optional): Search by meeting title

#### `get_meeting_participants`
Get the list of participants/attendees for a meeting.

**Parameters:**
- `note_id` (optional): The ID of the note
- `meeting_title` (optional): Search by meeting title

#### `get_meeting_topics`
Get AI-detected topics/sections from a meeting with timestamps. Returns structured list of discussion topics, their time ranges, and bullet points. Much smaller than full transcript — use this first to understand meeting structure.

**Parameters:**
- `recording_id` (optional): The ID of the recording
- `meeting_title` (optional): Search by meeting title

#### `get_transcript_slice`
Get a time-filtered slice of a meeting transcript. Use `get_meeting_topics` first to find the time range you need, then use this to get just that portion.

**Parameters:**
- `recording_id` (optional): The ID of the recording
- `meeting_title` (optional): Search by meeting title
- `from_seconds` (required): Start time in seconds (inclusive)
- `to_seconds` (required): End time in seconds (inclusive)

**Typical workflow:**
1. `get_meeting_topics(meeting_title: "Weekly Standup")` — find topics and their time ranges
2. `get_transcript_slice(meeting_title: "Weekly Standup", from_seconds: 264, to_seconds: 1666)` — get just that discussion

### Database Tools (Local SQLite cache)

#### `sync_meetings`
Sync meetings from Fellow API to local database.

**Parameters:**
- `force` (optional, default: false): If true, performs full re-sync. Otherwise does incremental sync (only new/updated since last sync)
- `include_transcripts` (optional, default: false): If true, also fetches and stores transcripts (slower)

#### `get_all_action_items`
Get all action items from the local database. **Automatically performs incremental sync first** to ensure data is fresh.

**Parameters:**
- `assignee` (optional): Filter by assignee name (partial match)
- `show_completed` (optional, default: false): If true, includes completed action items
- `since` (optional): Only return action items from meetings on or after this date (ISO format: YYYY-MM-DD)

#### `get_meetings_by_participants`
Find meetings that included specific participants.

**Parameters:**
- `emails` (required): List of email addresses to search for
- `require_all` (optional, default: false): If true, only return meetings where ALL specified participants attended

#### `search_cached_notes`
Full-text search across all cached meeting notes (titles and content).

**Parameters:**
- `query` (required): Search query

#### `get_sync_status`
Get the current sync status and database statistics.

## Local Database

Meeting data is cached in a local SQLite database at `~/.fellow-mcp/fellow.db`. This enables:

- Fast local searches
- Querying across all action items
- Finding meetings by participant
- Offline access to cached data

The database stores:
- Notes (meeting summaries, agendas, content)
- Recordings (with optional transcripts)
- Action items (parsed from notes with assignee/due date extraction)
- Participants (email addresses)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FELLOW_API_KEY` | Yes | Your Fellow API key |
| `FELLOW_SUBDOMAIN` | Yes | Your Fellow workspace subdomain |

## Development

```bash
npm install        # Install dependencies
npm run dev        # Watch mode
npm run build      # Compile TypeScript

# Test API connection
node --env-file=.env test-api.js

# Test MCP server
FELLOW_API_KEY=your_key FELLOW_SUBDOMAIN=your_subdomain node test-mcp.js
```

## Requirements

- Node.js >= 22.13.0 (uses the built-in `node:sqlite` module — no native build step required)
- A Fellow.ai account with API access

## License

MIT

## Credits

Based on [unofficial-fellow-mcp](https://github.com/liba2k/unofficial-fellow-mcp) by Itai Liba.

## API Reference

This MCP server wraps the [Fellow Developer API](https://developers.fellow.ai/reference/introduction). The API uses:
- `X-API-KEY` header for authentication
- POST requests for list operations (with JSON body for filters/pagination)
- GET requests for retrieving individual resources
