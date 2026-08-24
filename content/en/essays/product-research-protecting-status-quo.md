---
id: product-research-protecting-status-quo
translationKey: product-research-protecting-status-quo
title: "When Product Research Starts Protecting the Status Quo"
blogKind: essay
date: 2026-08-13
occurredAt: 2026-08-13
draft: true
summary: "Early product research can make every direction look blocked when it asks evidence to decide the fate of the whole idea."
projects: []
threads: [product-research, configuration-solvers]
tags: [market-research, prototypes, product-strategy, configuration]
artifacts: []
synthesizes: []
---

A couple of personal projects recently reached the point where I needed to do some actual product and market research.

The reason was fairly straightforward. I had already built the first deliberately limited prototypes and established that the underlying ideas were technically feasible. But moving beyond them would require substantially more work. At that point, the difficult questions were no longer about implementation alone:

What exactly am I building? What direction should it take? Which problems belong together, and which should be treated separately? What would justify continuing?

These questions became more important because my eventual goal is to explore a viable commercial model—not merely to produce a pet project, an open-source tool, or an interesting portfolio experiment.

I am well aware that product research, and especially market research, is not my strongest area. So I decided to use LLMs as both a source and a synthesizer of capabilities I lack: finding applicable research methods, processing large amounts of public evidence, challenging my hypotheses, and designing possible validation protocols.

What followed was unexpectedly instructive.

I had approached the research conservatively from the start, probably because I was anxious about overlooking a major blocker. This made it easy to accept a similar conservative bias from Codex and GPT after only a little resistance.

From there, the bias did not correct itself. It compounded.

Positive signals were treated as weak and in need of further confirmation. Risks and missing evidence were allowed to affect the entire idea. The existence of alternatives was often interpreted as evidence that the problem had already been solved. Eventually, almost every possible direction began to look blocked—not necessarily because the evidence was negative, but because the standard of proof kept rising.

After digging further, I still found enough evidence to justify my original direction: testing the audience and the market incrementally through a series of limited product experiments. In fact, the reasoning behind that decision became stronger. But the process exposed several recurring traps.

First, it is easy to mistake the existence of scattered capabilities for a closed user scenario.

A number of tools may collectively contain every operation required to produce a result. That does not mean the actual workflow is painless, coherent, or even practically available to the intended user. The tools may use incompatible models, require repeated manual data transfer, lose decision context between stages, or depend on expert judgement that exists outside the software.

Individual capabilities are not the same thing as an operationally complete workflow.

Second, exhaustive validation is usually unavailable before product experimentation.

Naturally, the existence of a workaround does not prove willingness to pay. A competitor does not prove market size. Interviews do not prove behaviour. Usage does not automatically prove retention or commercial viability.

Each objection may be valid in isolation. Taken together, however, they can create an impossible standard: every hypothesis must be proven before anyone is allowed to test it. Under that standard, almost any new product will appear unjustified.

Third, some signals can only be observed through interaction with an artifact.

Will users understand a more explicit model? Will they provide the required inputs? Will they trust an explainable result? Will they change their decisions after seeing it? Will they prefer a task-oriented representation to familiar manual work?

These are not always questions that more desk research can answer. Sometimes the next research instrument has to be a prototype.

One of my projects concerns the configuration and validation of electrical distribution boards. At first glance, the scenario appears well covered: standards exist, engineers perform the calculations, specialised bureaus design and assemble boards, manufacturers provide selection tools, and separate calculators cover individual parameters. Yet much of the real work remains between those capabilities. Assumptions are hidden, calculations are split across tools, changes require manual reconciliation, and the final decision often depends on expertise that the software neither captures nor explains. The existence of all the necessary ingredients does not mean that a user has a coherent, verifiable path from requirements to a defensible design.

I found a similar pattern around nginx configuration. There are configuration files, documentation, snippets, editors, monitoring systems, deployment pipelines, and several graphical interfaces. Superficially, nearly every required capability exists. But most interfaces still expose nginx directives with slightly better grouping. They do not represent the user’s actual task—such as publishing a service, configuring its backends, adding health checks, or applying a TLS policy—as a persistent product object. A scenario-oriented editor may therefore be valuable even before it grows into a full operational control plane. The missing product is not necessarily another capability; it may be the model and UX that connect existing capabilities into a usable flow.

This does not mean every fragmented workflow is a product opportunity. Sometimes the composition cost is negligible. Sometimes experts genuinely prefer their existing tools. Sometimes the missing integration is real but not valuable enough to justify a business.

The point is narrower: those are questions to investigate, not assumptions that can be derived from a feature inventory.

A more useful research rule might be:

A scenario is not closed merely because all necessary capabilities exist. It is closed when the intended user can reliably turn available inputs into an accepted result under real operational constraints.

This also changes the role of a prototype. A prototype is not only an early version of a product and not merely a demonstration of technical feasibility. It can be a research instrument for collecting evidence that does not exist until people encounter a concrete model of the problem.

The most important correction in my case was to stop asking every new piece of evidence to determine the fate of the entire idea.

Instead, I now try to keep several hypotheses separate:

- Is the underlying problem real?
- Do existing workflows leave meaningful friction?
- Does the proposed model improve the task?
- Will users provide the required information?
- Does the prototype change behaviour?
- Is there a viable commercial model?
- Is the opportunity large enough to pursue?

Uncertainty about the last two does not invalidate the earlier ones. Conversely, evidence of a real problem does not prove that a business exists.

The appropriate result of early research is often neither “build the company” nor “discard the idea.” It is a smaller and more useful decision:

There is enough evidence to justify the next bounded experiment—and a clear statement of what that experiment still needs to discover.
