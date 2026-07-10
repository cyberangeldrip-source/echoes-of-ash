export interface DebugStateSnapshot {
  readonly freeCamera: boolean;
  readonly chunkBoundaries: boolean;
  readonly aiInspector: boolean;
  readonly performanceOverlay: boolean;
  readonly selectedEntity: number | null;
}

export class DebugState {
  #freeCamera = false; #chunkBoundaries = false; #aiInspector = false; #performanceOverlay = false; #selectedEntity: number | null = null;
  public toggleFreeCamera(): void { this.#freeCamera = !this.#freeCamera; }
  public toggleChunkBoundaries(): void { this.#chunkBoundaries = !this.#chunkBoundaries; }
  public toggleAiInspector(): void { this.#aiInspector = !this.#aiInspector; }
  public togglePerformanceOverlay(): void { this.#performanceOverlay = !this.#performanceOverlay; }
  public selectEntity(entity: number | null): void { this.#selectedEntity = entity; }
  public snapshot(): DebugStateSnapshot { return { freeCamera: this.#freeCamera, chunkBoundaries: this.#chunkBoundaries, aiInspector: this.#aiInspector, performanceOverlay: this.#performanceOverlay, selectedEntity: this.#selectedEntity }; }
}
