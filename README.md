# Better Footnote

English | [中文](#中文) | [日本語](#日本語) | [한국어](#한국어)

A footnote sidebar workspace for academic and long-form writing in Obsidian.

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/alcatrazyu)

☕ Better Footnote is free and will stay free. If it saves you time in your writing, you can [buy me a coffee](https://ko-fi.com/alcatrazyu).

Better Footnote gathers the footnotes in the current note into a stable right sidebar. It lets you edit, search, expand, and delete footnotes directly, while moving between in-text footnote markers, sidebar cards, and footnote definitions without losing your place.

## Why Use It

Obsidian footnotes are flexible, but they become hard to work with in long notes, papers, and research drafts:

- The in-text marker and the footnote definition are often far apart.
- Editing a footnote usually means scrolling to the bottom of the note and then finding your way back.
- Searching for repeated citations in the whole note can mix footnote hits with body text hits.
- Long footnotes need more room, while short footnotes should stay compact.
- Deleting a footnote cleanly means removing both the reference marker and the definition.
- Newly inserted footnotes often need numbering and definition order cleaned up.

Better Footnote turns footnotes into a right-side editing workspace instead of a block of text hidden at the end of the note.

## Core Workflow

- Click an in-text `[^id]` marker to select the matching footnote card in the sidebar.
- Click a sidebar footnote card to jump back to the matching in-text marker and briefly outline it.
- Put the cursor inside a footnote definition near the bottom of the note to select the same footnote in the sidebar.
- Edit the footnote in the sidebar. Changes are saved back to the Markdown file automatically.

The sidebar shows the real `[^id]` from the note, keeps footnotes in definition order, and marks definitions without an in-text reference as unreferenced.

## Supported Footnotes

Better Footnote focuses on standard Markdown footnote definitions:

```md
Text with a footnote.[^1]
Text with a named footnote.[^citation]

[^1]: A footnote definition.
[^citation]: A named footnote definition.
    Continued lines stay inside the same footnote.
```

Named ids such as `[^citation]` are supported. The sidebar shows the real id, while Obsidian may render the footnote as part of the normal numbered sequence in reading mode.

Inline footnotes such as `^[inline text]` are not edited from the sidebar.

## Footnote Search

The sidebar search box searches only footnotes. You can filter by number, id, or content without matching unrelated body text.

If you already know the footnote number or name, type `^` before it to jump directly to that footnote. For example, `^42` only matches footnote `42`, and `^citation` only matches footnote `citation`. Plain `42` remains a normal search across footnote numbers, ids, and content.

When the search text appears multiple times, each occurrence is counted separately. Use the up/down buttons to move through exact matches. Better Footnote scrolls to the matching footnote, expands it if needed, and selects the matched text inside the footnote editor so you can see the exact hit.

Clearing the search returns search-expanded footnotes to their compact state.

## Long Footnotes and Counts

Long footnotes stay compact by default. An expand button appears only when the editor content is actually clipped, so short footnotes do not take unnecessary space.

The footer of each footnote shows a live count. In Auto mode, English counts words, while Chinese, Japanese, and Korean count characters. You can override this in settings when your writing language differs from the interface language.

## Markdown Rendering (Optional)

By default, footnote cards show the raw Markdown source in an editor box. If your footnotes contain many links or formatted text, turn on `Render Markdown in sidebar` in settings.

When enabled, footnote cards you are not editing show rendered Markdown: links, bold, italics, internal links, and other formatting. Click a link to open it directly; internal `[[wikilinks]]` open in the workspace. Click any other text to edit: the card switches in place to an embedded live preview editor, so formatting stays rendered while you type and the Markdown syntax unfolds around the cursor. The cursor lands near where you clicked. (One known limit: editor hotkeys such as `Ctrl/Cmd+B` do not respond inside the card; type the Markdown syntax directly instead.) Click back into the note or press `Esc` to save and return to the rendered view. Switching to another app while editing keeps the editing state, so you can look up a reference and come back. If the live preview editor is unavailable, the card falls back to the plain source editor automatically.

The setting is off by default. Counts always follow the Markdown source, not the rendered text.

## Multiple References

If the same footnote id appears more than once in the text, Better Footnote keeps one sidebar card for the single footnote definition and shows how many references point to it. When that card is selected, small previous/next buttons cycle through each in-text reference and flash the exact marker.

This works for named ids such as `[^citation]` and for repeated numeric ids such as `[^1]`. It does not change the note, renumber footnotes, or run Tidy Footnotes.

## Deleting a Footnote

Right-click a footnote card in the sidebar and choose `Delete this footnote`. After confirmation, Better Footnote removes both the in-text reference marker and the footnote definition in one editor change.

To undo, click back into the note editor and press `Command+Z` on macOS or `Ctrl+Z` on Windows/Linux. Repeated undo works through Obsidian's normal editor history. Better Footnote does not tidy numbering after deletion; run Tidy Footnotes manually when you are ready.

## Tidy Footnotes Integration

Better Footnote can optionally work with [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes). If Tidy Footnotes is installed and enabled, Better Footnote can run it after you insert a new footnote in the note so the new footnote is renumbered and moved into the right definition order (footnotes that arrive from Sync or from scripts that write the file directly are only highlighted).

This integration closes Obsidian's built-in floating footnote editor after insertion, because the Better Footnote sidebar becomes the editing surface. Deleting an in-text reference does not automatically run Tidy Footnotes; the sidebar keeps the definition visible, marks it as unreferenced, and lets you tidy manually when you are ready.

## Quick Start

1. Install and enable Better Footnote from Obsidian's Community plugins.
2. Run `Open Better Footnote` from the command palette.
3. Open a Markdown note with standard footnote definitions such as `[^1]: Reference text` or `[^citation]: Reference text`.
4. Edit or search footnotes in the right sidebar. Changes are saved automatically.

## Languages

The interface follows Obsidian's language first, then the system language, and falls back to English. English, Chinese, Japanese, and Korean UI strings are included.

## 中文

Better Footnote 是一个用于 Obsidian 的脚注侧栏工作台。它面向长文、论文和研究笔记：把当前笔记里的脚注集中放到右侧边栏，让你可以直接编辑、搜索、展开、删除脚注，并在正文脚注标记、侧栏脚注卡片和文末脚注定义之间快速定位。

### 为什么需要它

Obsidian 的脚注语法很灵活，但在长文、论文和研究草稿中，脚注一多就很容易打断写作节奏：

- 正文里的脚注标记和文末脚注定义经常离得很远。
- 修改一条脚注时，常常要滚到文末，再想办法回到正文。
- 想查某个文献或表述是否已经在脚注中出现过，只能全文搜索，容易被正文内容干扰。
- 长脚注需要展开查看，短脚注又不应该占太多侧栏空间。
- 删除一条脚注时，需要同时处理正文引用标记和文末定义，容易漏删。
- 新增脚注后，编号和文末定义顺序经常还需要整理。

Better Footnote 的思路是把脚注变成一个稳定的右侧编辑工作区，而不是藏在文末的一长串文本。

### 核心工作流

- 点击正文里的 `[^id]` 脚注标记，右侧栏会自动选中对应脚注卡片。
- 点击右侧栏脚注卡片，正文中的对应脚注标记会跳转并短暂显示紫色框。
- 在文末脚注定义区点击或移动光标，右侧栏也会同步选中对应脚注。
- 直接在右侧栏编辑脚注内容，修改会自动保存回 Markdown 文件。

侧栏会显示当前文档里的真实 `[^id]`，按文末定义顺序排列；没有正文引用的脚注定义会标记为“未引用”。

### 支持范围

Better Footnote 主要支持标准 Markdown 脚注定义：

```md
正文里的脚注。[^1]
正文里的自定义名称脚注。[^citation]

[^1]: 脚注内容。
[^citation]: 自定义名称脚注内容。
    继续缩进的行仍属于同一条脚注。
```

也支持 `[^citation]` 这类自定义名称脚注。侧栏会显示真实 id；Obsidian 在阅读模式中可能会把它作为普通脚注序列的一部分显示为数字。

暂不在侧栏编辑 `^[inline text]` 这类 inline footnotes。

### 脚注搜索

侧栏搜索框只搜索脚注。你可以按脚注序号、id 或内容过滤，不会被正文中的同词内容干扰。

如果你已经明确知道脚注编号或名称，可以在前面加 `^` 直接定位该条脚注。例如，`^42` 只匹配脚注 `42`，`^citation` 只匹配脚注 `citation`。普通输入 `42` 仍然保持原有搜索逻辑，会搜索脚注序号、id 和脚注内容。

若同一个词在同一条脚注中出现多次，每一处都会单独计数。点击上/下按钮时，Better Footnote 会跳到对应匹配项，必要时自动展开长脚注，并直接选中脚注编辑框里的匹配文字，让你看到具体命中位置。

清除搜索后，由搜索自动展开的脚注会恢复为紧凑显示。

### 长脚注与计数

长脚注默认保持紧凑；只有内容确实显示不全时，才出现展开按钮。因此短脚注不会占用不必要的侧栏空间。

每条脚注左下角会显示实时计数。自动模式下，英文界面统计单词数，中文、日文、韩文界面统计字数。如果写作语言和界面语言不同，可以在设置中改为固定统计字数或单词数。

### Markdown 渲染（可选）

默认情况下，脚注卡片以编辑框显示 Markdown 源码。如果你的脚注里有很多链接或格式文本，可以在设置中开启"侧栏渲染 Markdown"。

开启后，未在编辑的脚注卡片会显示渲染后的 Markdown：链接、粗体、斜体、内部链接等格式。点击链接直接打开；`[[内部链接]]` 会在工作区中打开。点击其他文字即可编辑：卡片原地切换为嵌入式实时预览编辑器，输入时格式保持渲染、光标附近的 Markdown 语法自动展开；光标落在点击位置附近。（已知限制：`Ctrl/Cmd+B` 等编辑器快捷键在卡片内不响应，可直接输入 Markdown 语法代替。）点回笔记正文或按 `Esc` 会自动保存并恢复渲染显示。编辑中切换到其他应用不会丢失编辑状态，方便查完资料回来继续。若实时预览编辑器不可用，卡片会自动回退为源码编辑框。

该选项默认关闭。字数统计始终按 Markdown 源码计算，与显示形态无关。

### 多处引用

如果同一个脚注 id 在正文中出现多次，Better Footnote 仍然只保留一张侧栏卡片，因为文末脚注定义只有一条。侧栏会显示它有几处引用；选中该卡片后，会出现上一处/下一处按钮，可以循环跳转到正文中的每一个引用标记，并短暂高亮当前位置。

这同时适用于 `[^citation]` 这类自定义 id，也适用于重复出现的数字 id，例如 `[^1]`。这个功能只负责定位，不会修改正文、重新编号，也不会运行 Tidy Footnotes。

### 删除脚注

在侧栏脚注卡片上右键，选择“删除本条脚注”。确认后，Better Footnote 会在一次编辑操作中同时删除正文引用标记和文末脚注定义。

如需撤销，请先点击回笔记编辑区，然后在 macOS 上按 `Command+Z`，在 Windows/Linux 上按 `Ctrl+Z`。连续撤销会走 Obsidian 正常的编辑历史。Better Footnote 不会在删除后自动整理编号；确认无误后，可以手动运行 Tidy Footnotes。

### Tidy Footnotes 联动

Better Footnote 可以选择性地与 [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes) 联动。安装并启用 Tidy Footnotes 后，Better Footnote 可以在你于笔记中插入新脚注后自动运行它，让新增脚注完成重新编号并回到正确的文末定义顺序（同步或直接写文件的脚本带来的新脚注只会高亮）。

启用这一联动后，Better Footnote 会关闭 Obsidian 自带的脚注悬浮编辑框，因为脚注编辑入口会转移到 Better Footnote 侧栏。删除正文中的脚注引用时不会自动运行 Tidy Footnotes；侧栏会保留对应脚注定义，标记为“未引用”，你可以在确认后手动整理编号。

### 快速开始

1. 在 Obsidian 第三方插件中安装并启用 Better Footnote。
2. 在命令面板中运行 `Open Better Footnote`。
3. 打开包含标准脚注定义的 Markdown 笔记，例如 `[^1]: 引用内容` 或 `[^citation]: 引用内容`。
4. 在右侧边栏编辑或搜索脚注。修改会自动保存。

### 请我喝杯咖啡

Better Footnote 永久免费。如果它为你的学术写作省下了时间，欢迎在 [Ko-fi](https://ko-fi.com/alcatrazyu) 上请我喝一杯咖啡。

### 语言

插件界面会优先跟随 Obsidian 语言，其次跟随系统语言，最后回退到英文。当前包含英文、中文、日文和韩文界面文案。

## 日本語

Better Footnote は、Obsidian の脚注サイドバー作業スペースです。長いノート、論文、研究メモで使う脚注を右サイドバーにまとめ、脚注の編集、検索、展開、削除、そして本文中の脚注マーカー、サイドバーのカード、文末の脚注定義の間の移動をしやすくします。

### なぜ使うのか

Obsidian の脚注記法は柔軟ですが、長いノート、論文、研究下書きでは脚注が増えるほど作業の流れを止めやすくなります。

- 本文中の脚注マーカーと文末の脚注定義が離れていることが多い。
- 脚注を修正するたびに文末へ移動し、また本文へ戻る必要がある。
- 既出の文献や表現を探すとき、全文検索では本文中の一致も混ざってしまう。
- 長い脚注は展開して読みたい一方、短い脚注はコンパクトに保ちたい。
- 脚注を削除するとき、本文中の参照マーカーと文末定義の両方を処理する必要がある。
- 新しい脚注を入れた後、番号や定義順の整理が必要になることがある。

Better Footnote は、脚注をノート末尾に隠れたテキストではなく、右サイドバーの安定した編集作業スペースとして扱えるようにします。

### 基本の流れ

- 本文中の `[^id]` マーカーをクリックすると、サイドバーの対応する脚注カードが選択されます。
- サイドバーの脚注カードをクリックすると、本文中の対応する脚注マーカーへ移動し、短時間アウトライン表示します。
- 文末の脚注定義内にカーソルを置くと、サイドバーでも同じ脚注が選択されます。
- サイドバーで脚注を直接編集できます。変更は Markdown ファイルへ自動保存されます。

サイドバーには現在のノート内の実際の `[^id]` が表示され、脚注定義の順序で並びます。本文中に参照がない定義には「未参照」と表示します。

### 対応する脚注

Better Footnote は標準的な Markdown 脚注定義を中心に対応しています。

```md
本文中の脚注。[^1]
本文中の名前付き脚注。[^citation]

[^1]: 脚注本文。
[^citation]: 名前付き脚注本文。
    続くインデント行は同じ脚注に含まれます。
```

`[^citation]` のような名前付き脚注 id にも対応しています。サイドバーには実際の id が表示されますが、Obsidian の閲覧モードでは通常の脚注番号の流れに含めて数字で表示される場合があります。

`^[inline text]` のような inline footnotes はサイドバーから編集できません。

### 脚注検索

サイドバーの検索欄は脚注だけを検索します。脚注番号、id、本文で絞り込めるため、本文中の同じ語句に邪魔されません。

探したい脚注番号または名前が分かっている場合は、先頭に `^` を付けるとその脚注だけに直接絞り込めます。たとえば、`^42` は脚注 `42` だけを、`^citation` は脚注 `citation` だけを対象にします。通常の `42` はこれまでどおり、脚注番号、id、脚注本文を検索します。

同じ語句が同じ脚注に複数回出る場合も、それぞれ別の一致として数えます。前/次ボタンを押すと該当する一致箇所へ移動します。必要な場合は長い脚注を自動で展開し、脚注エディタ内の一致テキストを選択するため、どこに一致したか確認できます。

検索をクリアすると、検索によって自動展開された脚注はコンパクト表示に戻ります。

### 長い脚注とカウント

長い脚注は通常コンパクトに表示し、内容が実際に隠れている場合だけ展開ボタンを表示します。短い脚注が不要にスペースを取ることはありません。

各脚注のフッターにはリアルタイムのカウントが表示されます。自動モードでは、英語 UI は単語数、中国語・日本語・韓国語 UI は文字数を数えます。執筆言語が UI と異なる場合は、設定で文字数または単語数に固定できます。

### Markdown レンダリング（オプション）

初期状態では、脚注カードは Markdown ソースを編集ボックスで表示します。脚注にリンクや書式付きテキストが多い場合は、設定で「サイドバーで Markdown をレンダリング」を有効にできます。

有効にすると、編集していない脚注カードは、リンク、太字、斜体、内部リンクなどを含むレンダリング済みの Markdown で表示されます。リンクをクリックするとそのまま開き、`[[内部リンク]]` はワークスペース内で開きます。それ以外の本文をクリックすると編集に切り替わり、カードはその場で埋め込みライブプレビューエディタになります。入力中も書式はレンダリングされたまま、カーソル付近の Markdown 記法だけが展開されます。カーソルはクリックした位置の近くに置かれます。（既知の制限：`Ctrl/Cmd+B` などのエディタホットキーはカード内では反応しません。代わりに Markdown 記法を直接入力してください。）ノート本文をクリックするか `Esc` を押すと保存され、レンダリング表示に戻ります。編集中に他のアプリへ切り替えても編集状態は保持されます。ライブプレビューエディタが利用できない場合は、自動的にソース編集ボックスへ戻ります。

この設定は初期状態でオフです。カウントは常に Markdown ソースを基準とします。

### 複数参照

同じ脚注 id が本文中に複数回出てくる場合でも、脚注定義は 1 件なので、Better Footnote はサイドバーに 1 枚のカードだけを表示します。そのカードには参照数が表示され、選択すると前/次ボタンで本文中の各参照マーカーへ循環移動し、移動先を短時間ハイライトします。

これは `[^citation]` のような名前付き id にも、繰り返し使われた `[^1]` のような数字 id にも対応します。この機能は位置移動だけを行い、本文の変更、番号整理、Tidy Footnotes の実行は行いません。

### 脚注の削除

サイドバーの脚注カードを右クリックし、「この脚注を削除」を選びます。確認後、Better Footnote は本文中の参照マーカーと脚注定義を 1 回の編集操作として削除します。

取り消すには、ノート編集欄をクリックしてから、macOS では `Command+Z`、Windows/Linux では `Ctrl+Z` を押します。複数回の取り消しは Obsidian 標準の編集履歴に従います。Better Footnote は削除後に番号を自動整理しません。必要なタイミングで Tidy Footnotes を手動実行してください。

### Tidy Footnotes 連携

Better Footnote は、必要に応じて [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes) と連携できます。Tidy Footnotes をインストールして有効化すると、ノート内で新しい脚注を挿入した後に自動実行し、番号と脚注定義の順序を整えられます（同期やファイルを直接書き換えるスクリプトで増えた脚注はハイライトのみです）。

この連携を有効にすると、Obsidian 標準の脚注フローティング編集欄は閉じられます。脚注の編集は Better Footnote サイドバーで行う前提です。本文中の脚注参照を削除しても Tidy Footnotes は自動実行されません。サイドバーは定義を残して「未参照」と表示し、必要なタイミングで手動整理できます。

### 使い方

1. Obsidian の Community plugins から Better Footnote をインストールして有効化します。
2. コマンドパレットで `Open Better Footnote` を実行します。
3. `[^1]: Reference text` や `[^citation]: Reference text` のような標準脚注定義を含む Markdown ノートを開きます。
4. 右サイドバーで脚注を編集または検索します。変更は自動保存されます。

### サポート

Better Footnote は無料で、今後も無料のままです。学術的な執筆の時間短縮に役立ったら、[Ko-fi](https://ko-fi.com/alcatrazyu) でコーヒーを一杯ごちそうしていただけると嬉しいです。

### 言語

UI は Obsidian の言語、次にシステム言語を参照し、最後に英語へフォールバックします。英語、中国語、日本語、韓国語の UI 文言を含みます。

## 한국어

Better Footnote는 Obsidian용 각주 사이드바 작업 공간입니다. 긴 노트, 논문, 연구 초안의 각주를 오른쪽 사이드바에 모아 두고, 각주를 직접 편집, 검색, 펼치기, 삭제할 수 있으며 본문 각주 표시, 사이드바 카드, 문서 끝의 각주 정의 사이를 빠르게 오갈 수 있습니다.

### 왜 필요한가

Obsidian의 각주 문법은 유연하지만, 긴 노트, 논문, 연구 초안에서는 각주가 많아질수록 작성 흐름을 끊기 쉽습니다.

- 본문 각주 표시와 문서 끝의 각주 정의가 멀리 떨어져 있는 경우가 많습니다.
- 각주를 고칠 때마다 문서 끝으로 이동한 뒤 다시 본문으로 돌아와야 합니다.
- 이미 인용한 문헌이나 표현을 찾을 때 전체 검색을 하면 본문 검색 결과가 함께 섞입니다.
- 긴 각주는 펼쳐서 보고 싶지만, 짧은 각주는 간결하게 유지하고 싶습니다.
- 각주를 삭제할 때 본문 참조 표시와 각주 정의를 모두 처리해야 합니다.
- 새 각주를 넣은 뒤 번호와 각주 정의 순서를 정리해야 할 때가 있습니다.

Better Footnote는 각주를 문서 끝에 숨어 있는 텍스트가 아니라 오른쪽 사이드바의 안정적인 편집 작업 공간으로 바꿉니다.

### 기본 흐름

- 본문의 `[^id]` 각주 표시를 클릭하면 사이드바의 해당 각주 카드가 선택됩니다.
- 사이드바 각주 카드를 클릭하면 본문의 해당 각주 표시로 이동하고 짧게 윤곽선을 표시합니다.
- 문서 끝의 각주 정의 안에 커서를 두면 사이드바에서도 같은 각주가 선택됩니다.
- 사이드바에서 각주 내용을 직접 편집할 수 있습니다. 변경 사항은 Markdown 파일에 자동 저장됩니다.

사이드바는 현재 노트의 실제 `[^id]`를 표시하고 각주 정의 순서대로 보여줍니다. 본문 참조가 없는 정의는 “참조 없음”으로 표시합니다.

### 지원하는 각주

Better Footnote는 표준 Markdown 각주 정의를 중심으로 지원합니다.

```md
본문의 각주 표시.[^1]
본문의 이름 있는 각주 표시.[^citation]

[^1]: 각주 내용.
[^citation]: 이름 있는 각주 내용.
    이어지는 들여쓰기 줄은 같은 각주에 포함됩니다.
```

`[^citation]` 같은 이름 있는 각주 id도 지원합니다. 사이드바에는 실제 id가 표시되지만, Obsidian 읽기 모드에서는 일반 각주 번호 흐름에 포함되어 숫자로 표시될 수 있습니다.

`^[inline text]` 형식의 inline footnotes는 사이드바에서 편집할 수 없습니다.

### 각주 검색

사이드바 검색창은 각주만 검색합니다. 각주 번호, id, 내용으로 필터링할 수 있어 본문에 있는 같은 단어에 방해받지 않습니다.

찾으려는 각주 번호나 이름을 정확히 알고 있다면 앞에 `^`를 붙여 해당 각주만 바로 찾을 수 있습니다. 예를 들어 `^42`는 각주 `42`만, `^citation`은 각주 `citation`만 일치시킵니다. 일반적인 `42` 입력은 기존처럼 각주 번호, id, 각주 내용을 검색합니다.

같은 단어가 한 각주 안에 여러 번 나오면 각각 별도의 일치 항목으로 계산합니다. 이전/다음 버튼을 누르면 해당 일치 항목으로 이동합니다. 필요한 경우 긴 각주를 자동으로 펼치고, 각주 편집기 안의 일치 텍스트를 선택해 정확한 위치를 보여줍니다.

검색을 지우면 검색 때문에 자동으로 펼쳐졌던 각주는 다시 간결한 표시로 돌아갑니다.

### 긴 각주와 계산

긴 각주는 기본적으로 간결하게 표시되며, 실제로 내용이 잘릴 때만 펼치기 버튼을 보여줍니다. 짧은 각주가 불필요하게 공간을 차지하지 않습니다.

각 각주의 하단에는 실시간 계산 값이 표시됩니다. 자동 모드에서는 영어 UI는 단어 수, 중국어·일본어·한국어 UI는 글자 수를 셉니다. 작성 언어가 UI 언어와 다르면 설정에서 글자 수 또는 단어 수로 고정할 수 있습니다.

### Markdown 렌더링(선택)

기본적으로 각주 카드는 Markdown 소스를 편집 상자로 표시합니다. 각주에 링크나 서식 있는 텍스트가 많다면 설정에서 "사이드바에서 Markdown 렌더링"을 켤 수 있습니다.

켜면 편집 중이 아닌 각주 카드가 링크, 굵게, 기울임, 내부 링크 등 서식을 포함한 렌더링된 Markdown으로 표시됩니다. 링크를 클릭하면 바로 열리고, `[[내부 링크]]`는 작업 공간에서 열립니다. 다른 텍스트를 클릭하면 편집으로 전환됩니다. 카드가 그 자리에서 내장 라이브 프리뷰 편집기로 바뀌어, 입력하는 동안에도 서식은 렌더링된 채 유지되고 커서 주변의 Markdown 문법만 펼쳐집니다. 커서는 클릭한 위치 근처에 놓입니다. (알려진 제한: `Ctrl/Cmd+B` 같은 편집기 단축키는 카드 안에서 동작하지 않으므로 Markdown 문법을 직접 입력해 주세요.) 노트 본문을 클릭하거나 `Esc`를 누르면 저장되고 렌더링 표시로 돌아갑니다. 편집 중 다른 앱으로 전환해도 편집 상태가 유지됩니다. 라이브 프리뷰 편집기를 사용할 수 없는 경우에는 자동으로 소스 편집 상자로 돌아갑니다.

이 설정은 기본적으로 꺼져 있습니다. 글자 수/단어 수는 항상 Markdown 소스를 기준으로 계산됩니다.

### 여러 참조

같은 각주 id가 본문에 여러 번 나타나도 문서 끝의 각주 정의는 하나이므로, Better Footnote는 사이드바에 카드 하나만 표시합니다. 이 카드에는 참조 수가 표시되며, 카드를 선택하면 이전/다음 버튼으로 본문의 각 참조 표시를 순환 이동하고 해당 위치를 짧게 강조합니다.

이 기능은 `[^citation]` 같은 이름 있는 id와 반복해서 사용된 `[^1]` 같은 숫자 id 모두에 적용됩니다. 위치 이동만 처리하며 본문 수정, 번호 정리, Tidy Footnotes 실행은 하지 않습니다.

### 각주 삭제

사이드바의 각주 카드를 오른쪽 클릭하고 “이 각주 삭제”를 선택합니다. 확인하면 Better Footnote가 본문 참조 표시와 각주 정의를 하나의 편집 작업으로 함께 삭제합니다.

되돌리려면 노트 편집 영역을 클릭한 뒤 macOS에서는 `Command+Z`, Windows/Linux에서는 `Ctrl+Z`를 누르세요. 여러 번 되돌리기는 Obsidian의 일반 편집 기록을 따릅니다. Better Footnote는 삭제 후 번호를 자동으로 정리하지 않습니다. 필요할 때 Tidy Footnotes를 직접 실행하세요.

### Tidy Footnotes 연동

Better Footnote는 선택적으로 [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes)와 연동할 수 있습니다. Tidy Footnotes를 설치하고 활성화하면, 노트에서 새 각주를 삽입한 뒤 자동으로 실행해 번호와 각주 정의 순서를 정리할 수 있습니다(동기화나 파일을 직접 쓰는 스크립트로 들어온 각주는 강조 표시만 합니다).

이 연동을 켜면 Obsidian 기본 각주 플로팅 편집 창은 닫힙니다. 각주 편집은 Better Footnote 사이드바에서 하는 흐름을 기준으로 합니다. 본문 각주 참조를 삭제해도 Tidy Footnotes는 자동 실행되지 않습니다. 사이드바는 해당 정의를 유지하고 “참조 없음”으로 표시하며, 필요할 때 수동으로 정리할 수 있습니다.

### 빠른 시작

1. Obsidian Community plugins에서 Better Footnote를 설치하고 활성화합니다.
2. 명령 팔레트에서 `Open Better Footnote`를 실행합니다.
3. `[^1]: Reference text` 또는 `[^citation]: Reference text` 같은 표준 각주 정의가 포함된 Markdown 노트를 엽니다.
4. 오른쪽 사이드바에서 각주를 편집하거나 검색합니다. 변경 사항은 자동 저장됩니다.

### 후원

Better Footnote는 무료이며 앞으로도 무료입니다. 학술 글쓰기에 도움이 되었다면 [Ko-fi](https://ko-fi.com/alcatrazyu)에서 커피 한 잔으로 응원해 주세요.

### 언어

UI는 먼저 Obsidian 언어, 다음으로 시스템 언어를 따르며, 마지막으로 영어로 돌아갑니다. 영어, 중국어, 일본어, 한국어 UI 문구가 포함되어 있습니다.

## Development

This repository keeps the reviewed source and release artifact in the same plain `main.js` file.

```bash
npm test
node -c main.js
```
