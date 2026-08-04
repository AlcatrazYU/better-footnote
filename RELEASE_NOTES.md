# Better Footnote 1.5.1

Feedback fixes for search, card sizing, and sidebar interaction timing.

## Highlights

- Make search locate-first: matches stay selected without editing the footnote, `Enter` and `Shift+Enter` cycle through matches from anywhere, `Esc` returns to the search box, and clicking the text box starts editing. Pressing `Enter` no longer replaces the selected match with a newline.
- Keep the search filter active when interacting with footnotes that are part of the current results; the sidebar only pauses search when it must show footnotes outside the results.
- Shrink footnote cards to fit short footnotes while keeping a height cap for long ones; the expand button still appears only when content is clipped.
- Expand a collapsed footnote automatically when you start editing it, and collapse it again afterwards, without overriding manual expand or collapse choices.
- Keep the current footnote card in view when clearing search instead of jumping back to the top of the list.
- Fix a family of interaction timing glitches: sidebar clicks are no longer swallowed or bounced by cursor sync, sidebar rebuilds, or the post-jump suppression window, and real editor clicks always take effect immediately.
- Remove the doubled focus frame on search targets.
- Warn when a newly inserted footnote id collides with an existing footnote. Some insertion plugins pick colliding numbers in notes with repeated references; the new marker then becomes another reference and an unreferenced duplicate definition is left behind, so Better Footnote now surfaces this clearly instead of running Tidy Footnotes on an ambiguous state.
- Keep editing, deletion, undo, counts, Markdown rendering, and Tidy Footnotes integration otherwise unchanged from 1.5.0.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
