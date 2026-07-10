import { componentKey } from '../../engine/ecs/World';

export interface Vector3 { x: number; y: number; z: number; }
export interface Transform { position: Vector3; previousPosition: Vector3; yaw: number; pitch: number; }
export interface Velocity { linear: Vector3; grounded: boolean; }
export interface Stamina { current: number; maximum: number; recoveryPerSecond: number; }
export interface PlayerInput { forward: number; right: number; jump: boolean; sprint: boolean; crouch: boolean; }

export const TransformComponent = componentKey<Transform>('Transform');
export const VelocityComponent = componentKey<Velocity>('Velocity');
export const StaminaComponent = componentKey<Stamina>('Stamina');
export const PlayerInputComponent = componentKey<PlayerInput>('PlayerInput');
