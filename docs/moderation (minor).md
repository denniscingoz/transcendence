# Content Moderation (Backend)

## Goal
Provide an automatic moderation pipeline:
- auto moderation
- auto warning
- auto hiding
- auto deletion
- audit logging

This can be rule-based at first; the “AI” aspect is the automated decision pipeline with scoring and thresholds.

## Concepts
### Content types
- Post
- Comment
- (optional) ChatMessage / Profile bio / Username

### Decisions
- `Allow`  — publish normally
- `Warn`   — publish but show warning (or mark)
- `Hide`   — store but do not display publicly (pending review)
- `Delete` — reject or remove

### Moderation log (must-have)
Store every decision:
- `contentType`, `contentId`, `userId`
- `decision`
- `score`
- `reasonCode`
- `language`
- `createdAt`
- (optional) `snapshotHash`

## Pipeline
### Sync moderation (in-request)
Used on create/update:
1. Normalize text (lowercase, trim, collapse spaces).
2. Apply rules (banned words, spam links, repeated chars, caps ratio).
3. Compute score.
4. Choose decision by thresholds.
5. Write `ModerationLog`.
6. Return:
   - success with `moderationStatus`, or
   - error with code `Moderation.Deleted`.

### Async moderation (optional later)
Worker re-checks content:
- deeper rules
- user history checks
- external ML provider (future)
Updates content status and logs.

## API behavior
Recommended response fields on content:
- `moderationStatus`: `allow|warn|hide|delete|pending`
- `moderationMessage`: localized user-facing message (optional)

## Sanctions (optional)
Maintain user state:
- warnings count
- strikes count
- mute/ban until

Example policy:
- repeated `Delete` → strikes
- N strikes → temporary mute/ban
