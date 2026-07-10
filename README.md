# Echoes of Ash

A first-person browser voxel exploration game about a volcanic archipelago that remembers what happens to it.

The Game Creation Bible in this repository is the binding product and quality specification. Development lives on `develop`; `main` remains release-ready.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm test
npm run validate:source
```

The quality workflow runs all three checks on every push and pull request. The source validator rejects unfinished markers, unsafe `any` escapes, disabled tests, and focused tests.

## Architecture

- `src/engine`: renderer abstraction, voxel authority, meshing, ECS, simulation
- `src/world`: deterministic generation, streaming, dungeons, mechanisms
- `src/gameplay`: movement, inventory, crafting, building, combat, journal
- `src/ai`: persistent two-tier ecosystem simulation
- `src/audio`: spatial voice allocation, environment profiles, adaptive music
- `src/save`: versioned atomic IndexedDB persistence

The game is not considered complete until the full Chapter 23 validation checklist passes.
