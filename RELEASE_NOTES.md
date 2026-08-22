# Better Footnote 1.5.5

Data-safety hardening for sidebar saves, plus the sidebar now follows you into non-Markdown views. **Recommended for everyone on 1.5.2 to 1.5.4.**

## Data safety (important)

- Fixed a rare but severe path in which editing a footnote card and then switching that tab to another note (or closing the tab) while the new note was still loading could write the previous note's content into the new note, in the worst case replacing the whole note. Four independent guards now cover this:
  - Every card remembers the note it was built from. A save always goes back to that note, no matter what the sidebar shows by the time the write happens.
  - Automatic Tidy and the automatic jump into a new footnote's card only follow an edit made in the note's own editor (hotkey, menu, command palette, typing). Footnotes that merely appear, for example through Sync or through a script that writes the file directly, are highlighted and nothing more.
  - A note that Obsidian is still loading into a tab is never read or written through that tab. The sidebar reads the file from disk instead, and Tidy refuses to run when it cannot find the note's own editor.
  - Before writing, the plugin checks that the footnote still contains what the card started from. If the note changed in the meantime, the edit is not written: the card returns to what the note says and your text is kept in a notice you can copy from.
- Footnote saves now go through Obsidian's atomic file processing when no editor holds the note, and identical content is never written twice.
- A new empty footnote inserted after deleting one with the same number is no longer mistaken for an undo, so automatic Tidy and focus work again in that case.
- Editing a card while the note is open in Reading view now saves to the file. Previously the change went into a hidden editor and was lost when the note switched back to editing view. Jumping to the in-text marker is not available in Reading view, so clicking a card there only selects it.

## Sidebar follows the active file

- Switching to a PDF, image, canvas, or empty tab now clears the sidebar instead of leaving the last note's footnotes on screen. Coming back to the note restores the scroll position and the selected card.

## Texts

- The automatic Tidy setting and the README now describe exactly when Tidy runs: after you insert a footnote in the note itself.

## Known limitations

- If the note changed after a card was opened (for example through Sync), the card's edit is refused and the notice holds the only copy of your text; copy it before closing the notice.
- Within a few seconds of your own edit in a note, a footnote that arrives through Sync is still treated as yours and may be tidied.
- When no editor holds the note (closed tab, canvas text node, or a tab that is switching view mode), the save goes to disk. Obsidian then merges it into any open view and may show its "modified externally" notice; such a save is not part of the editor's undo history, and the note's line endings are normalised to LF on disk.
- When several definitions share one id, editing a later card writes the first definition if their contents are identical and is refused if they differ.
- Footnotes inserted inside canvas text nodes or other embedded editors do not trigger automatic Tidy.
- Closing a tab while a card still holds unsaved text relies on the write order of Obsidian's file queue; wait for the card to show "Saved" before closing the tab.

## Release assets

This release includes the Obsidian plugin assets:

- `main.js`
- `manifest.json`
- `styles.css`
