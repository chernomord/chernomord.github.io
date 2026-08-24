const substrate = [
  "A", "B", "C", "D",
  "E", "F", "G", "H",
];

const phaseReads = [
  ["paired syntax", "Two-by-two reading with local cohesion."],
  ["diagonal weave", "Cross-linking adjacent clauses."],
  ["macro reading", "Larger blocks and stronger paraphrase."],
  ["interleaved meter", "Alternating structure with visible rhythm."],
  ["compressed voice", "Single-voice pressure and maximal compression."],
];

const patterns = {
  noise: [
    ["⟐ A ⟡ B ⟐", "∿ C ╳ D ∿", "⋯ E ⋯ F ⋯"],
    ["A ∷ ? ∷ H", "⌁ B ⌁ ⌁ G", "∴ C ∴ D ∴"],
    ["▧ A ▧ ▧", "▧ ▧ B ▧", "▧ C ▧ ▧"],
  ],
  fragment: [
    ["the same lens", "holds for a moment", "and then slips"],
    ["a cut survives", "but only as a hint", "of where the name was"],
    ["labels remain", "yet the grammar", "has not settled"],
  ],
  alice: [
    ["the grammar slips sideways", "a name becomes a curious echo", "and the sentence keeps its grin"],
    ["one word borrows another's coat", "the clause turns stranger", "yet remains almost itself"],
    ["sense keeps changing hats", "while the phrase walks in circles", "toward a brighter typo"],
  ],
  aphorism: [
    "A stable reading is a cut that can keep its name.",
    "A world becomes legible when its distinctions survive the switch.",
    "The object is not first; the surviving relation is.",
  ],
  quote: [
    "What looks like an object is often a stable reading of a smaller grammar.",
    "A world becomes familiar when its distinctions survive a change of lens.",
    "When the cut is right, the same structure can speak in plain language.",
  ],
};

const unlockSteps = [
  {
    id: "drift",
    label: "Drift",
    token: "lean",
    stanza: [
      "The sentence leans before the weather changes.",
      "One clause keeps its shadow and moves.",
      "A word learns to lean without falling.",
      "The whole line closes around the curve.",
    ],
    winIndex: 2,
    caption: "Unlocks mutation and mild Alice-like variation.",
  },
  {
    id: "pressure",
    label: "Pressure",
    token: "weight",
    stanza: [
      "The stanza gathers and the edges draw in.",
      "A phrase bends, but does not yet break.",
      "The line gathers weight without losing its shape.",
      "The stanza holds a little longer than before.",
    ],
    winIndex: 2,
    caption: "Unlocks compression and collapse pressure.",
  },
  {
    id: "preserveLexemes",
    label: "Preserve lexemes",
    token: "names",
    stanza: [
      "The rhythm loosens and the words begin to slide.",
      "A phrase keeps its outline in the drift.",
      "Keep the names before the text slips.",
      "The line remembers what it called itself.",
    ],
    winIndex: 2,
    caption: "Unlocks lexical anchoring against noise.",
  },
  {
    id: "reorder",
    label: "Reorder",
    token: "turn",
    stanza: [
      "The stanza tilts and the clauses trade places.",
      "A sentence crosses itself and keeps walking.",
      "Now turn the line and keep reading.",
      "The closing phrase returns by another route.",
    ],
    winIndex: 2,
    caption: "Unlocks structural permutation.",
  },
];

const DEFAULT_CONTROLS = {
  clusterFocus: 0,
  pressure: 0,
  drift: 0,
  preserveLexemes: false,
  reorder: false,
};

function createInitialState() {
  return {
    readingPhase: 0,
    controls: { ...DEFAULT_CONTROLS },
    unlockIndex: 0,
    won: false,
  };
}

let state = createInitialState();

const controlsEl = document.getElementById("controls");
const focusEl = document.getElementById("focus");
const diagnosticsEl = document.getElementById("diagnostics");
const controlsPanelEl = controlsEl.closest(".controls-panel");
const focusPanelEl = focusEl.closest(".focus-panel");

const ui = {
  built: false,
  phaseNameEl: null,
  phasePercentEl: null,
  phaseNoteEl: null,
  phaseInputEl: null,
  controlValueEls: new Map(),
  controlInputEls: new Map(),
  controlNoteEls: new Map(),
  unlockButtonEls: new Map(),
  restartButtonEl: null,
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phaseWindow() {
  const scaled = (state.readingPhase / 100) * 4;
  const leftIndex = Math.min(3, Math.floor(scaled));
  return { leftIndex, rightIndex: Math.min(4, leftIndex + 1), t: scaled - leftIndex };
}

function phaseDescriptor() {
  const { leftIndex, rightIndex, t } = phaseWindow();
  const left = phaseReads[leftIndex];
  const right = phaseReads[rightIndex];
  if (leftIndex === rightIndex || t === 0) return left;
  return [
    `${left[0]} → ${right[0]}`,
    `${Math.round((1 - t) * 100)}% ${left[1]} ${Math.round(t * 100)}% ${right[1]}`,
  ];
}

function clusterFocusBand() {
  const focus = Number(state.controls.clusterFocus) || 0;
  if (focus < 4) return 0;
  if (focus < 7) return 1;
  return 2;
}

function clusterFocusDescriptor() {
  const focus = Number(state.controls.clusterFocus) || 0;
  const band = clusterFocusBand();
  const labels = [
    ["alpha", "stable reads, stronger legibility"],
    ["beta", "mutating language, sideways phrases"],
    ["gamma", "fragment pressure, close to noise"],
  ];
  return {
    label: labels[band][0],
    note: labels[band][1],
    value: `${band === 0 ? "low" : band === 1 ? "middle" : "high"} · ${focus}/10`,
  };
}

function isStepUnlocked(stepId) {
  const index = unlockSteps.findIndex(step => step.id === stepId);
  return index >= 0 && state.unlockIndex > index;
}

function controlValue(name) {
  if (name === "clusterFocus") return Number(state.controls.clusterFocus) || 0;
  if (!isStepUnlocked(name)) return 0;
  const value = state.controls[name];
  return typeof value === "boolean" ? value : (Number(value) || 0);
}

function deriveHiddenControls() {
  const focus = controlValue("clusterFocus");
  const pressure = controlValue("pressure");
  const drift = controlValue("drift");
  const phase = Number(state.readingPhase) || 0;
  const band = clusterFocusBand();

  const fuse = clamp(Math.round(pressure * 0.65 + phase / 30 + band), 0, 10);
  const fracture = clamp(Math.round(pressure * 0.42 + phase / 52 + (band === 2 ? 2 : 0) - drift * 0.12), 0, 10);
  const elision = clamp(Math.round(pressure * 0.36 + phase / 40 + (band === 2 ? 1 : 0)), 0, 10);
  const compress = clamp(Math.round(pressure * 0.8 + phase / 28 + (band === 2 ? 1 : 0)), 0, 10);
  const paraphrase = clamp(Math.round(drift * 0.9 + phase / 60 + (band === 1 ? 2 : 0)), 0, 10);
  const preserveLexemes = isStepUnlocked("preserveLexemes") ? !!state.controls.preserveLexemes : false;
  const reorder = isStepUnlocked("reorder") ? !!state.controls.reorder : false;
  const aliceBias = clamp(
    0.08 +
    drift * 0.11 +
    (band === 1 ? 0.22 : 0) +
    (phase >= 20 && phase <= 85 ? 0.08 : 0) -
    pressure * 0.05,
    0,
    1,
  );

  return {
    focus,
    pressure,
    drift,
    band,
    fuse,
    fracture,
    elision,
    compress,
    paraphrase,
    reorder,
    preserveLexemes,
    aliceBias,
  };
}

function setControl(name, value) {
  if (state.won) return;
  state.controls[name] = clamp(Math.round(value), 0, 10);
  updateView();
}

function resetGame() {
  state = createInitialState();
  ui.built = false;
  updateView();
}

function currentUnlockStep() {
  return unlockSteps[state.unlockIndex] || null;
}

function advanceUnlock(stepId) {
  const step = currentUnlockStep();
  if (!step || step.id !== stepId || state.won) return;
  if (step.id === "preserveLexemes") state.controls.preserveLexemes = true;
  if (step.id === "reorder") state.controls.reorder = true;
  state.unlockIndex += 1;
  if (state.unlockIndex >= unlockSteps.length) state.won = true;
  ui.built = false;
  updateView();
}

function visibleControlDefinitions() {
  const defs = [
    {
      name: "clusterFocus",
      label: "Cluster focus",
      hint: "Chooses the foreground cluster and biases the local reading.",
      min: 0,
      max: 10,
      step: 1,
      valueLabel: () => {
        const desc = clusterFocusDescriptor();
        return `${desc.value} · ${desc.label}`;
      },
    },
  ];

  if (state.unlockIndex >= 1) {
    defs.push({
      name: "drift",
      label: "Drift",
      hint: "Pushes words toward paraphrase, mutation, and Alice-like forms.",
      min: 0,
      max: 10,
      step: 1,
      valueLabel: value => `${value}/10`,
    });
  }
  if (state.unlockIndex >= 2) {
    defs.push({
      name: "pressure",
      label: "Pressure",
      hint: "Drives compression, erosion, and collapse pressure together.",
      min: 0,
      max: 10,
      step: 1,
      valueLabel: value => `${value}/10`,
    });
  }
  if (state.unlockIndex >= 3) {
    defs.push({
      name: "preserveLexemes",
      label: "Preserve lexemes",
      hint: "Keeps names and word identities trackable.",
      min: 0,
      max: 1,
      step: 1,
      valueLabel: value => (value ? "on" : "off"),
      boolean: true,
    });
  }
  if (state.unlockIndex >= 4) {
    defs.push({
      name: "reorder",
      label: "Reorder",
      hint: "Permutes clause order without changing the reading.",
      min: 0,
      max: 1,
      step: 1,
      valueLabel: value => (value ? "on" : "off"),
      boolean: true,
    });
  }

  return defs;
}

function unlockBiasForLine(index) {
  const presets = [
    { pressure: 2, drift: 2, elision: 1, compress: 1, paraphrase: 1 },
    { pressure: 1, drift: 1, elision: 0, compress: 0, paraphrase: 0 },
    { pressure: 0, drift: 0, elision: 0, compress: 0, paraphrase: 0 },
    { pressure: -1, drift: -1, elision: -1, compress: -1, paraphrase: 0 },
  ];
  return presets[Math.max(0, Math.min(presets.length - 1, index))];
}

function scoreUnlockLine(text, step, hidden, index) {
  const normalized = normalizeText(text);
  const words = normalized.split(" ").filter(Boolean);
  const lengthTarget = 7 + (index === step.winIndex ? 1 : 0);
  const lengthScore = 1 - clamp(Math.abs(words.length - lengthTarget) / 10, 0, 1);
  const punctuationScore = /[.!?]$/.test(text.trim()) ? 0.12 : 0;
  const symbolPenalty = (text.match(/[⟐∿⋯⌁∴▧∷╳]/g) || []).length * 0.06;
  const tokenHit = normalized.includes(step.token) ? 0.35 : 0;
  const themeWords = normalizeText(step.stanza.join(" "))
    .split(" ")
    .filter(word => word.length > 3 && word !== step.token);
  const uniqueThemeWords = [...new Set(themeWords)];
  const shared = uniqueThemeWords.reduce((count, word) => count + (normalized.includes(word) ? 1 : 0), 0);
  const sharedScore = uniqueThemeWords.length ? (shared / uniqueThemeWords.length) * 0.38 : 0;
  const hiddenBalance = hidden.drift >= hidden.pressure ? 0.08 : 0.03;
  return lengthScore * 0.25 + sharedScore + tokenHit + punctuationScore + hiddenBalance - symbolPenalty;
}

function cloneBlocks(blocks) {
  return blocks.map(block => [...block]);
}

function flattenBlocks(blocks) {
  return blocks.flat();
}

function coarsenBlocks(blocks) {
  const ids = flattenBlocks(blocks);
  if (ids.length <= 2) return [ids.slice(0, 1), ids.slice(1)];
  const midpoint = Math.ceil(ids.length / 2);
  return [ids.slice(0, midpoint), ids.slice(midpoint)];
}

function splitBlocks(blocks) {
  return flattenBlocks(blocks).map(id => [id]);
}

function interpolateBlocks(leftBlocks, rightBlocks, t) {
  if (t <= 0) return cloneBlocks(leftBlocks);
  if (t >= 1) return cloneBlocks(rightBlocks);

  const ids = [...substrate];
  const leftOrder = leftBlocks.flat();
  const rightOrder = rightBlocks.flat();
  const leftRank = Object.fromEntries(leftOrder.map((id, idx) => [id, idx]));
  const rightRank = Object.fromEntries(rightOrder.map((id, idx) => [id, idx]));
  const ranked = ids
    .map(id => {
      const l = leftRank[id] ?? leftOrder.length;
      const r = rightRank[id] ?? rightOrder.length;
      return [id, (1 - t) * l + t * r];
    })
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

  const desiredBlocks = Math.max(1, Math.min(ids.length, Math.round((1 - t) * leftBlocks.length + t * rightBlocks.length)));
  if (desiredBlocks === 1) return [ranked.map(([id]) => id)];

  const cuts = new Set();
  const gaps = [];
  for (let i = 0; i < ranked.length - 1; i += 1) {
    gaps.push({ index: i, size: ranked[i + 1][1] - ranked[i][1] });
  }
  gaps.sort((a, b) => b.size - a.size || a.index - b.index);
  gaps.slice(0, desiredBlocks - 1).forEach(g => cuts.add(g.index));

  const blocks = [];
  let current = [];
  ranked.forEach(([id], idx) => {
    current.push(id);
    if (cuts.has(idx)) {
      blocks.push(current);
      current = [];
    }
  });
  if (current.length) blocks.push(current);
  return blocks;
}

function baseLensForPhase() {
  const lenses = [
    { name: "paired syntax", blocks: [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"]], kind: "stable" },
    { name: "diagonal weave", blocks: [["A", "H"], ["B", "C"], ["D", "E"], ["F", "G"]], kind: "stable" },
    { name: "macro reading", blocks: [["A", "B", "C", "D"], ["E", "F", "G", "H"]], kind: "quotient" },
    { name: "interleaved meter", blocks: [["A", "C"], ["B", "D"], ["E", "G"], ["F", "H"]], kind: "stable" },
    { name: "compressed voice", blocks: [substrate], kind: "degenerate" },
  ];
  const { leftIndex, rightIndex, t } = phaseWindow();
  return { left: lenses[leftIndex], right: lenses[rightIndex], t };
}

function derivePartition() {
  const { left, right, t } = baseLensForPhase();
  const hidden = deriveHiddenControls();
  const { fuse, fracture, elision, paraphrase, compress, preserveLexemes } = hidden;

  if (compress >= 8) {
    return {
      name: `${left.name} → ${right.name} / compressed`,
      blocks: [substrate],
      kind: "degenerate",
    };
  }

  const phaseShift = (
    (paraphrase - 5) * 0.03 +
    (fuse - 5) * 0.02 -
    (fracture - 5) * 0.035 -
    (elision - 5) * 0.03
  );
  const blend = clamp(t + phaseShift, 0, 1);

  let blocks = interpolateBlocks(left.blocks, right.blocks, blend);
  let kind = left.kind === right.kind ? left.kind : blocks.length <= 2 ? "quotient" : "stable";
  let name = blend === 0 ? left.name : blend === 1 ? right.name : `${left.name} → ${right.name}`;

  if (fuse >= 5 && paraphrase >= 4) {
    const fused = interpolateBlocks(left.blocks, right.blocks, clamp(blend + fuse * 0.015, 0, 1));
    if (fused.length <= blocks.length) blocks = fused;
    kind = blocks.length <= 2 ? "quotient" : kind;
    name = `${name} / fused`;
  }

  if (elision >= 4) {
    const steps = Math.max(1, Math.round(elision / 4));
    for (let i = 0; i < steps; i += 1) blocks = coarsenBlocks(blocks);
    kind = "quotient";
    name = `${name} / elided`;
  }

  if (fracture >= 4 && preserveLexemes) {
    const steps = Math.max(1, Math.round(fracture / 5));
    for (let i = 0; i < steps; i += 1) blocks = splitBlocks(blocks);
    kind = "refined";
    name = `${name} / fractured`;
  }

  if (preserveLexemes && hidden.reorder && kind === "stable") {
    name = `${name} / aligned`;
  }

  return { name, blocks, kind };
}

function clarityFor(partition, hidden = deriveHiddenControls()) {
  let clarity = 0.16;
  const { fuse, fracture, elision, paraphrase, compress, preserveLexemes, reorder } = hidden;

  if (partition.kind === "degenerate") clarity = 0.06 + compress * 0.01;
  if (partition.kind === "stable") clarity = 0.56;
  if (partition.kind === "quotient") clarity = 0.74;
  if (partition.kind === "refined") clarity = 0.34;

  if (preserveLexemes) clarity += 0.06;
  if (reorder) clarity += 0.02;
  clarity += fuse * 0.006;
  clarity += elision * 0.005;
  clarity += paraphrase * 0.007;
  clarity -= fracture * 0.006;
  clarity -= compress * 0.012;
  clarity += Math.max(0, state.readingPhase - 45) / 100;

  if (
    partition.kind === "quotient" &&
    elision >= 5 &&
    paraphrase >= 5 &&
    preserveLexemes &&
    state.readingPhase >= 60
  ) {
    clarity = 1;
  }

  return Math.max(0, Math.min(1, clarity));
}

function textRegime(partition, hidden = deriveHiddenControls()) {
  const clarity = clarityFor(partition, hidden);
  const aliceAffinity = (
    hidden.paraphrase * 0.16 +
    hidden.drift * 0.12 +
    (hidden.band === 1 ? 0.22 : 0) +
    (hidden.band === 0 ? 0.04 : 0) +
    (state.readingPhase >= 20 && state.readingPhase <= 85 ? 0.08 : 0) -
    hidden.pressure * 0.07
  );
  if (hidden.pressure >= 8 || clarity < 0.18) return "noise";
  if (hidden.drift >= 7 && hidden.pressure <= 8 && clarity >= 0.24) return "alice";
  if (aliceAffinity >= 0.56 && clarity >= 0.26) return "alice";
  if (clarity < 0.5) return "fragment";
  if (clarity < 0.82) return hidden.band === 1 && hidden.drift >= 5 ? "alice" : "aphorism";
  return "quote";
}

function pick(seed, values) {
  return values[seed % values.length];
}

function toggleCaseLike(source, replacement) {
  if (!source) return replacement;
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function paraphraseWord(word, level, seed) {
  const dictionary = {
    object: ["object", "figure", "form", "body", "token", "mark", "shape", "presence", "piece", "unit", "thing"],
    world: ["world", "scene", "field", "lattice", "order", "terrain", "matrix", "relation", "domain", "space", "world"],
    reading: ["reading", "lens", "pass", "view", "cut", "route", "gloss", "take", "frame", "sense", "reading"],
    structure: ["structure", "grammar", "frame", "pattern", "syntax", "layout", "order", "scheme", "shape", "form", "structure"],
    distinctions: ["distinctions", "cuts", "marks", "differences", "edges", "boundaries", "relations", "signs", "traces", "shifts", "distinctions"],
    stable: ["stable", "steady", "held", "anchored", "resolved", "fixed", "durable", "legible", "clear", "settled", "stable"],
    readable: ["readable", "clear", "legible", "plain", "open", "direct", "simple", "tracked", "plain", "visible", "readable"],
    lens: ["lens", "view", "cut", "interface", "frame", "angle", "mode", "filter", "signal", "route", "lens"],
    clause: ["clause", "phrase", "segment", "line", "member", "unit", "fragment", "part", "step", "node", "clause"],
    quote: ["quote", "citation", "line", "utterance", "sentence", "echo", "remark", "statement", "wording", "formulation", "quote"],
    fragment: ["fragment", "shard", "piece", "split", "trace", "remnant", "slice", "partial", "broken line", "segment", "fragment"],
    compressed: ["compressed", "condensed", "folded", "tight", "dense", "packed", "bound", "sealed", "collapsed", "minimal", "compressed"],
  };
  const key = word.toLowerCase();
  const variants = dictionary[key];
  if (!variants) return word;
  const idx = clamp(level + (seed % variants.length), 0, variants.length - 1);
  return toggleCaseLike(word, variants[idx]);
}

function rewriteLexicon(text, level, seed) {
  return text.replace(/\b[A-Za-z][A-Za-z-]*\b/g, token => paraphraseWord(token, level, seed + token.length));
}

function fuseText(text, level) {
  if (level <= 0) return text;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text;
  const joinSpan = clamp(3 + Math.floor(level / 3), 2, 6);
  const joined = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (i > 0 && i % joinSpan === 0 && joined.length) {
      joined[joined.length - 1] = `${joined[joined.length - 1]}${word.toLowerCase()}`;
      continue;
    }
    joined.push(word);
  }
  return joined.join(" ");
}

function aliceMutateWord(word, level, seed) {
  const dictionary = {
    object: ["object", "objet", "oblique", "thing", "token", "figure"],
    world: ["world", "worlld", "wonder", "field", "scene", "domain"],
    reading: ["reading", "reeading", "riddle", "view", "glance", "sense"],
    structure: ["structure", "stricture", "skein", "pattern", "frame", "shape"],
    distinctions: ["distinctions", "differences", "edges", "glints", "cuts", "marks"],
    stable: ["stable", "wobbly", "steady", "anchored", "held", "settled"],
    readable: ["readable", "legible", "plain", "clear", "open", "bright"],
    lens: ["lens", "looking-glass", "glance", "filter", "frame", "view"],
    clause: ["clause", "phrase", "line", "turn", "segment", "bit"],
    quote: ["quote", "echo", "remark", "line", "saying", "text"],
    fragment: ["fragment", "shard", "piece", "trace", "scrap", "slice"],
    compressed: ["compressed", "packed", "folded", "tucked", "tight", "sealed"],
    grammar: ["grammar", "grammer", "glimmer", "syntax", "order", "rule"],
    sentence: ["sentence", "sentience", "line", "utterance", "phrase", "voice"],
    language: ["language", "languor", "speech", "tongue", "talk", "wording"],
    meaning: ["meaning", "gleaning", "sense", "gloss", "trace", "hint"],
    relation: ["relation", "kinship", "link", "bond", "thread", "tie"],
    phrase: ["phrase", "fraise", "line", "turn", "utterance", "cluster"],
    word: ["word", "wurd", "token", "term", "name", "sign"],
    name: ["name", "namel", "label", "mark", "title", "tag"],
    cut: ["cut", "wink", "slice", "gap", "edge", "join"],
    switch: ["switch", "slip", "shift", "turn", "glide", "tilt"],
  };
  const key = word.toLowerCase();
  const variants = dictionary[key];
  if (!variants) return word;
  const idx = clamp(Math.floor(level / 2) + (seed % variants.length), 0, variants.length - 1);
  return toggleCaseLike(word, variants[idx]);
}

function aliceMutateText(text, level, seed) {
  let out = text.replace(/\b[A-Za-z][A-Za-z-]*\b/g, token => aliceMutateWord(token, level, seed + token.length));
  if (level >= 4) {
    out = out.replace(/\b(the|a|an)\b/gi, token => (seed % 3 === 0 ? "" : token));
  }
  if (level >= 7) {
    out = out.replace(/\b(of|to|and)\b/gi, token => (seed % 2 === 0 ? "" : token));
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

function fractureText(text, level) {
  if (level <= 0) return text;
  const chunkSize = clamp(6 - Math.floor(level / 2), 2, 5);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= chunkSize) return text;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }
  return chunks.join("\n");
}

function elideText(text, level) {
  if (level <= 0) return text;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return text;
  const stride = clamp(9 - level, 2, 8);
  const filtered = words.filter((word, index) => ((index + 1) % stride) !== 0);
  return filtered.length ? filtered.join(" ") : text;
}

function compressText(text, level) {
  if (level <= 0) return text;
  let out = text.replace(/\s+/g, " ");
  if (level >= 3) out = out.replace(/\b(the|a|an|of|to|and|or|is|are|in|on)\b/gi, "");
  if (level >= 5) out = out.replace(/\s+([,.;:!?])/g, "$1");
  if (level >= 7) out = out.replace(/[aeiou]/gi, "");
  return out.replace(/\s{2,}/g, " ").trim();
}

function styleLines(lines, regime, seed, preserveWords = [], bias = {}) {
  const hidden = deriveHiddenControls();
  const fuse = clamp((Number(hidden.fuse) || 0) + (bias.fuse || 0), 0, 10);
  const fracture = clamp((Number(hidden.fracture) || 0) + (bias.fracture || 0), 0, 10);
  const elision = clamp((Number(hidden.elision) || 0) + (bias.elision || 0), 0, 10);
  const paraphrase = clamp((Number(hidden.paraphrase) || 0) + (bias.paraphrase || 0), 0, 10);
  const compress = clamp((Number(hidden.compress) || 0) + (bias.compress || 0), 0, 10);
  const drift = clamp((Number(hidden.drift) || 0) + (bias.drift || 0), 0, 10);

  return lines.map((line, index) => {
    let text = String(line);
    const lineSeed = seed + index * 97;
    const preserved = new Map();
    for (const [i, word] of preserveWords.entries()) {
      const placeholder = `__P${index}_${i}__`;
      const pattern = new RegExp(`\\b${word}\\b`, "gi");
      if (pattern.test(text)) {
        text = text.replace(pattern, placeholder);
        preserved.set(placeholder, word);
      }
    }
    text = rewriteLexicon(text, paraphrase, lineSeed);
    if (regime === "alice") {
      text = aliceMutateText(text, paraphrase + drift + Math.floor(state.readingPhase / 20), lineSeed);
    }
    text = fuseText(text, fuse);
    text = fractureText(text, regime === "alice" ? Math.max(0, fracture - 2) : fracture);
    text = elideText(text, regime === "alice" ? Math.max(0, elision - 2) : elision);
    text = compressText(text, regime === "alice" ? Math.max(0, compress - 4) : compress);

    if (regime === "noise") {
      const symbols = ["⟐", "∿", "⋯", "⌁", "∴", "▧", "∷", "╳"];
      const dense = Math.max(0, Math.min(symbols.length - 1, Math.floor((compress + paraphrase + index) / 2)));
      text = text.replace(/[A-H]/g, token => token.toLowerCase()).replace(/[⟐∿⋯⌁∴▧∷╳]/g, symbols[dense]);
    }

    for (const [placeholder, word] of preserved.entries()) {
      text = text.replaceAll(placeholder, word);
    }

    return text;
  });
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function textAttractor(partition) {
  const hidden = deriveHiddenControls();
  const regime = textRegime(partition, hidden);
  const seed = hashString([
    partition.kind,
    partition.name,
    partition.blocks.map(block => block.join("")).join("|"),
    String(state.readingPhase),
    Object.entries(state.controls).map(([k, v]) => `${k}:${v}`).join(","),
  ].join("::"));

  const linesByRegime = {
    noise: styleLines(pick(seed, patterns.noise), regime, seed),
    fragment: styleLines(pick(seed, patterns.fragment), regime, seed),
    alice: styleLines(pick(seed, patterns.alice), regime, seed),
    aphorism: styleLines([pick(seed, patterns.aphorism), "The reading has enough structure to hold."], regime, seed),
    quote: styleLines([pick(seed, patterns.quote)], regime, seed),
  };

  return {
    regime,
    title: {
      noise: "collapsed symbols",
      fragment: "broken syntax",
      alice: "curious mutation",
      aphorism: "readable sentence",
      quote: "resolved quote",
    }[regime],
    lines: linesByRegime[regime],
    clarity: clarityFor(partition, hidden),
    hidden,
  };
}

function buildUnlockStanza(partition, unlockStep, regime) {
  const hidden = deriveHiddenControls();
  const seed = hashString([
    "stanza",
    unlockStep.id,
    partition.kind,
    partition.name,
    String(state.readingPhase),
    Object.entries(state.controls).map(([k, v]) => `${k}:${v}`).join(","),
  ].join("::"));

  const candidateLines = unlockStep.stanza.map((baseLine, index) => {
    const bias = unlockBiasForLine(index);
    return styleLines([baseLine], regime, seed + index * 113, [], bias)[0];
  });

  const winnerIndex = unlockStep.winIndex;
  const winnerScore = scoreUnlockLine(candidateLines[winnerIndex], unlockStep, hidden, winnerIndex);
  if (winnerScore < 0.7) {
    return candidateLines;
  }

  const preservedWinner = styleLines(
    [unlockStep.stanza[winnerIndex]],
    regime,
    seed + winnerIndex * 113,
    [unlockStep.token],
    unlockBiasForLine(winnerIndex),
  )[0];

  candidateLines[winnerIndex] = preservedWinner.replace(
    new RegExp('\\b' + unlockStep.token + '\\b', "i"),
    `<span class="unlock-word">${unlockStep.token}</span>`,
  );

  return candidateLines.map((line, index) => {
    if (index !== winnerIndex) return line;
    return `
      <div class="focus-line unlock-line" data-unlock="${unlockStep.id}">
        ${line}
      </div>
    `;
  });
}

function buildControls() {
  const phase = phaseDescriptor();
  const controls = visibleControlDefinitions();
  ui.controlValueEls = new Map();
  ui.controlInputEls = new Map();
  ui.controlNoteEls = new Map();
  ui.unlockButtonEls = new Map();

  const phaseField = el("div", { class: "field" }, [
    el("label", {}, "Reading phase"),
    (() => {
      const wrap = el("div", { class: "phase-control" });
      const valueLine = el("div", { class: "phase-value" }, [
        el("span", { class: "phase-name" }, phase[0]),
        el("span", { class: "phase-percent" }, `${state.readingPhase}%`),
      ]);
      const phaseNote = el("div", { class: "phase-note" }, phase[1]);
      const input = el("input", {
        class: "phase-slider",
        type: "range",
        min: "0",
        max: "100",
        step: "1",
        value: String(state.readingPhase),
      });
      ui.phaseInputEl = input;
      ui.phaseNameEl = valueLine.querySelector(".phase-name");
      ui.phasePercentEl = valueLine.querySelector(".phase-percent");
      ui.phaseNoteEl = phaseNote;
      input.addEventListener("input", () => {
        if (state.won) return;
        state.readingPhase = Number(input.value);
        updateView();
      });
      wrap.append(valueLine, input, phaseNote);
      return wrap;
    })(),
  ]);

  const controlList = el("div", { class: "toggles" });
  for (const control of controls) {
    const id = `control-${control.name}`;
    const raw = state.controls[control.name];
    const value = control.boolean ? (raw ? 1 : 0) : Math.round(Number(raw) || 0);
    const note = control.name === "clusterFocus" ? clusterFocusDescriptor().note : control.hint;
    const slider = el("div", { class: "slider-control" }, [
      el("div", { class: "slider-head" }, [
        el("span", { class: "slider-label" }, control.label),
        (() => {
          const valueEl = el("span", { class: "slider-value" }, control.valueLabel(value));
          ui.controlValueEls.set(control.name, valueEl);
          return valueEl;
        })(),
      ]),
      (() => {
        const input = el("input", {
          id,
          class: "slider-range",
          type: "range",
          min: String(control.min),
          max: String(control.max),
          step: String(control.step),
          value: String(value),
        });
        ui.controlInputEls.set(control.name, input);
        input.addEventListener("input", () => {
          if (state.won) return;
          if (control.boolean) {
            state.controls[control.name] = Number(input.value) >= 1;
            updateView();
          } else {
            setControl(control.name, Number(input.value));
          }
        });
        return input;
      })(),
      (() => {
        const noteEl = el("div", { class: "slider-hint" }, note);
        ui.controlNoteEls.set(control.name, noteEl);
        return noteEl;
      })(),
    ]);
    controlList.append(slider);
  }

  controlsEl.innerHTML = "";
  controlsEl.append(
    phaseField,
    el("div", { class: "section-kicker", style: "margin: 6px 0 10px;" }, `Visible axes · stage ${state.unlockIndex}/${unlockSteps.length}`),
    controlList,
  );
  ui.built = true;
}

function syncControls(partition) {
  const phase = phaseDescriptor();
  const hidden = deriveHiddenControls();
  const locked = state.won;
  if (ui.phaseNameEl) ui.phaseNameEl.textContent = phase[0];
  if (ui.phasePercentEl) ui.phasePercentEl.textContent = `${state.readingPhase}%`;
  if (ui.phaseNoteEl) ui.phaseNoteEl.textContent = phase[1];
  if (ui.phaseInputEl) {
    ui.phaseInputEl.value = String(state.readingPhase);
    ui.phaseInputEl.disabled = locked;
  }

  for (const [name, valueEl] of ui.controlValueEls.entries()) {
    const value = Math.round(Number(state.controls[name]) || 0);
    if (name === "clusterFocus") {
      const desc = clusterFocusDescriptor();
      valueEl.textContent = desc.value;
    } else {
      valueEl.textContent = `${value}/10`;
    }
  }
  for (const [name, input] of ui.controlInputEls.entries()) {
    const value = name === "preserveLexemes" || name === "reorder"
      ? (state.controls[name] ? "1" : "0")
      : String(Math.round(Number(state.controls[name]) || 0));
    if (input.value !== value) input.value = value;
    input.disabled = locked;
  }
  const focusDesc = clusterFocusDescriptor();
  const focusNote = ui.controlNoteEls.get("clusterFocus");
  if (focusNote) focusNote.textContent = focusDesc.note;
  if (controlsPanelEl) controlsPanelEl.classList.toggle("is-locked", locked);
  if (focusPanelEl) focusPanelEl.classList.toggle("is-won", locked);

  diagnosticsEl.innerHTML = `
    <div class="micro">lens: ${phase[0]}</div>
    <div class="micro">regime: ${textRegime(partition)}</div>
    <div class="micro">progress: ${state.unlockIndex}/${unlockSteps.length}</div>
    <div class="micro">visible: focus ${hidden.focus}/10 · pressure ${hidden.pressure}/10 · drift ${hidden.drift}/10</div>
    <div class="micro">hidden: fuse ${hidden.fuse}/10 · paraphrase ${hidden.paraphrase}/10 · compress ${hidden.compress}/10</div>
  `;
}

function renderFocus(partition) {
  const text = textAttractor(partition);
  const phase = phaseDescriptor();
  const unlockStep = currentUnlockStep();
  const stepCards = unlockSteps.map((step, index) => {
    const unlocked = state.unlockIndex > index;
    const current = state.unlockIndex === index && !state.won;
    return `
      <div class="capture-card ${unlocked ? "capture-filled" : "capture-empty"} ${current ? "is-current" : ""}">
        <div class="capture-slot-label">stage ${String(index + 1).padStart(2, "0")}</div>
        <div class="capture-phrase">${unlocked ? step.label : "?"}</div>
        <div class="micro">${unlocked ? step.caption : "locked"}</div>
      </div>
    `;
  }).join("");
  const bodyLines = unlockStep
    ? buildUnlockStanza(partition, unlockStep, text.regime)
    : text.lines;
  const bodyHtml = bodyLines.map(line => {
    if (typeof line === "string" && line.trimStart().startsWith("<div class=\"focus-line unlock-line\"")) {
      return line;
    }
    return `<div class="focus-line">${line}</div>`;
  }).join("");
  focusEl.innerHTML = `
    <div class="focus-stage ${text.regime} ${state.won ? "won" : ""}">
      ${state.won ? `
        <div class="focus-kicker">Completed</div>
        <div class="focus-title win-title">You won!</div>
        <div class="focus-body">
          <div class="focus-line win-line">All unlocks were found.</div>
        </div>
        <button class="restart-button" type="button" data-action="restart">Start over</button>
      ` : `
        <div class="focus-kicker">Text attractor</div>
        <div class="focus-title">${text.title}</div>
        <div class="focus-body">
          ${bodyHtml}
        </div>
        <div class="focus-meta">${phase[0]} · ${text.regime}</div>
      `}
    </div>
    <div class="capture-tray">
      <div class="capture-tray-head">
        <div class="section-kicker">Unlock ladder</div>
        <div class="micro">The next control appears only after you click its phrase.</div>
      </div>
      <div class="capture-grid">
        ${stepCards}
      </div>
    </div>
  `;
  ui.restartButtonEl = focusEl.querySelector("[data-action='restart']");
  if (ui.restartButtonEl) {
    ui.restartButtonEl.addEventListener("click", resetGame);
  }
  for (const line of focusEl.querySelectorAll("[data-unlock]")) {
    line.addEventListener("click", () => advanceUnlock(line.getAttribute("data-unlock")));
  }
}

function updateView() {
  const partition = derivePartition();
  const text = textAttractor(partition);
  if (!state.won && state.unlockIndex >= unlockSteps.length) {
    state.won = true;
  }
  if (!ui.built) buildControls();
  syncControls(partition);
  renderFocus(partition);
}

buildControls();
updateView();
