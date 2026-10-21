// Property tests: random, strange notes checked against rules that must hold
// for any input. Zero dependencies, fixed seed, failures shrink to a minimal
// note. Deep run: BF_FUZZ_N=20000 npm test
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const core = require("../main.js");

const RUNS = Number(process.env.BF_FUZZ_N) || 500;
const SEED = Number(process.env.BF_FUZZ_SEED) || 20261021;
// Invariants listed here only warn; anything else failing turns the run red.
const KNOWN_FAILURES = new Set([]);

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REAL_IDS = ["1", "2", "3", "4", "12", "note", "citation", "其他"];
const WORDS = ["Sato", "argues", "that", "the", "river", "İstanbul", "政治学", "東京大学", "edition", "p. 45", "😀", "é", "café"];
const CONTENTS = [
  "",
  "Short note.",
  "Sato 2019, p. 45.",
  "İstanbul edition, 1998.",
  "佐藤仁『メコン河開発の政治学』東京大学出版会、2019年、45頁。",
  "Line one\nLine two",
  "Para one\n\nPara two",
  "Ends with emoji 😀",
];

function makeNote(rand) {
  const pick = (items) => items[Math.floor(rand() * items.length)];
  const parts = [];
  const zoneTexts = [];
  let zoneCounter = 0;
  const zoneId = () => `z${zoneCounter++}`;
  const sentence = () => {
    const words = [];
    const count = 2 + Math.floor(rand() * 6);
    for (let index = 0; index < count; index += 1) {
      words.push(pick(WORDS));
      if (rand() < 0.3) words[words.length - 1] += `[^${pick(REAL_IDS)}]`;
      if (rand() < 0.05) words[words.length - 1] += `[^${pick(REAL_IDS)}][^${pick(REAL_IDS)}]`;
    }
    return `${words.join(" ")}.`;
  };
  if (rand() < 0.15) {
    const front = `---\ntitle: draft [^${zoneId()}]\n---`;
    parts.push(front);
    zoneTexts.push(front);
  }
  const partCount = 3 + Math.floor(rand() * 9);
  for (let index = 0; index < partCount; index += 1) {
    const roll = rand();
    if (roll < 0.3) {
      parts.push(sentence());
    } else if (roll < 0.4) {
      const fence = pick(["```", "~~~", "````"]);
      const inner = [`Example.[^${zoneId()}]`, `[^${zoneId()}]: example definition`];
      if (rand() < 0.4) inner.push(`[^${pick(REAL_IDS)}]: looks real but is code`);
      const block = `${fence}md\n${inner.join("\n")}\n${fence}`;
      parts.push(block);
      zoneTexts.push(block);
    } else if (roll < 0.47) {
      const span = rand() < 0.5 ? `\`[^${zoneId()}]\`` : `\`\`a \` [^${zoneId()}] b\`\``;
      parts.push(`Write ${span} for a footnote.`);
      zoneTexts.push(span);
    } else if (roll < 0.52) {
      const comment = rand() < 0.5 ? `%% draft [^${zoneId()}] %%` : `%%\n[^${zoneId()}]: hidden\n%%`;
      parts.push(rand() < 0.5 ? comment : `Visible.[^${pick(REAL_IDS)}] ${comment}`);
      zoneTexts.push(comment);
    } else if (roll < 0.55) {
      const comment = `<!-- todo [^${zoneId()}] -->`;
      parts.push(comment);
      zoneTexts.push(comment);
    } else if (roll < 0.58) {
      const math = `$$\nx[^${zoneId()}]\n$$`;
      parts.push(math);
      zoneTexts.push(math);
    } else if (roll < 0.61) {
      parts.push(`Escaped \\[^${zoneId()}] stays text.`);
    } else {
      const id = pick(REAL_IDS);
      const indent = pick(["  ", "    ", "\t"]);
      const content = pick(CONTENTS).split("\n").map((line, lineIndex) => (lineIndex === 0 || !line ? line : `${indent}${line}`)).join("\n");
      parts.push(`${rand() < 0.1 ? " " : ""}[^${id}]: ${content}`);
    }
  }
  let text = parts.join(rand() < 0.8 ? "\n\n" : "\n");
  if (rand() < 0.5) text += "\n";
  if (rand() < 0.1) text = text.replace(/\n/g, "\r\n");
  return { text, zoneTexts };
}

function zoneRangesOf(text, zoneTexts) {
  const ranges = [];
  for (const zone of zoneTexts) {
    const start = text.indexOf(zone);
    if (start !== -1) ranges.push([start, start + zone.length]);
  }
  return ranges;
}

const inRanges = (ranges, offset) => ranges.some(([start, end]) => offset >= start && offset < end);
const keyOf = (footnote) => `${footnote.id}#${footnote.occurrence}`;
const escape = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function othersUnchanged(beforeParsed, afterText, skip) {
  const after = new Map(core.parseFootnotes(afterText).footnotes.map((footnote) => [keyOf(footnote), footnote]));
  for (const footnote of beforeParsed.footnotes) {
    if (skip(footnote)) continue;
    const now = after.get(keyOf(footnote));
    if (!now) return `${keyOf(footnote)} disappeared`;
    if (now.content !== footnote.content) return `${keyOf(footnote)} content changed`;
    if (now.referenceCount !== footnote.referenceCount) return `${keyOf(footnote)} reference count changed`;
  }
  return null;
}

// Returns null when every invariant holds, otherwise { name, message }.
function check(rawText, zoneTexts) {
  const text = rawText.replace(/\r\n?/g, "\n");
  const zones = zoneRangesOf(text, zoneTexts);
  const parsed = core.parseFootnotes(rawText);
  const fail = (name, message) => ({ name, message });

  // I6 structure
  let previousEnd = -1;
  const seenIds = new Map();
  for (const footnote of parsed.footnotes) {
    if (!(footnote.definitionStart >= 0 && footnote.definitionStart < footnote.definitionEnd && footnote.definitionEnd <= text.length)) {
      return fail("I6", `bad definition range for ${keyOf(footnote)}`);
    }
    if (footnote.definitionStart < previousEnd) return fail("I6", `overlapping definitions at ${keyOf(footnote)}`);
    previousEnd = footnote.definitionEnd;
    const expectedOccurrence = seenIds.get(footnote.id) || 0;
    if (footnote.occurrence !== expectedOccurrence) return fail("I6", `occurrence of ${keyOf(footnote)}`);
    seenIds.set(footnote.id, expectedOccurrence + 1);
  }
  for (const reference of parsed.references) {
    if (text.slice(reference.start, reference.end) !== `[^${reference.id}]`) return fail("I6", `reference text at ${reference.start}`);
  }

  // I7 nothing inside code, comments, math or front matter is a footnote
  for (const footnote of parsed.footnotes) {
    if (footnote.id.startsWith("z") || inRanges(zones, footnote.definitionStart)) return fail("I7", `card from a zone: ${keyOf(footnote)}`);
  }
  for (const reference of parsed.references) {
    if (reference.id.startsWith("z") || inRanges(zones, reference.start)) return fail("I7", `reference from a zone at ${reference.start}`);
  }

  const targets = parsed.footnotes.slice(0, 4);
  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];

    // I1 + I2 deleting removes exactly this footnote and leaves the rest
    const deleted = core.deleteFootnoteFromText(rawText, target.id, { occurrence: target.occurrence });
    if (!deleted.changed) return fail("I1", `delete did nothing for ${keyOf(target)}`);
    let rebuilt = text;
    for (const range of [...deleted.ranges].sort((left, right) => right.start - left.start)) {
      // Adjacent removals merge into one range, so a range may hold several
      // markers and the definition block; nothing else, apart from one newline.
      const removed = text.slice(range.start, range.end);
      const block = text.slice(target.definitionStart, target.definitionEnd);
      let rest = removed;
      const blockAt = rest.indexOf(block);
      if (blockAt !== -1 && range.start + blockAt === target.definitionStart) {
        rest = rest.slice(0, blockAt) + rest.slice(blockAt + block.length);
      }
      rest = rest.split(`[^${target.id}]`).join("");
      if (rest !== "" && rest !== "\n") return fail("I1", `removed unexpected text ${JSON.stringify(removed)}`);
      rebuilt = rebuilt.slice(0, range.start) + rebuilt.slice(range.end);
    }
    if (rebuilt !== deleted.text) return fail("I1", "result is not the original minus the removed ranges");
    for (const zone of zoneTexts) if (!deleted.text.includes(zone)) return fail("I7", "delete touched a zone");
    const deleteDamage = othersUnchanged(parsed, deleted.text, (footnote) => footnote.id === target.id);
    if (deleteDamage) return fail("I2", deleteDamage);
    const remainingReferences = core.parseFootnotes(deleted.text).references.filter((reference) => reference.id === target.id).length;
    const expectedReferences = target.occurrence === 0 ? 0 : parsed.references.filter((reference) => reference.id === target.id).length;
    if (remainingReferences !== expectedReferences) return fail("I2", `references of ${target.id} after delete`);

    // I3 + I4 editing changes only this definition and round-trips
    const content = CONTENTS[(index * 3 + 1) % CONTENTS.length];
    const written = core.replaceFootnoteContent(rawText, target.id, content, { expectedContent: target.content, occurrence: target.occurrence });
    if (written.changed) {
      if (written.text.slice(0, target.definitionStart) !== text.slice(0, target.definitionStart)) return fail("I3", "text before the definition changed");
      const tail = text.length - target.definitionEnd;
      if (written.text.slice(written.text.length - tail) !== text.slice(target.definitionEnd)) return fail("I3", "text after the definition changed");
      const editDamage = othersUnchanged(parsed, written.text, (footnote) => keyOf(footnote) === keyOf(target));
      if (editDamage) return fail("I3", editDamage);
      const landed = core.parseFootnotes(written.text).footnotes.find((footnote) => keyOf(footnote) === keyOf(target));
      if (!landed || landed.content !== written.content) return fail("I4", `landed content differs for ${keyOf(target)}`);
      const again = core.replaceFootnoteContent(written.text, target.id, content, { expectedContent: written.content, occurrence: target.occurrence });
      if (again.changed || again.reason !== "already-current") return fail("I4", "second identical write was not a no-op");
      for (const zone of zoneTexts) if (!written.text.includes(zone)) return fail("I7", "edit touched a zone");
    } else if (written.reason !== "already-current" || written.text !== text) {
      return fail("I4", `unexpected no-write reason ${written.reason}`);
    }

    // I5 a stale baseline never writes
    const stale = core.replaceFootnoteContent(rawText, target.id, "Fresh text.", { expectedContent: `${target.content}~stale`, occurrence: target.occurrence });
    if (stale.changed || stale.text !== text || (stale.reason !== "content-mismatch" && stale.reason !== "already-current")) {
      return fail("I5", `stale baseline wrote or misreported (${stale.reason})`);
    }

    // I8 every highlight reads back as the searched word
    const word = target.content.split(/\s+/).find((piece) => /^[\p{L}]{3,}$/u.test(piece));
    if (word) {
      for (const result of core.findFootnoteSearchResults(parsed.footnotes, word)) {
        if (!result.match) continue;
        // Search results name a footnote by id only; duplicate ids are a known
        // limitation of search targeting, so check unique ids.
        const owners = parsed.footnotes.filter((footnote) => footnote.id === result.footnoteId);
        if (owners.length !== 1) continue;
        const owner = owners[0];
        const slice = owner.content.slice(result.match.start, result.match.end);
        if (!new RegExp(`^${escape(word)}$`, "iu").test(slice)) return fail("I8", `highlight ${JSON.stringify(slice)} for ${JSON.stringify(word)}`);
      }
    }
  }
  return null;
}

function shrink(text, zoneTexts, name) {
  let lines = text.split("\n");
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 0; index < lines.length; index += 1) {
      const candidate = [...lines.slice(0, index), ...lines.slice(index + 1)];
      const result = check(candidate.join("\n"), zoneTexts.filter((zone) => candidate.join("\n").includes(zone)));
      if (result && result.name === name) {
        lines = candidate;
        changed = true;
        break;
      }
    }
  }
  return lines.join("\n");
}

const rand = mulberry32(SEED);
const warned = new Set();
for (let run = 0; run < RUNS; run += 1) {
  const { text, zoneTexts } = makeNote(rand);
  const result = check(text, zoneTexts);
  if (!result) continue;
  if (KNOWN_FAILURES.has(result.name)) {
    if (!warned.has(result.name)) console.warn(`known failure ${result.name}: ${result.message}`);
    warned.add(result.name);
    continue;
  }
  const minimal = shrink(text, zoneTexts, result.name);
  assert.fail(`${result.name}: ${result.message}\nseed=${SEED} run=${run}\nminimal note:\n${minimal}`);
}

console.log(`invariant tests passed (${RUNS} notes, seed ${SEED})`);
