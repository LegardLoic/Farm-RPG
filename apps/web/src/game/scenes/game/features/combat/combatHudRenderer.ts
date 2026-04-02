import type {
  CombatEncounterState,
  CombatEffectChip,
  SpriteManifestPortraitState,
  SpriteManifestStripEntry,
  StripAnimationName,
} from '../../gameScene.stateTypes';

type CombatEnemyVisual = {
  key: string;
  name: string;
};

export function getCombatLogsFallback(params: {
  isAuthenticated: boolean;
  combatBusy: boolean;
  hasCombatState: boolean;
}): string {
  if (!params.isAuthenticated) {
    return 'Connecte toi pour lancer un combat.';
  }

  if (params.combatBusy) {
    return 'Chargement du combat...';
  }

  return params.hasCombatState ? 'Aucun log de combat pour le moment.' : 'Aucun combat actif.';
}

export function renderCombatLogs(params: {
  root: HTMLElement;
  combatLogs: string[];
  fallback: string;
}): void {
  params.root.replaceChildren();
  const entries = params.combatLogs.length > 0 ? params.combatLogs : [params.fallback];

  for (const entry of entries) {
    const item = document.createElement('li');
    item.textContent = entry;
    if (params.combatLogs.length === 0) {
      item.classList.add('combat-log-empty');
    }
    params.root.appendChild(item);
  }
}

export function renderCombatEffectChips(params: {
  element: HTMLElement;
  effects: CombatEffectChip[];
}): void {
  params.element.classList.add('combat-effects-value');
  params.element.replaceChildren();

  if (params.effects.length === 0) {
    const none = document.createElement('span');
    none.classList.add('combat-effect-chip', 'empty');
    none.textContent = 'None';
    params.element.appendChild(none);
    return;
  }

  for (const effect of params.effects) {
    const chip = document.createElement('span');
    chip.classList.add('combat-effect-chip');
    chip.dataset.effectTone = effect.tone;
    chip.textContent = effect.label;
    params.element.appendChild(chip);
  }
}

export function renderCombatEnemyIntentChip(params: {
  hudRoot: HTMLElement | null;
  selector: string;
  intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent';
  isPreview: boolean;
  combatState: CombatEncounterState | null;
  getCombatEnemyIntentUi: (input: {
    combatState: CombatEncounterState | null;
    intentKey: 'enemyTelegraphIntent' | 'enemyTelegraphNextIntent';
    isPreview: boolean;
  }) => {
    icon: string;
    iconLabel: string;
    label: string;
    tone: string;
    pulse: boolean;
  };
  getCombatIntentIconTooltip: (label: string) => string;
}): void {
  const element = params.hudRoot?.querySelector<HTMLElement>(params.selector);
  if (!element) {
    return;
  }

  const intentUi = params.getCombatEnemyIntentUi({
    combatState: params.combatState,
    intentKey: params.intentKey,
    isPreview: params.isPreview,
  });
  element.classList.add('combat-intent-chip');
  element.replaceChildren();
  if (intentUi.icon !== 'none') {
    const icon = document.createElement('span');
    icon.classList.add('combat-intent-icon');
    icon.dataset.intentIcon = intentUi.icon;
    icon.textContent = intentUi.iconLabel;
    const iconTooltip = params.getCombatIntentIconTooltip(intentUi.iconLabel);
    icon.title = iconTooltip;
    icon.setAttribute('aria-label', iconTooltip);
    element.appendChild(icon);
  }

  const text = document.createElement('span');
  text.classList.add('combat-intent-text');
  text.textContent = intentUi.label;
  element.appendChild(text);

  element.dataset.intentTone = intentUi.tone;
  element.dataset.intentPulse = intentUi.pulse ? '1' : '0';
  element.dataset.intentLayer = params.isPreview ? 'next' : 'current';
}

export function renderCombatEnemySprite(params: {
  stripElement: HTMLElement;
  image: HTMLImageElement;
  fallback: HTMLElement;
  enemy: CombatEnemyVisual | null;
  preferredAnimation: StripAnimationName;
  enemyStrip: SpriteManifestStripEntry | null;
  portraitPath: string | null;
  spritePath: string | null;
  stopEnemyHudStripPlayback: () => void;
  startEnemyHudStripPlayback: (
    element: HTMLElement,
    enemyKey: string,
    strip: SpriteManifestStripEntry,
    animation: StripAnimationName,
  ) => void;
  toPortraitStateKey: (animation: StripAnimationName) => SpriteManifestPortraitState;
}): void {
  const enemy = params.enemy;
  if (!enemy) {
    params.stopEnemyHudStripPlayback();
    params.stripElement.hidden = true;
    params.stripElement.style.removeProperty('background-image');
    params.image.hidden = true;
    params.image.removeAttribute('src');
    params.image.dataset.enemyKey = '';
    params.image.dataset.visualType = '';
    params.image.dataset.visualState = '';
    params.fallback.hidden = false;
    params.fallback.textContent = 'No enemy';
    return;
  }

  if (params.enemyStrip?.path) {
    params.startEnemyHudStripPlayback(params.stripElement, enemy.key, params.enemyStrip, params.preferredAnimation);
    params.stripElement.hidden = false;
    params.image.hidden = true;
    params.image.removeAttribute('src');
    params.image.dataset.enemyKey = '';
    params.image.dataset.visualType = '';
    params.image.dataset.visualState = '';
    params.fallback.hidden = true;
    params.fallback.textContent = '';
    return;
  }

  params.stopEnemyHudStripPlayback();
  params.stripElement.hidden = true;
  params.stripElement.style.removeProperty('background-image');

  const visualPath = params.portraitPath ?? params.spritePath;
  if (!visualPath) {
    params.image.hidden = true;
    params.image.removeAttribute('src');
    params.image.dataset.enemyKey = '';
    params.image.dataset.visualType = '';
    params.image.dataset.visualState = '';
    params.fallback.hidden = false;
    params.fallback.textContent = enemy.key;
    return;
  }

  const visualType = params.portraitPath ? 'portrait' : 'sprite';
  const visualState = visualType === 'portrait' ? params.toPortraitStateKey(params.preferredAnimation) : '';
  if (
    params.image.dataset.enemyKey !== enemy.key ||
    params.image.getAttribute('src') !== visualPath ||
    params.image.dataset.visualType !== visualType ||
    params.image.dataset.visualState !== visualState
  ) {
    params.image.src = visualPath;
    params.image.dataset.enemyKey = enemy.key;
    params.image.dataset.visualType = visualType;
    params.image.dataset.visualState = visualState;
  }
  params.image.alt = `${enemy.name} ${visualType}`;
  params.image.hidden = false;
  params.fallback.hidden = true;
  params.fallback.textContent = '';
}
