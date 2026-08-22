(function () {
  const VIEW_TYPE = "better-footnote-view";
  const SAVE_DELAY_MS = 450;
  const RENDER_DELAY_MS = 90;
  const EDITOR_CHANGE_REFRESH_DELAY_MS = 900;
  const CURSOR_SYNC_DELAY_MS = 80;
  const FOOTNOTE_CONTINUATION_INDENT = "    ";
  const FLASH_SELECTION_MS = 1400;
  const AUTO_TIDY_DELAY_MS = 250;
  const SIDEBAR_JUMP_CURSOR_SUPPRESS_MS = 1200;
  // A newly detected footnote triggers automatic Tidy / auto-focus only when the
  // note's own editor reported a change within this window...
  const NOTE_EDIT_TRUST_MS = 5000;
  // ...and that change followed real keyboard/pointer input within this window
  // (rules out Sync merges, scripts, and views that are still loading a file).
  const USER_INPUT_TRUST_MS = 1500;
  // Content cropped by no more than this many pixels (descender zone of the
  // last line) is treated as fully visible: no expand arrow, no auto-expand.
  const CLIPPED_CONTENT_TOLERANCE_PX = 8;
  const DELETED_FOOTNOTE_RESTORE_TTL_MS = 10 * 60 * 1000;
  const RESTORED_DELETED_FOOTNOTE_CURSOR_SUPPRESS_MS = 5000;
  const MAX_DELETED_FOOTNOTE_RESTORE_RECORDS = 50;
  const PLUGIN_ICON = "list-ordered";
  const TIDY_FOOTNOTES_PLUGIN_URL = "https://community.obsidian.md/plugins/obsidian-tidy-footnotes";

  const DEFAULT_SETTINGS = {
    autoTidyAfterNewFootnote: false,
    countMode: "auto",
    tidyCommandId: "",
    renderMarkdownInSidebar: false,
    useLivePreviewEditor: true,
  };

  const COUNT_MODES = new Set(["auto", "characters", "words"]);

  const I18N = {
    en: {
      title: "Better Footnote",
      refresh: "Refresh",
      noActiveFile: "No active Markdown file",
      openMarkdownNote: "Open a Markdown note to edit its footnotes.",
      readFailed: "Failed to read file: {message}",
      noFootnotes: "No footnote definitions found in this note.",
      footnoteCount: "{file} · {count} footnote{plural}",
      filteredFootnoteCount: "{file} · {visible}/{total} footnotes · {matches} matches",
      searchPlaceholder: "Search footnotes; ^number/name jumps",
      searchTooltip: "Search footnote content; type ^ plus a footnote number or name to jump to that footnote, e.g. ^42 or ^citation.",
      clearSearch: "Clear",
      resumeSearch: "Resume search",
      noSearchResults: "No footnotes match your search.",
      previousMatch: "Previous match",
      nextMatch: "Next match",
      searchMatchCount: "{current}/{total}",
      multipleReferences: "{count} refs",
      referencePosition: "{current}/{total}",
      previousReference: "Previous reference",
      nextReference: "Next reference",
      expandFootnote: "Expand",
      collapseFootnote: "Collapse",
      definitionButton: "Footnote area",
      definitionTooltip: "Jump to the footnote definition area",
      saved: "Saved",
      saving: "Saving...",
      saveError: "Error: {message}",
      characters: "{count} character{plural}",
      words: "{count} word{plural}",
      noActiveFileSave: "No active Markdown file.",
      openSourceForReference: "Open the source note to jump to a footnote reference.",
      openSourceForDefinition: "Open the source note to jump to a footnote definition.",
      noReferenceFound: "No reference found for [^{id}].",
      footnoteNotFound: "Footnote [^{id}] was not found.",
      saveConflict: "Footnote [^{id}] changed in the note after this card was opened, so this edit was not saved to avoid overwriting it. Your text is kept below:",
      saveConflictStatus: "Not saved: note changed",
      unreferenced: "Unreferenced",
      commandOpen: "Open Better Footnote",
      ribbonOpen: "Open Better Footnote",
      settingsTitle: "Better Footnote",
      countModeName: "Footnote count mode",
      countModeDesc: "Auto follows the plugin language: English counts words; Chinese, Japanese, and Korean count characters. Choose a different mode when your writing language differs from the interface language.",
      countModeAuto: "Auto",
      countModeCharacters: "Characters",
      countModeWords: "Words",
      renderMarkdownName: "Render Markdown in sidebar",
      renderMarkdownDesc: "When enabled, footnote cards you are not editing show rendered Markdown, including links, bold, and other formatting. Click a link to open it. Click the text to edit in an embedded live preview editor that keeps formatting rendered while you type; if it is unavailable, the card falls back to a plain source editor.",
      autoTidyName: "Auto tidy after a new footnote",
      autoTidyDesc: "Requires Tidy Footnotes. When Better Footnote detects a newly inserted footnote, it runs Tidy Footnotes automatically. This closes Obsidian's built-in floating footnote editor; use the Better Footnote sidebar to edit the footnote.",
      tidyInstallName: "Tidy Footnotes integration",
      tidyInstallDesc: "Install and enable Tidy Footnotes before using automatic tidying.",
      tidyInstallButton: "Open plugin page",
      tidyCommandMissing: "Tidy Footnotes command was not found.",
      tidyCommandNoEditor: "No Markdown editor is available for Tidy Footnotes.",
      tidyCommandFailed: "Failed to run Tidy Footnotes: {message}",
      deleteFootnoteMenu: "Delete this footnote",
      deleteFootnoteTitle: "Delete footnote [^{id}]?",
      deleteFootnoteWithReferences: "This will remove {count} reference marker{plural} and the footnote definition.",
      deleteUnreferencedFootnote: "This footnote has no reference markers. This will remove the footnote definition.",
      deleteEmptyFootnote: "The footnote definition is empty.",
      deleteCancel: "Cancel",
      deleteConfirm: "Delete footnote",
      deleteNeedsEditor: "Open the source note before deleting a footnote.",
      deleteFailed: "Failed to delete footnote: {message}",
      deletedFootnote: "Deleted footnote [^{id}]. Press {shortcut} to undo.",
      duplicateFootnoteInserted: "New footnote [^{id}] collides with an existing id. Its marker now references the existing footnote, and an unreferenced duplicate definition was left behind. Consider undoing and using an unused id.",
    },
    zh: {
      title: "Better Footnote",
      refresh: "更新",
      noActiveFile: "没有打开 Markdown 文件",
      openMarkdownNote: "打开一篇 Markdown 笔记后，即可编辑其中的脚注。",
      readFailed: "读取文件失败：{message}",
      noFootnotes: "这篇笔记中没有找到脚注定义。",
      footnoteCount: "{file} · {count} 条脚注",
      filteredFootnoteCount: "{file} · 显示 {visible}/{total} 条脚注 · {matches} 处匹配",
      searchPlaceholder: "搜索脚注；^编号/名称精准定位",
      searchTooltip: "搜索脚注内容；输入 ^ 加脚注编号或名称，可精准定位该条脚注，例如 ^42 或 ^citation。",
      clearSearch: "清除",
      resumeSearch: "恢复搜索",
      noSearchResults: "没有匹配的脚注。",
      previousMatch: "上一处匹配",
      nextMatch: "下一处匹配",
      searchMatchCount: "{current}/{total}",
      multipleReferences: "{count} 处引用",
      referencePosition: "{current}/{total}",
      previousReference: "上一处引用",
      nextReference: "下一处引用",
      expandFootnote: "展开",
      collapseFootnote: "收起",
      definitionButton: "脚注区",
      definitionTooltip: "跳到文末脚注定义位置",
      saved: "已保存",
      saving: "保存中...",
      saveError: "错误：{message}",
      characters: "{count} 字",
      words: "{count} 词",
      noActiveFileSave: "没有打开 Markdown 文件。",
      openSourceForReference: "请先打开源笔记，再跳到脚注引用位置。",
      openSourceForDefinition: "请先打开源笔记，再跳到脚注定义位置。",
      noReferenceFound: "没有找到 [^{id}] 的正文引用。",
      footnoteNotFound: "没有找到脚注 [^{id}]。",
      saveConflict: "脚注 [^{id}] 在打开这张卡片之后已在笔记中被修改，为避免覆盖，本次编辑未保存。你的文字保留在下方：",
      saveConflictStatus: "未保存：笔记已变更",
      unreferenced: "未引用",
      commandOpen: "打开 Better Footnote",
      ribbonOpen: "打开 Better Footnote",
      settingsTitle: "Better Footnote",
      countModeName: "脚注计数方式",
      countModeDesc: "自动模式会跟随插件界面语言：英文统计单词数，中文、日文、韩文统计字数。也可以根据写作语言，选择不同于界面语言的计数方式。",
      countModeAuto: "自动",
      countModeCharacters: "字数",
      countModeWords: "单词数",
      renderMarkdownName: "侧栏渲染 Markdown",
      renderMarkdownDesc: "开启后，未在编辑的脚注卡片会显示渲染后的 Markdown，包括链接、粗体等格式。点击链接直接打开；点击文字进入嵌入式实时预览编辑器，输入时格式保持渲染。若实时预览编辑器不可用，卡片会自动回退为源码编辑框。",
      autoTidyName: "新增脚注后自动整理编号",
      autoTidyDesc: "需要先安装并启用 Tidy Footnotes。Better Footnote 检测到新增脚注后，会自动运行 Tidy Footnotes。启用后会关闭 Obsidian 自带的脚注悬浮编辑框，请在 Better Footnote 侧栏中编辑脚注。",
      tidyInstallName: "Tidy Footnotes 集成",
      tidyInstallDesc: "使用自动整理前，请先安装并启用 Tidy Footnotes。",
      tidyInstallButton: "打开插件页面",
      tidyCommandMissing: "没有找到 Tidy Footnotes 命令。",
      tidyCommandNoEditor: "没有可用于 Tidy Footnotes 的 Markdown 编辑器。",
      tidyCommandFailed: "运行 Tidy Footnotes 失败：{message}",
      deleteFootnoteMenu: "删除本条脚注",
      deleteFootnoteTitle: "删除脚注 [^{id}]？",
      deleteFootnoteWithReferences: "将删除 {count} 处引用标记，并删除脚注定义。",
      deleteUnreferencedFootnote: "这条脚注没有引用标记。将删除脚注定义。",
      deleteEmptyFootnote: "这条脚注定义为空。",
      deleteCancel: "取消",
      deleteConfirm: "删除脚注",
      deleteNeedsEditor: "请先打开对应笔记，再删除脚注。",
      deleteFailed: "删除脚注失败：{message}",
      deletedFootnote: "已删除脚注 [^{id}]。按 {shortcut} 可撤销。",
      duplicateFootnoteInserted: "新脚注编号 [^{id}] 与现有脚注撞号：新标记已成为现有脚注的又一处引用，并留下一条未引用的重复定义。建议撤销后改用未使用的编号。",
    },
    ja: {
      title: "Better Footnote",
      refresh: "更新",
      noActiveFile: "Markdown ファイルが開かれていません",
      openMarkdownNote: "Markdown ノートを開くと、その脚注を編集できます。",
      readFailed: "ファイルの読み込みに失敗しました: {message}",
      noFootnotes: "このノートには脚注定義が見つかりません。",
      footnoteCount: "{file} · 脚注 {count} 件",
      filteredFootnoteCount: "{file} · {visible}/{total} 件を表示 · {matches} 件一致",
      searchPlaceholder: "脚注検索；^番号/名前で移動",
      searchTooltip: "脚注本文を検索します。^ に続けて脚注番号または名前を入力すると、その脚注へ移動できます。例: ^42 または ^citation。",
      clearSearch: "クリア",
      resumeSearch: "検索に戻る",
      noSearchResults: "一致する脚注がありません。",
      previousMatch: "前の一致",
      nextMatch: "次の一致",
      searchMatchCount: "{current}/{total}",
      multipleReferences: "{count} 箇所参照",
      referencePosition: "{current}/{total}",
      previousReference: "前の参照",
      nextReference: "次の参照",
      expandFootnote: "展開",
      collapseFootnote: "折りたたむ",
      definitionButton: "脚注欄",
      definitionTooltip: "文末の脚注定義へ移動",
      saved: "保存済み",
      saving: "保存中...",
      saveError: "エラー: {message}",
      characters: "{count}字",
      words: "{count}語",
      noActiveFileSave: "Markdown ファイルが開かれていません。",
      openSourceForReference: "脚注参照へ移動するには、元のノートを開いてください。",
      openSourceForDefinition: "脚注定義へ移動するには、元のノートを開いてください。",
      noReferenceFound: "[^{id}] の本文参照が見つかりません。",
      footnoteNotFound: "脚注 [^{id}] が見つかりません。",
      saveConflict: "脚注 [^{id}] はこのカードを開いた後にノート側で変更されました。上書きを避けるため、今回の編集は保存していません。入力した文字は下に残しています：",
      saveConflictStatus: "未保存: ノートが変更されました",
      unreferenced: "未参照",
      commandOpen: "Better Footnote を開く",
      ribbonOpen: "Better Footnote を開く",
      settingsTitle: "Better Footnote",
      countModeName: "脚注のカウント方式",
      countModeDesc: "自動ではプラグインの表示言語に従います。英語は単語数、中国語・日本語・韓国語は文字数を数えます。執筆言語が UI と異なる場合は、別の方式を選べます。",
      countModeAuto: "自動",
      countModeCharacters: "文字数",
      countModeWords: "単語数",
      renderMarkdownName: "サイドバーで Markdown をレンダリング",
      renderMarkdownDesc: "有効にすると、編集していない脚注カードはリンクや太字などを含むレンダリング済みの Markdown で表示されます。リンクをクリックすると開きます。本文をクリックすると埋め込みライブプレビューエディタで編集でき、入力中も書式はレンダリングされたままです。利用できない場合は自動的にソース編集ボックスへ戻ります。",
      autoTidyName: "新しい脚注の後に自動整理",
      autoTidyDesc: "Tidy Footnotes のインストールと有効化が必要です。Better Footnote は新しい脚注を検出すると、Tidy Footnotes を自動実行します。有効にすると Obsidian 標準の脚注フローティング編集欄を閉じるため、脚注は Better Footnote サイドバーで編集してください。",
      tidyInstallName: "Tidy Footnotes 連携",
      tidyInstallDesc: "自動整理を使う前に、Tidy Footnotes をインストールして有効化してください。",
      tidyInstallButton: "プラグインページを開く",
      tidyCommandMissing: "Tidy Footnotes コマンドが見つかりません。",
      tidyCommandNoEditor: "Tidy Footnotes に使用できる Markdown エディタがありません。",
      tidyCommandFailed: "Tidy Footnotes の実行に失敗しました: {message}",
      deleteFootnoteMenu: "この脚注を削除",
      deleteFootnoteTitle: "脚注 [^{id}] を削除しますか？",
      deleteFootnoteWithReferences: "{count} 件の参照マーカーと脚注定義を削除します。",
      deleteUnreferencedFootnote: "この脚注には参照マーカーがありません。脚注定義を削除します。",
      deleteEmptyFootnote: "この脚注定義は空です。",
      deleteCancel: "キャンセル",
      deleteConfirm: "脚注を削除",
      deleteNeedsEditor: "脚注を削除する前に、元のノートを開いてください。",
      deleteFailed: "脚注の削除に失敗しました: {message}",
      deletedFootnote: "脚注 [^{id}] を削除しました。{shortcut} で取り消せます。",
      duplicateFootnoteInserted: "新しい脚注 [^{id}] は既存の脚注と番号が重複しています。挿入したマーカーは既存脚注への参照として扱われ、未参照の重複定義が残っています。取り消して未使用の番号を使うことをおすすめします。",
    },
    ko: {
      title: "Better Footnote",
      refresh: "새로고침",
      noActiveFile: "열린 Markdown 파일이 없습니다",
      openMarkdownNote: "Markdown 노트를 열면 해당 각주를 편집할 수 있습니다.",
      readFailed: "파일을 읽지 못했습니다: {message}",
      noFootnotes: "이 노트에서 각주 정의를 찾지 못했습니다.",
      footnoteCount: "{file} · 각주 {count}개",
      filteredFootnoteCount: "{file} · {visible}/{total}개 표시 · {matches}개 일치",
      searchPlaceholder: "각주 검색; ^번호/이름 바로 이동",
      searchTooltip: "각주 내용을 검색합니다. ^ 뒤에 각주 번호나 이름을 입력하면 해당 각주로 바로 이동합니다. 예: ^42 또는 ^citation.",
      clearSearch: "지우기",
      resumeSearch: "검색 재개",
      noSearchResults: "일치하는 각주가 없습니다.",
      previousMatch: "이전 일치",
      nextMatch: "다음 일치",
      searchMatchCount: "{current}/{total}",
      multipleReferences: "{count}개 참조",
      referencePosition: "{current}/{total}",
      previousReference: "이전 참조",
      nextReference: "다음 참조",
      expandFootnote: "펼치기",
      collapseFootnote: "접기",
      definitionButton: "각주 영역",
      definitionTooltip: "문서 끝의 각주 정의 위치로 이동",
      saved: "저장됨",
      saving: "저장 중...",
      saveError: "오류: {message}",
      characters: "{count}자",
      words: "{count}단어",
      noActiveFileSave: "열린 Markdown 파일이 없습니다.",
      openSourceForReference: "각주 참조로 이동하려면 원본 노트를 여세요.",
      openSourceForDefinition: "각주 정의로 이동하려면 원본 노트를 여세요.",
      noReferenceFound: "[^{id}]의 본문 참조를 찾지 못했습니다.",
      footnoteNotFound: "각주 [^{id}]를 찾지 못했습니다.",
      saveConflict: "각주 [^{id}]가 이 카드를 연 뒤 노트에서 변경되었습니다. 덮어쓰기를 막기 위해 이번 편집은 저장하지 않았습니다. 입력한 내용은 아래에 남겨 두었습니다:",
      saveConflictStatus: "저장 안 됨: 노트가 변경됨",
      unreferenced: "참조 없음",
      commandOpen: "Better Footnote 열기",
      ribbonOpen: "Better Footnote 열기",
      settingsTitle: "Better Footnote",
      countModeName: "각주 계산 방식",
      countModeDesc: "자동은 플러그인 표시 언어를 따릅니다. 영어는 단어 수, 중국어·일본어·한국어는 글자 수를 셉니다. 작성 언어가 UI 언어와 다르면 다른 계산 방식을 선택할 수 있습니다.",
      countModeAuto: "자동",
      countModeCharacters: "글자 수",
      countModeWords: "단어 수",
      renderMarkdownName: "사이드바에서 Markdown 렌더링",
      renderMarkdownDesc: "켜면 편집 중이 아닌 각주 카드가 링크, 굵게 등 서식을 포함한 렌더링된 Markdown으로 표시됩니다. 링크를 클릭하면 링크가 열립니다. 본문을 클릭하면 내장 라이브 프리뷰 편집기에서 편집할 수 있으며 입력 중에도 서식이 렌더링된 채 유지됩니다. 사용할 수 없는 경우 자동으로 소스 편집 상자로 돌아갑니다.",
      autoTidyName: "새 각주 뒤 자동 정리",
      autoTidyDesc: "Tidy Footnotes를 먼저 설치하고 활성화해야 합니다. Better Footnote가 새 각주를 감지하면 Tidy Footnotes를 자동으로 실행합니다. 이 기능을 켜면 Obsidian 기본 각주 플로팅 편집 창을 닫으므로, 각주는 Better Footnote 사이드바에서 편집하세요.",
      tidyInstallName: "Tidy Footnotes 연동",
      tidyInstallDesc: "자동 정리를 사용하기 전에 Tidy Footnotes를 설치하고 활성화하세요.",
      tidyInstallButton: "플러그인 페이지 열기",
      tidyCommandMissing: "Tidy Footnotes 명령을 찾지 못했습니다.",
      tidyCommandNoEditor: "Tidy Footnotes에 사용할 Markdown 편집기가 없습니다.",
      tidyCommandFailed: "Tidy Footnotes 실행 실패: {message}",
      deleteFootnoteMenu: "이 각주 삭제",
      deleteFootnoteTitle: "각주 [^{id}]를 삭제할까요?",
      deleteFootnoteWithReferences: "참조 표시 {count}개와 각주 정의를 삭제합니다.",
      deleteUnreferencedFootnote: "이 각주에는 참조 표시가 없습니다. 각주 정의를 삭제합니다.",
      deleteEmptyFootnote: "이 각주 정의는 비어 있습니다.",
      deleteCancel: "취소",
      deleteConfirm: "각주 삭제",
      deleteNeedsEditor: "각주를 삭제하기 전에 원본 노트를 여세요.",
      deleteFailed: "각주 삭제 실패: {message}",
      deletedFootnote: "각주 [^{id}]를 삭제했습니다. {shortcut}로 되돌릴 수 있습니다.",
      duplicateFootnoteInserted: "새 각주 [^{id}]가 기존 각주와 번호가 겹칩니다. 삽입한 표시는 기존 각주에 대한 참조로 처리되었고, 참조 없는 중복 정의가 남았습니다. 되돌린 뒤 사용하지 않은 번호를 쓰는 것이 좋습니다.",
    },
  };

  const NUMBER_LOCALES = {
    en: "en-US",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
  };

  function t(strings, key, replacements = {}) {
    return String(strings[key] ?? I18N.en[key] ?? key).replace(/\{(\w+)}/g, (_match, name) => {
      return Object.prototype.hasOwnProperty.call(replacements, name) ? String(replacements[name]) : "";
    });
  }

  function normalizeLanguageTag(rawLanguage) {
    if (!rawLanguage) return "en";
    const value = String(rawLanguage).replace(/_/g, "-").toLowerCase();
    if (value.startsWith("zh")) return "zh";
    if (value.startsWith("ja")) return "ja";
    if (value.startsWith("ko")) return "ko";
    return "en";
  }

  function readLocalStorageLanguage() {
    if (typeof window === "undefined" || !window.localStorage) return "";
    try {
      return window.localStorage.getItem("language") || "";
    } catch (_error) {
      return "";
    }
  }

  function getLanguageSignal() {
    const obsidianLanguage = readLocalStorageLanguage();
    if (obsidianLanguage) return obsidianLanguage;
    if (typeof document !== "undefined" && document.documentElement?.lang) {
      return document.documentElement.lang;
    }
    if (typeof window !== "undefined" && typeof window.moment?.locale === "function") {
      return window.moment.locale();
    }
    if (typeof navigator !== "undefined") {
      const systemLanguage = navigator.languages?.[0] || navigator.language;
      if (systemLanguage) return systemLanguage;
    }
    return "en";
  }

  function getUiLanguage() {
    return normalizeLanguageTag(getLanguageSignal());
  }

  function getStrings() {
    return I18N[getUiLanguage()] || I18N.en;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString(NUMBER_LOCALES[getUiLanguage()] || NUMBER_LOCALES.en);
  }

  function getUndoShortcutLabel() {
    if (typeof navigator === "undefined") return "Ctrl+Z";
    const platformSignal = `${navigator.platform || ""} ${navigator.userAgent || ""}`;
    return /Mac|iPhone|iPad|iPod/i.test(platformSignal) ? "Command+Z" : "Ctrl+Z";
  }

  function normalizeCountMode(mode) {
    return COUNT_MODES.has(mode) ? mode : "auto";
  }

  function resolveCountMode(mode = "auto", language = getUiLanguage()) {
    const normalizedMode = normalizeCountMode(mode);
    if (normalizedMode !== "auto") return normalizedMode;
    return normalizeLanguageTag(language) === "en" ? "words" : "characters";
  }

  function countCharacters(text) {
    return Array.from(String(text ?? "").replace(/\s+/g, "")).length;
  }

  function countWords(text) {
    const matches = String(text ?? "").match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu);
    return matches ? matches.length : 0;
  }

  function countFootnoteText(text, mode = "auto", language = getUiLanguage()) {
    return resolveCountMode(mode, language) === "words" ? countWords(text) : countCharacters(text);
  }

  function formatFootnoteCount(text, mode = "auto", strings = getStrings(), language = getUiLanguage()) {
    const resolvedMode = resolveCountMode(mode, language);
    const count = countFootnoteText(text, resolvedMode, language);
    const key = resolvedMode === "words" ? "words" : "characters";
    return t(strings, key, {
      count: formatNumber(count),
      plural: count === 1 ? "" : "s",
    });
  }

  function formatCharacterCount(value, strings = getStrings()) {
    return t(strings, "characters", {
      count: formatNumber(value),
      plural: Number(value) === 1 ? "" : "s",
    });
  }

  function normalizeForSearch(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .trim();
  }

  function getSearchTokens(query) {
    return normalizeForSearch(query).split(/\s+/).filter(Boolean);
  }

  function getExactFootnoteIdSearchQuery(query) {
    const normalized = normalizeForSearch(query);
    if (!normalized.startsWith("^")) return null;
    const id = normalized.slice(1).trim();
    return id || null;
  }

  function isExactFootnoteIdMatch(footnote, exactId) {
    return normalizeForSearch(footnote?.id) === exactId;
  }

  function getFootnoteSearchText(footnote) {
    return normalizeForSearch([
      footnote.displayNumber,
      footnote.index,
      footnote.id,
      `[^${footnote.id}]`,
      footnote.content,
    ].join(" "));
  }

  function filterFootnotes(footnotes, query) {
    const exactId = getExactFootnoteIdSearchQuery(query);
    if (exactId) {
      return footnotes.filter((footnote) => isExactFootnoteIdMatch(footnote, exactId));
    }
    const tokens = getSearchTokens(query);
    if (tokens.length === 0) return footnotes;
    return footnotes.filter((footnote) => {
      const haystack = getFootnoteSearchText(footnote);
      return tokens.every((token) => haystack.includes(token));
    });
  }

  function getContentSearchTokens(query) {
    return Array.from(new Set(String(query ?? "").toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)));
  }

  function findFootnoteContentMatches(footnote, query) {
    const tokens = getContentSearchTokens(query);
    if (tokens.length === 0) return [];
    const content = String(footnote.content || "");
    const haystack = content.toLocaleLowerCase();
    const matches = [];
    for (const token of tokens) {
      let start = 0;
      while (start < haystack.length) {
        const index = haystack.indexOf(token, start);
        if (index === -1) break;
        matches.push({
          footnoteId: footnote.id,
          start: index,
          end: index + token.length,
          text: content.slice(index, index + token.length),
        });
        start = index + Math.max(token.length, 1);
      }
    }
    return matches.sort((left, right) => left.start - right.start || right.end - left.end);
  }

  function findFootnoteSearchResults(footnotes, query) {
    const exactId = getExactFootnoteIdSearchQuery(query);
    if (exactId) {
      return footnotes
        .filter((footnote) => isExactFootnoteIdMatch(footnote, exactId))
        .map((footnote) => ({ footnoteId: footnote.id, match: null }));
    }
    const tokens = getSearchTokens(query);
    if (tokens.length === 0) return [];
    const results = [];
    for (const footnote of filterFootnotes(footnotes, query)) {
      const contentMatches = findFootnoteContentMatches(footnote, query);
      if (contentMatches.length > 0) {
        for (const match of contentMatches) {
          results.push({ footnoteId: footnote.id, match });
        }
      } else {
        results.push({ footnoteId: footnote.id, match: null });
      }
    }
    return results;
  }

  function getFootnoteDisplayOrderValue(footnote) {
    if (typeof footnote.firstReferenceStart === "number") return footnote.firstReferenceStart;
    return Number.MAX_SAFE_INTEGER;
  }

  function orderFootnotesByReference(footnotes) {
    return Array.from(footnotes || []).sort((left, right) => {
      const referenceOrder = getFootnoteDisplayOrderValue(left) - getFootnoteDisplayOrderValue(right);
      if (referenceOrder !== 0) return referenceOrder;
      const displayOrder = (left.displayNumber || left.index || 0) - (right.displayNumber || right.index || 0);
      if (displayOrder !== 0) return displayOrder;
      return (left.definitionStart || 0) - (right.definitionStart || 0);
    });
  }

  function countFootnoteIdOccurrences(ids) {
    const counts = new Map();
    for (const id of ids) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }

  function detectAddedFootnotes(currentFootnotes, knownFootnoteIds, knownFootnoteSnapshots = null) {
    if (!knownFootnoteIds) return [];
    const knownCounts = countFootnoteIdOccurrences(Array.from(knownFootnoteIds));
    const seenCounts = new Map();
    return currentFootnotes.filter((footnote) => {
      const seen = (seenCounts.get(footnote.id) || 0) + 1;
      seenCounts.set(footnote.id, seen);
      const knownCount = knownCounts.get(footnote.id) || 0;
      if (seen <= knownCount) return false;
      if (knownCount === 0 && isKnownFootnoteBySnapshot(footnote, knownFootnoteSnapshots)) return false;
      return true;
    });
  }

  function choosePrimaryAddedFootnote(addedFootnotes) {
    if (addedFootnotes.length === 0) return null;
    const emptyAddedFootnote = addedFootnotes.find((footnote) => !String(footnote.content || "").trim());
    return emptyAddedFootnote || addedFootnotes[0];
  }

  function getFootnoteFingerprint(footnote) {
    return normalizeForSearch(normalizeLineEndings(footnote?.content || "").replace(/\s+/g, " "));
  }

  function createFootnoteSnapshot(footnote) {
    if (!footnote) return null;
    return {
      id: footnote.id,
      displayNumber: footnote.displayNumber || footnote.index || null,
      contentFingerprint: getFootnoteFingerprint(footnote),
      definitionStart: footnote.definitionStart,
      firstReferenceStart: footnote.firstReferenceStart,
    };
  }

  function deletedFootnoteRecordMatchesFootnote(record, footnote) {
    if (!record || !footnote) return false;
    if (record.id !== String(footnote.id)) return false;
    const deletedFingerprint = record.snapshot?.contentFingerprint || "";
    const currentFingerprint = getFootnoteFingerprint(footnote);
    return deletedFingerprint === currentFingerprint;
  }

  function normalizeReferenceIndex(footnote, index = 0) {
    const count = Math.max(0, Number(footnote?.references?.length || footnote?.referenceCount || 0));
    if (count <= 0) return 0;
    const numericIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
    return Math.max(0, Math.min(count - 1, Math.trunc(numericIndex)));
  }

  function referenceIndexForFootnoteReference(footnote, reference) {
    if (!footnote || !reference || !Array.isArray(footnote.references)) return 0;
    const index = footnote.references.findIndex((item) => {
      return item.start === reference.start && item.end === reference.end;
    });
    return index >= 0 ? index : 0;
  }

  function isKnownFootnoteBySnapshot(footnote, snapshots) {
    if (!Array.isArray(snapshots) || snapshots.length === 0) return false;
    if (typeof footnote.firstReferenceStart === "number") {
      const referenceMatch = snapshots.some((snapshot) => snapshot.firstReferenceStart === footnote.firstReferenceStart);
      if (referenceMatch) return true;
    }
    const fingerprint = getFootnoteFingerprint(footnote);
    if (fingerprint) {
      return snapshots.some((snapshot) => snapshot.contentFingerprint === fingerprint);
    }
    return false;
  }

  function closestFootnote(candidates, snapshot) {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    return candidates.reduce((best, footnote) => {
      const displayDistance = Number.isFinite(snapshot?.displayNumber)
        ? Math.abs((footnote.displayNumber || footnote.index || 0) - snapshot.displayNumber)
        : 0;
      const referenceDistance =
        typeof snapshot?.firstReferenceStart === "number" && typeof footnote.firstReferenceStart === "number"
          ? Math.abs(footnote.firstReferenceStart - snapshot.firstReferenceStart)
          : 0;
      const definitionDistance =
        typeof snapshot?.definitionStart === "number"
          ? Math.abs(footnote.definitionStart - snapshot.definitionStart)
          : 0;
      const score = displayDistance * 1000000 + referenceDistance + definitionDistance;
      if (!best || score < best.score) {
        return { footnote, score };
      }
      return best;
    }, null)?.footnote || candidates[0];
  }

  function resolveFootnoteFromSnapshot(footnotes, snapshot, options = {}) {
    if (!snapshot) return null;
    const allowDisplayFallback = options.allowDisplayFallback !== false;

    if (typeof snapshot.firstReferenceStart === "number") {
      const exactReferenceMatch = footnotes.find((footnote) => footnote.firstReferenceStart === snapshot.firstReferenceStart);
      if (exactReferenceMatch) return exactReferenceMatch;

      const nearbyReferenceMatches = footnotes.filter((footnote) => {
        return typeof footnote.firstReferenceStart === "number"
          && Math.abs(footnote.firstReferenceStart - snapshot.firstReferenceStart) <= 8;
      });
      const nearbyReferenceMatch = closestFootnote(nearbyReferenceMatches, snapshot);
      if (nearbyReferenceMatch) return nearbyReferenceMatch;
    }

    if (snapshot.contentFingerprint) {
      const contentMatches = footnotes.filter((footnote) => getFootnoteFingerprint(footnote) === snapshot.contentFingerprint);
      const matched = closestFootnote(contentMatches, snapshot);
      if (matched) return matched;
    }

    if (allowDisplayFallback && Number.isFinite(snapshot.displayNumber)) {
      const displayMatch = footnotes.find((footnote) => (footnote.displayNumber || footnote.index) === snapshot.displayNumber);
      if (displayMatch) return displayMatch;
    }

    return null;
  }

  function resolveActiveFootnoteId(footnotes, savedState = {}, fallbackId = null) {
    const activeId = savedState.activeId || fallbackId;
    const snapshot = savedState.activeSnapshot || null;
    const strongSnapshotMatch = resolveFootnoteFromSnapshot(footnotes, snapshot, { allowDisplayFallback: false });
    if (strongSnapshotMatch) {
      return strongSnapshotMatch.id;
    }

    if (activeId && footnotes.some((footnote) => footnote.id === activeId)) {
      return activeId;
    }

    const snapshotMatch = resolveFootnoteFromSnapshot(footnotes, snapshot);
    if (snapshotMatch) {
      return snapshotMatch.id;
    }

    return activeId || null;
  }

  function normalizeLineEndings(text) {
    return String(text ?? "").replace(/\r\n?/g, "\n");
  }

  function getLineStarts(text) {
    const starts = [0];
    for (let index = 0; index < text.length; index += 1) {
      if (text.charCodeAt(index) === 10) {
        starts.push(index + 1);
      }
    }
    return starts;
  }

  function lineIndexFromOffset(lineStarts, offset) {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const next = mid + 1 < lineStarts.length ? lineStarts[mid + 1] : Infinity;
      if (offset < lineStarts[mid]) {
        high = mid - 1;
      } else if (offset >= next) {
        low = mid + 1;
      } else {
        return mid;
      }
    }
    return Math.max(0, Math.min(lineStarts.length - 1, low));
  }

  function positionFromOffset(text, offset) {
    const safeOffset = Math.max(0, Math.min(text.length, offset));
    const starts = getLineStarts(text);
    const line = lineIndexFromOffset(starts, safeOffset);
    return {
      line,
      ch: safeOffset - starts[line],
    };
  }

  function isFootnoteDefinitionLine(line) {
    return /^( {0,3})\[\^([^\]\n]+)]:[ \t]?/.test(line);
  }

  function isContinuationLine(line) {
    return line === "" || /^(?: {2,}|\t)/.test(line);
  }

  function isIndentedContinuationLine(line) {
    return /^(?: {2,}|\t)/.test(line);
  }

  function blankLineContinuesFootnote(lines, blankLineIndex) {
    for (let index = blankLineIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line === "") continue;
      if (isFootnoteDefinitionLine(line)) return false;
      return isIndentedContinuationLine(line);
    }
    return false;
  }

  function unindentContinuation(line) {
    if (line.startsWith("\t")) return line.slice(1);
    const spaceIndent = line.match(/^ {2,4}/);
    if (spaceIndent) return line.slice(spaceIndent[0].length);
    return line;
  }

  function buildFootnoteBlock(footnote, content) {
    const lines = normalizeLineEndings(content).split("\n");
    const firstLine = lines.shift() ?? "";
    const continuationIndent = `${footnote.indent || ""}${FOOTNOTE_CONTINUATION_INDENT}`;
    const suffix = lines.map((line) => `\n${continuationIndent}${line}`).join("");
    return `${footnote.indent || ""}[^${footnote.id}]: ${firstLine}${suffix}`;
  }

  function parseFootnotes(rawText) {
    const text = normalizeLineEndings(rawText);
    const lines = text.split("\n");
    const lineStarts = getLineStarts(text);
    const definitions = [];
    const references = [];
    const definitionById = new Map();

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const match = line.match(/^( {0,3})\[\^([^\]\n]+)]:[ \t]?(.*)$/);
      if (!match) continue;

      const indent = match[1] || "";
      const id = match[2];
      const firstContent = match[3] || "";
      const contentLines = [firstContent];
      const definitionStart = lineStarts[lineIndex];
      const contentStart = definitionStart + line.length - firstContent.length;
      let endLineIndex = lineIndex;

      for (let nextLineIndex = lineIndex + 1; nextLineIndex < lines.length; nextLineIndex += 1) {
        const nextLine = lines[nextLineIndex];
        if (isFootnoteDefinitionLine(nextLine)) break;
        if (nextLine === "" && !blankLineContinuesFootnote(lines, nextLineIndex)) break;
        if (!isContinuationLine(nextLine)) break;
        contentLines.push(unindentContinuation(nextLine));
        endLineIndex = nextLineIndex;
      }

      const definitionEnd = lineStarts[endLineIndex] + lines[endLineIndex].length;
      const footnote = {
        id,
        indent,
        index: definitions.length + 1,
        line: lineIndex + 1,
        endLine: endLineIndex + 1,
        definitionStart,
        definitionEnd,
        contentStart,
        content: contentLines.join("\n"),
        references: [],
        referenceCount: 0,
        firstReferenceStart: null,
      };

      definitions.push(footnote);
      if (!definitionById.has(id)) {
        definitionById.set(id, footnote);
      }
      lineIndex = endLineIndex;
    }

    const referencePattern = /\[\^([^\]\n]+)]/g;
    let referenceMatch;
    while ((referenceMatch = referencePattern.exec(text)) !== null) {
      const start = referenceMatch.index;
      const end = start + referenceMatch[0].length;
      const id = referenceMatch[1];
      const lineIndex = lineIndexFromOffset(lineStarts, start);
      const beforeOnLine = text.slice(lineStarts[lineIndex], start);
      const after = text.slice(end, end + 1);
      if (/^ {0,3}$/.test(beforeOnLine) && after === ":") {
        continue;
      }
      const reference = {
        id,
        start,
        end,
        line: lineIndex + 1,
      };
      references.push(reference);
      const footnote = definitionById.get(id);
      if (footnote) {
        footnote.references.push(reference);
        footnote.referenceCount += 1;
        if (footnote.firstReferenceStart === null) {
          footnote.firstReferenceStart = start;
        }
      }
    }

    const displayNumberById = new Map();
    for (const reference of references) {
      if (!definitionById.has(reference.id) || displayNumberById.has(reference.id)) continue;
      displayNumberById.set(reference.id, displayNumberById.size + 1);
    }
    for (const footnote of definitions) {
      if (!displayNumberById.has(footnote.id)) {
        displayNumberById.set(footnote.id, displayNumberById.size + 1);
      }
      footnote.displayNumber = displayNumberById.get(footnote.id);
    }

    return {
      text,
      lineStarts,
      definitions,
      references,
      footnotes: definitions,
    };
  }

  function replaceFootnoteContent(rawText, id, content, options = {}) {
    const text = normalizeLineEndings(rawText);
    const parsed = parseFootnotes(text);
    const footnote = parsed.footnotes.find((item) => item.id === id);
    if (!footnote) {
      return {
        changed: false,
        text,
        reason: "missing-footnote",
      };
    }

    const block = buildFootnoteBlock(footnote, content);
    // What the note will hold after the write, read back through the parser so
    // it compares like-for-like with later parses of the note (the baseline).
    const landed = parseFootnotes(block).footnotes[0]?.content ?? normalizeLineEndings(content);
    if (landed === footnote.content) {
      return { changed: false, text, reason: "already-current", footnote, content: landed };
    }
    // Optimistic check: the caller says what the footnote contained when the
    // edit started. Anything else means the note moved on (or this is not the
    // note the caller thinks it is), so refuse rather than overwrite.
    const expected = options.expectedContent;
    if (typeof expected === "string" && footnote.content !== expected) {
      return { changed: false, text, reason: "content-mismatch", footnote, content: footnote.content };
    }
    return {
      changed: true,
      text: `${text.slice(0, footnote.definitionStart)}${block}${text.slice(footnote.definitionEnd)}`,
      block,
      start: footnote.definitionStart,
      end: footnote.definitionEnd,
      footnote,
      content: landed,
    };
  }

  function expandDefinitionDeleteRange(text, footnote) {
    let start = footnote.definitionStart;
    let end = footnote.definitionEnd;
    if (text.slice(end, end + 1) === "\n") {
      end += 1;
    } else if (start > 0 && text.slice(start - 1, start) === "\n") {
      start -= 1;
    }
    return { start, end };
  }

  function normalizeDeleteRanges(ranges, textLength = Infinity) {
    const clampedRanges = ranges
      .map((range) => ({
        start: Math.max(0, Math.min(textLength, range.start)),
        end: Math.max(0, Math.min(textLength, range.end)),
      }))
      .filter((range) => range.end > range.start)
      .sort((left, right) => left.start - right.start || left.end - right.end);

    const merged = [];
    for (const range of clampedRanges) {
      const previous = merged[merged.length - 1];
      if (previous && range.start <= previous.end) {
        previous.end = Math.max(previous.end, range.end);
      } else {
        merged.push({ ...range });
      }
    }
    return merged;
  }

  function applyDeleteRanges(text, ranges) {
    let nextText = text;
    for (const range of Array.from(ranges).sort((left, right) => right.start - left.start)) {
      nextText = `${nextText.slice(0, range.start)}${nextText.slice(range.end)}`;
    }
    return nextText;
  }

  function deleteFootnoteFromText(rawText, id) {
    const text = normalizeLineEndings(rawText);
    const parsed = parseFootnotes(text);
    const footnote = parsed.footnotes.find((item) => item.id === id);
    if (!footnote) {
      return {
        changed: false,
        text,
        reason: "missing-footnote",
      };
    }

    const ranges = [
      ...footnote.references.map((reference) => ({
        start: reference.start,
        end: reference.end,
      })),
      expandDefinitionDeleteRange(text, footnote),
    ];
    const normalizedRanges = normalizeDeleteRanges(ranges, text.length);
    const nextText = applyDeleteRanges(text, normalizedRanges);
    return {
      changed: nextText !== text,
      text: nextText,
      footnote,
      ranges: normalizedRanges,
      referenceCount: footnote.referenceCount,
      contentIsBlank: !String(footnote.content || "").trim(),
    };
  }

  function findReferenceAtOffset(parsed, offset) {
    return parsed.references.find((reference) => offset >= reference.start && offset <= reference.end) || null;
  }

  function findDefinitionAtOffset(parsed, offset) {
    return parsed.footnotes.find((footnote) => {
      return offset >= footnote.definitionStart && offset <= footnote.definitionEnd;
    }) || null;
  }

  function findReferenceNearOffsetOnLine(parsed, offset) {
    const line = lineIndexFromOffset(parsed.lineStarts, offset) + 1;
    const sameLine = parsed.references.filter((reference) => reference.line === line);
    if (sameLine.length === 0) return null;
    const direct = sameLine.find((reference) => offset >= reference.start - 1 && offset <= reference.end + 1);
    if (direct) return direct;
    const nearest = sameLine.reduce((best, reference) => {
      const distance = Math.min(Math.abs(offset - reference.start), Math.abs(offset - reference.end));
      if (!best || distance < best.distance) {
        return { reference, distance };
      }
      return best;
    }, null);
    return nearest && nearest.distance <= 2 ? nearest.reference : null;
  }

  function closestElement(target, selector) {
    return target && typeof target.closest === "function" ? target.closest(selector) : null;
  }

  function isBetterFootnoteTarget(target) {
    return Boolean(closestElement(target, ".better-footnote"));
  }

  function isMarkdownEditorTarget(target) {
    return Boolean(closestElement(target, ".cm-editor, .markdown-source-view"));
  }

  function isCursorNavigationKey(event) {
    return [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(event?.key);
  }

  function isTextEditingKey(event) {
    const key = event?.key;
    if (!key) return false;
    if (event.metaKey || event.ctrlKey || event.altKey) return false;
    if (event.isComposing || key === "Process") return true;
    if (key.length === 1) return true;
    return ["Backspace", "Delete", "Enter", "NumpadEnter", "Tab"].includes(key);
  }

  function isEditorTextInputEvent(event) {
    if (!event || isBetterFootnoteTarget(event.target) || !isMarkdownEditorTarget(event.target)) {
      return false;
    }
    if (event.type === "keydown") {
      return isTextEditingKey(event);
    }
    const inputType = String(event.inputType || "");
    if (!inputType) return true;
    if (inputType.startsWith("history")) return false;
    return inputType.startsWith("insert") || inputType.startsWith("delete");
  }

  function isCommandLikeEditorKeydown(event) {
    if (!event || event.type !== "keydown") return false;
    if (isBetterFootnoteTarget(event.target) || !isMarkdownEditorTarget(event.target)) return false;
    if (isTextEditingKey(event)) return false;
    return Boolean(event.metaKey || event.ctrlKey || event.altKey || isCursorNavigationKey(event));
  }

  function createDeferredFileScheduler({ delayMs, setTimeoutFn, clearTimeoutFn, onFlush }) {
    const timers = new Map();
    return {
      schedule(key, payload) {
        const normalizedKey = String(key || "");
        if (!normalizedKey) return;
        const existing = timers.get(normalizedKey);
        if (existing) {
          clearTimeoutFn(existing);
        }
        const timer = setTimeoutFn(() => {
          timers.delete(normalizedKey);
          onFlush(payload, normalizedKey);
        }, delayMs);
        timers.set(normalizedKey, timer);
      },
      cancel(key) {
        const normalizedKey = String(key || "");
        const existing = timers.get(normalizedKey);
        if (!existing) return;
        clearTimeoutFn(existing);
        timers.delete(normalizedKey);
      },
      clear() {
        for (const timer of timers.values()) {
          clearTimeoutFn(timer);
        }
        timers.clear();
      },
      has(key) {
        return timers.has(String(key || ""));
      },
      size() {
        return timers.size;
      },
    };
  }

  function approximateSourceOffsetFromClick(content, contextText, offsetInContext) {
    const text = normalizeLineEndings(content ?? "");
    const context = String(contextText ?? "");
    if (!text || !context) return null;
    const numericOffset = Number(offsetInContext);
    const clickOffset = Math.max(0, Math.min(context.length, Number.isFinite(numericOffset) ? Math.trunc(numericOffset) : 0));
    const windowSizes = [context.length, 24, 12, 6, 3, 1];
    const triedFragments = new Set();
    for (const windowSize of windowSizes) {
      const size = Math.max(1, Math.min(context.length, windowSize));
      const start = Math.max(0, Math.min(context.length - size, clickOffset - Math.floor(size / 2)));
      const fragment = context.slice(start, start + size);
      const fragmentKey = `${start}:${size}`;
      if (!fragment.trim() || triedFragments.has(fragmentKey)) continue;
      triedFragments.add(fragmentKey);
      const index = text.indexOf(fragment);
      if (index !== -1) {
        return Math.max(0, Math.min(text.length, index + (clickOffset - start)));
      }
    }
    return null;
  }

  function createLruCache(options = {}) {
    const maxEntries = Math.max(1, Math.trunc(Number(options.maxEntries) || 200));
    const entries = new Map();
    return {
      get(key) {
        const normalizedKey = String(key ?? "");
        if (!entries.has(normalizedKey)) return undefined;
        const value = entries.get(normalizedKey);
        entries.delete(normalizedKey);
        entries.set(normalizedKey, value);
        return value;
      },
      set(key, value) {
        const normalizedKey = String(key ?? "");
        if (entries.has(normalizedKey)) {
          entries.delete(normalizedKey);
        }
        entries.set(normalizedKey, value);
        while (entries.size > maxEntries) {
          entries.delete(entries.keys().next().value);
        }
      },
      has(key) {
        return entries.has(String(key ?? ""));
      },
      delete(key) {
        return entries.delete(String(key ?? ""));
      },
      clear() {
        entries.clear();
      },
      size() {
        return entries.size;
      },
    };
  }

  if (typeof require !== "function") {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = {
        formatCharacterCount,
        formatFootnoteCount,
        countFootnoteText,
        resolveCountMode,
        filterFootnotes,
        findFootnoteSearchResults,
        getStrings,
        normalizeLanguageTag,
        parseFootnotes,
        orderFootnotesByReference,
        detectAddedFootnotes,
        resolveActiveFootnoteId,
        replaceFootnoteContent,
        deleteFootnoteFromText,
        deletedFootnoteRecordMatchesFootnote,
        normalizeReferenceIndex,
        referenceIndexForFootnoteReference,
        findReferenceAtOffset,
        findDefinitionAtOffset,
        isTextEditingKey,
        isEditorTextInputEvent,
        isCommandLikeEditorKeydown,
        createDeferredFileScheduler,
        approximateSourceOffsetFromClick,
        createLruCache,
      };
    }
    return;
  }

  let obsidian;
  let codemirrorState;
  let codemirrorView;
  try {
    obsidian = require("obsidian");
  } catch (_error) {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = {
        parseFootnotes,
        replaceFootnoteContent,
        findReferenceAtOffset,
        findDefinitionAtOffset,
        findReferenceNearOffsetOnLine,
        orderFootnotesByReference,
        detectAddedFootnotes,
        filterFootnotes,
        findFootnoteSearchResults,
        formatCharacterCount,
        formatFootnoteCount,
        countFootnoteText,
        resolveCountMode,
        getStrings,
        normalizeLanguageTag,
        resolveActiveFootnoteId,
        deleteFootnoteFromText,
        deletedFootnoteRecordMatchesFootnote,
        normalizeReferenceIndex,
        referenceIndexForFootnoteReference,
        isTextEditingKey,
        isEditorTextInputEvent,
        isCommandLikeEditorKeydown,
        createDeferredFileScheduler,
        approximateSourceOffsetFromClick,
        createLruCache,
      };
    }
    return;
  }

  try {
    codemirrorState = require("@codemirror/state");
    codemirrorView = require("@codemirror/view");
  } catch (_error) {
    codemirrorState = null;
    codemirrorView = null;
  }

  const { Component, ItemView, MarkdownRenderer, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } = obsidian;
  const { StateEffect, StateField } = codemirrorState || {};
  const { Decoration, EditorView } = codemirrorView || {};
  const flashFootnoteReferenceEffect = StateEffect?.define?.();
  const clearFootnoteReferenceEffect = StateEffect?.define?.();
  const footnoteReferenceHighlightField =
    StateField && Decoration && EditorView && flashFootnoteReferenceEffect && clearFootnoteReferenceEffect
      ? StateField.define({
          create() {
            return Decoration.none;
          },
          update(highlights, transaction) {
            let nextHighlights = highlights.map(transaction.changes);
            for (const effect of transaction.effects) {
              if (effect.is(flashFootnoteReferenceEffect)) {
                const { from, to } = effect.value;
                if (typeof from === "number" && typeof to === "number" && to > from) {
                  nextHighlights = Decoration.set([
                    Decoration.mark({ class: "bfw-reference-flash" }).range(from, to),
                  ]);
                }
              }
              if (effect.is(clearFootnoteReferenceEffect)) {
                nextHighlights = Decoration.none;
              }
            }
            return nextHighlights;
          },
          provide: (field) => EditorView.decorations.from(field),
        })
      : null;

  function isMarkdownFile(file) {
    return file && file.extension === "md";
  }

  function getEditorOffset(editor, text) {
    const cursor = editor.getCursor();
    if (typeof editor.posToOffset === "function") {
      return editor.posToOffset(cursor);
    }
    const lines = text.split("\n");
    let offset = 0;
    for (let index = 0; index < cursor.line; index += 1) {
      offset += (lines[index] || "").length + 1;
    }
    return offset + cursor.ch;
  }

  function editorPositionFromOffset(editor, text, offset) {
    if (typeof editor.offsetToPos === "function") {
      return editor.offsetToPos(offset);
    }
    return positionFromOffset(text, offset);
  }

  class ConfirmDeleteFootnoteModal extends Modal {
    constructor(app, details, onConfirm, onClose) {
      super(app);
      this.details = details;
      this.onConfirm = onConfirm;
      this.onCloseCallback = onClose;
    }

    onOpen() {
      const strings = getStrings();
      const { contentEl } = this;
      const referenceCount = Number(this.details?.referenceCount || 0);
      const isBlank = Boolean(this.details?.contentIsBlank);
      contentEl.empty();
      contentEl.addClass("bfw-delete-modal");
      contentEl.createEl("h2", {
        text: t(strings, "deleteFootnoteTitle", { id: this.details?.id || "" }),
      });
      contentEl.createEl("p", {
        text: referenceCount > 0
          ? t(strings, "deleteFootnoteWithReferences", {
            count: formatNumber(referenceCount),
            plural: referenceCount === 1 ? "" : "s",
          })
          : strings.deleteUnreferencedFootnote,
      });
      if (isBlank) {
        contentEl.createEl("p", { text: strings.deleteEmptyFootnote });
      }

      const buttonRow = contentEl.createDiv({ cls: "bfw-delete-modal-buttons" });
      const cancelButton = buttonRow.createEl("button", {
        text: strings.deleteCancel,
        attr: { type: "button" },
      });
      const deleteButton = buttonRow.createEl("button", {
        cls: "mod-warning",
        text: strings.deleteConfirm,
        attr: { type: "button" },
      });
      cancelButton.addEventListener("click", () => this.close());
      deleteButton.addEventListener("click", () => {
        this.close();
        this.onConfirm?.();
      });
    }

    onClose() {
      this.contentEl.empty();
      this.onCloseCallback?.();
    }
  }

  class BetterFootnotePlugin extends Plugin {
    async onload() {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
      this.settings.countMode = normalizeCountMode(this.settings.countMode);
      this.settings.renderMarkdownInSidebar = Boolean(this.settings.renderMarkdownInSidebar);
      // Data-only killswitch, defaults to enabled: only an explicit false disables it.
      this.settings.useLivePreviewEditor = this.settings.useLivePreviewEditor !== false;
      this.internalEditorResolution = null;
      this.views = new Set();
      this.lastMarkdownFile = null;
      this.noteEditorEdits = new Map(); // path -> timestamp of the last trusted editor change
      this.lastUserInputAt = 0;
      this.suppressEditStamp = false;
      this.cursorSyncTimer = null;
      this.flashSelectionTimer = null;
      this.pendingTidyKeys = new Set();
      this.tidyMissingNoticeShown = false;
      this.suppressCursorSyncUntil = 0;
      this.typingCursorSyncSuppressUntil = 0;
      this.deferredEditorRefresh = createDeferredFileScheduler({
        delayMs: EDITOR_CHANGE_REFRESH_DELAY_MS,
        setTimeoutFn: (callback, delay) => window.setTimeout(callback, delay),
        clearTimeoutFn: (timer) => window.clearTimeout(timer),
        onFlush: ({ file }) => this.flushDeferredEditorRefresh(file),
      });
      this.activeDeleteNotice = null;
      this.recentlyDeletedFootnotesByFile = new Map();
      this.restoredDeletedFootnoteCursorSuppressionsByFile = new Map();
      const strings = getStrings();

      this.registerView(VIEW_TYPE, (leaf) => new BetterFootnoteView(leaf, this));
      this.addSettingTab(new BetterFootnoteSettingTab(this.app, this));
      if (footnoteReferenceHighlightField) {
        this.registerEditorExtension(footnoteReferenceHighlightField);
      }

      this.addRibbonIcon(PLUGIN_ICON, strings.ribbonOpen, () => {
        this.activateView();
      });

      this.addCommand({
        id: "open-better-footnote",
        name: strings.commandOpen,
        callback: () => this.activateView(),
      });

      this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => this.onWorkspaceContextChanged(leaf)));
      this.registerEvent(this.app.workspace.on("file-open", (file) => this.onActiveFileChanged(file)));
      this.registerEvent(this.app.workspace.on("editor-change", (editor, info) => this.onEditorChanged(editor, info)));
      this.registerEvent(this.app.vault.on("modify", (file) => {
        if (isMarkdownFile(file)) this.onVaultFileModified(file);
      }));
      this.registerDomEvent(document, "beforeinput", (event) => this.onEditorTextInputEvent(event));
      this.registerDomEvent(document, "keydown", (event) => this.onEditorKeydown(event));
      this.registerDomEvent(document, "pointerdown", (event) => this.onDocumentPointerDown(event));
      this.registerDomEvent(document, "selectionchange", () => this.scheduleCursorSync());
      this.registerDomEvent(document, "keyup", (event) => {
        this.scheduleCursorSync({ force: isCursorNavigationKey(event) && isMarkdownEditorTarget(event.target) });
      });
      this.registerDomEvent(document, "mouseup", (event) => {
        if (!isMarkdownEditorTarget(event.target)) return;
        this.scheduleCursorSync({ force: true });
      });

      this.app.workspace.onLayoutReady(() => {
        this.trackCurrentMarkdownFile();
        this.refreshViews();
      });
    }

    onunload() {
      if (this.cursorSyncTimer !== null) {
        window.clearTimeout(this.cursorSyncTimer);
      }
      if (this.flashSelectionTimer !== null) {
        window.clearTimeout(this.flashSelectionTimer);
      }
      this.deferredEditorRefresh?.clear();
      this.hideActiveDeleteNotice();
      this.pendingTidyKeys.clear();
      this.recentlyDeletedFootnotesByFile.clear();
      this.restoredDeletedFootnoteCursorSuppressionsByFile.clear();
      this.noteEditorEdits.clear();
    }

    async saveSettings() {
      await this.saveData(this.settings);
    }

    async activateView() {
      let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE).first();
      if (!leaf) {
        leaf = this.app.workspace.getRightLeaf(false);
        await leaf.setViewState({ type: VIEW_TYPE, active: true });
      }
      await this.app.workspace.revealLeaf(leaf);
      this.refreshViews();
    }

    registerFootnoteView(view) {
      this.views.add(view);
    }

    unregisterFootnoteView(view) {
      this.views.delete(view);
    }

    onActiveFileChanged(file) {
      // Obsidian announces the active file through this argument: a Markdown
      // note, a non-Markdown file (PDF, canvas...) or null (empty tab, graph).
      // Trust it both ways, like the core Outline/Backlinks views do, so the
      // sidebar follows the note being looked at and lets go otherwise.
      // stateByFile is untouched, so returning restores scroll and active card.
      this.lastMarkdownFile = isMarkdownFile(file) ? file : null;
      this.onWorkspaceContextChanged();
    }

    onWorkspaceContextChanged(leaf = null) {
      if (leaf?.view?.getViewType?.() === VIEW_TYPE) {
        return;
      }
      this.trackCurrentMarkdownFile();
      this.refreshViews();
      this.scheduleCursorSync({ force: true });
    }

    onEditorChanged(editor, info) {
      // Typing inside our own embedded sidebar editor also fires the global
      // editor-change event; listening to our own keystrokes is pure churn.
      if (this.isOwnLiveEditorContext(editor, info)) return;
      // File loads never dispatch editor-change (Obsidian swaps the state), so a
      // MarkdownView here means a real transaction in that view. Trust it as a
      // user edit only when it followed keyboard/pointer input, the view is not
      // mid-way through loading another file, and it is not our own write-back.
      if (
        !this.suppressEditStamp
        && info instanceof MarkdownView
        && isMarkdownFile(info.file)
        && info.leaf?.working !== true
        && Date.now() - this.lastUserInputAt < USER_INPUT_TRUST_MS
      ) {
        if (this.noteEditorEdits.size > 256) {
          const now = Date.now();
          for (const [path, at] of this.noteEditorEdits) {
            if (now - at > NOTE_EDIT_TRUST_MS) this.noteEditorEdits.delete(path);
          }
        }
        this.noteEditorEdits.set(info.file.path, Date.now());
      }
      const file = this.trackCurrentMarkdownFile();
      if (!file) return;
      if (this.isTypingActive()) {
        this.scheduleDeferredEditorRefresh(file);
        return;
      }
      this.refreshViews(file);
      this.scheduleCursorSync({ force: true, delay: RENDER_DELAY_MS + CURSOR_SYNC_DELAY_MS });
    }

    onVaultFileModified(file) {
      if (this.isTypingActive() && this.lastMarkdownFile?.path === file?.path) {
        this.scheduleDeferredEditorRefresh(file);
        return;
      }
      this.refreshViews(file);
    }

    isOwnLiveEditorContext(editor, info) {
      for (const view of this.views) {
        const live = view.liveEditor;
        if (!live) continue;
        if (info && (info === live.controller || info === live.instance)) return true;
        if (editor && editor === live.instance?.editor) return true;
      }
      return false;
    }

    isLivePreviewEditorAvailable() {
      return this.settings.useLivePreviewEditor !== false
        && Boolean(StateEffect?.appendConfig && EditorView?.updateListener);
    }

    disableLivePreviewEditorForSession(reason) {
      this.internalEditorResolution = { ok: false, failedStep: reason || "runtime" };
    }

    resolveInternalMarkdownEditorClass() {
      if (this.internalEditorResolution) return this.internalEditorResolution;
      let resolution = { ok: false, failedStep: "exception" };
      let embed = null;
      let containerEl = null;
      try {
        const factory = this.app.embedRegistry?.embedByExtension?.md;
        if (typeof factory !== "function") {
          resolution = { ok: false, failedStep: "embedRegistry.md" };
        } else {
          containerEl = document.createElement("div");
          embed = factory({ app: this.app, containerEl, state: {} }, null, "");
          embed.load();
          embed.editable = true;
          embed.showEditor();
          const editMode = embed.editMode;
          const prototype = editMode ? Object.getPrototypeOf(Object.getPrototypeOf(editMode)) : null;
          const EditorClass = prototype?.constructor;
          if (typeof EditorClass !== "function") {
            resolution = { ok: false, failedStep: "prototype" };
          } else if (typeof EditorClass.prototype?.set !== "function") {
            resolution = { ok: false, failedStep: "set" };
          } else {
            resolution = { ok: true, EditorClass };
          }
        }
      } catch (_error) {
        resolution = { ok: false, failedStep: "exception" };
      }
      try {
        embed?.unload?.();
      } catch (_error) {
        // The temporary embed may already be unloaded.
      }
      containerEl?.remove?.();
      if (!resolution.ok) {
        console.warn(
          "Better Footnote: internal Live Preview editor is unavailable, sidebar editing falls back to plain text.",
          resolution.failedStep
        );
      }
      this.internalEditorResolution = resolution;
      return resolution;
    }

    noteUserInput(event) {
      if (isBetterFootnoteTarget(event?.target)) return;
      this.lastUserInputAt = Date.now();
    }

    hasRecentNoteEditorEdit(file) {
      const at = this.noteEditorEdits.get(file?.path);
      if (typeof at !== "number") return false;
      if (Date.now() - at > NOTE_EDIT_TRUST_MS) {
        this.noteEditorEdits.delete(file.path);
        return false;
      }
      return true;
    }

    onEditorTextInputEvent(event) {
      this.noteUserInput(event);
      if (isEditorTextInputEvent(event)) {
        this.markTypingActive();
      }
    }

    onEditorKeydown(event) {
      this.noteUserInput(event);
      if (isEditorTextInputEvent(event)) {
        this.markTypingActive();
      } else if (isCommandLikeEditorKeydown(event)) {
        this.clearTypingActive();
        if (isCursorNavigationKey(event)) {
          this.suppressCursorSyncUntil = 0;
        }
      }
    }

    onDocumentPointerDown(event) {
      this.noteUserInput(event);
      if (!isBetterFootnoteTarget(event?.target)) {
        this.clearTypingActive();
        if (isMarkdownEditorTarget(event?.target)) {
          this.suppressCursorSyncUntil = 0;
        }
      } else {
        this.suppressCursorSyncFromSidebarJump();
      }
    }

    markTypingActive() {
      this.typingCursorSyncSuppressUntil = Date.now() + EDITOR_CHANGE_REFRESH_DELAY_MS;
    }

    clearTypingActive() {
      this.typingCursorSyncSuppressUntil = 0;
    }

    isTypingActive() {
      return Date.now() < this.typingCursorSyncSuppressUntil;
    }

    scheduleDeferredEditorRefresh(file) {
      if (!file?.path) return;
      this.deferredEditorRefresh.schedule(file.path, { file });
    }

    flushDeferredEditorRefresh(file) {
      if (!file?.path) return;
      this.refreshViews(file);
      this.scheduleCursorSync({ force: true, delay: RENDER_DELAY_MS + CURSOR_SYNC_DELAY_MS });
    }

    refreshViews(file = null) {
      if (file?.path) {
        this.deferredEditorRefresh?.cancel(file.path);
      } else {
        this.deferredEditorRefresh?.clear();
      }
      for (const view of this.views) {
        if (!file || !view.file || view.file.path === file.path) {
          view.scheduleRender();
        }
      }
    }

    scheduleCursorSync(options = {}) {
      const force = Boolean(options.force);
      if (!force && this.isTypingActive()) {
        return;
      }
      if (this.cursorSyncTimer !== null) {
        window.clearTimeout(this.cursorSyncTimer);
      }
      this.cursorSyncTimer = window.setTimeout(() => {
        this.cursorSyncTimer = null;
        this.syncCursorToViews({ force });
      }, typeof options.delay === "number" ? options.delay : CURSOR_SYNC_DELAY_MS);
    }

    syncCursorToViews(options = {}) {
      if (!options.force && this.isTypingActive()) {
        return;
      }
      if (Date.now() < this.suppressCursorSyncUntil) {
        return;
      }
      // LOAD-BEARING for the embedded Live Preview editor: its .cm-editor also
      // matches isMarkdownEditorTarget, so mouseup/arrow keys inside the sidebar
      // arrive here with force=true. This focus check is the only barrier that
      // keeps those from being treated as main-editor cursor moves. (N24)
      if (document.activeElement?.closest?.(".better-footnote")) {
        return;
      }

      const markdownView = this.getActiveMarkdownView() || this.findMarkdownViewForFile(this.lastMarkdownFile);
      if (!this.isMarkdownViewSettled(markdownView)) return;
      const editor = markdownView?.editor;
      if (!editor || typeof editor.getValue !== "function") return;

      const text = normalizeLineEndings(editor.getValue());
      const parsed = parseFootnotes(text);
      const offset = getEditorOffset(editor, text);
      const reference = findReferenceAtOffset(parsed, offset) || findReferenceNearOffsetOnLine(parsed, offset);
      const definition = reference ? null : findDefinitionAtOffset(parsed, offset);
      const footnoteId = reference?.id || definition?.id || null;
      if (!footnoteId) return;
      const footnote = parsed.footnotes.find((item) => item.id === footnoteId);
      if (
        this.shouldSuppressRestoredDeletedFootnoteCursorSync(markdownView.file, footnoteId)
        || this.matchesRecentlyDeletedFootnote(markdownView.file, footnote)
      ) {
        return;
      }
      const referenceIndex = reference && footnote
        ? referenceIndexForFootnoteReference(footnote, reference)
        : undefined;

      for (const view of this.views) {
        if (view.file?.path === markdownView.file?.path) {
          view.focusFootnote(footnoteId, {
            scroll: true,
            // A card already in view lights up in place; an off-screen card
            // scrolls to the top position (maintainer decision, 1.5.2).
            scrollBlock: "start-if-hidden",
            fromCursor: true,
            referenceIndex,
            expandIfClipped: Boolean(reference || definition),
            autoExpandSource: "sync",
          });
        }
      }
    }

    suppressCursorSyncFromSidebarJump() {
      this.suppressCursorSyncUntil = Date.now() + SIDEBAR_JUMP_CURSOR_SUPPRESS_MS;
    }

    hideActiveDeleteNotice() {
      if (this.activeDeleteNotice && typeof this.activeDeleteNotice.hide === "function") {
        this.activeDeleteNotice.hide();
      }
      this.activeDeleteNotice = null;
    }

    getActiveDeletedFootnoteRecords(file) {
      if (!file) return [];
      const records = this.recentlyDeletedFootnotesByFile.get(file.path);
      if (!Array.isArray(records) || records.length === 0) return [];
      const now = Date.now();
      const activeRecords = records.filter((record) => record.expiresAt > now);
      if (activeRecords.length !== records.length) {
        if (activeRecords.length > 0) {
          this.recentlyDeletedFootnotesByFile.set(file.path, activeRecords);
        } else {
          this.recentlyDeletedFootnotesByFile.delete(file.path);
        }
      }
      return activeRecords;
    }

    rememberDeletedFootnote(file, footnote) {
      if (!file || !footnote) return;
      const records = this.getActiveDeletedFootnoteRecords(file);
      records.push({
        id: String(footnote.id),
        snapshot: createFootnoteSnapshot(footnote),
        expiresAt: Date.now() + DELETED_FOOTNOTE_RESTORE_TTL_MS,
      });
      const activeRecords = records
        .filter((record) => record.expiresAt > Date.now())
        .slice(-MAX_DELETED_FOOTNOTE_RESTORE_RECORDS);
      this.recentlyDeletedFootnotesByFile.set(file.path, activeRecords);
    }

    matchesRecentlyDeletedFootnote(file, footnote) {
      if (!file || !footnote) return false;
      return this.getActiveDeletedFootnoteRecords(file).some((record) => {
        return deletedFootnoteRecordMatchesFootnote(record, footnote);
      });
    }

    suppressRestoredDeletedFootnoteCursorSync(file, footnoteId) {
      if (!file || !footnoteId) return;
      const suppressions = this.restoredDeletedFootnoteCursorSuppressionsByFile.get(file.path) || new Map();
      suppressions.set(String(footnoteId), Date.now() + RESTORED_DELETED_FOOTNOTE_CURSOR_SUPPRESS_MS);
      this.restoredDeletedFootnoteCursorSuppressionsByFile.set(file.path, suppressions);
    }

    shouldSuppressRestoredDeletedFootnoteCursorSync(file, footnoteId) {
      if (!file || !footnoteId) return false;
      const suppressions = this.restoredDeletedFootnoteCursorSuppressionsByFile.get(file.path);
      if (!suppressions) return false;
      const now = Date.now();
      for (const [id, expiresAt] of Array.from(suppressions.entries())) {
        if (expiresAt <= now) suppressions.delete(id);
      }
      if (suppressions.size === 0) {
        this.restoredDeletedFootnoteCursorSuppressionsByFile.delete(file.path);
        return false;
      }
      return (suppressions.get(String(footnoteId)) || 0) > now;
    }

    consumeRestoredDeletedFootnote(file, footnote) {
      if (!file || !footnote) return false;
      const activeRecords = this.getActiveDeletedFootnoteRecords(file);
      if (activeRecords.length === 0) return false;
      const matchIndex = activeRecords.findIndex((record) => {
        return deletedFootnoteRecordMatchesFootnote(record, footnote);
      });
      const matched = matchIndex >= 0;
      if (matched) {
        activeRecords.splice(matchIndex, 1);
        this.suppressRestoredDeletedFootnoteCursorSync(file, footnote.id);
      }
      if (activeRecords.length > 0) {
        this.recentlyDeletedFootnotesByFile.set(file.path, activeRecords);
      } else {
        this.recentlyDeletedFootnotesByFile.delete(file.path);
      }
      return matched;
    }

    getTidyFootnotesCommandId() {
      const configuredId = String(this.settings?.tidyCommandId || "").trim();
      if (configuredId) return configuredId;

      const commands = this.app.commands?.commands || {};
      const candidates = Object.entries(commands).filter(([id, command]) => {
        const haystack = `${id} ${command?.name || ""}`.toLowerCase();
        return haystack.includes("tidy") && haystack.includes("footnote");
      });
      candidates.sort(([leftId, leftCommand], [rightId, rightCommand]) => {
        const left = `${leftId} ${leftCommand?.name || ""}`.toLowerCase();
        const right = `${rightId} ${rightCommand?.name || ""}`.toLowerCase();
        const leftScore = (leftId.toLowerCase().includes("tidy") ? 2 : 0) + (leftId.toLowerCase().includes("footnote") ? 2 : 0);
        const rightScore = (rightId.toLowerCase().includes("tidy") ? 2 : 0) + (rightId.toLowerCase().includes("footnote") ? 2 : 0);
        if (leftScore !== rightScore) return rightScore - leftScore;
        return left.localeCompare(right);
      });
      return candidates[0]?.[0] || "";
    }

    scheduleTidyFootnotesForNewFootnote(file, footnote) {
      if (!this.settings?.autoTidyAfterNewFootnote || !file || !footnote) return;
      const key = `${file.path}:new:${footnote.id}:${footnote.firstReferenceStart ?? footnote.definitionStart}`;
      if (this.pendingTidyKeys.has(key)) return;
      this.pendingTidyKeys.add(key);
      this.dismissObsidianFootnotePopovers();
      window.setTimeout(() => {
        this.pendingTidyKeys.delete(key);
        this.dismissObsidianFootnotePopovers();
        this.runTidyFootnotes(file);
        this.dismissObsidianFootnotePopovers();
        this.refreshViews(file);
      }, AUTO_TIDY_DELAY_MS);
    }

    dismissObsidianFootnotePopovers() {
      if (typeof document === "undefined") return;
      const createEscapeEvent = () => new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
      });
      document.activeElement?.dispatchEvent?.(createEscapeEvent());
      document.dispatchEvent(createEscapeEvent());

      const selectors = [
        ".hover-popover",
        ".popover.hover-popover",
        ".mod-popover",
        ".footnote-popover",
        ".cm-tooltip.cm-tooltip-hover",
      ];
      for (const popover of document.querySelectorAll(selectors.join(","))) {
        if (popover.closest?.(".better-footnote")) continue;
        if (typeof popover.detach === "function") {
          popover.detach();
        } else {
          popover.remove();
        }
      }
    }

    runTidyFootnotes(file = null) {
      const strings = getStrings();
      const commandId = this.getTidyFootnotesCommandId();
      const command = commandId ? this.app.commands?.commands?.[commandId] : null;
      if (!command) {
        if (!this.tidyMissingNoticeShown) {
          this.tidyMissingNoticeShown = true;
          new Notice(strings.tidyCommandMissing);
        }
        return false;
      }

      try {
        // Never fall back to whichever note happens to be active: Tidy rewrites
        // the whole document, so a missing editor means a notice, not a guess.
        const markdownView = this.findMarkdownViewForFile(file);
        if (command.editorCallback) {
          if (!markdownView?.editor) {
            new Notice(strings.tidyCommandNoEditor);
            return false;
          }
          command.editorCallback(markdownView.editor, markdownView);
          return true;
        }
        this.app.commands.executeCommandById(commandId);
        return true;
      } catch (error) {
        new Notice(t(strings, "tidyCommandFailed", { message: error.message || String(error) }));
        return false;
      }
    }

    trackCurrentMarkdownFile() {
      const markdownView = this.getActiveMarkdownView();
      if (isMarkdownFile(markdownView?.file)) {
        this.lastMarkdownFile = markdownView.file;
        return this.lastMarkdownFile;
      }
      const activeFile = this.app.workspace.getActiveFile();
      if (isMarkdownFile(activeFile)) {
        this.lastMarkdownFile = activeFile;
      }
      return this.lastMarkdownFile;
    }

    getCurrentMarkdownFile() {
      return this.trackCurrentMarkdownFile();
    }

    getActiveMarkdownView() {
      // Deliberately not filtered by isMarkdownViewSettled: the sidebar must
      // follow the new note immediately. Reads go through getTextForFile, which
      // refuses a loading view, and writes target the card's own note.
      return this.app.workspace.getActiveViewOfType(MarkdownView);
    }

    isMarkdownViewSettled(view) {
      // While a leaf swaps files, Obsidian sets view.file to the new note before
      // the new text has been read, so the editor still holds the previous
      // note (or nothing). WorkspaceLeaf.working is true for exactly that span
      // (stable across 1.8 to 1.13); a missing flag counts as settled.
      return view?.leaf?.working !== true;
    }

    findMarkdownViewForFile(file) {
      if (!file) return null;
      let found = null;
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (
          !found
          && leaf.view instanceof MarkdownView
          && leaf.view.file?.path === file.path
          && this.isMarkdownViewSettled(leaf.view)
        ) {
          found = leaf.view;
        }
      });
      return found;
    }

    async getTextForFile(file) {
      // A view that is still loading this file is filtered out above, so the
      // text then comes from disk instead of a stale editor buffer.
      const markdownView = this.findMarkdownViewForFile(file);
      if (markdownView?.editor && typeof markdownView.editor.getValue === "function") {
        return normalizeLineEndings(markdownView.editor.getValue());
      }
      return normalizeLineEndings(await this.app.vault.cachedRead(file));
    }

    describeSaveResult(result, id, strings) {
      if (result.reason === "already-current") {
        return { ok: true, message: strings.saved, content: result.content };
      }
      if (result.reason === "content-mismatch") {
        return { ok: false, conflict: true, message: strings.saveConflictStatus };
      }
      return { ok: false, message: t(strings, "footnoteNotFound", { id }) };
    }

    async saveFootnote(file, id, content, expectedContent) {
      const strings = getStrings();
      if (!file) {
        return { ok: false, message: strings.noActiveFileSave };
      }

      const markdownView = this.findMarkdownViewForFile(file);
      if (markdownView?.editor && typeof markdownView.editor.getValue === "function") {
        const editor = markdownView.editor;
        const text = normalizeLineEndings(editor.getValue());
        const result = replaceFootnoteContent(text, id, content, { expectedContent });
        if (!result.changed) {
          return this.describeSaveResult(result, id, strings);
        }
        const from = editorPositionFromOffset(editor, text, result.start);
        const to = editorPositionFromOffset(editor, text, result.end);
        this.suppressEditStamp = true;
        try {
          editor.replaceRange(result.block, from, to);
        } finally {
          this.suppressEditStamp = false;
        }
        // The next baseline is what actually landed (editor extensions may
        // rewrite a transaction), not what was sent.
        const after = parseFootnotes(normalizeLineEndings(editor.getValue())).footnotes
          .find((item) => item.id === id);
        return { ok: true, message: strings.saved, content: after ? after.content : result.content };
      }

      // No settled editor holds the note: write through the vault. vault.process
      // serialises with Obsidian's own writes and reads/compares/writes in one
      // step; returning the input unchanged performs no write at all.
      let outcome = null;
      const apply = (data) => {
        outcome = replaceFootnoteContent(data, id, content, { expectedContent });
        return outcome.changed ? outcome.text : data;
      };
      if (typeof this.app.vault.process === "function") {
        await this.app.vault.process(file, apply);
      } else {
        const next = apply(await this.app.vault.read(file));
        if (outcome.changed) await this.app.vault.modify(file, next);
      }
      if (!outcome.changed) {
        return this.describeSaveResult(outcome, id, strings);
      }
      return { ok: true, message: strings.saved, content: outcome.content };
    }

    getDeleteFootnoteDetails(file, footnoteId) {
      const strings = getStrings();
      const markdownView = this.findMarkdownViewForFile(file);
      const editor = markdownView?.editor;
      if (!editor || typeof editor.getValue !== "function") {
        return { ok: false, message: strings.deleteNeedsEditor };
      }
      const result = deleteFootnoteFromText(editor.getValue(), footnoteId);
      if (!result.changed) {
        return { ok: false, message: t(strings, "footnoteNotFound", { id: footnoteId }) };
      }
      return {
        ok: true,
        id: footnoteId,
        referenceCount: result.referenceCount,
        contentIsBlank: result.contentIsBlank,
      };
    }

    confirmDeleteFootnote(file, footnoteId) {
      this.suppressCursorSyncFromSidebarJump();
      const details = this.getDeleteFootnoteDetails(file, footnoteId);
      if (!details.ok) {
        new Notice(details.message);
        return;
      }
      new ConfirmDeleteFootnoteModal(this.app, details, () => {
        this.suppressCursorSyncFromSidebarJump();
        this.deleteFootnoteFromEditor(file, footnoteId);
      }, () => {
        this.suppressCursorSyncFromSidebarJump();
      }).open();
    }

    deleteFootnoteFromEditor(file, footnoteId) {
      const strings = getStrings();
      const markdownView = this.findMarkdownViewForFile(file);
      const editor = markdownView?.editor;
      if (!editor || typeof editor.getValue !== "function") {
        new Notice(strings.deleteNeedsEditor);
        return false;
      }

      try {
        const text = normalizeLineEndings(editor.getValue());
        const result = deleteFootnoteFromText(text, footnoteId);
        if (!result.changed) {
          new Notice(t(strings, "footnoteNotFound", { id: footnoteId }));
          return false;
        }
        if (!this.applyEditorDeleteTransaction(editor, text, result.ranges)) {
          new Notice(strings.deleteNeedsEditor);
          return false;
        }
        this.rememberDeletedFootnote(file, result.footnote);
        this.suppressCursorSyncFromSidebarJump();
        this.focusMarkdownEditor(markdownView);
        this.refreshViews(file);
        this.showFootnoteDeletedNotice(footnoteId);
        return true;
      } catch (error) {
        new Notice(t(strings, "deleteFailed", { message: error.message || String(error) }));
        return false;
      }
    }

    applyEditorDeleteTransaction(editor, text, ranges) {
      const changes = normalizeDeleteRanges(ranges, text.length);
      if (changes.length === 0) return false;
      if (typeof editor.transaction === "function") {
        editor.transaction({
          changes: changes.map((range) => ({
            from: editorPositionFromOffset(editor, text, range.start),
            to: editorPositionFromOffset(editor, text, range.end),
            text: "",
          })),
        });
        return true;
      }
      const cm = editor.cm;
      if (cm && typeof cm.dispatch === "function") {
        cm.dispatch({
          changes: changes.map((range) => ({
            from: range.start,
            to: range.end,
            insert: "",
          })),
        });
        return true;
      }
      return false;
    }

    focusMarkdownEditor(markdownView) {
      const editor = markdownView?.editor;
      if (editor && typeof editor.focus === "function") {
        editor.focus();
        return true;
      }
      return false;
    }

    showFootnoteDeletedNotice(footnoteId) {
      const strings = getStrings();
      this.hideActiveDeleteNotice();
      const notice = new Notice(t(strings, "deletedFootnote", {
        id: footnoteId,
        shortcut: getUndoShortcutLabel(),
      }), 10000);
      this.activeDeleteNotice = notice;
    }

    jumpToFootnoteReference(file, footnoteId, options = {}) {
      const strings = getStrings();
      const markdownView = this.findMarkdownViewForFile(file);
      if (!markdownView?.editor) {
        new Notice(strings.openSourceForReference);
        return false;
      }
      const text = normalizeLineEndings(markdownView.editor.getValue());
      const parsed = parseFootnotes(text);
      const footnote = parsed.footnotes.find((item) => item.id === footnoteId);
      const referenceIndex = normalizeReferenceIndex(footnote, options.referenceIndex);
      const reference = footnote?.references?.[referenceIndex] || null;
      if (!reference) {
        new Notice(t(strings, "noReferenceFound", { id: footnoteId }));
        return false;
      }
      return this.focusEditorAtRange(markdownView, reference.start, reference.end, options);
    }

    jumpToFootnoteDefinition(file, footnoteId, options = {}) {
      const strings = getStrings();
      const markdownView = this.findMarkdownViewForFile(file);
      if (!markdownView?.editor) {
        new Notice(strings.openSourceForDefinition);
        return false;
      }
      const text = normalizeLineEndings(markdownView.editor.getValue());
      const parsed = parseFootnotes(text);
      const footnote = parsed.footnotes.find((item) => item.id === footnoteId);
      if (!footnote) {
        new Notice(t(strings, "footnoteNotFound", { id: footnoteId }));
        return false;
      }
      return this.focusEditorAtRange(markdownView, footnote.contentStart, footnote.contentStart, options);
    }

    focusEditorAtRange(markdownView, startOffset, endOffset = startOffset, options = {}) {
      const editor = markdownView?.editor;
      if (!editor || typeof editor.getValue !== "function") return false;
      const text = normalizeLineEndings(editor.getValue());
      const from = editorPositionFromOffset(editor, text, startOffset);
      const to = editorPositionFromOffset(editor, text, endOffset);

      if (options.flash && endOffset > startOffset) {
        this.flashEditorRange(editor, startOffset, endOffset, from, to);
        editor.setCursor(from);
      } else {
        editor.setCursor(from);
      }

      if (typeof editor.scrollIntoView === "function") {
        editor.scrollIntoView({ from, to }, true);
      }
      if (options.focus !== false && typeof editor.focus === "function") {
        editor.focus();
      }
      return true;
    }

    flashEditorRange(editor, startOffset, endOffset, from, to) {
      const cm = editor?.cm;
      if (cm && footnoteReferenceHighlightField && flashFootnoteReferenceEffect && clearFootnoteReferenceEffect) {
        cm.dispatch({
          effects: flashFootnoteReferenceEffect.of({ from: startOffset, to: endOffset }),
        });
        if (this.flashSelectionTimer !== null) {
          window.clearTimeout(this.flashSelectionTimer);
        }
        this.flashSelectionTimer = window.setTimeout(() => {
          this.flashSelectionTimer = null;
          try {
            cm.dispatch({ effects: clearFootnoteReferenceEffect.of(null) });
          } catch (_error) {
            // The editor may have been closed before the highlight expires.
          }
        }, FLASH_SELECTION_MS);
        return true;
      }

      if (typeof editor?.setSelection === "function") {
        editor.setSelection(from, to);
        if (this.flashSelectionTimer !== null) {
          window.clearTimeout(this.flashSelectionTimer);
        }
        this.flashSelectionTimer = window.setTimeout(() => {
          this.flashSelectionTimer = null;
          if (document.activeElement?.closest?.(".better-footnote")) {
            editor.setCursor(to);
          }
        }, FLASH_SELECTION_MS);
      }
      return false;
    }
  }

  class BetterFootnoteSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
      super(app, plugin);
      this.plugin = plugin;
    }

    display() {
      const strings = getStrings();
      this.containerEl.empty();
      this.containerEl.createEl("h2", { text: strings.settingsTitle });

      new Setting(this.containerEl)
        .setName(strings.renderMarkdownName)
        .setDesc(strings.renderMarkdownDesc)
        .addToggle((toggle) => {
          toggle
            .setValue(Boolean(this.plugin.settings.renderMarkdownInSidebar))
            .onChange(async (value) => {
              this.plugin.settings.renderMarkdownInSidebar = Boolean(value);
              await this.plugin.saveSettings();
              this.plugin.refreshViews();
            });
        });

      new Setting(this.containerEl)
        .setName(strings.countModeName)
        .setDesc(strings.countModeDesc)
        .addDropdown((dropdown) => {
          dropdown
            .addOption("auto", strings.countModeAuto)
            .addOption("characters", strings.countModeCharacters)
            .addOption("words", strings.countModeWords)
            .setValue(normalizeCountMode(this.plugin.settings.countMode))
            .onChange(async (value) => {
              this.plugin.settings.countMode = normalizeCountMode(value);
              await this.plugin.saveSettings();
              this.plugin.refreshViews();
            });
        });

      new Setting(this.containerEl)
        .setName(strings.autoTidyName)
        .setDesc(strings.autoTidyDesc)
        .addToggle((toggle) => {
          toggle
            .setValue(Boolean(this.plugin.settings.autoTidyAfterNewFootnote))
            .onChange(async (value) => {
              this.plugin.settings.autoTidyAfterNewFootnote = value;
              await this.plugin.saveSettings();
            });
        });

      new Setting(this.containerEl)
        .setName(strings.tidyInstallName)
        .setDesc(strings.tidyInstallDesc)
        .addButton((button) => {
          button
            .setButtonText(strings.tidyInstallButton)
            .onClick(() => {
              window.open(TIDY_FOOTNOTES_PLUGIN_URL);
            });
        });

    }
  }

  class BetterFootnoteView extends ItemView {
    constructor(leaf, plugin) {
      super(leaf);
      this.plugin = plugin;
      this.file = null;
      this.renderTimer = null;
      this.pendingRender = false;
      this.saveTimers = new Map();
      this.stateByFile = new Map();
      this.activeFootnoteId = null;
      this.listEl = null;
      this.subtitleEl = null;
      this.searchInputEl = null;
      this.clearSearchButton = null;
      this.resumeSearchButton = null;
      this.searchCountEl = null;
      this.searchPreviousButton = null;
      this.searchNextButton = null;
      this.currentFootnotes = [];
      this.searchPaused = false;
      this.searchMatches = [];
      this.searchMatchIndex = -1;
      this.pausedSearchMatchIndex = -1;
      this.suppressTextareaFocusJump = false;
      this.expandedFootnoteIds = new Set();
      this.searchExpandedFootnoteIds = new Set();
      this.syncExpandedFootnoteIds = new Set();
      this.editingFootnoteId = null;
      this.renderGeneration = 0;
      this.markdownRenderComponents = [];
      this.markdownRenderCache = createLruCache({ maxEntries: 200 });
      this.renderCacheFilePath = "";
      this.pointerDownInside = false;
      this.pendingEditExitFootnoteId = null;
      this.liveEditor = null;
      // itemEl -> { file, footnote }. A card remembers the note it was built
      // from, so a save can never be redirected by the sidebar moving on to
      // another note while the write is still pending.
      this.cardTargets = new WeakMap();
    }

    formatFootnoteCountForDisplay(text, strings = getStrings()) {
      return formatFootnoteCount(text, this.plugin.settings?.countMode || "auto", strings);
    }

    getViewType() {
      return VIEW_TYPE;
    }

    getDisplayText() {
      return getStrings().title;
    }

    getIcon() {
      return PLUGIN_ICON;
    }

    async onOpen() {
      this.plugin.registerFootnoteView(this);
      this.contentEl.addClass("better-footnote");
      this.registerDomEvent(this.contentEl, "pointerdown", () => {
        this.pointerDownInside = true;
      });
      const releasePointer = () => {
        if (!this.pointerDownInside) return;
        this.pointerDownInside = false;
        const pendingExitId = this.pendingEditExitFootnoteId;
        if (pendingExitId) {
          window.setTimeout(() => {
            if (this.pendingEditExitFootnoteId !== pendingExitId) return;
            if (this.pointerDownInside) return;
            this.pendingEditExitFootnoteId = null;
            const item = this.findFootnoteItem(pendingExitId);
            const editorEl = item?.querySelector(".bfw-editor");
            if (editorEl && document.activeElement === editorEl) return;
            const live = this.liveEditor;
            if (live && live.footnoteId === pendingExitId && live.host.contains(document.activeElement)) return;
            const anchorItem = this.activeFootnoteId ? this.findFootnoteItem(this.activeFootnoteId) : null;
            const anchorTopBefore = anchorItem ? anchorItem.getBoundingClientRect().top : null;
            this.finishEditExit(pendingExitId);
            if (anchorItem && anchorTopBefore !== null && this.listEl) {
              const delta = anchorItem.getBoundingClientRect().top - anchorTopBefore;
              if (delta !== 0) {
                this.listEl.scrollTop += delta;
              }
            }
          }, 40);
        }
        if (this.pendingRender) {
          this.pendingRender = false;
          this.scheduleRender();
        }
      };
      this.registerDomEvent(document, "pointerup", releasePointer);
      this.registerDomEvent(document, "pointercancel", releasePointer);
      this.registerDomEvent(window, "blur", releasePointer);
      this.scheduleRender(0);
    }

    async onClose() {
      this.captureState();
      // Pending plain-editor saves are written now rather than dropped; the
      // live card, if any, is flushed by its own teardown below.
      for (const footnoteId of Array.from(this.saveTimers.keys())) {
        if (this.liveEditor?.footnoteId === footnoteId) continue;
        const item = this.findFootnoteItem(footnoteId);
        const textarea = item?.querySelector(".bfw-editor");
        const statusEl = item?.querySelector(".bfw-status");
        if (!item || !textarea || !statusEl) continue;
        this.flushSave(footnoteId, textarea.value, statusEl, item);
      }
      for (const timer of this.saveTimers.values()) {
        window.clearTimeout(timer);
      }
      this.saveTimers.clear();
      if (this.renderTimer !== null) {
        window.clearTimeout(this.renderTimer);
      }
      this.invalidateRenderedArtifacts(null);
      this.markdownRenderCache.clear();
      this.plugin.unregisterFootnoteView(this);
    }

    scheduleRender(delay = RENDER_DELAY_MS) {
      if (this.isEditing()) {
        this.pendingRender = true;
        return;
      }
      if (this.renderTimer !== null) {
        window.clearTimeout(this.renderTimer);
      }
      this.renderTimer = window.setTimeout(() => {
        this.renderTimer = null;
        this.render();
      }, delay);
    }

    isEditing() {
      if (document.activeElement?.classList?.contains("bfw-editor")) return true;
      const live = this.liveEditor;
      if (live) {
        if (!live.host.isConnected) {
          // Self-heal: a stale live editor must never keep the render gate shut.
          this.teardownLiveEditor();
          return false;
        }
        if (live.host.contains(document.activeElement)) return true;
      }
      return false;
    }

    isMarkdownRenderingEnabled() {
      return Boolean(this.plugin.settings?.renderMarkdownInSidebar)
        && Boolean(MarkdownRenderer?.render || MarkdownRenderer?.renderMarkdown);
    }

    invalidateRenderedArtifacts(file) {
      // Single choke point: every rebuild pipeline (render(), renderFootnoteList,
      // file switches, onClose) passes through here, so the live editor is always
      // torn down in an orderly way before its DOM disappears.
      this.teardownLiveEditor();
      this.renderGeneration += 1;
      for (const component of this.markdownRenderComponents) {
        try {
          component.unload();
        } catch (_error) {
          // The component may already be unloaded.
        }
      }
      this.markdownRenderComponents = [];
      const path = file?.path || "";
      if (path !== this.renderCacheFilePath) {
        this.editingFootnoteId = null;
        // Leaving for a non-Markdown view (file === null) keeps the previous
        // note's cache so coming back restores the scroll position against
        // already-sized cards; switching to another note still clears it.
        if (file) {
          this.renderCacheFilePath = path;
          this.markdownRenderCache.clear();
        }
      }
    }

    getMeasurableContentEl(item) {
      if (!item) return null;
      return item.querySelector(".bfw-rendered")
        || item.querySelector(".bfw-live-host")
        || item.querySelector(".bfw-editor");
    }

    hasHiddenContent(el) {
      if (!el) return false;
      if (el.tagName === "TEXTAREA") {
        return this.hasHiddenTextareaContent(el);
      }
      return el.scrollHeight > el.clientHeight + CLIPPED_CONTENT_TOLERANCE_PX;
    }

    renderMarkdownIntoContainer(container, content, onReady) {
      const component = new Component();
      component.load();
      this.markdownRenderComponents.push(component);
      const generation = this.renderGeneration;
      const sourcePath = this.file?.path || "";
      const renderCall = MarkdownRenderer?.render
        ? MarkdownRenderer.render(this.plugin.app, content, container, sourcePath, component)
        : MarkdownRenderer.renderMarkdown(content, container, sourcePath, component);
      Promise.resolve(renderCall).then(() => {
        if (generation !== this.renderGeneration) return;
        this.markdownRenderCache.set(content, container);
        onReady?.();
      }).catch(() => {
        // Rendering errors leave the card blank; editing still works.
      });
    }

    mountRenderedContent(itemEl, textarea, footnoteId, content, onReady) {
      const normalizedContent = normalizeLineEndings(content ?? "");
      const renderedEl = document.createElement("div");
      renderedEl.className = "bfw-rendered markdown-rendered";
      renderedEl.dataset.footnoteId = footnoteId;
      textarea.insertAdjacentElement("beforebegin", renderedEl);
      itemEl.addClass("is-rendered");
      const cached = this.markdownRenderCache.get(normalizedContent);
      if (cached) {
        renderedEl.appendChild(cached.cloneNode(true));
        onReady?.();
      } else {
        const container = document.createElement("div");
        container.className = "bfw-rendered-inner";
        renderedEl.appendChild(container);
        this.renderMarkdownIntoContainer(container, normalizedContent, onReady);
      }
      renderedEl.addEventListener("click", (event) => {
        if (event.target?.closest?.("a")) return;
        event.preventDefault();
        event.stopPropagation();
        this.enterFootnoteEditMode(footnoteId, this.caretContextFromPoint(event));
      });
      return renderedEl;
    }

    enterFootnoteEditMode(footnoteId, caret = null, options = {}) {
      if (!this.isMarkdownRenderingEnabled()) return;
      this.editingFootnoteId = footnoteId;
      const item = this.findFootnoteItem(footnoteId);
      if (!item) return;
      item.querySelector(".bfw-rendered")?.remove();
      item.removeClass("is-rendered");
      const textarea = item.querySelector(".bfw-editor");
      if (!textarea) return;
      if (this.liveEditor && this.liveEditor.footnoteId !== footnoteId) {
        // Full synchronous exit, not a bare teardown: the previous card must go
        // straight back to its rendered state within this same task (no raw
        // source flash) and the card being entered must not move on screen.
        this.exitLiveEditedFootnote({ anchorFootnoteId: footnoteId });
      }
      // Search locate sessions stay on the textarea path: their read-only
      // selection mechanics were settled in 1.5.1 and are not migrated yet.
      if (!options.searchSession && this.tryMountLiveEditor(item, textarea, footnoteId, caret)) {
        return;
      }
      textarea.readOnly = false;
      this.applyTextareaHeight(textarea, this.isFootnoteExpanded(footnoteId));
      textarea.focus();
      const value = textarea.value;
      let position = value.length;
      if (caret) {
        const approximate = approximateSourceOffsetFromClick(value, caret.contextText, caret.offsetInContext);
        if (typeof approximate === "number") {
          position = Math.max(0, Math.min(value.length, approximate));
        }
      }
      try {
        textarea.setSelectionRange(position, position);
      } catch (_error) {
        // Some input states do not expose a selectable range.
      }
    }

    finishEditExit(footnoteId) {
      if (this.isMarkdownRenderingEnabled() || this.liveEditor?.footnoteId === footnoteId) {
        this.exitFootnoteEditMode(footnoteId);
      } else if (this.syncExpandedFootnoteIds.has(footnoteId)) {
        this.setFootnoteExpanded(footnoteId, false);
      }
    }

    exitFootnoteEditMode(footnoteId) {
      if (this.editingFootnoteId === footnoteId) {
        this.editingFootnoteId = null;
      }
      // The live editor must be dismantled even when the rendering setting was
      // toggled off mid-edit; teardown is deliberately not gated by it.
      if (this.liveEditor?.footnoteId === footnoteId) {
        this.teardownLiveEditor();
      }
      if (!this.isMarkdownRenderingEnabled()) return;
      const item = this.findFootnoteItem(footnoteId);
      if (!item || item.querySelector(".bfw-rendered")) return;
      const textarea = item.querySelector(".bfw-editor");
      if (!textarea) return;
      if (this.syncExpandedFootnoteIds.has(footnoteId)) {
        this.setFootnoteExpanded(footnoteId, false);
      }
      const expandButton = item.querySelector(".bfw-expand-button");
      this.mountRenderedContent(item, textarea, footnoteId, textarea.value, () => {
        if (expandButton) {
          this.updateExpandButtonVisibility(this.getMeasurableContentEl(item), expandButton, footnoteId);
        }
      });
    }

    applyEditSurfaceFocus(footnoteId, measurableEl) {
      if (this.suppressTextareaFocusJump) {
        this.focusFootnote(footnoteId, { scroll: false, focusEditor: false });
        return false;
      }
      this.activateFootnoteFromSidebar(footnoteId, { selectSearchMatch: false });
      if (!this.isFootnoteExpanded(footnoteId) && this.hasHiddenContent(measurableEl)) {
        this.setFootnoteExpanded(footnoteId, true, { source: "sync" });
      }
      return true;
    }

    applyEditSurfaceInput(footnoteId, value, els) {
      els.itemEl.addClass("is-dirty");
      els.countEl?.setText(this.formatFootnoteCountForDisplay(value, els.strings));
      els.statusEl?.setText(els.strings.saving);
      this.queueSave(footnoteId, value, els.statusEl, els.itemEl);
    }

    handleEditSurfaceBlur(footnoteId, value, statusEl, itemEl, stillFocusedFn) {
      this.flushSave(footnoteId, value, statusEl, itemEl).finally(() => {
        const windowFocused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
        if (windowFocused && !stillFocusedFn()) {
          if (this.pointerDownInside) {
            this.pendingEditExitFootnoteId = footnoteId;
          } else {
            this.finishEditExit(footnoteId);
          }
        }
        if (this.pendingRender) {
          this.pendingRender = false;
          this.scheduleRender();
        }
      });
    }

    resetHijackedActiveEditor(controller) {
      // Data-safety guard (1.5.4 incident): while the embedded editor holds
      // workspace.activeEditor, the app-wide contract lies ("file = the real
      // note, editor = a one-footnote buffer") and any consumer that writes an
      // active editor's content back to its file can wipe the note. Guarded
      // CAS-style reset; takes the controller by value so that stale timers
      // can still sweep after this.liveEditor has moved on.
      try {
        const workspace = this.plugin.app.workspace;
        if (workspace.activeEditor === controller) {
          workspace.activeEditor = null;
        }
      } catch (_error) {
        // The workspace may itself be tearing down.
      }
    }

    scheduleHijackSweep(controller) {
      // The internal editor may assign activeEditor via setTimeout (Kanban's
      // own recipe does), so synchronous resets alone can be outrun. A single
      // 0ms sweep can still lose the timer race against the assignment (N33
      // watchdog observed ~20-100ms windows under load), hence a short chain.
      for (const delay of [0, 60, 180]) {
        window.setTimeout(() => this.resetHijackedActiveEditor(controller), delay);
      }
    }

    tryMountLiveEditor(item, textarea, footnoteId, caret) {
      if (!this.plugin.isLivePreviewEditorAvailable()) return false;
      const resolution = this.plugin.resolveInternalMarkdownEditorClass();
      if (!resolution.ok) return false;
      this.teardownLiveEditor();
      const host = document.createElement("div");
      host.className = "bfw-live-host";
      let instance = null;
      let controller = null;
      let sentinel = null;
      let releaseController = null;
      try {
        const app = this.plugin.app;
        const file = this.file;
        let released = false;
        controller = {
          app,
          showSearch: () => {},
          toggleMode: () => {},
          onMarkdownScroll: () => {},
          getMode: () => "source",
          scroll: 0,
          editMode: null,
          get editor() {
            return instance?.editor;
          },
          // Fixed snapshot on purpose: resolving through getActiveFile() recurses
          // once the workspace points activeEditor back at this controller.
          // After teardown the controller is neutered (released): a dangling
          // reference captured by third parties has no file left to write to.
          get file() {
            return released ? null : file;
          },
          get path() {
            return released ? "" : file?.path ?? "";
          },
        };
        releaseController = () => {
          released = true;
        };
        instance = new resolution.EditorClass(app, host, controller);
        this.addChild(instance);
        controller.editMode = instance;
        if (!instance.cm || !instance.editor) {
          throw new Error("embedded editor is missing its editing surface");
        }
        textarea.insertAdjacentElement("beforebegin", host);
        item.addClass("is-live");
        instance.set(textarea.value);
        const live = {
          instance,
          host,
          controller,
          releaseController,
          footnoteId,
          textarea,
          itemEl: item,
          isTearingDown: false,
          hijackSentinel: null,
        };
        this.liveEditor = live;
        // Path-independent guarantee while mounted: whatever internal code
        // path assigns activeEditor (sync, setTimeout, composition handlers),
        // the sentinel sweeps it within 90 ms — tighter than the 100 ms
        // hijack-exposure veto line in the N33 protocol. Cleared in teardown.
        sentinel = window.setInterval(() => this.resetHijackedActiveEditor(controller), 90);
        live.hijackSentinel = sentinel;
        this.attachLiveEditorEvents(live);
        instance.cm.focus();
        const value = textarea.value;
        let position = value.length;
        if (caret) {
          const approximate = approximateSourceOffsetFromClick(value, caret.contextText, caret.offsetInContext);
          if (typeof approximate === "number") {
            position = Math.max(0, Math.min(value.length, approximate));
          }
        }
        try {
          instance.cm.dispatch({ selection: { anchor: Math.min(position, instance.cm.state.doc.length) } });
        } catch (_error) {
          // A rejected selection leaves the caret at the start; editing still works.
        }
        this.resetHijackedActiveEditor(controller);
        this.scheduleHijackSweep(controller);
        return true;
      } catch (error) {
        console.warn("Better Footnote: live editor mount failed, falling back to plain text editing.", error);
        this.plugin.disableLivePreviewEditorForSession("mount");
        this.liveEditor = null;
        if (sentinel !== null) {
          window.clearInterval(sentinel);
        }
        if (controller) {
          this.resetHijackedActiveEditor(controller);
          this.scheduleHijackSweep(controller);
        }
        try {
          if (instance) this.removeChild(instance);
        } catch (_error) {
          // The instance may not have been attached yet.
        }
        try {
          // Neuter only after the instance is unloaded, mirroring teardown order.
          releaseController?.();
        } catch (_inner) {
          // Neutering is best-effort.
        }
        host.remove();
        item.removeClass("is-live");
        return false;
      }
    }

    attachLiveEditorEvents(live) {
      const strings = getStrings();
      const { instance, host, footnoteId, textarea, itemEl } = live;
      const countEl = itemEl.querySelector(".bfw-count");
      const statusEl = itemEl.querySelector(".bfw-status");
      const expandButton = itemEl.querySelector(".bfw-expand-button");
      const readLiveValue = () => normalizeLineEndings(instance.cm.state.doc.toString());
      const mirror = () => {
        const value = readLiveValue();
        textarea.value = value;
        return value;
      };
      live.mirror = mirror;
      instance.cm.dispatch({
        effects: StateEffect.appendConfig.of(
          EditorView.updateListener.of((update) => {
            // Unconditional guard first: CM emits updates on focus/selection
            // changes too, making this a free extra sweep of the hijack.
            this.resetHijackedActiveEditor(live.controller);
            if (!update.docChanged || live.isTearingDown) return;
            const value = mirror();
            this.applyEditSurfaceInput(footnoteId, value, { itemEl, countEl, statusEl, strings });
            this.updateExpandButtonVisibility(host, expandButton, footnoteId, strings);
          })
        ),
      });
      host.addEventListener("focusin", () => {
        this.resetHijackedActiveEditor(live.controller);
        this.scheduleHijackSweep(live.controller);
        if (live.isTearingDown) return;
        this.applyEditSurfaceFocus(footnoteId, host);
      });
      host.addEventListener("focusout", (event) => {
        this.resetHijackedActiveEditor(live.controller);
        this.scheduleHijackSweep(live.controller);
        if (live.isTearingDown) return;
        const next = event.relatedTarget;
        if (next && host.contains(next)) return;
        window.setTimeout(() => {
          if (live.isTearingDown || this.liveEditor !== live) return;
          if (host.contains(document.activeElement)) return;
          this.handleEditSurfaceBlur(
            footnoteId,
            mirror(),
            statusEl,
            itemEl,
            () => this.liveEditor === live && live.host.contains(document.activeElement)
          );
        }, 0);
      });
      host.addEventListener(
        "keydown",
        (event) => {
          if (live.isTearingDown || event.isComposing) return;
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            // Esc means "close the card, leave my note alone". Entering edit
            // mode parked the main-editor cursor on this footnote's reference;
            // without re-arming the suppression window, the post-exit cursor
            // sync reads that stale position and re-expands the card we just
            // collapsed (collapse-then-expand flicker on slow exits).
            this.plugin.suppressCursorSyncFromSidebarJump();
            this.exitFootnoteEditMode(footnoteId);
            return;
          }
          if ((event.metaKey || event.ctrlKey) && event.key?.toLowerCase?.() === "s") {
            event.preventDefault();
            this.flushSave(footnoteId, mirror(), statusEl, itemEl);
          }
        },
        { capture: true }
      );
      // The live layout may clip content that the rendered layout did not
      // (and vice versa); measure once at mount so the expand button state
      // matches the editor's reality, not the rendered card's.
      this.updateExpandButtonVisibility(host, expandButton, footnoteId, strings);
    }

    exitLiveEditedFootnote(options = {}) {
      const live = this.liveEditor;
      if (!live) return;
      const liveFootnoteId = live.footnoteId;
      if (this.pendingEditExitFootnoteId === liveFootnoteId) {
        this.pendingEditExitFootnoteId = null;
      }
      const anchorItem = options.anchorFootnoteId ? this.findFootnoteItem(options.anchorFootnoteId) : null;
      const anchorTopBefore = anchorItem ? anchorItem.getBoundingClientRect().top : null;
      this.exitFootnoteEditMode(liveFootnoteId);
      if (anchorItem && anchorTopBefore !== null && this.listEl) {
        const delta = anchorItem.getBoundingClientRect().top - anchorTopBefore;
        if (delta !== 0) {
          this.listEl.scrollTop += delta;
        }
      }
    }

    teardownLiveEditor() {
      const live = this.liveEditor;
      if (!live || live.isTearingDown) return;
      live.isTearingDown = true;
      this.liveEditor = null;
      try {
        const value = typeof live.mirror === "function"
          ? live.mirror()
          : normalizeLineEndings(live.instance?.cm?.state?.doc?.toString() ?? live.textarea.value);
        if (this.saveTimers.has(live.footnoteId) || live.itemEl?.classList?.contains("is-dirty")) {
          const statusEl = live.itemEl?.querySelector?.(".bfw-status");
          this.flushSave(live.footnoteId, value, statusEl, live.itemEl);
        }
      } catch (_error) {
        // Reading the buffer mid-destroy may fail; the last mirrored value stands.
      }
      if (live.hijackSentinel !== null) {
        window.clearInterval(live.hijackSentinel);
        live.hijackSentinel = null;
      }
      this.resetHijackedActiveEditor(live.controller);
      // A setTimeout-delayed assignment may land after this synchronous reset;
      // sweep once more on the next macrotask.
      this.scheduleHijackSweep(live.controller);
      try {
        this.removeChild(live.instance);
      } catch (_error) {
        try {
          live.instance?.unload?.();
        } catch (_inner) {
          // Double-unload is harmless.
        }
      }
      // Neuter the controller after unload: any dangling reference captured by
      // third parties now sees file=null and has nothing left to write to.
      try {
        live.releaseController?.();
      } catch (_error) {
        // Releasing is best-effort.
      }
      try {
        live.host.remove();
      } catch (_error) {
        // The host may already have been detached by a rebuild.
      }
      live.itemEl?.removeClass?.("is-live");
    }

    caretContextFromPoint(event) {
      const doc = event?.target?.ownerDocument || document;
      let node = null;
      let offset = 0;
      if (typeof doc.caretRangeFromPoint === "function") {
        const range = doc.caretRangeFromPoint(event.clientX, event.clientY);
        if (range) {
          node = range.startContainer;
          offset = range.startOffset;
        }
      } else if (typeof doc.caretPositionFromPoint === "function") {
        const position = doc.caretPositionFromPoint(event.clientX, event.clientY);
        if (position) {
          node = position.offsetNode;
          offset = position.offset;
        }
      }
      if (!node || node.nodeType !== 3) return null;
      return {
        contextText: String(node.textContent || ""),
        offsetInContext: offset,
      };
    }

    onRenderedLinkClick(event) {
      const link = closestElement(event.target, ".bfw-rendered a");
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      const href = link.getAttribute("data-href") || link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      if (link.classList.contains("internal-link")) {
        this.plugin.app.workspace.openLinkText(href, this.file?.path || "", false);
      } else {
        window.open(href);
      }
    }

    captureState() {
      if (!this.file) return;
      const currentState = this.stateByFile.get(this.file.path) || {};
      const focusedEditor = document.activeElement?.classList?.contains("bfw-editor")
        ? document.activeElement
        : null;
      const activeId = focusedEditor?.dataset?.footnoteId || this.activeFootnoteId || currentState.activeId || null;
      const activeFootnote = activeId ? this.currentFootnotes.find((footnote) => footnote.id === activeId) : null;
      const searchQuery = this.searchInputEl?.value ?? currentState.searchQuery ?? "";
      this.stateByFile.set(this.file.path, {
        scrollTop: this.listEl?.scrollTop ?? currentState.scrollTop ?? 0,
        activeId,
        activeSnapshot: createFootnoteSnapshot(activeFootnote) || currentState.activeSnapshot || null,
        searchQuery,
        searchPaused: this.searchPaused && Boolean(searchQuery.trim()),
        searchMatchIndex: this.searchMatchIndex,
        pausedSearchMatchIndex: this.pausedSearchMatchIndex,
        referenceIndexes: { ...(currentState.referenceIndexes || {}) },
        expandedIds: Array.from(this.expandedFootnoteIds),
        searchExpandedIds: Array.from(this.searchExpandedFootnoteIds),
        syncExpandedIds: Array.from(this.syncExpandedFootnoteIds),
        knownFootnoteIds: this.currentFootnotes.map((footnote) => footnote.id),
        knownFootnoteSnapshots: this.currentFootnotes.map((footnote) => createFootnoteSnapshot(footnote)),
        autoFocusRendersRemaining: currentState.autoFocusRendersRemaining || 0,
      });
    }

    async render() {
      if (this.isEditing() || this.pointerDownInside) {
        this.pendingRender = true;
        return;
      }
      const strings = getStrings();
      const previousSearchInput = this.searchInputEl;
      const shouldRestoreSearchFocus = document.activeElement === previousSearchInput;
      const searchSelectionStart = shouldRestoreSearchFocus ? previousSearchInput.selectionStart : null;
      const searchSelectionEnd = shouldRestoreSearchFocus ? previousSearchInput.selectionEnd : null;
      const searchSelectionDirection = shouldRestoreSearchFocus ? previousSearchInput.selectionDirection : null;
      const restoreSearchFocus = () => {
        if (!shouldRestoreSearchFocus) return;
        window.requestAnimationFrame(() => {
          if (!this.searchInputEl || this.searchInputEl.disabled) return;
          this.searchInputEl.focus({ preventScroll: true });
          if (searchSelectionStart === null || searchSelectionEnd === null) return;
          try {
            const valueLength = this.searchInputEl.value.length;
            const selectionStart = Math.min(searchSelectionStart, valueLength);
            const selectionEnd = Math.min(searchSelectionEnd, valueLength);
            this.searchInputEl.setSelectionRange(selectionStart, selectionEnd, searchSelectionDirection || "none");
          } catch (error) {
            // Some input states do not expose a selectable range.
          }
        });
      };
      this.captureState();
      const file = this.plugin.getCurrentMarkdownFile();
      this.file = file;
      this.invalidateRenderedArtifacts(file);
      this.contentEl.empty();
      this.contentEl.addClass("better-footnote");

      const headerEl = this.contentEl.createDiv({ cls: "bfw-header" });
      const titleRow = headerEl.createDiv({ cls: "bfw-title-row" });
      titleRow.createDiv({ cls: "bfw-title", text: strings.title });
      const refreshButton = titleRow.createEl("button", {
        cls: "bfw-button",
        text: strings.refresh,
        attr: { type: "button" },
      });
      refreshButton.addEventListener("click", () => this.scheduleRender(0));

      const subtitleEl = headerEl.createDiv({ cls: "bfw-subtitle" });
      this.subtitleEl = subtitleEl;
      const searchRowEl = headerEl.createDiv({ cls: "bfw-search-row" });
      this.searchInputEl = searchRowEl.createEl("input", {
        cls: "bfw-search",
        attr: {
          type: "search",
          placeholder: strings.searchPlaceholder,
        },
      });
      this.searchInputEl.setAttr("aria-label", strings.searchTooltip);
      this.resumeSearchButton = searchRowEl.createEl("button", {
        cls: "bfw-button bfw-search-nav-button",
        text: "↵",
        attr: { type: "button" },
      });
      this.resumeSearchButton.setAttr("title", strings.resumeSearch);
      const clearSearchButton = searchRowEl.createEl("button", {
        cls: "bfw-button bfw-clear-search bfw-search-nav-button",
        text: "×",
        attr: { type: "button" },
      });
      this.clearSearchButton = clearSearchButton;
      clearSearchButton.setAttr("title", strings.clearSearch);
      this.searchCountEl = searchRowEl.createSpan({ cls: "bfw-search-count" });
      this.searchPreviousButton = searchRowEl.createEl("button", {
        cls: "bfw-button bfw-search-nav-button",
        text: "↑",
        attr: { type: "button" },
      });
      this.searchPreviousButton.setAttr("title", strings.previousMatch);
      this.searchNextButton = searchRowEl.createEl("button", {
        cls: "bfw-button bfw-search-nav-button",
        text: "↓",
        attr: { type: "button" },
      });
      this.searchNextButton.setAttr("title", strings.nextMatch);
      this.listEl = this.contentEl.createDiv({ cls: "bfw-list" });
      this.listEl.addEventListener("click", (event) => this.onRenderedLinkClick(event));
      this.updateSearchModeButtons();

      if (!file) {
        subtitleEl.setText(strings.noActiveFile);
        this.searchInputEl.setAttr("disabled", "true");
        clearSearchButton.setAttr("disabled", "true");
        this.resumeSearchButton.setAttr("disabled", "true");
        this.setSearchNavDisabled(true);
        this.listEl.createDiv({ cls: "bfw-empty", text: strings.openMarkdownNote });
        restoreSearchFocus();
        return;
      }

      let text;
      try {
        text = await this.plugin.getTextForFile(file);
      } catch (error) {
        subtitleEl.setText(file.path);
        this.listEl.createDiv({ cls: "bfw-empty", text: t(strings, "readFailed", { message: error.message }) });
        restoreSearchFocus();
        return;
      }
      // The note changed while the text was being read: a newer render owns
      // the DOM now, and building this list would pin its cards to that note.
      if (this.file !== file) return;

      const parsed = parseFootnotes(text);
      const orderedFootnotes = parsed.footnotes;
      const savedState = this.stateByFile.get(file.path) || {};
      // Only a change made in this note's own editor by the user may authorise
      // an automatic whole-note rewrite (Tidy) or focus-stealing auto-edit.
      // Footnotes that merely appeared (file switch, Sync, scripts) are
      // highlighted and nothing more.
      const editedInOwnEditor = this.plugin.hasRecentNoteEditorEdit(file);
      const previousKnownFootnoteIds = Array.isArray(savedState.knownFootnoteIds)
        ? savedState.knownFootnoteIds
        : null;
      let addedFootnote = choosePrimaryAddedFootnote(
        detectAddedFootnotes(orderedFootnotes, previousKnownFootnoteIds, savedState.knownFootnoteSnapshots),
      );
      let restoredDeletedFootnote = null;
      if (addedFootnote && this.plugin.consumeRestoredDeletedFootnote(file, addedFootnote)) {
        restoredDeletedFootnote = addedFootnote;
        addedFootnote = null;
        this.plugin.hideActiveDeleteNotice();
      }
      this.currentFootnotes = orderedFootnotes;
      this.expandedFootnoteIds = new Set(savedState.expandedIds || []);
      this.searchExpandedFootnoteIds = new Set(savedState.searchExpandedIds || []);
      this.syncExpandedFootnoteIds = new Set(savedState.syncExpandedIds || []);
      if (restoredDeletedFootnote) {
        this.expandedFootnoteIds.delete(restoredDeletedFootnote.id);
        this.searchExpandedFootnoteIds.delete(restoredDeletedFootnote.id);
        this.syncExpandedFootnoteIds.delete(restoredDeletedFootnote.id);
      }
      this.activeFootnoteId = restoredDeletedFootnote?.id
        || addedFootnote?.id
        || resolveActiveFootnoteId(orderedFootnotes, savedState, this.activeFootnoteId);
      this.searchInputEl.value = savedState.searchQuery || "";
      this.searchPaused = Boolean(savedState.searchPaused && this.searchInputEl.value.trim());
      this.searchMatchIndex = typeof savedState.searchMatchIndex === "number" ? savedState.searchMatchIndex : -1;
      this.pausedSearchMatchIndex = typeof savedState.pausedSearchMatchIndex === "number"
        ? savedState.pausedSearchMatchIndex
        : -1;
      this.updateSearchModeButtons();

      const nextState = {
        ...savedState,
        activeId: this.activeFootnoteId,
        activeSnapshot: createFootnoteSnapshot(
          orderedFootnotes.find((footnote) => footnote.id === this.activeFootnoteId),
        ) || savedState.activeSnapshot || null,
        knownFootnoteIds: orderedFootnotes.map((footnote) => footnote.id),
        knownFootnoteSnapshots: orderedFootnotes.map((footnote) => createFootnoteSnapshot(footnote)),
      };
      if (restoredDeletedFootnote) {
        nextState.activeId = restoredDeletedFootnote.id;
        nextState.activeSnapshot = createFootnoteSnapshot(restoredDeletedFootnote);
        nextState.autoFocusRendersRemaining = 0;
      } else if (addedFootnote) {
        const isDuplicateDefinition = orderedFootnotes.filter((item) => item.id === addedFootnote.id).length > 1;
        if (isDuplicateDefinition) {
          new Notice(t(strings, "duplicateFootnoteInserted", { id: addedFootnote.id }), 10000);
        } else {
          nextState.activeId = addedFootnote.id;
          nextState.activeSnapshot = createFootnoteSnapshot(addedFootnote);
          if (editedInOwnEditor) {
            nextState.autoFocusRendersRemaining = Math.max(
              Number(savedState.autoFocusRendersRemaining || 0),
              1,
            );
            this.plugin.scheduleTidyFootnotesForNewFootnote(file, addedFootnote);
          } else {
            nextState.autoFocusRendersRemaining = 0;
          }
        }
      }
      this.stateByFile.set(file.path, nextState);

      const renderFilteredList = () => {
        this.updateSearchModeButtons();
        this.renderFootnoteList(orderedFootnotes, strings, subtitleEl, file.basename);
      };

      if (orderedFootnotes.length === 0) {
        this.stateByFile.set(file.path, {
          ...nextState,
          knownFootnoteIds: [],
          knownFootnoteSnapshots: [],
        });
        subtitleEl.setText(t(strings, "footnoteCount", {
          file: file.basename,
          count: formatNumber(0),
          plural: "s",
        }));
        this.searchInputEl.setAttr("disabled", "true");
        clearSearchButton.setAttr("disabled", "true");
        this.resumeSearchButton.setAttr("disabled", "true");
        this.setSearchNavDisabled(true);
        this.listEl.createDiv({ cls: "bfw-empty", text: strings.noFootnotes });
        restoreSearchFocus();
        return;
      }

      const handleSearchInputChanged = () => {
        const currentState = this.stateByFile.get(file.path) || {};
        if ((currentState.searchQuery || "") === this.searchInputEl.value) return;
        const cleared = !this.searchInputEl.value.trim();
        if (cleared) {
          this.collapseSearchExpandedFootnotes();
        }
        this.searchPaused = false;
        this.pausedSearchMatchIndex = -1;
        this.stateByFile.set(file.path, {
          ...currentState,
          searchQuery: this.searchInputEl.value,
          searchPaused: false,
          searchMatchIndex: -1,
          pausedSearchMatchIndex: -1,
          scrollTop: 0,
        });
        this.searchMatchIndex = -1;
        renderFilteredList();
        if (cleared) {
          this.scrollActiveFootnoteIntoView();
        }
      };
      this.searchInputEl.addEventListener("input", handleSearchInputChanged);
      this.searchInputEl.addEventListener("search", handleSearchInputChanged);

      this.searchInputEl.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        this.navigateSearch(event.shiftKey ? -1 : 1);
      });

      clearSearchButton.addEventListener("click", () => {
        this.searchInputEl.value = "";
        this.searchPaused = false;
        this.pausedSearchMatchIndex = -1;
        this.collapseSearchExpandedFootnotes();
        const currentState = this.stateByFile.get(file.path) || {};
        this.stateByFile.set(file.path, {
          ...currentState,
          searchQuery: "",
          searchPaused: false,
          searchMatchIndex: -1,
          pausedSearchMatchIndex: -1,
          expandedIds: Array.from(this.expandedFootnoteIds),
          searchExpandedIds: [],
          scrollTop: 0,
        });
        this.searchMatchIndex = -1;
        renderFilteredList();
        this.scrollActiveFootnoteIntoView();
        this.searchInputEl.focus();
      });

      this.resumeSearchButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resumeSearchMode({ jumpToCurrentMatch: true });
      });

      this.searchPreviousButton.addEventListener("click", () => this.navigateSearch(-1));
      this.searchNextButton.addEventListener("click", () => this.navigateSearch(1));

      const waitForTidyBeforeFocus = Boolean(
        addedFootnote && editedInOwnEditor && this.plugin.settings?.autoTidyAfterNewFootnote,
      );

      renderFilteredList();
      this.listEl.scrollTop = savedState.scrollTop || 0;
      if (this.activeFootnoteId) {
        const currentState = this.stateByFile.get(file.path) || {};
        const remainingFocusRenders = Math.max(0, Number(currentState.autoFocusRendersRemaining || 0));
        const shouldAutoFocusAfterRender = remainingFocusRenders > 0;
        this.focusFootnote(this.activeFootnoteId, {
          scroll: shouldAutoFocusAfterRender,
          scrollBlock: "start",
          focusEditor: remainingFocusRenders > 0 && !waitForTidyBeforeFocus,
          expandIfClipped: shouldAutoFocusAfterRender,
          autoExpandSource: remainingFocusRenders > 0 ? "sync" : "",
        });
        if (remainingFocusRenders > 0 && !waitForTidyBeforeFocus) {
          this.stateByFile.set(file.path, {
            ...this.stateByFile.get(file.path),
            autoFocusRendersRemaining: remainingFocusRenders - 1,
          });
        }
      }
      restoreSearchFocus();
    }

    getRawSearchQuery() {
      return this.searchInputEl?.value || "";
    }

    isSearchPaused() {
      return this.searchPaused && Boolean(this.getRawSearchQuery().trim());
    }

    getEffectiveSearchQuery() {
      return this.isSearchPaused() ? "" : this.getRawSearchQuery();
    }

    updateSearchModeButtons() {
      const hasQuery = Boolean(this.getRawSearchQuery().trim());
      if (this.clearSearchButton) {
        this.clearSearchButton.style.display = hasQuery ? "" : "none";
      }
      if (this.resumeSearchButton) {
        this.resumeSearchButton.style.display = hasQuery && this.searchPaused ? "" : "none";
      }
    }

    pauseSearchModeForEditorSync(footnoteId = null) {
      if (!this.getRawSearchQuery().trim() || this.searchPaused) return;
      if (footnoteId && this.hasActiveSearch()) {
        const visibleFootnotes = filterFootnotes(this.currentFootnotes, this.getEffectiveSearchQuery());
        if (visibleFootnotes.some((footnote) => footnote.id === footnoteId)) {
          this.selectFirstSearchMatchForFootnote(footnoteId, { scroll: false, focusMatch: false });
          return;
        }
      }
      this.pausedSearchMatchIndex = this.searchMatchIndex;
      this.searchPaused = true;
      this.collapseSearchExpandedFootnotes();
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          searchQuery: this.getRawSearchQuery(),
          searchPaused: true,
          searchMatchIndex: this.searchMatchIndex,
          pausedSearchMatchIndex: this.pausedSearchMatchIndex,
          searchExpandedIds: [],
        });
      }
      this.updateSearchModeButtons();
      this.renderFootnoteList(this.currentFootnotes, getStrings(), this.subtitleEl, this.file?.basename || "");
    }

    resumeSearchMode(options = {}) {
      if (!this.getRawSearchQuery().trim()) return;
      this.plugin.suppressCursorSyncFromSidebarJump();
      if (!options.resetMatch && this.searchMatchIndex < 0 && this.pausedSearchMatchIndex >= 0) {
        this.searchMatchIndex = this.pausedSearchMatchIndex;
      }
      this.searchPaused = false;
      if (options.resetMatch) {
        this.searchMatchIndex = -1;
        this.pausedSearchMatchIndex = -1;
      }
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          searchQuery: this.getRawSearchQuery(),
          searchPaused: false,
          searchMatchIndex: this.searchMatchIndex,
          pausedSearchMatchIndex: this.pausedSearchMatchIndex,
          scrollTop: options.resetMatch ? 0 : currentState.scrollTop,
        });
      }
      this.updateSearchModeButtons();
      this.renderFootnoteList(this.currentFootnotes, getStrings(), this.subtitleEl, this.file?.basename || "");
      if (options.jumpToCurrentMatch && this.searchMatches.length > 0) {
        if (this.searchMatchIndex < 0 || this.searchMatchIndex >= this.searchMatches.length) {
          this.searchMatchIndex = 0;
        }
        if (this.file) {
          const currentState = this.stateByFile.get(this.file.path) || {};
          this.stateByFile.set(this.file.path, {
            ...currentState,
            searchQuery: this.getRawSearchQuery(),
            searchPaused: false,
            searchMatchIndex: this.searchMatchIndex,
            pausedSearchMatchIndex: -1,
          });
        }
        this.pausedSearchMatchIndex = -1;
        this.updateSearchControls();
        this.applySearchMatch(this.searchMatches[this.searchMatchIndex]);
      }
      this.plugin.suppressCursorSyncFromSidebarJump();
    }

    hasActiveSearch() {
      return Boolean(this.getRawSearchQuery().trim()) && !this.isSearchPaused();
    }

    renderFootnoteList(footnotes, strings, subtitleEl, fileName) {
      this.invalidateRenderedArtifacts(this.file);
      const query = this.getEffectiveSearchQuery();
      const visibleFootnotes = filterFootnotes(footnotes, query);
      this.searchMatches = findFootnoteSearchResults(footnotes, query);
      if (this.searchMatchIndex >= this.searchMatches.length) {
        this.searchMatchIndex = this.searchMatches.length - 1;
      }
      if (this.searchMatches.length === 0 && !this.isSearchPaused()) {
        this.searchMatchIndex = -1;
      }
      this.listEl.empty();

      if (!subtitleEl) {
        this.updateSearchControls(strings);
        return;
      }

      if (query.trim()) {
        subtitleEl.setText(t(strings, "filteredFootnoteCount", {
          file: fileName,
          visible: formatNumber(visibleFootnotes.length),
          total: formatNumber(footnotes.length),
          matches: formatNumber(this.searchMatches.length),
        }));
      } else {
        subtitleEl.setText(t(strings, "footnoteCount", {
          file: fileName,
          count: formatNumber(footnotes.length),
          plural: footnotes.length === 1 ? "" : "s",
        }));
      }

      if (visibleFootnotes.length === 0) {
        this.updateSearchControls(strings);
        this.listEl.createDiv({ cls: "bfw-empty", text: strings.noSearchResults });
        return;
      }

      for (const footnote of visibleFootnotes) {
        this.renderFootnoteItem(footnote, strings);
      }

      this.updateSearchControls(strings);
      this.markSearchTarget();
      if (this.activeFootnoteId) {
        this.focusFootnote(this.activeFootnoteId, { scroll: false, focusEditor: false });
      }
    }

    updateSearchControls(strings = getStrings()) {
      const total = this.searchMatches.length;
      const current = this.searchMatchIndex >= 0 && total > 0 ? this.searchMatchIndex + 1 : 0;
      if (this.searchCountEl) {
        this.searchCountEl.setText(t(strings, "searchMatchCount", {
          current: formatNumber(current),
          total: formatNumber(total),
        }));
        this.searchCountEl.style.display = this.getRawSearchQuery().trim() && !this.isSearchPaused() ? "" : "none";
      }
      this.setSearchNavDisabled(this.isSearchPaused() || total === 0);
    }

    setSearchNavDisabled(disabled) {
      if (this.searchPreviousButton) {
        this.searchPreviousButton.disabled = disabled;
      }
      if (this.searchNextButton) {
        this.searchNextButton.disabled = disabled;
      }
    }

    navigateSearch(direction) {
      if (this.isSearchPaused()) {
        this.resumeSearchMode();
      }
      if (this.searchMatches.length === 0) return;
      if (this.searchMatchIndex < 0) {
        this.searchMatchIndex = direction < 0 ? this.searchMatches.length - 1 : 0;
      } else {
        this.searchMatchIndex = (this.searchMatchIndex + direction + this.searchMatches.length) % this.searchMatches.length;
      }
      this.pausedSearchMatchIndex = -1;
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          searchQuery: this.searchInputEl?.value || "",
          searchMatchIndex: this.searchMatchIndex,
          pausedSearchMatchIndex: -1,
        });
      }
      this.updateSearchControls();
      this.applySearchMatch(this.searchMatches[this.searchMatchIndex]);
    }

    scrollActiveFootnoteIntoView() {
      if (!this.activeFootnoteId || !this.listEl) return;
      const target = this.findFootnoteItem(this.activeFootnoteId);
      if (!target) return;
      const top = Math.max(0, target.offsetTop - this.listEl.offsetTop);
      this.listEl.scrollTo({ top, behavior: "auto" });
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          scrollTop: this.listEl.scrollTop,
        });
      }
    }

    markSearchTarget() {
      for (const item of this.contentEl.querySelectorAll(".bfw-item")) {
        item.removeClass("is-search-target");
      }
      const result = this.searchMatches[this.searchMatchIndex];
      if (!result) return;
      this.findFootnoteItem(result.footnoteId)?.addClass("is-search-target");
    }

    applySearchMatch(result, options = {}) {
      if (!result) return;
      const targetItem = this.findFootnoteItem(result.footnoteId);
      const measurableEl = this.getMeasurableContentEl(targetItem);
      if (measurableEl && !this.isFootnoteExpanded(result.footnoteId) && this.hasHiddenContent(measurableEl)) {
        this.setFootnoteExpanded(result.footnoteId, true, { source: "search" });
      }
      this.focusFootnote(result.footnoteId, {
        scroll: options.scroll !== false,
        focusEditor: false,
      });
      this.markSearchTarget();
      const item = this.findFootnoteItem(result.footnoteId);
      if (options.focusMatch === false) return;
      if (this.liveEditor?.footnoteId === result.footnoteId) {
        // A search hit on the card being live-edited needs the textarea back
        // for its selection display; exit live editing first.
        this.exitFootnoteEditMode(result.footnoteId);
      }
      if (this.isMarkdownRenderingEnabled() && result.match && this.editingFootnoteId !== result.footnoteId) {
        this.suppressTextareaFocusJump = true;
        this.enterFootnoteEditMode(result.footnoteId, null, { searchSession: true });
      }
      const textarea = item?.querySelector(".bfw-editor");
      if (!textarea) return;
      this.applyTextareaHeight(textarea, this.isFootnoteExpanded(result.footnoteId));
      const match = result.match;
      if (!match) return;
      this.suppressTextareaFocusJump = true;
      textarea.readOnly = true;
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(match.start, match.end, "forward");
      this.scrollTextareaToSelection(textarea, match.start);
      window.setTimeout(() => {
        this.suppressTextareaFocusJump = false;
      }, 0);
    }

    selectFirstSearchMatchForFootnote(footnoteId, options = {}) {
      if (!this.hasActiveSearch()) return false;
      const matchIndex = this.searchMatches.findIndex((result) => result.footnoteId === footnoteId);
      if (matchIndex < 0) return false;
      this.searchMatchIndex = matchIndex;
      this.pausedSearchMatchIndex = -1;
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          searchQuery: this.getRawSearchQuery(),
          searchPaused: false,
          searchMatchIndex: this.searchMatchIndex,
          pausedSearchMatchIndex: -1,
        });
      }
      this.updateSearchControls();
      this.applySearchMatch(this.searchMatches[this.searchMatchIndex], options);
      return true;
    }

    scrollTextareaToSelection(textarea, startOffset) {
      const valueBeforeMatch = textarea.value.slice(0, startOffset);
      const lineIndex = valueBeforeMatch.split("\n").length - 1;
      const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight) || 20;
      const targetTop = Math.max(0, lineIndex * lineHeight - textarea.clientHeight / 2);
      textarea.scrollTop = targetTop;
    }

    findFootnoteItem(footnoteId) {
      return Array.from(this.contentEl.querySelectorAll(".bfw-item"))
        .find((item) => item.dataset.footnoteId === footnoteId) || null;
    }

    isFootnoteExpanded(footnoteId) {
      return this.expandedFootnoteIds.has(footnoteId);
    }

    setFootnoteExpanded(footnoteId, expanded, options = {}) {
      if (expanded) {
        this.expandedFootnoteIds.add(footnoteId);
        if (options.source === "search") {
          this.searchExpandedFootnoteIds.add(footnoteId);
          this.syncExpandedFootnoteIds.delete(footnoteId);
        } else if (options.source === "sync") {
          this.syncExpandedFootnoteIds.add(footnoteId);
          this.searchExpandedFootnoteIds.delete(footnoteId);
        } else {
          this.searchExpandedFootnoteIds.delete(footnoteId);
          this.syncExpandedFootnoteIds.delete(footnoteId);
        }
      } else {
        this.expandedFootnoteIds.delete(footnoteId);
        this.searchExpandedFootnoteIds.delete(footnoteId);
        this.syncExpandedFootnoteIds.delete(footnoteId);
      }
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          expandedIds: Array.from(this.expandedFootnoteIds),
          searchExpandedIds: Array.from(this.searchExpandedFootnoteIds),
          syncExpandedIds: Array.from(this.syncExpandedFootnoteIds),
        });
      }
      const item = this.findFootnoteItem(footnoteId);
      if (item) {
        item.toggleClass("is-expanded", expanded);
        const contentEl = this.getMeasurableContentEl(item);
        if (contentEl?.tagName === "TEXTAREA") {
          this.applyTextareaHeight(contentEl, expanded);
        }
        const button = item.querySelector(".bfw-expand-button");
        const strings = getStrings();
        if (button) {
          button.setText(expanded ? "△" : "▽");
          button.setAttr("title", expanded ? strings.collapseFootnote : strings.expandFootnote);
          if (!expanded && contentEl) {
            window.requestAnimationFrame(() => {
              const hasHiddenContent = contentEl.scrollHeight > contentEl.clientHeight + CLIPPED_CONTENT_TOLERANCE_PX;
              button.toggleClass("is-hidden", !hasHiddenContent);
            });
          }
        }
      }
    }

    collapseSearchExpandedFootnotes() {
      const ids = Array.from(this.searchExpandedFootnoteIds);
      for (const footnoteId of ids) {
        this.setFootnoteExpanded(footnoteId, false);
      }
      this.searchExpandedFootnoteIds.clear();
    }

    collapseSyncExpandedFootnotes(exceptFootnoteId = null) {
      const ids = Array.from(this.syncExpandedFootnoteIds);
      for (const footnoteId of ids) {
        if (footnoteId !== exceptFootnoteId) {
          this.setFootnoteExpanded(footnoteId, false);
        }
      }
    }

    getFootnoteReferenceIndex(footnoteOrId) {
      const footnote = typeof footnoteOrId === "object"
        ? footnoteOrId
        : this.currentFootnotes.find((item) => item.id === footnoteOrId);
      if (!footnote) return 0;
      const currentState = this.file ? this.stateByFile.get(this.file.path) || {} : {};
      const referenceIndexes = currentState.referenceIndexes || {};
      return normalizeReferenceIndex(footnote, referenceIndexes[footnote.id]);
    }

    setFootnoteReferenceIndex(footnoteId, index) {
      if (!this.file || !footnoteId) return 0;
      const footnote = this.currentFootnotes.find((item) => item.id === footnoteId);
      const nextIndex = normalizeReferenceIndex(footnote, index);
      const currentState = this.stateByFile.get(this.file.path) || {};
      this.stateByFile.set(this.file.path, {
        ...currentState,
        referenceIndexes: {
          ...(currentState.referenceIndexes || {}),
          [footnoteId]: nextIndex,
        },
      });
      this.updateReferenceNavDisplay(footnoteId);
      return nextIndex;
    }

    updateReferenceNavDisplay(footnoteId, strings = getStrings()) {
      const footnote = this.currentFootnotes.find((item) => item.id === footnoteId);
      if (!footnote || Number(footnote.referenceCount || 0) <= 1) return;
      const item = this.findFootnoteItem(footnoteId);
      const positionEl = item?.querySelector?.(".bfw-reference-position");
      if (!positionEl) return;
      positionEl.setText(t(strings, "referencePosition", {
        current: formatNumber(this.getFootnoteReferenceIndex(footnote) + 1),
        total: formatNumber(footnote.referenceCount),
      }));
    }

    navigateFootnoteReference(footnoteId, direction) {
      const footnote = this.currentFootnotes.find((item) => item.id === footnoteId);
      const count = Number(footnote?.referenceCount || 0);
      if (!footnote || count <= 0) return;
      this.plugin.suppressCursorSyncFromSidebarJump();
      const currentIndex = this.getFootnoteReferenceIndex(footnote);
      const nextIndex = count > 1
        ? (currentIndex + direction + count) % count
        : 0;
      this.setFootnoteReferenceIndex(footnoteId, nextIndex);
      this.focusFootnote(footnoteId, { scroll: false, focusEditor: false });
      this.plugin.jumpToFootnoteReference(this.file, footnoteId, {
        focus: false,
        flash: true,
        referenceIndex: nextIndex,
      });
      this.plugin.suppressCursorSyncFromSidebarJump();
      this.captureState();
    }

    applyTextareaHeight(textarea, expanded) {
      if (!textarea) return;
      if (!expanded) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.max(44, Math.min(112, textarea.scrollHeight + 2))}px`;
        return;
      }
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight + 2)}px`;
    }

    updateExpandButtonVisibility(contentEl, expandButton, footnoteId, strings = getStrings()) {
      window.requestAnimationFrame(() => {
        if (!contentEl || !expandButton) return;
        const isTextarea = contentEl.tagName === "TEXTAREA";
        const expanded = this.isFootnoteExpanded(footnoteId);
        if (expanded) {
          expandButton.removeClass("is-hidden");
          expandButton.setText("△");
          expandButton.setAttr("title", strings.collapseFootnote);
          if (isTextarea) {
            this.applyTextareaHeight(contentEl, true);
          }
          return;
        }

        let hasHiddenContent;
        if (isTextarea) {
          contentEl.style.height = "auto";
          const naturalHeight = contentEl.scrollHeight + 2;
          contentEl.style.height = `${Math.max(44, Math.min(112, naturalHeight))}px`;
          hasHiddenContent = naturalHeight > 112 + CLIPPED_CONTENT_TOLERANCE_PX;
        } else {
          hasHiddenContent = contentEl.scrollHeight > contentEl.clientHeight + CLIPPED_CONTENT_TOLERANCE_PX;
        }
        expandButton.toggleClass("is-hidden", !hasHiddenContent);
        expandButton.setText("▽");
        expandButton.setAttr("title", strings.expandFootnote);
      });
    }

    hasHiddenTextareaContent(textarea) {
      if (!textarea) return false;
      const previousHeight = textarea.style.height;
      textarea.style.height = "";
      const hasHiddenContent = textarea.scrollHeight > textarea.clientHeight + CLIPPED_CONTENT_TOLERANCE_PX;
      textarea.style.height = previousHeight;
      return hasHiddenContent;
    }

    renderFootnoteItem(footnote, strings = getStrings()) {
      const itemEl = this.listEl.createDiv({ cls: "bfw-item" });
      itemEl.dataset.footnoteId = footnote.id;
      this.cardTargets.set(itemEl, { file: this.file, footnote });
      const isExpanded = this.isFootnoteExpanded(footnote.id);
      if (footnote.id === this.activeFootnoteId) {
        itemEl.addClass("is-active");
      }
      if (isExpanded) {
        itemEl.addClass("is-expanded");
      }

      const headerEl = itemEl.createDiv({ cls: "bfw-item-header" });
      const idBlockEl = headerEl.createDiv({ cls: "bfw-id-block" });
      const idEl = idBlockEl.createDiv({ cls: "bfw-id", text: String(footnote.id) });
      idEl.setAttr("title", `[^${footnote.id}]`);
      if (footnote.referenceCount === 0) {
        const unreferencedEl = idBlockEl.createSpan({ cls: "bfw-unreferenced", text: strings.unreferenced });
        unreferencedEl.setAttr("title", strings.noReferenceFound ? t(strings, "noReferenceFound", { id: footnote.id }) : strings.unreferenced);
      }
      if (footnote.referenceCount > 1) {
        idBlockEl.createSpan({
          cls: "bfw-reference-summary",
          text: t(strings, "multipleReferences", { count: formatNumber(footnote.referenceCount) }),
        });
        const referenceNavEl = idBlockEl.createSpan({ cls: "bfw-reference-nav" });
        const previousReferenceButton = referenceNavEl.createEl("button", {
          cls: "bfw-button bfw-reference-nav-button",
          text: "↑",
          attr: { type: "button" },
        });
        previousReferenceButton.setAttr("title", strings.previousReference);
        const referencePositionEl = referenceNavEl.createSpan({ cls: "bfw-reference-position" });
        const nextReferenceButton = referenceNavEl.createEl("button", {
          cls: "bfw-button bfw-reference-nav-button",
          text: "↓",
          attr: { type: "button" },
        });
        nextReferenceButton.setAttr("title", strings.nextReference);
        previousReferenceButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.navigateFootnoteReference(footnote.id, -1);
        });
        nextReferenceButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.navigateFootnoteReference(footnote.id, 1);
        });
        referencePositionEl.setText(t(strings, "referencePosition", {
          current: formatNumber(this.getFootnoteReferenceIndex(footnote) + 1),
          total: formatNumber(footnote.referenceCount),
        }));
      }
      const actionsEl = headerEl.createDiv({ cls: "bfw-actions" });
      const definitionButton = actionsEl.createEl("button", {
        cls: "bfw-button bfw-definition-button",
        text: strings.definitionButton,
        attr: { type: "button" },
      });
      definitionButton.setAttr("title", strings.definitionTooltip);
      definitionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.plugin.suppressCursorSyncFromSidebarJump();
        this.plugin.jumpToFootnoteDefinition(this.file, footnote.id);
        this.focusFootnote(footnote.id, { scroll: false, focusEditor: false });
        this.plugin.suppressCursorSyncFromSidebarJump();
      });
      const expandButton = actionsEl.createEl("button", {
        cls: "bfw-button bfw-expand-button is-hidden",
        text: isExpanded ? "△" : "▽",
        attr: { type: "button" },
      });
      expandButton.setAttr("title", isExpanded ? strings.collapseFootnote : strings.expandFootnote);
      expandButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.plugin.suppressCursorSyncFromSidebarJump();
        const nextExpanded = !this.isFootnoteExpanded(footnote.id);
        this.setFootnoteExpanded(footnote.id, nextExpanded);
        this.applyTextareaHeight(textarea, nextExpanded);
      });

      const textarea = itemEl.createEl("textarea", { cls: "bfw-editor" });
      textarea.dataset.footnoteId = footnote.id;
      textarea.value = footnote.content;
      textarea.setAttr("spellcheck", "true");
      const useRenderedState = this.isMarkdownRenderingEnabled() && footnote.id !== this.editingFootnoteId;
      if (useRenderedState) {
        this.mountRenderedContent(itemEl, textarea, footnote.id, footnote.content, () => {
          this.updateExpandButtonVisibility(this.getMeasurableContentEl(itemEl), expandButton, footnote.id, strings);
        });
      }
      this.updateExpandButtonVisibility(this.getMeasurableContentEl(itemEl), expandButton, footnote.id, strings);

      const footerEl = itemEl.createDiv({ cls: "bfw-footer" });
      const countEl = footerEl.createSpan({ cls: "bfw-count", text: this.formatFootnoteCountForDisplay(textarea.value, strings) });
      const statusEl = footerEl.createSpan({ cls: "bfw-status", text: strings.saved });

      itemEl.addEventListener("click", (event) => {
        if (event.target?.closest?.(".bfw-definition-button")) return;
        if (event.target?.closest?.(".bfw-reference-nav")) return;
        if (event.target?.closest?.(".bfw-editor")) return;
        if (event.target?.closest?.(".bfw-rendered")) return;
        if (event.target?.closest?.(".bfw-live-host")) return;
        this.activateFootnoteFromSidebar(footnote.id, { selectSearchMatch: true });
      });

      itemEl.addEventListener("contextmenu", (event) => {
        if (event.target?.closest?.(".bfw-editor")) return;
        if (event.target?.closest?.(".bfw-live-host")) return;
        event.preventDefault();
        event.stopPropagation();
        this.plugin.suppressCursorSyncFromSidebarJump();
        const menu = new Menu();
        menu.addItem((item) => {
          item
            .setTitle(strings.deleteFootnoteMenu)
            .setIcon("trash-2")
            .onClick(() => {
              this.plugin.suppressCursorSyncFromSidebarJump();
              const pendingSave = this.saveTimers.get(footnote.id);
              if (pendingSave) {
                window.clearTimeout(pendingSave);
                this.saveTimers.delete(footnote.id);
              }
              this.plugin.confirmDeleteFootnote(this.file, footnote.id);
            });
        });
        menu.showAtMouseEvent(event);
      });

      textarea.addEventListener("focus", () => {
        if (!this.applyEditSurfaceFocus(footnote.id, textarea)) return;
        window.setTimeout(() => {
          if (document.activeElement !== textarea) {
            textarea.focus();
          }
        }, 0);
      });

      textarea.addEventListener("input", () => {
        this.applyEditSurfaceInput(footnote.id, textarea.value, { itemEl, countEl, statusEl, strings });
        if (this.isFootnoteExpanded(footnote.id)) {
          this.applyTextareaHeight(textarea, true);
        }
        this.updateExpandButtonVisibility(textarea, expandButton, footnote.id, strings);
      });

      textarea.addEventListener("mousedown", () => {
        if (textarea.readOnly) {
          textarea.readOnly = false;
        }
      });

      textarea.addEventListener("keydown", (event) => {
        if (textarea.readOnly && !event.isComposing) {
          if (event.key === "Enter") {
            event.preventDefault();
            this.navigateSearch(event.shiftKey ? -1 : 1);
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            textarea.readOnly = false;
            this.searchInputEl?.focus();
            return;
          }
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          this.flushSave(footnote.id, textarea.value, statusEl, itemEl);
        }
        if (event.key === "Escape" && !event.isComposing && this.isMarkdownRenderingEnabled()) {
          event.preventDefault();
          event.stopPropagation();
          // Same echo guard as the live editor's Escape branch: the exit must
          // not let the parked cursor position re-expand the card via sync.
          this.plugin.suppressCursorSyncFromSidebarJump();
          textarea.blur();
        }
      });

      textarea.addEventListener("blur", () => {
        textarea.readOnly = false;
        this.handleEditSurfaceBlur(
          footnote.id,
          textarea.value,
          statusEl,
          itemEl,
          () => document.activeElement === textarea
        );
      });
    }

    queueSave(footnoteId, content, statusEl, itemEl) {
      if (this.cardTargets.get(itemEl)?.conflicted) return;
      const existing = this.saveTimers.get(footnoteId);
      if (existing) {
        window.clearTimeout(existing);
      }
      const timer = window.setTimeout(() => {
        this.saveTimers.delete(footnoteId);
        this.saveFootnoteNow(footnoteId, content, statusEl, itemEl);
      }, SAVE_DELAY_MS);
      this.saveTimers.set(footnoteId, timer);
    }

    async flushSave(footnoteId, content, statusEl, itemEl) {
      const existing = this.saveTimers.get(footnoteId);
      if (existing) {
        window.clearTimeout(existing);
        this.saveTimers.delete(footnoteId);
      }
      if (this.cardTargets.get(itemEl)?.conflicted) {
        return { ok: false, conflict: true, message: getStrings().saveConflictStatus };
      }
      if (!existing && !itemEl.classList.contains("is-dirty")) {
        return { ok: true, message: statusEl.getText?.() || getStrings().saved };
      }
      return this.saveFootnoteNow(footnoteId, content, statusEl, itemEl);
    }

    async saveFootnoteNow(footnoteId, content, statusEl, itemEl) {
      const strings = getStrings();
      const target = this.cardTargets.get(itemEl) || { file: this.file, footnote: null };
      if (target.conflicted) return;
      const generation = this.renderGeneration;
      const run = async () => {
        if (target.conflicted) return;
        try {
          // The footnote object is shared with the list, so its content is the
          // live baseline: what this card last saw in the note.
          const expected = target.footnote ? target.footnote.content : undefined;
          const result = await this.plugin.saveFootnote(target.file, footnoteId, content, expected);
          if (result.ok) {
            itemEl.removeClass("is-dirty");
            statusEl?.setText(result.message);
            if (target.footnote && typeof result.content === "string") {
              target.footnote.content = result.content;
            }
            // Book-keep only while the sidebar still shows this card's note and
            // the list has not been rebuilt since the save started; otherwise the
            // previous note's state would be recorded under the current note.
            if (generation === this.renderGeneration && this.file?.path === target.file?.path) {
              this.captureState();
            }
          } else {
            statusEl?.setText(result.message);
            if (result.conflict) {
              this.handleSaveConflict(footnoteId, content, itemEl, target);
            }
          }
        } catch (error) {
          statusEl?.setText(t(strings, "saveError", { message: error.message }));
        }
      };
      // Saves for one card run strictly in order, so each one compares against
      // the baseline left by the previous one instead of racing it.
      target.inFlight = target.inFlight ? target.inFlight.then(run, run) : run();
      return target.inFlight;
    }

    handleSaveConflict(footnoteId, rejectedText, itemEl, target) {
      // The note no longer holds what this card started from. Stop writing,
      // hand the user's text back in a notice they can copy from, and return
      // the card to what the note actually says.
      if (target) target.conflicted = true;
      itemEl.removeClass("is-dirty");
      const strings = getStrings();
      const fragment = document.createDocumentFragment();
      fragment.createDiv({ text: t(strings, "saveConflict", { id: footnoteId }) });
      const keep = fragment.createEl("textarea", {
        cls: "bfw-conflict-text",
        attr: { readonly: "true", rows: "4" },
      });
      keep.value = rejectedText;
      for (const type of ["pointerdown", "mousedown", "click"]) {
        keep.addEventListener(type, (event) => event.stopPropagation());
      }
      new Notice(fragment, 0);
      if (this.editingFootnoteId === footnoteId) {
        this.exitFootnoteEditMode(footnoteId);
      }
      this.scheduleRender();
    }

    activateFootnoteFromSidebar(footnoteId, options = {}) {
      this.plugin.suppressCursorSyncFromSidebarJump();
      this.focusFootnote(footnoteId, { scroll: false, focusEditor: false });
      const footnote = this.currentFootnotes.find((item) => item.id === footnoteId);
      if (footnote?.referenceCount > 0) {
        this.plugin.jumpToFootnoteReference(this.file, footnoteId, {
          focus: false,
          flash: true,
          referenceIndex: this.getFootnoteReferenceIndex(footnote),
        });
      } else {
        this.plugin.jumpToFootnoteDefinition(this.file, footnoteId, { focus: false });
      }
      this.plugin.suppressCursorSyncFromSidebarJump();
      if (options.selectSearchMatch) {
        this.selectFirstSearchMatchForFootnote(footnoteId, { scroll: false });
      }
      this.captureState();
    }

    focusFootnote(footnoteId, options = {}) {
      if (options.fromCursor) {
        this.pauseSearchModeForEditorSync(footnoteId);
      }
      this.activeFootnoteId = footnoteId;
      if (options.autoExpandSource === "sync") {
        this.collapseSyncExpandedFootnotes(footnoteId);
      }
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        const activeFootnote = this.currentFootnotes.find((footnote) => footnote.id === footnoteId);
        const referenceIndexes = { ...(currentState.referenceIndexes || {}) };
        if (typeof options.referenceIndex === "number") {
          referenceIndexes[footnoteId] = normalizeReferenceIndex(activeFootnote, options.referenceIndex);
        }
        this.stateByFile.set(this.file.path, {
          ...currentState,
          activeId: footnoteId,
          activeSnapshot: createFootnoteSnapshot(activeFootnote) || currentState.activeSnapshot || null,
          referenceIndexes,
        });
      }

      const items = this.contentEl.querySelectorAll(".bfw-item");
      for (const item of items) {
        if (item.dataset.footnoteId === footnoteId) {
          item.addClass("is-active");
        } else {
          item.removeClass("is-active");
        }
      }

      const target = Array.from(items).find((item) => item.dataset.footnoteId === footnoteId);
      if (!target) return;
      this.updateReferenceNavDisplay(footnoteId);
      const contentEl = this.getMeasurableContentEl(target);
      const textarea = target.querySelector(".bfw-editor");
      if (options.expandIfClipped && contentEl && !this.isFootnoteExpanded(footnoteId) && this.hasHiddenContent(contentEl)) {
        this.setFootnoteExpanded(footnoteId, true, { source: options.autoExpandSource || "sync" });
      } else if (contentEl?.tagName === "TEXTAREA" && this.isFootnoteExpanded(footnoteId)) {
        this.applyTextareaHeight(contentEl, true);
      }
      if (options.scroll) {
        if (options.scrollBlock === "start-if-hidden" && this.listEl) {
          // Hybrid rule (1.5.2): a card already fully in view stays put; an
          // off-screen (or clipped) card scrolls to the familiar top position.
          const listRect = this.listEl.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const fullyVisible = targetRect.top >= listRect.top - 2 && targetRect.bottom <= listRect.bottom + 2;
          if (!fullyVisible) {
            const top = Math.max(0, target.offsetTop - this.listEl.offsetTop);
            this.listEl.scrollTo({ top, behavior: "auto" });
          }
        } else if (options.scrollBlock === "start" && this.listEl) {
          const top = Math.max(0, target.offsetTop - this.listEl.offsetTop);
          this.listEl.scrollTo({ top, behavior: "auto" });
        } else {
          target.scrollIntoView({ block: options.scrollBlock || "nearest" });
        }
      }
      if (options.focusEditor) {
        if (this.liveEditor?.footnoteId === footnoteId) {
          this.liveEditor.instance?.cm?.focus?.();
        } else if (this.isMarkdownRenderingEnabled() && this.editingFootnoteId !== footnoteId) {
          this.enterFootnoteEditMode(footnoteId);
        } else {
          textarea?.focus();
        }
      }
    }
  }

  module.exports = BetterFootnotePlugin;
})();
