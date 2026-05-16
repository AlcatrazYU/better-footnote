# Better Footnote

English | [中文](#中文) | [日本語](#日本語) | [한국어](#한국어)

Edit, search, and navigate Markdown footnotes from a stable Obsidian sidebar.

Better Footnote is built for long notes, papers, and research drafts where footnotes are part of the writing process. It keeps footnotes in a right sidebar so you can revise references, search repeated citations, and jump between a footnote and its in-text marker without losing your place.

## What It Helps With

- Edit footnotes in one sidebar instead of hunting through the bottom of the note.
- Select, copy, paste, and write multiline footnote text normally.
- Search only footnotes, then move through each matching word or phrase with previous/next buttons.
- Keep the source text and sidebar connected: clicking a footnote jumps to its `[^id]` marker and briefly outlines it.
- Keep long footnotes compact, with an expand button only when the editor content is actually clipped.

## Footnote Search

The sidebar search box filters footnotes by number, id, or content. When the search text appears multiple times, each occurrence is counted separately.

Use the up/down buttons to move through matches. Better Footnote scrolls to the matching footnote, expands it if needed, and selects the matched text inside the footnote editor so you can see the exact hit.

Clearing the search returns search-expanded footnotes to their compact state.

## Quick Start

1. Install and enable Better Footnote from Obsidian's Community plugins.
2. Run `Open Better Footnote` from the command palette.
3. Open a Markdown note with standard footnotes such as `[^1]: Reference text`.
4. Edit or search footnotes in the right sidebar. Changes are saved automatically.

## Supported Footnotes

Better Footnote focuses on standard Markdown footnote definitions:

```md
Text with a footnote.[^1]

[^1]: A footnote definition.
    Continued lines stay inside the same footnote.
```

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
- 长脚注默认保持紧凑；只有内容确实显示不全时，才出现展开按钮。

### 脚注搜索

侧栏搜索框支持按脚注序号、id 或正文内容过滤。若同一个词在同一条脚注中出现多次，每一处都会单独计数。

点击上/下按钮时，Better Footnote 会跳到对应匹配项，必要时自动展开长脚注，并直接选中脚注编辑框里的匹配文字，让你看到具体命中位置。

清除搜索后，由搜索自动展开的脚注会恢复为紧凑显示。

### 快速开始

1. 在 Obsidian 第三方插件中安装并启用 Better Footnote。
2. 在命令面板中运行 `Open Better Footnote`。
3. 打开包含标准脚注的 Markdown 笔记，例如 `[^1]: 引用内容`。
4. 在右侧边栏编辑或搜索脚注。修改会自动保存。

### 支持范围

Better Footnote 主要支持标准 Markdown 脚注定义：

```md
正文里的脚注。[^1]

[^1]: 脚注内容。
    继续缩进的行仍属于同一条脚注。
```

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
- 長い脚注は通常コンパクトに表示し、内容が実際に隠れている場合だけ展開ボタンを表示します。

### 脚注検索

サイドバーの検索欄では、脚注番号、id、本文で絞り込めます。同じ語句が同じ脚注に複数回出る場合も、それぞれ別の一致として数えます。

前/次ボタンを押すと、該当する一致箇所へ移動します。必要な場合は長い脚注を自動で展開し、脚注エディタ内の一致テキストを選択するため、どこに一致したか確認できます。

検索をクリアすると、検索によって自動展開された脚注はコンパクト表示に戻ります。

### 使い方

1. Obsidian の Community plugins から Better Footnote をインストールして有効化します。
2. コマンドパレットで `Open Better Footnote` を実行します。
3. `[^1]: Reference text` のような標準脚注を含む Markdown ノートを開きます。
4. 右サイドバーで脚注を編集または検索します。変更は自動保存されます。

### 対応する脚注

Better Footnote は標準的な Markdown 脚注定義を中心に対応しています。

```md
本文中の脚注。[^1]

[^1]: 脚注本文。
    続くインデント行は同じ脚注に含まれます。
```

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
- 긴 각주는 기본적으로 간결하게 표시되며, 실제로 내용이 잘릴 때만 펼치기 버튼을 보여줍니다.

### 각주 검색

사이드바 검색창은 각주 번호, id, 내용으로 각주를 필터링합니다. 같은 단어가 한 각주 안에 여러 번 나오면 각각 별도의 일치 항목으로 계산합니다.

이전/다음 버튼을 누르면 해당 일치 항목으로 이동합니다. 필요한 경우 긴 각주를 자동으로 펼치고, 각주 편집기 안의 일치 텍스트를 선택해 정확한 위치를 보여줍니다.

검색을 지우면 검색 때문에 자동으로 펼쳐졌던 각주는 다시 간결한 표시로 돌아갑니다.

### 빠른 시작

1. Obsidian Community plugins에서 Better Footnote를 설치하고 활성화합니다.
2. 명령 팔레트에서 `Open Better Footnote`를 실행합니다.
3. `[^1]: Reference text` 같은 표준 각주가 포함된 Markdown 노트를 엽니다.
4. 오른쪽 사이드바에서 각주를 편집하거나 검색합니다. 변경 사항은 자동 저장됩니다.

### 지원하는 각주

Better Footnote는 표준 Markdown 각주 정의를 중심으로 지원합니다.

```md
본문의 각주 표시.[^1]

[^1]: 각주 내용.
    이어지는 들여쓰기 줄은 같은 각주에 포함됩니다.
```

`^[inline text]` 형식의 inline footnotes는 사이드바에서 편집할 수 없습니다.

### 언어

UI는 먼저 Obsidian 언어, 다음으로 시스템 언어를 따르며, 마지막으로 영어로 돌아갑니다. 영어, 중국어, 일본어, 한국어 UI 문구가 포함되어 있습니다.

## Development

This repository keeps the reviewed source and release artifact in the same plain `main.js` file.

```bash
npm test
node -c main.js
```
