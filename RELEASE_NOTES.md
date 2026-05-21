# Better Footnote 1.3.0

Sidebar footnote deletion update.

## Highlights

- Add a sidebar context-menu action to delete one footnote.
- Delete both the in-text reference marker and the footnote definition as one editor-history change.
- Let users undo deletion through Obsidian's normal editor undo flow: click the note editor, then press Command+Z on macOS or Ctrl+Z on Windows/Linux.
- Keep restored footnotes from being treated as newly inserted footnotes after undo.
- Do not automatically tidy numbering after deletion; run Tidy Footnotes manually when ready.
- Add localized delete and undo guidance for English, Chinese, Japanese, and Korean.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
