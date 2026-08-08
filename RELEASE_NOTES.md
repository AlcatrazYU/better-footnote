# Better Footnote 1.5.2

Live preview editing inside sidebar footnote cards.

## Highlights

- Edit footnotes with formatting kept rendered: when `Render Markdown in sidebar` is on, clicking a card now opens an embedded live preview editor instead of a plain text box. Links, bold, highlights, and wikilinks stay rendered while you type, and the Markdown syntax unfolds around the cursor, exactly like editing the note itself. Input methods behave identically to the main editor, including Chinese and Japanese composition.
- Keep every safety net from the plain editor: changes save through the same debounced, undo-friendly pipeline, `Esc` returns to the rendered view, `Cmd/Ctrl+S` saves immediately, and switching apps mid-edit preserves the editing state.
- Fall back gracefully: if the embedded editor cannot be created on a future Obsidian version, cards silently return to the plain source editor and nothing breaks. The internal `useLivePreviewEditor` data option can also disable it explicitly.
- Match card typography and geometry between the rendered view and the editor, so entering and leaving edit mode causes no text resizing or layout jumps; switching between cards keeps the clicked card fixed on screen.
- Refine cursor sync scrolling: a card already visible in the sidebar now lights up in place without scrolling; only off-screen cards scroll in, to the familiar top position. This also makes undo in the note feel calmer when it touches a footnote.
- Search locating is unchanged by design: match navigation still uses the plain text selection session from 1.5.1, so clicking a search match edits in the plain source box.
- Notes on editing semantics: the card editor keeps a per-session undo history, while the note itself remains the authoritative undo timeline (undo footnote changes with `Cmd/Ctrl+Z` in the note). If the same footnote is edited in the note and the sidebar at the same time, the most recent save wins, unchanged from previous versions.
- Known limitation: with vim key bindings enabled, `Esc` inside the card editor exits editing rather than only leaving insert mode.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
