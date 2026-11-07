# Better Footnote 1.6.2

Small fixes for inserting footnotes with auto tidy on, and for the outline of the current card.

## Fixes

- With "Auto tidy after a new footnote" on, the popup that Obsidian opens when you insert a footnote is now closed properly before the footnotes are renumbered. Before, it could come back after tidying and show a different footnote.
- In long notes on a slow disk, inserting a footnote with Obsidian's Insert footnote command while auto tidy was on could empty the note. This no longer happens.
- A card scrolled to the top of the sidebar, or reached through search, now keeps a small gap to the edge, so its whole outline stays visible.

## Changes

- The description of "Auto tidy after a new footnote" and the README now say plainly how it works: it runs after you insert a footnote, not after you delete one; it closes the popup that opens on insert, so you type the new footnote in its sidebar card; and it works while Better Footnote is open.

## Thanks

Thanks to @kdqiu for Issue #8: these fixes turned up while looking into that report.

## Known limitations

- After Obsidian restarts, a Better Footnote tab that sits behind another tab, or in a collapsed sidebar, does not tidy new footnotes until you open it once.
- "Switch to Better Footnote when clicking a reference marker" does nothing on phones and tablets, in Reading view, for notes in pop-out windows, and when Better Footnote sits in a stacked tab group (where all tabs are visible anyway).
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
