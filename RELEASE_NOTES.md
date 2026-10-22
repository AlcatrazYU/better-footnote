# Better Footnote 1.6.0

Write a footnote first and place it later, and search for whole phrases.

## New

- **Draft first, place later.** Click `+` beside the search box to add an empty footnote with the next free number after the last footnote definition; its card opens for writing. When you know where it belongs, click the number on the card to copy its marker (such as `[^41]`) and paste it into the note. Clicking the number only copies: the note and your cursor stay where they are, so you can paste right away. The card's right-click menu can copy it too.
- **Phrase search.** Put words in double quotes, such as `"Hey Jude"`, to search for them as one phrase; Chinese quotes `“ ”` work too. A phrase is highlighted and counted as one match, also across line breaks. Words without quotes are still searched one by one.

## Changes

- Clicking a card whose footnote has no marker in the note no longer moves the note; the card just becomes the current one. Use the `Footnote area` button to go to its definition.
- The search row shows `+` while the box is empty, and the clear button, match count and up/down buttons only while you search.
- The `Refresh` button is gone. The sidebar already refreshes by itself when you switch notes, edit, or a note changes through Sync.

## Fixes

- While searching, only one card is outlined at a time. Moving to a result that matches only a card's number, or clicking another card to edit it, no longer leaves a second outline on the previous card; the card you click also becomes the search position.

## Thanks

Thanks to @fat-pumpkin for Issue #6, which asked for a quicker way to put a footnote's reference into the text and started this release.

## Known limitations

- Text written right below a footnote definition without indentation belongs to that footnote in Obsidian's reading view, but its sidebar card shows only the indented lines. Editing the card keeps that text as it is.
- When two definitions share one number, Obsidian's reading view shows only the later one and Tidy Footnotes keeps only the later one. Give one of them a new number before tidying by hand.
- Footnote definitions written inside a block quote (`> [^1]: ...`) are not recognised. Write them outside the quote if you want them in the sidebar.
- Tidy Footnotes itself does not skip code blocks. If you run it on a note with footnote examples inside code, it can still renumber those examples; check code examples after tidying such notes.
- While you type a new code fence above an existing code block and have not closed it yet, the fences pair up differently for a moment and a footnote example inside the old block can briefly appear as a card. Automatic Tidy and the automatic jump into a card do not react to it, and it disappears once you close the fence.
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
