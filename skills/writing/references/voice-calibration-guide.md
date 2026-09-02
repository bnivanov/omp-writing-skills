# Voice calibration guide

This guide outlines the methodology for profiling and calibrating an authentic human voice for use in AI writing pipelines, without injecting private personal data.

## Why voice calibration matters

Default LLM outputs converge toward an unopinionated, polite, hyper-structured corporate middle ground. Conversely, generic "humanizer" prompts overcompensate by adding forced slang, artificial messiness, or erratic sentence fragments.

Voice calibration captures an author's genuine linguistic choices: sentence length distribution, connective syntax, technical depth, directness, and relationship to the reader.

---

## The 6 dimensions of voice calibration

When analyzing writing samples or defining a house style, extract choices across these six dimensions:

### 1. Sentence architecture & connective tissue
- **Coordination vs. Subordination:** Does the writer join ideas with `because`, `although`, `when`, `if`, or do they prefer coordinate structures (`and`, `but`, `so`)?
- **Thought development:** Does the writer think through ideas across medium-to-long compound sentences, or do they state conclusions in self-contained units?
- **Punctuation habits:** How does the author use colons, semicolons, dashes, and parentheses? (Default: eliminate decorative em dashes in favor of syntactic relationships).

### 2. Cadence & rhythm
- **Anti-Staccato Principle:** Natural human speech rarely uses isolated 2-word fragments for artificial emphasis. Ensure short sentences only occur when the underlying idea is genuinely brief.
- **Variation Source:** Sentence length should vary because the ideas vary in complexity, not because of a mechanical rhythm formula.
- **Negation Framing Guard:** Actively ban rhetorical negation variants (split-sentence negation, multi-negation countdowns, tailing negation).

### 3. Vocabulary & terminology
- **Jargon threshold:** Does the writer use exact technical terms of art (e.g. `KV cache`, `latency`, `MECW`, `contention`) alongside ordinary, clear language?
- **Plain language:** Prefer ordinary verbs and nouns (`changed`, `dropped`, `shipped`, `broke`) over inflated corporate equivalents (`leveraged`, `facilitated`, `spearheaded`).
- **Tiered Filtering:** Preserve genuine domain terminology while eliminating empty promotional adjectives (`groundbreaking`, `seamless`, `holistic`).

### 4. Perspective & stance
- **Ownership:** Is the piece written in first person (`I tested`, `we discovered`) or neutral third person?
- **Confidence calibration:** Match claims strictly to observed evidence. Use measured uncertainty (`we saw indications of...`) where evidence is preliminary, and direct certainty where data is firm.
- **Humor & self-awareness:** If the writer naturally uses light self-mockery or conversational asides, preserve them without exaggerating them into a routine comedy persona.

### 5. Openers, transitions, and closers
- **Openers:** Start where the substance starts. Avoid ceremonial throat-clearing (`"In this article, we explore..."`).
- **Transitions:** Transitions should reflect causal, sequential, or logical necessity, rather than serving as decorative signposts ("Furthermore", "Moreover", "Interestingly").
- **Closers:** End on the last concrete takeaway, unresolved question, or next action. Avoid synthetic summary paragraphs or keynote applause lines.

### 6. Medium-specific adaptability
- **Social / Micro-blogging:** Conversational, substantive, direct, numbered when teaching, ending on genuine questions rather than engagement bait.
- **Technical Essays / Deep Dives:** Clear narrative through-line, concrete code/architecture anchors, balanced trade-offs.
- **Documentation / Reference:** High scannability, exact commands, prerequisites, and explicit recovery paths.

---

## The "Never-inject" editor guardrails

During voice calibration and subsequent editing passes, the pipeline enforces strict boundary rules:
1. **Never fabricate stance:** Do not add opinions, experiences, or claims not present in the author's input.
2. **Never inject forced folksiness:** Do not insert slang, idioms, or folksy asides unless present in verified human samples.
3. **Subtractive editing first:** Improve drafts by removing AI clichés, sharpening claims, and tightening syntax, rather than appending decorative styling.

---

## Calibration workflow

1. **Gather 3–5 representative human samples** produced by the author or target publication.
2. **Identify stable habits** vs. topic-specific or mood-specific choices.
3. **Formulate positive rules** (e.g. "Use conversational compound sentences with explicit causal conjunctions") and hard negative bounds (e.g. "Zero antithesis pivots; zero staccato fragments").
4. **Test against the writing pipeline** and run `slopless-lint.sh` to confirm that stylistic distinctiveness does not trigger structural AI tells.
