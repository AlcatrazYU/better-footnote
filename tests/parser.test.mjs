import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const parser = require("../main.js");

const sample = [
  "正文第一处[^1]，还有命名脚注[^note]。",
  "",
  "[^1]: 第一条脚注。",
  "[^note]: 第一行",
  "  第二行",
  "  第三行",
  "",
  "正文再次引用[^1]。",
].join("\n");

const parsed = parser.parseFootnotes(sample);

assert.equal(parsed.footnotes.length, 2);
assert.equal(parsed.footnotes[0].id, "1");
assert.equal(parsed.footnotes[0].displayNumber, 1);
assert.equal(parsed.footnotes[0].content, "第一条脚注。");
assert.equal(parsed.footnotes[0].referenceCount, 2);
assert.equal(parsed.footnotes[1].id, "note");
assert.equal(parsed.footnotes[1].displayNumber, 2);
assert.equal(parsed.footnotes[1].content, "第一行\n第二行\n第三行");
assert.equal(parsed.footnotes[1].referenceCount, 1);
assert.equal(parser.referenceIndexForFootnoteReference(parsed.footnotes[0], parsed.footnotes[0].references[0]), 0);
assert.equal(parser.referenceIndexForFootnoteReference(parsed.footnotes[0], parsed.footnotes[0].references[1]), 1);
assert.equal(parser.normalizeReferenceIndex(parsed.footnotes[0], -1), 0);
assert.equal(parser.normalizeReferenceIndex(parsed.footnotes[0], 99), 1);

const replaced = parser.replaceFootnoteContent(sample, "note", "改写第一行\n改写第二行");
assert.ok(replaced.changed);
assert.match(replaced.text, /\[\^note]: 改写第一行\n    改写第二行/);
assert.equal(parser.parseFootnotes(replaced.text).footnotes[1].content, "改写第一行\n改写第二行");

const replacedWithBlankLine = parser.replaceFootnoteContent(sample, "1", "第一段\n\n第二段");
assert.ok(replacedWithBlankLine.changed);
assert.match(replacedWithBlankLine.text, /\[\^1]: 第一段\n    \n    第二段/);
assert.equal(parser.parseFootnotes(replacedWithBlankLine.text).footnotes[0].content, "第一段\n\n第二段");

const unchanged = parser.replaceFootnoteContent(sample, "missing", "x");
assert.equal(unchanged.changed, false);

const deletedNumbered = parser.deleteFootnoteFromText(sample, "1");
assert.ok(deletedNumbered.changed);
assert.equal(deletedNumbered.referenceCount, 2);
assert.equal(parser.parseFootnotes(deletedNumbered.text).footnotes.some((footnote) => footnote.id === "1"), false);
assert.equal(deletedNumbered.text.includes("[^1]"), false);
assert.equal(deletedNumbered.text.includes("[^note]"), true);

const deletedNamed = parser.deleteFootnoteFromText(sample, "note");
assert.ok(deletedNamed.changed);
assert.equal(deletedNamed.referenceCount, 1);
assert.equal(parser.parseFootnotes(deletedNamed.text).footnotes.some((footnote) => footnote.id === "note"), false);
assert.equal(deletedNamed.text.includes("[^note]"), false);

const deletedUnreferenced = parser.deleteFootnoteFromText([
  "正文没有引用。",
  "",
  "[^orphan]: 孤立脚注",
].join("\n"), "orphan");
assert.ok(deletedUnreferenced.changed);
assert.equal(deletedUnreferenced.referenceCount, 0);
assert.equal(deletedUnreferenced.text.includes("[^orphan]"), false);

const deletedEmpty = parser.deleteFootnoteFromText([
  "正文新增空脚注[^empty]。",
  "",
  "[^empty]: ",
].join("\n"), "empty");
assert.ok(deletedEmpty.changed);
assert.equal(deletedEmpty.referenceCount, 1);
assert.equal(deletedEmpty.contentIsBlank, true);
assert.equal(deletedEmpty.text.includes("[^empty]"), false);

const deletedEmptyRecord = {
  id: "1",
  snapshot: {
    contentFingerprint: "",
  },
};
const reusedNumberedFootnote = parser.parseFootnotes([
  "原来的脚注重新编号为[^1]。",
  "",
  "[^1]: 原来的非空脚注",
].join("\n")).footnotes[0];
assert.equal(parser.deletedFootnoteRecordMatchesFootnote(deletedEmptyRecord, reusedNumberedFootnote), false);

const restoredEmptyFootnote = parser.parseFootnotes([
  "恢复空脚注[^1]。",
  "",
  "[^1]: ",
].join("\n")).footnotes[0];
assert.equal(parser.deletedFootnoteRecordMatchesFootnote(deletedEmptyRecord, restoredEmptyFootnote), true);

const cursor = sample.indexOf("[^note]") + 2;
assert.equal(parser.findReferenceAtOffset(parsed, cursor)?.id, "note");
const definitionCursor = sample.indexOf("第二行");
assert.equal(parser.findDefinitionAtOffset(parsed, definitionCursor)?.id, "note");

assert.equal(parser.normalizeLanguageTag("zh-CN"), "zh");
assert.equal(parser.normalizeLanguageTag("ja_JP"), "ja");
assert.equal(parser.normalizeLanguageTag("ko-KR"), "ko");
assert.equal(parser.normalizeLanguageTag("fr-FR"), "en");
assert.equal(parser.resolveCountMode("auto", "en"), "words");
assert.equal(parser.resolveCountMode("auto", "ja"), "characters");
assert.equal(parser.countFootnoteText("This is one footnote.", "words", "en"), 4);
assert.equal(parser.countFootnoteText("第一行\n第二行", "characters", "zh"), 6);
assert.equal(parser.formatFootnoteCount("This is one footnote.", "auto", undefined, "en"), "4 words");
assert.equal(parser.formatFootnoteCount("word", "auto", undefined, "en"), "1 word");

assert.deepEqual(parser.filterFootnotes(parsed.footnotes, "第一行").map((footnote) => footnote.id), ["note"]);
assert.deepEqual(parser.filterFootnotes(parsed.footnotes, "[^1]").map((footnote) => footnote.id), ["1"]);
assert.deepEqual(
  parser.findFootnoteSearchResults(parsed.footnotes, "第一").map((result) => ({
    footnoteId: result.footnoteId,
    text: result.match?.text || "",
  })),
  [
    { footnoteId: "1", text: "第一" },
    { footnoteId: "note", text: "第一" },
  ],
);

const repeatedSearch = parser.parseFootnotes([
  "正文[^a][^b]。",
  "",
  "[^a]: 語孟子義 一つ目。語孟子義 二つ目。",
  "[^b]: 語孟子義 三つ目。",
].join("\n"));
assert.deepEqual(
  parser.findFootnoteSearchResults(repeatedSearch.footnotes, "語孟子義").map((result) => result.footnoteId),
  ["a", "a", "b"],
);

const exactIdSearch = parser.parseFootnotes([
  "正文引用数字脚注[^17]，也引用命名脚注[^citation]。",
  "",
  "[^17]: 第十七条脚注。",
  "[^citation]: 这里写到 1917 年，也写到 2017 年。",
].join("\n"));
assert.deepEqual(parser.filterFootnotes(exactIdSearch.footnotes, "^17").map((footnote) => footnote.id), ["17"]);
assert.deepEqual(parser.findFootnoteSearchResults(exactIdSearch.footnotes, "^17"), [
  { footnoteId: "17", match: null },
]);
assert.deepEqual(parser.filterFootnotes(exactIdSearch.footnotes, "^citation").map((footnote) => footnote.id), ["citation"]);
assert.deepEqual(parser.filterFootnotes(exactIdSearch.footnotes, "17").map((footnote) => footnote.id), ["17", "citation"]);
assert.deepEqual(
  parser.findFootnoteSearchResults(exactIdSearch.footnotes, "17").map((result) => result.footnoteId),
  ["17", "citation", "citation"],
);

const markdownEditorTarget = {
  closest(selector) {
    return selector.includes(".cm-editor") || selector.includes(".markdown-source-view") ? {} : null;
  },
};
const betterFootnoteTarget = {
  closest(selector) {
    if (selector.includes(".better-footnote")) return {};
    return selector.includes(".cm-editor") || selector.includes(".markdown-source-view") ? {} : null;
  },
};
const nonEditorTarget = {
  closest() {
    return null;
  },
};

assert.equal(parser.isTextEditingKey({ key: "a" }), true);
assert.equal(parser.isTextEditingKey({ key: "Backspace" }), true);
assert.equal(parser.isTextEditingKey({ key: "a", metaKey: true }), false);
assert.equal(parser.isTextEditingKey({ key: "ArrowDown" }), false);
assert.equal(parser.isEditorTextInputEvent({
  type: "beforeinput",
  inputType: "insertText",
  target: markdownEditorTarget,
}), true);
assert.equal(parser.isEditorTextInputEvent({
  type: "beforeinput",
  inputType: "historyUndo",
  target: markdownEditorTarget,
}), false);
assert.equal(parser.isEditorTextInputEvent({
  type: "keydown",
  key: "x",
  target: markdownEditorTarget,
}), true);
assert.equal(parser.isEditorTextInputEvent({
  type: "beforeinput",
  inputType: "insertText",
  target: betterFootnoteTarget,
}), false);
assert.equal(parser.isEditorTextInputEvent({
  type: "beforeinput",
  inputType: "insertText",
  target: nonEditorTarget,
}), false);
assert.equal(parser.isCommandLikeEditorKeydown({
  type: "keydown",
  key: "t",
  metaKey: true,
  target: markdownEditorTarget,
}), true);
assert.equal(parser.isCommandLikeEditorKeydown({
  type: "keydown",
  key: "ArrowDown",
  target: markdownEditorTarget,
}), true);
assert.equal(parser.isCommandLikeEditorKeydown({
  type: "keydown",
  key: "t",
  metaKey: true,
  target: betterFootnoteTarget,
}), false);

const outOfOrder = parser.parseFootnotes([
  "先引用新增脚注[^52]，再引用旧脚注[^49]。",
  "",
  "[^49]: 旧脚注",
  "[^52]: 新脚注",
].join("\n"));
assert.deepEqual(outOfOrder.footnotes.map((footnote) => footnote.id), ["49", "52"]);
assert.deepEqual(parser.orderFootnotesByReference(outOfOrder.footnotes).map((footnote) => footnote.id), ["52", "49"]);
assert.deepEqual(
  parser.detectAddedFootnotes(parser.orderFootnotesByReference(outOfOrder.footnotes), new Set(["49"])).map((footnote) => footnote.id),
  ["52"],
);

{
  const duplicated = parser.parseFootnotes([
    "正文引用[^1]，再次引用[^1]，另有[^2]。",
    "",
    "[^1]: 原有脚注",
    "[^2]: 另一条",
    "[^1]: ",
  ].join("\n"));
  assert.equal(duplicated.footnotes.length, 3);
  const addedByArray = parser.detectAddedFootnotes(duplicated.footnotes, ["1", "2"]);
  assert.equal(addedByArray.length, 1);
  assert.equal(addedByArray[0].id, "1");
  assert.equal(addedByArray[0].content, "");
  const addedBySet = parser.detectAddedFootnotes(duplicated.footnotes, new Set(["1", "2"]));
  assert.equal(addedBySet.length, 1);
  assert.equal(parser.detectAddedFootnotes(duplicated.footnotes, ["1", "2", "1"]).length, 0);
}

const renamedByTidy = parser.parseFootnotes([
  "先引用新增脚注[^1]，再引用旧脚注[^2]。",
  "",
  "[^1]: 新脚注",
  "[^2]: 旧脚注",
].join("\n"));
assert.deepEqual(
  parser.detectAddedFootnotes(renamedByTidy.footnotes, new Set(["49", "52"]), outOfOrder.footnotes.map((footnote) => ({
    id: footnote.id,
    displayNumber: footnote.displayNumber,
    contentFingerprint: footnote.content,
    definitionStart: footnote.definitionStart,
    firstReferenceStart: footnote.firstReferenceStart,
  }))).map((footnote) => footnote.id),
  [],
);

const beforeTidy = parser.parseFootnotes([
  "正文[^10]。",
  "",
  "[^10]: 同一条脚注内容",
].join("\n"));
const afterTidy = parser.parseFootnotes([
  "正文[^1]。",
  "",
  "[^1]: 同一条脚注内容",
].join("\n"));
const rememberedState = {
  activeId: "10",
  activeSnapshot: {
    id: "10",
    displayNumber: 1,
    contentFingerprint: "同一条脚注内容",
    definitionStart: beforeTidy.footnotes[0].definitionStart,
    firstReferenceStart: beforeTidy.footnotes[0].firstReferenceStart,
  },
};
assert.equal(parser.resolveActiveFootnoteId(afterTidy.footnotes, rememberedState, "10"), "1");

const beforeTidyWithStaleId = parser.parseFootnotes([
  "正文旧脚注[^48]。",
  "正文新增脚注[^52]。",
  "正文旧脚注[^49]。",
  "正文旧脚注[^50]。",
  "",
  "[^48]: 旧 48",
  "[^49]: 旧 49",
  "[^50]: 旧 50",
  "[^52]: ",
].join("\n"));
const afterTidyWithStaleId = parser.parseFootnotes([
  "正文旧脚注[^48]。",
  "正文新增脚注[^49]。",
  "正文旧脚注[^50]。",
  "正文旧脚注[^52]。",
  "",
  "[^48]: 旧 48",
  "[^49]: ",
  "[^50]: 旧 49",
  "[^52]: 旧 50",
].join("\n"));
const insertedBeforeTidy = beforeTidyWithStaleId.footnotes.find((footnote) => footnote.id === "52");
assert.equal(
  parser.resolveActiveFootnoteId(afterTidyWithStaleId.footnotes, {
    activeId: "52",
    activeSnapshot: {
      id: "52",
      displayNumber: insertedBeforeTidy.displayNumber,
      contentFingerprint: "",
      definitionStart: insertedBeforeTidy.definitionStart,
      firstReferenceStart: insertedBeforeTidy.firstReferenceStart,
    },
  }, "52"),
  "49",
);

{
  const scheduled = new Map();
  const cleared = new Set();
  const flushed = [];
  let nextTimerId = 1;
  const scheduler = parser.createDeferredFileScheduler({
    delayMs: 900,
    setTimeoutFn(callback, delay) {
      const id = nextTimerId++;
      scheduled.set(id, { callback, delay });
      return id;
    },
    clearTimeoutFn(id) {
      cleared.add(id);
      scheduled.delete(id);
    },
    onFlush(payload, key) {
      flushed.push({ payload, key });
    },
  });

  for (let index = 0; index < 56; index += 1) {
    scheduler.schedule("large.md", { file: { path: "large.md" }, index });
  }

  assert.equal(scheduler.size(), 1);
  assert.equal(cleared.size, 55);
  assert.equal(flushed.length, 0);
  const [timer] = scheduled.values();
  assert.equal(timer.delay, 900);
  timer.callback();
  assert.equal(scheduler.size(), 0);
  assert.deepEqual(flushed, [
    { payload: { file: { path: "large.md" }, index: 55 }, key: "large.md" },
  ]);

  scheduler.schedule("a.md", { file: { path: "a.md" } });
  scheduler.schedule("b.md", { file: { path: "b.md" } });
  assert.equal(scheduler.has("a.md"), true);
  assert.equal(scheduler.has("b.md"), true);
  scheduler.clear();
  assert.equal(scheduler.size(), 0);
}

{
  const linkContent = "参见 [Stanford Encyclopedia](https://plato.stanford.edu/) 第三节。";
  assert.equal(
    parser.approximateSourceOffsetFromClick(linkContent, "Stanford Encyclopedia", 9),
    linkContent.indexOf("Stanford Encyclopedia") + 9,
  );

  const boldContent = "参见 **注意** 的说明。";
  assert.equal(
    parser.approximateSourceOffsetFromClick(boldContent, "注意", 1),
    boldContent.indexOf("注意") + 1,
  );

  assert.equal(parser.approximateSourceOffsetFromClick("第一条脚注。", "第一条脚注。", 3), 3);

  const partialContent = "补充：注意事项如下。";
  assert.equal(
    parser.approximateSourceOffsetFromClick(partialContent, "光标注意事项", 4),
    partialContent.indexOf("事"),
  );

  assert.equal(parser.approximateSourceOffsetFromClick("abc", "abc", 99), 3);
  assert.equal(parser.approximateSourceOffsetFromClick("正文内容", "不存在的文字", 2), null);
  assert.equal(parser.approximateSourceOffsetFromClick("", "abc", 1), null);
  assert.equal(parser.approximateSourceOffsetFromClick("内容", "", 0), null);
  assert.equal(parser.approximateSourceOffsetFromClick("内容", "   ", 1), null);
}

{
  const cache = parser.createLruCache({ maxEntries: 2 });
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.get("a"), 1);
  cache.set("c", 3);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.has("a"), true);
  assert.equal(cache.get("c"), 3);
  assert.equal(cache.size(), 2);
  cache.set("a", 10);
  assert.equal(cache.get("a"), 10);
  assert.equal(cache.size(), 2);
  assert.equal(cache.delete("a"), true);
  assert.equal(cache.has("a"), false);
  cache.clear();
  assert.equal(cache.size(), 0);
  assert.equal(cache.get("a"), undefined);

  const defaultCache = parser.createLruCache();
  for (let index = 0; index < 205; index += 1) {
    defaultCache.set(`key-${index}`, index);
  }
  assert.equal(defaultCache.size(), 200);
  assert.equal(defaultCache.has("key-4"), false);
  assert.equal(defaultCache.get("key-204"), 204);
}

console.log("parser tests passed");
