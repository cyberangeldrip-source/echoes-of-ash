import { EncounterScript } from './EncounterScript';

export function createCinderbackEncounter(): EncounterScript {
  return new EncounterScript([
    {
      id: 'heat-vent-stagger', once: false,
      predicate: context => context.flags.has('matriarch-over-active-vent') && !context.flags.has('vent-cooling'),
      actions: [{ type: 'stagger-boss', value: 'cinderback-matriarch' }, { type: 'activate-hazard', value: 'vent-cooling' }],
    },
    {
      id: 'enraged-phase', once: true,
      predicate: context => context.bossVitalityFraction <= 0.45,
      actions: [{ type: 'set-phase', value: 'enraged' }],
    },
    {
      id: 'encounter-complete', once: true,
      predicate: context => context.bossVitalityFraction <= 0,
      actions: [{ type: 'complete', value: 'cinderback-matriarch' }],
    },
  ]);
}
