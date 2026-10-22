# Better Footnote 1.5.7

When two footnote definitions share a number, the sidebar now decides by content instead of by position, and deleting one of them no longer removes reference markers. **Recommended for everyone.**

## Data safety (important)

- When two definitions share a number, deleting either one now removes only that definition. The reference markers in the note stay and belong to the definition that remains. Previously, deleting the upper definition also removed every marker of that number.
- The definition with content is now the one the sidebar edits and connects to the markers, wherever it sits. Previously the upper definition was always taken as the real footnote, so a blank definition typed above a real one took over its markers and the real one was marked "Number in use".
- If a footnote changes between opening the delete dialog and confirming it (for example through Sync), nothing is deleted.

## Changes

- Automatic tidy and the jump into a new card now follow only a new footnote in the text. Typing, renumbering or pasting a definition that has no marker in the note no longer starts Tidy Footnotes, so the numbers of footnotes you are still drafting stay as they are.
- When several definitions of one number have content, or all of them are blank, the sidebar no longer guesses which one is real: all of them show "Number in use" until one gets a new number.
- For a number in conflict, only one card lights up at a time, and search no longer selects text inside the wrong card.
- Undoing the deletion of a footnote now brings back exactly the footnote you deleted, even when another definition shares its number. Previously the sidebar could take the other definition for the restored one, and then stop following the cursor on that number for up to ten minutes.
- Renumbering footnotes, by hand or through Tidy Footnotes, is no longer mistaken for adding new ones. Previously, with an unplaced high number such as `[^305]` in the note, the jump after inserting a footnote could land on the wrong card.
- Removed the notice about a newly inserted footnote colliding with an existing number. The "Number in use" card already shows the conflict, and the notice's advice did not fit most of the ways a conflict arises.

## Known limitations

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
