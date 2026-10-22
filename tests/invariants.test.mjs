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

const isBlank = (content) => !String(content || "").trim();

// Editing one definition of a number in conflict may move ownership (and so
// the reference count) inside that number; pass its id as ownershipMayMove.
function othersUnchanged(beforeParsed, afterText, skip, ownershipMayMove = null) {
  const after = new Map(core.parseFootnotes(afterText).footnotes.map((footnote) => [keyOf(footnote), footnote]));
  for (const footnote of beforeParsed.footnotes) {
    if (skip(footnote)) continue;
    const now = after.get(keyOf(footnote));
    if (!now) return `${keyOf(footnote)} disappeared`;
    if (now.content !== footnote.content) return `${keyOf(footnote)} content changed`;
    if (footnote.id === ownershipMayMove) continue;
    if (now.referenceCount !== footnote.referenceCount) return `${keyOf(footnote)} reference count changed`;
  }
  return null;
}

function groupsById(footnotes) {
  const groups = new Map();
  for (const footnote of footnotes) {
    if (!groups.has(footnote.id)) groups.set(footnote.id, []);
    groups.get(footnote.id).push(footnote);
  }
  return groups;
}

// Puts the definition blocks of one number back in reverse order.
function reverseGroup(text, group) {
  const blocks = group.map((footnote) => text.slice(footnote.definitionStart, footnote.definitionEnd));
  let result = text;
  for (let index = group.length - 1; index >= 0; index -= 1) {
    const footnote = group[index];
    result = result.slice(0, footnote.definitionStart) + blocks[group.length - 1 - index] + result.slice(footnote.definitionEnd);
  }
  return result;
}

const ownerContentOf = (group) => {
  const owner = group.find((footnote) => footnote.isOwner);
  return owner ? owner.content : null;
};

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

  // I11 markers belong to the owner of their number: the only definition, or
  // the only one with content; when content cannot tell, to none
  const markerCounts = new Map();
  for (const reference of parsed.references) markerCounts.set(reference.id, (markerCounts.get(reference.id) || 0) + 1);
  const groups = groupsById(parsed.footnotes);
  for (const [id, group] of groups) {
    const withContent = group.filter((footnote) => !isBlank(footnote.content));
    const expectedOwner = group.length === 1 ? group[0] : (withContent.length === 1 ? withContent[0] : null);
    for (const footnote of group) {
      if (footnote.isOwner !== (footnote === expectedOwner)) return fail("I11", `owner of ${id} is wrong at ${keyOf(footnote)}`);
      if (footnote.conflict !== (group.length > 1)) return fail("I11", `conflict flag of ${keyOf(footnote)}`);
      const expectedCount = footnote === expectedOwner ? (markerCounts.get(id) || 0) : 0;
      if (footnote.referenceCount !== expectedCount) return fail("I11", `references of ${keyOf(footnote)}`);
    }
  }

  // I9 the owner of a number never depends on the order of its definitions
  for (const [id, group] of groups) {
    if (group.length < 2) continue;
    const reversed = core.parseFootnotes(reverseGroup(text, group)).footnotes.filter((footnote) => footnote.id === id);
    const sameContents = (list) => list.map((footnote) => footnote.content).sort().join("\u0000");
    // Moving a multi-line block can change how its neighbours parse; only
    // compare when the same definitions came back.
    if (sameContents(reversed) !== sameContents(group)) continue;
    if (ownerContentOf(reversed) !== ownerContentOf(group)) return fail("I9", `owner of ${id} changed with the order of its definitions`);
  }

  // I13 renumbering a footnote (as Tidy does) is never taken for adding one
  if (parsed.footnotes.length > 0) {
    const from = parsed.footnotes[0].id;
    const renumbered = core.parseFootnotes(text.split(`[^${from}]`).join("[^q9]"));
    const seenAsNew = core.detectAddedFootnotes(
      renumbered.footnotes,
      core.listKnownFootnoteIds(parsed),
      parsed.footnotes.map((footnote) => core.createFootnoteSnapshot(footnote)),
      renumbered.hiddenDefinitionIds,
    );
    if (seenAsNew.length) return fail("I13", `renumbering [^${from}] was seen as adding ${seenAsNew.map(keyOf).join(", ")}`);
  }

  // I14 "+" adds exactly one empty definition with the next free number,
  // changes nothing else, and no plain line follows it directly (Obsidian
  // would read that line as the new footnote's text, taking it from another)
  {
    const plan = core.planNewFootnoteDefinition(rawText);
    const numbers = [...parsed.footnotes, ...parsed.references]
      .map((item) => item.id)
      .filter((id) => /^\d+$/.test(id))
      .map(Number);
    const expectedId = String((numbers.length ? Math.max(...numbers) : 0) + 1);
    if (plan.id !== expectedId) return fail("I14", `new number ${plan.id}, expected ${expectedId}`);
    if (zones.some(([start, end]) => plan.at > start && plan.at < end)) return fail("I14", "inserted inside a zone");
    const after = text.slice(0, plan.at) + plan.insert + text.slice(plan.at);
    const reparsed = core.parseFootnotes(after);
    if (reparsed.footnotes.length !== parsed.footnotes.length + 1) return fail("I14", "not exactly one more definition");
    const created = reparsed.footnotes.filter((footnote) => footnote.id === expectedId);
    if (created.length !== 1 || created[0].content !== "" || created[0].referenceCount !== 0) {
      return fail("I14", "the new definition is not one empty, unreferenced definition");
    }
    const damage = othersUnchanged(parsed, after, () => false);
    if (damage) return fail("I14", damage);
    const newLineEnd = after.indexOf("\n", created[0].definitionStart);
    if (newLineEnd !== -1) {
      const below = after.slice(newLineEnd + 1).split("\n")[0];
      const afterZones = core.getMarkdownExclusionZones(reparsed.text, reparsed.lineStarts);
      const belowInZone = afterZones.some((zone) => newLineEnd + 1 >= zone.start && newLineEnd + 1 < zone.end);
      const startsBlock = /^ {0,3}(#{1,6}(\s|$)|`{3,}|~{3,}|>|[-+*](\s|$)|\d{1,9}[.)](\s|$)|\[\^[^\]\n]+\]:)/.test(below);
      if (below.trim() && !startsBlock && !belowInZone) return fail("I14", `plain line right below the new definition: ${JSON.stringify(below)}`);
    }
  }

  // I15 a phrase in double quotes, taken from a footnote, finds that footnote
  // and every highlight reads back as the phrase (across line breaks too)
  for (const footnote of parsed.footnotes.slice(0, 3)) {
    if (core.isReminderDefinition(footnote)) continue;
    const words = footnote.content.split(/\s+/).filter(Boolean);
    const plain = (word) => /^[\p{L}\p{N}]+$/u.test(word);
    let tried = 0;
    for (let index = 0; index + 1 < words.length && tried < 3; index += 1) {
      if (!plain(words[index]) || !plain(words[index + 1])) continue;
      tried += 1;
      const phrase = `${words[index]} ${words[index + 1]}`;
      const results = core.findFootnoteSearchResults(parsed.footnotes, `"${phrase}"`);
      const found = results.some((result) => result.footnoteId === footnote.id && result.occurrence === footnote.occurrence && result.match);
      if (!found) return fail("I15", `phrase ${JSON.stringify(phrase)} did not find ${keyOf(footnote)}`);
      for (const result of results) {
        if (!result.match) continue;
        const card = parsed.footnotes.find((item) => item.id === result.footnoteId && item.occurrence === result.occurrence);
        const slice = card.content.slice(result.match.start, result.match.end).replace(/\s+/g, " ");
        if (slice.toLowerCase() !== phrase.toLowerCase()) return fail("I15", `highlight ${JSON.stringify(slice)} for phrase ${JSON.stringify(phrase)}`);
      }
    }
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
      // I10 a number in conflict shares its markers: deleting one of its
      // definitions removes no marker
      if (target.conflict && rest.includes(`[^${target.id}]`)) return fail("I10", `conflict delete removed a marker of ${target.id}`);
      if (!target.conflict) rest = rest.split(`[^${target.id}]`).join("");
      if (rest !== "" && rest !== "\n") return fail("I1", `removed unexpected text ${JSON.stringify(removed)}`);
      rebuilt = rebuilt.slice(0, range.start) + rebuilt.slice(range.end);
    }
    if (rebuilt !== deleted.text) return fail("I1", "result is not the original minus the removed ranges");
    for (const zone of zoneTexts) if (!deleted.text.includes(zone)) return fail("I7", "delete touched a zone");
    const deleteDamage = othersUnchanged(parsed, deleted.text, (footnote) => footnote.id === target.id);
    if (deleteDamage) return fail("I2", deleteDamage);
    // I12 undoing a deletion brings back that very definition: which one of a
    // number is new is told by content, not by its place among the others
    const afterDelete = core.parseFootnotes(deleted.text);
    const restored = core.detectAddedFootnotes(
      parsed.footnotes,
      core.listKnownFootnoteIds(afterDelete),
      afterDelete.footnotes.map((footnote) => core.createFootnoteSnapshot(footnote)),
      parsed.hiddenDefinitionIds,
    );
    const fingerprintOf = (footnote) => core.createFootnoteSnapshot(footnote).contentFingerprint;
    const twins = parsed.footnotes.filter((footnote) => footnote.id === target.id && fingerprintOf(footnote) === fingerprintOf(target));
    // A definition hidden in code counts as known (1.5.6), so it cannot be told new.
    if (twins.length === 1 && !parsed.hiddenDefinitionIds.includes(target.id)) {
      if (restored.length !== 1 || keyOf(restored[0]) !== keyOf(target)) {
        return fail("I12", `undoing the deletion of ${keyOf(target)} was seen as ${restored.map(keyOf).join(", ") || "nothing"}`);
      }
    }
    const remainingReferences = core.parseFootnotes(deleted.text).references.filter((reference) => reference.id === target.id).length;
    const expectedReferences = target.conflict ? (markerCounts.get(target.id) || 0) : 0;
    if (remainingReferences !== expectedReferences) return fail(target.conflict ? "I10" : "I2", `references of ${target.id} after delete`);

    // I3 + I4 editing changes only this definition and round-trips
    const content = CONTENTS[(index * 3 + 1) % CONTENTS.length];
    const written = core.replaceFootnoteContent(rawText, target.id, content, { expectedContent: target.content, occurrence: target.occurrence });
    if (written.changed) {
      if (written.text.slice(0, target.definitionStart) !== text.slice(0, target.definitionStart)) return fail("I3", "text before the definition changed");
      const tail = text.length - target.definitionEnd;
      if (written.text.slice(written.text.length - tail) !== text.slice(target.definitionEnd)) return fail("I3", "text after the definition changed");
      const editDamage = othersUnchanged(
        parsed,
        written.text,
        (footnote) => keyOf(footnote) === keyOf(target),
        target.conflict ? target.id : null,
      );
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
        const card = parsed.footnotes.find((footnote) => footnote.id === result.footnoteId && footnote.occurrence === result.occurrence);
        if (!card) return fail("I8", `search result names no card (${result.footnoteId}#${result.occurrence})`);
        if (!result.match) continue;
        if (core.isReminderDefinition(card)) return fail("I8", `text selection inside reminder card ${keyOf(card)}`);
        const slice = card.content.slice(result.match.start, result.match.end);
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
