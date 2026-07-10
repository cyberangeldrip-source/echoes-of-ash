import type { EcsWorld } from '../../engine/ecs/World';
import type { SimulationStep } from '../../engine/simulation/FixedStepClock';
import { PlayerInputComponent, StaminaComponent, TransformComponent, VelocityComponent } from '../components/Components';

const WALK_SPEED = 4.6;
const SPRINT_SPEED = 7.2;
const GROUND_ACCELERATION = 24;
const AIR_ACCELERATION = 6;
const GRAVITY = 24;
const JUMP_SPEED = 8.2;
const SPRINT_STAMINA_PER_SECOND = 18;

export interface CollisionResolver {
  move(position: Readonly<{ x: number; y: number; z: number }>, displacement: Readonly<{ x: number; y: number; z: number }>): { readonly position: { x: number; y: number; z: number }; readonly grounded: boolean };
}

export class PlayerMovementSystem {
  readonly #collisions: CollisionResolver;

  public constructor(collisions: CollisionResolver) { this.#collisions = collisions; }

  public update(world: EcsWorld, step: SimulationStep): void {
    for (const [entity, transform, velocity] of world.query(TransformComponent, VelocityComponent)) {
      const input = world.get(entity, PlayerInputComponent);
      const stamina = world.get(entity, StaminaComponent);
      if (input === undefined || stamina === undefined) continue;
      transform.previousPosition = { ...transform.position };
      const sprinting = input.sprint && input.forward > 0 && stamina.current > 0;
      const targetSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED;
      const forwardX = Math.cos(transform.yaw);
      const forwardZ = Math.sin(transform.yaw);
      const rightX = -forwardZ;
      const rightZ = forwardX;
      const inputLength = Math.hypot(input.forward, input.right);
      const scale = inputLength > 1 ? 1 / inputLength : 1;
      const targetX = (forwardX * input.forward + rightX * input.right) * scale * targetSpeed;
      const targetZ = (forwardZ * input.forward + rightZ * input.right) * scale * targetSpeed;
      const acceleration = velocity.grounded ? GROUND_ACCELERATION : AIR_ACCELERATION;
      velocity.linear.x = this.#approach(velocity.linear.x, targetX, acceleration * step.seconds);
      velocity.linear.z = this.#approach(velocity.linear.z, targetZ, acceleration * step.seconds);
      if (input.jump && velocity.grounded) velocity.linear.y = JUMP_SPEED;
      velocity.linear.y -= GRAVITY * step.seconds;
      const result = this.#collisions.move(transform.position, {
        x: velocity.linear.x * step.seconds,
        y: velocity.linear.y * step.seconds,
        z: velocity.linear.z * step.seconds,
      });
      transform.position = result.position;
      velocity.grounded = result.grounded;
      if (result.grounded && velocity.linear.y < 0) velocity.linear.y = 0;
      stamina.current = sprinting
        ? Math.max(0, stamina.current - SPRINT_STAMINA_PER_SECOND * step.seconds)
        : Math.min(stamina.maximum, stamina.current + stamina.recoveryPerSecond * step.seconds);
    }
  }

  #approach(current: number, target: number, delta: number): number {
    if (current < target) return Math.min(current + delta, target);
    return Math.max(current - delta, target);
  }
}
