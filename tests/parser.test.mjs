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

const cursor = sample.indexOf("[^note]") + 2;
assert.equal(parser.findReferenceAtOffset(parsed, cursor)?.id, "note");

assert.equal(parser.normalizeLanguageTag("zh-CN"), "zh");
assert.equal(parser.normalizeLanguageTag("ja_JP"), "ja");
assert.equal(parser.normalizeLanguageTag("ko-KR"), "ko");
assert.equal(parser.normalizeLanguageTag("fr-FR"), "en");
assert.equal(parser.formatCharacterCount(12), "12 chars");

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

console.log("parser tests passed");
