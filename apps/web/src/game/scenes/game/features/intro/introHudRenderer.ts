import type { HeroAppearanceKey, HeroProfileState, IntroNarrativeState } from '../../gameScene.stateTypes';

export function updateHeroProfileHud(params: {
  isAuthenticated: boolean;
  heroProfileBusy: boolean;
  heroProfileNameDraft: string;
  heroProfileAppearanceDraft: HeroAppearanceKey;
  heroProfile: HeroProfileState | null;
  heroProfileMessage: string | null;
  heroProfileError: string | null;
  heroProfileSummaryLabel: string;
  summaryValue: HTMLElement | null;
  nameInput: HTMLInputElement | null;
  appearanceSelect: HTMLSelectElement | null;
  saveButton: HTMLButtonElement | null;
  messageValue: HTMLElement | null;
  errorValue: HTMLElement | null;
}): void {
  const disabled = !params.isAuthenticated || params.heroProfileBusy;
  const trimmedDraftName = params.heroProfileNameDraft.trim();

  if (params.summaryValue) {
    params.summaryValue.textContent = params.heroProfileSummaryLabel;
  }

  if (params.nameInput) {
    if (params.nameInput.value !== params.heroProfileNameDraft) {
      params.nameInput.value = params.heroProfileNameDraft;
    }
    params.nameInput.disabled = disabled;
  }

  if (params.appearanceSelect) {
    if (params.appearanceSelect.value !== params.heroProfileAppearanceDraft) {
      params.appearanceSelect.value = params.heroProfileAppearanceDraft;
    }
    params.appearanceSelect.disabled = disabled;
  }

  if (params.saveButton) {
    params.saveButton.disabled = disabled || trimmedDraftName.length < 2;
    params.saveButton.textContent = params.heroProfileBusy
      ? 'Sauvegarde...'
      : params.heroProfile
        ? 'Mettre a jour profil'
        : 'Creer profil';
  }

  if (params.messageValue) {
    params.messageValue.hidden = !params.heroProfileMessage;
    params.messageValue.textContent = params.heroProfileMessage ?? '';
  }

  if (params.errorValue) {
    params.errorValue.hidden = !params.heroProfileError;
    params.errorValue.textContent = params.heroProfileError ?? '';
  }
}

export function updateIntroHud(params: {
  isAuthenticated: boolean;
  introNarrativeBusy: boolean;
  introNarrativeState: IntroNarrativeState | null;
  introNarrativeError: string | null;
  introSummaryLabel: string;
  introNarrativeLabel: string;
  introHintLabel: string;
  introProgressLabel: string;
  introAdvanceButtonLabel: string;
  summaryValue: HTMLElement | null;
  narrativeValue: HTMLElement | null;
  hintValue: HTMLElement | null;
  progressValue: HTMLElement | null;
  advanceButton: HTMLButtonElement | null;
  errorValue: HTMLElement | null;
}): void {
  const disabled =
    !params.isAuthenticated || params.introNarrativeBusy || Boolean(params.introNarrativeState?.completed);

  if (params.summaryValue) {
    params.summaryValue.textContent = params.introSummaryLabel;
  }

  if (params.narrativeValue) {
    params.narrativeValue.textContent = params.introNarrativeLabel;
  }

  if (params.hintValue) {
    params.hintValue.textContent = params.introHintLabel;
  }

  if (params.progressValue) {
    params.progressValue.textContent = params.introProgressLabel;
  }

  if (params.advanceButton) {
    params.advanceButton.disabled = disabled;
    params.advanceButton.textContent = params.introNarrativeBusy ? 'Avance...' : params.introAdvanceButtonLabel;
  }

  if (params.errorValue) {
    params.errorValue.hidden = !params.introNarrativeError;
    params.errorValue.textContent = params.introNarrativeError ?? '';
  }
}
