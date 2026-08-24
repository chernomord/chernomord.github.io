# Blog architecture and governance

## Required reading

For any task that creates, classifies, moves, localizes, renders, validates, or
links blog content, read [`governance/blog/README.md`](governance/blog/README.md)
first, then follow its stated reading order. Those documents are the source of
truth for the blog's entity model, invariants, non-goals, ADRs, and operation
contracts.

## Change boundary

Do not introduce a new blog entity, reinterpret `Project`, `ResearchThread`,
`Note`, `CaseStudy`, `Essay`, `Artifact`, or `Tag`, alter promotion thresholds,
or change the visible-structure rules without an ADR and corresponding updates
to the governance model and invariants.

Before implementing templates, archetypes, front matter, or checks, treat
`governance/blog/operation-contracts.md` as the frozen interface. If it is
ambiguous or conflicts with the requested change, stop and report the conflict
instead of choosing semantics implicitly.

For any change to Hugo, PaperMod, front matter, or local layouts, also follow
`governance/blog/toolchain-compatibility.md`. Do not suppress Hugo deprecation
warnings; resolve them and run the documented build check.

## Scope

The blog's structure must emerge from published relation metadata. Do not add
empty thematic sections, static navigation for an unmaterialized line, or a
second use for the legacy `topics` taxonomy.
