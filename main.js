(function () {
  const VIEW_TYPE = "better-footnote-view";
  const SAVE_DELAY_MS = 450;
  const RENDER_DELAY_MS = 90;
  const FOOTNOTE_CONTINUATION_INDENT = "    ";
  const FLASH_SELECTION_MS = 1400;

  const I18N = {
    en: {
      title: "Better Footnote",
      refresh: "Refresh",
      noActiveFile: "No active Markdown file",
      openMarkdownNote: "Open a Markdown note to edit its footnotes.",
      readFailed: "Failed to read file: {message}",
      noFootnotes: "No footnote definitions found in this note.",
      footnoteCount: "{file} · {count} footnote{plural}",
      definitionButton: "Footnote area",
      definitionTooltip: "Jump to the footnote definition area",
      saved: "Saved",
      saving: "Saving...",
      saveError: "Error: {message}",
      chars: "{count} chars",
      noActiveFileSave: "No active Markdown file.",
      openSourceForReference: "Open the source note to jump to a footnote reference.",
      openSourceForDefinition: "Open the source note to jump to a footnote definition.",
      noReferenceFound: "No reference found for [^{id}].",
      footnoteNotFound: "Footnote [^{id}] was not found.",
      commandOpen: "Open Better Footnote",
      ribbonOpen: "Open Better Footnote",
    },
    zh: {
      title: "Better Footnote",
      refresh: "更新",
      noActiveFile: "没有打开 Markdown 文件",
      openMarkdownNote: "打开一篇 Markdown 笔记后，即可编辑其中的脚注。",
      readFailed: "读取文件失败：{message}",
      noFootnotes: "这篇笔记中没有找到脚注定义。",
      footnoteCount: "{file} · {count} 条脚注",
      definitionButton: "脚注区",
      definitionTooltip: "跳到文末脚注定义位置",
      saved: "已保存",
      saving: "保存中...",
      saveError: "错误：{message}",
      chars: "{count} 字",
      noActiveFileSave: "没有打开 Markdown 文件。",
      openSourceForReference: "请先打开源笔记，再跳到脚注引用位置。",
      openSourceForDefinition: "请先打开源笔记，再跳到脚注定义位置。",
      noReferenceFound: "没有找到 [^{id}] 的正文引用。",
      footnoteNotFound: "没有找到脚注 [^{id}]。",
      commandOpen: "打开 Better Footnote",
      ribbonOpen: "打开 Better Footnote",
    },
    ja: {
      title: "Better Footnote",
      refresh: "更新",
      noActiveFile: "Markdown ファイルが開かれていません",
      openMarkdownNote: "Markdown ノートを開くと、その脚注を編集できます。",
      readFailed: "ファイルの読み込みに失敗しました: {message}",
      noFootnotes: "このノートには脚注定義が見つかりません。",
      footnoteCount: "{file} · 脚注 {count} 件",
      definitionButton: "脚注欄",
      definitionTooltip: "文末の脚注定義へ移動",
      saved: "保存済み",
      saving: "保存中...",
      saveError: "エラー: {message}",
      chars: "{count}字",
      noActiveFileSave: "Markdown ファイルが開かれていません。",
      openSourceForReference: "脚注参照へ移動するには、元のノートを開いてください。",
      openSourceForDefinition: "脚注定義へ移動するには、元のノートを開いてください。",
      noReferenceFound: "[^{id}] の本文参照が見つかりません。",
      footnoteNotFound: "脚注 [^{id}] が見つかりません。",
      commandOpen: "Better Footnote を開く",
      ribbonOpen: "Better Footnote を開く",
    },
    ko: {
      title: "Better Footnote",
      refresh: "새로고침",
      noActiveFile: "열린 Markdown 파일이 없습니다",
      openMarkdownNote: "Markdown 노트를 열면 해당 각주를 편집할 수 있습니다.",
      readFailed: "파일을 읽지 못했습니다: {message}",
      noFootnotes: "이 노트에서 각주 정의를 찾지 못했습니다.",
      footnoteCount: "{file} · 각주 {count}개",
      definitionButton: "각주 영역",
      definitionTooltip: "문서 끝의 각주 정의 위치로 이동",
      saved: "저장됨",
      saving: "저장 중...",
      saveError: "오류: {message}",
      chars: "{count}자",
      noActiveFileSave: "열린 Markdown 파일이 없습니다.",
      openSourceForReference: "각주 참조로 이동하려면 원본 노트를 여세요.",
      openSourceForDefinition: "각주 정의로 이동하려면 원본 노트를 여세요.",
      noReferenceFound: "[^{id}]의 본문 참조를 찾지 못했습니다.",
      footnoteNotFound: "각주 [^{id}]를 찾지 못했습니다.",
      commandOpen: "Better Footnote 열기",
      ribbonOpen: "Better Footnote 열기",
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

  function formatCharacterCount(value, strings = getStrings()) {
    return t(strings, "chars", { count: formatNumber(value) });
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

  function findReferenceAtOffset(parsed, offset) {
    return parsed.references.find((reference) => offset >= reference.start && offset <= reference.end) || null;
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
        getStrings,
        normalizeLanguageTag,
        parseFootnotes,
        replaceFootnoteContent,
        findReferenceAtOffset,
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
        findReferenceNearOffsetOnLine,
        formatCharacterCount,
        getStrings,
        normalizeLanguageTag,
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

  const { ItemView, MarkdownView, Notice, Plugin } = obsidian;
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

  class BetterFootnotePlugin extends Plugin {
    async onload() {
      this.views = new Set();
      this.lastMarkdownFile = null;
      this.cursorSyncTimer = null;
      this.flashSelectionTimer = null;
      const strings = getStrings();

      this.registerView(VIEW_TYPE, (leaf) => new BetterFootnoteView(leaf, this));
      if (footnoteReferenceHighlightField) {
        this.registerEditorExtension(footnoteReferenceHighlightField);
      }

      this.addRibbonIcon("file-signature", strings.ribbonOpen, () => {
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
      if (!reference) return;

      for (const view of this.views) {
        if (view.file?.path === markdownView.file?.path) {
          view.focusFootnote(reference.id, { scroll: true, fromCursor: true });
        }
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
      const reference = footnote?.references?.[0] || null;
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
    }

    getViewType() {
      return VIEW_TYPE;
    }

    getDisplayText() {
      return getStrings().title;
    }

    getIcon() {
      return "file-signature";
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
      this.stateByFile.set(this.file.path, {
        scrollTop: this.listEl?.scrollTop ?? currentState.scrollTop ?? 0,
        activeId,
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
      const refreshButton = titleRow.createEl("button", { cls: "bfw-button", text: strings.refresh });
      refreshButton.addEventListener("click", () => this.scheduleRender(0));

      const subtitleEl = headerEl.createDiv({ cls: "bfw-subtitle" });
      this.listEl = this.contentEl.createDiv({ cls: "bfw-list" });

      if (!file) {
        subtitleEl.setText(strings.noActiveFile);
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
      const savedState = this.stateByFile.get(file.path) || {};
      this.activeFootnoteId = savedState.activeId || this.activeFootnoteId;
      subtitleEl.setText(t(strings, "footnoteCount", {
        file: file.basename,
        count: formatNumber(parsed.footnotes.length),
        plural: parsed.footnotes.length === 1 ? "" : "s",
      }));

      if (parsed.footnotes.length === 0) {
        this.listEl.createDiv({ cls: "bfw-empty", text: strings.noFootnotes });
        return;
      }

      for (const footnote of parsed.footnotes) {
        this.renderFootnoteItem(footnote, strings);
      }

      this.listEl.scrollTop = savedState.scrollTop || 0;
      if (this.activeFootnoteId) {
        this.focusFootnote(this.activeFootnoteId, { scroll: true, focusEditor: false });
      }
    }

    renderFootnoteItem(footnote, strings = getStrings()) {
      const itemEl = this.listEl.createDiv({ cls: "bfw-item" });
      itemEl.dataset.footnoteId = footnote.id;
      if (footnote.id === this.activeFootnoteId) {
        itemEl.addClass("is-active");
      }

      const headerEl = itemEl.createDiv({ cls: "bfw-item-header" });
      const idEl = headerEl.createDiv({ cls: "bfw-id", text: String(footnote.displayNumber || footnote.index) });
      idEl.setAttr("title", `[^${footnote.id}]`);
      const actionsEl = headerEl.createDiv({ cls: "bfw-actions" });
      const definitionButton = actionsEl.createEl("button", { cls: "bfw-button bfw-definition-button", text: strings.definitionButton });
      definitionButton.setAttr("title", strings.definitionTooltip);
      definitionButton.addEventListener("click", (event) => {
        event.stopPropagation();
        this.plugin.jumpToFootnoteDefinition(this.file, footnote.id);
        this.focusFootnote(footnote.id, { scroll: false, focusEditor: false });
      });

      const textarea = itemEl.createEl("textarea", { cls: "bfw-editor" });
      textarea.dataset.footnoteId = footnote.id;
      textarea.value = footnote.content;
      textarea.setAttr("spellcheck", "true");

      const footerEl = itemEl.createDiv({ cls: "bfw-footer" });
      const countEl = footerEl.createSpan({ text: formatCharacterCount(textarea.value.length, strings) });
      const statusEl = footerEl.createSpan({ cls: "bfw-status", text: strings.saved });

      itemEl.addEventListener("click", (event) => {
        if (event.target?.closest?.(".bfw-definition-button")) return;
        this.activateFootnoteFromSidebar(footnote.id);
      });

      textarea.addEventListener("focus", () => {
        this.activateFootnoteFromSidebar(footnote.id);
        window.setTimeout(() => {
          if (document.activeElement !== textarea) {
            textarea.focus();
          }
        }, 0);
      });

      textarea.addEventListener("input", () => {
        itemEl.addClass("is-dirty");
        countEl.setText(formatCharacterCount(textarea.value.length, strings));
        statusEl.setText(strings.saving);
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

    activateFootnoteFromSidebar(footnoteId) {
      this.focusFootnote(footnoteId, { scroll: false, focusEditor: false });
      this.plugin.jumpToFootnoteReference(this.file, footnoteId, { focus: false, flash: true });
      this.captureState();
    }

    focusFootnote(footnoteId, options = {}) {
      this.activeFootnoteId = footnoteId;
      if (this.file) {
        const currentState = this.stateByFile.get(this.file.path) || {};
        this.stateByFile.set(this.file.path, {
          ...currentState,
          activeId: footnoteId,
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
      if (options.scroll) {
        target.scrollIntoView({ block: "nearest" });
      }
      if (options.focusEditor) {
        target.querySelector(".bfw-editor")?.focus();
      }
    }
  }

  module.exports = BetterFootnotePlugin;
})();
