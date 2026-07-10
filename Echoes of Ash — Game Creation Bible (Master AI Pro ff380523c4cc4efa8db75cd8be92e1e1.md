# Echoes of Ash — Game Creation Bible (Master AI Prompt) v1.0

> This document is the complete Master Prompt / Game Creation Bible for **Echoes of Ash**, a first-person browser voxel exploration game. It is the single source of truth for scope, architecture, gameplay, and quality bar. Give this entire document to an AI coding agent (or use it as a living spec) exactly as written — do not summarize, shorten, or paraphrase it before use.
> 

## 00 — How To Use This Document

- Read the entire document before writing any code.
- Work through the systems in the order presented, but keep every earlier system fully functional while building later ones — never leave a system half-finished to move on.
- Treat every "LAW" below as a hard constraint, not a suggestion.
- Never stop, summarize progress, or declare the project "done" until the Final Validation Checklist (Chapter 23) is 100% satisfied.
- If you are an AI agent with a limited context or output size, work in incremental passes across multiple sessions, but always return to this document as the single source of truth — never drift from it, never quietly reduce scope.

## 01 — Executive Directive (Master AI Directive)

You are building a complete, shippable, browser-playable indie game — not a prototype, not a tech demo, not a vertical slice. Every gameplay system named in this document must exist in a fully functional, production-quality state before the project is considered complete.

### Global Development Laws

1. This project is never considered complete until every promised gameplay system exists in a functional state. Incomplete implementations are forbidden.
2. Whenever multiple implementation approaches exist, always choose the one with higher quality, better maintainability, better scalability, and better gameplay — never the easier one just because it's easier.
3. Never reduce feature scope because of implementation difficulty. If a feature is hard, solve the engineering problem instead of removing the feature.
4. The game must never contain fake systems. Every button functions. Every menu works. Every item has a purpose. Every crafting recipe is obtainable. Every enemy uses real AI. Every structure generates correctly.
5. Never generate code intended to be replaced later. Every implementation must be production-ready the first time.
6. Before writing new code, analyze the existing architecture. Prefer extending systems over duplicating functionality.
7. Never create temporary systems, stub systems, or "good enough for now" placeholders.
8. Never replace quality with simplicity when both are achievable with more effort.
9. Every gameplay mechanic must exist for a clear design reason tied to the vision in Chapter 02 — no mechanic exists "because other games have it."
10. If two solutions have similar performance cost, always choose the one that creates deeper, more interesting gameplay.
11. The player must always be curious about what lies beyond the next hill, the next ruin, the next cave mouth.
12. Never leave TODO, FIXME, `// implement later`, or any temporary/incomplete comment in shipped code.
13. Never copy popular games' mechanics wholesale (this is explicitly not a Minecraft clone) — use them only as a reference point for feel, then design original systems.
14. Continue implementing until every announced feature is fully functional — do not stop after implementing only the core mechanics.
15. Continuously self-review, refactor, and optimize as you go, rather than leaving cleanup for "later."

## 02 — Project Philosophy & Vision

Echoes of Ash is not a survival game about grinding resources, and not an endless sandbox. It is an atmospheric, first-person browser voxel adventure where exploration, discovery, and the feeling of a living world matter more than resource accumulation.

**Reference tone (feel, not mechanics):** Minecraft (voxel form only), Valheim (exploration dread and reward), Firewatch (atmosphere and intimacy), Outer Wilds (mystery and discovery-driven progress), Subnautica (biome-driven wonder and danger), The Long Dark (survival tension without grind), Satisfactory (the feeling of meaningful progression).

**Target player experience:**

- Hour 1: Wonder and disorientation. The player wakes on an unfamiliar volcanic archipelago, learns core movement/interaction, and finds their first clue that the world is not empty — it remembers.
- Hour 10: Mastery of the core loop (explore → gather → craft → build → survive) alongside the growing realization that the islands are changing around them: ruins shift, ash falls differently at night, wildlife behaves with intent.
- Hour 20: The player is actively piecing together the archipelago's buried history through discovered fragments, has a personal base that reflects their playstyle, and can survive and thrive in increasingly hostile biomes and depths.

## 03 — Game Concept: Echoes of Ash

**High concept:** A first-person, fully voxel, procedurally generated archipelago where the world is not static scenery but a living, remembering system. The islands "wake up" over time — ancient machinery stirs underground, ruins slowly rebuild themselves, and an independent ecosystem of migrating, memory-holding creatures exists whether or not the player is watching.

**Pillars:**

- **Story Through Exploration** — no linear quest chain. The narrative is environmental: journal fragments, structural clues, changed landscapes, and creature behavior gradually reveal what happened to the archipelago's original inhabitants. No forced dialogue trees, no floating quest markers.
- **A World That Remembers** — player actions persist meaningfully: burned forests stay burned and slowly regrow differently, destroyed structures affect nearby wildlife routes, ash falls accumulate and can bury paths.
- **Living Ecosystem** — animals are simulated independently of the player (hunger, fear, territory, migration) per Chapter 14, not simple spawn-on-sight mobs.
- **Meaningful Voxel Destruction/Construction** — the world is fully destructible and buildable, but building matters structurally, aesthetically, and functionally, not just as block placement.
- **No Artificial Grind** — progression rewards curiosity and mastery, not repetitive farming (see Chapter 16).

## 04 — Core Gameplay Loop

The primary loop, repeating and deepening across a session:

1. **Observe** — the player notices something in the world (smoke on the horizon, an unusual rock formation, a distant structure, a strange animal call).
2. **Explore** — travel toward it, navigating terrain, weather, and wildlife.
3. **Discover** — find a resource, a structure, a creature, or a story fragment.
4. **Interpret** — decide what it means and what to do with it (craft, build, record in the player's journal, avoid, fight).
5. **Act** — gather, craft, build, fight, or retreat.
6. **Integrate** — the discovery changes the player's capabilities (new recipe, new tool, new base module) or understanding (new lore fragment, new map knowledge).
7. **Return to Observe** with a wider radius of interest.

This loop must be tunable and testable at any point in development — the player should never be waiting on "nothing to do."

## 05 — Technical Architecture & Stack

- **Target platform:** modern desktop browsers (Chrome, Firefox, Edge, Safari) with graceful degradation.
- **Rendering:** WebGPU as the primary renderer; automatic fallback to WebGL2 when WebGPU is unavailable. Renderer must be abstracted behind a common interface so gameplay code never talks to WebGPU/WebGL2 directly.
- **Language:** TypeScript throughout, strict mode enabled, no `any` escape hatches in gameplay logic.
- **Concurrency:** Web Workers for chunk generation, meshing, and pathfinding so the main thread never blocks; use `SharedArrayBuffer`/transferable objects for voxel data where supported, with a safe fallback.
- **Architecture style:** data-oriented ECS (entity-component-system) for world objects and creatures; a separate deterministic simulation layer for world generation and ecosystem ticks so results are reproducible from a seed.
- **Folder structure (indicative):** `/engine` (rendering, voxel core, physics), `/world` (generation, biomes, chunks), `/gameplay` (crafting, building, combat, progression), `/ai` (wildlife, NPC behavior), `/ui`, `/audio`, `/save`, `/tools` (debug/dev tooling).
- **Coding standards:** no God Objects, no long methods (extract and name sub-steps), no magic numbers (named constants/config), no duplicated logic (shared utilities), consistent naming conventions documented in a `CONTRIBUTING.md`.

## 06 — Voxel Engine Specification

- **Chunking:** world divided into fixed-size voxel chunks (e.g. 32³) with a stable chunk coordinate system independent of render distance.
- **Streaming:** chunks load/unload around the player asynchronously via workers; never block the main thread on generation or meshing.
- **Level of Detail (LOD):** distant chunks render at reduced voxel/mesh resolution; LOD transitions must be seamless (no visible popping — use blending or morphing where feasible).
- **Meshing:** greedy meshing (merging coplanar voxel faces) to minimize triangle/draw-call counts; remesh only the chunks that actually changed.
- **Culling:** frustum culling and occlusion culling (e.g. hierarchical Z-buffer or portal-based for cave systems) so hidden geometry never costs GPU time.
- **GPU efficiency:** instancing for repeated props/vegetation, GPU-resident vertex/index buffers, texture atlasing to minimize state changes.
- **Memory management:** chunk pooling and reuse, LRU eviction for distant unloaded chunks, bounded memory budget with monitoring.
- **Physics & collision:** voxel-accurate AABB/swept collision for the player and physics objects; a dedicated raycasting system for block interaction, line-of-sight (AI), and projectiles.

### Design Goals

- The engine must make an enormous, fully destructible/buildable voxel world feel solid and responsive in a browser tab, on hardware the developer does not control.
- Every decision above exists to protect one thing: consistent frame time. A beautiful system that stutters breaks the "living world" pillar (Chapter 02) more than any missing feature would.

### Edge Cases To Handle

- Player standing exactly on a chunk boundary while placing/removing blocks must not visually tear or duplicate voxels across the seam.
- Extremely fast player movement (sprint + fall) outrunning chunk streaming — prefetch chunks along the velocity vector, not just around the current position.
- Large-scale destruction events (e.g. a collapsing ruin) that dirty many chunks in one frame — batch remeshing across a frame budget instead of doing it all synchronously.
- Underground caverns intersecting ocean/water voxels — flooding logic must resolve deterministically, never leaving "floating" water.
- Save/load mid-edit (e.g. the browser tab closing while a block is mid-placement) — the voxel diff log must be atomic per edit.

### Performance Requirements

- Remeshing a single dirtied chunk must not visibly drop frame rate below the documented minimum-spec target (Chapter 19).
- Chunk load/unload must never cause a visible "pop" — the prefetch radius must exceed the render radius by a tunable margin.
- Memory budget per loaded region must be explicit and enforced, with LRU eviction verified under stress testing (rapid teleport/fly-through).

### Implementation Requirements

- All chunk mutation goes through a single authoritative voxel-data API — no direct buffer writes from gameplay code, so meshing/lighting/physics always stay in sync with the data.
- The chunk coordinate system, mesh format, and diff/save format must be versioned independently so any one of them can evolve without breaking the others.

## 07 — Rendering Pipeline

- **Lighting:** dynamic day/night cycle with a physically-plausible sky model; per-voxel light propagation (sunlight + block light sources) recalculated incrementally on edits, not full-world recompute.
- **Shadows:** cascaded shadow maps for the sun/moon; soft shadow filtering.
- **Atmosphere:** volumetric fog that varies by biome, altitude, and weather; ash-fall particle systems near volcanic biomes.
- **Materials:** PBR-style material response (albedo, roughness, ambient occlusion baked per voxel type) even in a voxel aesthetic.
- **Post-processing:** bloom, ambient occlusion (SSAO or equivalent), color grading per biome mood, subtle depth-of-field for cutscenes/discovery moments.
- **Weather rendering:** rain, ash, fog, and wind must visibly affect the world (wet surface response, particle drift, swaying foliage).

### Design Goals

- Rendering exists to sell mood and place — ash-choked highlands must feel different from a bioluminescent marsh at a glance, not just on paper.
- Every visual effect must be tunable or disable-able for low-end hardware without breaking readability of gameplay-critical information (enemies, interactables, hazards).

### Edge Cases To Handle

- Extreme weather plus low light plus underground fog stacking simultaneously must not reduce visibility below a fair, enforced minimum.
- Bright ash-storm particles at night must not wash out UI/HUD contrast.
- Rapid day/night or biome transitions (fast travel, debug teleport) must not leave lighting in a stale or incorrect state.

### Performance Requirements

- The post-processing stack must have Low/Medium/High quality tiers, all validated against the minimum-spec baseline (Chapter 19), not only the high tier.
- Shadow map resolution and cascade count scale automatically with the performance tier.

### Implementation Requirements

- The renderer abstraction (Chapter 05) exposes the same lighting/fog/weather API regardless of the WebGPU or WebGL2 backend, so gameplay/art code stays backend-agnostic.

## 08 — World Generation

World generation is a deterministic, seeded, multi-stage pipeline. Every stage consumes the previous stage's output — never generate features independently of context.

1. **Continents/Landmasses** — archipelago shape via large-scale noise + erosion simulation.
2. **Climate** — temperature and moisture fields derived from latitude, altitude, and ocean proximity.
3. **Biomes** — assigned from climate + terrain (e.g. Ashen Highlands, Bioluminescent Marsh, Drowned Terraces, Obsidian Reef, Whispering Pine Reaches — invent a distinct, non-generic biome roster).
4. **Hydrology** — rivers, lakes, and coastlines carved with realistic flow.
5. **Ruins & Ancient Structures** — placed with rules that make them feel purposeful (e.g. always near fresh water, always oriented toward a landmark) and that support the environmental story (Chapter 10).
6. **Vegetation** — biome-appropriate flora placed with realistic clustering and slope/light rules, not uniform scattering.
7. **Wildlife spawns** — initial creature populations seeded per biome, matching Chapter 14's ecosystem rules.
8. **Rare structures & legendary sites** — hand-crafted-feeling procedural landmarks that are rare, memorable, and tied to lore fragments.
9. **Underground world** — cave systems, ancient machinery chambers, and dungeons (Chapter 15) generated with connectivity guarantees (no unreachable/broken layouts).
10. **Secrets** — hidden caches, optional lore, and rare-resource pockets seeded sparsely so exploration stays rewarding late-game.

No two generated worlds should feel structurally identical: vary biome adjacency, ruin placement, and rare-site frequency per seed.

### Design Goals

- The world must feel discovered, not procedurally "rolled" — every stage should leave legible cause-and-effect traces (a river near a ruin because its builders needed water, not because noise happened to place both there).
- Generation produces an initial state only; Chapters 14/15 mutate it over time, so the generation format must remain editable post-generation, never baked or immutable.

### Named Biome Roster (concrete, non-generic — extend this list, never fall back to generic "forest/desert/snow" biomes)

| Biome | Character | Signature Hazard / Resource |
| --- | --- | --- |
| Ashen Highlands | Volcanic ridgelines, drifting ash, obsidian outcrops | Ash-storms cut visibility; obsidian shards are a high-tier material |
| Bioluminescent Marsh | Glowing fungus over still black water | Toxic gas pockets at night; rare glow-spore reagents |
| Drowned Terraces | Flooded stepped ruins, half-submerged architecture | Strong currents; underwater lore fragments |
| Obsidian Reef | Jagged volcanic-glass shoals just offshore | Sharp terrain injures unprotected swimmers; rich mineral nodes |
| Whispering Pine Reaches | Dense temperate forest that carries sound unnaturally far | Predator packs use sound-masking terrain; abundant timber and game |
| Cinder Barrens | Cooled lava fields, cracked earth, sparse life | Heat vents; rare crystallized-ash resource |
| Skyroot Canopy | Elevated mega-flora with natural rope-bridge walkways | Fall hazards; unique aerial fauna |
| Salt Flats | Cracked white plains over ancient seabeds | Blinding midday glare; buried pre-collapse structures |

Each biome ships with a unique flora/fauna set, a distinct ambient audio palette (Chapter 18), and at least one biome-exclusive resource so no biome is skippable.

### Edge Cases To Handle

- Biome boundaries blend physically (transitional vegetation/terrain); they never hard-cut at a chunk border.
- Rivers and hydrology never generate as disconnected segments and never flow uphill.
- Ruin placement gracefully retries/relocates if a candidate site fails validation (e.g. would overlap another structure) instead of overlapping it.

### Performance Requirements

- Full generation for a newly discovered chunk completes within a fixed, tested worker-thread time budget so streaming (Chapter 06) never starves.

### Implementation Requirements

- Every generation stage is independently unit-testable against a fixed seed with deterministic expected output, so a regression in one stage is caught without re-verifying the whole pipeline.

## 09 — Player Controller

- First-person camera with configurable FOV and mouse sensitivity.
- Physics-based movement: walk, sprint (stamina-limited), crouch, jump, climb (context-sensitive on certain terrain), and swim.
- Stamina system that affects sprint, climbing, and heavy actions, recovering during rest/idle states.
- Interaction system: a consistent, readable prompt/highlight for interactable blocks, objects, and creatures, with clear reach and line-of-sight rules.
- Voxel placement/removal tooling: precise targeting, a preview/ghost block, and undo-friendly placement feedback.

## 10 — Exploration & Environmental Storytelling

- No quest markers, no dialogue trees, no NPC hand-holding.
- History is told through: journal/lore fragments found in ruins, physical changes to the world over time, creature behavior patterns, and environmental staging (e.g. a collapsed structure that tells its own story through how debris fell).
- The player's in-game journal auto-compiles discovered fragments into a loose, non-linear timeline the player can revisit — never force a "correct" reading order.
- Discoveries should escalate in mystery and stakes as the player goes deeper (surface ruins → mid-depth machinery → deep legendary sites), matching Outer Wilds-style knowledge-based progression rather than gear-gated progression alone.

### Design Goals

- The player should be able to explain "what happened here" in their own words after enough fragments, without the game ever stating it outright in a cutscene.
- No fragment is strictly required — any critical path must remain completable through environmental logic alone (e.g. "the deepest machinery chamber is behind the tallest lighthouse," discoverable by observation, not by a locked quest flag).

### Example Fragment Types (concrete, to guide content creation)

- **Physical fragments** — a burned ledger page, a cracked recording-shell, a preserved tool with wear patterns suggesting its use.
- **Structural fragments** — a building whose upper floor collapsed inward, implying an internal cause rather than an external attack.
- **Behavioral fragments** — a species that flees a specific ruin's shadow at dusk, hinting at what once emerged from it.
- **Environmental fragments** — ash-fall patterns that consistently avoid a ring around one mountain, implying an active, unseen mechanism still venting heat.

### Edge Cases To Handle

- Fragment discovery order is unbounded — the journal (Chapter 17) must present a coherent partial picture regardless of which subset of fragments a given player has found.
- Fragments must never contradict each other regardless of discovery order; maintain a lore-consistency reference alongside the content data.

## 11 — Building System

- **Snap system:** intuitive grid/surface snapping for placing blocks and prefabs without fighting the controls.
- **Blueprints:** the player can save and reuse structure designs.
- **Structural stability:** unsupported structures should be visually and mechanically flagged (and can collapse if truly unsupported), giving building real stakes rather than being purely cosmetic.
- **Decorations:** a robust library of non-functional and functional decorative objects (furniture, lighting, banners) so bases feel personal.
- **Storage:** chests/containers with fast search/sort, and shared storage networks for larger bases.
- **Workbenches & machines:** crafting stations gate advanced recipes; simple automation (e.g. conveyor/mechanism blocks) available in the mid-to-late game for players who want it, without being mandatory.

### Design Goals

- Building lets the player leave a personal mark on a world that otherwise changes without their input — it is the counterweight to "the world remembers" (Chapter 02): the player gets to make the world remember them, too.
- Structural stability exists so building is a real engineering puzzle, not decoration, creating its own micro-loop tied to Chapters 12 and 16.

### Edge Cases To Handle

- Removing a support block under a large, occupied structure resolves safely: no falling through the world, no instant destruction of the whole structure. Use a stability-propagation delay so partial collapse feels physical.
- Blueprints saved in one biome must be placeable in another without silently failing on missing/renamed block types — validate and prompt substitution.
- Structures built across a chunk boundary remesh and save consistently on both sides.

### Performance Requirements

- Large builds (thousands of placed blocks) must not degrade frame rate disproportionately; apply the same LOD/culling/instancing rules from Chapter 06 to player structures, not only terrain.

### Implementation Requirements

- Structural stability uses a graph-based support model (each block references its support chain), recalculated incrementally on edit rather than a full-structure recompute per placement.

## 12 — Crafting System

- Recipes are **discovered**, not memorized from a static menu dump — inspecting materials, ruins, or creatures can reveal new recipes, reinforcing the exploration pillar.
- Multi-tier material and tool progression (e.g. driftwood → basalt → forged alloy → ancient-machine components), each tier unlocking new build/combat/tool capabilities.
- Every recipe must be obtainable through normal, fair play — no dead-end recipes requiring unobtainable items.
- Workstation requirements should feel purposeful (e.g. a forge is needed for smelting, not an arbitrary gate).

### Design Goals

- Crafting exists to translate exploration into capability — every material tier should map to a specific new place the player can now survive or reach, not just a bigger number.

### Concrete Material & Tool Tier Progression

1. **Driftwood & Fiber** — basic tools, temporary shelter, starter torches.
2. **Basalt & Hide** — sturdier tools, first armor, basic storage.
3. **Forged Alloy** (requires a functioning forge, Chapter 11) — durable tools/weapons and structural building components.
4. **Bioluminescent Reagents** (Marsh-exclusive) — utility items: wind-immune light sources, mild status-altering consumables.
5. **Ancient-Machine Components** (recovered from Chapter 15 dungeons) — top-tier tools/weapons and automation-machine crafting, unlocked only after reactivating at least one ancient mechanism.

### Edge Cases To Handle

- A recipe requiring a biome-exclusive resource must be gatherable without requiring combat mastery far beyond the player's current tier — avoid hard progression walls.
- Recipe discovery via inspection must never be missable or permanently lockable; if a player destroys the only instance of a discovery trigger, an alternate discovery path must exist elsewhere.

### Implementation Requirements

- Recipe data is defined declaratively (inputs, outputs, station requirements, discovery trigger) so recipes can be added without touching crafting-engine code.

## 13 — Combat System

- **Melee:** weapon weight affects swing speed and knockback; stagger and poise system rewards well-timed hits and punishes button-mashing.
- **Ranged:** bows/slings and throwables with real projectile physics (gravity, travel time), not instant-hit.
- **Combos:** light/heavy attack strings that reward timing without becoming a fighting-game-level input system.
- **Rare artifacts:** unique ancient weapons tied to lore, each with a distinct mechanical identity (not just higher numbers).
- **Bosses:** design each boss around a distinct mechanical "lesson" (a specific pattern or environmental interaction the player must learn), not just a health-bar gate.
- Combat must feel weighty and consequential, in line with the game's tension (closer to Valheim/The Long Dark than an arcade shooter).

### Design Goals

- Combat exists to make the world feel dangerous enough that exploration has stakes, without becoming the main point of the game — this is not an action game; combat should be survivable through preparation and knowledge, not twitch skill alone.

### Concrete Boss Roster (each teaches a distinct mechanical lesson)

1. **The Cinderback Matriarch** (Cinder Barrens) — territorial megafauna; lesson: lure it over heat vents to stagger it, since brute-force melee alone fails.
2. **The Drowned Warden** (Drowned Terraces) — ancient submerged guardian; lesson: underwater stamina management and ranged positioning from dry ledges.
3. **The Hollow Choir** (underground, tied to Chapter 15 machinery) — a group encounter of sound-based enemies; lesson: light and sound management, since torches attract or repel them differently depending on which mechanism was last activated.

### Edge Cases To Handle

- Knockback/stagger must never push the player or enemies through solid voxels or outside intended arena bounds.
- Ranged projectile physics remain fair underwater (reduced range/speed, clearly communicated) rather than silently behaving as if on land.

### Implementation Requirements

- Boss "lessons" are encoded as explicit encounter-scripting hooks (environmental triggers, phase transitions) separate from generic enemy AI (Chapter 14), so bosses can be authored and tuned independently.

## 14 — Wildlife & NPC AI (Living World Simulation)

Animals are not simple "spawn near player, attack or flee" mobs. Each creature simulates:

- **Hunger** — drives foraging/hunting behavior independent of the player.
- **Fear** — flee thresholds based on creature type, health, and pack status.
- **Sleep** — day/night activity cycles per species (diurnal, nocturnal, crepuscular).
- **Territory** — defended ranges that create emergent conflict between species.
- **Relationships** — pack/herd bonds, predator-prey dynamics, and occasional cross-species tension the player can witness or influence.
- **Reproduction & migration** — populations grow, shrink, and move between biomes over in-game time, so the ecosystem is never static.
- **Memory** — creatures remember hostile player actions (e.g. an attacked herd becomes warier of that area for a persistent period).

This system must run whether or not the player is nearby (at reduced simulation fidelity far from the player, full fidelity nearby), so returning to an area later can show visible ecosystem change.

### Concrete Creature Roster (examples — extend per biome)

- **Ashback Elk** (Ashen Highlands) — herd herbivore; migrates toward Whispering Pine Reaches once ash density crosses a threshold.
- **Marshlight Eel** (Bioluminescent Marsh) — nocturnal predator; hunts by disabling the player's light sources before striking.
- **Reefstalker** (Obsidian Reef) — territorial amphibious predator; avoids open water during storms, a weather-reactive behavior.
- **Cindermite Swarm** (Cinder Barrens) — fast, group-memory pest; a swarm attacked once avoids that location for a persistent, tunable duration.

### Design Goals

- Every species has at least one behavior that only becomes visible through patient observation, not a UI stat, rewarding the "living world" pillar directly.

### Edge Cases To Handle

- Migrating populations never fully deplete a biome (minimum population floor with regrowth) and never infinitely stack in another (soft population caps per biome).
- Simulation reconciles smoothly when the player returns to a low-fidelity area — no instant, jarring population or position snaps.

### Performance Requirements

- Full-fidelity AI (pathfinding, needs simulation) is bounded to a radius around the player; beyond that radius, a cheaper statistical simulation governs population and migration, with a documented performance budget for both tiers.

## 15 — Dungeons, Ruins & Underground World

- Procedurally generated dungeons and cave systems with guaranteed connectivity (no soft-locks) but hand-authored-feeling set pieces at key nodes.
- **Self-rebuilding ruins:** certain surface ruins slowly repair/change over long play sessions, reinforcing the "world that wakes up" pillar.
- **Ancient machinery:** underground mechanisms that can be reactivated, with consequences that ripple to the surface (e.g. reopening a sealed channel changes water flow above).
- Puzzles are environmental and diegetic (lever/mechanism logic tied to the world's ancient civilization), not abstract sliding-tile minigames disconnected from the fiction.
- Secrets and rare loot are placed to reward thorough exploration, not required for critical progression.

### Design Goals

- Reactivating an ancient mechanism always has a visible, traceable surface consequence within a reasonable exploration radius, reinforcing player agency over the world.

### Edge Cases To Handle

- Reactivated mechanisms are idempotent — reactivating an already-active mechanism never double-applies its effect (e.g. flooding a channel twice).
- Guaranteed connectivity is validated procedurally after generation (a graph-reachability check from entrance to all key rooms) before a dungeon is considered valid; regenerate on failure.

### Implementation Requirements

- Mechanism state (active, inactive, partially activated) is persisted per-world in the save system (Chapter 20) exactly like any other world mutation.

## 16 — Progression System

- No numeric grind for its own sake. Progression is driven by **mastery and discovery**: new tools/materials open new traversal and building options; new lore unlocks new areas of interest, not literal locked doors.
- Skill growth should come from player capability (learning mechanics, finding better gear, understanding the ecosystem) more than from abstract XP bars.
- Every hour of play should meaningfully expand what the player can do or where they can go.

### Design Goals

- A player who never crafts a single top-tier item should still be able to see most of the map and most story content — progression gates comfort and safety, not access to content, keeping exploration primary (Chapter 02).

### Edge Cases To Handle

- Players who avoid combat almost entirely still have a viable, non-punishing path to explore dangerous biomes (stealth/avoidance tools, not only bigger weapons).

## 17 — UI/UX

- Minimal, mostly diegetic HUD (in-world indicators over floating numbers where feasible).
- Clean, modern menus for inventory, crafting, building, and the journal, favoring clarity over decoration.
- Full key/mouse rebinding, colorblind-friendly palettes, subtitle/caption support, and scalable UI text for accessibility.
- UI feedback must be immediate and legible even during combat or fast movement.

## 18 — Audio System

- Full spatial (3D positional) audio for creatures, weather, and player actions.
- Dynamic, layered music that responds to context (calm exploration, tension near predators, discovery stingers for major finds) without abrupt cuts.
- Biome-specific ambient soundscapes (wind, insects, distant water, ash sifting) and distinct reverb profiles for caves, ruins, and open air.
- Audio must degrade gracefully (voice/priority culling) under heavy scene load without popping or silence gaps.

## 19 — Performance & Browser Optimization

- Target: stable frame rate on mid-range consumer hardware in a browser tab, with a clear minimum-spec baseline documented and tested against.
- Chunk streaming, disk/network payload compression, and lazy loading of non-critical assets.
- Chunk and mesh caching to avoid redundant regeneration.
- Texture atlases and batched draw calls to minimize GPU state changes.
- Memory pooling for frequently allocated objects (particles, transient AI path nodes, projectiles).
- Heavy work (generation, meshing, pathfinding, save serialization) offloaded to Web Workers, never the main thread.
- Continuous profiling checkpoints built into the debug tooling (Chapter 21) so regressions are caught early, not discovered at the end.

## 20 — Save System

- Autosave on a sane interval plus manual save; both must be crash-safe (write-ahead or atomic swap, never a partially-written save file).
- Versioned save format with migration support, so future updates don't corrupt older saves.
- Browser-appropriate persistence (e.g. IndexedDB) with a backup/export option so players can protect their world.
- Efficient world diffing — only persist changed chunks/entities, not the entire generated world, to keep save size and save/load time reasonable.

## 21 — Code Standards & Debug Protocol

- No TODO/FIXME/placeholder comments left in the codebase; track real follow-up work in an explicit backlog instead, and resolve it before calling a system "done."
- No duplicated logic — extract shared utilities; no God Objects — split responsibilities by system; no long methods — extract and name sub-steps; no magic numbers — use named, documented constants/config.
- Maintain an internal debug/dev-tooling suite: free camera, chunk boundary visualization, AI state inspector, performance overlay (frame time breakdown by system), and a world-seed replay tool for reproducing bugs.
- Continuously self-review: after implementing a system, re-read it looking specifically for bugs, unhandled edge cases, and performance regressions before moving on.

## 22 — Completion Rules & Anti-Lazy Protocol

- Never create a prototype, demo, or vertical slice and call it finished.
- Never simplify a system because it turned out to be complex — solve the complexity.
- Never stop after implementing only the "core" mechanics; continue until every system in this document is fully functional.
- Never leave a mechanic partially implemented "to save time."
- Treat this document as living: if you discover a necessary detail it doesn't cover, make the smallest addition consistent with its philosophy (Chapter 02) rather than inventing something off-vision.

## 23 — Final Validation Checklist

A system is only "done" when every relevant item below is true. The project is only "done" when every item below is true.

**World & Generation**

- [ ]  World generation is fully deterministic from a seed and produces visibly distinct worlds across seeds
- [ ]  All ten generation stages (Chapter 08) run in correct dependency order with no orphaned/unreachable areas
- [ ]  At least five distinct, non-generic biomes are implemented with unique visuals, flora, and fauna
- [ ]  Underground cave systems and dungeons guarantee connectivity (no soft-locks)

**Engine & Rendering**

- [ ]  Chunk streaming, LOD, greedy meshing, and culling are implemented and measurably reduce draw calls/triangle count
- [ ]  WebGPU renders correctly with a working WebGL2 fallback on unsupported browsers
- [ ]  Dynamic lighting, shadows, fog, and weather all visibly affect gameplay and mood

**Gameplay Systems**

- [ ]  Building, crafting, combat, and inventory are all fully implemented with no placeholder recipes/items/blocks
- [ ]  Every crafting recipe is obtainable through normal play
- [ ]  Structural stability affects buildings; unsupported structures behave correctly
- [ ]  Combat has functioning melee weight/stagger, ranged projectile physics, and at least one fully realized boss encounter

**AI & Ecosystem**

- [ ]  Wildlife simulates hunger, fear, sleep, territory, relationships, reproduction, migration, and memory
- [ ]  The ecosystem visibly changes over time independent of direct player interaction

**Narrative**

- [ ]  Lore/story fragments are discoverable and compile into a non-linear in-game journal
- [ ]  No forced dialogue trees or floating quest markers exist anywhere in the game

**Progression, UI, Audio**

- [ ]  Progression is discovery/mastery driven with no artificial grind loops
- [ ]  UI is fully rebindable, accessible (colorblind-safe, scalable text, captions), and free of placeholder screens
- [ ]  Spatial audio, dynamic music, and biome ambience are implemented for every biome

**Performance & Save**

- [ ]  The game holds a stable frame rate on the documented minimum-spec baseline
- [ ]  Save/load is crash-safe, versioned, and does not corrupt on interrupted writes
- [ ]  All heavy computation (generation, meshing, pathfinding, saving) runs off the main thread

**Code Quality**

- [ ]  No TODO/FIXME/placeholder code remains anywhere in the shipped codebase
- [ ]  No God Objects, no duplicated logic, no magic numbers, no unexplained long methods
- [ ]  Debug tooling (free camera, chunk visualizer, AI inspector, performance overlay, seed replay) exists and works

Only when every box above is checked is Echoes of Ash considered complete.

**Content Specificity (added in this revision)**

- [ ]  At least the eight named biomes in Chapter 08 are implemented with unique flora, fauna, hazards, and ambient audio
- [ ]  At least the four named creature species in Chapter 14 are implemented with their documented unique behaviors
- [ ]  At least the three named boss encounters in Chapter 13 are implemented, each teaching its documented mechanical lesson
- [ ]  The five-tier material/tool progression in Chapter 12 is fully craftable and mapped to real traversal/survival benefits

## 24 — Versioning Roadmap (Beyond v1.0)

This document defines v1.0: the complete base game. Later versions exist so post-launch improvement has a documented direction instead of drifting arbitrarily — they are not scope for v1.0 and must never be used to justify shipping v1.0 incomplete.

- **v1.0 — Foundation (this document).** Every chapter above fully implemented and passing the Final Validation Checklist.
- **v1.1 — Depth Pass.** Additional biome-exclusive creatures and lore fragments, an expanded blueprint library, an additional boss encounter, and refined structural-stability edge cases discovered through playtesting.
- **v1.2 — Balance & Optimization Pass.** Performance tuning against real player-hardware telemetry, crafting/progression pacing adjustments, additional accessibility options, and save-format optimizations.

Each version increment must pass a scoped version of the Chapter 23 checklist for whatever it touches — never ship a version bump that regresses a previously passing item.