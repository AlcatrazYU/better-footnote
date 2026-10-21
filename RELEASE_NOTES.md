# Better Footnote 1.5.6

Footnote syntax inside code and comments is no longer treated as real footnotes, and two ways of losing text are closed. **Recommended for everyone.**

## Data safety (important)

- Footnote syntax written inside code blocks, inline code, `%%` comments, HTML comments, `$$` math or the properties block is now plain text. Previously the sidebar showed it as cards, and deleting a real footnote such as `[^1]` also removed `` `[^1]` `` written in inline code elsewhere in the note. Editing or deleting footnotes no longer touches those places.
- When two definitions share one number (for example after an inserter reused a number), the later one is now marked "Number in use" in the sidebar and can no longer be edited there; give it a new number in the footnote area. Deleting that card removes only that definition. Previously it removed the real footnote and all of its references instead.
- Automatic tidy now pauses while two definitions share a number, because Tidy Footnotes keeps only the last of them and the real citation would be replaced.
- If a footnote is renumbered or removed elsewhere (for example through Sync) while you are editing its card, your text is no longer dropped silently: the card closes and your text is kept in a notice you can copy from.

## Fixes

- In Reading view, clicking or selecting text in the note no longer pulls the sidebar back to the footnote where the cursor was last left in editing view.
- A new footnote inserted right before another footnote marker is now recognised as new, so automatic Tidy and the jump into its card run as usual.
- Search highlights now land on the right characters in footnotes that contain letters whose lowercase form is longer, such as the Turkish `İ`.
- A Tidy command without an editor callback now runs only when the note it belongs to is the active one.
- Removed a stylesheet property flagged by Obsidian's plugin review. Scrollbars in the card editor stay hidden as before.

## Known limitations

- Footnote definitions written inside a block quote (`> [^1]: ...`) are not recognised. Write them outside the quote if you want them in the sidebar.
- Tidy Footnotes itself does not skip code blocks. If you run it on a note with footnote examples inside code, it can still renumber those examples; check code examples after tidying such notes.
- While you type a new code fence above an existing code block and have not closed it yet, the fences pair up differently for a moment and a footnote example inside the old block can briefly appear as a card. Automatic Tidy and the automatic jump into a card do not react to it, and it disappears once you close the fence.
- When two definitions share one number, Obsidian's reading view shows only the later one and Tidy Footnotes keeps only the later one. Give the later definition a new number before tidying by hand. Until then, selecting or searching that number in the sidebar goes to the first card.
- If the note changed after a card was opened (for example through Sync), the card's edit is refused and the notice holds the only copy of your text; copy it before closing the notice.
- Within a few seconds of your own edit in a note, a footnote that arrives through Sync is still treated as yours and may be tidied.
- When no editor holds the note (closed tab, canvas text node, or a tab that is switching view mode), the save goes to disk. Obsidian then merges it into any open view and may show its "modified externally" notice; such a save is not part of the editor's undo history, and the note's line endings are normalised to LF on disk.
- Footnotes inserted inside canvas text nodes or other embedded editors do not trigger automatic Tidy.
- Closing a tab while a card still holds unsaved text relies on the write order of Obsidian's file queue; wait for the card to show "Saved" before closing the tab.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
