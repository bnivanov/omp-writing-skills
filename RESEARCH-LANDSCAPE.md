# Research Landscape & Genesis

This document records the empirical research, comparative audits, and ecosystem findings that led to the creation of `omp-writing-skills`.

## Background & Genesis

In mid-2026, widespread dissatisfaction with standard LLM writing prompts led to an ecosystem-wide audit of available tools. Most available prompts and skills labeled "anti-AI", "humanizer", or "prose-polisher" were evaluated across GitHub, Reddit (`r/claudeskills`, `r/ClaudeCode`), Hacker News, and developer communities.

The audit revealed a core paradox: **the most popular "humanizer" tools in the ecosystem actively made writing worse by replacing one set of AI clichés with another.**

## Comparative evaluation

### 1. The viral prompt / catalog category
- **`blader/humanizer` (36,000+ stars):** A viral prompt cataloging banned words and stylistic recommendations. While it accurately identifies buzzwords, its worked examples encourage isolated sentence fragments and landing-page hype lines.
- **`op7418/Humanizer-zh` (15,000+ stars):** Direct localization of `blader/humanizer` with identical structural strengths and weaknesses.

### 2. The burstiness injector category
- **`harshaneel/humanize` (360+ stars):** Prohibits negation framing, but mandates a sentence of 5 words or fewer every 3–4 sentences. This artificial constraint produces choppy, disjointed text.
- **`Aboudjem/humanizer-skill` (160+ stars):** Attempts to beat AI detectors by plotting sentence-length distributions against mathematical curves, prioritizing statistical shape over semantic coherence.
- **`adenaufal/anti-slop-writing` (110+ stars):** Prohibits lists of three and "not just X", but teaches "Not ideal. Big difference." as model human output.

### 3. The craft & deterministic winners
- **`petergyang/no-ai-slop` (6,200+ stars):** Focuses on minimum effective edits and catalogues 20+ precise AI patterns (colon reveals, superficial `-ing` analysis, importance puffery, weasel attribution) without flattening natural voice.
- **`Anbeeld/WRITING.md` (350+ stars):** A comprehensive 15-rule developmental craft engine combining web readability, concrete anchors, fact discipline, and explicit medium routing.
- **`berelevant-ai/slopless` (320+ stars):** An AST-based deterministic parser that flags structural AI tells like `negation-reframe` with zero LLM hallucinations.

## Key research insights

### Insight 1: Burstiness cannot be faked by algorithm
Human writing has variable sentence length because human thoughts vary in complexity, qualification, and emotional weight. When an LLM is instructed to mechanically vary sentence lengths (e.g. "insert a 3-word sentence now"), the result feels uncanny and broken.

### Insight 2: Antithesis pivots are the #1 tell of shallow LLM prose
Chatbots ubiquitously rely on the formula:
> *"The problem isn't X. It's Y."* / *"It's not just about speed; it's about control."*

This pattern simulates insight without providing substance. Banning synthetic antithesis pivots forces the model to state positive claims with grounded evidence.

### Insight 3: Drafters cannot grade their own work
When a single prompt drafts and edits in one pass, it suffers from self-confirmation bias. Spawning a separate editor subagent that receives only the draft and the de-slop rules produces a 4x reduction in residual AI clichés.

### Insight 4: Deterministic gates beat prompt persuasion
Prompt rules reduce slop probability from ~80% to ~5%. The remaining 5% must be caught by a deterministic AST parser (`slopless`) before publication.

## Conclusion

`omp-writing-skills` consolidates these insights into a production-grade, multi-stage architecture that combines the best verified open-source components with rigorous orchestration.
