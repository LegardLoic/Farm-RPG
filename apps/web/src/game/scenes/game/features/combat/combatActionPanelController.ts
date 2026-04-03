import type { CombatEncounterState } from '../../gameScene.stateTypes';

export type CombatActionPanelMode = 'root' | 'skills' | 'items';

export type CombatActionPanelSceneLike = {
  isAuthenticated: boolean;
  combatBusy: boolean;
  combatState: CombatEncounterState | null;
  combatActionPanelMode: CombatActionPanelMode;
  combatActionRootRow: HTMLElement | null;
  combatActionSkillsRow: HTMLElement | null;
  combatActionItemsRow: HTMLElement | null;
  combatActionHintValue: HTMLElement | null;
  combatOpenSkillsButton: HTMLButtonElement | null;
  combatOpenItemsButton: HTMLButtonElement | null;
};

export function setCombatActionPanelModeForScene(
  scene: CombatActionPanelSceneLike,
  mode: CombatActionPanelMode,
): void {
  scene.combatActionPanelMode = mode;
}

export function resetCombatActionPanelModeForScene(scene: CombatActionPanelSceneLike): void {
  scene.combatActionPanelMode = 'root';
}

function isCombatPlayerTurn(combatState: CombatEncounterState | null): boolean {
  return Boolean(combatState && combatState.status === 'active' && combatState.turn === 'player');
}

export function updateCombatActionPanelForScene(scene: CombatActionPanelSceneLike): void {
  const playerTurn = isCombatPlayerTurn(scene.combatState);
  if (!playerTurn && scene.combatActionPanelMode !== 'root') {
    scene.combatActionPanelMode = 'root';
  }

  const skillsOpen = scene.combatActionPanelMode === 'skills' && playerTurn;
  const itemsOpen = scene.combatActionPanelMode === 'items' && playerTurn;
  const rootOpen = !skillsOpen && !itemsOpen;

  if (scene.combatActionRootRow) {
    scene.combatActionRootRow.hidden = !rootOpen;
  }
  if (scene.combatActionSkillsRow) {
    scene.combatActionSkillsRow.hidden = !skillsOpen;
  }
  if (scene.combatActionItemsRow) {
    scene.combatActionItemsRow.hidden = !itemsOpen;
  }

  const canOpenSubPanels = playerTurn && !scene.combatBusy;
  if (scene.combatOpenSkillsButton) {
    scene.combatOpenSkillsButton.disabled = !canOpenSubPanels;
  }
  if (scene.combatOpenItemsButton) {
    scene.combatOpenItemsButton.disabled = !canOpenSubPanels;
  }

  if (!scene.combatActionHintValue) {
    return;
  }

  if (!scene.isAuthenticated) {
    scene.combatActionHintValue.textContent = 'Connexion requise pour lancer un combat.';
    return;
  }

  if (!scene.combatState || scene.combatState.status !== 'active') {
    scene.combatActionHintValue.textContent = 'Demarre un combat, puis choisis une action.';
    return;
  }

  if (!playerTurn) {
    scene.combatActionHintValue.textContent = 'Tour ennemi: lis les intents avant de reagir.';
    return;
  }

  if (skillsOpen) {
    scene.combatActionHintValue.textContent = 'Competences: attaque, soutien ou controle selon la situation.';
    return;
  }

  if (itemsOpen) {
    scene.combatActionHintValue.textContent = 'Objets de combat: reserve prevue pour la suite du lot 4.';
    return;
  }

  scene.combatActionHintValue.textContent = 'Actions de base: Attaque/Defend, ou ouvre Competences/Objets.';
}
