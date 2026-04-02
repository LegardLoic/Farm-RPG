import type { HudState } from '../gameScene.stateTypes';
import { getBlacksmithStatusLabel as getBlacksmithStatusLabelFromVillageHud } from '../features/village/villageHudParsers';

export function buildHudRootSummary(input: {
  hudState: HudState;
  activeAreaLabel: string;
  authStatus: string;
  dayPhaseLabel: string;
  formatValue: (value: number) => string;
}): Record<string, string> {
  return {
    day: `Jour ${input.hudState.day}`,
    dayPhase: input.dayPhaseLabel,
    farmDay: `Jour ${input.hudState.day}`,
    farmDayPhase: input.dayPhaseLabel,
    farmZone: input.activeAreaLabel,
    gold: `${input.hudState.gold} po`,
    level: `${input.hudState.level}`,
    xp: `${input.hudState.xp} / ${input.hudState.xpToNext}`,
    towerFloor: `${input.hudState.towerCurrentFloor} (best ${input.hudState.towerHighestFloor})`,
    towerBoss10: input.hudState.towerBossFloor10Defeated ? 'Defeated' : 'Pending',
    blacksmithStatus: getBlacksmithStatusLabelFromVillageHud({
      blacksmithUnlocked: input.hudState.blacksmithUnlocked,
      blacksmithCurseLifted: input.hudState.blacksmithCurseLifted,
    }),
    hp: `${input.formatValue(input.hudState.hp)} / ${input.formatValue(input.hudState.maxHp)}`,
    mp: `${input.formatValue(input.hudState.mp)} / ${input.formatValue(input.hudState.maxMp)}`,
    stamina: `${Math.max(0, Math.round(input.hudState.stamina))} / 8`,
    area: input.activeAreaLabel,
    authStatus: input.authStatus,
  };
}
