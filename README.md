# Better Footnote

English | [中文](#中文) | [日本語](#日本語) | [한국어](#한국어)

Better Footnote is a writing-focused Obsidian plugin for editing Markdown footnotes from a stable sidebar.

It does not patch Obsidian's core Footnotes view. Instead, it adds a separate right-sidebar view where standard footnote definitions are shown as editable text areas, with navigation back to the matching reference in the source note.

## Features

- Open a dedicated Better Footnote sidebar.
- Parse standard Markdown footnote definitions such as `[^id]: content`.
- Edit footnotes directly in the sidebar with normal text selection, copy, paste, and multiline input.
- Save sidebar edits back to the source Markdown note.
- Normalize multiline footnotes with four-space continuation indentation so Obsidian keeps them inside the same footnote.
- Show clean numeric labels in the sidebar while preserving the original `[^id]` in the tooltip.
- Remember the current footnote and sidebar scroll position per file.
- Click a footnote card to jump to the first matching reference in the source note.
- Briefly outline the matching `[^id]` reference in the editor so it is easy to locate.
- Use the "Footnote area" button to jump to the footnote definition block.
- Sync from editor cursor to sidebar when the cursor is on a `[^id]` reference.
- Localized interface strings for English, Chinese, Japanese, and Korean.

## Usage

1. Enable Better Footnote from Obsidian's Community plugins settings.
2. Run `Open Better Footnote` from the command palette.
3. Open a Markdown note that contains footnote definitions.
4. Edit footnotes in the sidebar. Changes are saved automatically after a short delay and immediately on blur.

## Scope

This first public version focuses on standard Markdown footnote definitions.

Current limitations:

- Inline footnotes such as `^[...]` are not editable from the sidebar.
- Very complex footnote blocks may be normalized when saved.
- Source mode and Live Preview are both supported through the Markdown editor API, but the most reliable workflow is editing notes in Markdown editing mode.

## Development

This project intentionally uses a plain `main.js` plugin entry without a build step, so the reviewed source and the release artifact are the same file.

Run tests:

```bash
npm test
```

Check syntax:

```bash
node -c main.js
```

## 中文

Better Footnote 是一个面向论文写作的 Obsidian 脚注侧栏插件。它不修改 Obsidian 核心 Footnotes view，而是提供一个新的右侧边栏，把当前 Markdown 文件中的脚注定义渲染成可直接编辑的文本框。

### 功能

- 在右侧打开 Better Footnote 视图。
- 解析 `[^id]: content` 形式的脚注定义。
- 支持常见的多行脚注定义。
- 在侧栏中直接输入、粘贴、复制局部文本。
- 侧栏只显示脚注序号，原始 `[^id]` 保留在悬停提示中。
- 自动把侧栏修改写回原 Markdown 文件。
- 记住当前文件的侧栏滚动位置和当前脚注。
- 点击脚注卡片时跳到正文引用，并用紫色框短暂标出正文里的脚注标记。
- 点击“脚注区”时跳到文末脚注定义。
- 当正文光标位于 `[^id]` 引用上时，侧栏自动定位到对应脚注。
- 界面文案支持中文、英文、日文、韩文，并根据 Obsidian/系统语言自动选择。

### 使用方式

1. 在 Obsidian 的第三方插件设置中启用 Better Footnote。
2. 在命令面板中运行 `Open Better Footnote`。
3. 打开一篇包含脚注定义的 Markdown 笔记。
4. 在右侧边栏中编辑脚注。修改会在短暂延迟后自动保存，失焦时会立即保存。

### 当前范围

- 首版主要支持标准脚注定义，不编辑 inline footnote `^[...]`。
- 多行脚注保存时会规范化为后续行四个空格缩进，以便 Obsidian 更稳定地识别为同一条脚注。
- Source mode 和 Live Preview 都通过 Markdown 编辑器 API 支持；最稳定的工作流仍然是在 Markdown 编辑模式下编辑笔记。

## 日本語

Better Footnote は、Obsidian で Markdown 脚注を安定したサイドバーから編集するための執筆向けプラグインです。

Obsidian のコア Footnotes view を変更するものではありません。標準的な脚注定義を右サイドバーに編集可能なテキストエリアとして表示し、本文中の対応する脚注参照へ移動できる別ビューを追加します。

### 機能

- Better Footnote の専用サイドバーを開けます。
- `[^id]: content` 形式の標準 Markdown 脚注定義を解析します。
- サイドバー内で通常のテキスト選択、コピー、貼り付け、複数行入力ができます。
- サイドバーでの編集内容を元の Markdown ノートに保存します。
- 複数行脚注は、Obsidian が同じ脚注として認識しやすいように後続行を 4 スペースインデントに整えます。
- サイドバーには読みやすい番号だけを表示し、元の `[^id]` はツールチップに残します。
- ファイルごとに現在の脚注とサイドバーのスクロール位置を記憶します。
- 脚注カードをクリックすると、本文中の最初の対応参照へ移動します。
- 対応する `[^id]` 参照を短時間アウトライン表示し、位置を確認しやすくします。
- 「脚注欄」ボタンで文末の脚注定義ブロックへ移動できます。
- エディタのカーソルが `[^id]` 参照上にあるとき、サイドバーも対応する脚注へ同期します。
- 英語、中国語、日本語、韓国語の UI 文言に対応しています。

### 使い方

1. Obsidian の Community plugins 設定で Better Footnote を有効にします。
2. コマンドパレットから `Open Better Footnote` を実行します。
3. 脚注定義を含む Markdown ノートを開きます。
4. サイドバーで脚注を編集します。変更は短い遅延後に自動保存され、フォーカスが外れたときにも即時保存されます。

### 現在の範囲

- 初回公開版は標準的な脚注定義を中心に対応しています。
- `^[...]` のような inline footnote はサイドバーから編集できません。
- 複雑な脚注ブロックは保存時に整形される場合があります。
- Source mode と Live Preview は Markdown エディタ API 経由で対応していますが、もっとも安定した使い方は Markdown 編集モードでの編集です。

## 한국어

Better Footnote는 Obsidian에서 Markdown 각주를 안정적인 사이드바에서 편집하기 위한 글쓰기 중심 플러그인입니다.

Obsidian의 코어 Footnotes view를 수정하지 않습니다. 대신 표준 각주 정의를 오른쪽 사이드바에 편집 가능한 텍스트 영역으로 표시하고, 원문 노트의 해당 각주 참조 위치로 이동할 수 있는 별도 뷰를 추가합니다.

### 기능

- 전용 Better Footnote 사이드바를 열 수 있습니다.
- `[^id]: content` 형식의 표준 Markdown 각주 정의를 파싱합니다.
- 사이드바에서 일반적인 텍스트 선택, 복사, 붙여넣기, 여러 줄 입력을 할 수 있습니다.
- 사이드바 편집 내용을 원본 Markdown 노트에 저장합니다.
- 여러 줄 각주는 Obsidian이 같은 각주로 인식하기 쉽도록 이어지는 줄을 네 칸 들여쓰기로 정리합니다.
- 사이드바에는 읽기 쉬운 번호만 표시하고, 원래 `[^id]`는 툴팁에 보존합니다.
- 파일별로 현재 각주와 사이드바 스크롤 위치를 기억합니다.
- 각주 카드를 클릭하면 본문에서 처음 대응하는 각주 참조로 이동합니다.
- 대응하는 `[^id]` 참조를 짧게 윤곽선으로 표시해 위치를 확인하기 쉽게 합니다.
- "각주 영역" 버튼으로 문서 끝의 각주 정의 블록으로 이동할 수 있습니다.
- 에디터 커서가 `[^id]` 참조 위에 있을 때 사이드바도 해당 각주로 동기화됩니다.
- 영어, 중국어, 일본어, 한국어 UI 문구를 지원합니다.

### 사용 방법

1. Obsidian의 Community plugins 설정에서 Better Footnote를 활성화합니다.
2. 명령 팔레트에서 `Open Better Footnote`를 실행합니다.
3. 각주 정의가 포함된 Markdown 노트를 엽니다.
4. 사이드바에서 각주를 편집합니다. 변경 사항은 짧은 지연 후 자동 저장되며, 포커스를 잃을 때 즉시 저장됩니다.

### 현재 범위

- 첫 공개 버전은 표준 Markdown 각주 정의에 초점을 맞춥니다.
- `^[...]` 형식의 inline footnote는 사이드바에서 편집할 수 없습니다.
- 매우 복잡한 각주 블록은 저장 시 정규화될 수 있습니다.
- Source mode와 Live Preview는 Markdown 에디터 API를 통해 지원하지만, 가장 안정적인 작업 방식은 Markdown 편집 모드에서 노트를 편집하는 것입니다.
