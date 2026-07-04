# Better Footnote 1.4.3

Performance and workflow stability update for large notes.

## Highlights

- Reduce typing lag in large notes by deferring sidebar refreshes only during real text input instead of every editor change.
- Keep structural footnote operations responsive, including new footnotes, Tidy Footnotes renumbering, sidebar deletion, and command-driven changes.
- Return focus to the Markdown editor after deleting a footnote from the sidebar, so Tidy Footnotes shortcuts and `Ctrl`/`Command + Z` undo work without an extra click.
- Keep the existing footnote editing, search, exact id jump, multi-reference navigation, and deletion semantics unchanged.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
