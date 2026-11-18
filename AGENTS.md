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

## Editorial work

For observations, post ideas, publication planning, and author-text intake,
read `editorial/README.md` first. It describes the current working process;
blog governance still owns publication entities and site structure.
The default output is a sourced writing brief. The author writes the post.
Preserve submitted author prose. Texts submitted as the user's own posts may
inform style analysis unless excluded by the user; do not treat agent drafts,
quoted passages, or texts of unknown authorship as author-style samples.
