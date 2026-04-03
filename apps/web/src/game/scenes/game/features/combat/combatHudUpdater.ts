import type { CombatEffectChip, CombatEncounterState, CombatUiStatus } from '../../gameScene.stateTypes';
import {
  getCombatEncounterFloorLabel as getCombatEncounterFloorLabelFromLogic,
  getCombatEncounterTypeLabel as getCombatEncounterTypeLabelFromLogic,
  getCombatEnemyRoleLabel as getCombatEnemyRoleLabelFromLogic,
  getCombatEnemyEffectChips as getCombatEnemyEffectChipsFromLogic,
  getCombatEnemyValue as getCombatEnemyValueFromLogic,
  getCombatName as getCombatNameFromLogic,
  getCombatPlayerEffectChips as getCombatPlayerEffectChipsFromLogic,
  getCombatRecapLabel as getCombatRecapLabelFromLogic,
  getCombatStatusLabel as getCombatStatusLabelFromLogic,
  getCombatTelemetryLabel as getCombatTelemetryLabelFromLogic,
  getCombatTurnLabel as getCombatTurnLabelFromLogic,
  getCombatUnitValue as getCombatUnitValueFromLogic,
} from './combatHudLogic';

export type CombatHudUpdateSceneLike = {
  isAuthenticated: boolean;
  combatState: CombatEncounterState | null;
  combatStatus: CombatUiStatus;
  combatEncounterId: string | null;
  combatMessage: string;
  hudState: {
    towerCurrentFloor: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
  };
  combatError: string | null;
  combatStatusBadge: HTMLElement | null;
  combatErrorValue: HTMLElement | null;
  setHudText(key: string, value: string): void;
  renderCombatEffectChips(key: string, effects: CombatEffectChip[]): void;
  renderCombatEnemySprite(): void;
  renderCombatEnemyTelegraphs(): void;
  renderCombatLogs(): void;
  updateCombatButtons(): void;
};

export function updateCombatHudForScene(scene: CombatHudUpdateSceneLike): void {
  scene.setHudText('combatName', getCombatNameFromLogic(scene.combatState, scene.isAuthenticated));
  scene.setHudText('combatStatus', getCombatStatusLabelFromLogic(scene.combatStatus));
  scene.setHudText('combatEncounterId', scene.combatEncounterId ?? '-');
  scene.setHudText('combatFloor', getCombatEncounterFloorLabelFromLogic(scene.combatState, scene.hudState.towerCurrentFloor));
  scene.setHudText('combatType', getCombatEncounterTypeLabelFromLogic(scene.combatState, scene.hudState.towerCurrentFloor));
  scene.setHudText('combatTurn', getCombatTurnLabelFromLogic(scene.combatState));
  scene.setHudText('combatRound', scene.combatState ? `${scene.combatState.round}` : '-');
  scene.setHudText('combatResult', scene.combatMessage);
  scene.setHudText('combatRecap', getCombatRecapLabelFromLogic(scene.combatState));
  scene.setHudText('combatPlayerHp', getCombatUnitValueFromLogic(scene.hudState.hp, scene.hudState.maxHp));
  scene.setHudText('combatPlayerMp', getCombatUnitValueFromLogic(scene.hudState.mp, scene.hudState.maxMp));
  scene.renderCombatEffectChips('combatPlayerEffects', getCombatPlayerEffectChipsFromLogic(scene.combatState));
  scene.setHudText('combatEnemyName', scene.combatState ? scene.combatState.enemy.name : '-');
  scene.setHudText('combatEnemyRole', getCombatEnemyRoleLabelFromLogic(scene.combatState, scene.hudState.towerCurrentFloor));
  scene.renderCombatEnemySprite();
  scene.setHudText('combatEnemyHp', getCombatEnemyValueFromLogic(scene.combatState, 'hp'));
  scene.setHudText('combatEnemyMp', getCombatEnemyValueFromLogic(scene.combatState, 'mp'));
  scene.renderCombatEffectChips('combatEnemyEffects', getCombatEnemyEffectChipsFromLogic(scene.combatState));
  scene.setHudText('combatTelemetry', getCombatTelemetryLabelFromLogic(scene.combatState));
  scene.renderCombatEnemyTelegraphs();

  if (scene.combatStatusBadge) {
    scene.combatStatusBadge.dataset.status = scene.combatStatus;
  }

  if (scene.combatErrorValue) {
    scene.combatErrorValue.hidden = !scene.combatError;
    scene.combatErrorValue.textContent = scene.combatError ?? '';
  }

  scene.renderCombatLogs();
  scene.updateCombatButtons();
}
