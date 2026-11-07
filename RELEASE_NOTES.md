# Better Footnote 1.6.1

Bring Better Footnote forward by clicking a footnote marker, and a sidebar that looks right when you come back to it.

## Fixes

- When Better Footnote shares the sidebar with other tabs and is hidden behind one of them, it no longer comes back broken. Before, any refresh while hidden (switching notes, editing) left the list scrolled to the top and, with Markdown rendering off, every card squeezed to one line without its expand arrow until the next refresh. Now cards keep their size and arrows, and the list stays where you left it. The same fix also stops the list from shifting slightly after each refresh when Markdown rendering is off.
- If you clicked a footnote marker while Better Footnote was hidden, switching back to it now shows that footnote's card in view, expanded if it is long, just as if the sidebar had been visible.

## New

- **Switch to Better Footnote when clicking a reference marker** (Settings, off by default). When the sidebar is open but showing another tab, such as an AI chat, clicking a footnote marker in your note switches the sidebar to Better Footnote and shows that footnote. Your cursor stays in the note, so you can keep typing. Nothing happens if the sidebar is collapsed or Better Footnote is not open, and clicks on footnote definitions do not count. Desktop only.
- Buttons in the sidebar now show when you hover over them and when you press them.

## Thanks

Thanks to @fairmind-org for Issue #7, which asked for exactly this switch.

## Known limitations

- The new setting does nothing on phones and tablets, in Reading view, for notes in pop-out windows, and when Better Footnote sits in a stacked tab group (where all tabs are visible anyway).
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
