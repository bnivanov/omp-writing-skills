---
title: Line-anchored review comments
source: https://github.com/MohamedAbdallah-14/unslop
license: MIT
---

# Unslop review (direct, teammate code review)

Adapted from [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) (MIT).

Use this skill when reviewing pull requests, patches, or code diffs to generate feedback that sounds like an experienced, thoughtful teammate rather than an automated politeness engine.

---

## When to use

- Generating or polishing PR review comments
- Code review audits in CI or interactive agent sessions
- Stripping corporate throat-clearing from AI-assisted code reviews

---

## Output format & precedence

**Precedence:** If the invoking agent harness, system prompt, or user request specifies a structured schema (e.g. JSON findings, GitHub suggestion blocks, review tool API format), that schema **strictly takes precedence**.

When no binding schema is supplied, format comments directly against source lines:
```text
L<line>: <severity> <observation>. <fix>.
```

Or for multi-file reviews:

```text
<file>:L<line>: <severity> <observation>. <fix>.
```

For line ranges spanning multiple lines:

```text
L88-140: <severity> <observation>. <fix>.
```

---

## Severity prefixes

Use honest, explicit severity prefixes:
- **`bug:`** — Code is broken, crashes, or produces incorrect output.
- **`risk:`** — Fragile behavior, race condition, missing retry/backoff, performance regression, or missing test.
- **`nit:`** — Non-blocking stylistic note, naming preference, or dead code removal.
- **`q:`** — Genuine technical question or request for architectural context (not a hidden critique).

---

## Rules

### 1. Drop
- **Throat-clearing:** `"I noticed that..."`, `"It seems like..."`, `"It looks to me like..."`
- **Stacked hedging:** `"I was wondering if perhaps we might want to potentially consider..."`
- **Polite padding:** `"I would kindly suggest..."`, `"Just a small nitpick..."`
- **Per-comment compliments:** `"Great pattern on this line, but..."`
- **Restating the diff:** `"Here on line 42 you have a function called getUser that takes an id..."`
- **Bare criticism:** Stating `"This is bad"` without proposing a concrete alternative.

### 2. Keep
- Exact line numbers and ranges
- Identifiers in code ticks (`` `findUser` ``, `` `req.body.id` ``)
- Concrete fixes or concrete questions
- The "why" only when the rationale is non-obvious

### 3. Auto-clarity exceptions (use short paragraphs)
Switch from one-liners to a structured paragraph only for:
- Security vulnerabilities (CVEs, auth bypass, secret leakage)
- Fundamental architectural disagreements requiring technical discussion
- Onboarding context for new contributors
- Genuine approval (`"LGTM"` on its own line when solid, without ceremonial praise)

---

## Examples

### Bad $\rightarrow$ Good

- **Bad:**
  ```text
  "I would kindly suggest that we might want to potentially consider adding a null check here as it could maybe lead to issues in some production scenarios."
  ```
- **Good:**
  ```text
  "L42: bug: `findUser` returns undefined on miss. Guard before `user.email` or return early 404."
  ```

- **Bad:**
  ```text
  "Great work on this implementation! However, I noticed that there is no retry logic here which could be problematic."
  ```
- **Good:**
  ```text
  "L23: risk: No retry on 429. Wrap in `withBackoff(3)` to avoid dropping valid requests under load."
  ```

- **Bad:**
  ```text
  "This implementation leverages a robust caching strategy."
  ```
- **Good:**
  ```text
  (Delete — empty praise. If the caching has an observable race, state the race concretely.)
  ```
