import type { CombatEncounterState } from '../../gameScene.stateTypes';

export type CombatIntentTone = 'neutral' | 'calm' | 'warning' | 'danger' | 'utility';
export type CombatIntentIcon = 'none' | 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';

export type CombatEnemyIntentUi = {
  label: string;
  tone: CombatIntentTone;
  pulse: boolean;
  icon: CombatIntentIcon;
  iconLabel: string;
};

export type CombatMappedIntentUi = {
  current: string;
  preview: string;
  tone: 'calm' | 'warning' | 'danger' | 'utility';
  pulse: boolean;
  icon: 'attack' | 'magic' | 'cleanse' | 'dispel' | 'ulti';
  iconLabel: string;
};

export function mapEnemyIntentUi(intent: string): CombatMappedIntentUi | null {
  switch (intent) {
    case 'basic_strike':
      return {
        current: 'ATK: STRIKE',
        preview: 'STRIKE',
        tone: 'calm',
        pulse: false,
        icon: 'attack',
        iconLabel: 'ATK',
      };
    case 'root_smash':
      return {
        current: 'SKILL: ROOT SMASH',
        preview: 'ROOT SMASH',
        tone: 'danger',
        pulse: true,
        icon: 'attack',
        iconLabel: 'ATK',
      };
    case 'opening_punish':
      return {
        current: 'SKILL: PUNISH',
        preview: 'PUNISH',
        tone: 'warning',
        pulse: false,
        icon: 'attack',
        iconLabel: 'ATK',
      };
    case 'cinder_burst':
      return {
        current: 'SKILL: CINDER BURST',
        preview: 'CINDER BURST',
        tone: 'danger',
        pulse: true,
        icon: 'magic',
        iconLabel: 'MAG',
      };
    case 'molten_shell':
      return {
        current: 'UTILITY: CLEANSE',
        preview: 'CLEANSE',
        tone: 'utility',
        pulse: false,
        icon: 'cleanse',
        iconLabel: 'CLN',
      };
    case 'twin_slash':
      return {
        current: 'SKILL: TWIN SLASH',
        preview: 'TWIN SLASH',
        tone: 'danger',
        pulse: true,
        icon: 'attack',
        iconLabel: 'ATK',
      };
    case 'iron_recenter':
      return {
        current: 'UTILITY: CLEANSE',
        preview: 'CLEANSE',
        tone: 'utility',
        pulse: false,
        icon: 'cleanse',
        iconLabel: 'CLN',
      };
    case 'cataclysm_ray':
      return {
        current: 'ULT: CATACLYSM RAY',
        preview: 'CATACLYSM RAY',
        tone: 'danger',
        pulse: true,
        icon: 'ulti',
        iconLabel: 'ULT',
      };
    case 'cursed_claw':
      return {
        current: 'ATK: CURSED CLAW',
        preview: 'CURSED CLAW',
        tone: 'warning',
        pulse: false,
        icon: 'attack',
        iconLabel: 'ATK',
      };
    case 'null_sigil':
      return {
        current: 'UTILITY: DISPEL',
        preview: 'DISPEL',
        tone: 'utility',
        pulse: false,
        icon: 'dispel',
        iconLabel: 'DSP',
      };
    default:
      return null;
  }
}

export function getCombatEnemyIntentUi(input: {
  combatState: CombatEncounterState | null;
  intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent';
  isPreview: boolean;
}): CombatEnemyIntentUi {
  if (!input.combatState || input.combatState.status !== 'active' || input.combatState.turn !== 'player') {
    return { label: '-', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' };
  }

  const intent = input.combatState.scriptState?.[input.intentKey];
  if (typeof intent !== 'string' || intent.length === 0) {
    return input.isPreview
      ? { label: 'NO PREVIEW', tone: 'neutral', pulse: false, icon: 'none', iconLabel: '-' }
      : { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
  }

  const mapped = mapEnemyIntentUi(intent);
  if (!mapped) {
    return { label: 'UNCLEAR', tone: 'warning', pulse: false, icon: 'none', iconLabel: '?' };
  }

  return {
    label: input.isPreview ? `NEXT: ${mapped.preview}` : mapped.current,
    tone: mapped.tone,
    pulse: input.isPreview ? false : mapped.pulse,
    icon: mapped.icon,
    iconLabel: mapped.iconLabel,
  };
}

export function getCombatIntentIconTooltip(iconLabel: string): string {
  switch (iconLabel) {
    case 'ATK':
      return 'ATK: attaque physique';
    case 'MAG':
      return 'MAG: attaque magique';
    case 'CLN':
      return 'CLN: retire un debuff ennemi';
    case 'DSP':
      return 'DSP: retire un buff joueur';
    case 'ULT':
      return 'ULT: attaque ultime';
    default:
      return iconLabel;
  }
}
