# Contributing to Echoes of Ash

The Game Creation Bible in this repository is the product specification and quality contract.

## Engineering rules

- TypeScript strict mode is mandatory. Gameplay code must not use `any` or unsafe type assertions.
- Gameplay systems depend on engine interfaces, never concrete WebGPU or WebGL2 implementations.
- World generation, simulation, meshing, pathfinding, and save serialization must be deterministic or worker-owned as specified.
- All voxel mutations pass through the authoritative voxel-data API.
- Constants belong in named configuration objects. Avoid duplicated logic and mixed responsibilities.
- A change is complete only with deterministic tests for its rules and edge cases.
- Do not commit TODO, FIXME, placeholder behavior, disabled controls, or dead recipes and items.

## Branches and commits

- `main` is release-ready.
- `develop` is the integration branch.
- Feature branches use `feature/<system>-<change>`.
- Commit messages follow Conventional Commits.

## Validation

Run `npm run build`, `npm test`, and `npm run lint` before merging. Performance-sensitive systems must include an updated benchmark or profiling capture.
