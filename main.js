(function () {
  const VIEW_TYPE = "better-footnote-view";
  const SAVE_DELAY_MS = 450;
  const RENDER_DELAY_MS = 90;
  const FOOTNOTE_CONTINUATION_INDENT = "    ";
  const FLASH_SELECTION_MS = 1400;
  const AUTO_TIDY_DELAY_MS = 250;
  const SIDEBAR_JUMP_CURSOR_SUPPRESS_MS = 1200;
  const DELETED_FOOTNOTE_RESTORE_TTL_MS = 10 * 60 * 1000;
  const RESTORED_DELETED_FOOTNOTE_CURSOR_SUPPRESS_MS = 5000;
  const MAX_DELETED_FOOTNOTE_RESTORE_RECORDS = 50;
  const PLUGIN_ICON = "list-ordered";
  const TIDY_FOOTNOTES_PLUGIN_URL = "https://community.obsidian.md/plugins/obsidian-tidy-footnotes";

  const DEFAULT_SETTINGS = {
    autoTidyAfterNewFootnote: false,
    countMode: "auto",
    tidyCommandId: "",
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
      searchPlaceholder: "Search footnotes",
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
      unreferenced: "Unreferenced",
      commandOpen: "Open Better Footnote",
      ribbonOpen: "Open Better Footnote",
      settingsTitle: "Better Footnote",
      countModeName: "Footnote count mode",
      countModeDesc: "Auto follows the plugin language: English counts words; Chinese, Japanese, and Korean count characters. Choose a different mode when your writing language differs from the interface language.",
      countModeAuto: "Auto",
      countModeCharacters: "Characters",
      countModeWords: "Words",
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
      deletedFootnote: "Deleted footnote [^{id}]. Click the note editor, then press {shortcut} to undo.",
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
      searchPlaceholder: "搜索脚注",
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
      unreferenced: "未引用",
      commandOpen: "打开 Better Footnote",
      ribbonOpen: "打开 Better Footnote",
      settingsTitle: "Better Footnote",
      countModeName: "脚注计数方式",
      countModeDesc: "自动模式会跟随插件界面语言：英文统计单词数，中文、日文、韩文统计字数。也可以根据写作语言，选择不同于界面语言的计数方式。",
      countModeAuto: "自动",
      countModeCharacters: "字数",
      countModeWords: "单词数",
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
      deletedFootnote: "已删除脚注 [^{id}]。点击笔记编辑区后按 {shortcut} 撤销。",
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
      searchPlaceholder: "脚注を検索",
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
      unreferenced: "未参照",
      commandOpen: "Better Footnote を開く",
      ribbonOpen: "Better Footnote を開く",
      settingsTitle: "Better Footnote",
      countModeName: "脚注のカウント方式",
      countModeDesc: "自動ではプラグインの表示言語に従います。英語は単語数、中国語・日本語・韓国語は文字数を数えます。執筆言語が UI と異なる場合は、別の方式を選べます。",
      countModeAuto: "自動",
      countModeCharacters: "文字数",
      countModeWords: "単語数",
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
      deletedFootnote: "脚注 [^{id}] を削除しました。ノート編集欄をクリックしてから {shortcut} で取り消せます。",
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
      searchPlaceholder: "각주 검색",
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
      unreferenced: "참조 없음",
      commandOpen: "Better Footnote 열기",
      ribbonOpen: "Better Footnote 열기",
      settingsTitle: "Better Footnote",
      countModeName: "각주 계산 방식",
      countModeDesc: "자동은 플러그인 표시 언어를 따릅니다. 영어는 단어 수, 중국어·일본어·한국어는 글자 수를 셉니다. 작성 언어가 UI 언어와 다르면 다른 계산 방식을 선택할 수 있습니다.",
      countModeAuto: "자동",
      countModeCharacters: "글자 수",
      countModeWords: "단어 수",
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
      deletedFootnote: "각주 [^{id}]를 삭제했습니다. 노트 편집 영역을 클릭한 뒤 {shortcut}로 되돌릴 수 있습니다.",
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

  function detectAddedFootnotes(currentFootnotes, knownFootnoteIds, knownFootnoteSnapshots = null) {
    if (!knownFootnoteIds) return [];
    return currentFootnotes.filter((footnote) => {
      if (knownFootnoteIds.has(footnote.id)) return false;
      if (isKnownFootnoteBySnapshot(footnote, knownFootnoteSnapshots)) return false;
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

  function replaceFootnoteContent(rawText, id, content) {
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
    return {
      changed: true,
      text: `${text.slice(0, footnote.definitionStart)}${block}${text.slice(footnote.definitionEnd)}`,
      block,
      start: footnote.definitionStart,
      end: footnote.definitionEnd,
      footnote,
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

  const { ItemView, MarkdownView, Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } = obsidian;
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
      this.views = new Set();
      this.lastMarkdownFile = null;
      this.cursorSyncTimer = null;
      this.flashSelectionTimer = null;
      this.pendingTidyKeys = new Set();
      this.tidyMissingNoticeShown = false;
      this.suppressCursorSyncUntil = 0;
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

      this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.onWorkspaceContextChanged()));
      this.registerEvent(this.app.workspace.on("file-open", () => this.onWorkspaceContextChanged()));
      this.registerEvent(this.app.workspace.on("editor-change", () => this.onEditorChanged()));
      this.registerEvent(this.app.vault.on("modify", (file) => {
        if (isMarkdownFile(file)) this.refreshViews(file);
      }));
      this.registerDomEvent(document, "selectionchange", () => this.scheduleCursorSync());
      this.registerDomEvent(document, "keyup", () => this.scheduleCursorSync());
      this.registerDomEvent(document, "mouseup", () => this.scheduleCursorSync());

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
      this.hideActiveDeleteNotice();
      this.pendingTidyKeys.clear();
      this.recentlyDeletedFootnotesByFile.clear();
      this.restoredDeletedFootnoteCursorSuppressionsByFile.clear();
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

    onWorkspaceContextChanged() {
      this.trackCurrentMarkdownFile();
      this.refreshViews();
      this.scheduleCursorSync();
    }

    onEditorChanged() {
      this.trackCurrentMarkdownFile();
      this.refreshViews(this.lastMarkdownFile);
      this.scheduleCursorSync();
    }

    refreshViews(file = null) {
      for (const view of this.views) {
        if (!file || !view.file || view.file.path === file.path) {
          view.scheduleRender();
        }
      }
    }

    scheduleCursorSync() {
      if (this.cursorSyncTimer !== null) {
        window.clearTimeout(this.cursorSyncTimer);
      }
      this.cursorSyncTimer = window.setTimeout(() => {
        this.cursorSyncTimer = null;
        this.syncCursorToViews();
      }, 80);
    }

    syncCursorToViews() {
      if (Date.now() < this.suppressCursorSyncUntil) {
        return;
      }
      if (document.activeElement?.closest?.(".better-footnote")) {
        return;
      }

      const markdownView = this.getActiveMarkdownView() || this.findMarkdownViewForFile(this.lastMarkdownFile);
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
            scrollBlock: "start",
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
        const markdownView = this.findMarkdownViewForFile(file || this.lastMarkdownFile) || this.getActiveMarkdownView();
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
      return this.app.workspace.getActiveViewOfType(MarkdownView);
    }

    findMarkdownViewForFile(file) {
      if (!file) return null;
      let found = null;
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (!found && leaf.view instanceof MarkdownView && leaf.view.file?.path === file.path) {
          found = leaf.view;
        }
      });
      return found;
    }

    async getTextForFile(file) {
      const markdownView = this.findMarkdownViewForFile(file);
      if (markdownView?.editor && typeof markdownView.editor.getValue === "function") {
        return normalizeLineEndings(markdownView.editor.getValue());
      }
      return normalizeLineEndings(await this.app.vault.cachedRead(file));
    }

    async saveFootnote(file, id, content) {
      const strings = getStrings();
      if (!file) {
        return { ok: false, message: strings.noActiveFileSave };
      }

      const markdownView = this.findMarkdownViewForFile(file);
      if (markdownView?.editor && typeof markdownView.editor.getValue === "function") {
        const editor = markdownView.editor;
        const text = normalizeLineEndings(editor.getValue());
        const result = replaceFootnoteContent(text, id, content);
        if (!result.changed) {
          return { ok: false, message: t(strings, "footnoteNotFound", { id }) };
        }
        const from = editorPositionFromOffset(editor, text, result.start);
        const to = editorPositionFromOffset(editor, text, result.end);
        editor.replaceRange(result.block, from, to);
        return { ok: true, message: strings.saved };
      }

      const text = normalizeLineEndings(await this.app.vault.read(file));
      const result = replaceFootnoteContent(text, id, content);
      if (!result.changed) {
        return { ok: false, message: t(strings, "footnoteNotFound", { id }) };
      }
      await this.app.vault.modify(file, result.text);
      return { ok: true, message: strings.saved };
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
      this.scheduleRender(0);
    }

    async onClose() {
      this.captureState();
      for (const timer of this.saveTimers.values()) {
        window.clearTimeout(timer);
      }
      this.saveTimers.clear();
      if (this.renderTimer !== null) {
        window.clearTimeout(this.renderTimer);
      }
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
      return document.activeElement?.classList?.contains("bfw-editor");
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
      const strings = getStrings();
      this.captureState();
      const file = this.plugin.getCurrentMarkdownFile();
      this.file = file;
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
      this.searchInputEl.setAttr("aria-label", strings.searchPlaceholder);
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
      this.updateSearchModeButtons();

      if (!file) {
        subtitleEl.setText(strings.noActiveFile);
        this.searchInputEl.setAttr("disabled", "true");
        clearSearchButton.setAttr("disabled", "true");
        this.resumeSearchButton.setAttr("disabled", "true");
        this.setSearchNavDisabled(true);
        this.listEl.createDiv({ cls: "bfw-empty", text: strings.openMarkdownNote });
        return;
      }

      let text;
      try {
        text = await this.plugin.getTextForFile(file);
      } catch (error) {
        subtitleEl.setText(file.path);
        this.listEl.createDiv({ cls: "bfw-empty", text: t(strings, "readFailed", { message: error.message }) });
        return;
      }

      const parsed = parseFootnotes(text);
      const orderedFootnotes = parsed.footnotes;
      const savedState = this.stateByFile.get(file.path) || {};
      const previousKnownFootnoteIds = Array.isArray(savedState.knownFootnoteIds)
        ? new Set(savedState.knownFootnoteIds)
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
        nextState.activeId = addedFootnote.id;
        nextState.activeSnapshot = createFootnoteSnapshot(addedFootnote);
        nextState.autoFocusRendersRemaining = Math.max(
          Number(savedState.autoFocusRendersRemaining || 0),
          1,
        );
        this.plugin.scheduleTidyFootnotesForNewFootnote(file, addedFootnote);
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
        return;
      }

      this.searchInputEl.addEventListener("input", () => {
        if (!this.searchInputEl.value.trim()) {
          this.collapseSearchExpandedFootnotes();
        }
        this.searchPaused = false;
        this.pausedSearchMatchIndex = -1;
        const currentState = this.stateByFile.get(file.path) || {};
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
      });

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
        this.searchInputEl.focus();
      });

      this.resumeSearchButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.resumeSearchMode({ jumpToCurrentMatch: true });
      });

      this.searchPreviousButton.addEventListener("click", () => this.navigateSearch(-1));
      this.searchNextButton.addEventListener("click", () => this.navigateSearch(1));

      const waitForTidyBeforeFocus = Boolean(addedFootnote && this.plugin.settings?.autoTidyAfterNewFootnote);

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

    pauseSearchModeForEditorSync() {
      if (!this.getRawSearchQuery().trim() || this.searchPaused) return;
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
      this.setFootnoteExpanded(result.footnoteId, true, { source: "search" });
      this.focusFootnote(result.footnoteId, {
        scroll: options.scroll !== false,
        focusEditor: false,
      });
      this.markSearchTarget();
      const item = this.findFootnoteItem(result.footnoteId);
      const textarea = item?.querySelector(".bfw-editor");
      if (!textarea) return;
      this.applyTextareaHeight(textarea, true);
      const match = result.match;
      if (!match) return;
      this.suppressTextareaFocusJump = true;
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
        const textarea = item.querySelector(".bfw-editor");
        this.applyTextareaHeight(textarea, expanded);
        const button = item.querySelector(".bfw-expand-button");
        const strings = getStrings();
        if (button) {
          button.setText(expanded ? "△" : "▽");
          button.setAttr("title", expanded ? strings.collapseFootnote : strings.expandFootnote);
          if (!expanded && textarea) {
            window.requestAnimationFrame(() => {
              const hasHiddenContent = textarea.scrollHeight > textarea.clientHeight + 2;
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
        textarea.style.height = "";
        return;
      }
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight + 2)}px`;
    }

    updateExpandButtonVisibility(textarea, expandButton, footnoteId, strings = getStrings()) {
      window.requestAnimationFrame(() => {
        const expanded = this.isFootnoteExpanded(footnoteId);
        if (expanded) {
          expandButton.removeClass("is-hidden");
          expandButton.setText("△");
          expandButton.setAttr("title", strings.collapseFootnote);
          this.applyTextareaHeight(textarea, true);
          return;
        }

        textarea.style.height = "";
        const hasHiddenContent = textarea.scrollHeight > textarea.clientHeight + 2;
        expandButton.toggleClass("is-hidden", !hasHiddenContent);
        expandButton.setText("▽");
        expandButton.setAttr("title", strings.expandFootnote);
      });
    }

    hasHiddenTextareaContent(textarea) {
      if (!textarea) return false;
      const previousHeight = textarea.style.height;
      textarea.style.height = "";
      const hasHiddenContent = textarea.scrollHeight > textarea.clientHeight + 2;
      textarea.style.height = previousHeight;
      return hasHiddenContent;
    }

    renderFootnoteItem(footnote, strings = getStrings()) {
      const itemEl = this.listEl.createDiv({ cls: "bfw-item" });
      itemEl.dataset.footnoteId = footnote.id;
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
      this.updateExpandButtonVisibility(textarea, expandButton, footnote.id, strings);

      const footerEl = itemEl.createDiv({ cls: "bfw-footer" });
      const countEl = footerEl.createSpan({ text: this.formatFootnoteCountForDisplay(textarea.value, strings) });
      const statusEl = footerEl.createSpan({ cls: "bfw-status", text: strings.saved });

      itemEl.addEventListener("click", (event) => {
        if (event.target?.closest?.(".bfw-definition-button")) return;
        if (event.target?.closest?.(".bfw-reference-nav")) return;
        if (event.target?.closest?.(".bfw-editor")) return;
        this.activateFootnoteFromSidebar(footnote.id, { selectSearchMatch: true });
      });

      itemEl.addEventListener("contextmenu", (event) => {
        if (event.target?.closest?.(".bfw-editor")) return;
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
        if (this.suppressTextareaFocusJump) {
          this.focusFootnote(footnote.id, { scroll: false, focusEditor: false });
          return;
        }
        this.activateFootnoteFromSidebar(footnote.id, { selectSearchMatch: false });
        window.setTimeout(() => {
          if (document.activeElement !== textarea) {
            textarea.focus();
          }
        }, 0);
      });

      textarea.addEventListener("input", () => {
        itemEl.addClass("is-dirty");
        countEl.setText(this.formatFootnoteCountForDisplay(textarea.value, strings));
        statusEl.setText(strings.saving);
        if (this.isFootnoteExpanded(footnote.id)) {
          this.applyTextareaHeight(textarea, true);
        }
        this.updateExpandButtonVisibility(textarea, expandButton, footnote.id, strings);
        this.queueSave(footnote.id, textarea.value, statusEl, itemEl);
      });

      textarea.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          this.flushSave(footnote.id, textarea.value, statusEl, itemEl);
        }
      });

      textarea.addEventListener("blur", () => {
        this.flushSave(footnote.id, textarea.value, statusEl, itemEl).finally(() => {
          if (this.pendingRender) {
            this.pendingRender = false;
            this.scheduleRender();
          }
        });
      });
    }

    queueSave(footnoteId, content, statusEl, itemEl) {
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
      if (!existing && !itemEl.classList.contains("is-dirty")) {
        return { ok: true, message: statusEl.getText?.() || getStrings().saved };
      }
      return this.saveFootnoteNow(footnoteId, content, statusEl, itemEl);
    }

    async saveFootnoteNow(footnoteId, content, statusEl, itemEl) {
      const strings = getStrings();
      try {
        const result = await this.plugin.saveFootnote(this.file, footnoteId, content);
        if (result.ok) {
          itemEl.removeClass("is-dirty");
          statusEl.setText(result.message);
          this.captureState();
        } else {
          statusEl.setText(result.message);
        }
      } catch (error) {
        statusEl.setText(t(strings, "saveError", { message: error.message }));
      }
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
        this.pauseSearchModeForEditorSync();
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
      const textarea = target.querySelector(".bfw-editor");
      if (options.expandIfClipped && textarea && !this.isFootnoteExpanded(footnoteId) && this.hasHiddenTextareaContent(textarea)) {
        this.setFootnoteExpanded(footnoteId, true, { source: options.autoExpandSource || "sync" });
        this.applyTextareaHeight(textarea, true);
      } else if (textarea && this.isFootnoteExpanded(footnoteId)) {
        this.applyTextareaHeight(textarea, true);
      }
      if (options.scroll) {
        if (options.scrollBlock === "start" && this.listEl) {
          const top = Math.max(0, target.offsetTop - this.listEl.offsetTop);
          this.listEl.scrollTo({ top, behavior: "auto" });
        } else {
          target.scrollIntoView({ block: options.scrollBlock || "nearest" });
        }
      }
      if (options.focusEditor) {
        textarea?.focus();
      }
    }
  }

  module.exports = BetterFootnotePlugin;
})();
