# Better Footnote 1.4.0

Multiple-reference navigation update.

## Highlights

- Show a compact reference count when one footnote id is used in multiple in-text markers.
- When a multi-reference footnote is selected, show previous/next controls and cycle through each reference marker.
- Remember the reference selected from the editor, so clicking the sidebar card returns to that same marker instead of always jumping to the first reference.
- Support both named ids such as `[^citation]` and repeated numeric ids such as `[^1]`.
- Keep the feature navigation-only: it does not change note content, renumber footnotes, or run Tidy Footnotes.
- Fix a stale deletion record bug where deleting an empty newly inserted footnote could later block editor-to-sidebar sync after Tidy Footnotes reused that number.
- Add localized multi-reference labels and tooltips for English, Chinese, Japanese, and Korean.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
