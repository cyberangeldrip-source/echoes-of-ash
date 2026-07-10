export interface ProjectileState {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  radius: number;
  ageSeconds: number;
  maximumAgeSeconds: number;
  active: boolean;
}

export interface ProjectileEnvironment {
  readonly gravity: number;
  readonly waterSurface: number;
  readonly waterDrag: number;
  sweep(start: Readonly<{ x: number; y: number; z: number }>, end: Readonly<{ x: number; y: number; z: number }>, radius: number): { readonly position: { x: number; y: number; z: number } } | null;
}

export interface ProjectileImpact {
  readonly position: Readonly<{ x: number; y: number; z: number }>;
  readonly speed: number;
  readonly underwater: boolean;
}

export class ProjectileSimulation {
  public step(projectile: ProjectileState, environment: ProjectileEnvironment, seconds: number): ProjectileImpact | null {
    if (!projectile.active || seconds <= 0) return null;
    const underwater = projectile.position.y <= environment.waterSurface;
    const drag = underwater ? Math.exp(-environment.waterDrag * seconds) : 1;
    projectile.velocity.x *= drag;
    projectile.velocity.y = projectile.velocity.y * drag - environment.gravity * seconds;
    projectile.velocity.z *= drag;
    const next = {
      x: projectile.position.x + projectile.velocity.x * seconds,
      y: projectile.position.y + projectile.velocity.y * seconds,
      z: projectile.position.z + projectile.velocity.z * seconds,
    };
    const collision = environment.sweep(projectile.position, next, projectile.radius);
    projectile.ageSeconds += seconds;
    if (collision !== null) {
      projectile.position = { ...collision.position };
      projectile.active = false;
      return { position: collision.position, speed: Math.hypot(projectile.velocity.x, projectile.velocity.y, projectile.velocity.z), underwater };
    }
    projectile.position = next;
    if (projectile.ageSeconds >= projectile.maximumAgeSeconds) projectile.active = false;
    return null;
  }
}
