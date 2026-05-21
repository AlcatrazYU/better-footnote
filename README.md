# Better Footnote

English | [中文](#中文) | [日本語](#日本語) | [한국어](#한국어)

Edit, search, and navigate Markdown footnotes from a stable Obsidian sidebar.

Better Footnote is built for long notes, papers, and research drafts where footnotes are part of the writing process. It keeps footnotes in a right sidebar so you can revise references, search repeated citations, and jump between a footnote and its in-text marker without losing your place.

## What It Helps With

- Edit footnotes in one sidebar instead of hunting through the bottom of the note.
- Select, copy, paste, and write multiline footnote text normally.
- Search only footnotes, then move through each matching word or phrase with previous/next buttons.
- Keep the source text and sidebar connected: clicking a footnote jumps to its `[^id]` marker and briefly outlines it.
- Keep the sidebar faithful to the note: footnotes are shown in definition order with their real `[^id]`, and definitions without an in-text reference are marked as unreferenced.
- Sync from the footnote definition area too: placing the cursor inside a footnote definition selects the same footnote in the sidebar.
- Delete a single footnote from the sidebar context menu, removing both its reference markers and its definition.
- Keep long footnotes compact, with an expand button only when the editor content is actually clipped.
- Count footnote length as words or characters, with an automatic default based on the plugin language.

## Footnote Search

The sidebar search box filters footnotes by number, id, or content. When the search text appears multiple times, each occurrence is counted separately.

Use the up/down buttons to move through matches. Better Footnote scrolls to the matching footnote, expands it if needed, and selects the matched text inside the footnote editor so you can see the exact hit.

Clearing the search returns search-expanded footnotes to their compact state.

## Footnote Count

The footer of each footnote shows a live count. In Auto mode, English counts words, while Chinese, Japanese, and Korean count characters. You can override this in settings when your writing language differs from the interface language.

## Deleting a Footnote

Right-click a footnote card in the sidebar and choose `Delete this footnote`. After confirmation, Better Footnote removes both the in-text reference marker and the footnote definition in one editor change.

To undo, click back into the note editor and press `Command+Z` on macOS or `Ctrl+Z` on Windows/Linux. Repeated undo works through Obsidian's normal editor history. Better Footnote does not tidy numbering after deletion; run Tidy Footnotes manually when you are ready.

## Tidy Footnotes Integration

Better Footnote can optionally work with [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes). If Tidy Footnotes is installed and enabled, Better Footnote can run it after a new footnote is inserted so the new note is renumbered and moved into the right definition order.

This integration closes Obsidian's built-in floating footnote editor after insertion, because the Better Footnote sidebar becomes the editing surface. Deleting an in-text reference does not automatically run Tidy Footnotes; the sidebar keeps the definition visible, marks it as unreferenced, and lets you tidy manually when you are ready.

## Quick Start

1. Install and enable Better Footnote from Obsidian's Community plugins.
2. Run `Open Better Footnote` from the command palette.
3. Open a Markdown note with standard footnote definitions such as `[^1]: Reference text` or `[^citation]: Reference text`.
4. Edit or search footnotes in the right sidebar. Changes are saved automatically.

## Supported Footnotes

Better Footnote focuses on standard Markdown footnote definitions:

```md
Text with a footnote.[^1]
Text with a named footnote.[^citation]

[^1]: A footnote definition.
[^citation]: A named footnote definition.
    Continued lines stay inside the same footnote.
```

Named footnote ids such as `[^citation]` are supported. The sidebar shows the real id, while Obsidian renders the footnote as part of the normal numbered sequence in reading mode.

Inline footnotes such as `^[inline text]` are not edited from the sidebar.

## Languages

The interface follows Obsidian's language first, then the system language, and falls back to English. English, Chinese, Japanese, and Korean UI strings are included.

## 中文

Better Footnote 是一个用于 Obsidian 的脚注侧栏插件。它面向长文、论文和研究笔记：把当前笔记里的脚注集中放到右侧边栏，让你可以直接编辑、搜索重复引用，并在脚注和正文标记之间快速来回定位。

### 解决什么问题

- 不用反复滚到文末脚注区，就能在侧栏集中编辑脚注。
- 可以正常选择、复制、粘贴、换行编辑脚注内容。
- 可以只搜索脚注，并用上/下按钮逐个跳转到每一处匹配文字。
- 点击侧栏脚注会跳到正文中的 `[^id]` 标记，并用紫色框短暂标出位置。
- 侧栏忠实显示当前文档里的真实脚注 id，并按文末定义顺序排列；没有正文引用的定义会标记为“未引用”。
- 在文末脚注定义区点击或移动光标时，右侧栏也会同步选中对应脚注。
- 可以从侧栏右键菜单删除单条脚注，同时移除正文引用标记和脚注定义。
- 长脚注默认保持紧凑；只有内容确实显示不全时，才出现展开按钮。
- 可以按单词数或字数统计脚注长度，默认跟随插件界面语言自动选择。

### 脚注搜索

侧栏搜索框支持按脚注序号、id 或正文内容过滤。若同一个词在同一条脚注中出现多次，每一处都会单独计数。

点击上/下按钮时，Better Footnote 会跳到对应匹配项，必要时自动展开长脚注，并直接选中脚注编辑框里的匹配文字，让你看到具体命中位置。

清除搜索后，由搜索自动展开的脚注会恢复为紧凑显示。

### 脚注计数

每条脚注左下角会显示实时计数。自动模式下，英文界面统计单词数，中文、日文、韩文界面统计字数。如果写作语言和界面语言不同，可以在设置中改为固定统计字数或单词数。

### 删除脚注

在侧栏脚注卡片上右键，选择“删除本条脚注”。确认后，Better Footnote 会在一次编辑操作中同时删除正文引用标记和文末脚注定义。

如需撤销，请先点击回笔记编辑区，然后在 macOS 上按 `Command+Z`，在 Windows/Linux 上按 `Ctrl+Z`。连续撤销会走 Obsidian 正常的编辑历史。Better Footnote 不会在删除后自动整理编号；确认无误后，可以手动运行 Tidy Footnotes。

### Tidy Footnotes 联动

Better Footnote 可以选择性地与 [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes) 联动。安装并启用 Tidy Footnotes 后，Better Footnote 可以在检测到新增脚注时自动运行它，让新增脚注完成重新编号并回到正确的文末定义顺序。

启用这一联动后，Better Footnote 会关闭 Obsidian 自带的脚注悬浮编辑框，因为脚注编辑入口会转移到 Better Footnote 侧栏。删除正文中的脚注引用时不会自动运行 Tidy Footnotes；侧栏会保留对应脚注定义，标记为“未引用”，你可以在确认后手动整理编号。

### 快速开始

1. 在 Obsidian 第三方插件中安装并启用 Better Footnote。
2. 在命令面板中运行 `Open Better Footnote`。
3. 打开包含标准脚注定义的 Markdown 笔记，例如 `[^1]: 引用内容` 或 `[^citation]: 引用内容`。
4. 在右侧边栏编辑或搜索脚注。修改会自动保存。

### 支持范围

Better Footnote 主要支持标准 Markdown 脚注定义：

```md
正文里的脚注。[^1]
正文里的自定义名称脚注。[^citation]

[^1]: 脚注内容。
[^citation]: 自定义名称脚注内容。
    继续缩进的行仍属于同一条脚注。
```

也支持 `[^citation]` 这类自定义名称脚注。侧栏会显示真实 id；Obsidian 在阅读模式中会把它作为普通脚注序列的一部分显示为数字。

暂不在侧栏编辑 `^[inline text]` 这类 inline footnotes。

### 语言

插件界面会优先跟随 Obsidian 语言，其次跟随系统语言，最后回退到英文。当前包含英文、中文、日文和韩文界面文案。

## 日本語

Better Footnote は、Obsidian のための脚注サイドバープラグインです。長いノート、論文、研究メモで脚注を扱うときに、脚注を右サイドバーにまとめて表示し、編集、検索、本文中の脚注マーカーへの移動をしやすくします。

### できること

- ノート末尾まで何度も移動せず、サイドバーで脚注をまとめて編集できます。
- 脚注テキストを通常どおり選択、コピー、貼り付け、複数行編集できます。
- 脚注だけを検索し、前/次ボタンで各一致箇所へ移動できます。
- サイドバーの脚注をクリックすると本文中の `[^id]` マーカーへ移動し、短時間アウトライン表示します。
- サイドバーは現在のノート内の実際の脚注 id を表示し、脚注定義の順序で並べます。本文中に参照がない定義には「未参照」と表示します。
- 文末の脚注定義内にカーソルを置くと、サイドバーでも同じ脚注が選択されます。
- サイドバーのコンテキストメニューから、参照マーカーと脚注定義をまとめて 1 件ずつ削除できます。
- 長い脚注は通常コンパクトに表示し、内容が実際に隠れている場合だけ展開ボタンを表示します。
- 脚注の長さを単語数または文字数で表示できます。既定ではプラグインの表示言語に基づいて自動選択します。

### 脚注検索

サイドバーの検索欄では、脚注番号、id、本文で絞り込めます。同じ語句が同じ脚注に複数回出る場合も、それぞれ別の一致として数えます。

前/次ボタンを押すと、該当する一致箇所へ移動します。必要な場合は長い脚注を自動で展開し、脚注エディタ内の一致テキストを選択するため、どこに一致したか確認できます。

検索をクリアすると、検索によって自動展開された脚注はコンパクト表示に戻ります。

### 脚注カウント

各脚注のフッターにはリアルタイムのカウントが表示されます。自動モードでは、英語 UI は単語数、中国語・日本語・韓国語 UI は文字数を数えます。執筆言語が UI と異なる場合は、設定で文字数または単語数に固定できます。

### 脚注の削除

サイドバーの脚注カードを右クリックし、「この脚注を削除」を選びます。確認後、Better Footnote は本文中の参照マーカーと脚注定義を 1 回の編集操作として削除します。

取り消すには、ノート編集欄をクリックしてから、macOS では `Command+Z`、Windows/Linux では `Ctrl+Z` を押します。複数回の取り消しは Obsidian 標準の編集履歴に従います。Better Footnote は削除後に番号を自動整理しません。必要なタイミングで Tidy Footnotes を手動実行してください。

### Tidy Footnotes 連携

Better Footnote は、必要に応じて [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes) と連携できます。Tidy Footnotes をインストールして有効化すると、新しい脚注を挿入した後に自動実行し、番号と脚注定義の順序を整えられます。

この連携を有効にすると、Obsidian 標準の脚注フローティング編集欄は閉じられます。脚注の編集は Better Footnote サイドバーで行う前提です。本文中の脚注参照を削除しても Tidy Footnotes は自動実行されません。サイドバーは定義を残して「未参照」と表示し、必要なタイミングで手動整理できます。

### 使い方

1. Obsidian の Community plugins から Better Footnote をインストールして有効化します。
2. コマンドパレットで `Open Better Footnote` を実行します。
3. `[^1]: Reference text` や `[^citation]: Reference text` のような標準脚注定義を含む Markdown ノートを開きます。
4. 右サイドバーで脚注を編集または検索します。変更は自動保存されます。

### 対応する脚注

Better Footnote は標準的な Markdown 脚注定義を中心に対応しています。

```md
本文中の脚注。[^1]
本文中の名前付き脚注。[^citation]

[^1]: 脚注本文。
[^citation]: 名前付き脚注本文。
    続くインデント行は同じ脚注に含まれます。
```

`[^citation]` のような名前付き脚注 id にも対応しています。サイドバーには実際の id が表示されますが、Obsidian の閲覧モードでは通常の脚注番号の流れに含めて数字で表示されます。

`^[inline text]` のような inline footnotes はサイドバーから編集できません。

### 言語

UI は Obsidian の言語、次にシステム言語を参照し、最後に英語へフォールバックします。英語、中国語、日本語、韓国語の UI 文言を含みます。

## 한국어

Better Footnote는 Obsidian용 각주 사이드바 플러그인입니다. 긴 노트, 논문, 연구 초안에서 각주를 자주 다룰 때 오른쪽 사이드바에서 각주를 모아 편집하고, 검색하고, 본문의 각주 표시 위치로 이동할 수 있게 합니다.

### 도움이 되는 부분

- 노트 끝의 각주 영역을 계속 오가지 않고 사이드바에서 각주를 편집할 수 있습니다.
- 각주 텍스트를 일반 텍스트처럼 선택, 복사, 붙여넣기, 여러 줄 편집할 수 있습니다.
- 각주 안에서만 검색하고, 이전/다음 버튼으로 각 일치 항목을 이동할 수 있습니다.
- 사이드바의 각주를 클릭하면 본문의 `[^id]` 표시로 이동하고 짧게 윤곽선을 표시합니다.
- 사이드바는 현재 노트의 실제 각주 id를 표시하고, 각주 정의 순서대로 보여줍니다. 본문 참조가 없는 정의는 “참조 없음”으로 표시합니다.
- 문서 끝의 각주 정의 안에 커서를 두면, 사이드바에서도 같은 각주가 선택됩니다.
- 사이드바 컨텍스트 메뉴에서 각주 1개를 삭제해 참조 표시와 각주 정의를 함께 제거할 수 있습니다.
- 긴 각주는 기본적으로 간결하게 표시되며, 실제로 내용이 잘릴 때만 펼치기 버튼을 보여줍니다.
- 각주 길이를 단어 수 또는 글자 수로 표시할 수 있으며, 기본값은 플러그인 표시 언어에 따라 자동 선택됩니다.

### 각주 검색

사이드바 검색창은 각주 번호, id, 내용으로 각주를 필터링합니다. 같은 단어가 한 각주 안에 여러 번 나오면 각각 별도의 일치 항목으로 계산합니다.

이전/다음 버튼을 누르면 해당 일치 항목으로 이동합니다. 필요한 경우 긴 각주를 자동으로 펼치고, 각주 편집기 안의 일치 텍스트를 선택해 정확한 위치를 보여줍니다.

검색을 지우면 검색 때문에 자동으로 펼쳐졌던 각주는 다시 간결한 표시로 돌아갑니다.

### 각주 계산

각 각주의 하단에는 실시간 계산 값이 표시됩니다. 자동 모드에서는 영어 UI는 단어 수, 중국어·일본어·한국어 UI는 글자 수를 셉니다. 작성 언어가 UI 언어와 다르면 설정에서 글자 수 또는 단어 수로 고정할 수 있습니다.

### 각주 삭제

사이드바의 각주 카드를 오른쪽 클릭하고 “이 각주 삭제”를 선택합니다. 확인하면 Better Footnote가 본문 참조 표시와 각주 정의를 하나의 편집 작업으로 함께 삭제합니다.

되돌리려면 노트 편집 영역을 클릭한 뒤 macOS에서는 `Command+Z`, Windows/Linux에서는 `Ctrl+Z`를 누르세요. 여러 번 되돌리기는 Obsidian의 일반 편집 기록을 따릅니다. Better Footnote는 삭제 후 번호를 자동으로 정리하지 않습니다. 필요할 때 Tidy Footnotes를 직접 실행하세요.

### Tidy Footnotes 연동

Better Footnote는 선택적으로 [Tidy Footnotes](https://community.obsidian.md/plugins/obsidian-tidy-footnotes)와 연동할 수 있습니다. Tidy Footnotes를 설치하고 활성화하면, 새 각주가 삽입된 뒤 자동으로 실행해 번호와 각주 정의 순서를 정리할 수 있습니다.

이 연동을 켜면 Obsidian 기본 각주 플로팅 편집 창은 닫힙니다. 각주 편집은 Better Footnote 사이드바에서 하는 흐름을 기준으로 합니다. 본문 각주 참조를 삭제해도 Tidy Footnotes는 자동 실행되지 않습니다. 사이드바는 해당 정의를 유지하고 “참조 없음”으로 표시하며, 필요할 때 수동으로 정리할 수 있습니다.

### 빠른 시작

1. Obsidian Community plugins에서 Better Footnote를 설치하고 활성화합니다.
2. 명령 팔레트에서 `Open Better Footnote`를 실행합니다.
3. `[^1]: Reference text` 또는 `[^citation]: Reference text` 같은 표준 각주 정의가 포함된 Markdown 노트를 엽니다.
4. 오른쪽 사이드바에서 각주를 편집하거나 검색합니다. 변경 사항은 자동 저장됩니다.

### 지원하는 각주

Better Footnote는 표준 Markdown 각주 정의를 중심으로 지원합니다.

```md
본문의 각주 표시.[^1]
본문의 이름 있는 각주 표시.[^citation]

[^1]: 각주 내용.
[^citation]: 이름 있는 각주 내용.
    이어지는 들여쓰기 줄은 같은 각주에 포함됩니다.
```

`[^citation]` 같은 이름 있는 각주 id도 지원합니다. 사이드바에는 실제 id가 표시되지만, Obsidian 읽기 모드에서는 일반 각주 번호 흐름에 포함되어 숫자로 표시됩니다.

`^[inline text]` 형식의 inline footnotes는 사이드바에서 편집할 수 없습니다.

### 언어

UI는 먼저 Obsidian 언어, 다음으로 시스템 언어를 따르며, 마지막으로 영어로 돌아갑니다. 영어, 중국어, 일본어, 한국어 UI 문구가 포함되어 있습니다.

## Development

This repository keeps the reviewed source and release artifact in the same plain `main.js` file.

```bash
npm test
node -c main.js
```
