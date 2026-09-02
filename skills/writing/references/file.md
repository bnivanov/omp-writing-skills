---
title: In-place file de-slop
source: https://github.com/MohamedAbdallah-14/unslop
license: MIT
---

# Unslop file (in-place documentation & memory cleaner)

Adapted from [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) (MIT).

Use this mode to clean natural-language memory files (`CLAUDE.md`, `AGENTS.md`, `WATCHDOG.md`, preferences, todos, documentation) in-place without touching code or technical substrate.

Do **not** inject burstiness, contraction recipes, anti-detector paraphrases, or "soul" passes from upstream unslop. Subtractive edits only.

---

## When to use

- In-place de-slopping of an existing Markdown, text, or documentation file
- Cleaning agent instructions (`CLAUDE.md`, `AGENTS.md`) without breaking commands, file paths, or markdown tables
- Stripping corporate sycophancy, stock vocabulary, and negative-parallelism tricolons

---

## The Preservation Contract (strictly immutable)

Everything matching the following must remain **100% byte-for-byte untouched**:
- **YAML & TOML front matter** (`--- ... ---` / `+++ ... +++`) — never edit metadata, skill names, descriptions, or parameters
- **HTML/XML tags & directives** (`<system-directive>`, `<system-reminder>`, `<tag>`, `<!-- ... -->`)
- **Fenced code blocks** (```` ```...``` ```` and `~~~...~~~`, any length) — never edit, reformat, or re-indent code inside fences
- **Indented code blocks** (4-space or tab indentation)
- **Inline code** (`` `...` `` and multi-backtick spans `` ``...`` ``)
- **URLs and markdown links** (`[text](url)`)
- **File paths** (e.g. `./src/`, `/etc/`, `C:\Users\...`)
- **CLI commands** (`npm install`, `git rebase`, `docker run`)
- **Identifiers & technical terms** (`KV cache`, `idempotencyKey`, `findUser`)
- **Numerics, dates, and version numbers** (`2026-08-28`, `v1.4.2`, `40ms`)
- **Environment variables** (`$HOME`, `${NODE_ENV}`)
- **Markdown headings & table structures**

---

## Intensity modes

| Mode | Target patterns | Recommended context |
|---|---|---|
| **`subtle`** | Stock vocabulary and AI frequency markers only (`delve`, `tapestry`, `pivotal`). | Minimal touch on existing well-structured docs. |
| **`balanced`** (Default) | Stock vocabulary, sycophancy, hedging, transitions, authority tropes, signposting, performative balance, em-dash pileups. | Everyday documentation, READMEs, and memory files. |
| **`full`** | Balanced + filler phrases (`in order to` → `to`, `due to the fact that` → `because`) + negative-parallelism tricolons (`"No X, no Y, no Z"`). | Slop-heavy LLM outputs, draft release notes, marketing copy. |

---

## Pattern rules

- **Sycophancy openers:** `"Great question!"`, `"Certainly!"`, `"I'd be happy to help"`, `"Sure thing!"`, `"What a fascinating..."`
- **Stock vocabulary:** `delve`, `tapestry`, `testament` (praise), `navigate`/`embark`/`journey` (figurative), `realm`, `landscape` (figurative), `pivotal`, `paramount`, `seamless`, `holistic`, `leverage` (filler verb), `robust` (filler), `comprehensive` (when `complete` works), `cutting-edge`, `state-of-the-art` (filler), `interplay`, `intricate`, `vibrant`, `underscore` (figurative), `ever-evolving`, `ever-changing`, `in today's (digital) world/age`, `dynamic landscape`.
- **Hedging openers:** `"It is important to note that"`, `"It's worth mentioning"`, `"Generally speaking"`, `"In essence"`, `"At its core"`, `"It should be noted that"`.
- **Authority tropes:** `"Fundamentally,"`, `"In reality,"`, `"What really matters is"`, `"At the heart of X is"`.
- **Signposting announcements:** `"Let's dive in"`, `"Let's break this down"`, `"Here is what you need to know"`, `"Without further ado"`, `"In this article, I'll..."`.
- **Transition tics:** `"Furthermore,"`, `"Moreover,"`, `"Additionally,"`, `"In conclusion,"`, `"To summarize,"`.
- **Performative balance:** `"however"` / `"on the other hand"` appended to every claim.
- **Em-dash pileups:** more than two em dashes in a paragraph.
- **Negative-parallelism tricolons:** `"No guesswork, no bloat, no surprises."` → state the operational properties instead.
- **Tricolons:** `"X, Y, and Z"` stacks where two items suffice — keep the strongest two, drop the redundant third.
- **Bullet soup:** Consecutive bullets that repeat the same conceptual point → consolidate into a single clean sentence.

---

## Workflow

1. **Check file boundaries:** Only operate on `.md`, `.txt`, `.rst`, `.markdown`, or documentation files. Refuse `.py`/`.js`/`.ts`/`.json`/`.yaml`/`.yml`/lockfiles, already-named `*.original.md`, files over 500 KB, and sensitive paths (`.env*`, `*.pem`, `*.key`, `~/.ssh/`, `~/.aws/`).
2. **Create backup:** Write `FILE.original.md` before applying changes.
3. **Pre-edit snapshot:** Take a deterministic snapshot of all protected spans (front matter, directives, code blocks, inline code, links, paths, commands, and tables).
4. **Apply minimum effective edits:** Clean prose between code regions. Do not add burstiness, slang, or contractions by recipe.
5. **Validate (byte-exact comparison):** Compare post-edit protected spans against the pre-edit snapshot. If any protected span differs by even one byte, restore `FILE.original.md` and report a verification failure.
6. **Report:** Return the path of the modified file and a summary of what changed.
