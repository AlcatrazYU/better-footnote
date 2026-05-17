# Better Footnote 1.1.0

Sidebar sync and Tidy Footnotes integration update.

## Highlights

- Show real footnote ids in the sidebar and keep the list aligned with the note's footnote definition order.
- Mark footnote definitions that no longer have an in-text reference as unreferenced.
- Sync the sidebar when the cursor is inside a footnote definition area, not only on an in-text reference.
- Optionally run Tidy Footnotes after inserting a new footnote, with clearer settings text and an install link.
- Explain that automatic Tidy integration closes Obsidian's built-in floating footnote editor and that deleted in-text references are not tidied automatically.
- Add footnote search/filter in the sidebar.
- Add previous/next occurrence navigation for sidebar search.
- Select the matching text inside the footnote editor when navigating search results.
- Add expand/collapse controls when a footnote editor clips its content; search navigation expands the target footnote automatically.
- Collapse search-expanded footnotes automatically when search is cleared.
- Sidebar footnote editor for standard Markdown footnotes.
- Direct multiline editing with automatic save-back to the source note.
- Sidebar-to-editor navigation with temporary reference outline.
- Editor-to-sidebar sync when the cursor is on a footnote reference.
- Localized UI strings for English, Chinese, Japanese, and Korean.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
