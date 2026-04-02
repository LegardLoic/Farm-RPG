import type { VillageSceneZoneConfig } from '../../gameScene.types';

export function updateVillageContextPanel(params: {
  zone: VillageSceneZoneConfig | null;
  interactionState: { enabled: boolean; reason: string } | null;
  isVillageMode: boolean;
  zoneCount: number;
  titleValue: HTMLElement | null;
  roleValue: HTMLElement | null;
  hintValue: HTMLElement | null;
  interactButton: HTMLButtonElement | null;
  cycleButton: HTMLButtonElement | null;
}): void {
  if (params.titleValue) {
    params.titleValue.textContent = params.zone?.title ?? 'Aucune cible';
  }
  if (params.roleValue) {
    params.roleValue.textContent = params.zone?.role ?? 'Selectionne une zone du village.';
  }
  if (params.hintValue) {
    if (!params.zone) {
      params.hintValue.textContent = 'Utilise R ou clique une zone pour choisir une interaction.';
    } else if (params.interactionState && !params.interactionState.enabled) {
      params.hintValue.textContent = params.interactionState.reason;
    } else {
      params.hintValue.textContent = params.zone.hint;
    }
  }

  if (params.interactButton) {
    if (params.zone) {
      params.interactButton.dataset.targetKey = params.zone.key;
    } else {
      delete params.interactButton.dataset.targetKey;
    }
    params.interactButton.textContent = params.zone ? `${params.zone.actionLabel} (E)` : 'Interagir';
    params.interactButton.disabled =
      !params.isVillageMode || !params.zone || !params.interactionState || !params.interactionState.enabled;
  }

  if (params.cycleButton) {
    params.cycleButton.disabled = !params.isVillageMode || params.zoneCount < 2;
  }
}
