# Anti-patterns & pitfalls

A catalog of writing failure modes, structural tells, and why standard prompt hacks fail.

## 1. Structural antithesis & negation framing ("not X, but Y")

### 1a. The classic antithesis pivot
- **AI pattern:**
  ```text
  "The bottleneck isn't the network. It's the database lock."
  "It's not just a tool; it's a paradigm shift."
  ```
- **Why it fails:** Creates the illusion of profundity while wasting words on the negative claim.
- **The fix:** State the positive reality directly:
  ```text
  "The database lock is the bottleneck."
  ```

### 1b. The split-sentence negation
- **AI pattern:**
  ```text
  "The headline isn't the raw latency reduction. The real story is how the cache invalidated."
  ```
- **Why it fails:** Splits a single observation across two sentences to manufacture rhetorical drama.
- **The fix:** Combine into a direct, single statement:
  ```text
  "The primary improvement came from the cache invalidation strategy rather than raw execution speed."
  ```

### 1c. The multi-negation countdown
- **AI pattern:**
  ```text
  "It is not about memory usage. It is not about CPU limits. It is about network saturation."
  ```
- **Why it fails:** Mimics a keynote speaker building tension on stage, frustrating readers seeking facts.
- **The fix:** State the causal factor immediately:
  ```text
  "Network saturation caused the degradation."
  ```

### 1d. Tailing negation
- **AI pattern:**
  ```text
  "The options are derived directly from the active schema, no guessing."
  ```
- **Why it fails:** Appends an unnecessary defensive negation to an already complete claim.
- **The fix:** Cut the tail:
  ```text
  "The options are derived directly from the active schema."
  ```

## 2. The dramatic staccato fragment
- **AI pattern:**
  ```text
  "Speed. Scale. Reliability. That's the stack. Period."
  ```
- **Why it fails:** Sounds like a low-budget television commercial or keynote presentation.
- **The fix:** Join the thoughts with real syntax:
  ```text
  "The new architecture prioritizes low latency, horizontal scalability, and deterministic crash recovery."
  ```

## 3. The burstiness injection hack
- **AI pattern:** Deliberately inserting a 2-word sentence every 4th line to fool AI perplexity detectors.
- **Why it fails:** Ruins human reading cadence, breaks logical connectors, and produces unnatural, stilted text.
- **The fix:** Vary sentence length naturally according to the complexity of the thought.

## 4. The colon reveal
- **AI pattern:**
  ```text
  "The best part: it saves $5,000 monthly."
  "The catch: it only works in Linux."
  ```
- **Why it fails:** Manufactures theatrical suspense over routine technical details.
- **The fix:** Write a normal declarative sentence:
  ```text
  "The change saves $5,000 monthly, though it is currently restricted to Linux."
  ```

## 5. Superficial trailing clauses ("-ing" bloat)
- **AI pattern:**
  ```text
  "...cutting memory by 40%, highlighting our dedication to performance."
  "...migrating to Rust, underscoring the team's commitment to reliability."
  ```
- **Why it fails:** Adds self-congratulatory metacommentary rather than factual information.
- **The fix:** Focus on the concrete outcome:
  ```text
  "...cutting memory usage by 40% and eliminating OOM spikes during batch processing."
  ```

## 6. Importance puffery & weasel attribution
- **AI pattern:**
  ```text
  "Industry experts widely agree this marks a pivotal moment in container virtualization."
  "In today's fast-paced digital landscape, staying ahead of the curve is crucial."
  ```
- **Why it fails:** Unverifiable authority claims and inflated adjectives destroy credibility.
- **The fix:** Name the source, metric, or concrete context:
  ```text
  "In the 2026 CNCF survey, 64% of respondents reported migrating their workloads to lightweight sandboxes."
  ```

## 7. Inline-header list addiction
- **AI pattern:** Converting every paragraph into a bulleted list of bold terms (`- **Performance:** ...`, `- **Scalability:** ...`, `- **Security:** ...`).
- **Why it fails:** Fragments cohesive technical reasoning into disjointed bullet points, preventing deep exposition.
- **The fix:** Use prose for conceptual continuity; reserve lists for genuinely discrete, parallel items.

## 8. The "never-inject" violation (editor malpractice)
- **AI pattern:** When asked to edit or "humanize" a draft, the assistant injects fake personal anecdotes, manufactured stakes ("In a world where..."), or unprompted folksy slang.
- **Why it fails:** Violates editing integrity and authorial provenance.
- **The fix:** Enforce subtractive editing: sharpen claims, cut filler, and eliminate tells without fabricating voice or opinions.
