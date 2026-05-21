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

console.log("parser tests passed");
