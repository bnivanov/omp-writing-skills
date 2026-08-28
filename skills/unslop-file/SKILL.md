---
name: unslop-file
description: "Safe in-place de-slopping for documentation, memory files (CLAUDE.md, AGENTS.md, preferences), and READMEs. Preserves code blocks, tables, URLs, paths, and commands exactly. Writes .original.md backup."
---

# Unslop file (in-place documentation & memory cleaner)

Adapted from [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) (MIT).

Use this skill to clean natural-language memory files (`CLAUDE.md`, `AGENTS.md`, `WATCHDOG.md`, preferences, todos, documentation) in-place without touching code or technical substrate.

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
| **`balanced`** (Default) | Stock vocabulary, sycophancy, hedging openers, transition tics, authority tropes, and colon reveals. | Everyday documentation, READMEs, and memory files. |
| **`full`** | Balanced + filler phrases (`in order to` $\rightarrow$ `to`, `due to the fact that` $\rightarrow$ `because`) + negative-parallelism tricolons (`"No X, no Y, no Z"`). | Slop-heavy LLM outputs, draft release notes, marketing copy. |

---

## Pattern rules

### 1. Drop (canonical AI tells)
- **Sycophancy openers:** `"Great question!"`, `"Certainly!"`, `"I'd be happy to help"`, `"Sure thing!"`
- **Stock vocabulary:** `delve`, `tapestry`, `testament` (in praise context), `pivotal`, `paramount`, `seamless`, `holistic`, `leverage` (as generic verb), `robust`, `comprehensive` (when `complete` suffices), `cutting-edge`, `ever-evolving`, `dynamic landscape`.
- **Hedging openers:** `"It is important to note that"`, `"It is worth mentioning"`, `"At its core"`, `"In essence"`.
- **Authority tropes:** `"Fundamentally,"`, `"In reality,"`, `"What really matters is"`.
- **Signposting announcements:** `"Let's dive in"`, `"Here is what you need to know"`, `"Without further ado"`.
- **Transition tics:** `"Furthermore,"`, `"Moreover,"`, `"Additionally,"`, `"In conclusion,"`.
- **Negative-parallelism tricolons:** `"No guesswork, no bloat, no surprises."` $\rightarrow$ state the direct operational properties instead.

### 2. Tighten
- **Tricolons:** `"X, Y, and Z"` stacks where two items suffice — keep the strongest two, drop the redundant third.
- **Bullet soup:** Consecutive bullets that repeat the same conceptual point $\rightarrow$ consolidate into a single clean sentence.

---

## Workflow

1. **Check file boundaries:** Only operate on `.md`, `.txt`, `.rst`, `.markdown`, or documentation files. Refuse sensitive paths (`.env*`, `*.pem`, `*.key`, `~/.ssh/`).
2. **Create backup:** Write `FILE.original.md` before applying changes.
3. **Pre-edit snapshot:** Take a deterministic snapshot of all protected spans (front matter, directives, code blocks, inline code, links, paths, commands, and tables).
4. **Apply minimum effective edits:** Clean prose between code regions while keeping all code blocks and technical identifiers intact.
5. **Validate (byte-exact comparison):** Compare post-edit protected spans against the pre-edit snapshot. If any protected span differs by even one byte, restore `FILE.original.md` and report a verification failure.
6. **Report:** Return the path of the modified file and a summary of what changed.
