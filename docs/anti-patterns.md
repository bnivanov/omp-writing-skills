# Anti-patterns & pitfalls

A catalog of writing failure modes and why standard prompt hacks fail.

## 1. The antithesis pivot ("not X, but Y")
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
- **Why it fails:** Ruins human reading cadence and disrupts logical flow.
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

## 5. Superficial trailing clauses
- **AI pattern:**
  ```text
  "...cutting memory by 40%, highlighting our dedication to performance."
  ```
- **Why it fails:** Adds self-congratulatory metacommentary rather than information.
- **The fix:** Focus on the concrete outcome:
  ```text
  "...cutting memory usage by 40% and eliminating OOM spikes during batch processing."
  ```

## 6. Importance puffery & weasel attribution
- **AI pattern:**
  ```text
  "Industry experts widely agree this marks a pivotal moment in container virtualization."
  ```
- **Why it fails:** Unverifiable authority claims and inflated adjectives destroy credibility.
- **The fix:** Name the source or metric:
  ```text
  "In the 2026 CNCF survey, 64% of respondents reported migrating their workloads to lightweight sandboxes."
  ```
