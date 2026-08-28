# Public writing-skill research landscape

Landscape audit and evaluation of public AI writing skills, rulesets, and humanizers across GitHub, Reddit, Hacker News, and X.

## The problem with standard "humanizers"

Most public writing skills and "humanizer" prompts fall into one of two traps:

1. **The Wikipedia catalog / viral list trap:** They ban 50+ words and rhetorical tropes, but provide no structural craft rules. In their examples, they often introduce or permit isolated dramatic fragments and landing-page hype.
2. **The burstiness injector trap:** They attempt to defeat AI detectors by forcing mechanical variability (e.g. mandating a ≤5-word fragment every 3–4 sentences or alternating short/long sentences by formula). This destroys natural cadence and creates distinctively bizarre, staccato prose.

## Evaluation matrix

| Stars* | Repo / Tool | Classification | Verdict & Findings |
|---:|---|---|---|
| 6,200+ | `petergyang/no-ai-slop` | Editor / Cleaner | **Adopted (Core Component).** Bans "This is not X. It's Y.", colon reveals, and stacked punchy fragments. Uses a clean minimum-effective-edit philosophy. |
| 350+ | `Anbeeld/WRITING.md` | Craft / Ruleset | **Adopted (Core Component).** Comprehensive 15-rule developmental craft engine. Enforces concrete anchors, fact discipline, medium routing, and forbids programmed wobble. |
| 320+ | `berelevant-ai/slopless` | Deterministic Gate | **Adopted (Lint Gate).** AST-based deterministic parser that flags `negation-reframe` and structural AI tells. A reliable gate, not a prompt. |
| 70+ | `ehmo/slopkit` (slopbeth) | Anti-Slop Guide | **Reference.** Good observation: replacing AI slop with clipped aphorisms and dramatic fragments is equally defective. |
| 36,000+ | `blader/humanizer` | Viral Prompt | **Rejected.** Viral prompt catalog. Permits isolated dramatic fragments; its worked examples frequently teach staccato pacing. |
| 15,000+ | `op7418/Humanizer-zh` | Translation / Fork | **Rejected.** Chinese localization of `blader/humanizer` with identical structural limitations. |
| 360+ | `harshaneel/humanize` | Burstiness Injector | **Rejected.** Hard-bans negation framing, but explicitly requires a ≤5-word sentence every 3–4 lines, forcing unnatural choppy rhythm. |
| 370+ | `jalaalrd/anti-ai-slop-writing` | Prompt | **Rejected.** Bans parataxis, then explicitly prescribes dramatic sentence fragments. |
| 160+ | `Aboudjem/humanizer-skill` | Burstiness Injector | **Rejected.** Treats sentence-length distribution curves as the primary optimization target. |
| 110+ | `adenaufal/anti-slop-writing` | Prompt | **Rejected.** Prohibits triplets and "not just X", then teaches "Not ideal. Big difference." as model human output. |

*\*Star counts recorded during benchmark sweeps.*

## Community & ecosystem findings

- **Reddit (`r/claudeskills`, `r/ClaudeCode`):** Real-world users consistently reported frustration with "not X, but Y" negation loops and staccato punchlines. Custom voice profiles that grounded rhythm in authentic practitioner speech outperformed generic humanizers.
- **Hacker News:** General consensus rejected mechanical "anti-AI" prompt wrappers in favor of rigorous editing, source attribution, and concrete evidence.
- **Official Skill Handbooks:** Anthropics skills repository contained no general-purpose prose humanizer; Vercel's writing guidelines served strictly as a documentation style guide (<20 words/sentence).

## The composite architecture solution

Rather than relying on a single prompt, the optimal writing system separates concerns:

1. **Voice calibration & rhythm governor (`writing-voice`):** Sets baseline rhythm, bans fake antithesis pivots and staccato fragments, and establishes natural conversational cadences.
2. **Comprehensive developmental ruleset (`writing`):** Enforces evidence-first anchors, medium routing, and logical progression across paragraphs.
3. **Targeted de-slop editor (`no-ai-slop`):** Runs minimal surgical edits to clean up AI tells without erasing the author's personality.
4. **Deterministic AST lint gate (`slopless`):** Validates the final markdown against known structural patterns before publication.
