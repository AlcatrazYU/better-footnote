# Better Footnote 1.5.4

Critical data-safety fix, plus layout-stability improvements for the sidebar editor. **If you use 1.5.2 or 1.5.3 with `Render Markdown in sidebar` enabled, please update.**

## Data safety (important)

- Fixed a rare but severe bug in 1.5.2/1.5.3: while a footnote card's embedded live preview editor was open, Obsidian could briefly treat that tiny single-footnote editor as the note's active editor. Any feature that then read "the active editor's content" and saved it — for example inserting a footnote from the editor right-click menu — could overwrite the entire note with just that one footnote's text (recoverable with Undo, but alarming).
- 1.5.4 removes the failure path: the embedded card editor no longer lingers in the workspace's active-editor role. It is unregistered immediately and re-checked on every editor update, on focus changes, by a patrol timer that runs only while a card editor is mounted, and once more at teardown; a torn-down editor is additionally neutered so stale references can no longer point at your file at all.
- The fix went through an independent line-by-line review of the full change set and a dedicated stress-test protocol (an active-editor watchdog plus a shrink-write tripwire, including a replay of the original incident) before release. None of this touches the typing path, so editor performance is unchanged.

## Layout stability

- Clicking a card into edit mode (and leaving it) no longer changes line wrapping or card height. Both display states now share pinned font metrics, the edit state no longer reserves a scrollbar rail, and the expand arrow no longer appears for content that is already fully visible.
- Fixed a flicker where pressing `Esc` a few seconds into editing collapsed the card and then immediately re-expanded it.

## Docs

- README: noted a known limitation of the embedded card editor — global editor hotkeys such as `Ctrl/Cmd+B` do not respond inside the card; type the Markdown syntax directly instead. Internal `[[link]]` autocompletion works as usual.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
