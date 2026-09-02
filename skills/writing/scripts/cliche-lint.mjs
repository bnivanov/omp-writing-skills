#!/usr/bin/env node
/**
 * Deterministic LLM cliché linter (CLI).
 *
 * Pattern finders adapted from Simon Willison's LLM cliché highlighter:
 *   https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html
 * Copyright Simon Willison. Licensed under the Apache License, Version 2.0.
 * See third_party/APACHE-2.0.txt and NOTICE.
 *
 * Modifications for omp-writing-skills (2026): file CLI, fenced-code masking,
 * line:col reporting, --off/--json/--self-test. Not a web highlighter.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHAIN_BODY = String.raw`[^,.;:!?\n\u2013\u2014\u2026]*`;
const CHAIN_SEP = String.raw`(?:\s*,\s*(?:and\s+|or\s+)?|\s+(?:and|or)\s+|\s*[;&\u2013\u2014]\s*(?:and\s+|or\s+)?|\s+-{1,2}\s+)`;
const CHAIN_SPLIT = new RegExp(CHAIN_SEP, "i");

function makeChainFinder(head, headTest, itemLabel) {
  const item = head + CHAIN_BODY;
  const chain = new RegExp(String.raw`\b${item}(?:${CHAIN_SEP}${item})+`, "gi");
  return function (text) {
    const found = [];
    for (const m of text.matchAll(chain)) {
      let end = m.index + m[0].length;
      while (end > m.index && /\s/.test(text[end - 1])) end -= 1;
      const count = m[0].split(CHAIN_SPLIT).filter((p) => headTest.test(p.trim())).length;
      found.push({
        start: m.index,
        end,
        count,
        badge: String(count),
        badgeTitle: count + " " + itemLabel + (count === 1 ? "" : "s"),
      });
    }
    return found;
  };
}

function makeRegexFinder(re) {
  return function (text) {
    const found = [];
    for (const m of text.matchAll(re)) {
      found.push({ start: m.index, end: m.index + m[0].length });
    }
    return found;
  };
}

function makeEchoFinder({ minGram = 3, minRun = 2 } = {}) {
  const SENT = /[^.!?\n]+[.!?]?/g;
  const grams = (s, n) => {
    const w = s.toLowerCase().match(/[a-z0-9'’-]+/g) || [];
    const out = new Set();
    for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
    return out;
  };
  return function (text) {
    const sents = [];
    for (const m of text.matchAll(SENT)) {
      if ((m[0].match(/\S+/g) || []).length >= 4) {
        sents.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }
    const found = [];
    let i = 0;
    while (i < sents.length) {
      let j = i;
      let shared = null;
      while (j + 1 < sents.length) {
        if (sents[j + 1].start - sents[j].end > 3) break;
        const a = grams(sents[j].text, minGram);
        const b = grams(sents[j + 1].text, minGram);
        const common = [...a].filter((g) => b.has(g));
        if (!common.length) break;
        shared = common.sort((x, y) => y.length - x.length)[0];
        j += 1;
      }
      const run = j - i + 1;
      if (run >= minRun && shared) {
        let end = sents[j].end;
        while (end > sents[i].start && /\s/.test(text[end - 1])) end -= 1;
        found.push({
          start: sents[i].start,
          end,
          count: run,
          badge: String(run),
          badgeTitle: run + " sentences echoing “" + shared + "”",
        });
        i = j + 1;
      } else {
        i += 1;
      }
    }
    return found;
  };
}

function makeQuestionChainFinder({ minRun = 2 } = {}) {
  const chain = /[^.!?\n]+\?(?:\s+[^.!?\n]+\?)+/g;
  return function (text) {
    const found = [];
    for (const m of text.matchAll(chain)) {
      const count = (m[0].match(/\?/g) || []).length;
      if (count < minRun) continue;
      let start = m.index;
      while (start < m.index + m[0].length && /\s/.test(text[start])) start += 1;
      found.push({
        start,
        end: m.index + m[0].length,
        count,
        badge: String(count),
        badgeTitle: count + " questions in a row",
      });
    }
    return found;
  };
}

const ANAPHORA_SKIP =
  /^(?:i|it|the|a|an|this|that|we|you|they|he|she|there|but|and|so|in|as|if|my|his|her|their|its|these|those|for|at|on|of|to|is|was)$/i;

function makeAnaphoraFinder({ minRun = 3 } = {}) {
  const SENT = /[^.!?\n]+[.!?]/g;
  return function (text) {
    const sents = [];
    for (const m of text.matchAll(SENT)) {
      const w = m[0].match(/[A-Za-z'’-]+/);
      if (w) {
        sents.push({
          start: m.index + m[0].indexOf(w[0]),
          end: m.index + m[0].length,
          head: w[0].toLowerCase(),
        });
      }
    }
    const found = [];
    let i = 0;
    while (i < sents.length) {
      let j = i;
      while (
        j + 1 < sents.length &&
        sents[j + 1].head === sents[i].head &&
        sents[j + 1].start - sents[j].end < 4
      ) {
        j += 1;
      }
      const run = j - i + 1;
      if (run >= minRun && !ANAPHORA_SKIP.test(sents[i].head)) {
        found.push({
          start: sents[i].start,
          end: sents[j].end,
          count: run,
          badge: String(run),
          badgeTitle: run + " sentences opening “" + sents[i].head + "”",
        });
        i = j + 1;
      } else i += 1;
    }
    return found;
  };
}

const WIKI_GROUP = "Signs of AI writing (Wikipedia)";

export const patterns = [
  {
    id: "no-chain",
    name: "“No X, no Y” chains",
    description: "Two or more “no …” items in a row.",
    find: makeChainFinder(String.raw`no[-\s]`, /^no[-\s]/i, "“no” item"),
  },
  {
    id: "whole",
    name: "“That’s the whole …”",
    description: "That / this is the whole point, game, thing …",
    find: makeRegexFinder(/\b(?:that|this)(?:['\u2019]s|\s+(?:is|was))\s+the\s+whole\b(?:\s+\w+)?/gi),
  },
  {
    id: "did-not-chain",
    name: "“Did not X, did not Y” chains",
    description: "Two or more “did not …” or “didn’t …” items in a row.",
    find: makeChainFinder(
      String.raw`(?:did\s+not|didn['\u2019]t)\s`,
      /^(?:did\s+not|didn['\u2019]t)\s/i,
      "“did not” item",
    ),
  },
  {
    id: "dont-verb-it",
    name: "“Don’t VERB it … VERB it”",
    description: "Negated verb + it, then the same verb + it again.",
    find: makeRegexFinder(
      /\b(?:do\s+not|don['\u2019]t)\s+(?:just\s+|simply\s+|merely\s+)?(\w+)(?:\s+(?:of|about|at|on|for|with|to))?\s+it\b[^.!?\n]*?[.!?;,:\u2013\u2014]['"\u201d\u2019]*\s*(?:just\s+|simply\s+|merely\s+)?\1(?:\s+(?:of|about|at|on|for|with|to))?\s+it\b/gi,
    ),
  },
  {
    id: "sit-with",
    name: "“Sit with that”",
    description: "Reflective sit with that / this / it.",
    find: makeRegexFinder(
      /\bsit(?:s|ting)?\s+with\s+(?:that|this|it|(?:the|your)\s+(?:discomfort|feelings?|tension|weight|uncertainty|ambiguity|grief|silence|unease))\b(?:\s+for\s+a\s+\w+)?/gi,
    ),
  },
  {
    id: "already-know",
    name: "“You already know”",
    description: "You already know the answer / what / standing alone.",
    find: makeRegexFinder(
      /\byou\s+already\s+knows?\s+(?:the\s+answer|what|how|why|this|that|it|who|where)\b|\byou\s+already\s+knows?\b(?![ \t]+\w)/gi,
    ),
  },
  {
    id: "is-the-entire",
    name: "“Is the entire …”",
    description: "X is the entire point / game / business model.",
    find: makeRegexFinder(/(?:\b(?:is|was|are|were)|['\u2019]s)\s+the\s+entire\b(?:\s+\w+)?/gi),
  },
  {
    id: "the-entire-is",
    name: "“The entire … is”",
    description: "The entire point / game is …",
    find: makeRegexFinder(/\bthe\s+entire\s+[\w'\u2019-]+(?:\s+[\w'\u2019-]+){0,4}?\s+(?:is|was|are|were)\b/gi),
  },
  {
    id: "is-real",
    name: "“Is real … and / not”",
    description: "The X is real, and / not …",
    find: makeRegexFinder(
      /\bis\s+(?:(?:the|a)\s+real\b(?![\s-]+(?:estate|time|life|world|quick)\b)[^.!?\n]*?\b(?:and|not)\s+it\b|real\b(?![\s-]+(?:estate|time|life|world|quick)\b)[^.!?\n]*?\b(?:and|not)\b)/gi,
    ),
  },
  {
    id: "punchline",
    name: "“The punchline is”",
    description: "The punchline is / : / ?",
    find: makeRegexFinder(/\bthe\s+punchline(?:\s+(?:is|was|being)\b|\s*[:?])/gi),
  },
  {
    id: "worth-naming",
    name: "“Worth naming”",
    description: "Therapist-voiced worth naming.",
    find: makeRegexFinder(
      /(?:\b(?:is|are|was|were|feels?|felt|seems?|seemed)|['\u2019]s)\s+(?:\w+\s+){0,2}?worth\s+naming\b(?!\s+names\b)|\bworth\s+naming\s*:/gi,
    ),
  },
  {
    id: "not-nothing",
    name: "“That’s not nothing”",
    description: "That / this / it / which is not nothing.",
    find: makeRegexFinder(/\b(?:that|this|it|which)(?:['\u2019]s|\s+(?:is|was))\s+not\s+nothing\b/gi),
  },
  {
    id: "is-the-whole",
    name: "“Is the whole …”",
    description: "Subject is the whole point / trick / pitch.",
    find: makeRegexFinder(
      /(?:\b(?:is|was|are|were)|['’]s)\s+the\s+whole\b(?:\s+\w+)?|\bhere(?:['’]s|\s+is)\s+the\s+whole\b(?:\s+\w+)?/gi,
    ),
  },
  {
    id: "echo-triad",
    name: "Echoing sentence runs",
    description: "Consecutive sentences on the same skeleton.",
    find: makeEchoFinder({ minGram: 4, minRun: 2 }),
  },
  {
    id: "performative-honesty",
    name: "Performative honesty",
    description: "I won’t pretend / I’ll be honest / Honestly,",
    find: makeRegexFinder(
      /\bI\s+(?:will\s+not|won['’]t)\s+pretend\b|\b(?:I['’]ll|let['’]s|to)\s+be\s+(?:honest|clear|blunt|real)\b|(?:^|[.!?–—]\s+|\n)(?:Honestly|Look|Truthfully|Frankly)\s*,/gi,
    ),
  },
  {
    id: "thats-the-part",
    name: "“That’s the part …”",
    description: "Gesturing at a favoured detail instead of stating it.",
    find: makeRegexFinder(
      /\b(?:that|this|it)(?:['’]s|\s+(?:is|was))\s+the\s+part\b|\bthe\s+part\s+that\s+(?:makes|made|gets|got|keeps|kept)\s+(?:me|you|us|it)\b|\bmy\s+favou?rite\s+part\s+of\b/gi,
    ),
  },
  {
    id: "the-only-i-trust",
    name: "“The only X I trust”",
    description: "Narrowing superlative reveal.",
    find: makeRegexFinder(
      /\bthe\s+only\s+[\w'’-]+(?:\s+[\w'’-]+){0,2}?\s+(?:I|you|we|it|he|she|they)\s+(?:trust|need|needs|care|want|wants|use|uses|believe)\b|\bthe\s+only\s+[\w'’-]+\s+that\s+(?:matters|counts|works|survives)\b/gi,
    ),
  },
  {
    id: "take-my-word",
    name: "“Don’t take my word for it”",
    description: "Stock invitation to verify.",
    find: makeRegexFinder(
      /\b(?:you\s+)?(?:do\s+not|don['’]t)\s+(?:have\s+to\s+)?take\s+my\s+word\s+for\s+(?:it|any\s+of\s+(?:it|this|that))\b/gi,
    ),
  },
  {
    id: "turns-out",
    name: "“Turns out …”",
    description: "Casual-revelation opener.",
    find: makeRegexFinder(/(?:^|[.!?–—]\s+|\n)Turns\s+out\b|\bit\s+turns\s+out\s+that\b/gi),
  },
  {
    id: "fits-in-your-head",
    name: "“Fits in your head”",
    description: "Dev-blog boilerplate for simplicity.",
    find: makeRegexFinder(
      /\b(?:hold|fit|fits|holds|held)\s+(?:it\s+)?in\s+your\s+head\b|\bbatteries[-\s]included\b|\bit\s+just\s+works\b|\bzero[-\s]config(?:uration)?\b|\bsane\s+defaults\b/gi,
    ),
  },
  {
    id: "stacked-questions",
    name: "Stacked rhetorical questions",
    description: "Two or more questions in a row.",
    find: makeQuestionChainFinder({ minRun: 2 }),
  },
  {
    id: "sentence-anaphora",
    name: "Repeated sentence openers",
    description: "Three or more consecutive sentences starting on the same word.",
    find: makeAnaphoraFinder({ minRun: 3 }),
  },
  {
    id: "colon-triple",
    name: "Colon into a triple",
    description: "A colon opening onto three or more comma-separated items. Noisy in docs.",
    find: makeRegexFinder(/:\s+[^.!?;:\n]{2,40},\s+[^.!?;:\n]{2,40},\s+(?:and\s+|or\s+)?[^.!?;:\n]{2,40}(?=[.!?\n])/g),
  },
  {
    id: "heres-the-twist",
    name: "“Here’s the twist”",
    description: "Stage-managed reveal.",
    find: makeRegexFinder(
      /\bhere(?:['’]s|\s+is)\s+(?:the|a|my|one)\s+(?:twist|thing|catch|kicker|rub|problem|first|second|third|next|recent|real|best|worst|surprising|interesting|key|important)\b[\w\s-]{0,20}[:.]/gi,
    ),
  },
  {
    id: "x-is-dead",
    name: "“X is dead”",
    description: "Obituary headline and long live sequel.",
    find: makeRegexFinder(/\b[\w\s]{3,30}\s+(?:is|are)\s+dead\b|\blong\s+live\s+\w+/gi),
  },
  {
    id: "thats-why-mattered",
    name: "“That’s why X mattered”",
    description: "Retroactively assigning significance.",
    find: makeRegexFinder(
      /\b(?:that|this)(?:['’]s|\s+(?:is|was))\s+why\b[^.!?\n]{0,80}?\b(?:matter(?:s|ed)?|count(?:s|ed)?)\b/gi,
    ),
  },
  {
    id: "stranded-auxiliary",
    name: "Stranded auxiliary contrast",
    description: "Clause landing on a bare auxiliary for the reversal.",
    find: makeRegexFinder(
      /[;:,]\s+[^.;:!?\n]{2,50}\s(?:did|does|do|was|were|is|are|has|have|had|can|could|would|will)(?:n['’]t)?\s*[.;]|\b(?:Maybe|Perhaps)\s+\w+[^.!?\n]{0,40}\s(?:would|could|might|should|did|had|was|is)(?:n['’]t)?\s+(?:have\s*)?\./g,
    ),
  },
  {
    id: "ai-vocab",
    group: WIKI_GROUP,
    name: "AI vocabulary words",
    description: "delve, tapestry, meticulous, pivotal, …",
    find: makeRegexFinder(
      /\b(?:delv(?:e|es|ed|ing)|tapestr(?:y|ies)|meticulous(?:ly)?|pivotal|intricate(?:ly)?|intricacies|interplay|underscor(?:e|es|ed|ing)|garner(?:s|ed|ing)?|bolster(?:s|ed|ing)?|vibrant|bustling|multifaceted|seamless(?:ly)?|commendable|ever-evolving)\b/gi,
    ),
  },
  {
    id: "not-just",
    group: WIKI_GROUP,
    name: "“Not just X, but Y”",
    description: "Negative parallelisms and it’s not X — it’s Y.",
    find: makeRegexFinder(
      /\bnot\s+(?:just|only|merely|simply)\s+[^.!?\n;]*?\bbut(?:\s+also)?\b|\b(?:it|this|that)(?:['\u2019]s|\s+(?:is|was))\s+not\s+[^.!?\n,;\u2014\u2013]{1,60}[,;\u2014\u2013]\s*(?:it|this|that)(?:['\u2019]s|\s+(?:is|was))\b/gi,
    ),
  },
  {
    id: "note-that",
    group: WIKI_GROUP,
    name: "“It’s important to note”",
    description: "Didactic hedging.",
    find: makeRegexFinder(
      /\bit(?:['\u2019]s|\s+(?:is|was))\s+(?:also\s+)?(?:important|worth|crucial|essential|vital)\s+(?:to\s+(?:note|remember|understand|recognize|mention|pause|consider|ask)|noting|mentioning|remembering|pausing|considering|asking)\b(?:\s+that\b)?|\bit\s+should\s+be\s+noted\b/gi,
    ),
  },
  {
    id: "testament",
    group: WIKI_GROUP,
    name: "“Stands as a testament”",
    description: "Inflating significance.",
    find: makeRegexFinder(
      /\b(?:stand|stands|stood|serve|serves|served|standing|serving)\s+as\s+(?:a|an)\s+(?:\w+\s+)?(?:testament|reminder)\b|\b(?:is|was|are|were|remain|remains)\s+a\s+(?:\w+\s+)?testament\s+to\b/gi,
    ),
  },
  {
    id: "crucial-role",
    group: WIKI_GROUP,
    name: "“Plays a crucial role”",
    description: "Plays a crucial / pivotal / vital role.",
    find: makeRegexFinder(
      /\bplay(?:s|ed|ing)?\s+(?:a|an)\s+(?:\w+\s+)?(?:crucial|pivotal|vital|key|significant|central|critical|important)\s+role\b/gi,
    ),
  },
  {
    id: "landscape",
    group: WIKI_GROUP,
    name: "“Ever-evolving landscape”",
    description: "Scene-setting boilerplate.",
    find: makeRegexFinder(
      /\b(?:ever-)?(?:evolving|changing|shifting)\s+landscape\b|\bin\s+today['\u2019]s\s+(?:fast-paced|ever-changing|ever-evolving|digital|modern|competitive)\s+\w+/gi,
    ),
  },
  {
    id: "vague-experts",
    group: WIKI_GROUP,
    name: "“Experts argue”",
    description: "Vague attribution to unnamed authorities.",
    find: makeRegexFinder(
      /\b(?:many|some|several|most|numerous)?\s*(?:experts|critics|observers|scholars|analysts|commentators)\s+(?:have\s+|often\s+|widely\s+)?(?:argu(?:e|es|ed)|not(?:e|es|ed)|suggest(?:s|ed)?|believ(?:e|es|ed)|agree[ds]?|contend(?:s|ed)?|observ(?:e|es|ed)|caution(?:s|ed)?|claim(?:s|ed)?|cit(?:e|es|ed)|point(?:s|ed)?\s+out)\b|\bindustry\s+reports?\s+(?:suggest|indicate|show)\w*\b/gi,
    ),
  },
  {
    id: "despite-challenges",
    group: WIKI_GROUP,
    name: "“Despite these challenges”",
    description: "Challenges-and-outlook formula.",
    find: makeRegexFinder(
      /\bdespite\s+(?:these|those|such|its|their|the|numerous|significant|ongoing)\s+(?:\w+\s+)?challenges\b|\bfac(?:e|es|ed|ing)\s+(?:several|numerous|many|significant|various|a\s+number\s+of)\s+challenges\b|\bchallenges\s+remain\b|\bremains\s+to\s+be\s+seen\b|\b(?:only\s+)?time\s+will\s+tell\b/gi,
    ),
  },
  {
    id: "participle-tail",
    group: WIKI_GROUP,
    name: "Participle sentence tails",
    description: "…, highlighting / underscoring / showcasing …",
    find: makeRegexFinder(
      /,\s+(?:highlighting|underscoring|emphasizing|showcasing|reflecting|demonstrating|illustrating|signaling|solidifying|cementing|reinforcing|underlining)\s+(?:its|his|her|their|our|the|a|an|how|that|what|both)\b[^.!?\n]*/gi,
    ),
  },
  {
    id: "promo",
    group: WIKI_GROUP,
    name: "Promotional boilerplate",
    description: "nestled in, hidden gem, breathtaking.",
    find: makeRegexFinder(
      /\bnestled\s+(?:in|on|among|between|along|at)\b|\bin\s+the\s+heart\s+of\b|\brich\s+(?:cultural\s+|historical\s+)?(?:heritage|history|tapestry)\b|\bhidden\s+gem\b|\bmust-(?:visit|see|try)\b|\bbreathtaking\b|\bboasts?\s+(?:a|an|the)\b|\bstunning\s+(?:views?|scenery|architecture|backdrop)\b/gi,
    ),
  },
  {
    id: "ai-leftovers",
    group: WIKI_GROUP,
    name: "Chatbot leftovers",
    description: "as an AI language model, oaicite, utm_source=",
    find: makeRegexFinder(
      /\bas\s+an\s+ai(?:\s+language)?\s+model\b|\bas\s+of\s+my\s+last\s+(?:update|training)\b|\bknowledge\s+cutoff\b|\bI\s+(?:cannot|can['\u2019]t|do\s+not|don['\u2019]t)\s+(?:browse\s+the\s+internet|access\s+real-?time)\b|contentReference|oaicite|turn0(?:search|news|image)\d*|attributableIndex|utm_source=/gi,
    ),
  },
];

export const patternsById = Object.fromEntries(patterns.map((p) => [p.id, p]));

export function maskProtected(text) {
  let out = text;
  out = out.replace(/(^|\n)(```[\s\S]*?\n```|~~~[\s\S]*?\n~~~)/g, (m) => m.replace(/[^\n]/g, " "));
  out = out.replace(/`[^`\n]+`/g, (m) => " ".repeat(m.length));
  return out;
}

export function offsetToLineCol(text, offset) {
  let line = 1;
  let col = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return { line, col };
}

export function collectMatches(text, enabled) {
  const matches = [];
  for (const p of patterns) {
    if (enabled && !enabled.has(p.id)) continue;
    for (const hit of p.find(text)) {
      matches.push({ ...hit, patternId: p.id, name: p.name });
    }
  }
  matches.sort((a, b) => a.start - b.start || a.end - b.end);
  return matches;
}

export const patternCases = [
  ["no-chain", "No sign-ups, no downloads, no hassle — just paste and go.", 1, [3]],
  ["no-chain", "The plan has no hidden fees and no long-term contracts.", 1, [2]],
  ["no-chain", "No fluff, no filler, no jargon, no corporate buzzwords.", 1, [4]],
  ["no-chain", "There is no catch here, honestly.", 0, []],
  ["no-chain", "It ships with no bells and whistles, no fluff.", 1, [2]],
  ["no-chain", "No, no, I insist.", 0, []],
  ["no-chain", "no no no", 0, []],
  ["no-chain", "with no list patterns at all, so nothing lights up.", 0, []],
  ["no-chain", "NO FEES, NO CONTRACTS, NO SURPRISES", 1, [3]],
  ["no-chain", "no fluff; no filler", 1, [2]],
  ["no-chain", "no time, no money, no way to say no thanks", 1, [3]],
  ["no-chain", "no-code, no-fuss setup", 1, [2]],
  ["no-chain", "I know nothing, notice nothing.", 0, []],
  ["no-chain", "No fluff, no filler.\nNo ads here.", 1, [2]],
  ["whole", "That's the whole point.", 1],
  ["whole", "This is the whole game, really.", 1],
  ["whole", "That was the whole pitch.", 1],
  ["whole", "The whole team showed up.", 0],
  ["did-not-chain", "Did not flinch, did not blink, did not apologize.", 1, [3]],
  ["did-not-chain", "He didn't call and didn't write.", 1, [2]],
  ["did-not-chain", "She did not go.", 0, []],
  ["did-not-chain", "Did not know why, did not care.", 1, [2]],
  ["dont-verb-it", "Don't call it a comeback. Call it a return.", 1],
  ["dont-verb-it", "Do not think of it as a burden. Think of it as fuel.", 1],
  ["dont-verb-it", "Don't fear it. Name it.", 0],
  ["dont-verb-it", "Don’t call it \"luck.\" Call it preparation.", 1],
  ["dont-verb-it", "Don't just read it — read it aloud.", 1],
  ["dont-verb-it", "Don't overthink it.", 0],
  ["sit-with", "Sit with that for a moment.", 1],
  ["sit-with", "Just sit with it.", 1],
  ["sit-with", "She was sitting with the discomfort.", 1],
  ["sit-with", "Come sit with us at lunch.", 0],
  ["already-know", "You already know the answer.", 1],
  ["already-know", "Deep down, you already know.", 1],
  ["already-know", "If you already know Python, skip ahead.", 0],
  ["already-know", "You already know what to do.", 1],
  ["already-know", "Part of you already knows it.", 1],
  ["is-the-entire", "Consistency is the entire game.", 1],
  ["is-the-entire", "That's the entire business model.", 1],
  ["is-the-entire", "He toured the entire factory.", 0],
  ["the-entire-is", "The entire point is that nobody reads.", 1],
  ["the-entire-is", "The entire business model is built on churn.", 1],
  ["the-entire-is", "The entire point of the exercise is repetition.", 1],
  ["the-entire-is", "He ate the entire pizza.", 0],
  ["the-entire-is", "The entire team was exhausted.", 1],
  ["the-entire-is", "The entire history of the modern industrial world economy is complex.", 0],
  ["is-real", "The improvement is real, and it's not subtle.", 1],
  ["is-real", "This is the real work, and it never ends.", 1],
  ["is-real", "The demand is real and growing.", 1],
  ["is-real", "He is a real estate agent and it shows.", 0],
  ["is-real", "Is it real? And does it matter?", 0],
  ["is-real", "The painting is real, but stolen.", 0],
  ["punchline", "The punchline is that nobody laughed.", 1],
  ["punchline", "The punchline: nothing changed.", 1],
  ["punchline", "And the punchline? You knew.", 1],
  ["punchline", "He forgot the punchline entirely.", 0],
  ["worth-naming", "That loss is real and it's worth naming.", 1],
  ["worth-naming", "It’s worth naming that this hurts.", 1],
  ["worth-naming", "The grief here is worth naming.", 1],
  ["worth-naming", "That anger feels worth naming out loud.", 1],
  ["worth-naming", "Worth naming: nobody asked for this.", 1],
  ["worth-naming", "It's not worth naming names here.", 0],
  ["worth-naming", "They spent the meeting naming the new mascot.", 0],
  ["worth-naming", "The naming convention is worth documenting.", 0],
  ["not-nothing", "That's not nothing.", 1],
  ["not-nothing", "Ten sign-ups in a week — that is not nothing.", 1],
  ["not-nothing", "It's not nothing, even if it's not everything.", 1],
  ["not-nothing", "The launch drew a small crowd, which was not nothing.", 1],
  ["not-nothing", "She insisted that nothing was wrong.", 0],
  ["not-nothing", "There is nothing left to say.", 0],
  ["is-the-whole", "Distribution is the whole game.", 1],
  ["is-the-whole", "Here's the whole pitch in one slide.", 1],
  ["is-the-whole", "That was the whole point of the meeting.", 1],
  ["is-the-whole", "The whole team showed up.", 0],
  ["echo-triad", "A shopping cart is an object in the system. A chat room is an object in the system.", 1, [2]],
  [
    "echo-triad",
    "The parser is a state machine. The renderer is a state machine. The scheduler is a state machine.",
    1,
    [3],
  ],
  ["echo-triad", "The parser is fast today. The renderer is fast today.", 0, []],
  ["echo-triad", "The parser is fast. The tests are slow.", 0, []],
  ["performative-honesty", "I won't pretend the migration was painless.", 1],
  ["performative-honesty", "Let's be honest: nobody reads the docs.", 1],
  ["performative-honesty", "To be clear, the API is unchanged.", 1],
  ["performative-honesty", "Honestly, it was fine.", 1],
  ["performative-honesty", "She answered honestly.", 0],
  ["performative-honesty", "Look at the diagram.", 0],
  ["thats-the-part", "That's the part a counter can't reach.", 1],
  ["thats-the-part", "The part that makes me trust the rest is the errata.", 1],
  ["thats-the-part", "My favorite part of the demo was the undo.", 1],
  ["thats-the-part", "He played the part of the villain.", 0],
  ["the-only-i-trust", "It’s the only marketing I trust.", 1],
  ["the-only-i-trust", "The only benchmark that matters is retention.", 1],
  ["the-only-i-trust", "The only thing it needs is a cache.", 1],
  ["the-only-i-trust", "She was the only engineer on call.", 0],
  ["take-my-word", "You don't have to take my word for it.", 1],
  ["take-my-word", "Don't take my word for any of this.", 1],
  ["take-my-word", "He kept his word.", 0],
  ["turns-out", "Turns out the cache was never warm.", 1],
  ["turns-out", "It turns out that nobody tested it.", 1],
  ["turns-out", "She turns out solid work every week.", 0],
  ["fits-in-your-head", "The design is small enough to hold in your head.", 1],
  ["fits-in-your-head", "It ships with sane defaults and zero config.", 2],
  ["fits-in-your-head", "Install it and it just works.", 1],
  ["fits-in-your-head", "We choose boring technology on purpose.", 0],
  ["fits-in-your-head", "The helmet fits your head.", 0],
  ["stacked-questions", "Do I know how it works? Where it breaks? Which corners it cut?", 1, [3]],
  ["stacked-questions", "Was it worth it? Would I do it again?", 1, [2]],
  ["stacked-questions", "Did it work? Yes, and then some.", 0, []],
  ["stacked-questions", "What changed?", 0, []],
  ["sentence-anaphora", "Maybe nobody needed it. Maybe the timing was off. Maybe both.", 1, [3]],
  ["sentence-anaphora", "Maybe nobody needed it. Maybe the timing was off.", 0, []],
  ["sentence-anaphora", "The parser is small. The renderer is small. The scheduler is small.", 0, []],
  ["sentence-anaphora", "Everything changed. Everything slowed down. Everything cost more.", 1, [3]],
  ["colon-triple", "The fix needs three things: separate ports, separate processes, and separate state.", 1],
  ["colon-triple", "Each service gets its own everything: ports, processes, local state.", 1],
  ["colon-triple", "The recipe calls for flour, butter, and sugar.", 0],
  ["colon-triple", "Note: the flag is off by default.", 0],
  ["heres-the-twist", "Here's the twist: nobody clicked it.", 1],
  ["heres-the-twist", "Here is the thing. The demo was fake.", 1],
  ["heres-the-twist", "Here's a surprising result: it got faster.", 1],
  ["heres-the-twist", "Here's the door code.", 0],
  ["x-is-dead", "Peer code review is dead.", 1],
  ["x-is-dead", "The old importer is dead; long live the importer.", 2],
  ["x-is-dead", "Long live the king.", 1],
  ["x-is-dead", "He played dead until the bear left.", 0],
  ["thats-why-mattered", "That's why being able to open the environment mattered.", 1],
  ["thats-why-mattered", "This is why preserving every conversation mattered.", 1],
  ["thats-why-mattered", "That's why the deadline counts.", 1],
  ["thats-why-mattered", "That is why we left early.", 0],
  ["stranded-auxiliary", "The tool died; the data didn't.", 1],
  ["stranded-auxiliary", "Reading mostly passed, writing didn't.", 1],
  ["stranded-auxiliary", "Maybe it wouldn't have.", 1],
  ["stranded-auxiliary", "The test passed and the build was green.", 0],
  ["ai-vocab", "We delve into the intricacies of the interplay.", 3],
  ["ai-vocab", "Her vibrant tapestry hung in the bustling hall.", 3],
  ["ai-vocab", "A meticulously curated, seamless experience.", 2],
  ["ai-vocab", "The report was thorough and well organized.", 0],
  ["not-just", "This is not just a tool, but a philosophy.", 1],
  ["not-just", "Not only fast but also reliable.", 1],
  ["not-just", "It’s not a bug — it’s a feature.", 1],
  ["not-just", "He did not buy it.", 0],
  ["not-just", "She was not sure about the plan.", 0],
  ["note-that", "It is important to note that timing matters.", 1],
  ["note-that", "It’s worth noting the fees are separate.", 1],
  ["note-that", "It should be noted that this changed in 2020.", 1],
  ["note-that", "It's worth pausing on that number.", 1],
  ["note-that", "It is worth asking who benefits.", 1],
  ["note-that", "Please note the door code.", 0],
  ["testament", "The building stands as a testament to postwar optimism.", 1],
  ["testament", "Her career is a testament to persistence.", 1],
  ["testament", "It serves as a stark reminder that nothing lasts.", 1],
  ["testament", "He read from the Old Testament.", 0],
  ["crucial-role", "Volunteers play a crucial role in the program.", 1],
  ["crucial-role", "She played a truly pivotal role in the merger.", 1],
  ["crucial-role", "He plays the role of the villain.", 0],
  ["landscape", "Adapting to an ever-evolving landscape.", 1],
  ["landscape", "The rapidly changing landscape of retail.", 1],
  ["landscape", "In today’s fast-paced world, attention is scarce.", 1],
  ["landscape", "The landscape outside the window was gray.", 0],
  ["vague-experts", "Experts argue that the policy failed.", 1],
  ["vague-experts", "Some critics have noted a decline in quality.", 1],
  ["vague-experts", "Industry reports suggest strong demand.", 1],
  ["vague-experts", "Dr. Chen argued the opposite in her paper.", 0],
  ["despite-challenges", "Despite these challenges, growth continued.", 1],
  ["despite-challenges", "The sector faces several challenges.", 1],
  ["despite-challenges", "Whether it works remains to be seen.", 1],
  ["despite-challenges", "Only time will tell whether it sticks.", 1],
  ["despite-challenges", "Time will tell.", 1],
  ["despite-challenges", "He arrived on time and will tell you himself.", 0],
  ["despite-challenges", "The climb was a challenge.", 0],
  [
    "participle-tail",
    "The bridge reopened in June, highlighting the city’s investment in infrastructure.",
    1,
  ],
  ["participle-tail", "Sales doubled, underscoring the strength of the brand.", 1],
  ["participle-tail", "She kept highlighting passages in yellow.", 0],
  ["participle-tail", "The team, reflecting on the loss, regrouped.", 0],
  ["promo", "The inn is nestled in a quiet valley.", 1],
  ["promo", "The museum boasts a rich tapestry of exhibits.", 2],
  ["promo", "Located in the heart of downtown.", 1],
  ["promo", "A hidden gem with breathtaking views.", 2],
  ["promo", "The soup was rich and hearty.", 0],
  ["ai-leftovers", "As of my last update, the API was in beta.", 1],
  ["ai-leftovers", "As an AI language model, I cannot form opinions.", 1],
  ["ai-leftovers", "See example.com/page?utm_source=chatgpt.com for details.", 1],
  ["ai-leftovers", "contentReference[oaicite:0]{index=0}", 2],
  ["ai-leftovers", "The last update shipped on Tuesday.", 0],
];

export function runSelfTest() {
  const failures = [];
  for (const [id, sample, expectMatches, expectItems] of patternCases) {
    const p = patternsById[id];
    if (!p) {
      failures.push(`${id}: missing pattern`);
      continue;
    }
    const found = p.find(sample);
    if (found.length !== expectMatches) {
      failures.push(`${id} · “${sample.slice(0, 48)}”: expected ${expectMatches} matches, got ${found.length}`);
    } else if (expectItems && JSON.stringify(found.map((f) => f.count)) !== JSON.stringify(expectItems)) {
      failures.push(
        `${id} · “${sample.slice(0, 48)}”: expected counts ${JSON.stringify(expectItems)}, got ${JSON.stringify(found.map((f) => f.count))}`,
      );
    }
  }
  const masked = maskProtected("Prose delve here.\n\n```\ndelve into code\n```\nMore tapestry.");
  const hits = patternsById["ai-vocab"].find(masked);
  if (hits.length !== 2) {
    failures.push(`code-mask: expected 2 ai-vocab hits in masked prose, got ${hits.length}`);
  }
  return failures;
}

function parseArgs(argv) {
  const off = new Set();
  const files = [];
  let json = false;
  let list = false;
  let selfTest = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") json = true;
    else if (a === "--list") list = true;
    else if (a === "--self-test") selfTest = true;
    else if (a === "--off") {
      const ids = (argv[++i] || "").split(",").map((s) => s.trim()).filter(Boolean);
      for (const id of ids) off.add(id);
    } else if (a === "-h" || a === "--help") {
      return { help: true };
    } else if (a.startsWith("-")) {
      return { error: `unknown flag: ${a}` };
    } else {
      files.push(a);
    }
  }
  return { off, files, json, list, selfTest };
}

function lintText(text, enabled) {
  const masked = maskProtected(text);
  const matches = collectMatches(masked, enabled);
  return matches.map((m) => {
    const { line, col } = offsetToLineCol(text, m.start);
    const snippet = text.slice(m.start, m.end).replace(/\s+/g, " ").trim();
    return {
      line,
      col,
      patternId: m.patternId,
      name: m.name,
      count: m.count,
      snippet: snippet.length > 120 ? snippet.slice(0, 117) + "…" : snippet,
    };
  });
}

function usage() {
  return `usage: cliche-lint.mjs [--json] [--list] [--self-test] [--off id,id] <file> [...]
Exit 0 = clean. Exit 1 = findings. Exit 2 = error.`;
}

function main(argv) {
  const args = parseArgs(argv);
  if (args.help) {
    console.log(usage());
    return 0;
  }
  if (args.error) {
    console.error(args.error);
    console.error(usage());
    return 2;
  }
  if (args.selfTest) {
    const failures = runSelfTest();
    if (failures.length) {
      for (const f of failures) console.error("FAIL " + f);
      console.error(`${patternCases.length - failures.length} passed, ${failures.length} failed`);
      return 1;
    }
    console.log(`${patternCases.length} pattern cases passed`);
    return 0;
  }
  if (args.list) {
    for (const p of patterns) {
      const group = p.group ? ` [${p.group}]` : "";
      console.log(`${p.id}\t${p.name}${group}`);
    }
    return 0;
  }
  if (!args.files.length) {
    console.error(usage());
    return 2;
  }
  const unknown = [...args.off].filter((id) => !patternsById[id]);
  if (unknown.length) {
    console.error("unknown --off id: " + unknown.join(", "));
    return 2;
  }
  const enabled = new Set(patterns.map((p) => p.id));
  for (const id of args.off) enabled.delete(id);

  const report = [];
  for (const file of args.files) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch (err) {
      console.error(`cannot read ${file}: ${err.message}`);
      return 2;
    }
    for (const hit of lintText(text, enabled)) {
      report.push({ file, ...hit });
    }
  }
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    for (const h of report) {
      const extra = h.count ? ` ×${h.count}` : "";
      console.log(`${h.file}:${h.line}:${h.col}: ${h.patternId}${extra}  ${h.snippet}`);
    }
    if (report.length) {
      console.error(`${report.length} cliché hit${report.length === 1 ? "" : "s"}`);
    }
  }
  return report.length ? 1 : 0;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(main(process.argv.slice(2)));
}
