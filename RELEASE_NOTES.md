# Better Footnote 1.5.0

Optional Markdown rendering for footnote cards.

## Highlights

- Add a `Render Markdown in sidebar` setting, off by default. When enabled, footnote cards you are not editing show rendered Markdown, including links, bold, italics, and internal links.
- Click a link in a rendered card to open it directly; internal `[[wikilinks]]` open in the workspace.
- Click any other text to edit the Markdown source in place, with the cursor placed near the clicked position; click back into the note or press `Esc` to save and return to the rendered view.
- Keep the editing state when switching to another app, so looking up a reference does not lose your place.
- Cache rendered content and keep the typing path free of extra work, preserving the large-note performance behavior introduced in 1.4.3.
- Keep search, exact id jump, multi-reference navigation, deletion, undo, counts, and Tidy Footnotes integration unchanged. With the setting off, behavior is identical to 1.4.3.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
