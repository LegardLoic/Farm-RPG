import type { CombatEffectChip, CombatEncounterState, CombatStatus, CombatUiStatus } from '../../gameScene.stateTypes';

export type CombatEncounterTone = 'idle' | 'normal' | 'milestone' | 'boss';

function formatCombatValue(value: number): string {
  return `${Math.max(0, Math.round(value))}`;
}

export function resolveCombatMessage(snapshot: CombatEncounterState): string {
  const latestLog = snapshot.logs[snapshot.logs.length - 1];
  if (latestLog) {
    return latestLog;
  }

  if (snapshot.status === 'active') {
    return snapshot.turn === 'player' ? 'A toi de jouer.' : 'Tour ennemi.';
  }

  if (snapshot.status === 'won') {
    return 'Victoire. Combat termine.';
  }

  if (snapshot.status === 'lost') {
    return 'Defaite. Reviens plus fort.';
  }

  if (snapshot.status === 'fled') {
    return 'Tu as fui le combat.';
  }

  return 'Combat termine.';
}

export function getCombatRecapLabel(combatState: CombatEncounterState | null): string {
  if (!combatState || combatState.status === 'active') {
    return 'Recap: -';
  }

  const recap = combatState.recap;
  if (!recap) {
    return 'Recap: pending';
  }

  const summaryLine = [
    `Recap ${getCombatRecapOutcomeLabel(recap.outcome)}`,
    `R${recap.rounds}`,
    `DMG +${recap.damageDealt}/-${recap.damageTaken}`,
    `Heal +${recap.healingDone}`,
    `MP -${recap.mpSpent}/+${recap.mpRecovered}`,
  ].join(' | ');

  const statusLine = [
    `Status P${recap.poisonApplied}/C${recap.ceciteApplied}/O${recap.obscuriteApplied}`,
    `Cleanse ${recap.debuffsCleansed}`,
    `Blind miss ${recap.blindMisses}`,
  ].join(' | ');

  const rewardsLine = [
    `Rewards XP +${recap.rewards.experience}`,
    `Gold +${recap.rewards.gold}`,
    `Loot x${recap.rewards.lootItems}`,
  ].join(' | ');

  const penaltyLine =
    recap.penalties.goldLost > 0 || recap.penalties.itemsLost > 0
      ? `Penalties Gold -${recap.penalties.goldLost} | Items -${recap.penalties.itemsLost}`
      : '';

  return [summaryLine, statusLine, rewardsLine, penaltyLine].filter((line) => line.length > 0).join('\n');
}

export function getCombatRecapOutcomeLabel(status: CombatStatus): string {
  if (status === 'won') {
    return 'Victory';
  }
  if (status === 'lost') {
    return 'Defeat';
  }
  if (status === 'fled') {
    return 'Flee';
  }
  return 'Active';
}

export function getCombatName(combatState: CombatEncounterState | null, isAuthenticated: boolean): string {
  if (!combatState) {
    return isAuthenticated ? 'Aucun combat actif' : 'Connecte toi pour combattre';
  }

  return combatState.enemy.name;
}

export function getCombatStatusLabel(status: CombatUiStatus): string {
  switch (status) {
    case 'loading':
      return 'Chargement';
    case 'idle':
      return 'Inactif';
    case 'error':
      return 'Erreur';
    case 'active':
      return 'En cours';
    case 'won':
      return 'Victoire';
    case 'lost':
      return 'Defaite';
    case 'fled':
      return 'Fuite';
    default:
      return 'Inactif';
  }
}

export function getCombatEncounterFloorLabel(combatState: CombatEncounterState | null, towerCurrentFloor: number): string {
  if (!combatState) {
    return '-';
  }

  return `Etage ${Math.max(1, Math.round(towerCurrentFloor))}`;
}

export function getCombatEncounterTypeLabel(combatState: CombatEncounterState | null, towerCurrentFloor: number): string {
  if (!combatState) {
    return '-';
  }

  const floor = Math.max(1, Math.round(towerCurrentFloor));
  if (floor >= 10) {
    return 'Boss majeur';
  }

  if (floor === 3 || floor === 5 || floor === 8) {
    return 'Palier';
  }

  return 'Normal';
}

export function getCombatEnemyRoleLabel(combatState: CombatEncounterState | null, towerCurrentFloor: number): string {
  if (!combatState) {
    return '-';
  }

  const floor = Math.max(1, Math.round(towerCurrentFloor));
  if (floor >= 10) {
    return 'Avatar de malediction';
  }

  if (floor === 3 || floor === 5 || floor === 8) {
    return 'Mini-boss';
  }

  return 'Ennemi standard';
}

export function getCombatEncounterTone(combatState: CombatEncounterState | null, towerCurrentFloor: number): CombatEncounterTone {
  if (!combatState) {
    return 'idle';
  }

  const floor = Math.max(1, Math.round(towerCurrentFloor));
  if (floor >= 10) {
    return 'boss';
  }

  if (floor === 3 || floor === 5 || floor === 8) {
    return 'milestone';
  }

  return 'normal';
}

export function getCombatThreatLabel(combatState: CombatEncounterState | null, towerCurrentFloor: number): string {
  const tone = getCombatEncounterTone(combatState, towerCurrentFloor);
  if (tone === 'boss') {
    return 'Menace: Boss majeur';
  }
  if (tone === 'milestone') {
    return 'Menace: Combat de palier';
  }
  if (tone === 'normal') {
    return 'Menace: Escarmouche';
  }
  return 'Menace: Hors combat';
}

export function getCombatTurnLabel(combatState: CombatEncounterState | null): string {
  if (!combatState) {
    return '-';
  }

  return combatState.turn === 'player' ? 'Joueur' : 'Ennemi';
}

export function getCombatUnitValue(current: number, max: number): string {
  return `${formatCombatValue(current)} / ${formatCombatValue(max)}`;
}

export function getCombatEnemyValue(
  combatState: CombatEncounterState | null,
  stat: 'hp' | 'mp',
): string {
  if (!combatState) {
    return '-';
  }

  if (stat === 'hp') {
    return getCombatUnitValue(combatState.enemy.currentHp, combatState.enemy.hp);
  }

  return getCombatUnitValue(combatState.enemy.currentMp, combatState.enemy.mp);
}

export function getCombatPlayerEffectChips(combatState: CombatEncounterState | null): CombatEffectChip[] {
  if (!combatState) {
    return [];
  }

  const effects: CombatEffectChip[] = [];

  const rallyTurns = getCombatScriptTurns(combatState, 'playerRallyTurns');
  if (rallyTurns > 0) {
    effects.push({ label: `Rally ${rallyTurns}t`, tone: 'calm' });
  }

  const poisonedTurns = getCombatStatusTurns(combatState, 'playerPoisonedTurns');
  if (poisonedTurns > 0) {
    effects.push({ label: `Poison ${poisonedTurns}t`, tone: 'danger' });
  }

  const blindedTurns = getCombatStatusTurns(combatState, 'playerBlindedTurns');
  if (blindedTurns > 0) {
    effects.push({ label: `Cecite ${blindedTurns}t`, tone: 'warning' });
  }

  const darkenedTurns = getCombatStatusTurns(combatState, 'playerDarkenedTurns');
  if (darkenedTurns > 0) {
    effects.push({ label: `Obscurite ${darkenedTurns}t`, tone: 'warning' });
  }

  const cleanseWindowTurns = getCombatScriptTurns(combatState, 'playerCleanseReactionWindowTurns');
  if (cleanseWindowTurns > 0) {
    effects.push({ label: `Cleanse window ${cleanseWindowTurns}t`, tone: 'utility' });
  }

  const interruptWindowTurns = getCombatScriptTurns(combatState, 'playerInterruptReactionWindowTurns');
  if (interruptWindowTurns > 0) {
    effects.push({ label: `Interrupt window ${interruptWindowTurns}t`, tone: 'warning' });
  }

  return effects;
}

export function getCombatEnemyEffectChips(combatState: CombatEncounterState | null): CombatEffectChip[] {
  if (!combatState) {
    return [];
  }

  const effects: CombatEffectChip[] = [];
  const shatterTurns = getCombatScriptTurns(combatState, 'enemyShatterTurns');
  if (shatterTurns > 0) {
    effects.push({ label: `Exposed ${shatterTurns}t`, tone: 'utility' });
  }

  if (getCombatScriptFlag(combatState, 'avatarEnraged')) {
    effects.push({ label: 'Enraged', tone: 'danger' });
  }

  return effects;
}

export function getCombatTelemetryLabel(combatState: CombatEncounterState | null): string {
  if (!combatState) {
    return '-';
  }

  const cleanseUses = getCombatScriptTurns(combatState, 'telemetryCleanseUses');
  const interruptUses = getCombatScriptTurns(combatState, 'telemetryInterruptUses');
  const bossSpecialCasts = getCombatScriptTurns(combatState, 'telemetryBossSpecialCasts');
  const specials = getCombatBossSpecialTelemetryParts(combatState);

  const hasTelemetry = cleanseUses > 0 || interruptUses > 0 || bossSpecialCasts > 0 || specials.length > 0;
  if (!hasTelemetry) {
    return 'No data';
  }

  const base = [`C:${cleanseUses}`, `I:${interruptUses}`, `B:${bossSpecialCasts}`];
  if (specials.length === 0) {
    return base.join(' | ');
  }

  return `${base.join(' | ')} | ${specials.join(', ')}`;
}

export function getCombatBossSpecialTelemetryParts(combatState: CombatEncounterState | null): string[] {
  if (!combatState?.scriptState) {
    return [];
  }

  const prefix = 'telemetryBossSpecialCast_';
  const parts: string[] = [];
  for (const [key, value] of Object.entries(combatState.scriptState)) {
    if (!key.startsWith(prefix) || typeof value !== 'number' || !Number.isFinite(value)) {
      continue;
    }

    const count = Math.max(0, Math.floor(value));
    if (count <= 0) {
      continue;
    }

    const intent = key.slice(prefix.length).toUpperCase();
    parts.push(`${intent}:${count}`);
  }

  return parts.sort();
}

export function getCombatScriptTurns(combatState: CombatEncounterState | null, key: string): number {
  const raw = combatState?.scriptState?.[key];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    return 0;
  }

  return Math.max(0, Math.floor(raw));
}

export function getCombatStatusTurns(
  combatState: CombatEncounterState | null,
  key: 'playerPoisonedTurns' | 'playerBlindedTurns' | 'playerDarkenedTurns',
): number {
  const scriptState = combatState?.scriptState;
  if (scriptState && Object.prototype.hasOwnProperty.call(scriptState, key)) {
    return getCombatScriptTurns(combatState, key);
  }

  if (key === 'playerPoisonedTurns') {
    return getCombatScriptTurns(combatState, 'playerBurningTurns');
  }

  if (key === 'playerDarkenedTurns') {
    return getCombatScriptTurns(combatState, 'playerSilencedTurns');
  }

  return 0;
}

export function getCombatScriptFlag(combatState: CombatEncounterState | null, key: string): boolean {
  return combatState?.scriptState?.[key] === true;
}

export function hasCleanseableDebuffs(combatState: CombatEncounterState | null): boolean {
  return (
    getCombatStatusTurns(combatState, 'playerPoisonedTurns') > 0 ||
    getCombatStatusTurns(combatState, 'playerBlindedTurns') > 0 ||
    getCombatStatusTurns(combatState, 'playerDarkenedTurns') > 0
  );
}

export function hasInterruptibleEnemyIntent(combatState: CombatEncounterState | null): boolean {
  if (!combatState || combatState.status !== 'active' || combatState.turn !== 'player') {
    return false;
  }

  const raw = combatState.scriptState?.enemyTelegraphIntent;
  if (typeof raw !== 'string' || raw.length === 0) {
    return false;
  }

  return isInterruptibleEnemyIntent(raw);
}

export function isInterruptibleEnemyIntent(intent: string): boolean {
  return (
    intent === 'cinder_burst' ||
    intent === 'molten_shell' ||
    intent === 'iron_recenter' ||
    intent === 'null_sigil' ||
    intent === 'cataclysm_ray' ||
    intent === 'root_smash'
  );
}
