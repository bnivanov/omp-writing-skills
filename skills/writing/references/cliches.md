# LLM cliché catalog

Deterministic detectors ported from Simon Willison's [LLM cliché highlighter](https://tools.simonwillison.net/llm-cliche-highlighter) ([source](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html), Apache-2.0). Wikipedia group items follow [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).

This is a **detect** catalog. Do not treat a single hit as proof of authorship. Several hits, or a chain with a high item count, is a tell.

Run:

```bash
skills/writing/scripts/cliche-lint.mjs --list
skills/writing/scripts/lint.sh draft.md
skills/writing/scripts/cliche-lint.mjs --off colon-triple,fits-in-your-head draft.md
```

Fenced code and inline code are masked before matching.

## Willison patterns

| id | What it flags |
|---|---|
| `no-chain` | “No X, no Y” lists |
| `did-not-chain` | “Did not X, did not Y” |
| `dont-verb-it` | “Don’t call it X. Call it Y.” |
| `whole` / `is-the-whole` / `is-the-entire` / `the-entire-is` | “That’s the whole/entire point” |
| `sit-with` | “Sit with that” |
| `already-know` | “You already know” |
| `is-real` | “The X is real, and/not …” |
| `punchline` | “The punchline is” |
| `worth-naming` | Therapist-voiced “worth naming” |
| `not-nothing` | “That’s not nothing” |
| `echo-triad` | Consecutive sentences on the same skeleton |
| `performative-honesty` | “I’ll be honest”, “Let’s be honest”, “Honestly,” |
| `thats-the-part` | “That’s the part that …” |
| `the-only-i-trust` | “The only X I trust / that matters” |
| `take-my-word` | “Don’t take my word for it” |
| `turns-out` | Sentence-initial “Turns out” |
| `fits-in-your-head` | “hold in your head”, “it just works”, “zero config”, “sane defaults” |
| `stacked-questions` | Two or more questions in a row |
| `sentence-anaphora` | Three sentences opening on the same word |
| `colon-triple` | Colon into a three-item list (noisy in docs; `--off` it there) |
| `heres-the-twist` | “Here’s the twist/thing/catch” |
| `x-is-dead` | “X is dead” / “long live” |
| `thats-why-mattered` | “That’s why X mattered” |
| `stranded-auxiliary` | “The tool died; the data didn’t.” |

## Wikipedia group

| id | What it flags |
|---|---|
| `ai-vocab` | delve, tapestry, meticulous, pivotal, intricate, interplay, underscore, garner, bolster, vibrant, bustling, multifaceted, seamless, commendable, ever-evolving |
| `not-just` | “not just X, but Y” / “it’s not X — it’s Y” |
| `note-that` | “it’s important to note”, “worth noting” |
| `testament` | “stands as a testament” |
| `crucial-role` | “plays a crucial role” |
| `landscape` | “ever-evolving landscape”, “in today’s fast-paced world” |
| `vague-experts` | unnamed experts/critics/observers argue |
| `despite-challenges` | “despite these challenges”, “time will tell” |
| `participle-tail` | “, highlighting/underscoring/showcasing …” |
| `promo` | nestled in, hidden gem, breathtaking, rich tapestry |
| `ai-leftovers` | “as an AI language model”, oaicite, `utm_source=` |

## After a hit

Rewrite the flagged span into a direct claim. Do not swap in a different cliché. Do not inject slang to dodge the matcher.
